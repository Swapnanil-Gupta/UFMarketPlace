package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// Initialize database tables (users and sessions)
func initDB() error {
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT  NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`
	if _, err := db.Exec(usersTable); err != nil {
		return fmt.Errorf("error creating users table: %v", err)
	}

	sessionsTable := `
	CREATE TABLE IF NOT EXISTS sessions (
		session_id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL,
		expires_at INTEGER NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`
	if _, err := db.Exec(sessionsTable); err != nil {
		return fmt.Errorf("error creating sessions table: %v", err)
	}
	return nil
}

// Create a new user with hashed password
func CreateUser(name, password, email string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	stmt, err := db.Prepare("INSERT INTO users(name, email, password) VALUES(?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(name, email, string(hashedPassword))
	return err
}

// Retrieve user credentials by username
func GetUser(useremail string) (int, string, string, error) {
	var userID int
	var storedHash string
	var name string
	err := db.QueryRow("SELECT id, password, name FROM users WHERE email = ?", useremail).Scan(&userID, &storedHash, &name)
	return userID, storedHash, name, err
}

// Generate a secure random session ID
func generateSessionID() (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

// Create a new session for the user
func CreateSession(userID int) (string, error) {
	sessionID, err := generateSessionID()
	if err != nil {
		return "", err
	}
	expiresAt := time.Now().Add(24 * time.Hour).Unix()

	stmt, err := db.Prepare("INSERT INTO sessions(session_id, user_id, expires_at) VALUES(?, ?, ?)")
	if err != nil {
		return "", err
	}
	defer stmt.Close()

	_, err = stmt.Exec(sessionID, userID, expiresAt)
	return sessionID, err
}