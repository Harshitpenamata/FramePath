# Framepath videography pilot

A responsive full-stack prototype of the Framepath v3 learning model.

## Included
- Goal-first homepage, three complete Explore paths and a 12-week Craft curriculum.
- Explore: INR 999 / calendar year, all published paths, shared annual allowance.
- Craft: separate INR 30,000 simulated enrolment and an explicit mentor selection journey.
- Diagnostic, consent, mentor request, 48-hour reservation, simulated checkout, draft plan and mentor approval.
- Saved assignments, uploads, rubric reviews, revisions, private conversation, check-ins and calendar reminders.
- Private portfolios with explicit public publishing / unpublishing.
- OpenAI Responses integration for questions, pathway adaptation and first-pass text/still feedback.

## Prototype boundaries
- Payments, Maya / Arjun mentor personas, calls and mentor actions are explicitly simulated.
- The mentor room is a per-user sandbox. It is not a multi-user production mentor administration system.
- No WhatsApp messages or external meeting invitations are sent.
- AI cannot watch videos or fetch viewing links. Uploaded video remains playable / downloadable for human review.
- The API account returned credit_balance_exhausted during verification. Failure handling and quota refund were verified; successful AI output remains pending owner funding.
- The configured API key was created with a seven-day lifetime. Rotate the hosted secret before expiry to continue AI service.
- Pricing is illustrative pilot pricing. Simulated receipts are not payment evidence or tax invoices.

## Runtime
Vinext / React, Cloudflare Worker, D1 DB and R2 BUCKET.
Platform-owned Sign in with ChatGPT provides identity. No app-owned password or OAuth system is implemented.
The public catalogue is anonymous-accessible; persistent learner actions require sign-in.
Production secrets are stored using Sites runtime secrets, not browser code.
OPENAI_API_KEY is required for AI, OPENAI_MODEL defaults to gpt-4.1-mini.
The local .env.local is ignored and must never be committed or copied into a deliverable.

## Data
db/schema.ts defines learners, uploads, ai_jobs and public portfolios.
Learner changes use optimistic revision checks. Public sharing writes and state changes are batched atomically.
Prepared statements scope private data to the authenticated user.
Migrations are generated with Drizzle and applied by Sites before deployment.
Keep published migrations immutable; append later schema changes.
R2 stores upload bytes; D1 stores ownership and file metadata.
Uploads: images <=5 MB, videos <=25 MB, <=100 MB per learner. Larger videos use HTTPS viewing links.

## AI allowances
Explore year: 12 adaptations, 120 questions, 12 feedback checks across all Explore paths.
Craft course: 12 adaptations, 120 questions, 24 feedback checks over the course period.
Requests are reserved atomically; failed requests are released.
Eight attempts per learner per hour; 100 successful/pending AI requests across the site per day.
Input is bounded, output is capped, timeouts are enforced, secrets stay server-side.
AI guidance is labelled and never treated as a mentor assessment.

## Development
Use the Sites portable project lifecycle. Dependencies require Node >=22.13.
npm run dev starts a loopback preview with platform-provided development sign-in.
npm run db:generate creates migrations after a schema change.
npm run build produces the Worker, client assets and hosting manifest.
Local D1 migrations use .wrangler/state; these local test records are not published.
The workstation required the bundled Node runtime and an ignored local npm shim; the project source remains portable.

## Validation
End-to-end browser checks cover learner and mentor journeys, persistence, public sharing, private media, invalid requests, concurrency, AI error handling, mobile navigation and responsive layouts.
Desktop: 1440 px. Mobile: 390 px, plus selected 360 px / 200-percent text checks.
TypeScript type check and production build are required before publication.
Browser WebMCP tools are feature-detected; no supported test-browser implementation was available.
Real payment processing, real mentors, WhatsApp delivery and successful funded AI output were not verified because they are outside the active prototype services.

## Publishing
The Sites project_id is stored in .openai/hosting.json.
Use the Sites workflow to build, push the exact source state, package, save a version and deploy it.
Never add credentials to command arguments, tracked files or source archives.
