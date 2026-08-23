# Troubleshooting

- If a port is busy, change the corresponding port in `.env` and restart Compose.
- If PostgreSQL is unhealthy, inspect `docker compose logs postgres` and verify the credentials in `.env`.
- If the frontend cannot reach the API, verify the backend is on port 8080 and `VITE_API_BASE_URL` points to `/api/v1`.
- If Java or Maven is not found, install a JDK 21 distribution and Maven, then open a new terminal.
- If Kafka takes time to start, wait for `docker compose ps` to show it healthy before testing event features.

