-- Útgöngumiðar GGJ. Keyra í SQL Editor á nýju Supabase verkefni.
-- Endurkeyrsla varðveitir fyrirliggjandi gögn.
begin;
create schema if not exists utgongumidar;
revoke all on schema utgongumidar from public, anon, authenticated;

create table if not exists utgongumidar.teachers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default true
);
create table if not exists utgongumidar.tickets (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id) on delete cascade,
 content jsonb not null,
 seed text,
 created timestamptz not null default now(),
 unique(owner,seed)
);
create table if not exists utgongumidar.sessions (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id) on delete cascade,
 ticket_id uuid not null references utgongumidar.tickets(id),
 code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
 group_name text not null check (length(group_name) between 1 and 80),
 content jsonb not null,
 status text not null default 'open' check(status in ('open','closed')),
 created timestamptz not null default now()
);
create table if not exists utgongumidar.responses (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references utgongumidar.sessions(id) on delete cascade,
 submission_key uuid not null,
 name text not null check(length(name) between 1 and 100),
 answers jsonb not null,
 correct jsonb not null,
 score integer not null check(score between 0 and 2),
 confidence integer not null check(confidence between 1 and 3),
 created timestamptz not null default now(),
 unique(session_id,submission_key)
);
create index if not exists et_ticket_owner on utgongumidar.tickets(owner,created desc);
create index if not exists et_session_ticket on utgongumidar.sessions(ticket_id);
create index if not exists et_session_owner on utgongumidar.sessions(owner,created desc);
create index if not exists et_response_session on utgongumidar.responses(session_id,created desc);
alter table utgongumidar.teachers enable row level security;
alter table utgongumidar.tickets enable row level security;
alter table utgongumidar.sessions enable row level security;
alter table utgongumidar.responses enable row level security;
-- No table policies: clients use only the narrow RPC functions below.
revoke all on all tables in schema utgongumidar from public, anon, authenticated;

create or replace function utgongumidar.teacher_id() returns uuid
language plpgsql security invoker set search_path = '' as $$
declare u uuid := auth.uid();
begin
 if u is null or not exists(select 1 from utgongumidar.teachers where user_id=u and enabled) then
  raise exception 'Kennarainnskráning nauðsynleg.' using errcode='42501';
 end if;
 return u;
end; $$;

