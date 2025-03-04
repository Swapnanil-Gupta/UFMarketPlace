package utils

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	Sender   string
}

var emailConfig EmailConfig


func InitEmailConfig(cfg EmailConfig) {
	emailConfig = cfg
}

// sendEmail sends an email with the given subject and body to the specified recipient.
func sendEmail(to, subject, body string) error {
	// SMTP server configuration (For SendGrid)


	// Create a new message
	m := gomail.NewMessage()
	m.SetHeader("From", emailConfig.Sender) // Replace with a verified sender email
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	// Set up the dialer (SMTP client)
	d := gomail.NewDialer(emailConfig.Host, emailConfig.Port, emailConfig.Username, emailConfig.Password)

	// Send the email
	return d.DialAndSend(m)
}

// sendVerificationCode sends the verification code to the recipient via email.
// Returns an error if sending fails, or nil if successful.
var SendVerificationCode = func(to, code string) error {
	body := fmt.Sprintf("Your verification code is: %s", code)
	err := sendEmail(to, "UFMarketPlace Verification Code", body)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	return nil
}
