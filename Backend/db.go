package main

import (
	"crypto/rand"
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
	return nil
}

// CreateUser inserts a new user with a hashed password and returns the new user's id.
func CreateUser(name, password, email string) (int, error) {
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
func GetUserByEmail(useremail string) (int, string, string, error) {
	var id int
	var storedHash string
	var name string
	err := db.QueryRow("SELECT id, password, name FROM users WHERE email = $1", useremail).Scan(&id, &storedHash, &name)
	return id, storedHash, name, err
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
func CreateSession(userID int) (string, error) {
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
