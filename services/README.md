# Progressly services

This directory contains independently deployable Spring Boot services. Each service has its own Maven module, port, configuration, database boundary, and deployment unit.

Planned local ports:

| Component | Port |
|---|---:|
| API Gateway | 8080 |
| Service Discovery | 8761 |
| Identity Service | 8081 |
| Goal Service | 8082 |
| Activity Service | 8083 |
| Reporting Service | 8084 |
| Notification Service | 8085 |

The services are currently bootstrap applications. Domain controllers, persistence, security, and event consumers will be implemented service-by-service, beginning with Identity Service in Phase 2.
