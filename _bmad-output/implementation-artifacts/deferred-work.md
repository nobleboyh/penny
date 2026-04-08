# Deferred Work

## Deferred from: code review of 1-1-secrets-migration-environment-configuration (2026-04-07)

- `.env` contains `dev-password` as SMTP placeholder value — weak but acceptable for local dev. All other passwords in `.env` also use `password` as placeholder. Consider documenting in `.env.example` that production values must be strong. Pre-existing pattern, not introduced by this story.

## Deferred from: code review of 1-2-auth-service-security-hardening (2026-04-08)

- Redis has no password config — `spring.redis.password` absent in `auth-service.yml`. Acceptable for local dev but a production hardening gap. Should be addressed before production deployment.
- Port 6379 conflict risk — `docker-compose.dev.yml` exposes `6379:6379` with no warning. If a local Redis is already running, startup will fail with a port bind error.
