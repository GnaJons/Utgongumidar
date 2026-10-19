import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {readFile,mkdir,rm} from 'node:fs/promises';
import ExcelJS from 'exceljs';
await mkdir('.test-build',{recursive:true});
await build({entryPoints:['src/lib/reports.ts','src/lib/excel.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outdir:'.test-build'});
const {analyseLota,feedbackFor,slotKey,learnerKey}=await import('../.test-build/reports.js');
const {makeLotaWorkbook}=await import('../.test-build/excel.js');
const ticket=JSON.parse(await readFile('supabase/synimidi.json','utf8'));
ticket.questions[0].practice='Æfðu reglu Pýþagórasar.';
const reply=(id,name,score,created='2026-10-19T09:00:00Z')=>({id,name,score,created,answers:score===2?['15','1']:['0','1'],correct:score===2?[true,true]:[false,true],confidence:score===2?3:1});
const session=(id,group,content,replies=[])=>({id,ticket_id:content.lesson===1?'ticket1':'ticket2',content,code:'ABC234',group_name:group,status:'closed',created:'2026-10-19T08:00:00Z',count:replies.length,responses:replies});
const second={...structuredClone(ticket),lesson:2,title:'Annar tími'};
const third={...structuredClone(ticket),lesson:3,title:'Þriðji tími'};
const revised=structuredClone(ticket);revised.questions[0].answer=20;
const data={grade:10,lota:28,group:'',from:'2026-08-01',to:'2026-10-19',includeOpen:false,generatedAt:'2026-10-19T12:00:00Z',sessions:[
 session('s1','10A',ticket,[reply('r1','Ása Jóns',1),reply('r2','=HYPERLINK("bad")',1)]),
 session('s2','10A',ticket,[reply('r3','  ÁSA   Jóns ',2,'2026-10-19T10:00:00Z')]),
 session('s3','10B',ticket,[reply('r4','Ása Jóns',1)]),session('s4','10A',second,[]),session('s5','10B',third,[]),
 session('s6','10A',revised,[reply('r5','Ása Jóns',1,'2026-10-19T11:00:00Z')])
]};
let n=0;function ok(v,label){assert.ok(v,label);n++;}
const a=analyseLota(data);
ok(a.learners.length===3,'same name does not merge different groups; spaces/case normalize');
ok(a.slots.length===4,'identical questions reuse slot; changed questions stay separate');
const asa=a.learners.find(l=>l.group==='10A'&&l.name==='Ása Jóns');
ok(asa.latest.get(slotKey(data.sessions[0])).reply.score===2,'latest attempt supersedes earlier wrong answer');
const f=feedbackFor(asa,a.slots);
ok(f.score===3&&f.max===4&&f.expected===3&&f.answered===2,'missing answers do not count as wrong; other group assignments excluded');
ok(f.missing.length===1&&f.missing[0].includes('Annar tími'),'missing ticket identified');
ok(f.practice.length===1&&f.practice[0].includes('Æfðu reglu Pýþagórasar.'),'practice targets wrong question only');
ok(f.support.length===1,'self-report retained separately');
ok(learnerKey('A','Ása')===learnerKey('A','A\u0301sa'),'Unicode normalization');
const buffer=await makeLotaWorkbook(data);
ok(Buffer.from(buffer).subarray(0,2).toString()==='PK','genuine OOXML ZIP');
const wb=new ExcelJS.Workbook();await wb.xlsx.load(buffer);
ok(wb.worksheets.length===5,'five report sheets');
const overview=wb.getWorksheet('Lotuyfirlit');
let asarow;overview.eachRow((r,i)=>{if(i>1&&r.getCell(1).value==='Ása Jóns'&&r.getCell(2).value==='10A')asarow=r;});
ok(asarow.getCell(5).value===3&&asarow.getCell(6).value===4&&asarow.getCell(7).value===0.75,'typed numeric totals and fraction');
ok(asarow.values.includes('Ekkert svar')&&asarow.values.includes('Ekki lagt fyrir hóp'),'missing and not assigned visibly distinct');
const raw=wb.getWorksheet('Svör');ok(raw.rowCount===11,'all submissions retained as two question rows');
let old=0,formulaLike=0;raw.eachRow(r=>{if(r.getCell(7).value==='Nei – eldra svar')old++;if(String(r.getCell(1).value).startsWith('=')){formulaLike++;ok(r.getCell(1).type===ExcelJS.ValueType.String,'untrusted value is plain text, not a formula');}});
ok(old===2&&formulaLike===2,'superseded attempt marked and formula-like names preserved safely');
ok(wb.getWorksheet('Leiðbeiningar').getCell('B5').value instanceof Date,'real Excel date');
const empty=await makeLotaWorkbook({...data,sessions:[]});const ew=new ExcelJS.Workbook();await ew.xlsx.load(empty);ok(ew.getWorksheet('Lotuyfirlit').rowCount===1,'empty export does not fabricate students');
const withoutSource=structuredClone(data);for(const s of withoutSource.sessions)s.content.source='';
const without=analyseLota(withoutSource);
const practice=without.learners.flatMap(l=>feedbackFor(l,without.slots).practice);
ok(practice.length>0&&practice.every(p=>!p.includes('Sjá:')&&!p.includes('undefined')),'feedback with no source has no empty reference');
await rm('.test-build',{recursive:true,force:true});
console.log(`${n} report and XLSX checks passed.`);
