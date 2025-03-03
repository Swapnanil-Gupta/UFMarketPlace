package main

import (
	"database/sql"
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
	ID                 int       `json:"id"`
	UserID             int       `json:"userId"`
	ProductName        string    `json:"productName"`
	ProductDescription string    `json:"productDescription"`
	Price              float64   `json:"price"`
	Category           string    `json:"category"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
	Images             []map[string]interface{}  `json:"images,omitempty"`
}

// saveImage saves an uploaded image and returns its file path.
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
// and POST (create new listing with multipart form data).
func listingsHandler(w http.ResponseWriter, r *http.Request) {
	// For demonstration, assume current user id is passed as query parameter "currentUser".
	currentUserStr := r.URL.Query().Get("currentUser")
	currentUser, _ := strconv.Atoi(currentUserStr)

	switch r.Method {
	case http.MethodGet:
		// Fetch all listings not created by current user.
		rows, err := db.Query("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id <> $1", currentUser)
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
			// Fetch associated images.
			imageRows, err := db.Query("SELECT image_url FROM listing_images WHERE listing_id = $1", l.ID)
			if err == nil {
				var images []string
				for imageRows.Next() {
					var imageURL string
					if err := imageRows.Scan(&imageURL); err == nil {
						images = append(images, imageURL)
					}
				}
				var imageMaps []map[string]interface{}
				for _, imageURL := range images {
					imageMaps = append(imageMaps, map[string]interface{}{
						"url": imageURL,
					})
				}
				l.Images = imageMaps
				imageRows.Close()
			}
			listings = append(listings, l)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(listings)

	case http.MethodPost:
		// Create a new listing from multipart form data.
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			http.Error(w, "Unable to parse form data", http.StatusBadRequest)
			return
		}

		userIDStr := r.FormValue("userId")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid userId", http.StatusBadRequest)
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

		// Handle image uploads.
		files := r.MultipartForm.File["images"]
		for _, fileHeader := range files {
			imageData, contentType, err := readImageData(fileHeader)
			if err != nil {
				log.Printf("Error reading image: %v", err)
				continue
			}

			// Validate image size (example: max 5MB)
			if len(imageData) > 5<<20 {
				log.Printf("Image too large: %s", fileHeader.Filename)
				continue
			}

			_, err = db.Exec(
				"INSERT INTO listing_images(listing_id, image_data, content_type) VALUES($1, $2, $3)",
				listingID,
				imageData,
				contentType,
			)
			if err != nil {
				log.Printf("Error saving image record: %v", err)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":   "Listing created successfully",
			"listingId": listingID,
		})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// userListingsHandler handles GET requests to fetch listings for the current user.
func userListingsHandler(w http.ResponseWriter, r *http.Request) {
	currentUserStr := r.URL.Query().Get("currentUser")
	currentUser, err := strconv.Atoi(currentUserStr)
	if err != nil || currentUser == 0 {
		http.Error(w, "Invalid currentUser parameter", http.StatusBadRequest)
		return
	}

	rows, err := db.Query("SELECT id, user_id, product_name, product_description, price, category, created_at, updated_at FROM listings WHERE user_id = $1", currentUser)
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
		imageRows, err := db.Query(
			"SELECT id, content_type FROM listing_images WHERE listing_id = $1", 
			l.ID,
		)
		if err == nil {
			var images []map[string]interface{}
			for imageRows.Next() {
				var imageID int
				var contentType string
				if err := imageRows.Scan(&imageID, &contentType); err == nil {
					images = append(images, map[string]interface{}{
						"id":          imageID,
						"contentType": contentType,
						"url":         fmt.Sprintf("/image?id=%d", imageID),
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
func editListingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Expect form values for listingId and userId.
	listingIDStr := r.FormValue("listingId")
	listingID, err := strconv.Atoi(listingIDStr)
	if err != nil {
		http.Error(w, "Invalid listingId", http.StatusBadRequest)
		return
	}
	currentUserStr := r.FormValue("userId")
	currentUser, err := strconv.Atoi(currentUserStr)
	if err != nil {
		http.Error(w, "Invalid userId", http.StatusBadRequest)
		return
	}

	// Verify that the listing belongs to the current user.
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
	if ownerID != currentUser {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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

	// Dynamically build the UPDATEI do n statement.
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
	if len(updates) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}
	updates = append(updates, fmt.Sprintf("updated_at = $%d", paramIndex))
	params = append(params, time.Now())
	paramIndex++

	updateQuery += strings.Join(updates, ", ")
	updateQuery += fmt.Sprintf(" WHERE id = $%d AND user_id = $%d", paramIndex, paramIndex+1)
	params = append(params, listingID, currentUser)

	_, err = db.Exec(updateQuery, params...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Listing updated successfully"})
}

// deleteListingHandler handles DELETE requests to remove a listing (only if owned by the current user).
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
	currentUserStr := r.URL.Query().Get("userId")
	currentUser, err := strconv.Atoi(currentUserStr)
	if err != nil {
		http.Error(w, "Invalid userId", http.StatusBadRequest)
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
	if ownerID != currentUser {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// First, delete any associated images.
	_, err = db.Exec("DELETE FROM listing_images WHERE listing_id = $1", listingID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Then delete the listing.
	_, err = db.Exec("DELETE FROM listings WHERE id = $1 AND user_id = $2", listingID, currentUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Listing deleted successfully"})
}

// readImageData reads the uploaded image into a byte slice
func readImageData(fileHeader *multipart.FileHeader) ([]byte, string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, "", err
	}
	defer file.Close()

	// Read entire file into byte slice
	imageData, err := io.ReadAll(file)
	if err != nil {
		return nil, "", err
	}

	// Detect content type
	contentType := http.DetectContentType(imageData)
	return imageData, contentType, nil
}

func imageHandler(w http.ResponseWriter, r *http.Request) {
	imageIDStr := r.URL.Query().Get("id")
	imageID, err := strconv.Atoi(imageIDStr)
	if err != nil {
		http.Error(w, "Invalid image ID", http.StatusBadRequest)
		return
	}

	var imageData []byte
	var contentType string
	err = db.QueryRow(
		"SELECT image_data, content_type FROM listing_images WHERE id = $1",
		imageID,
	).Scan(&imageData, &contentType)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", contentType)
	w.Write(imageData)
}