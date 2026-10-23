'use client';
import {PageHead,Panel} from './ui';

// Privacy notice (India's DPDP Act). DRAFT: fill in the bracketed details once the company is registered,
// and have it reviewed before a wider launch. Keep this page in step with what the code actually does:
// app/api/account/delete (what deletion removes), app/errors.ts (error log), app/email.ts (emails), app/track.ts (usage).
const company='[Company name]';
const address='[Registered address]';
const contact='hello@framepath.ai';
const grievance='[Grievance officer name], [grievance email]';
const updated='[date]';

const collected:[string,string,string][]=[
 ['Your Google sign-in','Your name, email address and Google account ID.','To create your account and keep it secure.'],
 ['Your level check and plan','Your interests, your answers to the 12 questions, how much time you have each week and your dates.','To build your plan and show your progress.'],
 ['Your work','Photos, videos, links, notes, reflections and quiz answers you hand in.','To run your lessons, keep your work in My work, and give feedback.'],
 ['Your portfolio and Community','What you choose to publish, your likes and your comments.','To show your work to the people you choose.'],
 ['Support','Your messages to us, with the course, plan and page you were on.','To answer and fix problems.'],
 ['How you use Framepath','Steps such as visiting, making a plan, watching a lesson video, handing in work and opening a review. Before you sign in, these are linked to a random ID stored in your browser.','To see what works and what to improve in the pilot. We do not use advertising or third-party analytics.'],
 ['Emails','A record of the emails we sent you.','To send replies to your tickets, tell you when an AI review is ready, and remind you when your plan falls behind. Every reminder has a link to stop them.'],
 ['Error logs','The page and a short error message when something breaks on our side. Never what you typed or uploaded.','To find and fix bugs. Kept for 30 days.'],
];

const processors:[string,string][]=[
 ['Cloudflare','Hosts Framepath and stores your account and files.'],
 ['Google','Sign-in with Google, and the YouTube player for lesson videos when you press play.'],
 ['Anthropic (Claude)','Checks photos for safety before we save them, gives feedback on your text and photos, and screens Community comments.'],
 ['Google (Gemini)','Watches your videos and YouTube or Google Drive links when you ask for AI feedback. Uploaded videos are deleted from Gemini straight after.'],
 ['Resend','Sends our emails.'],
];

export function PrivacyPage(){
 return <>
  <PageHead eyebrow="PRIVACY NOTICE" title="Your data on Framepath.">This explains what we collect, why, who helps us process it, and what you can do about it. Last updated {updated}.</PageHead>
  <Panel>
   <h2>Who we are</h2>
   <p>Framepath is run by {company}, {address}. We decide how your personal data is used. Questions about this notice: <a href={'mailto:'+contact}>{contact}</a>.</p>
   <p>Grievance officer: {grievance}.</p>
  </Panel>
  <Panel>
   <h2>Who can use Framepath</h2>
   <p>The Framepath pilot is for people aged 18 and over. We ask you to confirm your age before you make a plan. If you are under 18, please don’t use Framepath.</p>
  </Panel>
  <Panel>
   <h2>What we collect and why</h2>
   <p>We only collect what we need to run your learning. By making a plan you agree to this use. You can withdraw at any time by deleting your account.</p>
   <dl className="privacy-list">{collected.map(([what,detail,why])=><div key={what}><dt>{what}</dt><dd>{detail} <em>{why}</em></dd></div>)}</dl>
  </Panel>
  <Panel>
   <h2>AI and your work</h2>
   <p>AI gives you feedback and helps keep Framepath safe. It reads only what is needed for each check or review. AI feedback is a first pass, not a qualification, and a person may review flagged feedback.</p>
  </Panel>
  <Panel>
   <h2>Who else handles your data</h2>
   <p>These companies process data for us, only to provide Framepath. Some of them process it outside India, including in the United States.</p>
   <dl className="privacy-list">{processors.map(([who,what])=><div key={who}><dt>{who}</dt><dd>{what}</dd></div>)}</dl>
   <p>We do not sell your data, show you adverts, or share your data with anyone else unless the law requires it.</p>
  </Panel>
  <Panel>
   <h2>How long we keep it</h2>
   <p>We keep your account and work until you delete them. When you delete your account, everything in it is removed straight away: files, plans, progress, hand-ins, AI reviews, portfolio, comments, likes, support tickets, usage records and email records. Copies can remain in our hosting provider’s backups for up to 30 days before they are overwritten. Error logs are kept for 30 days.</p>
  </Panel>
  <Panel>
   <h2>Your rights</h2>
   <ul>
    <li><strong>See your data:</strong> My account → Export my learning, or ask us.</li>
    <li><strong>Correct it:</strong> change your plan details in Framepath, or ask us.</li>
    <li><strong>Delete it:</strong> delete single uploads in My work, or your whole account in My account.</li>
    <li><strong>Stop emails:</strong> use the link in any reminder, or My account.</li>
    <li><strong>Nominate someone</strong> to act for you if you can’t, by writing to us.</li>
    <li><strong>Complain:</strong> write to our grievance officer. We reply within 30 days. If you’re not satisfied, you can complain to the Data Protection Board of India.</li>
   </ul>
  </Panel>
  <Panel>
   <h2>Cookies and browser storage</h2>
   <p>We use a cookie to keep you signed in (it lasts 30 days) and a short-lived one while you sign in with Google. Your browser also stores the random ID mentioned above and your display settings. We don’t use advertising cookies. YouTube may set its own cookies when you play a lesson video.</p>
  </Panel>
  <Panel>
   <h2>Changes to this notice</h2>
   <p>If we change how we use your data, we will update this page and, for important changes, email you before they apply.</p>
  </Panel>
 </>;
}
