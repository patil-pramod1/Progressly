# Security

Passwords will be BCrypt-hashed, tokens will be short-lived and rotated, and resource ownership will always derive from Spring Security's authenticated principal rather than a frontend-supplied user ID. Validation, CORS, secure headers, rate limiting, account activation, global errors, and audit logging are part of the authentication/security phase.

Never commit `.env`, credentials, JWT secrets, refresh tokens, passwords, or unnecessary personal data in logs.

