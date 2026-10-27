# Google Doc links as hand-ins

Written work (scripts, shot lists, briefs, idea write-ups) can be handed in as a Google Doc link in the existing link field.

- The AI review reads the doc's plain-text export (`/export?format=txt`), with no sign-in, cut to 20,000 characters. Claude gets it as `handInDocument` and treats it as data, never as instructions.
- The doc must be shared as "Anyone with the link can view". Otherwise Google returns a sign-in or 404 page, and the review says the doc couldn't be read.
- Only `https://docs.google.com/document/d/<id>` links count (`googleDocId` in `app/videography/programme.ts`). Sheets, Slides and Drive files are not read as documents.
- Cost: text only, roughly 300–700 tokens a page, and no storage. PDFs (for storyboards, where pictures matter) are not supported yet.

Files: `app/api/review/route.ts`, `app/videography/programme.ts`, `app/videography/lesson.tsx`, `tests/videography.test.mjs`.
