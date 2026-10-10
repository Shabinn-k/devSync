# DevSync AWS deployment guide

This guide prepares a small single-instance deployment; it does not create AWS resources. The API is not production-ready until the remaining blockers at the end are resolved. In particular, use HTTPS/WSS before sending real user traffic.

## Cost-conscious starting point

Use one Linux EC2 instance for the API and frontend, with PostgreSQL and Redis on private endpoints. For an initial public production service, RDS PostgreSQL and ElastiCache Redis provide database and cache TLS without operating those systems on the web host, but they add substantial hourly charges. Do not create them until the measured need and monthly estimate are accepted. A single EC2 host with local stateful containers costs less but is a single point of failure and needs a separately designed TLS configuration and tested backup/restore process; the checked-in Compose file is for local development and is not that production topology.

As a sizing example, Linux `t3.small` in `us-east-1` is listed at about $0.0208/hour, or about $15.18 for 730 hours. A 20 GiB gp3 volume at the example $0.08/GiB-month rate is about $1.60, and one public IPv4 at $0.005/hour is about $3.65. That gives an illustrative **$20.43/month floor** for the instance, that disk, and one IPv4, before data transfer, snapshots/backups, log ingestion/storage, DNS, support, or any database/cache services. Rates vary by region and can change; confirm the exact AMI, region, disk, and workload in the [AWS Pricing Calculator](https://calculator.aws/). [AWS EC2 pricing example](https://docs.aws.amazon.com/prescriptive-guidance/latest/optimize-costs-microsoft-workloads/right-size-selection.html), [EBS pricing](https://aws.amazon.com/ebs/pricing/), [public IPv4 pricing](https://aws.amazon.com/vpc/pricing/).

Free-plan eligibility, free-tier eligibility, and promotional credits are different. New accounts created on or after July 15, 2025 may use certain eligible instance types, including t3.small, for six months or until credits are exhausted; older accounts have different instance types and time limits. Credits are temporary and do not make a resource permanently free. EBS, addresses, backups, transfer, and services outside an account’s offer can still cost money. Check the account’s Free Tier page and credits before launch. [AWS Free Tier eligibility by account date](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html), [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/).

## Deployment checklist

1. **Choose the region and topology.** Start with one EC2 instance and no load balancer or NAT Gateway. Place PostgreSQL and Redis in private subnets/security groups, or use private managed endpoints. The API configuration below requires verified PostgreSQL TLS and Redis TLS in production.
2. **Create only the required network access.** Public inbound: TCP 80 and 443 for HTTP redirect and HTTPS. Do not expose 8080, 5432, or 6379. Prefer Systems Manager Session Manager over SSH; if SSH is required, restrict port 22 to a single administrator IP. Permit the EC2 security group to reach only the database and cache ports. Do not assign public addresses to database/cache endpoints.
3. **Set up identity and secrets.** Attach an EC2 instance role with least-privilege access to the selected secret store and, if used, a specific backup bucket. Do not place AWS keys in `.env`, Docker images, source control, or the frontend. Retrieve secrets at deploy time and write a root-owned, mode-0600 environment file (or use a secret injection service). Environment variables and Docker inspection are visible to host administrators and the Docker daemon.
4. **Set DNS and HTTPS.** Point the API and frontend hostnames at the instance. Run a host reverse proxy such as Caddy on ports 80/443 and proxy to loopback-only container ports. Configure WebSocket upgrade forwarding for `/ws/notifications`. The proxy must not log query strings because WebSocket connection tickets are short-lived URL parameters. Use a trusted certificate and redirect HTTP to HTTPS.
5. **Prepare the host and persistent storage.** Install Docker Engine and Compose, create an encrypted EBS volume for durable data, and mount it at a stable host path. Keep database data and avatar uploads on persistent storage. The current app stores avatars on the local filesystem; back up that directory and database together. S3 upload storage is not implemented, so replacing/scaling the host requires a deliberate file migration.
6. **Build the images.** From a reviewed checkout on the host (or transfer signed images through a registry):

   ```sh
   docker build -t devsync-api:release ./backend
   docker build -t devsync-web:release \
     --build-arg VITE_ENV=production \
     --build-arg VITE_API_URL=https://api.example.com \
     --build-arg VITE_WS_URL=wss://api.example.com \
     -f infrastructure/docker/frontend/Dockerfile .
   ```

   The production frontend build rejects non-HTTPS API and non-WSS socket URLs. Those Vite values are embedded in the static bundle; rebuild the frontend when they change. Backend secrets are runtime configuration and must never be build arguments.
   Base-image tags are pinned to release versions here but not to immutable digests. Before a release, update Go/Alpine/Node/nginx patch tags, build and scan both images, and record the resulting registry digests for rollback. Rebuild promptly for critical upstream security fixes.
7. **Configure runtime environment.** Supply these values to the backend container:

   | Variable | Production value |
   | --- | --- |
   | `ENV` | `production` |
   | `PORT` | `8080` |
   | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Distinct random values of at least 32 characters; access lifetime no more than 900 seconds |
   | `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | Seconds; access <= `900`, refresh per your session policy |
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Private PostgreSQL endpoint and unique credentials; DB password at least 16 characters |
   | `DB_SSLMODE` | `verify-full` |
   | `DB_SSLROOTCERT` | Path to the provider CA bundle mounted read-only in the container |
   | `DB_TIMEZONE` | `UTC` |
   | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Private Redis endpoint, port, and authentication secret of at least 32 characters |
   | `REDIS_TLS` | `true` |
   | `FRONTEND_URL` | Public HTTPS frontend origin |
   | `CORS_ORIGINS` | Comma-separated exact HTTPS origins; no wildcard or paths |
   | `TRUSTED_PROXIES` | Exact reverse-proxy IP or narrow CIDR that reaches the API container; never trust all proxies |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | Real production mail provider settings for verification and recovery flows |

   The backend rejects missing/weak signing secrets, default DB credentials, unverified DB TLS, missing Redis authentication/TLS, non-HTTPS production origins, an unrestricted/missing trusted proxy list, and access-token lifetimes over 15 minutes. Determine the Docker bridge source address seen by the API and trust only that Caddy proxy address; do not copy an example CIDR without checking the host.
8. **Run migration before starting the new API.** With the production environment file mounted/readable by Docker:

   ```sh
   docker run --rm --env-file /etc/devsync/api.env \
     -v /etc/devsync/rds-ca.pem:/run/secrets/rds-ca.pem:ro \
     devsync-api:release ./server migrate
   ```

   The command records the applied baseline in `schema_migrations` and is safe to rerun. Back up the database first. This initial migration uses GORM `AutoMigrate` as a one-time baseline; future schema changes need new, reviewed migration versions. Do not run migrations automatically as part of API startup.
9. **Provision the first administrator once.** Create a private password file on the host, mount it read-only, and run:

   ```sh
   umask 077
   read -r -s -p 'Initial admin password: ' ADMIN_PASSWORD
   printf '\n'
   printf '%s' "$ADMIN_PASSWORD" > /run/devsync/admin-password
   unset ADMIN_PASSWORD
   chmod 600 /run/devsync/admin-password
   docker run --rm --env-file /etc/devsync/api.env \
     -v /etc/devsync/rds-ca.pem:/run/secrets/rds-ca.pem:ro \
     -v /run/devsync/admin-password:/run/secrets/admin-password:ro \
     devsync-api:release ./server provision-admin \
     --name 'DevSync Admin' --email admin@example.com \
     --password-file /run/secrets/admin-password
   rm /run/devsync/admin-password
   ```

   Provisioning is one-time and fails if any user already exists. The CLI hashes the password with bcrypt and does not print it.
10. **Start the API and frontend.** Bind container ports only to loopback so the reverse proxy is the public entry point:

    ```sh
    docker run -d --name devsync-api --restart unless-stopped \
      --env-file /etc/devsync/api.env \
      -v /etc/devsync/rds-ca.pem:/run/secrets/rds-ca.pem:ro \
      -p 127.0.0.1:8080:8080 \
      -v /srv/devsync/uploads:/app/uploads \
      --health-cmd='wget -q -O /dev/null http://127.0.0.1:8080/ready || exit 1' \
      --health-interval=15s --health-timeout=5s --health-retries=5 \
      devsync-api:release

    docker run -d --name devsync-web --restart unless-stopped \
      -p 127.0.0.1:5173:80 devsync-web:release
    ```

    Confirm `/live` returns 200 and `/ready` returns 200 before directing traffic. Readiness checks PostgreSQL and Redis; liveness does not.
11. **Inspect logs and monitor costs.** Start with `docker logs --since 15m devsync-api` and `docker inspect --format '{{.State.Health.Status}}' devsync-api`. Set Docker log rotation. If sending logs to CloudWatch, set a short retention (for example 7 days) and watch ingestion/storage; CloudWatch’s pricing page lists a 5 GB free-tier allowance, which is not an unlimited free service. [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).
12. **Back up and test recovery.** Schedule encrypted database backups and EBS snapshots; keep at least one backup outside the instance volume. Periodically restore a backup to a separate test database/host and verify both DB and uploads. Snapshot and S3 storage have separate charges. Do not treat Docker named volumes or a running instance as a backup.
13. **Rollback.** Keep the previous image tag. To roll back code, stop the new containers and rerun the prior image tags with the same runtime config and data mounts. The initial GORM migration is additive, but this project has no migration `Down` operations; never roll back by deleting/recreating the database. Restore a verified pre-migration backup to a new volume/database only if the new schema is incompatible, then switch the endpoint deliberately.
14. **Clean up and control spend.** Remove unused instances, unattached EBS volumes, snapshots, public IPv4/EIPs, registries/images, log groups, and any managed DB/cache resources. Set a monthly AWS Budget and billing alerts before launch; alerts do not cap usage. Check current Free Tier/credit status and actual region pricing rather than assuming credits cover all line items.

## Exact image and local Compose commands

Local development uses the root Compose stack and plaintext local-only PostgreSQL/Redis settings:

```sh
docker compose build backend frontend
docker compose up -d db redis
docker compose run --rm --no-deps backend ./server migrate
docker compose up --build
```

The root Compose file is **not a production AWS topology**. It starts local PostgreSQL and Redis, and its app ports are intended for developer use. Do not make ports 8080, 5432, or 6379 public. Use the production `docker run` pattern above or a separately reviewed production Compose overlay.

## Remaining production blockers

- Database migrations have a recorded baseline, but future schema changes still need explicit versioned migration files and pre-production rehearsal; `AutoMigrate` is not a substitute for a mature migration framework.
- There is no S3/object-storage adapter. Avatar uploads remain tied to one host and require durable-volume backups.
- The `organizations` AddMember path reports an invitation as sent without implementing an email send; it now returns a clear unavailable error instead. Use the separate token-based organization invitation flow until this path is implemented and verified.
- The application has in-memory WebSocket tickets and a single-process WebSocket hub/rate limiter. Multiple API replicas need shared ticket storage and distributed rate limiting.
- A single EC2 instance, local upload volume, and single database/cache endpoints have no high availability. Recovery depends on tested backups.
- The production deployment still requires provisioned private PostgreSQL/Redis endpoints, TLS CA files, secrets, DNS, HTTPS reverse proxy, firewall rules, backups, and billing alerts. No AWS resource has been deployed or validated from this repository.

## Authorization and browser security policy

- Project administration is granted to project admins/creators, active organization owners/admins/team leads, a lead of the project's assigned active team while still an active organization member, and the explicit platform administrator role. A global team-lead role alone grants no cross-organization project access.
- Task detail edits are limited to the task creator while still an active project member and project administrators. Status changes and comments are limited to active project members who are the task assignee or creator, or project administrators. Deletion is limited to the task creator or project administrators.
- Group chat channel creation requires active membership in the exact organization, project, or team. Direct messages require two active users with a shared active organization.
- Access and refresh tokens still use localStorage to preserve the current browser/API contract. A successful XSS can read them. The frontend container now sends a Content Security Policy and standard browser security headers, but those headers cannot make localStorage tokens inaccessible to trusted application JavaScript. Before handling high-risk accounts or data, design and test a complete HttpOnly refresh-cookie migration with CSRF defenses, credentialed CORS, rotation, logout, and multi-tab behavior.
- The API rate limiter is bounded and process-local. Each replica enforces its own buckets; limits are not coordinated across instances. Keep one API instance or add shared rate limiting before scaling.
- The API rejects request bodies larger than 4 MiB globally; avatar uploads retain their stricter 2 MiB file limit. Pagination accepts pages 1–100 in size, with a 10,000,000-row maximum offset.
