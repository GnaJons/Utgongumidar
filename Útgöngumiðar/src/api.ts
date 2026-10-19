type Config={supabaseUrl:string;supabasePublishableKey:string;siteUrl?:string};
type Auth={access_token:string;refresh_token:string;expires_at:number;user:{email?:string}};
declare global { interface Window { EXIT_TICKET_CONFIG?:Config } }
const config=window.EXIT_TICKET_CONFIG;
export function configurationError(){
 if(!config?.supabaseUrl||!config?.supabasePublishableKey) return 'Vefurinn er ekki tengdur við gagnagrunn enn. Kennarinn þarf að ljúka uppsetningunni í config.js.';
 try {const u=new URL(config.supabaseUrl);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/')throw Error();}catch{return 'Athugaðu slóð gagnagrunnsins í config.js.';}
 const key=config.supabasePublishableKey;
 if(key.startsWith('sb_secret_'))return 'Leyndur lykill má ekki vera í config.js. Fjarlægðu hann og endurnýjaðu í Supabase.';
 if(!key.startsWith('sb_publishable_')){try{if(JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role!=='anon')throw Error();}catch{return 'Notaðu publishable key eða anon-lykil í config.js.';}}
 return '';
}
export function ticketUrl(code:string){
 const u=new URL(config?.siteUrl||window.location.href);u.search='';u.hash='/midi/'+code;return u.href;
}
export function teacherUrl(){const u=new URL(config?.siteUrl||window.location.href);u.search='';u.hash='/kennari';return u.href;}
const storageKey='ggj-teacher-session';
let session:Auth|null=null;
try{const s=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(s?.access_token&&s?.refresh_token&&s?.user)session=s;}catch{}
function remember(s:Auth|null){session=s;try{s?sessionStorage.setItem(storageKey,JSON.stringify(s)):sessionStorage.removeItem(storageKey);}catch{}window.dispatchEvent(new Event('teacher-auth'));}
export function teacherSession(){return session;}
async function request(path:string,body:unknown,token?:string){
 const bad=configurationError();if(bad)throw Error(bad);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
 const r=await fetch(config!.supabaseUrl.replace(/\/$/,'')+path,{method:'POST',headers:{'Content-Type':'application/json',apikey:config!.supabasePublishableKey,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),cache:'no-store',signal:controller.signal});
 const d=await r.json().catch(()=>({message:'Óvænt svar frá þjónustu.'}));
 if(!r.ok){
  if(path.startsWith('/auth/'))throw Error(r.status===429?'Of margar tilraunir. Bíddu aðeins og reyndu aftur.':'Innskráning mistókst. Athugaðu netfang og lykilorð.');
  if(d.code==='42501')throw Error('Þessi aðgangur hefur ekki kennaraheimild.');
  if(d.code==='P0001')throw Error(d.message);
  if(d.code==='PGRST202')throw Error('Gagnagrunnurinn er ekki tilbúinn. Keyra þarf uppsetningarskrána.');
  if(r.status===401){remember(null);throw Error('Innskráning er útrunnin. Skráðu þig aftur inn.');}
  throw Error('Ekki tókst að afgreiða beiðnina. Reyndu aftur.');
 }return d;
 }catch(e){if(e instanceof TypeError || (e as Error).name==='AbortError')throw Error('Tenging mistókst. Athugaðu nettenginguna og reyndu aftur.');throw e;}
 finally{clearTimeout(timeout);}
}
let refresh:Promise<string>|null=null;
async function token(){
 if(!session)throw Error('Skráðu þig inn sem kennari.');
 if(session.expires_at>Date.now()/1000+60)return session.access_token;
 if(!refresh)refresh=(async()=>{try{const d=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session!.refresh_token});const next={...d,expires_at:Date.now()/1000+d.expires_in};remember(next);return next.access_token;}catch(e){remember(null);throw e;}finally{refresh=null;}})();
 return refresh;
}
export async function signIn(email:string,password:string){
 const d=await request('/auth/v1/token?grant_type=password',{email:email.trim(),password});
 // Do not activate a user until the server has checked the teacher allowlist.
 await request('/rest/v1/rpc/et_teacher_get',{p_session:null},d.access_token);
 remember({...d,expires_at:Date.now()/1000+d.expires_in});
}
export async function signOut(){const old=session;remember(null);if(old)try{await request('/auth/v1/logout',{},old.access_token);}catch{} }
export async function api(path:string,data?:any){
 const u=new URL(path,'https://local.invalid');
 if(u.pathname==='/api/ticket')return data
  ?request('/rest/v1/rpc/et_student_submit',{p:data})
  :request('/rest/v1/rpc/et_student_ticket',{p_code:u.searchParams.get('code')});
 if(u.pathname==='/api/lota')return request('/rest/v1/rpc/et_teacher_lota',{p:data},await token());
 if(u.pathname==='/api/teacher')return data
  ?request('/rest/v1/rpc/et_teacher_act',{p:data},await token())
  :request('/rest/v1/rpc/et_teacher_get',{p_session:u.searchParams.get('session')},await token());
 throw Error('Óþekkt aðgerð.');
}
