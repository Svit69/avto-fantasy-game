# Local Load Test: 2026-10-22

Synthetic JSON storage, 94 players, 31 imported matches. Localhost HTTP only.
These short runs are regression/burst tests, not a sustained capacity certificate.
No production database, PostgreSQL, Telegram or real VPS was load tested.

## Normal Scenario

100, 500, 1000 and 2000 registered users, 50 sessions per level,
8 concurrent sessions: 600 requests, all successful, no admission rejections.

Final repeat with 2000 users, 50 sessions and concurrency 8:

| Request | Successful p95 | Mean response size |
| --- | --- | --- |
| Menu rank | 141 ms | 444 bytes |
| Standings (50 rows) | 51 ms | 21,580 bytes |
| Roster | 99 ms | 384 bytes |

Server peak RSS: 114 MiB. Report builds: 1. Post-load health: HTTP 200.
Earlier unpaged 2000-user response was approximately 770 KB.

## Burst Scenario

2000 registered users, 100 sessions, concurrency 50, no pauses or client retries:
300 requests, 117 successful, 183 admission rejections (429/503),
no unexpected errors. Server peak RSS: 105 MiB; post-load health: HTTP 200.
This verifies protective rejection, NOT successful service of 50 simultaneous
sessions. The production client has its own retry behavior, not simulated here.

## Other Checks

`npm run check` passed, including new performance regression tests.
Playwright smoke checks at 390 and 1280 px passed: immediate menu, no repeated
authorization, loading state, pagination to 100 rows, closing and no overflow.
Bulk point calculations match the existing per-player calculations, including
manual protocol priority, duplicate imports and inter-league participation.
