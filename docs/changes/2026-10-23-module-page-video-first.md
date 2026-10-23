# Module page: video first (23 Oct 2026)

The module page now opens on the lesson video. Before, a large title, a picture and a summary filled the first
screen, and the player sat below the fold.

## What changed
- **Compact header.** The module title (Anton) on one line on desktop, with module number, hours and stage under it.
  The separate module picture is gone.
- **One toolbar.** Watch / Make / Reflect on the left; "Where this fits in making a video" on the right, now on every
  tab: Ideas → Planning → Filming → Editing → Your pathway → Working with people → Final project, each a line icon
  in a thin circle with its name beside it. The current stage is lime; finished stages get a small tick.
  A thin divider runs under the toolbar.
- **Watch tab, video first.** The player (16:9, sized to the window's height and width) on the left with the lesson
  title, "Lesson X of Y" and Next lesson under it. On the right: "Lessons · N videos", a dropdown of the module's
  lessons (open on desktop, closed on phones), the module summary and its tags.
  Picking a lesson changes the player, title, counter and highlight.
- **Below the fold, unchanged in behaviour:** the lesson's other videos and Watch-for notes, "Already know this
  module?", the idea (with its sketch), Think it through, Previous / Next lesson, the task and Next module.
- **Phones:** the title wraps, the pathway wraps by stage, and the lesson list comes straight after the player.

## Checked (local, signed in)
- Player, title row and lesson list are inside the first screen at 1672×941, 1920×1080, 1536×864, 1440×900,
  1366×768 and 1280×720; no sideways scroll at any size, including 390×844.
- Picking lessons, opening and closing the dropdown, Escape (closes and returns focus), keyboard focus outlines.
- Make and Reflect still open and keep their ?tab= addresses.

Files: `app/videography/lesson.tsx`, `app/videography/module-context.tsx`, `app/videography/lesson.css`.
