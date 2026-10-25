# Telegram Roster Autofill

Missing-roster reminders at 24 hours and 1 hour before a tour now include
"Автозаполнение состава" and a link to select players manually.
The same action is available in the bot's registered-user keyboard and /autofill.
Existing users can refresh their keyboard by sending /start.

Autofill requires an explicit click for each tour. It is NOT an opt-in to future
unattended participation. The click selects and saves a complete roster; an
existing unconfirmed selection is replaced, as explained in the reminder.
Confirmed rosters are never replaced by this action.

## Selection

Only available players whose club has matches in the selected tour are eligible.
The roster contains 3 forwards, 2 defenders and 1 goalkeeper, within 90k and
with at most 4 players per club. Current server-side prices are used.

The existing roster optimizer finds a minimum-cost legal starting lineup.
Bounded single-player upgrades improve its forecast using the existing price
review's recent-five, recent-ten and season performance model. This is a
heuristic, not a promise of the globally strongest team or future results.
Without history, the minimum-cost legal roster is still available.
If no legal roster is possible, nothing is saved or deleted.

## Safety And Scheduling

Callbacks bind the tour ID, not a user ID. Only registered active users in
their own private Telegram chat may use the action. Old/expired tour buttons
cannot silently save a roster for a different tour.

Deadline, existing roster, registration and current prices are rechecked before
saving. Saving shares the price-update lock with manual submissions; JSON and
PostgreSQL also check the deadline at persistence. Repeated clicks keep the
first confirmed roster. Price changes after autofill follow normal repricing.

The VPS server runs a lightweight reminder scheduler once per minute. It shares
the notification-worker lock and sent receipts with the existing notification
command, so the same reminder is not normally sent twice. Normal batch/rate
limits apply. Telegram delivery is not a transactional exactly-once guarantee.
Forecast data is cached, and the existing bounded heavy-task queue limits work.

## Verification

`npm run test:autofill` is also included in `npm run check`.
Tests cover legal and impossible rosters, missing history, ownership, deadlines,
current prices, repeated/concurrent clicks, reminders and actual local HTTP
webhook routing. Telegram is mocked; no production accounts receive messages.
Live PostgreSQL and real Telegram delivery still require deployment verification.
