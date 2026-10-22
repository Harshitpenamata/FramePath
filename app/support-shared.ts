// Support tickets: the categories a learner chooses from, and the statuses support moves a ticket through.
// Shared by the Report a problem dialog, the ticket API and the admin queue.
export const ticketCategories=[
 ['video','A video won’t play or is missing'],
 ['content','Something in a lesson or question is wrong'],
 ['task','Handing in my work'],
 ['review','My AI review'],
 ['plan','My plan, dates or progress'],
 ['account','Signing in or my account'],
 ['membership','Membership or checkout'],
 ['other','Something else'],
] as const;
export type TicketCategory=typeof ticketCategories[number][0];
export const categoryLabel=(id:string)=>ticketCategories.find(c=>c[0]===id)?.[1]||'Something else';
export const ticketStatuses=[['open','Open'],['in_progress','In progress'],['resolved','Resolved']] as const;
export const statusLabel=(id:string)=>ticketStatuses.find(s=>s[0]===id)?.[1]||id;
// What the learner sees: open means it's with us, in progress means we've replied.
export const learnerStatusLabel=(id:string)=>({open:'Sent',in_progress:'We replied',resolved:'Resolved'} as Record<string,string>)[id]||id;
// A learner can send up to this many tickets a day, and messages between these lengths.
export const ticketsPerDay=5,messageMin=10,messageMax=2000;
// Follow-ups a learner can send on their tickets each day, and the length of any reply.
export const repliesPerDay=20,replyMax=2000;
