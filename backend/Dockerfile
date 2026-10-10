FROM golang:1.26.9-alpine3.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/main.go

FROM alpine:3.24

RUN apk add --no-cache ca-certificates wget \
    && adduser -D -H -u 10001 appuser \
    && mkdir -p /app/uploads/avatars \
    && chown -R appuser:appuser /app
WORKDIR /app
COPY --from=builder --chown=appuser:appuser /out/server ./server

USER appuser
EXPOSE 8080
CMD ["./server"]
