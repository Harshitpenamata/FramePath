# Reviews that finish, "Framepath review", My Work by course, pathway highlights, no button flash

## Reviews were being thrown away
A review with many clips takes more than 2 minutes, and a review still "running" after 2 minutes was marked failed whenever the page checked on it, so its result was dropped when it arrived (two B05 reviews on Oct 31). Now a review counts as stopped only after 10 minutes, and a result that arrives after being marked failed is still saved.

## Reflect shows the review on its own
Whenever the latest hand-in has no review and a review is left (and none is queued), Reflect starts it without a click: straight after handing in, or on opening Reflect later. The button stays as a fallback.

## "Framepath review", not "AI review"
Learner-facing wording about reviews now says Framepath (pages, help, membership, the review email, error messages). Kept as they are: the consent and privacy text that names the AI providers (learners must be told where their files go), code comments, and the home hero's "Powered by AI." tagline (a brand decision).

## My Work by course
My Work used to open the plan that was last open. It now starts with one card per course plan (like My courses: tasks handed in, modules done); a card opens that plan's status and module grid (`/portfolio?plan=<id>`). Links from a module still open the right plan and scroll to it.

## Highlights at the top
- Plan page: "You'll be able to: make ..., and ..." under the plan name.
- Module page: "You'll be able to: ..." under the module title, from the module's outcome.

## Home page button
The start button showed "Build my free pathway" and then swapped to "Continue my pathway" once the account loaded. It now uses what this browser saw last time, so the right label shows straight away, and stays hidden until it is known on a first visit.

Files: `app/api/review/route.ts`, `app/api/ai/route.ts`, `app/videography/lesson.tsx`, `lesson.css`, `my-work.tsx`, `studio.css`, `dashboard.tsx`, `dashboard.css`, `start.tsx`, wording in `work-folders.tsx`, `closure.tsx`, `portfolio-page.tsx`, `hero-banners.tsx`, `app/learner-pages.tsx`, `app/pilot-pages.tsx`, `app/other-pages.tsx`, `app/email.ts`.
