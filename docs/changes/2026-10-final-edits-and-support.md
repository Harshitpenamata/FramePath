# Site edits, audit fixes, buttons, plan deletion, and support tickets

Branch: `feat/final-edits-support` (follows `feat/studio-grid-ui`, which was merged in #29)

## Summary

This round covers everything since #29 was merged:
- the site edits from `FramePath Site Final Edits.pdf`
- the five bugs from the functional audit of staging (18 Oct 2026)
- button rules from Apple's guidelines and Make it Clear's button guide
- deleting plans from My courses
- the home banner images
- permanent User and Course IDs, with a support ticket system

> **Before deploying to production:** run `npm run db:migrate:production`. Migration `0007` adds the ID and ticket tables. The deploy script doesn't run migrations, and the new code needs these tables. Staging is already migrated.

Plans behind this work:
- `docs/plans/2026-10-final-edits.md`: the map of every edit and audit finding
- `docs/plans/2026-10-ids-and-support.md`: the design of the IDs and tickets

## Home
- The hero is now a carousel of the five designed banners (`public/banners`, WebP at 1000 and 2070 px wide, 416 KB in total). Each banner's words are its alt text.
- It changes every 5 seconds and has dots, arrows and a pause button. It pauses only for keyboard focus, not for the mouse, and stays still for reduced motion.
- The "Curated by industry leaders · …" line is removed.

## Plans
- **Plan name:** a plan can be named on the review step and renamed on the plan page. An empty name brings back "Videography · pathway".
- **Delete from My courses:** each card has a Delete button. A warning dialog says this can't be undone and that progress can be lost. It offers two choices: delete the plan and keep the work, or delete the plan and its work. The plan page uses the same dialog.
- **Make another plan:** opens the course picker on the home page.
- **Stage strip:** shows progress only and isn't clickable:
  - finished stages: lime fill and a tick
  - current stage: lime outline and "Now"
  - upcoming stages: quiet

## Modules and lessons
- **Module header:** two columns, with the title on the left and the picture, tag and summary on the right.
- **Lesson layout:** a header with video progress, then 01 / Watch (the player, a strip of the lesson's videos, what to watch for), then 02 / Think it through.
- **Questions:** they open after every video is watched and show one at a time with lettered answers. Next lesson waits until the lesson is finished.
- **Names:** the questions inside Watch are called "Think it through"; the Reflect tab keeps its name. "Get it in Feedback" now says "Get it in Reflect".
- **My work:** three cards a row. File names are cut off with "…" when long, and older hand-ins fold away.

## Audit findings

| # | Problem | Fix |
|---|---|---|
| F01 | A start date in the past was accepted | The India date is used; the start must be today or later |
| F02 | The Intermediate filter hid 11 resources | "Intermediate / advanced" is tagged both levels |
| F03 | Membership said AI can't watch videos | It now matches Help and Safety |
| F04 | The Documentary B13 heading said "Wildlife & nature" | The project is named after the plan's pathway |
| F05 | Questions named videos the lesson doesn't show | Hidden: 65 citations across 24 lessons, and every lesson keeps at least one question |

Also fixed:
- The Android filter no longer shows iPhone and Mac guides.
- "Skip to content" moves focus into the page.

## Buttons
- **Targets:** at least 44px everywhere.
- **States:** every style has default, hover, pressed, focus and disabled.
- **Focus ring:** set 3px away from the control, and black on cream and lime surfaces.
- **Colour:** lime only for the main action. Destructive actions are red at 7.6:1, which passes AAA.
- **Contrast:** all text was measured at AAA (7:1).
- **Labels:** stay on one line, and slow actions say what they're doing.

## User IDs, Course IDs and support tickets
- **IDs:** a User ID (`FP-10001`) per account and a Course ID (`VID-B-1001`) per plan. Both come from database counters, so they are unique and never reused. A Course ID never changes, whether the plan is renamed, moves up a level or is deleted. Existing accounts get theirs on next load.
- **Report a problem:** on the module, plan, Help and Account pages. A ticket (`T-1001`) records the User ID, Course ID, pathway, plan name, level, module, lesson and page. The server works these out from the learner's own account.
- **Learners:** My account → Help requests shows their User ID, their tickets and our replies.
- **Admins:** a support queue with search by `T-`, `FP-`, `VID-` or email, plus status, a reply to the learner and a staff-only note. "Find a learner" also accepts IDs.
- **Account deletion:** removes the learner's tickets and Course ID rows.
- **No alerts yet:** neither staff nor learners get an email or WhatsApp message about tickets.

## Checks
- `node --test tests/*.test.mjs`: 107 pass. New tests cover F01, F02, F04 and F05, the device filter, plan names and Course IDs, and the support categories.
- `npx tsc`: clean.
- `npm run build`: all budgets pass (shared styles 49.2 KB of 60 KB).
- Every changed page was checked by screenshot at 1536px and 390px, with no sideways scroll.
- Tested end to end on a local copy of the site:
  - plan deletion
  - renaming a plan
  - raising a ticket, then finding and answering it as an admin
