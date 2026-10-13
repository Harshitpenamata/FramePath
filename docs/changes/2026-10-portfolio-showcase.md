# Portfolio showcase: a gallery of your work, like Behance or ArtStation

Branch: `feat/portfolio-showcase` (based on `feat/honest-level-check`)

## Summary

My Work, and the public portfolio link, now show handed-in work as a visual gallery. Each piece appears as a cover in a grid. Clicking it opens a full-screen viewer where photos show large, videos play, and video links play in place.

## What changed

### My Work
- Two tabs: **Showcase** (the default) and **Manage & share**, which has the existing module folders, remove options and portfolio publishing.
  - Arriving from a module's "See it in My Work" still opens the **Manage & share** tab at that module's folder.
- The showcase grid has one tile per handed-in piece, newest first.
  - **Cover:** the first photo; for videos, the first frame with a play badge; for a YouTube link, its thumbnail; for written tasks, the opening lines.
  - **Under each tile:** the task name, the module, the date, and the AI score once there is one.
  - **Badges:** pieces with more than one file show how many.
- When work exists at more than one level, filter chips appear: **All work, Beginner, Intermediate, Advanced**.

### Viewer
- Full-screen and dark.
- **Media:** photos show large; videos play with controls; YouTube and Vimeo links play inside the viewer.
- **More than one file:** a strip of thumbnails switches between them.
- **Info panel:** the module, level, task name, date, notes, written answer, and the AI score with its summary.
- **Moving around:** arrow buttons and the ← / → keys move between pieces. Esc or a click outside closes it. Focus returns to the tile that opened it.
- **Videos that won't play:** if the browser can't play a file (some iPhone MOV files on Chrome), it says so and offers a download link.
- **On phones**, the viewer stacks: the media, then the thumbnails, then the info.

### Public portfolio (`/p/<token>`)
- It uses the same gallery and viewer for the shared pieces.
- The shared data now includes each file's id and type, plus the module id and date. **File names are not shared.**
- Portfolios published before this change still work: their files are tried as images first, then as video.

## Code
- `app/videography/showcase.tsx` (new):
  - `Showcase`, the grid with its filter chips and the viewer
  - `itemsFromSubmissions` for My Work, and `itemsFromPublic` for a shared link
- `app/videography/work-folders.tsx`: new `WorkTabs` component for the Showcase and Manage & share tabs.
- `app/other-pages.tsx`: My Work and the public portfolio both use the showcase.
- `app/api/state/route.ts`: `publicPortfolio()` adds `moduleId`, `createdAt` and `uploads` (id and type only).
- `app/videography/videography.css`: gallery and viewer styles.
- No database changes. Files are still served by `/api/file/<id>`, which already supports seeking for video.

## Testing
- `node --test tests/*.test.mjs`: 95 passing.
- Browser:
  - **My Work:** the showcase shows photo, video, YouTube-link and written pieces. The viewer plays an uploaded MP4 (loaded, 1280×720).
  - **Public portfolio:** published with 5 pieces; the gallery and video playback work through the portfolio link.
  - **Phone width (390 px):** no sideways scrolling, and the viewer stacks.
- `npm run build` passes all size budgets. Shared styles are at 58.9 / 60 KB, so there's little room left.
