# Scroll to the questions

The lesson's questions (including the zoom, frame and exposure exercises) sit below the video, and it wasn't clear they were there.

- **Landing:** opening a lesson (from Continue, Today, or a module link) whose videos are done and questions aren't solved scrolls to the questions ("Think it through").
- **Video ends:** when a YouTube or Vimeo video ends and that finishes the lesson's videos, the page scrolls to the questions. It does not scroll at the 70% mark, so nobody is pulled away mid-video.
- **Cue:** while the questions are open but out of view, a "Questions are ready" button floats at the bottom of the screen; clicking it scrolls there. It disappears once the questions are on screen or solved. It doesn't animate for people who prefer reduced motion.

Files: `app/videography/module-context.tsx`, `app/videography/lesson.css`. Builds on the module page (#53) and resume (#65).
