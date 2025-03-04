package main

import (
	"UFMarketPlace/utils"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSendVerificationCodeHandler_Success(t *testing.T) {
	// Mock user lookup and verification status
	GetUserByEmail = func(email string) (int, string, string, error) { return 123, "", "", nil }
	GetUserInfo = func(userId int) (int, string, string, string, int, error) {
		return userId, "", "", "", 0, nil // Unverified
	}
	StoreVerificationCode = func(userId int, email, code string) error { return nil }
	utils.SendVerificationCode = func(email, code string) error { return nil }

	reqBody := VerificationRequest{Email: "gator@uf.edu"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/send-code", bytes.NewReader(body))
	w := httptest.NewRecorder()

	sendVerificationCodeHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Verification code sent successfully")
}

func TestVerifyCodeHandler_ValidCode(t *testing.T) {
	// Mock verification code check
	GetVerificationCode = func(userId int) (string, time.Time, error) {
		return "123456", time.Now().Add(5 * time.Minute), nil
	}
	UpdateVerificationStatus = func(userId int) error { return nil }
	DeleteVerificationCode = func(userId int) error { return nil }

	reqBody := VerifyCodeRequest{Email: "gator@uf.edu", Code: "123456"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/verify", bytes.NewReader(body))
	w := httptest.NewRecorder()

	verifyCodeHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "successfully verified")
}

func TestVerifyCodeHandler_ExpiredCode(t *testing.T) {
	GetVerificationCode = func(userId int) (string, time.Time, error) {
		return "123456", time.Now().Add(-5 * time.Minute), nil // Expired
	}

	reqBody := VerifyCodeRequest{Email: "gator@uf.edu", Code: "123456"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/verify", bytes.NewReader(body))
	w := httptest.NewRecorder()

	verifyCodeHandler(w, req)

	assert.Equal(t, http.StatusGone, w.Code)
	assert.Contains(t, w.Body.String(), "Verification code has expired")
}