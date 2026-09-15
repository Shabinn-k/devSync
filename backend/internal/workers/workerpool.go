package workers

import (
	"context"
	"errors"  
	"log"
	"sync"
	"time"
)

type Job struct {
	ID        string
	Type      string
	Payload   interface{}
	Retry     int
	MaxRetry  int
	CreatedAt time.Time
}

type JobResult struct {
	JobID       string
	Success     bool
	Error       error
	ProcessedAt time.Time
}

type JobHandler func(ctx context.Context, job Job) error

type WorkerPool struct {
	jobQueue    chan Job
	resultQueue chan JobResult
	workers     int
	wg          sync.WaitGroup
	ctx         context.Context
	cancel      context.CancelFunc
	handlers    map[string]JobHandler
	mu          sync.RWMutex
}

func NewWorkerPool(workers int, queueSize int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	return &WorkerPool{
		jobQueue:    make(chan Job, queueSize),
		resultQueue: make(chan JobResult, queueSize),
		workers:     workers,
		ctx:         ctx,
		cancel:      cancel,
		handlers:    make(map[string]JobHandler),
	}
}

func (wp *WorkerPool) RegisterHandler(jobType string, handler JobHandler) {
	wp.mu.Lock()
	defer wp.mu.Unlock()
	wp.handlers[jobType] = handler
	log.Printf(" Registered handler for job type: %s", jobType)
}

func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
	log.Printf("🚀 Worker pool started with %d workers", wp.workers)
}

func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()
	log.Printf("🔄 Worker %d started", id)

	for {
		select {
		case job, ok := <-wp.jobQueue:
			if !ok {
				log.Printf("🛑 Worker %d stopping", id)
				return
			}
			wp.processJob(job)
		case <-wp.ctx.Done():
			log.Printf("🛑 Worker %d stopping due to context", id)
			return
		}
	}
}

func (wp *WorkerPool) processJob(job Job) {
	wp.mu.RLock()
	handler, exists := wp.handlers[job.Type]
	wp.mu.RUnlock()

	if !exists {
		log.Printf("No handler for job type: %s", job.Type)
		wp.resultQueue <- JobResult{
			JobID:       job.ID,
			Success:     false,
			Error:       errors.New("no handler for job type"),
			ProcessedAt: time.Now(),
		}
		return
	}

	var err error
	for attempt := 0; attempt <= job.MaxRetry; attempt++ {
		if attempt > 0 {
			log.Printf("🔄 Retrying job %s (attempt %d/%d)", job.ID, attempt, job.MaxRetry)
		}

		err = handler(wp.ctx, job)
		if err == nil {
			wp.resultQueue <- JobResult{
				JobID:       job.ID,
				Success:     true,
				Error:       nil,
				ProcessedAt: time.Now(),
			}
			log.Printf(" Job %s completed successfully", job.ID)
			return
		}
	}

	wp.resultQueue <- JobResult{
		JobID:       job.ID,
		Success:     false,
		Error:       err,
		ProcessedAt: time.Now(),
	}
	log.Printf("Job %s failed after %d attempts: %v", job.ID, job.MaxRetry, err)
}

func (wp *WorkerPool) Submit(job Job) {
	job.CreatedAt = time.Now()
	if job.MaxRetry == 0 {
		job.MaxRetry = 3
	}
	
	select {
	case wp.jobQueue <- job:
		log.Printf("📤 Job %s submitted (type: %s)", job.ID, job.Type)
	default:
		log.Printf("⚠️ Job queue full, dropping job %s", job.ID)
	}
}

func (wp *WorkerPool) SubmitWithPayload(id, jobType string, payload interface{}) {
	wp.Submit(Job{
		ID:       id,
		Type:     jobType,
		Payload:  payload,
		MaxRetry: 3,
	})
}

func (wp *WorkerPool) GetResults() <-chan JobResult {
	return wp.resultQueue
}

func (wp *WorkerPool) Stop() {
	log.Println("🛑 Stopping worker pool...")
	wp.cancel()
	close(wp.jobQueue)
	wp.wg.Wait()
	close(wp.resultQueue)
	log.Println(" Worker pool stopped")
}