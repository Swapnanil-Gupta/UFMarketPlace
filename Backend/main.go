package main

import (
	"UFMarketPlace/utils"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/rs/cors"
)

var db *sql.DB


type Config struct {
    SMTP struct {
        Host     string `json:"host"`
        Port     int    `json:"port"`
        Username string `json:"username"`
        Password string `json:"password"`
		Sender  string `json:"sender"`
    } `json:"smtp"`
}

var appConfig Config



func main() {
	var err error
	loadConfig("./config.json")

	utils.InitEmailConfig(utils.EmailConfig{
		Host:     appConfig.SMTP.Host,
		Port:     appConfig.SMTP.Port,
		Username: appConfig.SMTP.Username,
		Password: appConfig.SMTP.Password,
		Sender:   appConfig.SMTP.Sender,
	})
	// Set up CORS middleware.
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

	// Initialize database tables.
	if err := initDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize the listings and images tables.
	if err := initListingsDB(); err != nil {
		log.Fatalf("Failed to initialize listings database: %v", err)
	}

	// Set up HTTP routes.
	router := http.NewServeMux()
	router.HandleFunc("/signup", signupHandler)
	router.HandleFunc("/login", loginHandler)
	router.HandleFunc("/listings", listingsHandler)              // GET (all listings except current user) & POST (create new listing)
	router.HandleFunc("/listings/user", userListingsHandler)       // GET (listings for current user)
	router.HandleFunc("/listing/updateListing", editListingHandler)   // PUT (edit listing)
	router.HandleFunc("/listing/deleteListing", deleteListingHandler) // DELETE (delete listing)
	router.HandleFunc("/sendEmailVerificationCode", sendVerificationCodeHandler)
	router.HandleFunc("/verifyEmailVerificationCode", verifyCodeHandler)
	// router.HandleFunc("/image", imageHandler)                  // GET (serve image)

	handler := c.Handler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}



func loadConfig(path string) {
	file, err := os.Open(path)
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}
	defer file.Close()

	if err := json.NewDecoder(file).Decode(&appConfig); err != nil {
		log.Fatalf("Invalid config: %v", err)
	}
}