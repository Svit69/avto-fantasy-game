# Future Roster Prices
Changing a price through the administrator bot immediately reconciles saved
rosters in the open, unlocked future tour. Current and past tours are untouched.
All selected players use catalog prices, including price decreases.

If the new total is at most 90k, a confirmed roster remains confirmed.
If it exceeds 90k, its status becomes `editing`; selected slots are retained.
Editing rosters are excluded from standings, results and daily score digests.
They must be saved again before the deadline. A later price decrease does not
automatically confirm a roster already requiring edits.

## Notifications

The server automatically starts the price notification scheduler. It checks once
per minute, reconciles missed updates and sends affected users a plain-text
message listing changed prices, total cost, excess and the deadline in
Asia/Yekaterinburg. The button opens the application with `roster_month` set to
the affected tour, even when the user has a roster in the current tour.

Delivery uses the existing rate limiter, batch size and persistent sent receipts.
Blocked users are excluded. Failed requests are retried in later cycles.
The roster and deadline are checked again immediately before sending, so a
corrected roster or expired tour does not receive a queued obsolete warning.
As with ordinary Telegram messages, a crash between delivery and receipt storage
can cause a duplicate; this is not a transactional exactly-once guarantee.

On the first restart after deployment, existing future rosters are also checked.
Historical prices do not remain grandfathered into an open future tour.
No database schema migration or re-import is required.

## Consistency And Load

Catalog price changes, roster submissions and reconciliation share a renewable
cross-process lock on the VPS. Concurrent saves are additionally protected by
compare-and-swap updates. PostgreSQL updates a batch in one statement; JSON
updates a batch with one atomic file replacement rather than one write per user.
Deadline checks prevent reconciliation from modifying a locked tour.

Submissions use server catalog prices, never client prices or old locked prices.
Over-budget saves return 422; stale displayed prices return 409, with a message
asking the user to reopen the app before resubmitting.

## Verification

Run `npm run test:roster-prices` or `npm run check`.
Tests cover policies, JSON concurrency, PostgreSQL query contracts, real local
HTTP, administrator mutations, Telegram delivery mocks and automatic scheduling.
A local synthetic 2000-roster JSON reconciliation took 245 ms and 58 MiB RSS;
this is not a production VPS benchmark. Live PostgreSQL and real Telegram
delivery were not exercised by these tests.
