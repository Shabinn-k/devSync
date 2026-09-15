package smtp

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"devSync/config"
)

var appConfig *config.AppConfig
 
func Init(cfg *config.AppConfig) {
	appConfig = cfg
}
 
func SendOTPEmail(cfg *config.AppConfig, toEmail, otp, purpose string) error {
	subject := "DevSync Verification Code"
	body := fmt.Sprintf("Your DevSync OTP for %s is: %s\nThis code expires in 10 minutes.", purpose, otp)
	return SendEmailWithConfig(cfg, toEmail, subject, body)
}
 
func SendEmail(to, subject, body string) error {
	if appConfig == nil {
		return fmt.Errorf("SMTP not initialized. Call smtp.Init(cfg) first")
	}
	return SendEmailWithConfig(appConfig, to, subject, body)
} 

func SendEmailWithConfig(cfg *config.AppConfig, to, subject, body string) error {
	 
	cleanTo := strings.TrimSpace(strings.ReplaceAll(strings.ReplaceAll(to, "\r", ""), "\n", ""))
	host := strings.TrimSpace(cfg.SMTPHost)
	port := strings.TrimSpace(cfg.SMTPPort)
	username := strings.TrimSpace(cfg.SMTPUsername)
	password := strings.TrimSpace(cfg.SMTPPassword)
	from := strings.TrimSpace(cfg.SMTPFrom)
 
	if host == "" || username == "" || password == "" {
		return fmt.Errorf("SMTP configuration incomplete: host=%s, username=%s", host, username)
	}
 
	log.Printf("📧 Sending email to %s via %s:%s", cleanTo, host, port)
 
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = cleanTo
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(body)
 
	auth := smtp.PlainAuth("", username, password, host)
	addr := fmt.Sprintf("%s:%s", host, port)

	if err := smtp.SendMail(addr, auth, username, []string{cleanTo}, []byte(msg.String())); err != nil {
		log.Printf("Failed to send email to %s: %v", cleanTo, err)
		return err
	}

	log.Printf("Email sent successfully to %s", cleanTo)
	return nil
}