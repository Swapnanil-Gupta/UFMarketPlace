package tests

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"UFMarketPlace/api"
)

func TestEditListingHandler(t *testing.T) {
	tests := []struct {
		name           string
		userID         string
		formData       map[string]string
		files          map[string][]byte
		mockSetup      func(sqlmock.Sqlmock)
		expectedStatus int
		expectedBody   string
	}{
		{
			name:   "Unauthorized",
			userID: "2",
			formData: map[string]string{
				"listingId": "1",
			},
			files: nil,
			mockSetup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT user_id FROM listings WHERE id = \\$1").
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(1))
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "Unauthorized",
		},
		{
			name:   "Successful Update",
			userID: "1",
			formData: map[string]string{
				"listingId":          "1",
				"productName":        "Updated Product",
				"productDescription": "Updated Description",
			},
			files: nil,
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock the SELECT query to verify the user owns the listing
				mock.ExpectQuery("SELECT user_id FROM listings WHERE id = \\$1").
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"user_id"}).AddRow(1))
				// Mock the UPDATE query to update the listing fields
				mock.ExpectExec("UPDATE listings SET product_name = \\$1, product_description = \\$2, updated_at = \\$3 WHERE id = \\$4 AND user_id = \\$5").
					WithArgs("Updated Product", "Updated Description", sqlmock.AnyArg(), 1, 1).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `{"message":"Listing updated successfully"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set up the mock database
			db, mock, err := sqlmock.New()
			if err != nil {
				t.Fatalf("Failed to create mock DB: %v", err)
			}
			defer db.Close()

			// Replace the global DB with the mock DB
			originalDB := api.DB
			api.DB = db
			defer func() { api.DB = originalDB }()

			// Set up mock expectations
			tt.mockSetup(mock)

			// Create the multipart form request
			var b bytes.Buffer
			wr := multipart.NewWriter(&b)
			for k, v := range tt.formData {
				wr.WriteField(k, v)
			}
			for filename, data := range tt.files {
				fw, _ := wr.CreateFormFile("images", filename)
				fw.Write(data)
			}
			wr.Close()

			// Create the HTTP request
			req := httptest.NewRequest(http.MethodPut, "/listing/updateListing", &b)
			req.Header.Set("Content-Type", wr.FormDataContentType())
			req.Header.Set("userId", tt.userID)
			w := httptest.NewRecorder()

			// Call the handler
			api.EditListingHandler(w, req)

			// Assert the response, trimming trailing whitespace from the actual body
			assert.Equal(t, tt.expectedStatus, w.Code)
			actualBody := strings.TrimSpace(w.Body.String()) // Remove trailing newline or spaces
			assert.Equal(t, tt.expectedBody, actualBody)
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}