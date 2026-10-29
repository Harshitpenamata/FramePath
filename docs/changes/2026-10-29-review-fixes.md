# Review fixes: parts, fair scoring, levels instead of a 0-100 number

From a review of the AI review experience.

## 1. Missing work was scored as bad work
- The review guide now says: rate each check only on what was handed in; if a check can't be judged because its evidence is missing, leave it empty and say what to add. A strong frame is a strong frame even when the notes are thin.

## 2. Each part of a task has its own field or slot
- `app/videography/task-parts.ts` lists the parts of every module's task (45 modules). Text parts are a text box, file parts an upload slot (one link covers every file slot).
- The Make tab shows "N of M parts added" with a bar, a tick per part, and names the empty ones on the Hand in button ("add “Your shot list”"). A hand-in can't be sent with a part missing, so no review is spent on half a hand-in. The server checks the same rule (`handInMissing`).
- The text parts are written into the answer, so reviews and My Work read it as before; files are kept per part and listed to the reviewer ("Files by part"). Hand-ins made before this have no parts and work as before.
- The same parts fit every style of a task; the style changes the subject, not what has to be handed in. The file limit per hand-in goes from 3 to 12 (4 per part). The AI still looks at up to 3 pictures and 2 videos.

## 3. The 0-100 number is gone from the review
- The review shows points out of the maximum ("8 of 12"), and "Up from 2 to 8" on a resubmission.
- Each check shows a level in words: Not yet (0-1), Getting there (2), Solid (3-4). Your own rating shows the same way.
- The yellow "You and the AI see this differently" on every row is one calm note above the table: the AI is a first look, not a verdict. The "What the AI couldn't check" line stays removed.

Files: `app/videography/task-parts.ts`, `programme.ts`, `lesson.tsx`, `lesson.css`, `review-guide.ts`, `app/api/state/route.ts`, `app/api/review/route.ts`, `tests/videography.test.mjs`.

## Try again

After an AI review, while the module still has a chance left, the review shows a "Try the task again" card (how many chances are left) with a button back to the Make tab. When both chances are used it says so instead.
