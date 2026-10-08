# Framepath consolidated self-paced pilot

Updated 8 October 2026. This release consolidates the reviewed foundation, onboarding and five lesson batches, then finishes the self-paced catalogue using canonical teaching units. Checkout and mentorship remain explicitly simulated.

## Teaching and coverage

- 176 source uses in 18 categories map to 20 need archetypes. Every usable scenario stage resolves to the visual lesson renderer. An empty optional foundation stage is omitted from the learner's route.
- 103 canonical teaching units: the 80 existing Basic, Medium and Advanced skill lessons plus 23 scenario/safety/delivery units. The 37 previously authored lessons remain intact at their stable URLs.
- Each canonical unit has a visual concept, an original 12-second silent demonstration with English caption descriptions and a reading alternative, a relevant interactive comparison, practical task, reflection and optional deeper notes. These short demonstrations illustrate relationships; they are not professional footage, equipment measurements or full-length external tutorials.
- The 37 distinct credited external excerpts remain. Twenty-eight existing teaching-media owners are now explicitly referenced by related shared modules, so their real creator videos appear in custom routes as well. The player retains the original title, source and segment; these are references to the same teaching unit, not new unique videos. Other units keep their labelled original animations. Further creator resources open at their original sources.
- 20 distinct generated scenario photographs, responsive WebP renditions, and original functional diagrams. No learner or real participant is depicted by the generated teaching imagery.
- Shared units appear in multiple relevant routes. Media has one canonical owner; route references reuse that unit. This is deliberately different from creating a new photograph and film for each of the historical 1,056 scenario-stage combinations.

## Learner experience

Goal search preserves the learner's words and covers all 18 categories. An unlisted goal is classified, clarified when uncertain, and logged for owner review. Two context questions lead directly to 18–22 adaptive checks; no filming is required at entry. A clear goal-and-skills report comes next. Only then does the learner choose weekly time and a target window, with immediate route/scope feedback, followed by mode choice and the personal dashboard. Saved answers are forward-only; the meter changes on submission. Pause/resume, learner adjustments and retakes remain available.

Routes adapt to the task, per-skill evidence, equipment and available time. Unassessed skills stay unassessed; self-reports do not overwrite an unknown diagnostic result. Short windows produce a scoped rehearsal. A screen task without a recorder becomes a labelled plan. Sensitive and specialist scenarios use harmless rehearsals and retain their qualified-review boundaries.

Watch/Make/Reflect and Pre-production/Production/Post-production remain. Practical completion requires interaction evidence, a practice note, a still/file or private viewing link, consent and three reflection taps. A low score does not block progression. The score is self-reported feedback, not certification or proof of video quality.

## Access preserved

The fixed first two selected pathways keep their free practice and AI review eligibility. The existing Product reel and Everyday story free access is retained. Annual Explore is INR 999 for one calendar year, with the unchanged shared limits of 12 practice-plan requests, 120 questions and 12 feedback checks. No real payment is taken. The separate mentor demo, its pricing and approvals have not become a live service.

AI reads text and one selected still only. It does not watch videos, hear audio, open links, or provide medical/legal/specialist approval. The live feedback smoke test returned exhausted API credit; it charged no learner review. Image moderation and private upload succeeded in a separate check. Add API credit before advertising live AI feedback to pilot participants. The configured model was not changed. For separate simple experiments, the API troubleshooting guidance suggests `gpt-6-luna`; changing the site's model should be evaluated independently.

## Architecture and persistence

React/TypeScript on the existing Vinext/Vite Sites starter; Cloudflare-compatible Worker; D1 for accounts, attempts, progress and goal logs; R2 for owned media. Existing platform sign-in is preserved. The recipe engine uses a compact runtime projection of the full source analysis. Canonical teaching adapts the existing curriculum in memory instead of shipping duplicate prose.

Key sources: `app/scenario-engine.ts`, `app/onboarding/`, `app/lessons/shared.ts`, `app/lessons/shared-units.ts`, `app/lessons/lab-specs.ts`, `app/lessons/shared-drawing.ts`, `app/lessons/experience.tsx`, and `app/api/`.

