# Portfolio page and community (13 Oct review, phase 4)

Branch: `feat/portfolio-community` (based on `feat/my-work-redesign`)

## Summary

Learners now have their own portfolio page, separate from My Work. They choose who can see it: private, unlisted or public. Public portfolios appear in a new **Community** gallery. Anyone signed in can like a shared piece and comment on it. Claude checks every comment before it appears. Comments can be reported, and they can be deleted by their author or by the portfolio's owner.

> **Needs a database migration:** `drizzle/0003_aberrant_bloodscream.sql`. Run `npm run db:migrate:staging` with this deploy.

## What learners see
- **My Work → Build your portfolio** keeps the title, the "about" text and the piece selection.
  - It now shows the current sharing setting, with *Open your portfolio page →*.
  - Saving updates a shared portfolio straight away, so there's no separate "update published" step.
- **Your portfolio page (`/my-portfolio`):**
  - **Sharing:**
    - **Private:** only you can see it.
    - **Unlisted:** anyone with the link can see it.
    - **Public:** anyone with the link can see it, and it's shown in Community.
    - Sharing for the first time asks you to confirm you have permission. Once it's shared, there's a copy-link box.
  - **The page itself** reads like a résumé: an initial, the learner's name, the title and story. It shows facts (pieces, modules, level), a "What I've practised" list of modules, and then the work gallery.
- **Shared link (`/p/<token>`):** the same résumé layout, and *See more learners' work*.
- **Community (`/community`, new nav item):** pieces from public portfolios, newest first. Each tile shows the learner's name and its likes.
- **Opening a piece** (on the community page, a shared link, or your own page once it's shared) shows, beside the work:
  - a **like** button with its count
  - the **comments**
  - a box to write a comment: *"Comments are checked before they appear. Be kind and specific."*
  - visitors who aren't signed in see the counts and comments, plus *Sign in to like and comment*
- **Comment tools:**
  - delete: shown to the comment's author and the portfolio's owner
  - report: shown to anyone else who is signed in; asks for a reason

## How comments are kept safe
- **Screening:** every comment goes to Claude (`claude-opus-5-5`, low effort) before it's saved.
  - **Allowed:** kind, neutral, or honest critique, even blunt critique of the work.
  - **Blocked:** insults aimed at the person, harassment, hate, sexual content, threats, spam, links, contact details, and off-topic text.
  - A blocked comment isn't saved. The writer sees Claude's reason, e.g. *"Your comment insults the person instead of giving feedback on the work…"*.
  - If Claude can't be reached, the comment isn't posted.
- **Limits:** 600 characters per comment, and 30 comments per person per day.
- **Reports:** a report hides the comment straight away, with status `reported`, and records who reported it and why. A person can report a comment only once.
- **Deletes:** a deleted comment is marked `removed`, not erased.

## Database (`drizzle/0003`)
- `portfolios`: new `visibility` column (`unlisted` by default, or `public`) and `updated_at`, plus an index for the gallery. Portfolios published before this change are unlisted.
- New tables:
  - `portfolio_likes`: one row per person per piece
  - `portfolio_comments`: status is `visible`, `reported` or `removed`
  - `comment_reports`: one report per person per comment
- Private means unpublished: the portfolio row is removed, as before. That also takes its likes and comments out of view.

## Code
- `app/api/community/route.ts` (new):
  - `GET` with no token returns the gallery: the latest 60 public portfolios, with like counts and your likes.
  - `GET ?token=` returns one portfolio's likes and comments.
  - `POST` handles the `like`, `comment`, `report` and `delete` actions.
- `app/api/state/route.ts`:
  - `portfolio_publish` takes `visibility`
  - shared pieces carry their submission `id`
  - `portfolio_save` republishes a shared portfolio
- `app/videography/portfolio-page.tsx` (new): `PortfolioResume`, `SharedPortfolioPage`, `MyPortfolio`, `CommunityGallery`, and the `PieceSocial` likes and comments panel.
- `app/videography/community.css` (new): styles for these pages. They load only with them.
- `app/videography/showcase.tsx`:
  - the viewer takes a `social` slot, and tiles take a `tileExtra` line
  - items can carry a portfolio `token` and the owner's name
- `app/videography/my-work.tsx`: the portfolio panel links to the new page instead of publishing in place.
- `app/other-pages.tsx`, `app/framepath.tsx`, `app/foundation/navigation.ts`: the `/my-portfolio` and `/community` routes, and the Community nav item.

## Testing
- `node --test tests/*.test.mjs`: 96 passing. The navigation test now expects Community.
- End-to-end API run against a local server, with live Claude screening: 22 checks, all passing.
  - **Visibility:**
    - an unlisted link works but isn't in the gallery
    - after switching to public, it shows there
    - after unpublishing, both the link and the gallery entry are gone
  - **Likes:** liking twice counts once; liking a piece that isn't shared is refused; liking while signed out is refused.
  - **Comments:**
    - specific critique is posted
    - an insulting comment is blocked, with Claude's reason
    - a stranger can't delete a comment
    - a reported comment is hidden
    - the owner can delete a comment on their work
- Browser:
  - My Work → the portfolio page
  - switching to Public → the piece shows in Community
  - the viewer shows the like button, comments and comment box
  - at 390 px there's no sideways scrolling
- `npm run build`: all budgets pass. Shared styles are at 59.1 / 60 KB.

## Not in this change
- There's no admin screen for reviewing reported comments yet. They stay hidden in `portfolio_comments` with status `reported`, alongside the rows in `comment_reports`.
