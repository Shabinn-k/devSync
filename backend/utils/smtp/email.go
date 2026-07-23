package smtp

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"devSync/config"
)

func SendOTPEmail(cfg *config.AppConfig, toEmail, otp, purpose string) error {
	cleanTo := strings.ReplaceAll(toEmail, "\r", "")
	cleanTo = strings.ReplaceAll(cleanTo, "\n", "")

	subject := "DevSync Verification Code"
	body := fmt.Sprintf("Your DevSync OTP for %s is: %s\nThis code expires in 10 minutes.", purpose, otp)

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		cfg.SMTPFrom, cleanTo, subject, body))

	auth := smtp.PlainAuth("", cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	err := smtp.SendMail(addr, auth, cfg.SMTPUsername, []string{cleanTo}, msg)
	if err != nil {
		log.Printf("smtp: failed to send email to %s: %v", cleanTo, err)
		return err
	}
	return nil
}