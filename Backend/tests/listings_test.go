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

func TestListingsHandler(t *testing.T) {
	// Test GET request
	t.Run("GET - Fetch Listings Excluding User", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("Failed to create mock DB: %v", err)
		}
		defer db.Close()

		originalDB := api.DB
		api.DB = db
		defer func() { api.DB = originalDB }()

		rows := sqlmock.NewRows([]string{"id", "user_id", "name", "email", "product_name", "product_description", "price", "category", "created_at", "updated_at"}).
			AddRow(1, 2, "User2", "user2@example.com", "Product1", "Desc1", 10.0, "Cat1", time.Now(), time.Now())
		mock.ExpectQuery("SELECT l.id, l.user_id, u.name, u.email, l.product_name, l.product_description, l.price, l.category, l.created_at, l.updated_at FROM listings l JOIN users u ON u.id = l.user_id WHERE l.user_id <> \\$1").
			WithArgs(1).
			WillReturnRows(rows)
		imageRows := sqlmock.NewRows([]string{"id", "image_data", "content_type"}).
			AddRow(1, []byte("image"), "image/png")
		mock.ExpectQuery("SELECT id, image_data, content_type FROM listing_images WHERE listing_id = \\$1").
			WithArgs(1).
			WillReturnRows(imageRows)

		req := httptest.NewRequest(http.MethodGet, "/listings", nil)
		req.Header.Set("userId", "1")
		w := httptest.NewRecorder()

		api.ListingsHandler(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var listings []api.Listing
		err = json.Unmarshal(w.Body.Bytes(), &listings)
		assert.NoError(t, err)
		assert.Len(t, listings, 1)
		assert.Equal(t, 2, listings[0].UserID)
		assert.Len(t, listings[0].Images, 1)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	
	t.Run("GET - Missing User ID", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("Failed to create mock DB: %v", err)
		}
		defer db.Close()

		originalDB := api.DB
		api.DB = db
		defer func() { api.DB = originalDB }()

		req := httptest.NewRequest(http.MethodGet, "/listings", nil)
		w := httptest.NewRecorder()

		api.ListingsHandler(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Equal(t, "Missing userId header\n", w.Body.String())
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}