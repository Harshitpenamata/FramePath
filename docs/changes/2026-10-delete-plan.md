# Delete a plan

Branch: `feat/delete-plan` (based on `feat/video-review-gemini`)

## Summary
Learners (and testers) can now delete their plan from the bottom of the Journey page (*Delete this plan*), with two choices:
- **Delete the plan, keep my work:** the level, dates and styles go. Hand-ins, feedback and progress stay, so a new plan picks up where they are.
- **Delete everything and start fresh:** this also removes:
  - Videography hand-ins (and their portfolio pieces)
  - lesson progress
  - the older "previous learning" plan

  It can't be undone.

Both ask for confirmation, then open the plan setup.

When there's no current plan but an older "previous learning" plan exists, the empty Journey page now has a *Delete previous learning* button next to *Open my previous learning*.

## Code
- `app/api/state/route.ts`: new `plan_delete` action, which takes `{ keepWork }` or `{ previous: true }`. Deleting everything updates a published portfolio too.
- `app/videography/dashboard.tsx`: `DeletePlan`, and the previous-learning button.
- `app/videography/videography.css`: styles.

Uploaded files stay in storage. They can be removed under My account → uploads, as before.

## Testing
- End-to-end API run, 6 checks, all passing:
  - plan only: the plan goes, and hand-ins and progress stay
  - a new plan picks up the kept progress
  - everything: the plan, hand-ins, progress and portfolio pieces go
  - the state still loads afterwards, and a fresh plan can be made
- Browser: the section shows both options, with no console errors.
- `node --test`: 99 passing. `npm run build`: all budgets pass.
