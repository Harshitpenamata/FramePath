# Extra lessons for each style (23 Oct 2026)

Learners on **Wedding, Corporate or Social media** plans get extra lessons where their style works differently:
16 at Intermediate (only where the style differs) and 36 at Advanced (one per module and style, A01 to A12).
Beginner has none.

- They come **after** the module's shared lessons, so shared lesson numbers, saved progress, sketches and Reflect
  questions don't move. They're tagged "<style> extra" in the lesson list.
- They **don't count towards finishing the module** and never hold back "Next lesson" or the task, so nobody's
  progress changes.
- Each has a short idea and one exercise (pick, put in order, sort or spot), checked like other lesson tools.
- No videos yet (the team adds them in the sheet later). Until then the idea fills the player's space as a
  "Practice lesson".
- Content: `app/videography/style-lessons.ts`, from the "Extra lessons" tabs of the style layer sheet.

Also fixed: lessons without a sketch (these, and the AI and professional-skills lessons) now give the idea the full
width instead of the sketch's narrow column.

Code: `lessonsFor(moduleId, style)` and `lessonsStatus` in `app/videography/lessons.ts`; the lesson list, practice
panel and Next rules in `module-context.tsx`; progress saving and the AI review pass the learner's style.
Test: "style extra lessons" in `tests/videography.test.mjs`.
