# Honest level check: habit questions, skill checks and shuffled answers

Branch: `feat/honest-level-check` (based on `feat/videography-lessons-and-library`)

## Problem

The 12-question level check gave away its answers. Every question listed its options from beginner to pro, and the last option always sounded the most professional. Learners could pick "D" every time, or the fanciest-sounding answer, and be placed too high.

## What changed

### Two kinds of question
Each skill area now asks one of each:
- **"What did you do" question.** It asks about a real past shoot, e.g. *"The last time you recorded someone talking, where was the phone?"*. Every option is a reasonable thing to have done. Beginners get an honest way out, like *"I haven't recorded anyone yet"*.
- **Quick skill check.** It has one right answer and a **Not sure** option. Some checks are pictures made from existing lesson images: *"Which picture is too bright?"*, *"Which picture has an orange colour cast?"* and *"Which frame puts the cup on a rule-of-thirds crossing?"*.

There are still 12 questions per learner (2 per area across 6 areas), and they're still adaptive. After strong answers the next question is harder; after weak ones it's easier. The bank now has 37 questions: the opening question, plus a "what did you do" question and a skill check at each of easy, medium and hard for every area.

### Shuffled answers
- Answers appear in a different order for each learner and each question. The order is set by a seed stored in the learner's draft.
- **Not sure** and **I haven't done this yet** always stay last.
- Picture answers are labelled by their position on screen (Picture A, B, C).
- The server still scores the answer itself, so the order changes nothing on the server.

### Claims are checked against skill
- A missed skill check caps that area's score:
  - a missed hard check keeps the area below Advanced
  - a missed medium check keeps it below Intermediate
  - a missed easy check keeps it low
- **Advanced** needs 5 of 6 skill checks right; **Intermediate** needs 3.
- The overall score is now the average of the six area scores.
- Someone who claims pro habits but answers "Not sure", or guesses wrong, can't be placed at Advanced. A test covers this.

### Wording
- Under "what did you do" questions: *"Pick what you really did, not what sounds best. Honest answers give you a plan that isn't too easy or too hard."*
- Under skill checks: *"One answer is right. If you don't know, pick 'Not sure'. Guessing only gives you a plan that's too hard."*
- Skill checks carry a **Quick skill check** label.
- The result screen shows *"Skill checks: N of 6 right."*

## Code
- `app/videography/programme.ts`:
  - new `Question` shape (`kind`, and `options` carrying their own `score`, optional `visual` and `last`)
  - new question bank
  - `optionOrder(question, seed)`
  - `nextQuestion` now asks a "what did you do" question, then a skill check, in each area
  - `assess` adds the area caps and the `checks` count, and accepts any valid option index
- `app/videography/start.tsx`: shuffled answers, picture answers (`OptionPicture`), the skill-check label, new hints and the skill-check result. The draft key moves to `fp-programme-draft-v3`, so old drafts start fresh.
- `app/videography/videography.css`: picture-answer grid, thirds-grid overlay and the skill-check tag.

Saved plans are unaffected. Plan updates keep the assessment they were made with.

## Testing
- `node --test tests/*.test.mjs`: 95 passing. New tests cover:
  - the question bank: every area has both kinds at every tier, right answers are stored first, every check has Not sure, and no sentence is over 20 words
  - shuffling: orders differ between learners, Not sure stays last, and the right answer isn't always first
  - a professional is placed at Advanced with 6/6 checks
  - a newcomer is placed at Beginner
  - a bluffer who claims pro habits but misses or guesses the checks is not placed at Advanced
  - middle answers are placed at Intermediate
  - tampered answer lists are rejected
- End-to-end API run: all checks pass.
- Browser checks of "what did you do" questions and picture skill checks.
- `npm run build` passes with all size budgets.

## Not in this change
- Learners can still pick a different level on the result screen. That's kept as a deliberate choice.
- Next step: suggest moving up or down a level after the first AI-reviewed task.
