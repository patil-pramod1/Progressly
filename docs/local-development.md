# Local development

1. Install Java 21, Maven, Node.js, npm, Docker Desktop, and Git.
2. Copy `.env.example` to `.env`.
3. Run `.\scripts\start-local.ps1` from the repository root. The script starts infrastructure, builds services, launches all services and the frontend, then prints readiness status.
4. Visit `http://localhost:5173` and check the gateway and discovery consoles.

For manual startup or debugging, run `docker compose up -d`, then start each service with `mvn spring-boot:run` from its directory, followed by `npm install; npm run dev` in `frontend`. Use `.\scripts\stop-local.ps1` to stop the complete environment.

Each service uses its own Spring application and port. Database migrations and service-specific infrastructure configuration will be added with the corresponding domain service phase.
