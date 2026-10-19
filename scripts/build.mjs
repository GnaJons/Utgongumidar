import {build} from 'esbuild';
import {mkdir,readFile,writeFile,readdir,unlink} from 'node:fs/promises';
await mkdir('docs/assets',{recursive:true});
// Drop obsolete generated chunks so manual GitHub uploads stay small.
for (const file of await readdir('docs/assets')) if (/^(app\.|chunk-)/.test(file)) await unlink('docs/assets/'+file);
await build({entryPoints:['src/main.tsx'],bundle:true,outdir:'docs/assets',entryNames:'app',chunkNames:'chunk-[hash]',splitting:true,minify:true,format:'esm',target:['es2020'],jsx:'automatic',legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});

// Support both Pages publishing sources: repository root and /docs.
const html=await readFile('docs/index.html','utf8');
await writeFile('index.html',html.replaceAll('./assets/','./docs/assets/').replace('./config.js','./docs/config.js').replace('./icon.svg','./docs/icon.svg'));
await writeFile('.nojekyll','');
