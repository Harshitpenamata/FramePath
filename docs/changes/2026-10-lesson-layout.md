# Lesson page layout (13 Oct review, phase 1)

Branch: `feat/lesson-layout` (based on `feat/lessons-unlock-task`)

## What changed
1. **"Where this fits in making a video":** only the current stage is lit. The other stages are faded.
2. **Lesson intro in two columns:** the looping sketch is on the left. On the right are the lesson number, title, idea and progress, e.g. *"To finish this lesson: watch all 3 videos (1 of 3 done) and solve the practice tool"*.
3. **Watch in two columns:** the player and its "Watch for" note are on the left. On the right is the list of every video title, with watched ticks, plus link cards for lessons on other sites.
4. **The task card appears only after the last lesson** of a module. Earlier lessons end with **Next lesson**.

On phones (760 px and narrower), both two-column rows stack.

## Code
- `app/videography/module-context.tsx`:
  - the lesson card has a new `vg-lesson-intro` row: the sketch, and an "about" column with the title, idea and status
  - `VideoPanel` now has a main column (player) and a side column (titles list and link cards)
  - the task preview only renders on the last lesson
- `app/videography/videography.css`: the faded stages and the two-column grids, with phone breakpoints.

## Testing
- `node --test tests/*.test.mjs`: 96 passing.
- Browser:
  - B01 lesson 1 shows both rows side by side, faded stages, and no task card
  - B01 lesson 4 shows the task card
  - at 390 px there's no sideways scrolling
- `npm run build` passes all size budgets. Shared styles are at 59.1 / 60 KB.

## Next (same review)
- Phase 2: the Reflect rewrite.
- Phase 3: My Work redesign.
- Phase 4: portfolio page and community.
