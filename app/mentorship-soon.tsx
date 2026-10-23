'use client';
import {Go,PageHead,Panel} from './ui';

// Mentorship is not part of the pilot. Every mentorship address (/mentors, /craft, /mentor-room, /my-mentor…)
// shows this page; the earlier demo pages stay in mentor-pages.tsx until the real programme is designed.
export function MentorshipSoon(){
  return <>
    <PageHead eyebrow="MENTORSHIP" title="Coming soon."/>
    <Panel className="empty">
      <p>Mentor-led courses aren’t open yet. For now, keep learning at your own pace with your plan.</p>
      <Go href="/workspace">My courses</Go>
    </Panel>
  </>;
}
