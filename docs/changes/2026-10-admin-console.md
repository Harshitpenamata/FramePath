# Admin console: reported comments, learner lookup, storage

Branch: `feat/admin-console` (based on `feat/review-flags`)

## Summary
`/admin` (emails in `ADMIN_EMAILS` only) gets three more sections, alongside the hourly job, flagged reviews, AI spend and lesson videos.

- **Reported comments.** Comments someone reported are hidden straight away. Admins now see each one: the text, the author and their email, the portfolio it's on (with a link) and its owner's email, the date, the number of reports and the reasons. Then **Restore** shows it again or **Remove** takes it down. The panel is highlighted while any are waiting.
- **Find a learner.** Search by email, or part of one. For each match it shows:
  - name, last active, Self-paced or Mentor
  - their plans (course, style, level, which is open)
  - hand-ins, AI reviews, comments
  - files and storage used
  - their portfolio's visibility, with a link
  - a list of hand-ins with links to each file

  Only learners who have signed in since emails started being saved (the review-flags change) can be found.
- **Storage.** The total used, files and learners, and the 10 learners using the most, with Cloudflare R2's free allowance and price for reference.

## Code
- `app/api/admin/console/route.ts` (new):
  - `GET ?section=comments|users|storage`
  - `POST` to restore or remove a reported comment (only while it's still reported)
- `app/admin-page.tsx`: `ReportedComments`, `FindLearner` and `Storage`.

## Testing
End-to-end on a local server, 9 checks, all passing:
- two comments are posted on a public portfolio, and each is reported by someone else
- a non-admin is refused
- the admin sees both, with the author's and owner's emails and the reasons
- one is restored and one removed; changing an already-handled comment again is refused
- only the restored comment shows on the portfolio
- learner lookup finds the owner's plan, hand-in, file and public portfolio
- storage shows totals and the biggest users
