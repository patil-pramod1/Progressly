# Docker and local services

`docker-compose.yml` runs PostgreSQL 16, Redis 7, Kafka 3.8 in KRaft mode, and Mailpit. PostgreSQL, Redis, and Kafka have named volumes and health checks. The application itself runs from the host during development for fast feedback.

Docker Desktop is the default container runtime. Podman Desktop is also supported. When Podman is selected, `scripts/start-local.ps1` automatically runs `podman machine init` when the default machine does not exist, runs `podman machine start` when it is stopped, verifies `podman info`, and then starts Compose.

Use `docker compose ps` or `podman compose ps` to inspect service health, the corresponding `compose logs -f postgres` command to inspect PostgreSQL, and `compose down` to stop services. `compose down -v` also removes local persisted data.
