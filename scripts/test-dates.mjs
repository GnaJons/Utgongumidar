import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdir,readFile,rm} from 'node:fs/promises';
await mkdir('.test-dates',{recursive:true});
try {
 await build({entryPoints:['src/lib/dates.ts','src/lib/tickets.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outdir:'.test-dates'});
 const {dateIs}=await import('../.test-dates/dates.js');
 const {ticketSchema}=await import('../.test-dates/tickets.js');
 const sample=JSON.parse(await readFile('supabase/synimidi.json','utf8'));
 const months=['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'];
 for(let m=0;m<12;m++)assert.equal(dateIs(`2026-${String(m+1).padStart(2,'0')}-19T21:30:00Z`),`19. ${months[m]} 2026`);
 assert.equal(dateIs('2026-11-01T00:30:00+02:00'),'31. október 2026');
 assert.equal(dateIs('invalid'),'Óþekkt dagsetning');
 assert.equal(ticketSchema.parse({...sample,source:''}).source,'');
 const omitted={...sample};delete omitted.source;
 assert.equal(ticketSchema.parse(omitted).source,'');
 for(const source of [null,123,'x'.repeat(301)])assert.equal(ticketSchema.safeParse({...sample,source}).success,false);
 console.log('19 Icelandic date and optional-reference checks passed.');
} finally { await rm('.test-dates',{recursive:true,force:true}); }