create or replace function utgongumidar.validate_ticket(t jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare q jsonb; i integer; o jsonb;
begin
 if jsonb_typeof(t) is distinct from 'object' or octet_length(t::text)>24000 then raise exception 'Ógild miðaskrá.'; end if;
 if jsonb_typeof(t->'title') is distinct from 'string' or length(trim(t->>'title')) not between 3 and 120
 or (t->>'grade') is null or (t->>'grade') not in ('9','10')
 or coalesce(t->>'lota','') !~ '^[1-9][0-9]?$'
 or coalesce(t->>'lesson','') !~ '^([1-9]|[1-3][0-9]|40)$'
 or jsonb_typeof(t->'source') is distinct from 'string' or length(trim(t->>'source')) not between 3 and 300
 or (t->'coreOnly') is distinct from 'true'::jsonb
 or jsonb_typeof(t->'questions') is distinct from 'array' then raise exception 'Yfirfarðu heiti, árgang, lotu og tilvísun í kjarnadæmi.'; end if;
 if (t->>'lota')::int not between 13 and 35 or (t->>'grade')::int <> (case when (t->>'lota')::int<=24 then 9 else 10 end) then raise exception 'Lotur 13–24 tilheyra 9. bekk og lotur 25–35 tilheyra 10. bekk.'; end if;
 if jsonb_array_length(t->'questions')<>2 then raise exception 'Miðinn þarf tvær námsspurningar.'; end if;
 for i in 0..1 loop
  q := t->'questions'->i;
  if jsonb_typeof(q) is distinct from 'object' or jsonb_typeof(q->'prompt') is distinct from 'string'
   or length(trim(q->>'prompt')) not between 5 and 1600 then raise exception 'Athugaðu spurningatextann.'; end if;
  if q ? 'practice' and (jsonb_typeof(q->'practice') is distinct from 'string' or length(q->>'practice')>300) then raise exception 'Æfingaábending má vera allt að 300 stafir.'; end if;
  if q->>'type'='number' and i=0 then
   if jsonb_typeof(q->'answer') is distinct from 'number' or jsonb_typeof(q->'unit') is distinct from 'string'
    or length(q->>'unit')>30 or jsonb_typeof(q->'tolerance') is distinct from 'number' then raise exception 'Ógilt tölusvar.'; end if;
   if (q->>'tolerance')::numeric not between 0 and 1 or abs((q->>'answer')::numeric)>1e15 then raise exception 'Ógilt tölusvar eða vikmörk.'; end if;
  elsif q->>'type'='choice' then
   if jsonb_typeof(q->'options') is distinct from 'array' or jsonb_typeof(q->'answer') is distinct from 'number'
    or coalesce(q->>'answer','') !~ '^[0-3]$' then raise exception 'Veldu rétt svar og fjóra valmöguleika.'; end if;
   if jsonb_array_length(q->'options')<>4 then raise exception 'Spurning þarf fjóra valmöguleika.'; end if;
   for o in select value from jsonb_array_elements(q->'options') loop
    if jsonb_typeof(o) is distinct from 'string' or length(trim(o#>>'{}')) not between 1 and 350 then raise exception 'Ógildur valmöguleiki.'; end if;
   end loop;
  else raise exception 'Spurning 1 má vera tölusvar eða fjölval; spurning 2 þarf að vera fjölval.';
  end if;
 end loop;
end; $$;

create or replace function utgongumidar.student_content(t jsonb) returns jsonb
language sql immutable security invoker set search_path = '' as $$
 select jsonb_build_object('title',t->'title','grade',t->'grade','lota',t->'lota','lesson',t->'lesson',
  'questions',(select jsonb_agg(case when q->>'type'='number' then
    jsonb_build_object('type','number','prompt',q->'prompt','unit',q->'unit')
   else jsonb_build_object('type','choice','prompt',q->'prompt','options',q->'options') end order by ord)
   from jsonb_array_elements(t->'questions') with ordinality as item(q,ord)));
$$;

create or replace function public.et_teacher_get(p_session uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := utgongumidar.teacher_id(); chosen utgongumidar.sessions; result jsonb;
begin
 if p_session is not null then
  select * into chosen from utgongumidar.sessions where id=p_session and owner=u;
  if not found then raise exception 'Miði fannst ekki.'; end if;
  return jsonb_build_object('session',to_jsonb(chosen)-'owner','responses',coalesce((
   select jsonb_agg(to_jsonb(r)-'submission_key'-'session_id' order by created desc)
   from utgongumidar.responses r where r.session_id=p_session),'[]'::jsonb));
 end if;
 return jsonb_build_object('tickets',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'content',t.content,'created',t.created) order by t.created desc)
  from utgongumidar.tickets t where t.owner=u),'[]'::jsonb),
  'sessions',coalesce((select jsonb_agg(to_jsonb(x)-'owner' order by x.created desc) from
   (select s.*, (select count(*) from utgongumidar.responses r where r.session_id=s.id) as count
    from utgongumidar.sessions s where s.owner=u order by created desc) x),'[]'::jsonb));
end; $$;

