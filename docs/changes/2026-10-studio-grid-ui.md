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
- **Shared styles:** 47.5 KB of the 60 KB budget.
- **Photos:** served at 900 and 1800 px wide (1.9 MB for all 24 files) and lazy-loaded.

## Not included

- The "Get notified" buttons on the coming-soon crafts in the home mockup. There is nothing behind them yet.
- WhatsApp updates (PR #28) are not in `main`, so they are not on this branch.

## Checks

- `node --test tests/*.test.mjs`: 101 pass
- `npx tsc`: clean
- `npm run build`: all budgets pass
- Every page was compared with its mockup by screenshot at 1536px, signed in and signed out, and checked at 390px
