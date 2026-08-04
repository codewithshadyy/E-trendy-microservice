# Auth Service

Authentication and authorization microservice for the e-commerce platform.
Owns identity, JWT access tokens, rotating refresh tokens, RBAC, email
verification, and password reset — and nothing else. No other service is
permitted to query this service's database directly.

## Responsibilities

- Register / Login / Logout
- Access tokens (short-lived JWT) + Refresh tokens (rotating, hashed, family-based reuse detection)
- Role-based access control: `customer`, `seller`, `admin`
- Email verification and password reset flows
- Publishes domain events to RabbitMQ: `auth.user_registered`, `auth.password_reset_requested`

## Architecture

```
Controller  → thin, HTTP only (parses req, calls service, shapes response)
Service     → business rules (password checks, token rotation, event publishing)
Repository  → all SQL, isolated so services never touch `pg` directly
```

Refresh tokens are **opaque random strings**, not JWTs — only their SHA-256
hash is stored. They rotate on every use and belong to a "family": if a
token is presented after it's already been rotated, that's treated as
theft and the entire family is revoked, forcing re-login.

Database-per-service is enforced: this service owns `users`,
`refresh_tokens`, `email_verifications`, `password_resets` in its own
Postgres instance. Other services get user identity via the JWT claims
(`sub`, `email`, `role`), not by querying this database.

## Local development

```bash
cp .env.example .env        # fill in real secrets before running
docker compose up --build   # starts auth-service + its own Postgres + RabbitMQ
npm run migrate              # applies migrations/*.sql (run once, or after adding new migrations)
```

Service listens on `http://localhost:4001`. Swagger UI at `/docs`. Health
checks at `/health/live` and `/health/ready`.

## Running tests

```bash
npm run test:unit          # no external dependencies — safe to run anytime
npm run test:integration   # requires a running Postgres + RabbitMQ (see below)
```

For integration tests, point `.env` at a **separate test database**
(never the dev one — tests insert and delete real rows), run
`npm run migrate` against it once, then `npm run test:integration`.

## Environment variables

See `.env.example` for the full list. Notable ones:

- `JWT_ACCESS_SECRET` — must be a long random string, rotated periodically in production via a secrets manager, never committed
- `JWT_REFRESH_EXPIRES_IN_DAYS` — refresh token lifetime (default 30)
- `BCRYPT_SALT_ROUNDS` — cost factor for password hashing (default 12)
- `RABBITMQ_EXCHANGE` — shared topic exchange all services publish/consume on

## Events published

| Routing key                     | Payload                          | Consumed by            |
|----------------------------------|-----------------------------------|-------------------------|
| `auth.user_registered`           | `{ userId, email, role }`         | Notification Service    |
| `auth.password_reset_requested`  | `{ userId, email, resetToken }`   | Notification Service    |

## Deployment notes

- Container runs as a non-root user; healthcheck baked into the image for Docker/Kubernetes probes.
- `/health/live` is a liveness probe (process up); `/health/ready` is a readiness probe (DB reachable) — wire these separately in the Kubernetes Deployment so a slow DB doesn't cause unnecessary pod restarts.
- Secrets (`JWT_ACCESS_SECRET`, `DB_PASSWORD`, `RABBITMQ_URL`) belong in a Kubernetes `Secret`, not a `ConfigMap`.