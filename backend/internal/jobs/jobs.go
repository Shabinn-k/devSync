package jobs

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"devSync/internal/events"
	"devSync/internal/workers"
	"devSync/utils/smtp"
)

const (
	JobTypeSendEmail      = "send_email"
	JobTypeSendNotification = "send_notification"
	JobTypeProcessImage   = "process_image"
)

func RegisterAllJobs(pool *workers.WorkerPool, eventBus *events.EventBus) {
	pool.RegisterHandler(JobTypeSendEmail, func(ctx context.Context, job workers.Job) error {
		var payload struct {
			To      string `json:"to"`
			Subject string `json:"subject"`
			Body    string `json:"body"`
		}
		
		if err := json.Unmarshal(job.Payload.([]byte), &payload); err != nil {
			return err
		}

		if err := smtp.SendEmail(payload.To, payload.Subject, payload.Body); err != nil {
			return err
		}

		eventBus.Publish(ctx, events.Event{
			Type:      "email.sent",
			Payload:   payload,
			Timestamp: time.Now().Unix(),
		})

		log.Printf("Email sent to %s", payload.To)
		return nil
	})

	pool.RegisterHandler(JobTypeSendNotification, func(ctx context.Context, job workers.Job) error {
		var payload struct {
			UserID  int    `json:"user_id"`
			Title   string `json:"title"`
			Content string `json:"content"`
		}
		
		if err := json.Unmarshal(job.Payload.([]byte), &payload); err != nil {
			return err
		}

		log.Printf("🔔 Notification sent to user %d: %s", payload.UserID, payload.Title)
		
		eventBus.Publish(ctx, events.Event{
			Type:      "notification.sent",
			Payload:   payload,
			Timestamp: time.Now().Unix(),
		})
		
		return nil
	})

	pool.RegisterHandler(JobTypeProcessImage, func(ctx context.Context, job workers.Job) error {
		var payload struct {
			ImageURL string `json:"image_url"`
			UserID   int    `json:"user_id"`
		}
		
		if err := json.Unmarshal(job.Payload.([]byte), &payload); err != nil {
			return err
		}

		log.Printf("🖼️ Processing image for user %d: %s", payload.UserID, payload.ImageURL)
		
		eventBus.Publish(ctx, events.Event{
			Type:      "image.processed",
			Payload:   payload,
			Timestamp: time.Now().Unix(),
		})
		
		log.Printf("Image processed successfully")
		return nil
	})
}