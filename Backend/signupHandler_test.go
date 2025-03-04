package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSignupHandler_Success(t *testing.T) {
	// Mock dependencies
	originalEmailExists := EmailExists
	defer func() { EmailExists = originalEmailExists }()
	EmailExists = func(email string) (bool, error) { return false, nil }

	originalCreateUser := CreateUser
	defer func() { CreateUser = originalCreateUser }()
	CreateUser = func(name, password, email string) (int, error) { return 123, nil }

	// Test request
	creds := SignUpCredentials{Email: "test@uf.edu", Name: "Gator", Password: "password"}
	body, _ := json.Marshal(creds)
	req := httptest.NewRequest("POST", "/signup", bytes.NewReader(body))
	w := httptest.NewRecorder()

	signupHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "User registered successfully", response["message"])
	assert.Equal(t, float64(123), response["userId"]) // JSON numbers are float64
}

func TestSignupHandler_DuplicateEmail(t *testing.T) {
	originalEmailExists := EmailExists
	defer func() { EmailExists = originalEmailExists }()
	EmailExists = func(email string) (bool, error) { return true, nil }

	creds := SignUpCredentials{Email: "existing@uf.edu", Name: "Gator", Password: "password"}
	body, _ := json.Marshal(creds)
	req := httptest.NewRequest("POST", "/signup", bytes.NewReader(body))
	w := httptest.NewRecorder()

	signupHandler(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "Email already registered")
}