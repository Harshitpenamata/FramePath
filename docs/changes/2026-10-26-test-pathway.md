# Admin test pathway

A short plan for testing the whole course end to end, for admins only.

## What it is

- Three real Beginner modules: **B01** (photo task), **B05** (video task, which the AI watches) and **B14** (final project, which ends with the finish screen).
- 29 hours of content, scheduled over 2 weeks. Course IDs look like `VID-T-xxxx`.
- Lessons, sketches, FAQs, review lenses and Reflect questions all come from the module ids, so the test uses the same content learners get.
- Assignments are open on all three modules (no paywall).

## How to start it

Admin panel → **Test pathway** → **Start a test pathway**. It adds a new plan called "Test pathway" to your account and opens it. It counts toward the plan limit, so delete it from My courses when you are done.

## Safety

- The server action `test_plan` checks `isAdmin` (ADMIN_EMAILS).
- `test` is not in `levels`, so learners can't pick it, see it in level lists or be placed in it by the level check.
- The finish screen offers no "next level" for the test plan.

## Files

`app/videography/programme.ts` (level, modules, `buildTestProgramme`), `app/api/state/route.ts` (`test_plan`, Reflect bank), `app/admin-page.tsx` (panel), `app/videography/closure.tsx`, `app/ids.ts` (letter T), `tests/videography.test.mjs`.

## No watch rule

On the test pathway the "watch 70% of each video" rule is off: every video counts as watched, so the questions open at once and a lesson is finished when its questions are solved (`skipWatch` in `app/videography/module-context.tsx`). Other plans are unchanged.
