# My Work redesign (13 Oct review, phase 3)

Branch: `feat/my-work-redesign` (based on `feat/lesson-layout`)

## Summary

My Work now follows the "learning studio" mock-up from the 13 Oct review, in FramePath's dark theme. It has three parts: a status card, a card for every module in the learner's level, and a portfolio builder.

## What learners see
- **Current status:**
  - **Modules** finished (e.g. 05 / 14)
  - **Tasks** handed in so far
  - **Score:** the average AI score, with a bar
  - **Hours** of learning done (e.g. 27 / 80)
- **Your modules:** one card per module.
  - **Handed in:**
    - an **AI feedback / score** box with the review's summary and *See detailed review →*, or *Get it in Feedback →* when there's no review yet
    - the **hand-ins**: thumbnail, type (Photo, Video submission, Video link, Written answer), hand-in number and date, the files (each removable), a **Portfolio** tick box, and *Remove*
    - **Your note:** the text the learner wrote when handing in. There's no separate input box.
  - **Next module:** highlighted, with *Room for your next hand-in* and *Go to module*.
  - **Later modules:** faded, with the module number, task name, outcome and *Coming up next*.
- **Other work:** hand-ins from other levels and older practice keep their folder list.
- **Build your portfolio:**
  - a title and *A little about your learning*
  - the number of pieces selected, and *Save portfolio*
  - a permission tick box and *Publish portfolio →*
  - once published: the link with *Copy link*, *View* and *Unpublish*
- Arriving from *See it in My Work* scrolls to that module's card.
- On phones, the status shows 2 × 2 and the cards stack in one column.

The gallery from the earlier showcase work moves to the separate portfolio page in phase 4.

## Code
- `app/videography/my-work.tsx` (new): `MyWorkStudio`, `StatusCard`, `ModuleCard` and `PortfolioPanel`.
- `app/videography/studio.css` (new): My Work styles. They load only with My Work.
- `app/other-pages.tsx`: `Portfolio` (the `/portfolio` route) renders `MyWorkStudio`.
- `app/videography/work-folders.tsx`: `WorkFolders` takes an optional `keys` filter, used for "Other work".
- `scripts/check-performance.mjs`: the shared-styles budget now leaves out stylesheets that belong only to on-demand pages. Before, `review-page` was left out by name; this makes that rule general.

## Testing
- `node --test tests/*.test.mjs`: 96 passing.
- Browser:
  - My Work with 5 handed-in modules shows photo, written, video-link and video pieces
  - the next module is highlighted, later ones are faded, and the portfolio panel shows the published link
  - at 390 px there's no sideways scrolling
- `npm run build`: all budgets pass. Shared styles stay at 59.1 / 60 KB.
