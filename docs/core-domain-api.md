# Core domain API

The first core domain slice is available behind authenticated service endpoints.

## Goals and milestones

`goal-service` exposes:

- `POST/GET /api/v1/goals`
- `GET/PUT/DELETE /api/v1/goals/{id}`
- `POST /api/v1/goals/{id}/progress`
- `POST/GET /api/v1/goals/{id}/milestones`
- `PUT/PATCH/DELETE /api/v1/goals/{id}/milestones/{milestoneId}`

The authenticated JWT subject is the owner ID. Repository lookups include that owner ID, so a user cannot access another user's goal or milestone by changing a path ID.

## Tasks

`activity-service` exposes:

- `POST/GET /api/v1/tasks`
- `GET/PUT/DELETE /api/v1/tasks/{id}`
- `PATCH /api/v1/tasks/{id}/status`

Tasks support due date/time, priority, categories, estimated/actual duration, goal/milestone associations, status, and recurrence metadata. Recurring-instance generation is a later scheduler slice; storing recurrence configuration does not silently create duplicate instances.

All endpoints require `Authorization: Bearer <access-token>`.
