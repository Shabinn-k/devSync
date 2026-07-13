devsync/
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── Makefile
├── .env.example
│
├── docs/
│   ├── sdd/                        
│   ├── api/                        
│   ├── database/                   
│   └── diagrams/                  
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend/
│   │   │   ├── Dockerfile.api
│   │   │   ├── Dockerfile.ws
│   │   │   └── Dockerfile.worker
│   │   └── frontend/
│   │       └── Dockerfile
│   ├── nginx/
│   │   └── nginx.conf
│   ├── monitoring/
│   │   ├── prometheus/prometheus.yml
│   │   ├── grafana/dashboards/*.json
│   │   └── loki/loki-config.yml
│   └── scripts/
│       ├── migrate.sh
│       └── seed.sh
│
├── backend/
│   ├── cmd/
│   │   ├── api/main.go
│   │   ├── ws/main.go
│   │   ├── worker/main.go
│   │   └── migrate/main.go
│   │
│   ├── configs/
│   │   ├── config.go
│   │   ├── development.yaml
│   │   └── production.yaml
│   │
│   ├── internal/
│   │   ├── modules/
│   │   │   ├── auth/            {handler, service, repository, model, dto, validator}
│   │   │   ├── organization/    "" ""
│   │   │   ├── team/            "" ""
│   │   │   ├── project/         "" ""
│   │   │   ├── task/            "" ""
│   │   │   ├── attachment/      "" ""
│   │   │   ├── notification/    "" ""
│   │   │   ├── chat/            "" ""
│   │   │   ├── activity/        "" ""
│   │   │   └── userprofile/     "" ""
│   │   │
│   │   ├── platform/
│   │   │   ├── grpc/{client, server}
│   │   │   ├── kafka/{producer.go, consumer.go, topics.go}
│   │   │   ├── websocket/{hub.go, client.go}
│   │   │   ├── database/{postgres.go, migrations/}
│   │   │   ├── cache/redis.go
│   │   │   └── storage/minio.go
│   │   │
│   │   ├── middleware/
│   │   ├── di/container.go
│   │   ├── response/
│   │   ├── errors/
│   │   ├── logger/
│   │   └── router/router.go
│   │
│   ├── pkg/
│   │   ├── jwtutil/
│   │   ├── hashutil/
│   │   ├── email/
│   │   ├── pagination/
│   │   └── validator/
│   │
│   ├── proto/{user, organization, project, task, notification, chat}/
│   ├── gen/                         
│   ├── test/{integration, mocks}
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers/{QueryProvider, AuthProvider, SocketProvider, ThemeProvider}
│   │   ├── features/
│   │   │   ├── auth/            {api, components, store, types, schema}
│   │   │   ├── dashboard/       "" ""
│   │   │   ├── organizations/   "" ""
│   │   │   ├── teams/           "" ""
│   │   │   ├── projects/        "" ""
│   │   │   ├── tasks/           "" ""
│   │   │   ├── comments/        "" ""
│   │   │   ├── notifications/   "" ""
│   │   │   ├── chat/            "" ""
│   │   │   ├── activity/        "" ""
│   │   │   ├── profile/         "" ""
│   │   │   └── settings/        "" ""
│   │   ├── components/{ui, layout, feedback}
│   │   ├── layouts/{AuthLayout, DashboardLayout, OrgSettingsLayout}
│   │   ├── hooks/
│   │   ├── lib/{axios.ts, socket.ts, queryClient.ts}
│   │   ├── stores/{authStore, uiStore, notificationStore}
│   │   ├── types/api.ts
│   │   ├── utils/
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json