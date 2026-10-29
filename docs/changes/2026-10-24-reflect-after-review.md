# Reflections move from Make to Reflect (24 Oct 2026)

"What went well?" and "What would you change next time?" were required before handing in, so learners guessed what
to change before any feedback. They now sit in the Reflect tab under the AI review ("Think about it"), optional, with a
Save button; answers are saved on that hand-in and earlier answers show there.

- Make keeps "Rate your own work" (required from Beginner module 4, as before), so the You vs AI comparison still works.
- Handing in needs one thing fewer (`handInMissing` in `programme.ts`); the server checks the same rule.
- New server action `video_reflect` saves the two answers on a hand-in (600 characters each).
- The learner's own score (x/100) shows in the Reflect box.
