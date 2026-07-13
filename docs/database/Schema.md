# Database Schema

# DevSync – Developer Collaboration Platform

# 1. Users

Stores information about registered users.

Primary Key

- id

Columns

- full_name
- username
- email
- password
- profile_image
- bio
- github_username
- role
- status
- created_at
- updated_at

Relationships

- One user can belong to multiple organizations.
- One user can be assigned to multiple tasks.
- One user can send multiple chat messages.
- One user can create multiple projects.

---

# 2. Organizations

Stores organization details.

Primary Key

- id

Columns

- name
- slug
- description
- logo
- owner_id
- created_at
- updated_at

Relationships

- One organization contains many teams.
- One organization contains many projects.
- One organization has many members.

---

# 3. Organization Members

Maps users to organizations.

Primary Key

- id

Foreign Keys

- organization_id
- user_id

Columns

- role
- joined_at

---

# 4. Teams

Stores team information.

Primary Key

- id

Columns

- organization_id
- name
- description
- created_at

Relationships

- One team contains many members.
- One team works on multiple projects.

---

# 5. Team Members

Maps users to teams.

Primary Key

- id

Foreign Keys

- team_id
- user_id

Columns

- joined_at

---

# 6. Projects

Stores software projects.

Primary Key

- id

Columns

- organization_id
- team_id
- name
- description
- status
- visibility
- github_repository
- deadline
- created_by
- created_at
- updated_at

Relationships

- One project contains many tasks.
- One project contains documentation.
- One project has multiple members.

---

# 7. Project Members

Maps developers to projects.

Primary Key

- id

Foreign Keys

- project_id
- user_id

Columns

- role
- joined_at

---

# 8. Tasks

Stores project tasks.

Primary Key

- id

Columns

- project_id
- assignee_id
- title
- description
- priority
- status
- due_date
- estimated_hours
- story_points
- created_by
- created_at
- updated_at

Relationships

- One project contains many tasks.
- One task contains many comments.
- One task contains many attachments.

---

# 9. Task Comments

Stores task discussions.

Primary Key

- id

Foreign Keys

- task_id
- user_id

Columns

- comment
- created_at

---

# 10. Attachments

Stores task attachments.

Primary Key

- id

Foreign Keys

- task_id
- uploaded_by

Columns

- file_name
- file_url
- file_size
- uploaded_at

---

# 11. Chat Channels

Stores communication channels.

Primary Key

- id

Columns

- organization_id
- project_id
- name
- type
- created_at

---

# 12. Chat Messages

Stores chat messages.

Primary Key

- id

Foreign Keys

- channel_id
- sender_id

Columns

- message
- attachment_url
- created_at

---

# 13. Notifications

Stores user notifications.

Primary Key

- id

Foreign Keys

- user_id

Columns

- title
- message
- type
- is_read
- created_at

---

# 14. Activity Logs

Stores system activities.

Primary Key

- id

Foreign Keys

- user_id
- project_id

Columns

- action
- entity_type
- entity_id
- created_at

---

# 15. Documentation

Stores project documentation.

Primary Key

- id

Foreign Keys

- project_id
- author_id

Columns

- title
- content
- last_updated
- created_at

---

# 16. Database Standards

- PostgreSQL is the primary database.
- UUIDs are used for all primary keys.
- Foreign key constraints ensure referential integrity.
- Frequently queried columns should be indexed.
- Passwords are stored as bcrypt hashes.
- Soft deletes may be implemented where appropriate.

---