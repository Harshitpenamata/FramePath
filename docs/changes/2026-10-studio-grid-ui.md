# Studio Grid: a new look for the whole site

Branch: `feat/studio-grid-ui` (based on `main`)

## Summary

The site has been restyled to follow the 15 Studio Grid mockups (`Assets/01_Studio_Grid`). All features work as before, and almost all of the words are unchanged. The design comes from the mockups; the text comes from the current site.

- **Look:**
  - black background
  - a cream pill-shaped header with a black account button
  - lime buttons, and cream outlined cards with rounded corners
  - round-chevron accordions
- **Fonts (self-hosted):**
  - **Anton** for headlines (condensed, uppercase)
  - **Inter** for navigation, body text and buttons
- **Photos:** 12 Unsplash photos, black and white by default. An admin can switch them to colour.
- **Navigation:** unchanged (My courses · My work · Community · More).
- **Logo:** the corner-bracket mark from the mockups now appears in the header and footer.

## Pages

| Mockup | Page | What changed |
|---|---|---|
| 01 Home | `/` | Hero, 5 craft cards (Videography live), Learn your way, the four steps, closing call to action |
| 02 Your interests | `/start` | Two columns: step title on the left, interest tiles with icons on the right |
| 03 Learning options | plan page, "How you learn" | Free and Self-paced as photo cards |
| 04 My learning | `/workspace` | Plan cards; an empty state with "Make your first plan" |
| 05 Project overview | plan page | Hero with continue button and photo, numbered stage strip, accordions |
| 06 Watch / 07 Make | module page | Tabs renamed **Watch / Make / Reflect / Finish**. The URL keeps the tab (`?tab=make`), and old links still work. Make shows the brief on the left and the hand-in form on the right |
| 08 My work / 09 Portfolio | `/portfolio`, `/my-portfolio` | My work / Portfolio switch; signed out, the headline sits beside the sign-in card |
| 10 Community | `/community` | Headline beside a photo |
| 11 Resources | `/resources` | Search and Watch/Read chips at the top, other filters folded under "Filters" |
| 12 Help | `/help` | Answers as accordions, three photos |
| 13 Account | `/settings` | Account card with photo; signed out it shows Google sign-in and links |
| 14 Recording safely / 15 Uploads and privacy | `/safety` | Checklist card, recording sections as accordions with icons, then a privacy card with the privacy sections |

**Phones:** the header becomes two rows: the brand and account button on top, the nav links underneath. No page scrolls sideways at 390px.

## Spacing and sizes

After review, the pages were measured with a script (button sizes, heading sizes, line spacing, left edges) and brought onto one shared set of sizes. This follows the consistency, alignment, proximity and hierarchy principles from Figma's and UXPin's UI design guides. The sizes are tokens at the top of `app/studio-grid.css`.

- **Grid:**
  - The header, page content and footer share one frame (max 1460px).
  - Content starts exactly under the logo on every page. Before, it started at 58px on some pages and 78px on others, with the logo at 64px.
- **Type scale:**

  | Level | Size at 1536px | Line spacing |
  |---|---|---|
  | Page headline | 92px (was 92–129px, varying by page) | 0.92 |
  | Section heading | 64px | 0.95 |
  | Card title | 34px | 1.02 |
  | Lede | 21px | 1.5 |
  | Body | 16px | 1.6 |

  The home hero is the only larger headline, as in the mockup.
- **Spacing steps:** 4, 8, 12, 16, 24, 32, 48, 64 and 96px.
  - A label sits 12px above its heading, and a heading sits 24px above its content.
  - Stacked cards are 12px apart; blocks are 24px apart; home sections are 96px apart.
- **Buttons:**
  - 48px everywhere. 56px only for the main action in a hero card.
  - Disabled buttons are a quiet grey instead of a faded lime.
  - Icon circles are 40px (small) or 48px (large).
- **Small fixes:**
  - **Letter spacing:** headlines no longer have squeezed letters from an older stylesheet.
  - **Tags:** use Inter instead of a typewriter font.
  - **My work:** the hand-in rows no longer overlap, and module cards in a row are the same height.
  - **Account:** the privacy panel no longer has a double border.
  - **Membership:** the notice uses the lime outline instead of an old dark green.
  - **Home on phones:** the craft card text no longer runs into the photo.

## Wording changes

- **Help:** some answers were out of date and have been corrected:
  - AI reads notes and photos, and watches videos and YouTube or Google Drive links, picture and sound
  - Reflect lets learners flag a review
  - Mentorship is coming soon
