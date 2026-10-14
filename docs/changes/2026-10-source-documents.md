# Source documents in the repository

Branch: `docs/source-documents` (based on `feat/consent-data`)

## Summary
The team's working documents are now versioned with the code, in `docs/sources/`:

| File | What it is |
|---|---|
| `Framepath_Review.docx` | First product review (PRs #6–#9) |
| `Framepath_Review_13Oct.docx` | 13 Oct review (PRs #10–#13) |
| `Video_Library_Module_by_Module_Merged.xlsx` | The curated video library, imported into `app/videography/video-library.json` |
| `FramePath_Videography_database.xlsx` | The team's check of every lesson video (PR #20) |

`docs/sources/README.md` explains each file and what it was used for, and how the lesson video lists are regenerated and imported.

## Code
- `scripts/import-video-library.py` reads `docs/sources/Video_Library_Module_by_Module_Merged.xlsx` by default. A path can still be given.
- The comment in `app/videography/media.ts` points to the new location.

## Testing
I reran the library importer from the new location. It succeeded, and `video-library.json` came out unchanged. Nothing else in the app changes, so no deploy is needed for this one.
