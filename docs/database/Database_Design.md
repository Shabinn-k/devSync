# Database Design

# DevSync – Developer Collaboration Platform

# 1. Overview

The DevSync database is designed using PostgreSQL and follows a relational database model. The database stores information related to users, organizations, projects, teams, tasks, communication, documentation, notifications, and developer activities.

The design follows normalization principles to reduce data redundancy while maintaining efficient relationships between entities.

---

# 2. Database Objectives

The database is designed to:

- Store application data securely.
- Maintain relationships between entities.
- Support project collaboration.
- Ensure data consistency and integrity.
- Allow future scalability.
- Improve query performance.

---

# 3. Database Management System

| Property | Value |
|----------|-------|
| Database | PostgreSQL |
| ORM | GORM |
| Cache | Redis |
| Storage | MinIO |

---

# 4. Database Entities

The primary entities in the system are:

- Users
- Organizations
- Teams
- Projects
- Tasks
- Comments
- Attachments
- Chat Messages
- Notifications
- Activities
- Documentation
- Refresh_tokens

---

# 5. Entity Relationships

The database follows the relationships below:

Organization
│
├── Users
│
├── Teams
│
└── Projects
        │
        ├── Tasks
        │      ├── Comments
        │      └── Attachments
        │
        ├── Documentation
        │
        └── Activity Logs

Users are related to:

- Organizations
- Teams
- Projects
- Tasks
- Comments
- Chat Messages
- Notifications
- Activities
- Refresh_tokens

---

# 6. Main Tables

The system contains the following tables:

- users
- organizations
- organization_members
- teams
- team_members
- projects
- project_members
- tasks
- task_comments
- task_attachments
- chat_channels
- chat_messages
- notifications
- activity_logs
- documentations
- Refresh_tokens

---

# 7. Primary Keys

Each table contains a UUID primary key.

Example:

- user_id
- organization_id
- team_id
- project_id
- task_id

UUIDs improve scalability and prevent predictable identifiers.

---

# 8. Foreign Key Relationships

Examples include:

- organization_id → organizations
- owner_id → users
- project_id → projects
- task_id → tasks
- assignee_id → users
- created_by → users
- sender_id → users
- channel_id → chat_channels

---

# 9. Data Integrity

The database maintains consistency using:

- Primary Keys
- Foreign Keys
- NOT NULL constraints
- UNIQUE constraints

---

# 10. Normalization

The database is designed following Third Normal Form (3NF).

Benefits include:

- Reduced redundancy
- Easier maintenance
- Improved consistency
- Better scalability

---

# 11. Indexing Strategy

Indexes will be created on frequently searched columns such as:

- email
- username
- organization_id
- project_id
- task_id
- assignee_id
- created_at

---

# 12. Security Considerations

Sensitive information is protected by:

- Password hashing using bcrypt
- JWT authentication
- Role-Based Access Control (RBAC)
- Secure database connections
- Input validation before database operations

Passwords are never stored in plain text.

---

# 13. Scalability

The database design supports future expansion through:

- Modular entity relationships
- UUID identifiers
- Separate membership tables
- Independent activity logging
- Event-driven updates using Kafka

---