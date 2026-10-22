# Load Testing

Run `npm run test:load` to simulate 100, 500, 1000 and 2000 registered users.
The default is 50 sessions per level, with at most 8 running concurrently.
Each session opens the menu summary, the first standings page and the roster.

```sh
npm run test:load -- --users 100,500,1000,2000 --concurrency 8 --sessions 50
npm run test:load -- --users 2000 --concurrency 50 --sessions 100 --think-ms 0
npm run test:performance
```

Registered users are the database size, NOT the simultaneous request count.
Concurrency is the maximum number of active sessions; sessions is their total.
Use `--think-ms` to set the pause between requests (default 20 ms).

## Safety

The runner creates a temporary JSON database and a child HTTP server bound only
to 127.0.0.1, on a randomly assigned port. It uses signed synthetic accounts.
No production database, existing roster, Telegram message or scheduled job is used.
External target URLs are deliberately unsupported. Temporary data is removed
on normal completion; the child also shuts down if its parent disconnects.
It still consumes CPU/RAM on the machine where you run it. On a small VPS,
start off-peak with `--users 100 --concurrency 2 --sessions 10`.

## Reading Results

Each level reports requests, successful replies, p50/p95/max latency, response
size, errors, admission-control responses (429/503), peak server RSS, CPU time,
event-loop delay, post-load health status and the number of standings report builds.
`successfulP95Ms` excludes rejections; ordinary percentiles include all replies.
RSS covers the child server, not the load generator or PostgreSQL.
429/503 are reported separately from unexpected errors, not counted as success.
The test's request timeout is 15 seconds. It does not impose a production
latency cutoff or disconnect slow Telegram clients at 1-2 seconds.

Localhost timings exclude internet, Telegram WebView and proxy latency.
JSON-mode results do not establish PostgreSQL capacity or production VPS limits.
Validate real deployments with read-only monitoring and realistic traffic before
increasing limits; do not point a burst generator at the public production app.

## Standings Optimizations

Monthly player points are indexed once per report. Reports are shared for at most
15 seconds, with revision invalidation after roster or statistics updates.
Authorization and current-user selection remain per request.
The menu appears immediately and requests only the current user's rank.
Standings load 50 participants at a time. A new report version resets pagination
to avoid mixing ranks from different snapshots; closing a modal ignores late replies.
