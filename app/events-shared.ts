// Pilot tracker: the steps a learner takes, in funnel order. Shared by the tracker, its API and the admin funnel.
export const funnelSteps=[
 ['visit','Visited the site'],
 ['plan_started','Started a plan'],
 ['plan_created','Created a plan'],
 ['video_watched','Watched a lesson video'],
 ['handin','Handed in work'],
 ['review_ready','Got an AI review'],
 ['review_opened','Opened their AI review'],
 ['module_done','Finished a module'],
] as const;
export type StepName=typeof funnelSteps[number][0]|'today_clicked'|'review_rated'|'test_out';
// Steps the browser may record; everything else is recorded by the server where it happens.
export const browserSteps=['visit','plan_started','review_opened','today_clicked'] as const;
