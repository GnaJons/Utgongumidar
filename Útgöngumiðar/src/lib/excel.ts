import ExcelJS from 'exceljs';
import {analyseLota,feedbackFor,slotKey,learnerKey,answerText,type LotaData} from './reports';
import {confidenceLabels} from './tickets';
const green='254F40',muted='6E7B73';
function text(value:string){return value.length<=32000?value:value.slice(0,31900)+'\n… Sjá nánar á blaðinu Svör.';}
function lines(values:string[],empty:string){return text(values.length?values.map((v,i)=>`${i+1}. ${v}`).join('\n\n'):empty);}
export async function makeLotaWorkbook(data:LotaData){
 const wb=new ExcelJS.Workbook();wb.creator='Útgöngumiðar';wb.created=new Date(data.generatedAt);
 const {slots,learners}=analyseLota(data);
 function table(name:string,headers:string[],widths:number[]){
  const ws=wb.addWorksheet(name,{views:[{state:'frozen',ySplit:1,xSplit:name==='Lotuyfirlit'?2:0}],pageSetup:{orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0}});
  ws.columns=headers.map((header,i)=>({header,width:widths[i]||24}));
  ws.getRow(1).height=38;
  ws.getRow(1).eachCell(c=>{c.font={name:'Aptos',size:11,bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+green}};c.alignment={vertical:'middle',wrapText:true};});
  return ws;
 }
 function finish(ws:ExcelJS.Worksheet){
  ws.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,ws.rowCount),column:ws.columnCount}};
  ws.eachRow((row,n)=>{if(n===1)return;row.eachCell(c=>{c.font={name:'Aptos',size:11,color:{argb:'FF243F36'}};c.alignment={vertical:'top',wrapText:true};if(n%2===0)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF2F6EF'}};});});
 }
 const notes=table('Leiðbeiningar',['Atriði','Lýsing'],[27,105]);
 notes.addRows([
  ['Lota',`${data.lota} · ${data.grade}. bekkur`],['Hópur',data.group||'Allir hópar'],['Tímabil fyrirlagnar',`${data.from} til ${data.to} (dagsetning þegar miðinn var opnaður)`],
  ['Útbúið',new Date(data.generatedAt)],['Gögn',data.includeOpen?'Opnir og lokaðir miðar; staðan við niðurhal.':'Aðeins lokaðir miðar.'],
  ['Samantekt','Nýjasta svar hvers nemanda við hverri útgáfu miða innan sama hóps. Ef spurningum er breytt telst það sérstakur miði. Öll skil eru varðveitt á blaðinu Svör.'],
  ['Auðkenning','Sama nafn eða nemendakóði innan sama hóps er talið sami nemandi. Hástafir og aukabil skipta ekki máli. Samnefndir nemendur þurfa aðgreinandi nöfn eða kóða.'],
  ['Nemendaskrá','Aðeins nemendur með a.m.k. eitt svar á völdu tímabili birtast. Kerfið hefur ekki bekkjarlista.'],
  ['Ekkert svar','Engin varðveitt svör hjá þessum nemanda við miða sem var lagður fyrir hópinn. Telst ekki rangt svar og fer ekki í stigaútreikning.'],
  ['Ekki lagt fyrir hóp','Þessi miði er ekki meðal valinna fyrirlagna hópsins.'],
  ['Stig','Eitt stig fyrir hvora námsspurningu. Stig og hlutfall byggjast eingöngu á svöruðum miðum, ekki lokaeinkunn. Sjálfsmat er ekki gefið í stigum.'],
  ['Endurgjöf','Æfingaábendingar fylgja röngum svörum. Ef ábending vantar er vísað í spurninguna og kjarnadæmin. Yfirfarðu endurgjöf áður en hún er afhent.'],
  ['Afhending til nemanda','Afritaðu aðeins endurgjöf viðkomandi nemanda í sérskjal. Þessi vinnubók inniheldur niðurstöður allra valinna nemenda.'],
  ['Eyðing','Eyðing svara á vefnum fjarlægir þau úr síðari niðurhölum. Hún breytir ekki skrám sem hafa þegar verið sóttar.']
 ]);notes.getCell('B5').numFmt='yyyy-mm-dd hh:mm';finish(notes);notes.eachRow((r,n)=>{if(n>1)r.height=n===5?25:50;});
 const overview=table('Lotuyfirlit',['Nafn / kóði','Hópur','Svöruðum miðum','Miðar fyrir hóp','Stig','Möguleg stig úr svörum','Hlutfall rétt','Miðar án svars',...slots.map(s=>s.label)],[25,24,16,16,12,20,15,17,...slots.map(()=>28)]);
 const feedback=table('Endurgjöf',['Nafn / kóði','Hópur','Rétt svör','Æfa betur fyrir lotupróf','Ósk um aðstoð í sjálfsmati','Vantar svör'],[25,24,55,90,60,55]);
 for(const learner of learners){
  const f=feedbackFor(learner,slots);
  const row=overview.addRow([learner.name,learner.group,f.answered,f.expected,f.score,f.max,f.max?f.score/f.max:null,f.missing.length,...slots.map(s=>!s.groups.has(learner.group)?'Ekki lagt fyrir hóp':learner.latest.has(s.key)?learner.latest.get(s.key)!.reply.score:'Ekkert svar')]);
  row.getCell(7).numFmt='0%';
  slots.forEach((s,i)=>{if(learner.latest.has(s.key))row.getCell(i+9).numFmt='0" / 2"';});
  const fr=feedback.addRow([learner.name,learner.group,lines(f.success,'Engin rétt svör í völdum skilum.'),lines(f.practice,'Rétt svör við öllum námsspurningum sem þú svaraðir. Farðu áfram yfir kjarnadæmi lotunnar.'),lines(f.support,'Ekki óskað eftir aðstoð í sjálfsmati valinna svara.'),lines(f.missing,'Engin svör vantar við valda miða hópsins.')]);
  fr.height=Math.min(409,Math.max(95,f.practice.length*65,f.success.length*25,f.missing.length*25));
 }
 finish(overview);finish(feedback);
 const answers=table('Svör',['Nafn / kóði','Hópur','Tími','Miði','Kóði','Skilað (Ísland)','Notað í yfirliti','Spurning','Spurningatexti','Svar nemanda','Rétt svar','Rétt / rangt','Stig á miða','Sjálfsmat (án stiga)','Kjarnadæmi','Æfingaábending'],[25,24,10,32,12,23,18,12,65,40,40,16,15,42,50,60]);
 const learnerMap=new Map(learners.map(l=>[l.key,l]));
 for(const s of data.sessions)for(const r of s.responses){
  const included=learnerMap.get(learnerKey(s.group_name,r.name))?.latest.get(slotKey(s))?.reply.id===r.id;
  s.content.questions.forEach((q,i)=>{const row=answers.addRow([r.name,s.group_name,s.content.lesson,s.content.title,s.code,new Date(r.created),included?'Já':'Nei – eldra svar',i+1,q.prompt,answerText(s.content,r.answers[i],i),answerText(s.content,String(q.answer),i),r.correct[i]?'Rétt':'Rangt',r.score,confidenceLabels[r.confidence-1],s.content.source,q.practice||'']);row.getCell(6).numFmt='yyyy-mm-dd hh:mm';row.height=65;});
 }
 finish(answers);
 const sessions=table('Fyrirlagnir',['Hópur','Tími','Miði','Kóði','Staða','Opnað (Ísland)','Fjöldi svara','Kjarnadæmi'],[25,10,40,14,14,23,18,60]);
 for(const s of data.sessions){const row=sessions.addRow([s.group_name,s.content.lesson,s.content.title,s.code,s.status==='closed'?'Lokað':'Opið',new Date(s.created),s.responses.length,s.content.source]);row.getCell(6).numFmt='yyyy-mm-dd hh:mm';}
 finish(sessions);
 return wb.xlsx.writeBuffer();
}
export async function downloadLota(data:LotaData){
 const buffer=await makeLotaWorkbook(data);
 const blob=new Blob([new Uint8Array(buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`lota-${data.lota}-${data.grade}-bekkur-${data.to}.xlsx`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
