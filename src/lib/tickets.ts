import { z } from 'zod';
const base={prompt:z.string().trim().min(5).max(1600),practice:z.string().trim().max(300).optional()};
const question=z.discriminatedUnion('type',[
 z.object({...base,type:z.literal('number'),answer:z.number().finite().min(-1e15).max(1e15),unit:z.string().max(30),tolerance:z.number().min(0).max(1).default(0)}),
 z.object({...base,type:z.literal('choice'),options:z.array(z.string().trim().min(1).max(350)).length(4),answer:z.number().int().min(0).max(3)})
]);
export const ticketSchema=z.object({
 title:z.string().trim().min(3).max(120),grade:z.number().int().min(9).max(10),lota:z.number().int().min(13).max(35),lesson:z.number().int().min(1).max(40),
 source:z.string().trim().min(3).max(300),coreOnly:z.literal(true),questions:z.tuple([question,question]).refine(q=>q[1].type==='choice','Önnur spurning þarf fjóra valmöguleika.')
}).refine(t=>t.grade===(t.lota<=24?9:10),'Lotur 13–24 tilheyra 9. bekk og lotur 25–35 tilheyra 10. bekk.');
export type Ticket=z.infer<typeof ticketSchema>;
export type StudentTicket=Omit<Ticket,'questions'>&{questions:Array<{type:'number'|'choice';prompt:string;unit?:string;options?:string[]}>};
export const confidenceLabels=['Ég þarf frekari útskýringu.','Ég get það með smá aðstoð.','Ég get þetta sjálf/ur.'];
export function publicTicket(t:Ticket):StudentTicket{
 return {...t,questions:t.questions.map(q=>q.type==='number'?{type:q.type,prompt:q.prompt,unit:q.unit}:{type:q.type,prompt:q.prompt,options:q.options})};
}
export function parseNumber(value:string):number|null {
 const s=value.trim().replace(',','.');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
 const n=Number(s);return Number.isFinite(n)?n:null;
}
export function gradeAnswers(ticket:Ticket,answers:string[]):boolean[]{
 return ticket.questions.map((q,i)=>q.type==='choice'?answers[i]===String(q.answer):parseNumber(answers[i])!==null&&Math.abs(parseNumber(answers[i])!-q.answer)<=q.tolerance+1e-10);
}