Stable pathway/module IDs preserve saved work. Additive migration `0002_chunky_sleeper.sql` creates onboarding attempts and goal logs; it does not drop or rewrite learner tables. Older profiles are archived when the new diagnostic is accepted. Revision checks reject stale writes. Test-only synthetic identities are injected by an external loopback QA launcher, not by the published app.

## Release verification

- 62 automated checks passed, including all source-use mappings, canonical media parity, adaptive Basic/Medium/Advanced outcomes, valid interaction evidence and unchanged access.
- 20 scenario personas completed 195 sessions through the real local APIs. Replanning kept submissions, earned work and fixed trial paths.
- Five diagnostic personas reached the expected Basic/Medium/Advanced placements; mentor consent and legacy-state preservation passed.
- Guest school-dance journey, answer locking, deferred meter, pause/resume and dashboard passed browser checks.
- 160 responsive lesson states across 360, 390, 768 and 1440 pixels; four scenario flows completed via the UI and restored their saved Make step.
- Whole published-media audit: 82 registered image/audio assets, 140 distinct video records, zero duplicate errors and zero near-duplicate flags. The 140 records comprise 37 external excerpts and 103 original clips. Canonical unit references are not new ownership slots.
- Captioned local video playback, keyboard controls, reduced motion, selected portfolio consent, unpublishing, private upload ownership and unattached deletion passed.
- Local production pages: roughly 350–408 KB gzip-normalised first-load payload across eight routes, under the 512 KB budget. No external video request occurs before Play. This is not a physical-phone or real-4G timing benchmark.
- Production account-page hydration mismatch fixed and rechecked. TypeScript and production build passed.

## Pilot operation

Invite a small group with varied goals, devices and skill levels. Ask each learner to finish the diagnostic and one practical session, then record the URL, device/browser, expected result, actual result and whether work stayed saved. Use only harmless practice media. Review goal mismatches at `/goal-review` from the configured owner account. Participants can export their own learning from Settings.

Keep live AI optional until billing is funded. Observe route relevance, first practical completion, repeat weekly visits, useful feedback and failed-save reports before expanding the cohort. Gather consent before collecting or sharing test feedback. Do not describe demo mentors, checkout or self-reported scores as a paid service or qualification.

Outstanding external validation: real participant learning time and usefulness, physical Android/iOS coverage, real mobile-network latency, third-party video availability/captions in each region, and funded AI feedback. No bug-free or professional-competence guarantee is made.

## Simplification release — 8 October 2026

- Watch, Make and Reflect are now the only lesson steps. The first step shows imagery and a play control immediately, alongside a simple before/after or two-view comparison. Technical multi-control labs are no longer required. Original evidence validators remain for older saved drafts.
- Photo-based comparisons use the owned hook image once in the header, or an existing separate interaction image. Audio lessons retain optional synthetic listening samples. Each comparison explains one observable change without grading it as skill competence.
- Assignments offer footage-based practice or a desktop storyboard/annotated-still plan. The choice and original work persist; plans explicitly leave recording and playback untested.
- The diagnostic report presents the exact goal, deliverable, level, per-skill evidence and three focus areas. The dashboard shows image-led pathways and actual completed work; no first frame is invented for a new learner.
- Schedule preview and saving use the same recipe engine. Too little time yields a scoped starter, with a suggested longer window. Estimates cover guided short practice, not guaranteed completion of filming, travel, approvals or repeat takes.
- Onboarding v2 records are upgraded in memory and saved on the next valid update. Answers, revisions, preferences, previous first-frame notes, assignments and access entitlements are preserved. No schema or pricing change.
- Validation: 67 automated tests; five learner journeys across Basic/Medium/Advanced, including a computer-only custom goal; saved work and desk-mode restoration; 20 lesson layout checks from 360 to 1440 px; eight production pages below the 512 KB compressed-page budget. External embed URLs, segment parameters and captions requests checked; provider playback is not guaranteed. Local captioned demonstration playback passed.
- Live AI feedback remains dependent on the owner's API credit balance; this release did not make a new paid AI call. Checkout and mentors remain demos.
