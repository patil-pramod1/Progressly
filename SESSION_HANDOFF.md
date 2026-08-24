# Progressly Session Handoff

Date: 2026-08-24

## Next-session objective

Continue local Progressly development. Do not deploy to the server yet. First connect to the local frontend with the browser/Playwright tooling and inspect the rendered UI at desktop, tablet, and mobile sizes.

## Project location

```text
C:\git repo\Progressly
```

Frontend:

```text
C:\git repo\Progressly\frontend
```

Local frontend URL:

```text
http://localhost:5173
```

## Current architecture

- React + TypeScript + Vite frontend.
- Spring Boot services behind the API gateway.
- PostgreSQL, Redis, Kafka, Mailpit, and Prometheus are configured locally with Docker/Podman Compose.
- Existing service ports:
  - Eureka: `8761`
  - Gateway: `8080`
  - Identity: `8081`
  - Goal: `8082`
  - Activity: `8083`
  - Reporting: `8084`
  - Notification: `8085`
  - Frontend: `5173`
  - Mailpit: `8025`
  - Prometheus: `9090` when running

## Implemented backend features

- Registration, login, JWT access token, refresh token, roles, and ownership checks.
- Goal CRUD and milestones.
- Task CRUD, task completion, and task deletion endpoint.
- Habits and habit logs.
- Gateway CORS and local direct routes for auth, goals, tasks, and habits.
- Global JSON exception handling in the main services.
- Swagger/OpenAPI dependencies and configuration in the services.
- Actuator and Micrometer Prometheus dependencies/configuration.
- Prometheus Compose configuration exists, but Prometheus runtime and gateway metrics still need verification.
- Grafana has not been implemented yet.

## Implemented frontend features

- Login and registration screens.
- Dashboard with goals, tasks, habits, metrics, progress ring, and responsive layout.
- Goal, task, and habit creation.
- Task completion and task deletion with confirmation.
- Separate navigation views for goals, tasks, and habits.
- Separate Monthly Tracker page in the sidebar.
- Monthly checkbox grid backed by `/habits/{id}/logs`.
- Tracker date keys use local calendar dates to avoid timezone shifts.
- Tracker cells are editable only for today; past and future cells are disabled.
- Tracker sticky header and activity column.
- Separate Settings page with tabs:
  - User
  - Personalization
  - Notifications
  - Preferences
  - Security
- Personalization Save and Cancel behavior.
- Light, dark, and system themes.
- Accent palettes for green, blue, purple, orange, and rose.
- Density, animation, completion-effect, and emoji preferences.
- Top-center toast notifications.
- Back button for non-home views.

## Important current frontend implementation detail

The frontend currently uses `frontend/src/main.tsx` for much of the UI and injects several CSS strings dynamically. This was done incrementally and should now be cleaned up after visual inspection. Avoid blindly adding more CSS strings. Prefer moving the design tokens and page/layout rules into a centralized stylesheet or reusable components.

## Known issues to inspect first

1. Browser visual inspection has not worked in the previous session. The browser tool repeatedly returned `No browser is available` even after Playwright installation.
2. Verify whether the Playwright/browser MCP is actually exposed in the new session before making UI changes.
3. Inspect whether the sidebar remains visible on Monthly Tracker and Settings pages.
4. Inspect Back button placement on desktop and mobile.
5. Verify tracker checkboxes visually and functionally:
   - Today is enabled.
   - Past/future dates are visibly locked.
   - Clicking today persists the correct local date.
6. Verify Settings Save/Cancel behavior.
7. Verify dark + blue uses blue shades only and does not show old green values.
8. Check overflow, clipped cards, mobile layout, sticky tracker columns, and toast position.
9. Check whether the separate Settings root and old hidden PersonalizationPanel should be consolidated.
10. Check for encoding artifacts such as `âœ“`, `â€¦`, and `â†’` visible in the UI.

## Verification commands

From the frontend directory:

```powershell
cd 'C:\git repo\Progressly\frontend'
npm.cmd test -- --run
npm.cmd run build
```

If Vite reports Windows `spawn EPERM`, rerun the command with the local process permission available in the environment. This has previously been a sandbox/process-spawn issue, not a TypeScript error.

## Browser/Playwright instruction for the next session

Use the available browser skill and inspect the live application. Do not claim visual verification unless a browser screenshot or rendered DOM inspection succeeds.

If the browser tool is available, inspect:

```text
http://localhost:5173
```

Use a test account or the existing authenticated browser session. Do not inspect cookies, passwords, or unrelated browser storage.

## Ready-to-paste prompt for the next session

```text
Open C:\git repo\Progressly\SESSION_HANDOFF.md and continue from that context.

The immediate priority is visual QA of the local Progressly frontend, not deployment.

1. Connect to the local browser/Playwright tooling and verify that a browser is actually available.
2. Open http://localhost:5173.
3. Inspect screenshots/rendered DOM at desktop, tablet, and mobile sizes.
4. Test Home, Goals, Tasks, Habits, Monthly Tracker, and Settings.
5. Verify the Monthly Tracker checkbox behavior and local-date locking.
6. Verify task deletion.
7. Verify Settings tabs, Save/Cancel, theme switching, dark+blue color consistency, and Back buttons.
8. Fix the layout/CSS issues found in the rendered UI.
9. Clean up the duplicated/injected CSS architecture where practical.
10. Run frontend tests and production build.

Do not move to Grafana or deployment until the frontend visual QA is complete and stable. Be explicit about anything that remains unimplemented.
```

## Next infrastructure phase after UI QA

1. Fix and verify `/actuator/prometheus` on the gateway and services.
2. Start and verify Prometheus at `http://localhost:9090`.
3. Add Grafana to Docker Compose.
4. Configure the Prometheus datasource.
5. Add basic JVM, HTTP, database, Kafka, Redis, and service-health dashboards.
6. Update monitoring documentation.
