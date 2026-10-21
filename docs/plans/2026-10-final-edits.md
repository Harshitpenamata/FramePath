# Plan: final site edits and audit fixes

Written 19 Oct 2026. Sources:
- **Edits PDF:** `FramePath Site Final Edits.pdf`, 6 pages. Banner copy plus edits 1 to 7.
- **Audit:** `Framepath_Consolidated_Functional_Audit.docx`, run on staging 18 Oct 2026. It has 3,154 table rows:
  - **Broken (21 rows):** these reduce to 5 distinct defects, F01 to F05.
  - **Partial (1,117 rows):** almost all of these are checks the auditor couldn't run, such as full video playback, gated task forms, deletion, publishing and fresh sign-up. They are not defects. They are listed under "Manual checks" below.
  - **Working (2,016 rows).**

Work lands on the current branch `feat/studio-grid-ui` (PR #29) unless noted.

## Map of every change

| # | Source | Change | Where in the code | Cause or approach | Size |
|---|---|---|---|---|---|
| E1 | PDF p2 | Remove "Curated by industry leaders · Beginner to advanced · Self-paced or mentor-led" under the home buttons | `app/videography/start.tsx:51` (`.hm-facts`) | Delete the line and its CSS | S |
| E1b | PDF p1 | Home hero becomes a 5-slide banner with the supplied copy (eyebrow, headline, line per slide) | `VideographyHome` in `app/videography/start.tsx`, `home.css` | New slider: dots, arrows, swipe, keyboard, pauses for reduced-motion. Needs answers to **Q1** | M |
| E2 | PDF p2 | "Make another plan" on My courses should open the course picker, not the level check | `app/videography/dashboard.tsx:92` (`href="/start"`) | Point it to the home craft grid (`/#crafts`) | S |
| E3 | PDF p2–3 | Add an editable pathway name and a course ID | Review step in `ProgrammeStart` (`start.tsx`), plan page header (`dashboard.tsx`), `planTitle()` in `programme.ts`, `/api/state` | Needs answers to **Q2** | M |
| E4 | PDF p3–4 | Module header in two columns: title, meta and outline on the left; photo, tag and summary on the right. If it doesn't fit, drop the photo | `.ls-head` and the module hero in `app/videography/lesson.tsx`, `lesson.css` | Build the two-column version first, then screenshot it next to the PDF mock-up | S |
| E5 | PDF p4 | My work → Your modules: alignment and spacing, especially cards with several hand-ins and long file names | `app/videography/my-work.tsx`, `studio.css` | Reproduce with 4+ hand-ins and long file names (the PDF shows `VID2025073140...` wrapping). Fix the row grid, truncate long names with a full-name tooltip, and keep the card heights equal | S |
| E6 | PDF p5 | Lesson (Watch) redesign to match the recommended layout | `app/videography/lesson.tsx`, `lesson.css`, the quiz components | See the "Lesson redesign" section | L |
| E7 | PDF p6 | "Reflect" appears twice, as a top tab and inside Watch. Rename the one inside Watch | `lesson.tsx` and the lesson question component | Needs answers to **Q3** | S |
| F01 | Audit | A start date in the past is accepted and saved. The new Travel plan saved 17 Oct 2026 | Onboarding schedule step (`start.tsx`) and `app/api/state/route.ts:79` | Validate on the client (min = today) and reject on the server (a past date returns 400 with a plain message). Add a test | S |
| F02 | Audit | The Intermediate filter hides 11 "Intermediate / advanced" resources (R18–R28) | `app/scenario-resources.ts:22` | `/advanced/i` is tested before `/intermediate/i`, so "Intermediate / advanced" gets tagged `['advanced']` only. Tag it with both levels. Add a test | S |
| F03 | Audit | Membership says AI "can't watch videos or open links"; Help and Safety say it does | `app/learner-pages.tsx:11` | Use the same sentence as Help and Safety. Search the whole site for any other old wording | S |
| F04 | Audit | Documentary plan, module B13: the breadcrumb says Documentary but the heading says "Your Wildlife & nature project" | `lesson.tsx:37,61` (and `closure.tsx:23`) call `projectLabel(s.programme)` | It uses the active plan, not the plan the module belongs to. Pass the module's own plan. Add a test | S |
| F05 | Audit | Documentary B13 and Travel I13 quiz questions cite wedding videos that aren't in those modules' video lists | Lesson question data for the pathway project modules | Re-map each question's source to a video in the assigned list, or rewrite the question. Add a test that every question's source is in its lesson's videos | M |
| A1 | Audit | "Skip to content" doesn't move keyboard focus into the page | Skip link in `app/ui.tsx` | Add `tabIndex=-1` to `<main id="main">` | S |
| A2 | Audit | Membership "Browse pathways" opens My courses | `learner-pages.tsx` | Rename it to "My courses", or point it at `/#crafts` | S |
| A3 | Audit | Android filter also shows iPhone and iMovie resources | `tagExistingResource` in `scenario-resources.ts` | The tags mean "relevant to", not "works on". Decide whether that's intended (**Q4**) | S |
| B | Earlier request | Button rules from Apple's guidelines | `studio-grid.css`, the components | Measured on 14 pages; see the "Buttons" section | M |

S = under an hour, M = a few hours, L = most of a day.

## Lesson redesign (E6 and E7)

The target is the PDF page 5 mock-up, in the current Studio Grid look:

1. **Lesson header row:**
   - small lesson image, "LESSON 1 OF 4", title and one-line summary
   - on the right, progress dots and "0 of 3 videos watched"
2. **01 / Watch:**
   - one large player
   - below it, a strip of video tabs (number, title, creator), with the active one underlined in lime
   - the video title, then the "Watch for" line
3. **02 / [name from Q3]:**
   - **Shown only after every video in the lesson is watched**, as the PDF asks. Until then, the section shows a locked line: "Watch all 3 videos to unlock the questions."
   - One question at a time, with progress dots.
   - Options are lettered A/B/C. A correct answer is outlined in lime with a tick, and the feedback line shows under the options. Then "Next question".
4. **Footer:** "Complete all 3 videos and reflections to continue", with "Next lesson" disabled until both are done.

What stays the same:
- the watched-progress rules
- the quiz locking
- the saved answers
- the lesson order

This is a layout change on top of the existing state.

## Buttons (from the earlier request)

Measured on 14 pages; to fix:
- **Hit areas under 44px:**
  - checkboxes (16–19px)
  - "×" remove-file buttons (16px)
  - "Source and availability" toggles (22px)
  - time dropdowns (32px)
  - lesson step pills (40px)
  - radio rows (26px)
- **Too many lime items:** Watch shows 3 at once. Selected states should use a cream fill, and lime should mark the main action only.
- **Destructive actions** need their own style and must never be the main button:
  - Delete this plan
  - Delete unused file
  - Delete my account
  - Remove from My Work
- **Checkbox buttons** have no accessible label.
- **Press state** is needed on every custom button, chip and tab.
- **Slow actions** should show a working label, such as "Handing in…".

The makeitclear.com guide was blocked (Cloudflare 403), so it isn't included yet.

## Order of work

1. **Audit bugs and small edits:** F01–F05, A1, A2, E1, E2, E7 (once Q3 is answered). Add tests for F01, F02, F04 and F05. These are mostly one-line fixes with clear causes.
2. **Layout edits:** E4, then E5, verified against the PDF screenshots.
3. **Lesson redesign:** E6.
4. **Home banner:** E1b (once Q1 is answered).
5. **Pathway name and course ID:** E3 (once Q2 is answered).
6. **Buttons:** B.
7. **Verify and ship:**
   - tests, type check and size budgets
   - screenshots at 1536px and 390px
   - update the PR #29 description, push, deploy staging
   - re-run the audit's reproduction steps for F01–F05

## Questions to answer before those items

- **Q1 (banner):**
  - Should the 5 slides replace the current hero ("Your creative career, mapped by industry leaders…")?
  - Should they rotate on their own, and how fast, or change only when the learner clicks?
  - Does each slide get its own photo? If so, which, or should I pick from the 12 we have?
  - Slide 3 claims "700+ curated pathways". Is that number confirmed?
- **Q2 (pathway name and course ID):**
  - Where should the learner edit the name: on the review step (the screenshot on page 3), on the plan page, or both?
  - What is the "course ID"? A code shown to the learner (for example VID-B-1234), or something they type?
- **Q3 (rename):** what should the questions section inside Watch be called? The PDF mock-up itself labels it "02 / REFLECT". Options:
  - "Check your understanding"
  - "Quick check"
  - "Think it through"
- **Q4:** should the Android filter hide iPhone-only and iMovie resources, or is "relevant to" the intended meaning?

## Manual checks the audit couldn't run

These need a person with a real device and a fresh account:
- full video watch-to-complete thresholds
- native video controls (seek, fullscreen)
- the sign-up age flow for 13–17 year olds with guardian agreement
- public portfolio publishing
- deleting a file, a plan and an account
- sign-out
- the Insta360 manual PDF (R49) and the Apple iPhone page (R39), which loaded blank in the auditor's browser

## Staging clean-up after the audit

The audit left test data in the shared account:
- a Travel plan dated 17 Oct 2026 (`49db505d-95ad-46d4-862c-e38b4a0f5d2d`)
- a demo annual membership
- a test I01 hand-in that used one AI review
- quiz answers

Delete the Travel plan through the app after F01 ships.
