# Monitoring

Spring Boot Actuator, Micrometer Prometheus registries, and Springdoc OpenAPI are enabled across the bootstrap services. Locally, Prometheus runs at `http://localhost:9090` and scrapes `/actuator/prometheus` on ports 8761 and 8080–8085 every 15 seconds. Each service also exposes Swagger UI at `/swagger-ui.html` and OpenAPI JSON at `/v3/api-docs`.

The launcher sets `PROMETHEUS_HOST=host.docker.internal` for Docker and `PROMETHEUS_HOST=host.containers.internal` for Podman. This is necessary because services run on the Windows host while Prometheus runs inside the container runtime.

Production Grafana Cloud export will be configured later. Secrets and personal data must not appear in logs or metrics.
