# Database plan

PostgreSQL is the source of truth. UUID identifiers, foreign keys, indexes for ownership/date queries, unique constraints for user-scoped names where appropriate, and audit timestamps will be used. Planned tables include users, roles, user_roles, goals, milestones, tasks, task_recurrence, habits, habit_logs, progress_records, reminders, notifications, achievements, user_achievements, journal_entries, reports, audit_logs, refresh_tokens, and categories.

Schema migrations will be introduced before the first persistent feature. Hibernate schema validation will be used in local and production profiles; migrations, rather than automatic destructive DDL, will own schema changes.

