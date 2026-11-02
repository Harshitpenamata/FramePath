# Spend limits on every paid check, and no stuck review queue

The security audit found five ways one learner could use up the day's AI budget, or stop queued reviews from running for everyone. Each was reproduced locally with fake keys before this fix.

- **Questions and plans (/api/ai)** now check the daily budget and the no-credit pause first, like reviews already did. When paused, the learner sees "Framepath is taking a short break".
- **Photo checks on upload** check the daily budget too. While paused, no photo is stored and the learner is told to try later or hand in a link.
- **Photo checks are limited to 40 an hour per learner**, rejected photos included. Before, a rejected photo gave its space back and left no trace, so it could be repeated without end.
- **Comment checks are limited to 30 a day per learner**, blocked comments included. Before, only posted comments counted.
- **A queued review that can't run** (the hand-in was removed, or the learner is no longer eligible) is now marked failed. Before, it stayed at the front of the queue and the hourly job retried it for ever, so later reviews never ran.

Attempts are counted in the existing tracker table (`events`, name `ai_check`), so no database change is needed. The count isn't atomic: a burst of parallel requests can pass a few over the limit, which is fine for a spend guard.

Files: `app/events.ts` (`limitChecks`), `app/events-shared.ts`, `app/api/ai/route.ts`, `app/media-safety.ts`, `app/api/upload/route.ts`, `app/api/community/route.ts`, `app/api/review/route.ts`.
