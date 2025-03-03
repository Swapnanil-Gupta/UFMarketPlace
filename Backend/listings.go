package main

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// Listing represents a product listing.
type Listing struct {
	ID                 int                      `json:"id"`
	UserID             int                      `json:"userId"`
	ProductName        string                   `json:"productName"`
	ProductDescription string                   `json:"productDescription"`
	Price              float64                  `json:"price"`
	Category           string                   `json:"category"`
	CreatedAt          time.Time                `json:"createdAt"`
	UpdatedAt          time.Time                `json:"updatedAt"`
	Images             []map[string]interface{} `json:"images"`
}

// saveImage saves an uploaded image to disk.
func saveImage(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		if err = os.Mkdir(uploadDir, os.ModePerm); err != nil {
			return "", err
		}
	}

	fileName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), fileHeader.Filename)
	filePath := filepath.Join(uploadDir, fileName)
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}
	return filePath, nil
}

// listingsHandler handles GET (fetch all listings excluding the current user)
// and POST (create new listing with multipart form data) requests.
func listingsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Get userId from header
		currentUserIDStr := r.Header.Get("userId")
		if currentUserIDStr == "" {
			http.Error(w, "Missing userId header", http.StatusBadRequest)
			return
		}
		currentUserID, err := strconv.Atoi(currentUserIDStr)
		if err != nil {
			http.Error(w, "Invalid userId header", http.StatusBadRequest)
			return
		}

		rows, err := db.Query("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id <> $1", currentUserID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var listings []Listing
		for rows.Next() {
			var l Listing
			if err := rows.Scan(&l.ID, &l.UserID, &l.ProductName, &l.ProductDescription, &l.Price, &l.Category, &l.CreatedAt, &l.UpdatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// Fetch image data for listing.
			imageRows, err := db.Query("SELECT id, image_data, content_type FROM listing_images WHERE listing_id = $1", l.ID)
			if err == nil {
				var images []map[string]interface{}
				for imageRows.Next() {
					var imageID int
					var imageData []byte
					var contentType string
					if err := imageRows.Scan(&imageID, &imageData, &contentType); err == nil {
						encodedData := base64.StdEncoding.EncodeToString(imageData)
						images = append(images, map[string]interface{}{
							"id":          imageID,
							"contentType": contentType,
							"data":        encodedData,
						})
					}
				}
				l.Images = images
				imageRows.Close()
			}
			listings = append(listings, l)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(listings)

	case http.MethodPost:
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			http.Error(w, "Unable to parse form data", http.StatusBadRequest)
			return
		}

		// Get userId from header
		userIDStr := r.Header.Get("userId")
		if userIDStr == "" {
			http.Error(w, "Missing userId header", http.StatusBadRequest)
			return
		}
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid userId header", http.StatusBadRequest)
			return
		}

		productName := r.FormValue("productName")
		productDescription := r.FormValue("productDescription")
		priceStr := r.FormValue("price")
		price, err := strconv.ParseFloat(priceStr, 64)
		if err != nil {
			http.Error(w, "Invalid price", http.StatusBadRequest)
			return
		}
		category := r.FormValue("category")

		var listingID int
		err = db.QueryRow(
			"INSERT INTO listings(user_id, product_name, product_description, price, category, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
			userID, productName, productDescription, price, category, time.Now(), time.Now(),
		).Scan(&listingID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		files := r.MultipartForm.File["images"]
		for _, fileHeader := range files {
			imageData, contentType, err := readImageData(fileHeader)
			if err != nil {
				log.Printf("Error reading image: %v", err)
				continue
			}

			if len(imageData) > 5<<20 {
				log.Printf("Image too large: %s", fileHeader.Filename)
				continue
			}

			_, err = db.Exec(
				"INSERT INTO listing_images(listing_id, image_data, content_type) VALUES($1, $2, $3)",
				listingID, imageData, contentType,
			)
			if err != nil {
				log.Printf("Error saving image record: %v", err)
			}
		}

		// Fetch all listings for the user (with full image data)
		rows, err := db.Query("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id = $1", userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var listings []Listing
		for rows.Next() {
			var l Listing
			if err := rows.Scan(&l.ID, &l.UserID, &l.ProductName, &l.ProductDescription, &l.Price, &l.Category, &l.CreatedAt, &l.UpdatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// Fetch image data.
			imageRows, err := db.Query("SELECT id, image_data, content_type FROM listing_images WHERE listing_id = $1", l.ID)
			if err == nil {
				var images []map[string]interface{}
				for imageRows.Next() {
					var imageID int
					var imageData []byte
					var contentType string
					if err := imageRows.Scan(&imageID, &imageData, &contentType); err == nil {
						encodedData := base64.StdEncoding.EncodeToString(imageData)
						images = append(images, map[string]interface{}{
							"id":          imageID,
							"contentType": contentType,
							"data":        encodedData,
						})
					}
				}
				l.Images = images
				imageRows.Close()
			}
			listings = append(listings, l)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(listings)
	}
}

// userListingsHandler handles GET requests to fetch listings for the current user.
func userListingsHandler(w http.ResponseWriter, r *http.Request) {
	// Get userId from header
	userIDStr := r.Header.Get("userId")
	if userIDStr == "" {
		http.Error(w, "Missing userId header", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid userId header", http.StatusBadRequest)
		return
	}

	rows, err := db.Query("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var listings []Listing
	for rows.Next() {
		var l Listing
		if err := rows.Scan(&l.ID, &l.UserID, &l.ProductName, &l.ProductDescription, &l.Price, &l.Category, &l.CreatedAt, &l.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Fetch image data.
		imageRows, err := db.Query("SELECT id, image_data, content_type FROM listing_images WHERE listing_id = $1", l.ID)
		if err == nil {
			var images []map[string]interface{}
			for imageRows.Next() {
				var imageID int
				var imageData []byte
				var contentType string
				if err := imageRows.Scan(&imageID, &imageData, &contentType); err == nil {
					encodedData := base64.StdEncoding.EncodeToString(imageData)
					images = append(images, map[string]interface{}{
						"id":          imageID,
						"contentType": contentType,
						"data":        encodedData,
					})
				}
			}
			l.Images = images
			imageRows.Close()
		}
		listings = append(listings, l)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listings)
}

// editListingHandler handles PUT requests to edit a listing (only if owned by the current user).
// It now supports updating images by deleting all existing images for that listing
// and inserting the new ones from the request.
func editListingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form to handle potential image files.
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Unable to parse form data", http.StatusBadRequest)
		return
	}

	listingIDStr := r.FormValue("listingId")
	listingID, err := strconv.Atoi(listingIDStr)
	if err != nil {
		http.Error(w, "Invalid listingId", http.StatusBadRequest)
		return
	}
	// Get userId from header
	currentUserIDStr := r.Header.Get("userId")
	if currentUserIDStr == "" {
		http.Error(w, "Missing userId header", http.StatusBadRequest)
		return
	}
	currentUserID, err := strconv.Atoi(currentUserIDStr)
	if err != nil {
		http.Error(w, "Invalid userId header", http.StatusBadRequest)
		return
	}

	var ownerID int
	err = db.QueryRow("SELECT user_id FROM listings WHERE id = $1", listingID).Scan(&ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Listing not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if ownerID != currentUserID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Update listing text fields.
	productName := r.FormValue("productName")
	productDescription := r.FormValue("productDescription")
	priceStr := r.FormValue("price")
	var price float64
	if priceStr != "" {
		price, err = strconv.ParseFloat(priceStr, 64)
		if err != nil {
			http.Error(w, "Invalid price", http.StatusBadRequest)
			return
		}
	}
	category := r.FormValue("category")

	updateQuery := "UPDATE listings SET "
	params := []interface{}{}
	paramIndex := 1
	updates := []string{}
	if productName != "" {
		updates = append(updates, fmt.Sprintf("product_name = $%d", paramIndex))
		params = append(params, productName)
		paramIndex++
	}
	if productDescription != "" {
		updates = append(updates, fmt.Sprintf("product_description = $%d", paramIndex))
		params = append(params, productDescription)
		paramIndex++
	}
	if priceStr != "" {
		updates = append(updates, fmt.Sprintf("price = $%d", paramIndex))
		params = append(params, price)
		paramIndex++
	}
	if category != "" {
		updates = append(updates, fmt.Sprintf("category = $%d", paramIndex))
		params = append(params, category)
		paramIndex++
	}
	updates = append(updates, fmt.Sprintf("updated_at = $%d", paramIndex))
	params = append(params, time.Now())
	paramIndex++

	// Only run the update query if there are fields to update.
	if len(updates) > 0 {
		updateQuery += strings.Join(updates, ", ")
		updateQuery += fmt.Sprintf(" WHERE id = $%d AND user_id = $%d", paramIndex, paramIndex+1)
		params = append(params, listingID, currentUserID)

		_, err = db.Exec(updateQuery, params...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// If new images are provided, delete all existing images and add the new ones.
	files := r.MultipartForm.File["images"]
	if len(files) > 0 {
		_, err := db.Exec("DELETE FROM listing_images WHERE listing_id = $1", listingID)
		if err != nil {
			http.Error(w, "Error deleting existing images: "+err.Error(), http.StatusInternalServerError)
			return
		}
		for _, fileHeader := range files {
			imageData, contentType, err := readImageData(fileHeader)
			if err != nil {
				log.Printf("Error reading image: %v", err)
				continue
			}
			if len(imageData) > 5<<20 {
				log.Printf("Image too large: %s", fileHeader.Filename)
				continue
			}
			_, err = db.Exec("INSERT INTO listing_images(listing_id, image_data, content_type) VALUES($1, $2, $3)", listingID, imageData, contentType)
			if err != nil {
				log.Printf("Error inserting new image: %v", err)
				continue
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Listing updated successfully"})
}

// deleteListingHandler handles DELETE requests to remove a listing (and all its images).
func deleteListingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	listingIDStr := r.URL.Query().Get("listingId")
	listingID, err := strconv.Atoi(listingIDStr)
	if err != nil {
		http.Error(w, "Invalid listingId", http.StatusBadRequest)
		return
	}
	// Get userId from header
	currentUserIDStr := r.Header.Get("userId")
	if currentUserIDStr == "" {
		http.Error(w, "Missing userId header", http.StatusBadRequest)
		return
	}
	currentUserID, err := strconv.Atoi(currentUserIDStr)
	if err != nil {
		http.Error(w, "Invalid userId header", http.StatusBadRequest)
		return
	}

	var ownerID int
	err = db.QueryRow("SELECT user_id FROM listings WHERE id = $1", listingID).Scan(&ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Listing not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if ownerID != currentUserID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	_, err = db.Exec("DELETE FROM listing_images WHERE listing_id = $1", listingID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("DELETE FROM listings WHERE id = $1 AND user_id = $2", listingID, currentUserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Listing deleted successfully"})
}

// readImageData reads the uploaded image into a byte slice.
func readImageData(fileHeader *multipart.FileHeader) ([]byte, string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, "", err
	}
	defer file.Close()

	imageData, err := io.ReadAll(file)
	if err != nil {
		return nil, "", err
	}

	contentType := http.DetectContentType(imageData)
	return imageData, contentType, nil
}
