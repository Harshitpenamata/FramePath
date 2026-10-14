# 14 Oct review fixes

Branch: `feat/review-14oct` (based on `feat/reflect-questions`)

## Summary

These are the nine changes from the 14 Oct review. Eight are built here. For the ninth, lesson videos, this change adds a sheet for the team to fill in and an importer to bring the videos into the lessons.

## What changed
1. **The level is set by the level check.** Step 3 ("Your time") no longer lets learners pick a different level. It shows the level their answers put them at, and says they move up by finishing it. The server enforces this too: a new plan always uses the checked level, and only *moving up* (after finishing every module) changes it.
2. **Modules are grouped by stage** on the plan page and on Explore: Ideas, Planning, Filming, Editing, Your pathway and Final project.
   - Each group opens and closes like a drop-down, and shows how many modules it has and how many are done.
   - The group holding the next module starts open.
   - A finished group is tinted green.
3. **"Next module" only appears on a module's last lesson,** or once that module's task is handed in.
4. **The lesson sketch plays at half speed.**
5. **My courses:** a learner's styles (Wedding, Documentary, YouTube…) are tiles, with up to **3 at a time**.
   - **Each tile** shows its level, a progress bar and its modules done. One is the **Current course**; the others have *Switch to this course*. Tiles can be removed, and *Add a style* adds one.
   - **Core modules** count for every style.
   - **Each style has its own style project** (B13 / I13 / A13): handing it in for Wedding doesn't count for Documentary.
     - Switching courses swaps that project's progress, plus the videos that depend on the style.
     - A removed style's project progress is kept, and comes back if the style is added again.
   - **New plans** start with up to 3 styles taken from the learner's interests, in the order picked.
   - **Plans made before this change** have one course: their first interest's style.
6. **Watched videos fill green** in the lesson's video list (70% watched for YouTube or Vimeo). Lessons on other sites fill green once opened.
7. **Every lesson needs a video: a sheet for the team.**
   - **The sheet:** `node scripts/lesson-videos-sheet.cjs` writes `Lesson_Videos_Needed.csv`, which opens in Excel. It has 122 rows:
     - **94 lessons with no video**
     - **28 rows for links that can't be shown inside FramePath** (StudioBinder, Adobe Help, Deity, Sundance and others). Some links appear once per style.
   - **What to fill in:** the YouTube URL, the title, the creator, an optional start time, and a one-line "Watch for".
   - **Importing:** `python scripts/import-lesson-videos.py Lesson_Videos_Needed.csv` (an .xlsx copy works too). It checks every link exists and allows embedding, using YouTube's oEmbed. It fills in the title and creator from YouTube if they're blank, and reports any bad rows. It writes `app/videography/lesson-videos.json`.
   - **In the lessons:** imported videos are added to their lesson, or replace the link named in "Replaces this link". They can be limited to one style.
8. **Finished things fill green:**
   - finished lessons in the lesson steps
   - the stages under "Where this fits in making a video", once every module in that stage is handed in
9. **Lessons on other sites open in a window on FramePath,** in most cases instead of a new tab.
   - **The window's credits:** the title, *By <creator> · on <site>*, an *Open on <site>* link, and a credit line.
   - **Closing it:** Escape, the close button, or clicking outside.
   - **Which sites:** 27 of the 39 external links allow this. The rest still open in a new tab until they're replaced through the sheet (item 7).

## Code
- `app/videography/programme.ts`:
  - the level rule
  - `styles` on the plan, `maxStyles`, `stylesOf()` and `styleModuleKeys`
  - `projectLabel` follows the active style
- `app/api/state/route.ts`:
  - `programme_update` takes `style`, `addStyle` and `removeStyle`
  - `switchStyle()` keeps each style's project progress in `state.styleProgress`
  - style-project hand-ins record their `pathway`
- `app/videography/start.tsx`: no level picker in step 3.
- `app/videography/dashboard.tsx`: `MyCourses` tiles; `ModuleList` grouped by stage in `<details>`.
- `app/videography/module-context.tsx`:
  - stages and watched videos fill green
  - `SiteWindow` for other sites
  - the sketch at half speed
  - `LessonsTab` reports the open lesson
- `app/videography/lesson.tsx`: Next module only on the last lesson.
- `app/videography/lessons.ts`: imported lesson videos (`lesson-videos.json`), merged into `lessonVideos()`.
- `scripts/lesson-videos-sheet.cjs` and `scripts/import-lesson-videos.py` (new), and `Lesson_Videos_Needed.csv`.
- `app/videography/videography.css`: the stage groups, course tiles, green done states and the site window.

## Testing
- `node --test tests/*.test.mjs`: 99 passing. New tests:
  - a new plan ignores a requested level
  - up to 3 styles are taken from interests, a 4th is refused, switching works, and old plans get one style
- End-to-end API run, 12 checks, all passing:
  - asking for Advanced on a new plan gives the checked level
  - two interests make two courses
  - the Wedding style project is handed in; switching to Documentary shows it not done; switching back shows it done
  - adding a third style works; a fourth is refused
  - switching to a style that wasn't added is refused
  - removing the active style moves to another; the last style can't be removed
  - other updates keep the courses
- Browser:
  - My courses tiles and stage groups on the plan page (Ideas and Planning green, Filming open)
  - on B06, Next module is hidden on lesson 1 and shown on the last lesson
  - the sketch's playback rate is 0.5
  - Ideas and Planning stages are green
  - an opened lesson card fills green
  - adobevideotraining.com and whoismatt.com lessons open inside the window
  - at 390 px there's no sideways scrolling
- The importer: a valid link was accepted and its title and creator filled in from YouTube; a fake link was reported and left out.
- `npm run build`: all budgets pass. Shared styles are at 59.7 / 60 KB.

## Known limits
- **adobe.com** returned "Access Denied" to the headless test browser, which is its bot protection. Check it in a real browser. If it's blocked there too, add `adobe.com` to `noFrameHosts` in `module-context.tsx`, and those lessons will open in a new tab.
- **Some sites may still refuse** to load inside the window even though their headers allow it. *Open on <site>* is always there.
- **Item 7 is waiting on the team** to fill in the sheet.
