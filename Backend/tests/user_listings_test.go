package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"UFMarketPlace/api"
)

func TestUserListingsHandler(t *testing.T) {
	tests := []struct {
		name           string
		userID         string
		mockSetup      func(sqlmock.Sqlmock)
		expectedStatus int
		expectedLen    int
	}{
		{
			name:   "Fetch User Listings",
			userID: "1",
			mockSetup: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{"id", "user_id", "product_name", "product_description", "price", "category", "created_at", "updated_at"}).
					AddRow(1, 1, "Product1", "Desc1", 10.0, "Cat1", time.Now(), time.Now())
				mock.ExpectQuery("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id = \\$1").
					WithArgs(1).
					WillReturnRows(rows)
				imageRows := sqlmock.NewRows([]string{"id", "image_data", "content_type"}).
					AddRow(1, []byte("image"), "image/png")
				mock.ExpectQuery("SELECT id, image_data, content_type FROM listing_images WHERE listing_id = \\$1").
					WithArgs(1).
					WillReturnRows(imageRows)
			},
			expectedStatus: http.StatusOK,
			expectedLen:    1,
		},
		{
			name:   "No Listings",
			userID: "1",
			mockSetup: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id = \\$1").
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "product_name", "product_description", "price", "category", "created_at", "updated_at"}))
			},
			expectedStatus: http.StatusOK,
			expectedLen:    0,
		},
		{
			name:           "Invalid User ID",
			userID:         "invalid",
			mockSetup:      func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusBadRequest,
			expectedLen:    0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			if err != nil {
				t.Fatalf("Failed to create mock DB: %v", err)
			}
			defer db.Close()

			originalDB := api.DB
			api.DB = db
			defer func() { api.DB = originalDB }()

			tt.mockSetup(mock)

			req := httptest.NewRequest(http.MethodGet, "/listings/user", nil)
			req.Header.Set("userId", tt.userID)
			w := httptest.NewRecorder()

			api.UserListingsHandler(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.expectedStatus == http.StatusOK {
				var listings []api.Listing
				err = json.Unmarshal(w.Body.Bytes(), &listings)
				assert.NoError(t, err)
				assert.Len(t, listings, tt.expectedLen)
				if tt.expectedLen > 0 {
					assert.Equal(t, "Product1", listings[0].ProductName)
					assert.Len(t, listings[0].Images, 1)
				}
			}
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}