# Reflect questions (13 Oct review, phase 2)

Branch: `feat/reflect-questions` (based on `feat/portfolio-community`)

> **Partly drafted.** The Anthropic API ran out of credits mid-run. Questions exist for **all of Beginner (B01–B14) and I01–I05**. I06–I14 and all of Advanced keep their earlier activity until they're drafted:
> `node scripts/draft-reflect-questions.cjs I06 I07 I08 I09 I10 I11 I12 I13 I14 A01 A02 A03 A04 A05 A06 A07 A08 A09 A10 A11 A12 A13 A14`

## Summary

The 13 Oct review asked for Reflect to cover the whole lesson, including what its videos teach. It also pointed out that the old Reflect activity could be answered just by looking at the lesson's sketch. Reflect is now **2 or 3 multiple-choice questions per lesson**, for every lesson. So far that's 215 questions across 99 lessons:
- **one applied question:** a short, real situation (a family function, a street market, a small shop's reel) where the learner picks what they'd do
- **one or two video questions** on what the lesson's videos teach. Each names its video (*"from 'Visual Storytelling in Filmmaking'"*). Lessons without videos get two applied questions.

The hands-on simulators (exposure, white balance, sound mix, framing) stay. In those lessons they come after the questions, under *Now try it*. The old order, sort, pick and spot activities are replaced by the questions.

## What learners see
- Under **Reflect**, each question shows:
  - its number (*Question 2 of 3*)
  - the video it draws on, if any
  - three answers, in a fixed shuffled order
- **A wrong answer** says why it isn't the best choice, and *Try another answer*.
- **The right answer** locks the question and explains why it's right.
- **The lesson's Reflect is done** when every question is answered right and the simulator, if there is one, is solved. This counts toward finishing the lesson, as the old tool did.
- **Wording:** status lines now say *"answer the Reflect questions"* instead of *"solve the practice tool"*.

## How the questions were written
- **Drafting:** `scripts/draft-reflect-questions.cjs` sends Claude (`claude-opus-5-5`, adaptive thinking) one module at a time. Each request includes every lesson's title and idea, the old activity (for content only), and each video's title, creator, section and *watch for* note.
- **Checking:** a second Claude pass reviews each module's set against the rules and fixes or replaces any question that fails. The rules:
  - exactly one answer is clearly right
  - the question can't be answered from the title, idea or sketch alone
  - answer lengths don't give the answer away
  - no "all/none of the above"
  - plain English
  - the video is named correctly
- **Output:** one file per level, `app/videography/reflect/{beginner,intermediate,advanced}.json`, with the right answer stored first. Each file loads only on lesson pages for that level.
- **Rerunning:** the script can be rerun for single modules, e.g. `node scripts/draft-reflect-questions.cjs B04 I07`. It needs `ANTHROPIC_API_KEY` in `.env.local`.

**Please review the questions level by level.** Edit the JSON directly, or rerun a module.

## Code
- `app/videography/reflect.tsx` (new): `ReflectStep` loads the level's questions, shows them, and runs the simulator afterwards. A lesson without questions falls back to its earlier tool.
- `app/videography/module-context.tsx`: Reflect uses `ReflectStep`; wording updated.
- `app/videography/lesson.tsx`: wording updated.
- `app/videography/videography.css`: Reflect styles.
- `scripts/draft-reflect-questions.cjs` (new): the drafting and checking script.
- No server change. Finishing Reflect still saves `lesson_progress { tool: true }`.

## Testing
- `node --test tests/*.test.mjs`: 97 passing. A new test checks every drafted lesson:
  - each has 2 or 3 questions, each with three different answers
  - wrong answers carry feedback
  - no all/none of the above
  - the right answer isn't much longer than the others
  - the right answer isn't the idea sentence the sketch draws
  - all of Beginner has questions
- Browser, B01 lesson 1:
  - three questions show, two of them naming their video
  - a wrong answer shows its feedback and *Try another answer*
  - the right answer locks and explains
- `npm run build`: all budgets pass. The questions load in their own per-level files.
