# Style tasks in every module (23 Oct 2026)

Learners whose plan style is **Wedding, Corporate or Social media** now see the module task written for their style
in every module, at every level, including the Working with people modules (45 modules × 3 styles = 135 tasks).
Learners on other styles (Events, Documentary, YouTube, Travel, Advertising) keep the shared task.

- Each style task keeps the shared task's skill, evidence and three checks; only the situation changes. The AI
  review now receives the style task, so it reviews what the learner was actually asked to do.
- Source: `docs/sources/Framepath_Style_Layer_Template.xlsx` ("Style layer" tab and "Should - Working with people"
  tab). Import with `python scripts/import-style-tasks.py`, which writes `app/videography/style-tasks.json`.
- The tasks are Claude's drafts, under review by the team. Re-run the import after edits to update the site.
- Not included yet: example videos, extra lessons and the new style-only modules from the other tabs.

Code: `styleTask()` and `moduleLesson()` in `app/videography/programme.ts`; the review prompt in
`app/api/review/route.ts`. Test: "style tasks" in `tests/videography.test.mjs`.
