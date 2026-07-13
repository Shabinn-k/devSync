# System Architecture

# DevSync – Developer Collaboration Platform

# 1. Architecture Style

DevSync follows the following architectural approaches:

- Feature-Based Architecture
- Clean Architecture
- Layered Architecture
- Event-Driven Architecture
- Client-Server Architecture

These approaches ensure that business logic remains independent of frameworks and infrastructure while making the application easier to maintain and extend.

---

# 2. High-Level Architecture


                        +----------------------+
                        |      React App       |
                        |  (Frontend - Vite)   |
                        +----------+-----------+
                                   |
                            REST API / WebSocket
                                   |
                        +----------v-----------+
                        |    Gin HTTP Server   |
                        +----------+-----------+
                                   |
             +---------------------+---------------------+
             |                     |                     |
        Authentication        Project Module        Chat Module
             |                     |                     |
             +----------+----------+----------+----------+
                        |                     |
                 Business Services      Event Publisher
                        |                     |
                 Repository Layer       Apache Kafka
                        |                     |
                  PostgreSQL         Activity & Notifications
                        |
                     Redis Cache


---

# 3. Frontend Architecture

The frontend is developed using React with a feature-based folder structure.

Each feature is isolated into its own module containing components, API calls, state management, validation, and types.

Main frontend features include:

- Authentication
- Dashboard
- Organizations
- Teams
- Projects
- Tasks
- Chat
- Activity Feed
- Profile
- Analytics
- Settings

State management is handled using Zustand, while TanStack Query manages server-side data fetching and caching.

---

# 4. Backend Architecture

The backend is developed using Golang and Gin.

Each feature is implemented as an independent module containing:

- Handler
- Service
- Repository
- Model
- DTO
- Validator

The architecture separates HTTP handling, business logic, and database access to improve maintainability.

Business logic is implemented in the Service layer, while database interactions are handled exclusively by the Repository layer.

---

# 5. Database Architecture

PostgreSQL serves as the primary relational database.

The database stores:

- Users
- Organizations
- Teams
- Projects
- Tasks
- Comments
- Attachments
- Notifications
- Activities
- Chat Messages
- Documentation

Redis is used for caching and improving application performance.

---

# 6. Communication Architecture

The system uses multiple communication mechanisms.

## REST API

Used for:

- Authentication
- CRUD operations
- Dashboard data
- Profile management

---

## WebSocket

Used for:

- Team Chat
- Real-time notifications
- Live activity updates
- Online user status

---

## gRPC

Used for internal service-to-service communication where high performance is required.

---

## Apache Kafka

Kafka provides asynchronous communication between modules.

Example events include:

- User Logged In
- Project Created
- Task Assigned
- Task Completed
- Comment Added
- Notification Created

Consumers process these events independently to update the Activity Feed and Notification system.

---

# 7. Authentication Architecture

Authentication is implemented using JWT.

Workflow:

1. User submits login credentials.
2. Credentials are validated.
3. Password is verified using bcrypt.
4. Access Token and Refresh Token are generated.
5. Tokens are returned to the client.
6. Protected APIs require a valid JWT token.

Role-Based Access Control (RBAC) is used to authorize user actions.

---

# 8. Module Interaction

Each module is independent and communicates through well-defined interfaces.

Example:


Task Module
      │
      ▼
Kafka Event
      │
      ▼
Activity Module
      │
      ▼
Notification Module
      │
      ▼
WebSocket
      │
      ▼
Frontend Updates


This approach reduces module coupling and improves scalability.

---

# 9. Request Flow

A typical request follows this sequence:


Client
   │
   ▼
Router
   │
   ▼
Middleware
   │
   ▼
Handler
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
PostgreSQL


The response follows the reverse path back to the client.

---

# 10. Advantages of the Architecture

- Modular and maintainable codebase
- Clear separation of responsibilities
- Scalable feature-based structure
- Real-time collaboration using WebSockets
- Event-driven communication using Kafka
- Secure authentication using JWT
- Efficient database access through Repository Pattern
- Easy integration of new modules and services

---