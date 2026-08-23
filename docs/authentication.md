# Authentication

Phase 2 authentication is implemented in `services/identity-service`.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Create a USER account and issue tokens |
| POST | `/api/v1/auth/login` | Authenticate with email and password |
| POST | `/api/v1/auth/refresh` | Rotate a refresh token and issue new tokens |
| POST | `/api/v1/auth/logout` | Revoke a refresh token |
| GET | `/api/v1/auth/me` | Return the authenticated user |

Passwords are stored as BCrypt hashes. Access tokens are short-lived JWTs containing the user ID, email, and role. Refresh tokens are random opaque values; only their SHA-256 hashes are stored in PostgreSQL, and rotation revokes the previous token.

The backend derives the authenticated user from the JWT subject. Later resource services must use the same subject/role claims and must not trust a user ID from request input for ownership decisions.

## Local verification

Start PostgreSQL and the identity service, then register:

```powershell
$body = @{ email = 'user@example.com'; displayName = 'Test User'; password = 'password123' } | ConvertTo-Json
Invoke-RestMethod http://localhost:8081/api/v1/auth/register -Method Post -ContentType 'application/json' -Body $body
```

Use the returned `accessToken` as `Authorization: Bearer <token>` when calling `/api/v1/auth/me`. The default local database settings come from `.env.example`; production must provide a strong `JWT_SECRET` through a secret manager.
