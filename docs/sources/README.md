# Source documents

The team's working documents that FramePath's content and changes come from. They're kept here so changes in the code can be traced back to the document that asked for them.

| File | What it is | Used for |
|---|---|---|
| `Framepath_Review.docx` | First product review | The videography lessons, level check and portfolio work (PRs #6–#9) |
| `Framepath_Review_13Oct.docx` | 13 Oct review | Lesson layout, Reflect questions, My Work redesign, portfolio and community (PRs #10–#13) |
| `Video_Library_Module_by_Module_Merged.xlsx` | The curated video library, module by module | Imported into `app/videography/video-library.json` by `python scripts/import-video-library.py` (it reads this file by default) |
| `FramePath_Videography_database.xlsx` | The team's check of every lesson video: link status, notes and picks for empty lessons | The lesson video updates in PR #20 |

`Video_Production_Curriculum.xlsx` (the curriculum: modules, hours, outcomes, tasks) was already in the repository root, and stays there.

**Lesson videos:**
- `FramePath_Lesson_Videos.csv`, in the repository root, is the current list of every video in every lesson. Regenerate it with `node scripts/export-lesson-videos.cjs`.
- `Lesson_Videos_Needed.csv`, also in the root, is the sheet for adding or replacing lesson videos. Import it with `python scripts/import-lesson-videos.py Lesson_Videos_Needed.csv`.
