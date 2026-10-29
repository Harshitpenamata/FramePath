# Harder, fairer Reflect questions

The questions after the lesson videos (Reflect and "Already know this?" test-out) had two problems.

## 1. The right answer was almost always B

The correct answer is stored first and a hash shuffled the display order, but the shuffle was lopsided: the right answer landed on B about 70% of the time and on A almost never. `answerOrder` (in `app/videography/lessons.ts`) replaces it: an FNV hash seeds a Fisher-Yates shuffle, so the right answer is now spread evenly over A to D (about 20-30% each). The order is still fixed per question, and test-out uses the same function.

## 2. The wrong answers were easy to dismiss

All 553 questions (177 Beginner, 181 Intermediate, 195 Advanced) now have **four** options instead of three, and the wrong answers are plausible ones: things a learner who half-watched might pick, each with a short reason why it fails. Beginner wrong answers were rewritten throughout. In Intermediate and Advanced the strongest existing wrong answers were kept and new ones added or rewritten. The questions and right answers are unchanged.

## Tests

- The bank test now requires four distinct answers per question (feedback on each wrong one, right answer not much longer than the others, as before).
- New: the right answer's position share is between 15% and 35% for A, B, C and D in every level.

## Known limit

The right answer is still the longest option more often than chance (Beginner 52%, Intermediate 71%, Advanced 76%, against 83-89% before). A learner can use that as a clue. Fixing it means lengthening wrong answers one by one, which is a later pass.
