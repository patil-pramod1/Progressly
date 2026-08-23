# Architecture

Progressly is a domain-oriented microservices system. Each service is independently deployable, owns its database boundary, and contains its own controller, application service, repository, DTO, mapper, and validation boundary. Controllers remain thin. Authorization is enforced inside the service using the authenticated principal and resource ownership checks; the gateway is not a security boundary by itself.

## Service boundaries

| Service | Owns | Storage | Important events |
|---|---|---|---|
| API Gateway | Routing, correlation IDs, edge CORS, rate-limit integration | None | None |
| Service Discovery | Local service registration | None | None |
| Identity Service | Registration, login, JWT/refresh tokens, roles, profiles | Identity database | `USER_REGISTERED`, `USER_DEACTIVATED` |
| Goal Service | Goals, milestones, categories, goal progress | Goal database | `GOAL_CREATED`, `GOAL_COMPLETED` |
| Activity Service | Tasks, recurrence, habits, logs, journals, reminders | Activity database | `TASK_COMPLETED`, `HABIT_COMPLETED` |
| Reporting Service | Analytics projections, daily summaries, weekly reports, exports | Reporting database | `REPORT_REQUESTED`, `REPORT_READY` |
| Notification Service | Preferences, email/in-app notifications, delivery retries | Notification database | Consumes notification events |

The Admin capability is an authorization scope implemented across the relevant service APIs and an admin-facing frontend, with audit records emitted to the reporting/audit boundary. It is not a frontend-only privilege.

## Communication rules

- Browser traffic goes through the gateway.
- Synchronous service-to-service calls are limited to request/response needs and use service authentication.
- Kafka is used for durable asynchronous workflows and projections, not basic CRUD.
- Events carry an event ID, aggregate ID, event type, occurred-at timestamp, schema version, and correlation ID.
- Consumers must be idempotent. Failed messages use bounded retries and a dead-letter topic.
- No service directly queries another service's database.

The local runtime is React/Vite → API Gateway → services, with PostgreSQL storage boundaries, Redis, Kafka, Eureka, and Mailpit. Production can replace Eureka with platform/service-mesh discovery when appropriate.
