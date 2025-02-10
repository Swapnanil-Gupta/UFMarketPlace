package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)
var db *sql.DB

func main() {
	var err error

	c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:*"}, // Frontend URL
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"*"},
        AllowCredentials: true,
        Debug:            false, // Set to true for debugging
    })
	// Initialize database
	db, err = sql.Open("sqlite3", "./app.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	if err := initDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := http.NewServeMux()
    router.HandleFunc("/signup", signupHandler)
    router.HandleFunc("/login", loginHandler)
	handler := c.Handler(router)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":8080", handler))
}