- **Privacy & safety:**
  - The checklist lines and the three privacy statements are phrases taken word for word from the sections on the page.
  - The second section is headed "Uploads and privacy."
- **Portfolio:** new short line under the heading: "Pick your best pieces in My work, then choose who can see them."

## Colour or black-and-white photos

- **Admin → Look:** switches every photo on the site between colour and black and white.
- **Where it's stored:** `app_flags` (`photos` = `colour` or `bw`), through `/api/look`:
  - `GET` is public and cached for 60 seconds
  - `POST` is for admins only
- **In the browser:** the last setting is remembered, so pages don't flash.
- **Learners' own work** in Community always shows in colour.

## Performance

- **Legacy stylesheets:** moved out of the shared bundle into the pages that use them (`app/legacy-styles.ts`). Each new page's styles load only with that page.
- **Shared styles:** 48.5 KB of the 60 KB budget.
- **Photos:** served at 900 and 1800 px wide (1.9 MB for all 24 files) and lazy-loaded.

## Site edits and audit fixes (19 Oct 2026)

From `FramePath Site Final Edits.pdf` and the functional audit of staging (18 Oct 2026). The full map is in `docs/plans/2026-10-final-edits.md`.

**Site edits**

| # | Change |
|---|---|
| Banner | The home hero is now five slides with the supplied copy. Each has a photo, changes every 5 seconds, pauses on hover and keyboard focus, has dots, arrows and a pause button, and stays still for reduced motion |
| 1 | The "Curated by industry leaders · …" line under the home buttons is removed |
| 2 | "Make another plan" opens the course picker on the home page, not the level check |
| 3 | Plans can be named on the review step and renamed on the plan page. Leaving the name empty brings back "Videography · pathway". Each plan shows a course ID such as `VID-B-4737` (course, level letter, four digits that stay the same for the plan) |
| 4 | Module header in two columns: title and details on the left; picture, tag and summary on the right |
| 5 | My work cards: three a row. Each file name has its own line and is cut off with "…" when long. Portfolio and delete sit on their own row. Older hand-ins fold under "Earlier hand-ins" |
| 6 | New lesson layout: a header with video progress, then 01 / Watch (player, a strip of the lesson's videos, what to watch for), then 02 / Think it through, then the way on |
| 6 | The questions open only after every video in the lesson is watched. They show one at a time, with lettered answers and progress dots. Next lesson waits until the lesson is finished |
| 7 | The questions inside Watch are now called "Think it through"; the Reflect tab keeps its name. "Get it in Feedback" now says "Get it in Reflect" |

**Audit findings**

| # | Problem | Fix |
|---|---|---|
| F01 | A start date in the past was accepted | The server allowed one day in the past and used the UTC date. It now uses the India date and accepts today or later; the date fields ignore typed past dates |
| F02 | The Intermediate filter hid 11 resources | "Intermediate / advanced" was tagged advanced only; it is now tagged both |
| F03 | Membership said AI can't watch videos | It now uses the same sentence as Help and Safety |
| F04 | The Documentary B13 heading said "Wildlife & nature" | The style project is named after the plan's pathway, like the breadcrumb |
| F05 | Questions named videos the lesson doesn't show | A question naming a video that isn't in the lesson is left out. This applied to 65 citations across 24 lessons; every lesson still has at least one question |
| — | Android filter showed iPhone and Mac guides | They are tagged iPhone-only or desktop-only |
| — | "Skip to content" didn't move focus | Focus now moves into the page |
| — | Membership's "Browse pathways" opened My courses | The button is now called "My courses" |

**Buttons (Apple's button rules, in the Studio Grid look)**
- **Targets:** every control has a target of at least 44 by 44px.
- **Press state:** every button visibly reacts when pressed.
- **Lime:** marks the main action only; a selected lesson uses a cream fill.
- **Destructive actions:** red, never the main button.
- **Busy labels:** slow actions say what they are doing.

**Not changed:** five older flows (the beginner session, the legacy onboarding and lesson pages) still say AI can't watch video. The current site doesn't link to them, so they were left alone.

## Not included

- The "Get notified" buttons on the coming-soon crafts in the home mockup. There is nothing behind them yet.
- WhatsApp updates (PR #28) were merged into `main` later, and `main` has been merged into this branch. Their Account panel keeps its original style.

## Checks

- `node --test tests/*.test.mjs`: 106 pass. New tests cover F01, F02, F04 and F05, the Android filter, plan names and course IDs
- `npx tsc`: clean
- `npm run build`: all budgets pass
- Every page was compared with its mockup by screenshot at 1536px, signed in and signed out, and checked at 390px
