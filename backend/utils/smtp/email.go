package mailer

import (
	"fmt"
	"net/smtp"
	"devSync/config"
)

func SendOTPEmail(cfg *config.AppConfig, toEmail, otp, purpose string) error {
	subject := "DevSync Verification Code"
	body := fmt.Sprintf("Your DevSync OTP for %s is: %s\nThis code expires in 10 minutes.", purpose, otp)

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		cfg.SMTPFrom, toEmail, subject, body))

	auth := smtp.PlainAuth("", cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	return smtp.SendMail(addr, auth, cfg.SMTPUsername, []string{toEmail}, msg)
}