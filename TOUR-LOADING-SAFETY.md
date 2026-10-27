# Tour Loading Safety

## Root Causes

A failed calendar request previously returned an empty calendar. HTTP failures
could cache that empty response for one minute. Unknown months were enabled,
while an empty calendar made roster controls show the locked-tour table action.
Separately, monthly roster responses were applied without request-version checks.
A late response could overwrite the roster displayed for a newer selected month.
Roster HTTP failures also looked like a legitimate missing saved roster.

## Behavior

The month selector starts disabled. Calendar errors and invalid payloads reject
loading and are not cached as successful empty calendars. Unknown months remain
disabled. Invalid schedules do not grant editing access on client or server.
Startup failures show a retry screen instead of an interactive default month.
Retry reloads the page, preventing duplicated listeners from partial startup.

During a month change, roster controls immediately become non-editable while
loading. Only the latest response for the current month may update the roster.
A failed load offers retry, which also reloads that month's statistics.
Closed future tours have a disabled action rather than an editable lineup.
Explicit `roster: null` alone means no saved roster; errors never become drafts.
Late save confirmations cannot change a different month's roster or a replaced
roster state after a round trip through the month selector.

No saved rosters or calendar records are migrated or rewritten by this change.
Server-side deadline checks remain authoritative for actual saves.

## Verification

`node server/tour-loading-self-test.js` runs in `npm run check`.
Tests cover calendar failures and caching, unknown months, initial selection,
out-of-order responses, retry, late saves and server-side closed-tour denial.
Playwright exercised the actual application at 390px and 1280px with mocked API
failures and delayed responses, including full-page retry and month-level retry.
These browser tests did not contact production APIs or change real rosters.
