# Útgöngumiðar GGJ – GitHub Pages

**Byrjaðu á [BYRJA-HER.md](BYRJA-HER.md).** Tilbúin `index.html` er á rótinni; stuðningsskrár eru í `docs/`. Veldu `main` og `/(root)` í GitHub Pages. Forsíðan birtist án Supabase; tenging er nauðsynleg áður en tekið er við svörum. ZIP-skráin hefur enga auka ytri möppu.

## Útlitsuppfærsla 1.2

Krembakgrunnur og ryðbrúnar áherslur með efri valmynd, árgangs- og lotuvali til vinstri og þéttum miðalista. Miðarnir hafa sýnilega aðgerð til að opna fyrir hóp og til að breyta; tilvísun í kjarnadæmi má opna í listanum. Nemendasíða, spurningar, ritill og niðurstöður nota sama útlit. Uppfærslan breytir ekki gagnagrunninum eða aðgangskerfinu.

## Hvað fylgir

- Nemendasíða með kóða, beinum hlekkjum og QR-kóða; engin nemendainnskráning.
- Innskráning og heimildalisti fyrir kennara; engin ChatGPT-tenging.
- Miðasafn, ritill, inn- og útflutningur JSON, fyrirlagnir eftir hópum.
- Tvær námsspurningar úr kjarnadæmum og þriggja kosta sjálfsmat án stiga.
- Tölusvar eða fjögurra kosta fjölval í spurningu 1; fjögurra kosta fjölval í spurningu 2.
- Sjálfvirk yfirferð í PostgreSQL, kommu-/punktainntak og vikmörk.
- Óbreytanlegt afrit spurninga fyrir hverja fyrirlögn, opna/loka, einkaniðurstöður og CSV.
- Möppur: 9. bekkur / lotur 13–24 og 10. bekkur / lotur 25–35.
- Eyðing lokaðrar fyrirlagnar og svara hennar með staðfestingu; miðinn sjálfur helst í safninu.
- XLSX-niðurhal heillar lotu: hópur og dagsetningar, lotuyfirlit, endurgjöf, sjálfsmat og öll svör.
- Valfrjáls æfingaábending við hverja spurningu. ExcelJS er bundið með vefnum og sótt við niðurhal.

## Skrár

| Slóð | Hlutverk |
| --- | --- |
| `index.html` | Aðalsíðan þegar Pages birtir `/(root)`. |
| `docs/index.html` | Samhæfð aðalsíða ef Pages er stillt á `/docs`. |
| `docs/config.js` | Supabase URL, opinber publishable key og valfrjáls GitHub-slóð. |
| `docs/assets/` | Byggður JavaScript- og CSS-kóði; fylgir tilbúinn. |
| `src/` | Breytanlegur React/TypeScript-kóði. |
| `supabase/01-uppsetning.sql` | Gagnagrunnur, þröng RPC-viðmót, heimildir og yfirferð. |
| `supabase/02-kennari.sql` | Veitir kennaraheimild og setur inn sýnimiða. |
| `supabase/synimidi.json` | Opinber sýnimiði fyrir prófun og innflutning. |
| `scripts/` | Bygging og sjálfvirkar prófanir. |

## Þróun

Node.js 22 eða nýrra:

```sh
npm ci
npm run build
npm test
npx tsc --noEmit
```

`npm run build` uppfærir `docs/assets` og rótarskrána `index.html`. Það yfirskrifar ekki `docs/config.js`. Ef þú breytir `src/` þarf að byggja aftur og senda uppfærðar skrár með til GitHub. Breytingar í miðasafninu á vefnum þurfa enga endurbyggingu.

Ekki er GitHub Actions-workflow nauðsynlegt; Pages birtir rótina á `main`; `/docs` er líka stutt fyrir eldri uppsetningu. Allar eignaslóðir eru hlutfallslegar og flakk notar `#/`, svo bein hlekkjun virkar undir repository-slóð án rewrite-stillinga.

## Aðgangur og gagnageymsla

Töflurnar eru í einkaskemanu `utgongumidar`, með RLS virkt og án beinna heimilda fyrir `anon` eða `authenticated`. Aðeins fimm þröng gagnagrunnsföll eru aðgengileg í `public`. Kennaraföll sannreyna `auth.uid()`, virka kennaraheimild og eiganda við hverja aðgerð. Öll `security definer` föll hafa tómt `search_path` og skýr execute-grants.

Nemendaföll finna miða með nákvæmum sex stafa kóða. Þau skila aðeins spurningum og svarmöguleikum, aldrei svarlyklum, niðurstöðum, kennarakenni eða innsendingarlykli. Yfirferð fer fram í gagnagrunninum. Valfrjálsar aukaupplýsingar í innfluttu JSON eru ekki sendar nemendum.

