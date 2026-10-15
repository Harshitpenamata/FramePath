# WhatsApp updates: setup

FramePath sends WhatsApp updates through **Meta's WhatsApp Cloud API**, directly, with no provider in between. Until the settings below are in place, it runs in **test mode**: every message is worked out and logged (see `/admin` → WhatsApp, with the full text), but nothing is sent.

## 1. Before you start
- **The domain:** your own domain (ideally the FramePath one) with a matching business email. Meta checks the business and the display name against your website.
- **A dedicated phone number you'll keep for years.**
  - It must be able to receive a verification SMS or call.
  - It can't be in use on the regular WhatsApp or WhatsApp Business app.
  - Don't use a personal number.
  - Changing it later means a new contact for every learner, re-approval of the display name, and starting over on quality rating and limits.

## 2. Meta setup (about an hour, plus approval time)
1. **Meta Business account:** at business.facebook.com, create or choose the business.
2. **Developer app:** at developers.facebook.com, go to **My Apps → Create app** (type: Business), then add the **WhatsApp** product.
3. **Phone number:** in WhatsApp → API Setup, add the FramePath number and verify it. Note the **Phone number ID**.
4. **Display name:** set it to **FramePath** and wait for approval.
5. **Payment method:** add it to the WhatsApp Business Account.
6. **Permanent token:** in Business Settings → Users → **System users**, add a system user, give it the app and the WhatsApp account, and generate a token with `whatsapp_business_messaging` and `whatsapp_business_management`. This is `WHATSAPP_TOKEN`.
7. **App secret:** in the app's Settings → Basic, copy the **App secret**. This is `WHATSAPP_APP_SECRET`.
8. **Business verification** is optional to start. Without it you can message up to 250 different people a day.

## 3. Templates to submit
In WhatsApp Manager → Message templates, create these. All five are **Utility**, in **English** (`en`). The names must match exactly. Body variables are numbered; Meta asks for sample values, given below.

| Name | Body | Sample values |
|---|---|---|
| `fp_optin_confirm` | Hi {{1}}, you’ll now get FramePath updates here on WhatsApp: {{2}}. Reply STOP at any time to turn them off. | Asha · reviews, deadline reminders, a weekly summary |
| `fp_review_ready` | Hi {{1}}, your AI review for {{2}} is ready ({{3}}). See what worked and what to try next: {{4}} | Asha · B04 · Use your camera well · 72/100 · https://framepath.example/explore/video-beginner/3?tab=feedback |
| `fp_deadline` | Hi {{1}}, a reminder from your FramePath plan: {{2}} is due on {{3}}. You’ve finished {{4}} of {{5}} modules. Continue here: {{6}} | Asha · B05 · Frame your shots · Friday, 23 Oct · 4 · 14 · https://framepath.example/workspace/… |
| `fp_weekly` | Hi {{1}}, your FramePath week in {{2}}: {{3}} handed in this week, {{4}} of {{5}} modules done. Next up: {{6}}. Keep going: {{7}} | Asha · Videography · Wedding · 2 tasks · 5 · 14 · B06 · Work with the light you have · https://framepath.example/workspace/… |
| `fp_inactive` | Hi {{1}}, it’s been {{2}} days since you last worked on {{3}}. Your next step: {{4}}. Pick up where you left off: {{5}} | Asha · 8 · Videography · Wedding · B06 · Work with the light you have · https://framepath.example/workspace/… |

**The wording lives in code:** the same text is in `app/whatsapp.ts` (`templates`). If Meta asks for changes, update both. Meta may re-classify `fp_inactive` as Marketing (about ₹1.02 a message instead of ₹0.14). If it does, either accept that or turn nudges off.

## 4. Settings on the worker
Run each of these in the FramePath folder, and paste the value when asked:
```
npx wrangler secret put WHATSAPP_TOKEN --name framepath-staging
npx wrangler secret put WHATSAPP_PHONE_ID --name framepath-staging
npx wrangler secret put WHATSAPP_APP_SECRET --name framepath-staging
npx wrangler secret put WHATSAPP_VERIFY_TOKEN --name framepath-staging
npx wrangler secret put WHATSAPP_MODE --name framepath-staging
```
- `WHATSAPP_VERIFY_TOKEN`: any long random text you make up. You'll paste the same text into Meta in step 5.
- `WHATSAPP_MODE`: `live` switches sending on. Anything else keeps test mode.
- **Optional:**
  - `WHATSAPP_API_VERSION`: default `v23.0`. Set it to the newest version Meta lists.
  - `WHATSAPP_DAILY_LIMIT`: messages a day across FramePath, default 300.
  - `WHATSAPP_TEMPLATE_LANG`: default `en`.

## 5. Webhook (delivery status and STOP)
- **Allow Meta through Cloudflare Access:** staging sits behind Access, so Meta can't reach the webhook until you let it through. In Cloudflare Zero Trust → Access → Applications, add a **Bypass** policy for the path `/api/whatsapp/webhook`. Requests are still checked: every POST must carry Meta's signature, made with your app secret.
- **Point Meta at the webhook:** in the app's WhatsApp → Configuration → Webhook, set:
  - Callback URL: `https://<your domain>/api/whatsapp/webhook`
  - Verify token: the same text as `WHATSAPP_VERIFY_TOKEN`
- **Subscribe** to the **messages** field.

## 6. Check it
1. In FramePath, go to My account → WhatsApp updates. Add your number, tick the box, Save. You get the confirmation message.
2. Click **Send a test message**.
3. On `/admin` → WhatsApp, the badge reads **Live**, and the messages show `sent`, then `delivered` and `read`.
4. Reply **STOP** in WhatsApp. On My account, updates show as turned off.

## What learners get
| Update | When |
|---|---|
| Review ready | When an AI review finishes (held until morning during quiet hours) |
| Deadline reminder | 2 days before the next module in their open plan is due (once per module) |
| Weekly summary | Sundays between 10 and 11 am, India time |
| Nudge | After 7 days with no activity (at most once a fortnight) |

**The limits:**
- learners choose which updates they get, and their quiet hours (default 9 pm to 8 am)
- at most 3 messages a learner a day
- a FramePath-wide daily limit
- **STOP** turns everything off

## Cost
Utility messages in India are about **₹0.115 + 18% GST ≈ ₹0.14** each (Meta's 2026 rate). That's roughly ₹2 a month for an active learner. `/admin` shows the last 30 days.
