package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestLoginHandler_Success(t *testing.T) {
	// Mock password hash
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)

	// Mock database responses
	originalGetUserByEmail := GetUserByEmail // Save the original function
	GetUserByEmail = func(email string) (int, string, string, error) {
		return 123, string(hashedPassword), "Gator", nil
	}
	defer func() { GetUserByEmail = originalGetUserByEmail }() // Restore the original function

	originalGetUserInfo := GetUserInfo // Save the original function
	GetUserInfo = func(userId int) (int, string, string, string, int, error) {
		return userId, "", "", "", 1, nil // Verified
	}
	defer func() { GetUserInfo = originalGetUserInfo }() // Restore the original function

	originalCreateSession := CreateSession // Save the original function
	CreateSession = func(userId int) (string, error) { return "session-123", nil }
	defer func() { CreateSession = originalCreateSession }() // Restore the original function
	
	// Test request
	creds := LogInCredentials{Email: "gator@uf.edu", Password: "password"}
	body, _ := json.Marshal(creds)
	req := httptest.NewRequest("POST", "/login", bytes.NewReader(body))
	w := httptest.NewRecorder()

	loginHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	response := map[string]interface{}{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "session-123", response["sessionId"])
	assert.Equal(t, "gator@uf.edu", response["email"])
}

func TestLoginHandler_UnverifiedEmail(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)

	GetUserByEmail = func(email string) (int, string, string, error) {
		return 123, string(hashedPassword), "Gator", nil
	}
	GetUserInfo = func(userId int) (int, string, string, string, int, error) {
		return userId, "", "", "", 0, nil // Unverified
	}

	creds := LogInCredentials{Email: "gator@uf.edu", Password: "password"}
	body, _ := json.Marshal(creds)
	req := httptest.NewRequest("POST", "/login", bytes.NewReader(body))
	w := httptest.NewRecorder()

	loginHandler(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "Email is not verified")
}