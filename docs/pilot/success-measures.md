# Pilot success measures

Agreed before the first invite, so the tracker numbers can be judged against something.
Cohort: 10–20 testers over two weeks. All numbers come from **Admin → Pilot funnel** (tracker started 20 Oct 2026) unless noted.

With 10–20 people, one person is 5–10%. Treat the targets as "clearly working / clearly not", not as precise thresholds.

## The measures

| # | Question | How it's measured | Target | Worry if below |
|---|---|---|---|---|
| 1 | Do people finish the level check? | Created a plan ÷ Started a plan (`plan_created` / `plan_started`) | 80% | 60% |
| 2 | Do invited people get going? | Created a plan ÷ people who signed in | 80% | 60% |
| 3 | Do they start learning? | Watched a lesson video ÷ Created a plan (`video_watched` / `plan_created`) | 75% | 50% |
| 4 | Do they hand in a first task within a week? | Handed in work within 7 days of creating a plan (`handin`, by person) | 50% | 30% |
| 5 | Do they come back? | Still active in week 2: visited on a day 8–14 days after their first visit ("came back in a later week" on the funnel) | 50% | 30% |
| 6 | Is the AI review useful? | 👍 ÷ all ratings on AI reviews (`review_rated`) | 75% 👍 | 60% 👍 |
| 7 | Do they read their review? | Opened their AI review ÷ Got an AI review | 80% | 60% |
| 8 | Do they finish something? | Finished at least one module (`module_done`) | 40% | 20% |
| 9 | Does it work on their phone? | Support tickets in "A video won't play", "Handing in my work" or "Signing in" (Admin → Support tickets) | ≤ 1 per 5 testers | > 1 per 3 testers |
| 10 | Would they recommend it? | Survey question 1 (0–10, see `survey.md`) | average ≥ 7 | average < 6 |

## How to read them

- **1–3 low:** the start is the problem (level check, plan page or first lesson). Watch one tester go through it on a call.
- **4 low, 3 fine:** people watch but don't hand in. Look at the hand-in step on phones and at how big the first task feels.
- **5 low:** the content is fine once, but nothing brings people back. Reminder emails and the WhatsApp check-in (after launch) are the levers.
- **6 or 7 low:** read the 👎 comments under Admin → Flagged reviews before changing the AI.
- **9 high:** fix those first; nothing else matters if the basics break.

## Not measured by the tracker

Why people stopped, what they'd change, and whether they learned anything. That comes from the survey and from a short call with a few testers in week 1.

## Check-ins

- **End of day 3:** measures 1–3. If any is in "worry", fix before more people join.
- **End of week 1:** measures 4, 6, 7 and 9.
- **End of week 2:** all ten, plus the survey results.
