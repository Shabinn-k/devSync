# devSync

## Run locally with Docker

### Prerequisites

- Docker Desktop with Docker Compose enabled.

### Setup

1. Copy `.env.example` to `.env`. Use unique, long random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. The root `.env` is ignored by Git; do not commit it.
2. Optionally fill in SMTP credentials if you want the app to send verification or password reset emails.
3. Build the backend and start only its local dependencies:

   ```sh
   docker compose build backend
   docker compose up -d db redis
   docker compose run --rm --no-deps backend ./server migrate
   ```

4. Create the initial administrator once. On Linux/macOS, create a private password file and provision the account:

   ```sh
   umask 077
   read -r -s -p 'Initial admin password: ' ADMIN_PASSWORD
   printf '\n'
   printf '%s' "$ADMIN_PASSWORD" > ./admin-password
   unset ADMIN_PASSWORD
   docker compose run --rm --no-deps -v "$(pwd)/admin-password:/run/secrets/admin-password:ro" backend ./server provision-admin --name 'DevSync Admin' --email admin@example.com --password-file /run/secrets/admin-password
   rm ./admin-password
   ```

   Provisioning is permitted only while the database has no user accounts. The password is not a command-line argument and is never logged.

5. Start the complete local stack:

   ```sh
   docker compose up --build
   ```

Open the frontend at [http://localhost:5173](http://localhost:5173). The backend is at [http://localhost:8080](http://localhost:8080), readiness at [http://localhost:8080/ready](http://localhost:8080/ready), and liveness at [http://localhost:8080/live](http://localhost:8080/live).

The API does not migrate or seed privileged accounts during normal startup. Run `./server migrate` deliberately after starting dependencies and before starting the API. Migration history is kept in `schema_migrations`; schema changes must be added as new ordered migration versions. Readiness checks PostgreSQL, Redis, and the schema immediately at startup and periodically after that; liveness does not depend on either service.

Within the Compose network, the backend connects to PostgreSQL at `db:5432` and Redis at `redis:6379`. These service names are resolved by Docker DNS. The browser uses `localhost` for API and WebSocket URLs because browser clients cannot resolve Compose service names. Vite embeds `VITE_API_URL` and `VITE_WS_URL` at image build time, so rebuild after changing them.

The frontend image uses a development Content Security Policy for the local HTTP/WebSocket endpoints. Set `ENV=production` and use HTTPS/WSS URLs when building a production frontend image; that image uses the stricter HTTPS/WSS policy.

PostgreSQL data is stored in the `postgres_data` volume. Uploaded avatars are stored in `uploads_data` for local persistence.

### Useful commands

```sh
docker compose ps
docker compose logs
docker compose logs backend
docker compose logs frontend
docker compose logs db
docker compose logs redis
docker compose restart
docker compose down
docker image ls
docker ps
```

`docker compose down` stops and removes the containers but keeps named volumes, including local PostgreSQL data. `docker compose down -v` also deletes the volumes and their data.

## AWS deployment

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for the deployment checklist, configuration, costs, rollback, and remaining production blockers. No AWS resources are created by this repository.
