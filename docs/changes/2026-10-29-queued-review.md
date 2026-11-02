# A review stuck in the queue

A review with a Drive folder went to the queue with "AI is paused for a short while... within a few hours", though AI wasn't paused (spend $0.12 of the $5 cap). 5 of the 7 clips were watched; 2 failed, and any non-Gemini failure (a stalled Drive download, a dropped upload) counts as "busy", which sends the whole review to the queue. The queue runs once an hour.

- **More tries:** a clip that fails is tried twice more within the review, after 4 s and then 12 s.
- **Try again now:** the queued message is honest ("some clips couldn't be checked just now, or the AI is busy"), and has a Try again now button. Asking again for the same hand-in runs the queued review straight away instead of using another review.
- **Reasons kept:** when a review is queued, the clips that failed and why are saved on the queued job (and logged), so the cause can be found.

Files: `app/api/review/route.ts`, `app/videography/lesson.tsx`, `app/videography/lesson.css`.
