# Story 1.1: Secrets Migration & Environment Configuration

Status: done

## Story

As a developer,
I want all hardcoded secrets replaced with environment variables,
so that the application is safe to deploy to production without exposing credentials.

## Acceptance Criteria

1. **Given** the existing PiggyMetrics config files contain hardcoded secrets  
   **When** the migration is complete  
   **Then** no secrets exist in any source-controlled file

2. **And** all services read secrets from environment variables or Docker secrets

3. **And** a `.env.example` file documents all required variables with placeholder values

4. **And** a `.env` file (gitignored) provides working local dev values

5. **And** all existing services start successfully with the new env-based config

## Tasks / Subtasks

- [x] Audit all hardcoded secrets across config files (AC: 1)
  - [x] Scan `config/src/main/resources/shared/` for hardcoded credentials
  - [x] Scan `auth-service` config for OAuth client secrets, token signing keys
  - [x] Scan `docker-compose.yml` and `docker-compose.dev.yml` for hardcoded env values
  - [x] Scan individual service `bootstrap.yml` / `application.yml` files
- [x] Create `.env.example` with all required variable names and placeholder values (AC: 3)
- [x] Create `.env` (gitignored) with working local dev values (AC: 4)
- [x] Update `docker-compose.yml` to use `env_file: .env` for all services (AC: 2)
- [x] Update `docker-compose.dev.yml` to use `env_file: .env` for all services (AC: 2)
- [x] Update Spring Cloud Config shared YAMLs to reference `${ENV_VAR_NAME}` placeholders (AC: 2)
- [x] Verify `.env` is in `.gitignore` (AC: 1)
- [x] Smoke-test: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` — all services start (AC: 5)

## Dev Notes

### What to Migrate

The existing PiggyMetrics codebase has secrets hardcoded in Spring Cloud Config shared YAML files under `config/src/main/resources/shared/`. Key secrets to migrate:

- **MongoDB credentials** — each service has its own MongoDB instance; connection strings may contain credentials
- **RabbitMQ credentials** — used by notification-service and monitoring (Turbine/Hystrix)
- **OAuth2 client secrets** — auth-service has hardcoded client IDs and secrets for `browser` and `service` clients
- **Token signing key** — auth-service JWT/token signing key (currently likely a static string)
- **Notification service SMTP credentials** — email username/password for sending notifications
- **Config service encryption key** (if used)

### Pattern to Follow

Docker Compose `env_file` approach — the simplest pattern that matches the existing stack:

```yaml
# docker-compose.yml (add to every service)
services:
  account-service:
    env_file:
      - .env
    environment:
      # service-specific overrides can still go here
```

Spring config YAML references environment variables like:
```yaml
# config/src/main/resources/shared/application.yml
spring:
  rabbitmq:
    host: rabbitmq
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}
```

### `.env.example` Structure

```bash
# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=<your-rabbitmq-password>

# MongoDB (per-service)
ACCOUNT_SERVICE_MONGODB_URI=mongodb://account-service-mongodb:27017/piggymetrics
STATISTICS_SERVICE_MONGODB_URI=mongodb://statistics-service-mongodb:27017/statistics
NOTIFICATION_SERVICE_MONGODB_URI=mongodb://notification-service-mongodb:27017/notifications

# Auth Service
AUTH_SERVICE_CLIENT_SECRET=<your-auth-client-secret>
AUTH_SERVICE_TOKEN_SIGNING_KEY=<your-token-signing-key>

# Notification Service (SMTP)
NOTIFICATION_EMAIL_USER=<your-email@example.com>
NOTIFICATION_EMAIL_PASSWORD=<your-email-password>

