# Admin: hourly job status

Branch: `feat/job-status` (based on `feat/reliability`)

## Summary
The admin page (`/admin`) now shows whether the hourly job is running.
- **The record:** each run is recorded (`app_flags.job_last_run`) with its time, the videos checked, the queued reviews run, the comments checked, and whether AI was paused.
- **When it's running:** a green **Running** badge and the last run's details.
- **When it isn't:** if the job has **never run**, or hasn't run for **over 2 hours**, the panel turns red. It explains that lesson videos aren't being checked and queued AI work won't run. If it has never run, it says the schedule isn't registered and how to fix it: open Workers & Pages in the Cloudflare dashboard once, then redeploy.

## Testing
- Local: before a run, the admin data showed `stale: true` with no last run. After one run, it showed the run (30 videos checked) and `stale: false`. A call to the job route from outside, without the token, got 404.
- `node --test`: 101 passing. `npm run build`: passes.
