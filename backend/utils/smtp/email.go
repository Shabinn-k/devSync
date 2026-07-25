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
	cleanTo = strings.TrimSpace(cleanTo)

	host := strings.TrimSpace(cfg.SMTPHost)
	port := strings.TrimSpace(cfg.SMTPPort)
	username := strings.TrimSpace(cfg.SMTPUsername)
	password := strings.TrimSpace(cfg.SMTPPassword)
	from := strings.TrimSpace(cfg.SMTPFrom)

	subject := "DevSync Verification Code"
	body := fmt.Sprintf("Your DevSync OTP for %s is: %s\nThis code expires in 10 minutes.", purpose, otp)

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		from, cleanTo, subject, body))

	auth := smtp.PlainAuth("", username, password, host)
	addr := fmt.Sprintf("%s:%s", host, port)

	err := smtp.SendMail(addr, auth, username, []string{cleanTo}, msg)
	if err != nil {
		log.Printf("❌ smtp: failed to send email to %s: %v", cleanTo, err)
		return err
	}
	log.Printf("✅ smtp: successfully sent OTP email to %s for %s", cleanTo, purpose)
	return nil
}