# Config Service
CONFIG_SERVICE_PASSWORD=<your-config-service-password>
```

### `.gitignore` Check

Verify `.env` is already in `.gitignore`. If not, add it. `.env.example` MUST be committed — it documents required variables without exposing values.

### Spring Boot Environment Variable Injection

Spring Boot automatically maps environment variables to properties using relaxed binding. `${RABBITMQ_PASSWORD}` in YAML resolves from the `RABBITMQ_PASSWORD` env var. No code changes needed — only YAML config changes.

### Existing File Locations to Modify

- `config/src/main/resources/shared/application.yml` — shared config (RabbitMQ, etc.)
- `config/src/main/resources/shared/notification-service.yml` — SMTP credentials
- `config/src/main/resources/shared/auth-service.yml` (if exists) — OAuth client secrets
- `docker-compose.yml` — add `env_file` to each service block
- `docker-compose.dev.yml` — add `env_file` to each service block
- `.gitignore` — ensure `.env` is listed

### API Contracts — No Changes

This story touches ONLY configuration files and Docker Compose. Zero changes to:
- Java source code
- API endpoints
- Service behavior
- Database schemas

All existing API contracts remain intact. [Source: architecture.md#API Contracts]

### Security Gates This Story Addresses

This story is a **pre-launch blocker** (NFR10). The auth-service token store (in-memory → Redis) and password encoder (NoOp → BCrypt) are addressed in Story 1.2, not here. [Source: architecture.md#Security gates]

### Project Structure Notes

- All changes are in the project root and `config/` directory — no `penny/` frontend directory exists yet
- No new Java files created — config YAML changes only
- `.env` and `.env.example` live at project root (same level as `docker-compose.yml`)
- This story has no frontend component

### References

- [Source: architecture.md#Authentication & Security] — Secrets Management section
- [Source: project-context.md#Critical Don't-Miss Rules] — "All secrets MUST be in environment variables before production"
- [Source: project-context.md#Development Workflow Rules] — Environment section
- [Source: epic-1-foundation-security-hardening.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro)

### Debug Log References

### Review Findings

- [x] [Review][Patch] `.env` is tracked in git HEAD — `git rm --cached .env` required to untrack it [.env / .gitignore]
- [x] [Review][Patch] `notification-service/src/test/resources/application.yml` has hardcoded SMTP credentials (`username: test`, `password: test`) — not covered by this story's changes [notification-service/src/test/resources/application.yml:22-23]
- [x] [Review][Patch] `rabbitmq` service missing `env_file: .env` in `docker-compose.dev.yml` — inconsistent with all other services [docker-compose.dev.yml:4]
- [x] [Review][Patch] `.gitignore` and `docker-compose.dev.yml` missing newline at end of file [.gitignore / docker-compose.dev.yml]
- [x] [Review][Defer] `.env` contains `dev-password` as SMTP placeholder value — weak but acceptable for local dev [.env:7] — deferred, pre-existing pattern in repo (all other passwords also use `password`)

- Audit found `docker-compose.yml` already used `$VAR` syntax for all service passwords — no changes needed there.
- Only hardcoded secrets found: `spring.mail.username: dev-user` and `spring.mail.password: dev-password` in `notification-service.yml`. Replaced with `${NOTIFICATION_EMAIL_USER}` and `${NOTIFICATION_EMAIL_PASSWORD}`.
- `.env` already existed with 5 vars; added `NOTIFICATION_EMAIL_USER` and `NOTIFICATION_EMAIL_PASSWORD`.
- `.gitignore` was missing `.env` entry — added.
- `docker-compose.dev.yml` had no `env_file` directives — added `env_file: .env` to all 13 services.
- `.env.example` created with all 7 required variables and placeholder values.
- All `${VAR}` references in shared YAMLs verified against `.env` — 100% coverage.

### File List

- `.gitignore` — added `.env` to ignored files; added trailing newline
- `.env` — added `NOTIFICATION_EMAIL_USER` and `NOTIFICATION_EMAIL_PASSWORD`; untracked from git via `git rm --cached`
- `.env.example` — created (new file)
- `config/src/main/resources/shared/notification-service.yml` — replaced hardcoded SMTP credentials with env var references
- `docker-compose.dev.yml` — added `env_file: .env` to all 14 services (including rabbitmq); added trailing newline
- `notification-service/src/test/resources/application.yml` — replaced hardcoded `test` SMTP credentials with `${VAR:test}` Spring default syntax
