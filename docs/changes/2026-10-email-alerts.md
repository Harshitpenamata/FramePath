# Email alerts

Branch: `feat/email-alerts` (based on `main` after PR #37)

## Summary
Framepath now sends email through Resend, for four alerts:

| Alert | Sent to | When |
|---|---|---|
| New ticket | Every `ADMIN_EMAILS` address | A learner reports a problem |
| Reply to your request | The learner | Support saves a reply. Once per distinct reply text, so saving the same reply again sends nothing. |
| Your feedback is ready | The learner | An AI review that was queued (because AI was paused) finishes in the hourly job. A review that finishes while the learner waits on the page sends no email. |
| You're behind | The learner | Their open plan is 2 or more days behind, they haven't been on the site in the last day, and they've had no reminder in the last 4 days. Sent only in the 9am hour, India time. |

- **Look:** a cream card with black text and one lime button, plus a plain-text version.
- **Unsubscribing:** reminders carry an unsubscribe link and mail apps' one-click unsubscribe (`List-Unsubscribe`).
  - Opening the link shows a confirm button, so email scanners that open links don't unsubscribe anyone by accident.
  - Ticket replies still reach a learner who has turned reminders off.

## Setup
- **Secret:** `RESEND_API_KEY` on `framepath` and `framepath-staging` (done).
- **Sender:** optional `EMAIL_FROM`. The default is `Framepath <hello@framepath.ai>`. The framepath.ai domain is verified in Resend.
- **Without a key:** nothing is sent. Each alert is logged with status `skipped`.

## Code
- `app/email.ts`: sending, the email layout, the four alerts, signed unsubscribe links and the reminder run.
- `app/api/email/unsubscribe/route.ts`: the confirm page (GET) and the unsubscribe itself (POST).
- `app/api/support/route.ts`: emails the admins about new tickets.
- `app/api/admin/support/route.ts`: emails the learner about replies.
- `app/jobs.ts`: the "feedback is ready" email after queued reviews, and the reminder run, both in the hourly job.
- `db/schema.ts`, `drizzle/0009_email_alerts.sql`: the database changes.
  - `email_log`: every send, with a unique dedupe key so nothing goes twice.
  - `email_optouts`: learners who have unsubscribed from reminders.

**Run the migration on staging and production before deploying.**

## Testing (local, no key, so emails are logged as `skipped`)
- **Ticket replies:** three saves with two distinct replies logged two emails.
- **Reminders:** run twice with the 9am rule bypassed.
  - The first run checked 19 learners and logged 5 reminders.
  - The second run checked 14, because the 5 just reminded were left out.
- **Unsubscribe:**
  - Opening the link shows the confirm page.
  - A forged token is rejected.
  - A real signed link adds the learner to `email_optouts`.
- The type check passes.
