package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// initDB creates the users and sessions tables in PostgreSQL.
func initDB() error {
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		name TEXT NOT NULL,
		password TEXT NOT NULL,
		verification_status INTEGER DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`
	if _, err := db.Exec(usersTable); err != nil {
		return fmt.Errorf("error creating users table: %v", err)
	}

	sessionsTable := `
	CREATE TABLE IF NOT EXISTS sessions (
		session_id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL,
		expires_at TIMESTAMPTZ NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`
	if _, err := db.Exec(sessionsTable); err != nil {
		return fmt.Errorf("error creating sessions table: %v", err)
	}

	verificationCodesTable := `
	CREATE TABLE IF NOT EXISTS verification_codes (
		user_id INT PRIMARY KEY REFERENCES users(id),
		email TEXT NOT NULL,
		code TEXT NOT NULL,
		expires_at BIGINT NOT NULL
	);`

	if _, err := db.Exec(verificationCodesTable); err != nil {
		return fmt.Errorf("error creating verification codes table: %v", err)
	}

	return nil
}

// CreateUser inserts a new user with a hashed password and returns the new user's id.
var CreateUser = func(name, password, email string) (int, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return 0, err
	}

	stmt, err := db.Prepare("INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	var userID int
	err = stmt.QueryRow(name, email, string(hashedPassword)).Scan(&userID)
	return userID, err
}



// GetUserByEmail retrieves a user's id, hashed password, and name by email.
var GetUserByEmail = func(useremail string) (int, string, string, error) {
	var id int
	var storedHash string
	var name string
	err := db.QueryRow("SELECT id, password, name FROM users WHERE email = $1", useremail).Scan(&id, &storedHash, &name)
	return id, storedHash, name, err
}



var GetUserInfo = func(userId int) (int, string, string, string, int, error){
	var userID int
	var email string
	var storedHash string
	var name string
	var verificationStatus int
	err := db.QueryRow("SELECT id, password, name, email, verification_status FROM users WHERE id = $1", userId ).Scan(&userID, &storedHash, &name, &email, &verificationStatus)
	return userID, storedHash, name, email, verificationStatus, err
}


// generateSessionID creates a cryptographically secure random session token.
func generateSessionID() (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

// CreateSession inserts a new session record for the given user id.
var CreateSession = func(userID int) (string, error) {
	sessionID, err := generateSessionID()
	if err != nil {
		return "", err
	}
	expiresAt := time.Now().Add(24 * time.Hour)

	stmt, err := db.Prepare("INSERT INTO sessions(session_id, user_id, expires_at) VALUES($1, $2, $3)")
	if err != nil {
		return "", err
	}
	defer stmt.Close()

	_, err = stmt.Exec(sessionID, userID, expiresAt)
	return sessionID, err
}

// initListingsDB creates the listings and listing_images tables.
func initListingsDB() error {
	listingsTable := `
	CREATE TABLE IF NOT EXISTS listings (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL,
		product_name TEXT NOT NULL,
		product_description TEXT,
		price NUMERIC NOT NULL,
		category TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`
	if _, err := db.Exec(listingsTable); err != nil {
		return fmt.Errorf("error creating listings table: %v", err)
	}

	imagesTable := `
	CREATE TABLE IF NOT EXISTS listing_images (
		id SERIAL PRIMARY KEY,
		listing_id INTEGER NOT NULL,
		image_data BYTEA NOT NULL,
		content_type TEXT NOT NULL,
		FOREIGN KEY(listing_id) REFERENCES listings(id)
	);`
	if _, err := db.Exec(imagesTable); err != nil {
		return fmt.Errorf("error creating listing_images table: %v", err)
	}
	return nil
}


func ValidateSession(sessionID string) (bool, error) {
    var retrievedSessionID string
    currentTime := time.Now().Unix()

    // Query to check session validity
    err := db.QueryRow(
        `SELECT session_id FROM sessions 
        WHERE session_id = $1 
        AND expires_at > $2`,
        sessionID,
        currentTime,
    ).Scan(&retrievedSessionID)

    switch {
    case err == sql.ErrNoRows:
        return false, nil
    case err != nil:
        return false, fmt.Errorf("database error: %w", err)
    default:
        return true, nil
    }
}

var StoreVerificationCode = func(userID int, email, code string) error {
    expiry := time.Now().Add(3 * time.Minute)
    _, err := db.Exec(
        `INSERT INTO verification_codes (user_id, email, code, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET
            email = EXCLUDED.email,
            code = EXCLUDED.code,
            expires_at = EXCLUDED.expires_at`,
        userID, email, code, expiry.Unix(),
    )
    return err
}

var GetVerificationCode =  func(userID int) (string, time.Time, error) {
    var code string
    var expiresAt int64
    err := db.QueryRow(
        `SELECT code, expires_at FROM verification_codes 
        WHERE user_id = $1 AND expires_at > $2`,
        userID, 
        time.Now().Unix(),
    ).Scan(&code, &expiresAt)
    
    return code, time.Unix(expiresAt, 0), err
}

var  UpdateVerificationStatus =  func(userID int) error {
    _, err := db.Exec(
        "UPDATE users SET verification_status = 1 WHERE id = $1",
        userID,
    )
    return err
}

var  DeleteVerificationCode = func(userID int) error {
    _, err := db.Exec(
        "DELETE FROM verification_codes WHERE user_id = $1",
        userID,
    )
    return err
}

func DeleteExpiredVerificationCodes() error {
    _, err := db.Exec(
        `DELETE FROM verification_codes WHERE expires_at < $1`,
        time.Now().Unix(),
    )
    return err
}