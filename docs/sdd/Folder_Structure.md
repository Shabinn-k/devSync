devsync/
├── README.md
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
│
├── cmd/
│   └── main.go
│
├── config/
│   ├── config.go
│   ├── database.go
│   ├── redis.go
│   ├── kafka.go
│   ├── websocket.go
│   └── env.go
│
├── internal/
│   │
│   ├── controllers/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── team/
│   │   ├── project/
│   │   ├── task/
│   │   ├── comment/
│   │   ├── attachment/
│   │   ├── notification/
│   │   ├── activity/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── search/
│   │
│   ├── services/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── team/
│   │   ├── project/
│   │   ├── task/
│   │   ├── comment/
│   │   ├── attachment/
│   │   ├── notification/
│   │   ├── activity/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── search/
│   │
│   ├── repositories/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── team/
│   │   ├── project/
│   │   ├── task/
│   │   ├── comment/
│   │   ├── attachment/
│   │   ├── notification/
│   │   ├── activity/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── search/
│   │
│   ├── models/
│   │
│   ├── dto/
│   │   ├── request/
│   │   ├── response/
│   │   └── mapper/
│   │
│   ├── validators/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │
│   ├── events/
│   │   ├── producer/
│   │   ├── consumer/
│   │   └── payload/
│   │
│   ├── websocket/
│   │
│   ├── grpc/
│   │
│   ├── bootstrap/
│   │
│   ├── response/
│   │
│   ├── constants/
│   │
│   ├── errors/
│   │
│   └── logger/
│
├── infrastructure/
│   │
│   ├── postgres/
│   ├── redis/
│   ├── kafka/
│   ├── storage/
│   ├── email/
│   ├── websocket/
│   ├── grpc/
│   └── monitoring/
│       ├── prometheus/
│       ├── grafana/
│       └── loki/
│
├── pkg/
│   ├── jwt/
│   ├── bcrypt/
│   ├── pagination/
│   ├── validator/
│   ├── context/
│   └── helper/
│
├── proto/
│
├── migrations/
│   ├── postgres/
│   └── seed/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   └── adr/
│
├── deployments/
│   ├── docker/
│   ├── kubernetes/
│   ├── nginx/
│   └── monitoring/
│
├── scripts/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── mocks/
│
├── .env.example
├── docker-compose.yml
├── Makefile
├── go.mod
└── go.sum
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














































devsync/
│
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── docs/
│   ├── sdd/
│   ├── api/
│   ├── database/
│   ├── architecture/
│   ├── diagrams/
│   └── adr/
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend/
│   │   │   └── Dockerfile
│   │   └── frontend/
│   │       └── Dockerfile
│   │
│   ├── nginx/
│   │   └── nginx.conf
│   │
│   ├── monitoring/
│   │   ├── prometheus/
│   │   │   └── prometheus.yml
│   │   ├── grafana/
│   │   │   ├── dashboards/
│   │   │   └── datasources/
│   │   └── loki/
│   │       └── loki-config.yml
│   │
│   └── scripts/
│       ├── migrate.sh
│       ├── seed.sh
│       ├── backup.sh
│       └── restore.sh
│
├── backend/
│   │
│   ├── cmd/
│   │   └── main.go
│   │
│   ├── config/
│   │   ├── config.go
│   │   ├── database.go
│   │   ├── redis.go
│   │   ├── kafka.go
│   │   ├── websocket.go
│   │   └── env.go
│   │
│   ├── internal/
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth/
│   │   │   ├── organization/
│   │   │   ├── team/
│   │   │   ├── project/
│   │   │   ├── task/
│   │   │   ├── comment/
│   │   │   ├── attachment/
│   │   │   ├── notification/
│   │   │   ├── activity/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   └── search/
│   │   │
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── organization/
│   │   │   ├── team/
│   │   │   ├── project/
│   │   │   ├── task/
│   │   │   ├── comment/
│   │   │   ├── attachment/
│   │   │   ├── notification/
│   │   │   ├── activity/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   └── search/
│   │   │
│   │   ├── repositories/
│   │   │   ├── auth/
│   │   │   ├── organization/
│   │   │   ├── team/
│   │   │   ├── project/
│   │   │   ├── task/
│   │   │   ├── comment/
│   │   │   ├── attachment/
│   │   │   ├── notification/
│   │   │   ├── activity/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   └── search/
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   ├── response/
│   │   │   └── mapper/
│   │   │
│   │   ├── validators/
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── routes/
│   │   │
│   │   ├── websocket/
│   │   │
│   │   ├── grpc/
│   │   │
│   │   ├── events/
│   │   │   ├── producer/
│   │   │   ├── consumer/
│   │   │   └── payload/
│   │   │
│   │   ├── bootstrap/
│   │   │
│   │   ├── response/
│   │   │
│   │   ├── constants/
│   │   │
│   │   ├── errors/
│   │   │
│   │   └── logger/
│   │
│   ├── pkg/
│   │   ├── jwt/
│   │   ├── bcrypt/
│   │   ├── pagination/
│   │   ├── validator/
│   │   ├── context/
│   │   └── helper/
│   │
│   ├── proto/
│   │
│   ├── migrations/
│   │   ├── postgres/
│   │   └── seed/
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── e2e/
│   │   └── mocks/
│   │
│   ├── go.mod
│   └── go.sum
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── features/
    │   ├── components/
    │   ├── layouts/
    │   ├── hooks/
    │   ├── lib/
    │   ├── stores/
    │   ├── types/
    │   ├── utils/
    │   ├── main.tsx
    │   └── index.css
    │
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.ts