Opinber publishable key er ekki kennaraleyndarmál. Kennaralykilorð er sent beint í Supabase Auth yfir HTTPS. Aðgangs- og endurnýjunartákn eru geymd í minni og `sessionStorage` fyrir viðkomandi flipa, aldrei í frumkóðanum. Kennari getur skráð sig út. Aðgangur í gagnagrunninum er alltaf sannreyndur óháð birtingu viðmótsins.

Skil fá tilviljanakenndan UUID-lykil. Endurtekning sömu beiðni með sama lykli býr ekki til annað svar. Þetta er ekki auðkenning nemanda: nýr vafri eða annar lykill getur sent annað svar. Miðakóðinn er boð um að skila, ekki sönnun á nafni. Lokaðu fyrirlögn þegar henni er lokið. Hámark er 500 svör í hverri fyrirlögn; ekki er innbyggð IP-hraðatakmörkun eða vörn gegn markvissum fjöldainnsendingum.

Svör eru varðveitt þar til kennari eyðir viðkomandi lokaðri fyrirlögn. Eyðing fjarlægir fyrirlögn og svör hennar, en sniðmát miðans helst í safninu og má leggja aftur fyrir með nýjum kóða. Ekki færa raunveruleg svör í repositoryið. Sýnidæmi og svarlykill þess eru opinber hluti pakkans.

## Staðfesting við afhendingu

- Supabase-verkefnið `utgongumidar` var stofnað í vinnusvæðinu Gná á Írlandi (`eu-west-1`) 19. október 2026. Gagnagrunnur og aðgangsreglur eru sett upp og `docs/config.js` inniheldur raunveruleg opinber tengigildi.
- Nýja lotuútflutningsfallið var staðfest í lifandi gagnagrunni með kennarahlutverki; nafnlaus aðgangur að útflutningi er bannaður. Fyrirliggjandi gögn (7 miðar, 1 fyrirlögn og 1 svar við uppfærslu) héldust óbreytt. Engum notendaniðurstöðum var eytt við þróun.
- Lifandi HTTP-prófanir staðfestu að nemendaviðmótið svarar, óinnskráður notandi fær ekki að kalla kennarafallið og svarataflan er ekki birt beint í Data API. Beinar töfluheimildir voru einnig yfirfarnar í gagnagrunninum.
- TypeScript-yfirferð og framleiðslubygging gengu upp.
- 67 gagnagrunnsprófanir keyrðu raunverulegu SQL-föllin í PGlite/PostgreSQL með prófunarhlutverkum. Þær ná meðal annars yfir heimildir, eigendur, falda svarlykla, innsláttarvillur, tölusnið, fjölval, vikmörk, afrit spurninga, lokun og endurtekin skil.
- 12 prófanir á biðlaratengingu staðfestu meðal annars GitHub-undirmöppur í hlekkjum, kennaratákn og nafnlaus nemendaköll.
- 18 prófanir á samantekt og XLSX-staðfestingu: nýjasta svar, aðskilnaður hópa, Unicode-nöfn, týnd svör, breyttar spurningar, tölugildi og vernd gegn því að nöfn séu túlkuð sem Excel-formúlur.
- Kennaranotandi og kennaraheimild eru virk. Sjö miðarnir fyrir lotu 28 eru í Supabase. Auth-mörk eru hermd í staðbundnum prófum; nýja útgáfan bíður upphleðslu á GitHub Pages.
- Útlitsútgáfa 1.2: TypeScript-yfirferð og framleiðslubygging gengu upp. Sjónræn vafraprófun var ótiltæk vegna bilunar í forskoðunarumhverfi. Prófa þarf útlit og flakk á birtum vef eftir upphleðslu.

Supabase Advisors voru keyrðir á lifandi verkefninu. Ábending um óvísaðan erlendan lykil var lagfærð með vísi á `sessions.ticket_id`. Aðgangsábendingar voru yfirfarnar: [RLS án policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) er viljandi sjálfgefin lokun einkataflna. [Nafnlaus execute-heimild](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) er aðeins á nemendaföllunum tveimur. [Execute-heimildir innskráðra](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) eru takmarkaðar við fimm viðmótsföll; kennaraföll sannreyna kennaraheimild og eiganda. Almennum töfluheimildum eða RLS-reglum var ekki bætt við til að fela þessar ábendingar.

## Næsti áfangi

PDF/Word-upphleðsla og sjálfvirk gervigreindargerð fylgja ekki. Miðar eru nú samdir í ritlinum eða fluttir inn sem JSON. `coreOnly: true` er staðfesting kennara; forritið getur ekki sjálft sannreynt að texti komi úr kjarnadæmum. Upprunaleg ChatGPT Sites-gögn eru ekki flutt sjálfkrafa í nýja gagnagrunninn.

GGJ · Hlíðaskóli · Gudborg.Gna.Jonsdottir@Reykjavik.is
