# Lesson videos: updates from the Videography database

Branch: `feat/videography-database` (based on `feat/lesson-videos`)

## Summary
These are the updates from the team's `FramePath_Videography_database.xlsx`, which checked all 290 lesson video rows. **Every one of the 229 lessons now has at least one video.**

## What changed
- **7 lessons that had no video** get the team's picks. Each was checked to exist and to play inside FramePath, and each has a one-line *Watch for* written from the video's description.

  | Lesson | Video | Creator | Views (14 Oct) |
  |---|---|---|---|
  | I02-3 | How to Write a Creative Brief | Jotform | 3K |
  | I03-6 | So You Wanna Make a Movie: Backup Plan | TheMelHurry | 24 |
  | I08-6 | Saving Sequence versions in Adobe Premiere Pro | VideoRevealed | 62K |
  | A01-5 | The One Storytelling Shift That Will Make Your Documentary Unforgettable | Early Light Media / Darren Durlach | 7K |
  | A02-3 | How to Get Anyone to Trust You with Their Story | Amine Hamouda | 2K |
  | A12-4 | An Overview of the Quality Control Process for Films & TV Shows | Phil Svitek | 1K |
  | A13-4 | How To Handle Video Revisions For Clients | Nick Metzger | 386 |

- **B02-2 "Know who will watch"** now uses the team's Shootsta Academy page, *Discover Your Target Audience*. It opens inside FramePath's window. The title and credit now name Shootsta Academy, not the earlier YouTube video.
- **B10-1** had Blackmagic's *Introduction to audio* on Vimeo, which has been taken down ("Sorry, we couldn't find that page"). It's replaced with Alli and Will's *DaVinci Resolve Fairlight Tutorial: Audio for Beginners*: 32K views, 15 minutes, plays inside FramePath. The first choice, Jason Roberts' Fairlight overview, has embedding turned off.
- **The 51 "Player embedded" rows** are the Adobe tutorial pages, which hold a video player inside the page. They open in FramePath's window as before, so nothing changed for them.

## Code
- `Lesson_Videos_Needed.csv` and `app/videography/lesson-videos.json`: the 7 picks and B02-2.
- `app/videography/lessons.ts`: an imported lesson video can also be a page on another site (`url`), shown in the window.
- `scripts/import-lesson-videos.py`: accepts such pages after checking they load and allow being shown inside another site.
- `app/videography/media.ts`: `resolveAudio` points to the new YouTube lesson.
- `scripts/export-lesson-videos.cjs` (new): writes `FramePath_Lesson_Videos.csv` with every lesson video. The list now has 290 rows, 204 different videos, and no lesson without a video.
- `tests/videography.test.mjs`: every lesson must have a video.

## Testing
- `node --test`: 100 passing. `npm run build`: all budgets pass.
- Browser: B02-2 opens the Shootsta page inside FramePath, with its credit bar.

## Note
Several team picks have very few views. A13-4 has 386 and I03-6 has 24. They're kept as the team chose them. Worth a second look if better ones turn up.
