# AI reviews now watch video hand-ins

Branch: `feat/video-review-gemini` (based on `feat/review-14oct`)

## Summary

Claude can't take video, so until now a hand-in that was only a video was reviewed from the learner's typed notes. The review said *"I cannot watch videos…"*. For a videography course, that meant the main feature didn't do its job.

Video hand-ins are now **watched by Google Gemini, picture and sound**:
1. Gemini returns plain, timestamped notes. They cover:
   - every shot (size, framing, movement, steadiness)
   - focus and exposure
   - colour and light
   - sound (speech, noise, music, silence)
   - the order of shots, pacing, and titles
2. **Claude writes the review from those notes**, with the same rubric, scoring and style as before. It points to moments in the video, such as *"at 0:06 the title card…"*.

## How it works
- **What gets watched:**
  - up to **2 video files** per hand-in (MP4, MOV and so on)
  - a **YouTube link**, if the learner gave one; Gemini watches public YouTube videos directly
- **The steps:** each file is uploaded to Gemini's Files API, Gemini watches it, and the file is **deleted from Google straight away**.
- **Limits:** watching happens only after the review is reserved, so the existing limits apply (2 per module, 8 an hour, 200 a day).
- **When watching fails:** the review still runs, and says the video couldn't be watched.
- **The model is a setting:** `GEMINI_MODEL`. The default for testing is the low-cost **`gemini-3.5-flash-lite`**. For better notes later, set it to `gemini-3.8-flash`, with no code change:
  `npx wrangler secret put GEMINI_MODEL --name framepath-staging`
- **Keys:** `GEMINI_API_KEY` in `.env.local` locally, and as a Worker secret on staging.

## What Claude is told
- `videoWatch` holds notes from a model that watched each video in full, picture and sound.
- It should treat those notes as evidence for sound, motion, continuity and editing, and cite timestamps.
- It should say "the video shows", not "I watched".
- It should still say plainly when a video couldn't be watched, and never claim to have opened links that weren't watched.

## Code
- `app/gemini.ts` (new): `watchVideo()` uploads the video, waits until Google has processed it, asks for structured JSON (`duration`, `hasSpeech`, `notes`), and deletes the file.
- `app/api/review/route.ts`:
  - finds the video files and YouTube link
  - watches them in parallel once the review is reserved
  - adds `videoWatch` to what Claude sees
  - updates the prompt
  - saves which videos were watched with the review (`watched`)

## Testing
- **The helper on its own,** with the live Gemini API:
  - **A local clip:** a 2-second sketch with no audio track, about 11 seconds to process. At first the lite model wrongly reported speech in the silent clip. The instructions now tell it to report only sounds it hears and to write "No sound" otherwise. On the retest it said "No sound", which ffprobe confirms is right.
  - **A 9-minute public YouTube video:** about 15 seconds, with accurate shot-by-shot notes.
- **End to end against a local server:** a 12-second test video (a test pattern with a 440 Hz tone, then a blue *"MY KITCHEN"* title card with an 880 Hz tone) was handed in for B04, then reviewed. The whole review took about 20 seconds. Claude's review said:
  > The video shows a test pattern with beeps (0:00–0:06), then a blue title card saying "MY KITCHEN" (0:06–0:11). It does not show any real filmed scene yet, so this task is not started.

  That's accurate, and the ratings were 0 because there's no real footage. All 6 checks passed. Afterwards, Google's file list was empty.
- `node --test tests/*.test.mjs`: 99 passing. `npm run build`: all budgets pass.

## Notes
- **Model quality:** the lite model is cheap but less careful. It needs firm instructions; the silent-clip error above was one example. Use `gemini-3.8-flash` for real learners.
- **Timing:** each review takes about 20–40 seconds longer while the video is processed.
- **Privacy:** learners' videos are sent to Google for watching and deleted straight after. The consent and safety text should mention this before launch.
