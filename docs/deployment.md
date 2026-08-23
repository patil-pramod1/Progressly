# Deployment

Deployment is intentionally deferred until the application has authentication and core features. The planned free-tier-oriented topology is Vercel for the frontend, Render for the backend, managed PostgreSQL/Redis/Kafka providers, and Grafana Cloud. Provider limits and availability must be checked immediately before deployment because free tiers change.

The deployment phase will document repository creation, managed service provisioning, secret configuration, backend CORS, frontend API URL, SMTP, health checks, monitoring, smoke testing, and optional custom domains. Fallbacks will be documented for every provider dependency.

