# Deferred Work

## Deferred from: code review of 1-1-secrets-migration-environment-configuration (2026-04-07)

- `.env` contains `dev-password` as SMTP placeholder value — weak but acceptable for local dev. All other passwords in `.env` also use `password` as placeholder. Consider documenting in `.env.example` that production values must be strong. Pre-existing pattern, not introduced by this story.
