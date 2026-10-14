# Lesson videos: paid courses out, YouTube in

Branch: `feat/lesson-videos` (based on `feat/mentorship-coming-soon`)

## Summary
- **Paid courses are removed from lessons:** 15 library entries across 6 courses (Sundance Collab, DSLR Video Shooter academy, Curtis Judd's school, WhoisMatt's course, Unscripted). Every lesson video is now free to watch.
- **The 13 links that sites won't let FramePath show inside its pages,** plus the paid courses, are replaced with **YouTube uploads**. Where the same creator has the same video on YouTube it's used directly; for example, Deity's *How To Hide A Lav Microphone* and StudioBinder's shot-size guide.
- **Lessons with no video now have one.** Before, 103 lessons had none (94, plus 9 that only had a paid course). Now **222 of 229 lessons** have at least one video.

## How the videos were chosen
For each lesson:
1. **Search:** YouTube was searched with filmmaking-specific queries written from the lesson's title and idea. For replacements, the original title and creator were searched first.
2. **Read:** for up to 9 results, the script read each video's **views, likes and top comments** from YouTube.
3. **Filter:** it dropped anything that isn't public or can't be embedded, anything under 1.5 or over 30 minutes, and anything under about 10K views when better options existed.
4. **Choose:** Claude (Sonnet) picked the best fit for the lesson's idea and level. It preferred well-received videos: high views, a good likes-per-view ratio, and top comments that are positive and say the video helped. It skipped ones whose comments call them misleading or clickbait, and wrote a one-line *Watch for*.
5. **Check:** the importer checked every pick with YouTube's oEmbed: all 110 exist and allow embedding.

**The picks:** 110 videos, with a median of **187K views** (lowest 10K). 14 of them replace blocked or paid links.

**The review list:** `Lesson_Videos_Needed.csv` holds every pick, with *Views*, *Likes* and *Why chosen*. To change one, edit the row and rerun `python scripts/import-lesson-videos.py Lesson_Videos_Needed.csv`.

## Still without a video (7)
| Lesson | Topic |
|---|---|
| I02-3 | What to include and what to leave out |
| I03-6 | A backup plan |
| I08-6 | Saving versions |
| A01-5 | What to leave out |
| A02-3 | Getting access |
| A12-4 | Checking exports |
| A13-4 | Changes and delivery for that style |

Nothing on YouTube fitted these well enough. A few weak matches were dropped on purpose, such as a general presentation talk and a video with 1K views. These lessons still have their idea, sketch and Reflect questions.

## Code
- `app/videography/lessons.ts`: paid library videos are left out of lessons.
- `app/videography/lesson-videos.json`: 110 imported videos for 109 lessons.
- `Lesson_Videos_Needed.csv`: regenerated and filled in, with *Views*, *Likes* and *Why chosen*.
- `tests/videography.test.mjs`: a new test that no lesson has a paid video or a link that can't be shown inside FramePath. The lesson-finished test now looks across all levels for a lesson with no video.

## Testing
- `node --test`: 100 passing. `npm run build`: all budgets pass.
- Browser: B07 lesson 4 lists RØDE's *Reduce Wind Noise* and Deity's *How To Hide A Lav Microphone*, and both play inside FramePath.
