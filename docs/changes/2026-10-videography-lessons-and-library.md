# Videography: lessons, hand-ins, AI feedback and the curated video library

Branch: `feat/videography-lessons-and-library` (based on `feat/v15-learning-model` at `b4ef3e3`)

## Summary

Every Videography module is now a set of short lessons, followed by a task and AI feedback. Each lesson opens with a looping sketchbook clip and ends with a hands-on practice tool. Videos come from the curated library spreadsheet. Learners hand in their work, get a Claude review, and keep everything in My Work, sorted into a folder per module.

## What changed

### Module page: Lessons → Task → Feedback (→ Finish)
- **Lessons.** One lesson per curriculum topic: 229 across the 42 modules.
  - Each lesson has a short idea, the matching videos and a practice tool ("Reflect: try it").
  - The tools are: put in order, sort into groups, choose an answer, spot the problems, a brightness (exposure) simulator, a white-balance slider, a sound-level meter and a framing grid.
  - Lesson ticks are saved on the learner's device.
- **Task.** Each task has a name and number (e.g. *Task B01 · Tell a story in six pictures*), and the brief is the main thing on the page.
  - Written tasks are answered in a text box.
  - Media tasks need at least one file (up to 3) or a link, plus a short note.
  - Self-rating and reflection questions start at beginner module 4, and at module 1 for Intermediate and Advanced.
- **Feedback.** Claude reviews the work automatically after hand-in: a score, a note per check, a strength, an improvement and a next step.
  - Rotating videography tips show while the review runs.
  - Each module allows 2 reviews.
  - The learner's own rating sits next to the AI's, with big gaps highlighted.
- **Finish** (last module of each level). Shows what was learned, the best pieces and a link to share the portfolio. "Start Intermediate / Advanced" appears once every module in the level is handed in.

### Sketchbook lesson clips
- Every lesson opens with a 3-second hand-drawn clip that draws itself and loops like a GIF. Clips are muted, autoplay and play inline.
- They're made with the *animate* skill's sketchbook style. The source is in `pieces/lesson-sketches/`.
- The clips are in `public/sketches/`: 229 MP4s plus WebP posters, about 26 MB in total (~115 KB per lesson).
- Re-render with `node pieces/lesson-sketches/render.mjs clips public/sketches [ids]` (needs the animate skill's Playwright install and ffmpeg).

### Curated video library
- `scripts/import-video-library.py` turns `Video_Library_Module_by_Module_Merged.xlsx` into `app/videography/video-library.json`: 177 entries covering 42 modules and 8 style pathways.
- Every entry is placed on the lesson it teaches, starting at the listed section where a timestamp is given.
- Style modules (B13 / I13 / A13) show only the learner's chosen style.
- YouTube videos play in the page. Videos on other sites show as link cards marked *Free* or *Optional · paid*.
- B01 still opens with Philipp Humm's storytelling video, then *Directing Without Words*.

### My Work
- Every hand-in is saved automatically, in a folder per module. Learners can remove a whole piece or a single file. The public portfolio updates, and is taken down if nothing is left.
- Each piece shows its AI feedback.
- "See it in My Work" opens that module's folder with a link back to the module.
- Opened directly, My Work starts with a training overview: modules done, pieces handed in, average AI score and hours.

### Plan dashboard
- New "What you'll be able to do" card.
- New start-date picker: Today, Next Monday, 1st of next month, or any date.
- Once Free is chosen, or a paid plan is active, the plan picker hides behind an **Upgrade** or **Get a mentor** button.

### Free plan
- Modules 1–2 are fully open. From module 3, lesson tools and tasks show "Unlock with Self-paced", and the server blocks uploads and hand-ins too.
- Videos stay free for everyone.

### Removed
- The "Open on YouTube" link, the third-party-videos disclaimer and the "try this with your other interests" line.
- The still image shown for reduced motion. Sketches always animate.

## Server / API
- `POST /api/state`:
  - New `video_submit` action: validates the hand-in and checks upload ownership.
  - New `submission_remove` and `submission_file_remove` actions; both republish the portfolio.
  - `programme_update` accepts `level` to move up one level, only when every module of the current level is done.
- `GET /api/review?all=video` returns the latest review for each hand-in, for My Work and Finish.
- `POST /api/review` for Videography requires a `submissionId`. The review never sees the learner's self-rating.

## Testing
- `node --test tests/*.test.mjs`: 93 passing. The tests cover:
  - every module has one lesson per topic, with a valid tool and no sentence over 20 words
  - every library row is used on a lesson and every module has videos
  - every lesson has its clip and poster, each under 300 KB
  - the hand-in rules, the self-check rule and the free plan
- End-to-end API run, 30 checks:
  - hand-in validation and live Claude photo screening and reviews
  - the free-plan lock
  - My Work removal and portfolio republish
  - the level-move rules
- Browser checks:
  - the lesson tools, autoplay and looping of the clips, link cards, timed starts and the Finish page
  - Free-plan locks and phone width (no sideways scroll)
- `npm run build` passes all size budgets. Shared styles are at 58 / 60 KB.

## Deploy notes
- Deployed to staging (`framepath-staging`). No database changes in this branch.
- Staging needs the `ANTHROPIC_API_KEY` secret, which is already set.

## Known gaps
- Lesson ticks are stored per device, not per account.
- Most library editing lessons teach Premiere Pro, while some earlier videos use DaVinci Resolve.
- Some tasks ask for more pictures than the 3-file limit. The upload area suggests a collage or a folder link.
