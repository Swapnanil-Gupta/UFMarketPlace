package tests

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"UFMarketPlace/api"
)

func TestDeleteListingHandler(t *testing.T) {
	// Setup for each test case
	tests := []struct {
		name           string
		listingID      string
		userID         string
		mockSetup      func(sqlmock.Sqlmock)
		expectedStatus int
		expectedBody   string
	}{
		{
			name:      "Successful Deletion",
			listingID: "1",
			userID:    "1",
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock SELECT to verify listing ownership
				mock.ExpectQuery("SELECT user_id FROM listings WHERE id = \\$1").
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(1))
				// Mock DELETE for listing images
				mock.ExpectExec("DELETE FROM listing_images WHERE listing_id = \\$1").
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(0, 1))
				// Mock DELETE for the listing itself
				mock.ExpectExec("DELETE FROM listings WHERE id = \\$1 AND user_id = \\$2").
					WithArgs(1, 1).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `{"message":"Listing deleted successfully"}`,
		},
		{
			name:      "Unauthorized User",
			listingID: "1",
			userID:    "2",
			mockSetup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT user_id FROM listings WHERE id = \\$1").
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(1))
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "Unauthorized",
		},
		{
			name:      "Listing Not Found",
			listingID: "1",
			userID:    "1",
			mockSetup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT user_id FROM listings WHERE id = \\$1").
					WithArgs(1).
					WillReturnError(sql.ErrNoRows)
			},
			expectedStatus: http.StatusNotFound,
			expectedBody:   "Listing not found",
		},
		{
			name:           "Invalid Listing ID",
			listingID:      "invalid",
			userID:         "1",
			mockSetup:      func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Invalid listingId",
		},
		{
			name:           "Missing User ID",
			listingID:      "1",
			userID:         "",
			mockSetup:      func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Missing userId header",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Initialize mock database
			db, mock, err := sqlmock.New()
			if err != nil {
				t.Fatalf("Failed to create mock DB: %v", err)
			}
			defer db.Close()

			// Set global DB to mock
			originalDB := api.DB
			api.DB = db
			defer func() { api.DB = originalDB }()

			// Setup mock expectations
			tt.mockSetup(mock)

			// Create request
			req := httptest.NewRequest(http.MethodDelete, "/listing/deleteListing?listingId="+tt.listingID, nil)
			if tt.userID != "" {
				req.Header.Set("userId", tt.userID)
			}
			w := httptest.NewRecorder()

			// Call handler
			api.DeleteListingHandler(w, req)

			// Assert response, trimming trailing whitespace from the actual body
			assert.Equal(t, tt.expectedStatus, w.Code)
			actualBody := strings.TrimSpace(w.Body.String()) // Remove trailing newline or spaces
			assert.Equal(t, tt.expectedBody, actualBody)
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}