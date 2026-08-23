# Redis

Redis is available locally but is not a mandatory dependency for the Phase 1 health path. Planned uses are dashboard caching, rate limiting, and short-lived import/reset state. Each cache will have an explicit TTL and invalidation strategy; a Redis outage should degrade optional features rather than prevent core CRUD where possible.

