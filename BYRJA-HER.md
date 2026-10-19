# Útgöngumiðar – uppsetning fyrir GitHub Pages

Þetta er sjálfstæð útgáfa af vefnum. Nemendur þurfa hvorki ChatGPT-aðgang né GitHub-aðgang. Þeir opna miðann með sex stafa kóða eða QR-kóða. Þú skráir þig inn með kennaranetfangi og lykilorði.

Aðalskráin `index.html` er beint á rót pakkans. Stuðningsskrár eru í `docs`. Þú þarft ekki að setja upp forrit á tölvunni eða keyra byggingarskipanir til að birta hana.

## Uppfærsla 19. október 2026 · útgáfa 1.3

Útlitið sameinar hlýjan krembakgrunn og ryðbrúnar áherslur með þéttum miðalista, efri valmynd og lotum vinstra megin. Í síma raðast árgangar og lotur efst.

- **Útlit:** Síðan fylgir ljósri/dökkri stillingu tækisins. Hnappurinn **Dökkt útlit / Ljóst útlit** efst skiptir um liti og valið helst í sama vafra.
- **Dagsetningar:** Íslensk mánaðarheiti, t.d. 19. október 2026.
- **Miðagerð:** Enginn staðfestingarreitur fyrir kjarnadæmi. Tilvísun er valfrjáls og falin undir aukavalinu í ritlinum.
- **Eyðing:** Einnig er hægt að eyða lokaðri fyrirlögn með 0 svör. Hnappurinn heitir þá **Eyða fyrirlögn**.

Kennaraaðgangurinn, miðarnir og niðurstöður eru í sama Supabase-verkefni. Þú notar sama netfang og lykilorð og áður. Gagnagrunnurinn hefur þegar verið uppfærður fyrir valfrjálsar tilvísanir. Ekki þarf að keyra SQL eða stofna aðgang aftur.

### Uppfæra núverandi GitHub-vef

1. Afþjappaðu ZIP-skránni.
2. Opnaðu GitHub-repositoryið þitt og veldu **Add file → Upload files**.
3. Dragðu **index.html** og alla **docs**-möppuna inn á rót repositorysins, þar sem eldri skrárnar eru. Samþykktu að uppfæra samnefndar skrár. Ekki setja nýja ytri möppu utan um þær og ekki hlaða ZIP-skránni sjálfri upp.
4. Veldu **Commit changes** og bíddu eftir að Pages ljúki birtingu.
5. Endurhladdu kennarasíðuna. Þú átt að sjá möppurnar **9. bekkur** og **10. bekkur**. Lota 28 er undir **10. bekkur → Lota 28**.

Gagnagrunnsuppfærslan fyrir lotuútflutning og lotumöppur er þegar virk í núverandi Supabase-verkefni. **Ekki þarf að keyra SQL-skrárnar aftur.**

Nýju JavaScript-skrárnar í `docs/assets` þurfa allar að fylgja; Excel-hlutinn er sóttur þegar þú velur niðurhal. Hvorki þarf að endurstilla kennaraaðgang né flytja miðana aftur inn. Ef þú hefur breytt `siteUrl` í `docs/config.js` skaltu varðveita þá stillingu.

### Nota nýju aðgerðirnar

- **Möppur:** 9. bekkur hefur lotur 13–24, 10. bekkur hefur lotur 25–35. Allar 23 loturnar eru til sem möppur, líka tómar lotur. Miði raðast í rétta möppu þegar þú velur lotu við stofnun eða innflutning.
- **Excel fyrir lotu:** Opnaðu lotu og veldu **Sækja lotu í Excel**. Veldu hóp (eða alla hópa), tímabil og hvort opnir miðar eigi að vera með. Sjálfgefið eru aðeins lokaðir miðar á núverandi skólaári til dagsins í dag.
- **Endurgjöf:** Excel-skráin hefur blöðin Leiðbeiningar, Lotuyfirlit, Endurgjöf, Svör og Fyrirlagnir. Röng svör kalla fram æfingaábendingu. Hana má skrifa við hverja spurningu í ritlinum; annars er vísað í spurninguna. Tilvísun fylgir aðeins ef hún hefur verið skráð. Sjálfsmat er sýnt sér, án stiga.
- **Eyða niðurstöðum:** Undir **Niðurstöður** opnarðu rétta lotu. Fyrir lokaðan miða velurðu **Eyða niðurstöðum** og staðfestir. Þá er fyrirlögninni og öllum svörum hennar eytt, en miðinn sjálfur helst í miðasafninu. Leggja má hann aftur fyrir með nýjum kóða. Sæktu niðurstöðurnar fyrst ef þú vilt varðveita þær. Ekki er hægt að afturkalla eyðingu.

