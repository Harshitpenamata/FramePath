# WhatsApp updates (test mode until Meta is set up)

Branch: `feat/whatsapp` (based on `main`)

## Summary
Learners can get WhatsApp updates about their learning. This uses **Meta's WhatsApp Cloud API directly**, which is the cheapest route: about ₹0.14 a message, with no provider fees.

It ships in **test mode**: every message is worked out and logged with its full text on `/admin`, but nothing is sent until the Meta settings are added. **`docs/whatsapp-setup.md`** walks through the Meta setup, the five templates to submit (with sample values), the settings, and the webhook.

> **Needs:** database migration `drizzle/0006`.

## What learners see
**My account → WhatsApp updates:**
- their WhatsApp number (a 10-digit number is taken as Indian, +91)
- the name to use in messages
- which updates they want:
  - when an AI review is ready
  - two days before a module is due
  - a weekly summary on Sunday morning
  - a nudge after a week away
- quiet hours (default 9 pm to 8 am)
- a clear opt-in box: *"Send me FramePath updates on WhatsApp at this number. I can reply STOP at any time."*

After opting in they get a confirmation message, and can send themselves a test message (3 a day). Replying **STOP** to any message turns everything off; the page then says so.

## The messages
All five are Utility templates:

| Template | When |
|---|---|
| `fp_optin_confirm` | after opting in (once per number), and for test messages |
| `fp_review_ready` | when an AI review finishes, held until morning during quiet hours |
| `fp_deadline` | 2 days before the next module in the open plan is due, once per module and date |
| `fp_weekly` | Sundays 10–11 am, India time |
| `fp_inactive` | after 7 days with no activity, at most once a fortnight |

**Limits:**
- nothing is sent during quiet hours
- at most 3 messages a learner a day
- a FramePath-wide daily limit (`WHATSAPP_DAILY_LIMIT`, default 300)
- every reminder carries a key, so it's never sent twice

**Due dates** come from each plan: its modules in order, at its weekly hours, from its start date (`moduleDueDates`).

## Admin (`/admin` → WhatsApp)
- whether sending is in test mode or live
- how many learners have opted in
- this week's messages by template and status
- the 25 most recent messages, with their full text and any error
- the estimated cost for the last 30 days

## Safety
- **The webhook** (`/api/whatsapp/webhook`) checks Meta's `X-Hub-Signature-256` on every POST, using the app secret, and refuses unsigned or wrongly signed requests. The GET verification needs `WHATSAPP_VERIFY_TOKEN`.
- **Delivery status** updates each message (sent, delivered, read, failed). STOP, unsubscribe and cancel turn the learner's updates off.
- **Deleting an account** also deletes its message log.

## Code
- `app/whatsapp.ts` (new):
  - the templates, phone number cleanup and quiet hours
  - the limits and test mode
  - sending through the Cloud API, and logging each message with its estimated cost
- `app/whatsapp-jobs.ts` (new): deadlines, the weekly summary, nudges, and messages held for quiet hours. Runs in the hourly job (`app/jobs.ts`).
- `app/api/whatsapp/route.ts` (new): the confirmation after opting in, and test messages.
- `app/api/whatsapp/webhook/route.ts` (new): delivery status and STOP.
- `app/api/state/route.ts`: `whatsapp_save`.
- `app/api/review/route.ts`: the review-ready message.
- `app/videography/programme.ts`: `moduleDueDates`.
- `app/other-pages.tsx`: `WhatsAppSettings`.
- `app/api/admin/console/route.ts` and `app/admin-page.tsx`: the WhatsApp admin section.
- `app/api/account/delete/route.ts`: deletes the learner's messages.
- `vite.config.ts`: `SITE_URL` per environment, for links in messages.
- `db/schema.ts` and `drizzle/0006`: the `wa_messages` table.
- `docs/whatsapp-setup.md` (new).

## Testing
End-to-end on a local server, in test mode, 22 checks, all passing:
- **Settings and opt-in:**
  - opting in needs a valid number; a 10-digit number is saved as +91
  - the confirmation is logged, not sent, and only once per number
  - 3 test messages a day, and the 4th is refused (the confirmation doesn't count)
  - the per-learner limit of 3 a day holds
- **Messages:**
  - a review-ready message is logged with the module and result
  - the hourly job sends a deadline reminder for a module due in 2 days, but not for one due in 4 days, and doesn't repeat it
  - an active learner gets no nudge
- **Admin:** admins see test mode and the messages; learners can't.
- **Webhook:**
  - the verification echoes the challenge, and a wrong token is refused
  - an unsigned webhook is refused
  - a signed STOP turns the learner's updates off, and nothing goes out afterwards

Also checked: a learner inactive for 8 days gets the nudge (*"Hi Meera, it's been 8 days since you last worked on Videography · Wedding…"*), and it isn't repeated on the next run.

`node --test`: 101 passing. `npm run build`: all budgets pass.

## Not yet tested
Real sending through Meta. That needs the Meta account, number and approved templates (`docs/whatsapp-setup.md`). The weekly summary is time-based (Sunday 10–11 am) and was checked in code, not in a run.
