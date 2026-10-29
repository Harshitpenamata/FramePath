# Continue where you left off

The Continue button and a module's page always opened at lesson 1, so coming back to a half-finished module sent the learner back to the start. Now:

- **Continue** (plan page) and **Today** (My courses) link to the module's first lesson whose questions aren't solved yet, or to the task once every required lesson is done.
- **Opening a module directly** (from the module list or a link without a lesson) does the same, once the learner's progress has loaded. A link that names a lesson (`?lesson=3`, such as "Rewatch lesson 3") still opens that lesson.
- Optional lessons and style extra lessons don't count as unfinished.

Not covered: the position inside a video. A lesson reopens at its start.

Files: `app/videography/lessons.ts` (`resumeLesson`, `continueHref`), `app/videography/module-context.tsx`, `app/videography/dashboard.tsx`, `tests/videography.test.mjs`.