Notaðu sama heiti hóps í allri lotunni. Nemendur þurfa að nota sama nafn eða kóða; samnefndir nemendur þurfa aðgreinandi nöfn eða kóða. Nýjasta svar við sömu útgáfu miða er notað í lotuyfirlitinu, en öll skil sjást á blaðinu Svör. Kerfið er ekki með bekkjarlista: nemendur sem hafa aldrei skilað svari birtast ekki. Vantar svör teljast ekki röng.

Excel-skjalið er kennarayfirlit. Afritaðu aðeins endurgjöf viðkomandi nemanda í sérskjal þegar þú afhendir henni/honum niðurstöður.

Skrefin hér fyrir neðan eru til viðmiðunar ef setja á upp annað, nýtt verkefni.

## Byrjum á GitHub – án Supabase

Þú getur birt og skoðað forsíðuna áður en gagnagrunnurinn er settur upp.

1. Afþjappaðu ZIP-skránni. Opnaðu möppuna þar sem þú sérð **index.html**, **docs**, **src** og **supabase**.
2. Í GitHub-repositoryinu: **Add file → Upload files**. Veldu þessar skrár og möppur og hlaðaðu þeim upp beint á rót repositorysins. `index.html` á að sjást í aðalskráalistanum, ekki inni í möppu sem heitir `utgongumidar-github`. Ekki hlaða ZIP-skránni sjálfri upp.
3. Veldu **Commit changes**.
4. Í **Settings → Pages** velurðu **Deploy from a branch → main → /(root) → Save**. Ef greinin þín heitir annað velurðu greinina þar sem skrárnar eru.
5. Bíddu þar til Pages-birtingunni er lokið og notaðu **Visit site** við staðfestu slóðina í Pages. Ekki þarf að giska á vefslóðina.

Forsíðan á nú að birtast. Ef tengigildin í `docs/config.js` eru tóm birtist tilkynning um að gagnagrunnstenging sé ólokið. Það veldur ekki 404. Í þessum uppfærða pakka eru tengigildin þegar útfyllt.

Ef eldri pakkinn er þegar rétt upphlaðinn með `docs` beint á rót repositorysins er líka hægt að velja **main → /docs**. Báðar birtingarleiðir virka í þessari útgáfu.

404-villa er yfirleitt ósamræmi milli möppunnar sem Pages birtir og staðsetningar `index.html`. Ef hún helst skaltu senda repository-slóðina og Pages-slóðina svo hægt sé að skoða nákvæma uppsetningu.

Þegar forsíðan birtist má halda áfram með Supabase-skrefin hér fyrir neðan.

## 1. Búa til gagnagrunn

GitHub Pages hýsir vefsíðuna. Supabase sér um svörin og kennarainnskráninguna. Google Sites getur svo sýnt vefsíðuna inni á núverandi námsvef.