create or replace function public.et_teacher_act(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := utgongumidar.teacher_id(); t utgongumidar.tickets; sid uuid; c text; rnd bytea; i integer; attempt integer; a text := p->>'action';
begin
 if jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>26000 then raise exception 'Ógild beiðni.'; end if;
 if a='initialize' then return jsonb_build_object('ok',true); end if;
 if a='save' then
  perform utgongumidar.validate_ticket(p->'ticket');
  if p->>'id' is null then insert into utgongumidar.tickets(owner,content) values(u,p->'ticket');
  else
   update utgongumidar.tickets set content=p->'ticket' where id=(p->>'id')::uuid and owner=u;
   if not found then raise exception 'Miði fannst ekki.'; end if;
  end if;
 elsif a='open' then
  if jsonb_typeof(p->'group') is distinct from 'string' or length(trim(p->>'group')) not between 1 and 80 then raise exception 'Skráðu heiti hóps.'; end if;
  select * into t from utgongumidar.tickets where id=(p->>'ticketId')::uuid and owner=u;
  if not found then raise exception 'Miði fannst ekki.'; end if;
  for attempt in 1..10 loop
   rnd:=decode(replace(gen_random_uuid()::text,'-',''),'hex'); c:='';
   for i in 0..5 loop c:=c || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',get_byte(rnd,i)%32+1,1); end loop;
   sid:=null;
   insert into utgongumidar.sessions(owner,ticket_id,code,group_name,content)
    values(u,t.id,c,trim(p->>'group'),t.content) on conflict(code) do nothing returning id into sid;
   if sid is not null then return jsonb_build_object('id',sid,'code',c); end if;
  end loop;
  raise exception 'Ekki tókst að búa til kóða. Reyndu aftur.';
 elsif a in ('close','reopen') then
  update utgongumidar.sessions set status=case when a='close' then 'closed' else 'open' end where id=(p->>'id')::uuid and owner=u;
  if not found then raise exception 'Miði fannst ekki.'; end if;
 elsif a='deleteSession' then
  delete from utgongumidar.sessions where id=(p->>'id')::uuid and owner=u and status='closed';
  if not found then raise exception 'Lokaðu miðanum áður en niðurstöðum er eytt.'; end if;
 else raise exception 'Óþekkt aðgerð.';
 end if;
 return jsonb_build_object('ok',true);
end; $$;


-- Private, whole-lota export. One database statement provides a consistent snapshot.
create or replace function public.et_teacher_lota(p jsonb) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare u uuid := utgongumidar.teacher_id(); l integer; g integer; inc boolean; start_day date; end_day date;
begin
 if jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>1000
 or coalesce(p->>'lota','') !~ '^(1[3-9]|2[0-9]|3[0-5])$'
 or (p ? 'group' and jsonb_typeof(p->'group') is distinct from 'string')
 or length(coalesce(p->>'group',''))>80
 or (p ? 'includeOpen' and jsonb_typeof(p->'includeOpen') is distinct from 'boolean') then raise exception 'Veldu gilda lotu og hóp.'; end if;
 l:=(p->>'lota')::integer; g:=case when l<=24 then 9 else 10 end; inc:=coalesce((p->>'includeOpen')::boolean,false);
 if coalesce(p->>'from','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(p->>'to','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Veldu upphafsdag og lokadag.'; end if;
 start_day:=(p->>'from')::date; end_day:=(p->>'to')::date;
 if start_day>end_day then raise exception 'Upphafsdagur þarf að vera á undan lokadegi.'; end if;
 return jsonb_build_object('grade',g,'lota',l,'group',coalesce(p->>'group',''),'includeOpen',inc,'from',start_day,'to',end_day,'generatedAt',now(),
  'sessions',coalesce((select jsonb_agg(to_jsonb(s)-'owner' || jsonb_build_object('responses',coalesce((
    select jsonb_agg(to_jsonb(r)-'submission_key'-'session_id' order by r.created,r.id) from utgongumidar.responses r where r.session_id=s.id),'[]'::jsonb)) order by s.created,s.id)
   from utgongumidar.sessions s where s.owner=u and s.content->>'grade'=g::text and s.content->>'lota'=l::text
    and (inc or s.status='closed') and (coalesce(p->>'group','')='' or s.group_name=p->>'group')
    and s.created >= (start_day::timestamp at time zone 'Atlantic/Reykjavik') and s.created < ((end_day+1)::timestamp at time zone 'Atlantic/Reykjavik')),'[]'::jsonb));
end; $$;
revoke all on function public.et_teacher_lota(jsonb) from public,anon,authenticated;
grant execute on function public.et_teacher_lota(jsonb) to authenticated;

create or replace function public.et_student_ticket(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s utgongumidar.sessions;
begin
 if p_code is null or upper(trim(p_code)) !~ '^[A-HJ-NP-Z2-9]{6}$' then raise exception 'Kóðinn er sex stafir. Athugaðu kóðann hjá kennaranum.'; end if;
 select * into s from utgongumidar.sessions where code=upper(trim(p_code));
 if not found then raise exception 'Þessi kóði fannst ekki.'; end if;
 if s.status<>'open' then raise exception 'Kennarinn hefur lokað fyrir skil.'; end if;
 return jsonb_build_object('id',s.id,'code',s.code,'group',s.group_name,'ticket',utgongumidar.student_content(s.content));
end; $$;

create or replace function public.et_student_submit(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s utgongumidar.sessions; k uuid; stamp timestamptz; a jsonb; q jsonb; n text; good boolean;
 correct jsonb := '[]'::jsonb; score integer:=0; i integer;
begin
 if jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>4000 then raise exception 'Ógild skil.'; end if;
 if coalesce(p->>'code','') !~ '^[A-HJ-NP-Z2-9]{6}$' or jsonb_typeof(p->'name') is distinct from 'string'
 or length(trim(p->>'name')) not between 1 and 100
 or coalesce(p->>'submissionKey','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
 or jsonb_typeof(p->'confidence') is distinct from 'number' or coalesce(p->>'confidence','') not in ('1','2','3')
 or jsonb_typeof(p->'answers') is distinct from 'array' then raise exception 'Skráðu nafn og svaraðu öllum spurningunum.'; end if;
 a:=p->'answers';
 if jsonb_array_length(a)<>2 then raise exception 'Svaraðu báðum námsspurningunum.'; end if;
 k:=(p->>'submissionKey')::uuid;
 -- Lock makes closing/submitting and duplicate retries atomic.
 select * into s from utgongumidar.sessions where code=p->>'code' for update;
 if not found then raise exception 'Miði fannst ekki.'; end if;
 select created into stamp from utgongumidar.responses where session_id=s.id and submission_key=k;
 if found then return jsonb_build_object('ok',true,'created',stamp); end if;
 if s.status<>'open' then raise exception 'Kennarinn hefur lokað fyrir skil.'; end if;
 if (select count(*) from utgongumidar.responses where session_id=s.id)>=500 then raise exception 'Ekki er hægt að taka við fleiri svörum á þessum miða.'; end if;
 for i in 0..1 loop
  if jsonb_typeof(a->i) is distinct from 'string' or length(a->>i)>60 then raise exception 'Ógilt svar.'; end if;
  q:=s.content->'questions'->i; n:=replace(trim(a->>i),',','.');
  if q->>'type'='number' then
   if n !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' then raise exception 'Skrifaðu tölu í spurningu 1.'; end if;
   good:=abs(n::numeric-(q->>'answer')::numeric)<=(q->>'tolerance')::numeric;
  else
   if n !~ '^[0-3]$' then raise exception 'Veldu einn af fjórum valmöguleikum.'; end if;
   good:=n=q->>'answer';
  end if;
  correct:=correct||jsonb_build_array(good); if good then score:=score+1; end if;
 end loop;
 insert into utgongumidar.responses(session_id,submission_key,name,answers,correct,score,confidence)
 values(s.id,k,trim(p->>'name'),a,correct,score,(p->>'confidence')::integer) returning created into stamp;
 return jsonb_build_object('ok',true,'created',stamp);
end; $$;

revoke all on all functions in schema utgongumidar from public, anon, authenticated;
revoke all on function public.et_teacher_get(uuid) from public,anon,authenticated;
revoke all on function public.et_teacher_act(jsonb) from public,anon,authenticated;
revoke all on function public.et_student_ticket(text) from public,anon,authenticated;
revoke all on function public.et_student_submit(jsonb) from public,anon,authenticated;
grant execute on function public.et_teacher_get(uuid), public.et_teacher_act(jsonb) to authenticated;
grant execute on function public.et_student_ticket(text), public.et_student_submit(jsonb) to anon,authenticated;
commit;
