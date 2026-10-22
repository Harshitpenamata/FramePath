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

# Tickets, reworked

**Before:**
- A ticket had one reply box, and each save overwrote the last reply.
- Status was a dropdown support had to remember to change, and the only button was "Save ticket".
- Learners couldn't answer back.
- Saving only a staff note showed the learner a "New reply".

**Now every reply is a message in a thread** (`ticket_messages`). The buttons set the status:

| Action | Who | Status after | Email |
|---|---|---|---|
| Send reply | Support | In progress | Learner: "We replied to your request" |
| Send and resolve | Support | Resolved | Learner: reply and resolved |
| Resolve without reply | Support | Resolved | Learner: "Your request is resolved" |
| Reopen | Support, on resolved tickets | Open | none |
| Save note | Support (staff only, in a fold) | unchanged | none |
| Reply, or "Still a problem? Reply" on a resolved ticket | Learner, in My account | Open (reopens) | Admins: "the learner replied" |

**Learner labels:**
- Open shows as **Sent**.
- In progress shows as **We replied**.
- An unread reply shows as **New reply**.
- A reply is unread when support has posted a message since the learner last looked. Notes no longer count.

**Code:**
- `app/api/admin/support/route.ts`: POST takes `action` (`reply` / `resolve` / `reopen` / `note`), and GET returns each ticket's messages.
- `app/api/support/reply/route.ts`: new. The learner's follow-up, limited to 20 a day.
- `app/api/support/route.ts`, `seen/route.ts` and `app/api/state/route.ts`: the thread and the unread count.
- `app/support.tsx`: `Thread` (shared by admin and learner) and `LearnerReply`.
- `app/admin-page.tsx`: the new ticket actions. The Plan line no longer repeats itself.
- `app/email.ts`: `ticketReplyAlert` (once per message), `ticketResolvedAlert` and `learnerReplyAlert`.
- `drizzle/0010_ticket_messages.sql`: the new table. Existing replies are copied into it as support messages. `support_tickets.reply` is left in place but no longer written.

**Tested locally, end to end:**
1. A reply moves the ticket to in progress and shows as unread.
2. Marking it seen and then saving a note leaves it read.
3. A learner reply moves it to open.
4. Send and resolve moves it to resolved.
5. A learner reply on the resolved ticket reopens it.
6. Resolve without reply moves it to resolved.
7. Reopen moves it to open.
8. An empty reply is refused.
9. A reply on someone else's ticket gets a 404.

Emails were logged as 2 replies and 1 resolved.
