# Google Doc links as hand-ins, and no review for work the AI can't open

## Google Docs

- Written work or photos can be handed in as a Google Doc link in the existing link field.
- The doc is exported as **PDF** (`/export?format=pdf`), with no sign-in, so Claude sees its pictures as well as its text. The cap is 15 MB. The worker never holds the file: it checks the link gives a PDF, then gives Claude the export URL to fetch itself (a 10 MB PDF as base64 hit Cloudflare's resource limit, error 1102, and the review returned an HTML error page).
- The doc must be shared with General access set to "Anyone with the link" (Viewer is enough). Otherwise Google returns a sign-in page.
- Only `https://docs.google.com/document/d/<id>` links count (`googleDocId` in `app/videography/programme.ts`).

## Links are checked before a review is used

`app/handin-links.ts` (`linkProblem`) checks a hand-in link when the work is handed in, and again before an AI review is counted:

| Link | Openable when |
|---|---|
| Google Doc | the PDF export downloads |
| YouTube | it is Public or Unlisted (oEmbed answers) |
| Google Drive | it downloads as a video |
| anything else (Vimeo, websites) | never: the learner is told to upload, or use one of the three |

Uploaded files are also checked to still be in storage. If anything can't be opened, the hand-in or review is refused with what to fix, and the review allowance is not used.

The Make tab has a note under the link field on sharing.

Files: `app/handin-links.ts`, `app/api/review/route.ts`, `app/api/state/route.ts`, `app/videography/programme.ts`, `app/videography/lesson.tsx`, `tests/videography.test.mjs`.
