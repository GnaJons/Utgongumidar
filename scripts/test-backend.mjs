// Runs the actual SQL functions/permissions in local PostgreSQL (PGlite).
// Supabase's auth.users/auth.uid boundary is represented by explicit test users.
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();let checks=0;
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333';
const sample=JSON.parse(await readFile('supabase/synimidi.json','utf8'));
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
await db.exec(await readFile('supabase/01-uppsetning.sql','utf8'));
for(const [id,email]of[[A,'Gudborg.Gna.Jonsdottir@Reykjavik.is'],[B,'teacher-b@example.invalid'],[C,'unapproved@example.invalid']])await db.query('insert into auth.users values($1,$2)',[id,email]);
await db.exec(await readFile('supabase/02-kennari.sql','utf8'));
await db.query('insert into utgongumidar.teachers values($1,true)',[B]);
async function call(role,uid,fn,arg){
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);
 await db.exec('set role '+role);
 try{return(await db.query(`select public.${fn}($1) as result`,[arg])).rows[0].result;}
 finally{await db.exec('reset role');}
}
const teacher=(data,u=A)=>call('authenticated',u,'et_teacher_act',data);
const get=(id=null,u=A)=>call('authenticated',u,'et_teacher_get',id);
const ticket=code=>call('anon',null,'et_student_ticket',code);
const submit=data=>call('anon',null,'et_student_submit',data);
function ok(value,message){assert.ok(value,message);checks++;}
async function denied(fn,pattern){await assert.rejects(fn,pattern);checks++;}
const first=await get();ok(first.tickets.length===1,'seed ticket');
await db.exec(await readFile('supabase/01-uppsetning.sql','utf8'));await db.exec(await readFile('supabase/02-kennari.sql','utf8'));ok((await get()).tickets.length===1,'idempotent migration and seed');
await denied(()=>call('anon',null,'et_teacher_get',null),/permission denied/);
await denied(()=>get(null,C),/Kennarainnskráning/);
await denied(()=>get(null,''),/Kennarainnskráning/);
for(const role of ['anon','authenticated']){
 await db.exec('set role '+role);
 await denied(()=>db.query('select * from utgongumidar.responses'),/permission denied/);
 await denied(()=>db.query('select * from utgongumidar.tickets'),/permission denied/);
 await denied(()=>db.query('select utgongumidar.teacher_id()'),/permission denied/);
 await db.exec('reset role');
}
const id=first.tickets[0].id;
const opened=await teacher({action:'open',ticketId:id,group:'10. bekkur – prófun'});
ok(/^[A-HJ-NP-Z2-9]{6}$/.test(opened.code),'six char code');
const publicData=await ticket(opened.code);
ok(!JSON.stringify(publicData).includes('answer')&&!JSON.stringify(publicData).includes('tolerance'),'no answer keys');
ok(!('owner'in publicData)&&publicData.ticket.questions.length===2,'public whitelist');
await denied(()=>teacher({action:'save',id,ticket:sample},B),/fannst ekki/);
await denied(()=>teacher({action:'open',ticketId:id,group:'B'},B),/fannst ekki/);
await denied(()=>teacher({action:'close',id:opened.id},B),/fannst ekki/);
await denied(()=>get(opened.id,B),/fannst ekki/);
ok((await get(null,B)).sessions.length===0,'ownership list');
const input={code:opened.code,name:'Prófun',answers:['15,0','1'],confidence:2,submissionKey:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
await submit(input);
let result=await get(opened.id);ok(result.responses[0].score===2&&result.responses[0].confidence===2,'server grades comma');
ok(!('submission_key'in result.responses[0]),'teacher response omits submission token');
await submit({...input,answers:['1','0']});ok((await get(opened.id)).responses.length===1,'retry idempotent');
await submit({...input,submissionKey:crypto.randomUUID(),answers:['15.0','0']});result=await get(opened.id);ok(result.responses.some(r=>r.score===1),'dot and wrong answer');
for(const answers of [['Infinity','1'],['15cm','1'],['15','4'],['15',''],[15,'1'],['15','1','2']])await denied(()=>submit({...input,submissionKey:crypto.randomUUID(),answers}),/tölu|valmöguleik|Ógilt|báðum/);
await denied(()=>submit({...input,confidence:4}),/spurningunum/);
const changed=structuredClone(sample);changed.questions[0].answer=20;
await teacher({action:'save',id,ticket:changed});await submit({...input,submissionKey:crypto.randomUUID()});ok((await get(opened.id)).responses[0].score===2,'snapshot frozen');
await teacher({action:'close',id:opened.id});await denied(()=>ticket(opened.code),/lokað/);await denied(()=>submit({...input,submissionKey:crypto.randomUUID()}),/lokað/);await submit(input);ok((await get(opened.id)).responses.length===3,'closed retry acknowledges existing only');
await teacher({action:'reopen',id:opened.id});ok((await ticket(opened.code)).code===opened.code,'reopen');
for(const bad of [null,{}, {...sample,coreOnly:false},{...sample,questions:[sample.questions[1],sample.questions[0]]},{...sample,questions:[sample.questions[0],{...sample.questions[1],options:['a','b','c']}]},{...sample,questions:[sample.questions[0],{...sample.questions[1],answer:null}]}])await denied(()=>teacher({action:'save',ticket:bad}),/miðaskrá|Yfirfarðu|Spurning|fjóra/);
const mc=structuredClone(sample);mc.title='Fjölval og vikmörk';mc.questions[0]=structuredClone(mc.questions[1]);await teacher({action:'save',ticket:mc});const mcId=(await get()).tickets.find(t=>t.content.title===mc.title).id;const mcOpen=await teacher({action:'open',ticketId:mcId,group:'Fjölval'});await submit({...input,code:mcOpen.code,answers:['1','1'],submissionKey:crypto.randomUUID()});ok((await get(mcOpen.id)).responses[0].score===2,'q1 choice');
const dec=structuredClone(sample);dec.title='Aukastafir';dec.questions[0].answer=1.5;dec.questions[0].tolerance=0.01;await teacher({action:'save',ticket:dec});const decId=(await get()).tickets.find(t=>t.content.title===dec.title).id;const decOpen=await teacher({action:'open',ticketId:decId,group:'Aukastafir'});await submit({...input,code:decOpen.code,answers:['1,51','1'],submissionKey:crypto.randomUUID()});ok((await get(decOpen.id)).responses[0].score===2,'exact decimal tolerance');
// Whole-lota export authorization, date/group/status boundaries and omission of tokens.
const filters={lota:28,group:'',from:'2000-01-01',to:'2100-01-01',includeOpen:false};
const exportLota=(p=filters,u=A,role='authenticated')=>call(role,u,'et_teacher_lota',p);
await denied(()=>exportLota(filters,null,'anon'),/permission denied/);
await denied(()=>exportLota(filters,C),/Kennarainnskráning/);
await denied(()=>exportLota({...filters,lota:12}),/gilda lotu/);
await denied(()=>exportLota({...filters,from:'2100-01-01',to:'2000-01-01'}),/Upphafsdagur/);
ok((await exportLota()).sessions.length===0,'default excludes open sessions');
const all=await exportLota({...filters,includeOpen:true});
ok(all.sessions.length===3&&all.sessions.reduce((n,s)=>n+s.responses.length,0)===5,'complete lota export');
ok(!JSON.stringify(all).includes('submission_key')&&!JSON.stringify(all).includes('owner'),'export strips private identifiers');
ok((await exportLota({...filters,includeOpen:true},B)).sessions.length===0,'export cannot read another teacher');
ok((await exportLota({...filters,includeOpen:true,group:'Fjölval'})).sessions.length===1,'exact group filter');
ok((await exportLota({...filters,includeOpen:true,to:'2001-01-01'})).sessions.length===0,'date range excludes sessions');
await denied(()=>teacher({action:'deleteSession',id:opened.id}),/Lokaðu/);
await teacher({action:'close',id:opened.id});
ok((await exportLota()).sessions.length===1,'closed sessions included');
await denied(()=>teacher({action:'deleteSession',id:opened.id},B),/Lokaðu/);
ok((await get(opened.id)).responses.length===3,'other teacher cannot delete answers');
await teacher({action:'deleteSession',id:opened.id});
await denied(()=>get(opened.id),/fannst ekki/);
ok(!(await get()).sessions.some(s=>s.id===opened.id),'deleted session is removed from results');
ok((await get()).tickets.some(t=>t.id===id),'delete keeps the template');
ok((await get(mcOpen.id)).responses.length===1,'delete does not affect other sessions');
ok((await exportLota()).sessions.length===0,'deleted responses disappear from later exports');
await denied(()=>submit({...input,submissionKey:crypto.randomUUID()}),/fannst ekki/);
const hintTicket=structuredClone(sample);hintTicket.questions[0].practice='Æfðu reglu Pýþagórasar.';
await teacher({action:'save',id,ticket:hintTicket});
await denied(()=>teacher({action:'save',ticket:{...sample,grade:9,lota:28}}),/Lotur 13/);
await denied(()=>teacher({action:'save',ticket:{...sample,lota:36}}),/Lotur 13/);
const badHint=structuredClone(sample);badHint.questions[0].practice='a'.repeat(301);
await denied(()=>teacher({action:'save',ticket:badHint}),/Æfingaábending/);
// Empty closed sessions must be deletable; a source reference is optional.
await teacher({action:'save',ticket:{...sample,title:'Miði án tilvísunar',source:''}});
const noSource=(await get()).tickets.find(t=>t.content.title==='Miði án tilvísunar');
ok(noSource.content.source==='','empty source saves');
const omittedSource={...sample,title:'Miði án source-reits'};delete omittedSource.source;
await teacher({action:'save',ticket:omittedSource});
ok((await get()).tickets.some(t=>t.content.title===omittedSource.title),'omitted source saves');
for(const source of [null,123,'x'.repeat(301)])await denied(()=>teacher({action:'save',ticket:{...sample,source}}),/Yfirfarðu/);
const noReplies=await teacher({action:'open',ticketId:noSource.id,group:'Tóm prófun'});
await denied(()=>teacher({action:'deleteSession',id:noReplies.id}),/Lokaðu/);
await teacher({action:'close',id:noReplies.id});
await denied(()=>teacher({action:'deleteSession',id:noReplies.id},B),/Lokaðu/);
await teacher({action:'deleteSession',id:noReplies.id});
ok(!(await get()).sessions.some(s=>s.id===noReplies.id),'closed session with zero replies is deleted');
ok((await get()).tickets.some(t=>t.id===noSource.id),'empty session deletion keeps template');
await db.query('update utgongumidar.teachers set enabled=false where user_id=$1',[B]);await denied(()=>get(null,B),/Kennarainnskráning/);
console.log(`${checks} database and permission checks passed.`);await db.close();
