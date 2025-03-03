package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/rs/cors"
)

var db *sql.DB

func main() {
	var err error

	// Set up CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*"}, // For Frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            false,
	})

	// Use an environment variable for connection string or default value.
	connStr := os.Getenv("POSTGRES_CONN")
	if connStr == "" {
		connStr = "postgres://ufmarketplace:8658@localhost:5432/ufmarketplace?sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Initialize database tables
	if err := initDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Set up HTTP handlers
	router := http.NewServeMux()
	router.HandleFunc("/signup", signupHandler)
	router.HandleFunc("/login", loginHandler)

	handler := c.Handler(router)

	// Determine port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
