# Consent and data: age, people in your work, delete my account

Branch: `feat/consent-data` (based on `feat/admin-console`)

## Summary
These are the consent and data basics to have in place before real learners use FramePath, in line with what India's DPDP Act expects: clear consent, honest disclosure of who processes what, and a way to delete everything.

## What changed
- **The age question,** asked once, on the first step of making a plan:
  - *I'm 18 or older*, or
  - *I'm 13 to 17, and a parent or guardian agrees I can use FramePath*
  - FramePath isn't for children under 13. The answer is saved (`state.consent`), and a plan can't be made without it.
- **Under-18s can't share publicly.** They can share their portfolio by link (Unlisted), but not publicly in Community. The server refuses public sharing for them.
- **Learners from before this change** are asked their age group on their portfolio page the first time they choose Public.
- **People in your work:**
  - the upload consent now reads *"…and everyone you can recognise in it agreed to be filmed"*
  - the portfolio sharing consent reads *"…and everyone you can recognise in it has agreed to it being shared"*
- **Delete my account,** under My account:
  - **What it removes:** uploaded files (from storage), plans and progress, hand-ins, AI reviews and flags, the portfolio with its likes and comments, and the learner's own comments, likes and reports on other portfolios.
  - **How:** the learner types **DELETE** to confirm, and is then signed out. It can't be undone.
- **The Safety page** is updated:
  - *Uploads and AI* now says what goes to Anthropic (text, photos) and to Google (videos and YouTube or Drive links, deleted after watching). It used to say the AI can't watch video.
  - **New sections:** *People in your work*, *Age*, and *Your data*.
- **My account's privacy notes** now mention Google (Gemini) for videos, and account deletion. Storage reads "of 1 GB" (was 100 MB).

## Also
Unused CSS left from the removed style tiles, level picker and interest tags is deleted (918 bytes), which keeps shared styles under budget (59.9 / 60 KB).

## Code
- `app/api/state/route.ts`:
  - new `consent_save`
  - `programme_save` needs an age group
  - `portfolio_publish` refuses Public for under-18s
- `app/api/account/delete/route.ts` (new): deletes everything for the account.
- `app/videography/start.tsx`: the age question.
- `app/videography/portfolio-page.tsx`: the Public rule and the consent wording.
- `app/ui.tsx`: the upload consent wording.
- `app/other-pages.tsx`: `DeleteAccount` and the privacy notes.
- `app/scenario-pages.tsx`: the Safety page sections.
- `app/videography/videography.css`: the age styles; dead rules removed.

## Testing
End-to-end on a local server, 14 checks, all passing:
- **Age:**
  - a plan needs the age question
  - a 13–17 learner with guardian agreement can make one, but public sharing is refused for them while sharing by link works
  - an adult can share publicly
- **Account deletion:**
  - it needs DELETE typed
  - deleting removes the learner's file from storage (404), their portfolio and gallery entry, and their comment and like on another learner's portfolio
  - signing in again starts fresh
  - the other learner is untouched

`node --test`: 101 passing. `npm run build`: all budgets pass.
