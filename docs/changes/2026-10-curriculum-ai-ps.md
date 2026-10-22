# Curriculum update: AI and professional-skills lessons

Branch: `feat/curriculum-ai-ps` (based on `main` after PR #40)

## Summary
The new curriculum sheet (`docs/sources/Video_Library_Module_by_Module_Merged.xlsx`, updated 22 Oct 2026) has 209 videos. 177 are unchanged; 32 are new:
- **17 AI videos** become **15 AI lessons** at the end of their modules. I14's two videos share one lesson, as do A13's two.
- **15 professional-skills videos** become 3 new modules, one per level, under a new stage, **Working with people**, before the final project:
  - **B-PS:** Work with people and present your work (5 h)
  - **I-PS:** Win clients and pitch your ideas (8 h)
  - **A-PS:** Lead teams and win approval (10 h)

Each new lesson has an intro, one interactive exercise and two "Think it through" questions. Each new module has a written task with AI review checks.

**For review:** all the new content is in `docs/curriculum-review-2026-10-22.md`, which is generated from the code.

## What changes for learners
- **Optional lessons:** lessons that need gear or paid software (Filmustage, the Sony auto-framing camera, Premiere AI search, Resolve Studio, iZotope RX, VFX tools) are marked "Optional · needs …". They don't count towards finishing a module.
- **Longer levels:** 85, 152 and 250 hours, one week more each. Existing plans keep their start date, weekly hours and days, and get new dates the next time they load.
- **Final project:** now module 15. Saved work moves with it (see the migration below).
- **Stage strip:** 7 stages, each tile showing its number above its name at every width.
- **Sketches:** new lessons have no sketchbook drawing yet, so none is shown.

## Code
- `app/videography/video-library.json`: re-imported. The 177 existing videos keep their IDs.
- `app/videography/lessons-ai-ps.ts`: new. The 30 lessons.
- `app/videography/lessons.ts`: merges them in; adds the `optional` flag (not needed for `lessonsStatus`).
- `app/videography/reflect/*.json`: 60 questions added, aligned to the new lessons.
- `app/videography/curriculum.json`: the 3 new modules.
- `app/videography/programme.ts`:
  - shared `stageOrder`
  - new `rhythm` hours
- `dashboard.tsx`, `closure.tsx`, `module-context.tsx`: use the shared stage order.
- `module-context.tsx`:
  - an "Optional" tag and note on optional lessons
  - hides a missing sketch
- `media.ts`: images for the new modules.
- `app/api/state/route.ts`: recalculates old plans' dates when a level's total changes.
- `drizzle/0011_move_final_project.sql`: moves `video-<level>-13` keys and `/explore/video-<level>/13` links to 14 in these tables:
  - learners
  - portfolios
  - reflection_attempts
  - ai_jobs
  - review_flags
  - support_tickets
  - events
  - wa_messages
- `app/studio-grid.css`: stage tiles; the optional tag.

**Deploy order:** run migration 0011 right before deploying the code.

## Testing
- The type check passes.
- **Every new lesson:** all 30 have a video and their questions, and no question is filtered out by its video.
- **Videos:** all 32 new videos are live and embeddable (YouTube oEmbed, 200).
- **Migration:** run on a test learner, `-13` and `/13` moved to 14 while 12 and 1 were untouched.
- **Locally:**
  - **Plan:** 15 modules, 85 hours, end date 20 Dec → 27 Dec, and a 7-stage strip at 1440 and 390 wide.
  - **Modules 14 and 15:** module 14 is the new module, with 5 lessons; module 15 is the final project.
  - **Optional lesson (B04):** shows its note and no empty sketch.
