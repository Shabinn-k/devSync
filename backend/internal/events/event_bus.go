package events

import (
	"context"
	"log"
	"sync"
)

type Event struct {
	Type      string
	Payload   interface{}
	UserID    int
	Timestamp int64
}

type EventHandler func(ctx context.Context, event Event) error

type EventBus struct {
	subscribers map[string][]EventHandler
	eventQueue  chan Event
	workers     int
	wg          sync.WaitGroup
	ctx         context.Context
	cancel      context.CancelFunc
	mu          sync.RWMutex
}

func NewEventBus(workers int, queueSize int) *EventBus {
	ctx, cancel := context.WithCancel(context.Background())
	return &EventBus{
		subscribers: make(map[string][]EventHandler),
		eventQueue:  make(chan Event, queueSize),
		workers:     workers,
		ctx:         ctx,
		cancel:      cancel,
	}
}

func (eb *EventBus) Subscribe(eventType string, handler EventHandler) {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	eb.subscribers[eventType] = append(eb.subscribers[eventType], handler)
	log.Printf("Handler subscribed to event: %s", eventType)
}

func (eb *EventBus) Publish(ctx context.Context, event Event) {
	select {
	case eb.eventQueue <- event:
		log.Printf("Event %s published", event.Type)
	default:
		log.Printf("Event queue full, dropping event: %s", event.Type)
	}
}

func (eb *EventBus) Start() {
	for i := 0; i < eb.workers; i++ {
		eb.wg.Add(1)
		go eb.worker(i)
	}
	log.Printf("Event bus started with %d workers", eb.workers)
}

func (eb *EventBus) worker(id int) {
	defer eb.wg.Done()
	log.Printf("Event worker %d started", id)

	for {
		select {
		case event, ok := <-eb.eventQueue:
			if !ok {
				return
			}
			eb.processEvent(event)
		case <-eb.ctx.Done():
			return
		}
	}
}

func (eb *EventBus) processEvent(event Event) {
	eb.mu.RLock()
	handlers, exists := eb.subscribers[event.Type]
	eb.mu.RUnlock()

	if !exists {
		log.Printf("No handlers for event type: %s", event.Type)
		return
	}

	for _, handler := range handlers {
		if err := handler(eb.ctx, event); err != nil {
			log.Printf("Error processing event %s: %v", event.Type, err)
		}
	}
}

func (eb *EventBus) Stop() {
	log.Println("Stopping event bus...")
	eb.cancel()
	close(eb.eventQueue)
	eb.wg.Wait()
	log.Println("Event bus stopped")
}