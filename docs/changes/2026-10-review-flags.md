# "This feedback seems wrong": flagging AI reviews

Branch: `feat/review-flags` (based on `feat/job-status`)

## Summary
Learners can now say when an AI review seems wrong, and an admin checks it.

> **Needs:** database migration `drizzle/0005`.

## What learners see
- **The link:** under each AI review, **This feedback seems wrong**. It opens a short form.
- **The reasons:**
  - it says something is missing, but it's in my work
  - it describes the video or sound wrongly
  - the score doesn't match the feedback
  - it reviewed it against the wrong task
  - something else
- **Details:** an optional box, for example *"the sound is clear at 0:10"*.
- **After sending,** the review shows its status:
  - *"We're checking it and will reply here"*
  - *"We checked this review and it stands"*
  - *"This review was wrong, so it no longer counts. You can ask for another review"*

  Any note from FramePath appears under it.
- **One flag per review.**
- **An outdated line is fixed:** the Feedback tab no longer says the AI "can't watch videos or open links".

## What admins see (`/admin`)
- **Flagged reviews** sit at the top, highlighted while any are open. Each shows:
  - the learner's email, the lesson, the date
  - the reason and details
  - the AI review, with the score, each check's rating and feedback, and what it couldn't check
  - which videos were watched
  - **the learner's work:** the answer, notes, link, and the files. Admins can open learners' files to judge.
- **The decision:** a note to the learner, then **Review stands** or **Give review back**. A given-back review no longer counts toward the learner's 2 reviews per module, so they can ask again.
- **Resolved flags** are listed underneath.

## Also
- **Learner emails:** the learner's sign-in email is now saved on their row (only written when it changes), so admins can find them. It's used by flags now, and by user lookup next.

## Code
- `db/schema.ts` and `drizzle/0005`: the `review_flags` table; `learners.email`.
- `app/api/review/flag/route.ts` (new): flag a review.
- `app/api/admin/flags/route.ts` (new): the list of flags with the review and the work; resolve one.
- `app/api/review/route.ts`: reviews come back with their flag; given-back reviews don't count toward the allowance.
- `app/api/file/[id]/route.ts`: admins can open files.
- `app/api/state/route.ts`: saves the sign-in email.
- `app/videography/lesson.tsx`: `ReviewFlag`; the corrected wording.
- `app/admin-page.tsx`: `FlaggedReviews`.

## Testing
End-to-end on a local server, 10 checks, all passing:
- a learner gets a review and flags it; flagging twice is refused
- a learner can't see the admin flag list
- an admin sees the flag with the learner's email, review and work, and can open the learner's file; another learner can't
- the admin gives the review back; the learner sees the note, and their reviews used drops from 1 to 0
