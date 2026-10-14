# Reliability: video health, bigger uploads, watch fallback, AI spend guard

Branch: `feat/reliability` (based on `feat/videography-database`)

## Summary
These are the first four fixes from the "what can break" review, each for a failure that real learners would hit early:
1. Lesson videos that stop working are found and hidden automatically.
2. Real phone videos can be uploaded and watched by the AI.
3. Learners whose browser blocks the player's progress can still finish a lesson.
4. AI spending is capped, and work waits in a queue instead of failing when AI is paused.

> **Needs:** the database migration `drizzle/0004`, and an `ADMIN_EMAILS` secret for the admin page (see *Setup*).

## 1. Lesson video health (hourly)
- **The check:** a Cloudflare cron (`17 * * * *`) checks 30 lesson videos per run, the oldest checks first, so all 204 are covered roughly every 7 hours.
  - **YouTube:** the oEmbed endpoint. 404 means removed, 403 private, 401 embedding turned off.
  - **Vimeo:** oEmbed.
  - **Pages on other sites:** whether they load, and whether they allow being shown inside FramePath.
- **When a video is marked dead:** after **two failed checks in a row** (one can be a blip).
  - It's **hidden from its lessons**.
  - It **no longer counts toward finishing** them, so a learner is never stuck on a removed video once the lesson lock is on.
- **What you see:** the admin page lists dead videos with their lessons, so they can be replaced, plus videos that failed once and are being watched.
- **How the job is protected:** it runs inside the worker. The cron handler calls the app's job route with a one-time token kept in memory, so the route can't be triggered from outside. In local development only, tests can trigger it with a dev header.

