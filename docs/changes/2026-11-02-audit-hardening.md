# Smaller audit fixes and hardening

The rest of the security audit's list: three small issues and five protections.

**Audit fixes**
- **Reviews already running count against the daily budget.** Each review still in progress holds back $0.10, so a burst of reviews can't go far past the cap.
- **A slow review can't become a third review.** A review given up on after 10 minutes is only saved if the learner is still under the module's limit. Otherwise they're told a newer review is on its way.
- **Drafts belong to one account.** An unsent hand-in is now saved per account, so the next person on a shared computer never sees it. Older drafts saved without an account are cleared.

**Hardening**
- **Browser safety headers on every page:** no showing Framepath inside another site, HTTPS only, no guessing file types, minimal referrer.
- **Sign out on all devices:** a new button on the account page. Account deletion also signs the learner out everywhere.
- **Only a real session signs a learner in.** New sessions say what they are. Any signed token without a user id (the sign-in step, unsubscribe links) is refused. Existing sessions keep working.
- **Unexpected errors show a plain message.** Database, network and code errors say "Something went wrong" and are logged; messages written for learners still show.
- **Account deletion removes everything.** It now also deletes support replies, tracker events, review ratings, email history and email opt-outs.

Tests: `tests/hardening.test.mjs`.

Files: `app/api/review/route.ts`, `app/videography/lesson.tsx`, `build/sites-worker.ts`, `app/session.ts`, `app/auth/signout/route.ts`, `app/other-pages.tsx`, `app/service.ts`, `app/api/account/delete/route.ts`, `tests/hardening.test.mjs`, `tests/workers-env-stub.cjs`.
