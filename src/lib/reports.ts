import {confidenceLabels, type Ticket} from './tickets';
export type SavedTicket={id:string;content:Ticket;created:string};
export type Session={id:string;ticket_id:string;code:string;group_name:string;content:Ticket;status:'open'|'closed';created:string;count:number};
export type Reply={id:string;name:string;answers:string[];correct:boolean[];score:number;confidence:number;created:string};
export type LotaData={grade:number;lota:number;group:string;includeOpen:boolean;from:string;to:string;generatedAt:string;sessions:Array<Session & {responses:Reply[]}>};
export type Attempt={session:Session;reply:Reply};
export type Slot={key:string;label:string;ticket:Ticket;groups:Set<string>};
export type Learner={key:string;name:string;group:string;latest:Map<string,Attempt>};
// Exact group identity is intentional. Names use Unicode normalization, spaces and case only.
export function learnerKey(group:string,name:string){return JSON.stringify([group,name.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('is')]);}
export function slotKey(s:Session){return JSON.stringify([s.ticket_id,s.content]);}
export function analyseLota(data:LotaData){
 const slots=new Map<string,Slot>(),learners=new Map<string,Learner>();
 const chronological=[...data.sessions].sort((a,b)=>a.created.localeCompare(b.created)||a.id.localeCompare(b.id));
 for(const s of chronological){
  const key=slotKey(s);
  if(!slots.has(key))slots.set(key,{key,label:'',ticket:s.content,groups:new Set()});
  slots.get(key)!.groups.add(s.group_name);
  for(const reply of [...s.responses].sort((a,b)=>a.created.localeCompare(b.created)||a.id.localeCompare(b.id))){
   const lk=learnerKey(s.group_name,reply.name);
   if(!learners.has(lk))learners.set(lk,{key:lk,name:reply.name,group:s.group_name,latest:new Map()});
   const learner=learners.get(lk)!; const previous=learner.latest.get(key)?.reply;
   if(!previous||reply.created>previous.created||(reply.created===previous.created&&reply.id>previous.id))learner.latest.set(key,{session:s,reply});
  }
 }
 const orderedSlots=[...slots.values()].sort((a,b)=>a.ticket.lesson-b.ticket.lesson);
 const totals=new Map<number,number>(),seen=new Map<number,number>();
 for(const slot of orderedSlots)totals.set(slot.ticket.lesson,(totals.get(slot.ticket.lesson)||0)+1);
 for(const slot of orderedSlots){const n=(seen.get(slot.ticket.lesson)||0)+1;seen.set(slot.ticket.lesson,n);slot.label=`${slot.ticket.lesson}. tími${totals.get(slot.ticket.lesson)!>1?' · miði '+n:''} — ${slot.ticket.title}`;}
 return {slots:orderedSlots,learners:[...learners.values()].sort((a,b)=>a.group.localeCompare(b.group,'is')||a.name.localeCompare(b.name,'is'))};
}
export function feedbackFor(learner:Learner,slots:Slot[]){
 const practice:string[]=[],success:string[]=[],support:string[]=[],missing:string[]=[];
 let answered=0,expected=0,score=0;
 for(const slot of slots){
  if(!slot.groups.has(learner.group))continue;expected++;
  const attempt=learner.latest.get(slot.key);
  if(!attempt){missing.push(slot.label);continue;} answered++;score+=attempt.reply.score;
  slot.ticket.questions.forEach((q,i)=>{
   const label=`${slot.label}, sp. ${i+1}`;
   if(attempt.reply.correct[i])success.push(label);
   else practice.push(`${label}: ${q.practice?.trim()||'Æfðu sambærilegt kjarnadæmi: '+q.prompt}\nSjá: ${slot.ticket.source}`);
  });
  if(attempt.reply.confidence<3)support.push(`${slot.label}: ${confidenceLabels[attempt.reply.confidence-1]}`);
 }
 return {practice,success,support,missing,answered,expected,score,max:answered*2};
}
export function answerText(ticket:Ticket,answer:string,i:number){const q=ticket.questions[i];return q.type==='number'?`${answer}${q.unit?' '+q.unit:''}`:`${'ABCD'[Number(answer)]} · ${q.options[Number(answer)]}`;}