1. Opnaðu [Supabase](https://supabase.com/dashboard) og búðu til verkefni fyrir útgöngumiðana. Veldu svæði í Evrópu. Vistaðu gagnagrunnslykilorðið hjá þér; það á ekki að fara í vefkóðann.
2. Þegar verkefnið er tilbúið, opnaðu **SQL Editor → New query**.
3. Opnaðu `supabase/01-uppsetning.sql` úr ZIP-pakkanum í textaritli, afritaðu allan textann og settu í SQL Editor.
4. Veldu **Run**. Skráin býr til gagnageymslu og aðgangsreglur. Hún á ekki að eyða neinum fyrirliggjandi gögnum.
5. Haltu `public` í þeim gagnagrunnsskjölum (schemas) sem Data API birtir. **Ekki** bæta `utgongumidar` við Exposed schemas. Töflurnar í því skema eru ekki ætlaðar beinum aðgangi úr vafra.

## 2. Búa til kennarainnganginn

1. Í Supabase: **Authentication → Users → Add user → Create new user**.
2. Skráðu netfangið sem þú ætlar að nota og veldu sterkt lykilorð. Staðfestu notandann með **Auto Confirm User** ef það val birtist. Þetta er sérstakur aðgangur að útgöngumiðunum; ekki þarf að nota lykilorð skólanetfangsins.
3. Í `supabase/02-kennari.sql` er netfangið `Gudborg.Gna.Jonsdottir@Reykjavik.is`. Breyttu því ef þú bjóst til aðgang með öðru netfangi. Ekki setja lykilorðið í skrána.
4. Keyrðu þessa skrá í nýrri fyrirspurn í **SQL Editor**. Hún veitir aðeins þessum notanda kennaraheimild og bætir við sýnimiða úr Lotu 28, 1. tíma.
5. Í **Authentication → Sign In / Providers** skaltu slökkva á **Allow new users to sign up**. Aðrir eiga ekki að búa sjálfir til kennaraaðganga. Heimildalistinn ver gögnin einnig þótt einhver annar skráður notandi sé til.

Ef fleiri kennarar eiga að nota kerfið, búðu til þeirra notendur og keyrðu `02-kennari.sql` með þeirra netföngum. Hver kennari sér sitt safn og sín svör.

## 3. Tengja vefinn við gagnagrunninn

1. Í Supabase: opnaðu **Connect** eða **Settings → API Keys**. Finndu **Project URL** og **Publishable key**, sem byrjar á `sb_publishable_`.
2. Opnaðu `docs/config.js` í textaritli.
3. Límdu gildin inn á milli gæsalappanna:

```js
window.EXIT_TICKET_CONFIG = {
  supabaseUrl: "https://VERKEFNISID.supabase.co",
  supabasePublishableKey: "sb_publishable_OPINBER_LYKILL",
  siteUrl: ""
};
```

Þessi tvö gildi mega vera í opinberum vefkóða. **Aldrei** nota `sb_secret_`, `service_role`, kennaralykilorðið eða gagnagrunnslykilorðið. Aðgangsvörnin er í gagnagrunninum, ekki falin í JavaScript-skrá.

`siteUrl` má vera tómt. Þegar GitHub-slóðin er komin geturðu sett hana þar, t.d. `https://gnajons.github.io/utgongumidar/`. Notaðu beina GitHub-slóð, ekki slóð Google Sites-síðunnar.

## 4. Setja á GitHub

1. Afþjappaðu ZIP-skránni á tölvunni.
2. Á GitHub: búðu til nýtt repository, t.d. **utgongumidar**. Veldu **Public** ef þú notar GitHub Free.
3. Veldu **Add file → Upload files**. Dragðu afþjöppuðu skrárnar og möppurnar inn, ekki ZIP-skrána sjálfa. `index.html` og mappan `docs` eiga að sjást beint á rót repositorysins, ásamt `src`, `supabase` og leiðbeiningunum.
4. Vistaðu með **Commit changes**.
5. Farðu í **Settings → Pages**.
6. Undir **Source**: veldu **Deploy from a branch**. Veldu greinina **main** og möppuna **/(root)**. Veldu **Save**.
7. Bíddu eftir að GitHub birti slóðina. Opnaðu hana. Ef viðvörun um ótengdan gagnagrunn birtist, athugaðu `docs/config.js` og endurhladdu síðunni.

Ef notandanafnið er `gnajons` og repository heitir `utgongumidar`, verður slóðin venjulega `https://gnajons.github.io/utgongumidar/`. Það er dæmi um væntanlega slóð, ekki staðfest birting.

Engin svör nemenda fara í GitHub. Sýnimiðinn er hins vegar sýnilegur í frumkóðanum ásamt svarlykli; notaðu hann til prófunar og búðu til nýjan miða fyrir raunverulega fyrirlögn.

## 5. Prófa einn miða

1. Opnaðu **Kennarainngangur** og skráðu þig inn með aðganginum úr skrefi 2.
2. Opnaðu sýnimiðann fyrir hóp sem heitir **Prófun**.
3. Afritaðu hlekkinn eða skannaðu QR-kóðann.
4. Opnaðu hlekkinn í öðrum vafra eða huliðsglugga, án innskráningar. Skráðu prófunarnafn og svaraðu. Í sýnimiðanum eru rétt svör 15 og B.
5. Á kennarasvæðinu: **Niðurstöður → Skoða svör → Uppfæra**. Athugaðu að svarið birtist með 2/2 stigum og réttu sjálfsmati.
6. Lokaðu miðanum og prófaðu ný skil. Þau eiga að vera stöðvuð. Gamalt svarið á að haldast.
7. Þegar prófun er lokið geturðu eytt niðurstöðum lokaða prófunarhópsins.

Prófaðu nýju möppurnar og Excel-niðurhal á uppfærða GitHub-vefnum áður en þú notar þau með öllum hópnum.

## 6. Sýna vefinn í Google Sites, ef þú vilt

1. Opnaðu námsvefinn þinn í Google Sites.
2. Veldu **Insert → Embed** og límdu inn GitHub Pages-slóðina. Einnig má velja **Pages → + → Full page embed**.
3. Birtu breytinguna. Gefðu rammanum næga hæð svo nemendur geti séð og skrunað í gegnum miðann.
4. Prófaðu í Chromebook. Ef ramminn virkar illa, settu einnig hnapp sem opnar GitHub-slóðina í nýjum flipa.

QR-kóðar fara beint á GitHub-miðann. Kennarainnskráning úr Google Sites opnast í sérflipa svo hún sé ekki háð takmörkunum vafrans inni í ramma.

## Dagleg notkun

- **Nýr miði**: skrifaðu tvær námsspurningar. Tilvísun í námsefni er valfrjáls. Spurning 1 er tölusvar eða fjórir valmöguleikar. Spurning 2 er alltaf með fjórum valmöguleikum. Sjálfsmatið fylgir sjálfkrafa.
- **Flytja inn miða**: sendu dæmablaðið hingað í spjallið og biddu um JSON-miða fyrir þetta kerfi, eingöngu úr kjarnadæmum. Flyttu skrána inn og yfirfarðu áður en þú opnar fyrir nemendur.
- **Opna fyrir hóp**: nýr kóði fyrir hverja fyrirlögn. Breyting á miðasafninu breytir ekki spurningum í eldri fyrirlögn.
- **Sækja lotu í Excel**: raunveruleg XLSX-vinnubók fyrir alla lotuna. CSV-niðurhal einstakra miða er áfram í boði.
- **Loka miða**: hættir að taka við nýjum svörum. Niðurstöður haldast þar til þú eyðir þeim.
- Nemendanafn er sjálfskráð. Þú getur líka látið nemendur nota nemendakóða sem þú þekkir.
- PDF/Word-upphleðsla og sjálfvirk gervigreindargerð eru ekki í þessari útgáfu.

## Ef eitthvað virkar ekki

| Skilaboð eða vandamál | Athugaðu |
| --- | --- |
| Vefurinn er ekki tengdur | Gildin í `docs/config.js` og að nýjasta útgáfa hafi verið birt. |
| Gagnagrunnurinn er ekki tilbúinn | Að öll `01-uppsetning.sql` hafi verið keyrð án villu og Data API sé virkt. |
| Innskráning mistókst | Netfang, lykilorð og að notandinn sé staðfestur í Authentication. |
| Aðgangur hefur ekki kennaraheimild | Að `02-kennari.sql` hafi verið keyrð með sama netfangi. |
| GitHub sýnir 404 | Að valin grein og mappa í Pages innihaldi `index.html` beint. Notaðu `main` og `/(root)` fyrir nýja pakkann. |
| Svar birtist ekki strax | Smelltu á Uppfæra á kennarasvæðinu. |
| QR-hlekkur fer á ranga síðu | `siteUrl` þarf að vera GitHub Pages-slóð með repository-möppunni. |
| Gleymt kennaralykilorð | Stjórnaðu notandanum í Supabase Authentication; lykilorð eru aldrei geymd í þessum kóða. |

## Heimildir fyrir uppsetningu

- [GitHub Pages: birting úr grein og /docs](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Supabase: opinberir og leyndir API-lyklar](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: lykilorðainnskráning](https://supabase.com/docs/guides/auth/passwords)
- [Supabase: aðgangur að gagnagrunnsföllum](https://supabase.com/docs/guides/database/functions)
- [Google Sites: fella inn vefsíðu](https://support.google.com/sites/answer/90569?hl=en)

GGJ · Hlíðaskóli · Gudborg.Gna.Jonsdottir@Reykjavik.is
