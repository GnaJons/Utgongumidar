-- Fyrst: Authentication > Users > Add user í Supabase.
-- Skiptu um netfang hér ef þú notar annað við kennarainnskráningu.
-- Aldrei setja lykilorð í þessa skrá.
begin;
do $$
declare u uuid; teacher_email text := 'Gudborg.Gna.Jonsdottir@Reykjavik.is';
begin
 select id into u from auth.users where lower(email)=lower(teacher_email);
 if u is null then raise exception 'Búðu fyrst til staðfestan notanda í Authentication > Users með netfanginu %.',teacher_email; end if;
 insert into utgongumidar.teachers(user_id) values(u) on conflict(user_id) do update set enabled=true;
 insert into utgongumidar.tickets(owner,seed,content) values(u,'lota28-timi1',
 $ticket${"title": "Þríhyrningar og regla Pýþagórasar", "grade": 10, "lota": 28, "lesson": 1, "source": "Kjarnadæmi 28.1–28.6; miðinn kannar sérstaklega 28.2 og 28.6.", "coreOnly": true, "questions": [{"type": "number", "prompt": "Skammhliðar rétthyrnds þríhyrnings eru 9 cm og 12 cm. Hversu löng er langhliðin?", "answer": 15, "unit": "cm", "tolerance": 0}, {"type": "choice", "prompt": "Langhlið rétthyrnds þríhyrnings er 10 cm og önnur skammhliðin er 6 cm. Hin skammhliðin er x. Hvaða uppsetning er rétt til að finna x?", "options": ["x = √(10² + 6²)", "x = √(10² − 6²)", "x = 10 − 6", "x = √(10²) − 6²"], "answer": 1}]}$ticket$::jsonb) on conflict(owner,seed) do nothing;
end;
$$;
commit;