## 2. Bigger uploads, and Drive links watched
- **Limits:**
  - videos: **95 MB** (was 25 MB; Cloudflare's request cap is 100 MB)
  - storage: **1 GB per learner** (was 100 MB)
  - the upload timeout for videos is 15 minutes (was 60 seconds)
- **Streaming:** videos stream straight to storage. Only the first bytes are read, to check the file really is that kind of video; a fake "video" is still refused. Reviews stream the file from storage to Gemini, so no large file is held in memory.
- **Shrinking in the browser:** a video over 95 MB gets an offer to **shrink it to 720p on the device** (`app/video-shrink.ts`, loaded only when needed).
  - **How:** it plays the video once, silently, through a canvas and Web Audio, and records it again at a bit rate that fits.
  - **Time:** about as long as the video.
  - **When it can't:** if the video is too long to fit, or the browser can't do it, the learner is told to link it from YouTube or Google Drive instead.
- **Google Drive links** ("Anyone with the link") are now watched by the AI too, streamed from Drive to Gemini, for files up to 1 GB.
- **Consent wording:** the upload consent now says videos are sent to Google's Gemini when AI feedback is asked for, then deleted.

## 3. Watch fallback
If a playing YouTube or Vimeo video sends no progress for 12 seconds (ad blockers, Brave, privacy settings), the lesson says the browser is blocking the player's progress. It then offers **"I've watched it"**. The button becomes active once enough time has passed for most of the video to play: 70% of its length when the player reported it, otherwise 2 minutes.

## 4. AI spend guard and queue
- **Spend tracking:** every Claude and Gemini call records its tokens and estimated cost (`ai_usage`).
  - **Prices, US$ per million tokens:** Opus 5.5 $4 in / $20 out; Gemini 3.5 Flash-Lite $0.30 / $2.50.
  - **Unknown models** use the highest known rate.
- **Daily cap:** `AI_DAILY_BUDGET_USD`, default **$5**, by India date. Each call checks it before it starts.
- **When AI pauses:**
  - **Causes:** the cap is reached, or Anthropic reports **no credit**, which pauses AI for an hour.
  - **Reviews:** they wait in the queue instead of failing. The Feedback tab says *"Your AI review is in the queue… usually within a few hours. You don't need to do anything."*
  - **Comments:** they wait unchecked and appear once Claude has checked them.
  - **The hourly job** runs queued reviews (2 per run) and checks waiting comments (10 per run) once AI is available again.
- **Gemini busy (503 or 429):** the call retries twice, after 4 and then 10 seconds. If it's still busy, the review waits in the queue rather than being reviewed without the video.
- **The admin page** (`/admin`) shows today's spend against the cap, the pause reason, 7 days of spend by provider, and the counts of waiting reviews and comments.

## Database (`drizzle/0004`)
New tables: `video_status`, `ai_usage` and `app_flags`.

## Setup
- **Migration:** `npm run db:migrate:staging`.
- **Admin access:** `npx wrangler secret put ADMIN_EMAILS --name framepath-staging`, then enter the admin email addresses, separated by commas.
- **Optional cap change:** `npx wrangler secret put AI_DAILY_BUDGET_USD --name framepath-staging` (for example `10`).

## Code
- **New:**
  - `app/ai-budget.ts`: spend, cap and pause
  - `app/video-health.ts`: the video checks
  - `app/jobs.ts`: the hourly job
  - `app/api/jobs/run/route.ts`: the job route
  - `app/api/videos/status/route.ts`: dead lesson videos
  - `app/api/admin/health/route.ts` and `app/admin-page.tsx`: the admin page
  - `app/video-shrink.ts`: in-browser shrinking
- **Changed:**
  - `build/sites-worker.ts`: the `scheduled` handler
  - `vite.config.ts`: the cron trigger
  - `app/claude.ts` and `app/gemini.ts`: usage recording, the no-credit pause, Gemini retries and streaming
  - `app/api/review/route.ts`: the queue, Drive links, streaming, waiting when Gemini is busy
  - `app/api/community/route.ts`: waiting comments
  - `app/api/upload/route.ts` and `app/media-safety.ts`: the new limits and streaming
  - `app/ui.tsx`: the upload limits, shrink offer and consent wording
  - `app/videography/lessons.ts`, `module-context.tsx` and `lesson.tsx`: dead videos hidden and not counted; the watch fallback; the queued-review notice
  - `app/videography/portfolio-page.tsx`: the waiting-comment message

## Testing
- `node --test`: 101 passing. New tests cover a dead video not counting toward finishing a lesson.
- **End-to-end on a local server, 16 checks, all passing.**
  - **Phase A, with a tiny budget:**
    - a **44 MB** video uploads, and a fake "video" is refused
    - the first review runs and **Gemini watches the whole 59-second video, streamed from storage**
    - the cap is then reached, and the second review is **queued** (202); Feedback shows 1 waiting
    - a comment waits unchecked and isn't shown
    - the admin page shows AI paused for budget, with 1 review and 1 comment waiting
    - the job checks 30 videos and leaves AI work alone
  - **Phase B, with the budget restored:**
    - the job runs the queued review, which also watches the video, and the waiting comment, which now shows
    - nothing is left waiting, and the spend is recorded
    - 150 of 204 lesson videos checked so far, none dead
- **Browser:**
  - a video marked dead disappears from B01 lesson 1
  - in Chromium the shrink turned a 44 MB video into a **17 MB MP4** in 60 seconds, and the server accepted it
  - at a very tight 12 MB target on a deliberately noisy test clip, the browser's encoder couldn't go low enough. The learner is told so, and the shrink now aims at 75% of the limit for more headroom.
- `npm run build`: all budgets pass. The built worker has the cron trigger and the `scheduled` handler.
- **Found while testing:** Gemini returned a temporary 503 "high demand". That's now handled with retries and the queue.

## Not covered yet
- **Alerts:** there are no email alerts yet; the admin page is where to look. An email service (for example Resend) or Cloudflare Email Routing would be needed for alerts.
- **The account's credit balance:** it isn't read directly. A "no credit" error from Anthropic pauses AI and shows on the admin page.
- **The watch fallback** was checked in code, not in a browser with a real ad blocker.
