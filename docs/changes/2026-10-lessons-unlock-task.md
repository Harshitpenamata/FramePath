# Finish the lessons to unlock the task

Branch: `feat/lessons-unlock-task` (based on `feat/portfolio-showcase`)

## Summary

> **Currently switched off for testing.** `requireLessonsForTask` in `app/videography/lessons.ts` is `false`. Tasks are open as before, but lesson progress (watched videos, solved tools) is still tracked and saved. Set it to `true` to turn the lock on.

A module's task stays locked until every lesson in that module is finished. A lesson is finished when the learner has:
1. **watched each video:**
   - YouTube or Vimeo videos must actually play for at least 70% of their length; skipping ahead doesn't count
   - videos on other sites count once they're opened
2. **solved the lesson's practice tool.**

Progress is saved to the account, so it carries across devices. The rule applies to everyone, including modules that were handed in before this change.

## What learners see
- **Each lesson** shows what's left, e.g. *"To finish this lesson: watch all 3 videos (1 of 3 done) and solve the practice tool (not yet)"*. It shows *"Lesson finished"* once everything is done.
- **Videos:**
  - under the player: *"Watch most of this video to tick it off"*, or *"Watched"*
  - in the video list: watched videos show a tick
  - link cards: these show *"Opened"* once clicked
- **Lesson steps** at the top tick off as each lesson is finished.
- **The "Your task" card** on the Lessons tab says *"Finish all 4 lessons to unlock this task (N of 4 done)"* until it's unlocked.
- **The Task tab** shows *"Finish the lessons to unlock this task"*, with a checklist of the lessons. Each one links straight to that lesson.
- **Free plan, module 3 onwards:** lesson tools and tasks still show *"Unlock with Self-paced"*. Videos stay free to watch.

## How watching is measured
- Embedded YouTube players are loaded with `enablejsapi=1`. The page listens for the player's progress messages (current time, player state); Vimeo uses its `timeupdate` messages.
- Only real playback counts. Time moves forward in small steps while the player is playing; jumps of more than 2.5 seconds are ignored.
- A video is ticked off at 70% of its length, measured from its start time (`watchShare` in `lessons.ts`).
- In the browser, a YouTube video sent 91 progress messages in about 24 seconds of playing. A simulated full viewing ticked the video off and saved it to the account.

## Server
- New state action **`lesson_progress`** `{ key, index, video? , tool? }`:
  - **Checks:** the module exists, the lesson index is valid, the video belongs to that lesson, and the plan covers the module (Free covers modules 1–2).
  - **Doesn't check** whether the previous module's task is handed in, so learners can do lessons ahead.
  - **Stores** progress in `state.lessonProgress[moduleKey][lessonIndex] = { v: [videoIds], t: toolSolved }`.
- **`video_submit`** is refused until every lesson is finished: *"Finish the lessons first: N of M done."*
- **Shared rules** live in `app/videography/lessons.ts`: `videoId`, `lessonNeeds`, `lessonFinished`, `lessonsStatus` and `watchShare`. They follow the learner's style for B13, I13 and A13.

## Code
- `app/videography/lessons.ts`: the completion rules.
- `app/api/state/route.ts`: the `lesson_progress` action and the hand-in check.
- `app/videography/module-context.tsx`:
  - `useWatchTracker`, which counts playback in YouTube and Vimeo players
  - `VideoPanel`, which reports when a video is watched and when a link is opened
  - the lessons tab's saved progress and status line, and the locked task card
  - local lesson ticks are replaced by saved progress
- `app/videography/lesson.tsx`: the locked Task tab with its lesson checklist.
- `app/videography/videography.css`: styles for the status lines and the checklist.

## Testing
- `node --test tests/*.test.mjs`: 96 passing. A new test covers when a lesson counts as finished: every video plus the tool; a lesson with no video needs only the tool; and lessons follow the learner's pathway.
- End-to-end API run, 33 checks, all passing. New checks:
  - a hand-in is refused before the lessons are finished, and while only part of them are done
  - progress is refused for a video that isn't in the lesson, and for a lesson that doesn't exist
  - Free plan lesson practice from module 3 is refused
  - after finishing every lesson, hand-ins work as before
- Browser:
  - real YouTube progress messages are received
  - a simulated full viewing ticks the video off and saves it
  - the locked Task tab lists the lessons
- `npm run build` passes all size budgets. Shared styles are at 59.0 / 60 KB.

## Notes
- A learner can still start a long video and leave it running. That counts as watching. Checking engagement more closely would need quizzes.
- If a creator turns off embedding for a video, that video can't be ticked off. Every library video was checked as embeddable on 13 Oct 2026.
