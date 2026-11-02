# Check every file in the hand-in, and show progress while the review runs

- **Every clip and photo is checked.** A Drive folder link: every video and photo in it, in folder order (up to 40 per review as a safety limit; anything over that, and any file that isn't a video or photo, is listed to the reviewer as not checked). Uploads: every video, and every photo after the first three (the first three go to Claude directly; the rest are described by Gemini).
- **Photos in a folder** are opened too (JPG, PNG, WebP, HEIC), with photo instructions for Gemini instead of video ones.
- **MKV in a folder** stops the hand-in with a message to save as MP4, since Gemini can't watch MKV.
- **Faster:** clips are checked up to 8 at a time. A clip that fails for a reason other than a busy service is tried once more, and the reason is saved with the review.
- **Progress bar:** the waiting screen shows "Checking your 7 clips and photos" then "Writing your review", with a bar that fills over the expected time for that many files and slows near the end. No time promise; it says to keep the page open, and says so again if it runs long.

Tested locally with the 7-clip folder: all 7 watched (3 to 5 s each), review scored 8 of 12 with the wide, action and detail shots found. Cost about $0.052 (Claude $0.048, Gemini 7 x $0.0005).

Files: `app/handin-links.ts`, `app/gemini.ts`, `app/api/review/route.ts`, `app/api/state/route.ts`, `app/videography/lesson.tsx`, `app/videography/lesson.css`, `tests/videography.test.mjs`.
