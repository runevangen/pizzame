# Backlog — Pizzaplanlegger

Sist oppdatert: 27.07.2026 · gjelder index.html rundt v6.01.

Prioritert liste over reelle feil, inkonsistenser og forbedringer, forankret i
faktisk kode (fil:linje refererer til `index.html` med mindre annet er nevnt).
Rekkefølgen innen hver bolk er omtrent synkende viktighet.

Disiplin: `test_regression.py` + `baseline_results.json` fryser dagens tall for
oppskrift og tidsplan. Endrer du noe som flytter et tall, kjør testen og
oppdater baseline bevisst. Hvert punkt under er merket **[baseline]** hvis en
fiks sannsynligvis flytter frosne tall.

---

## P0 — Reelle feil, bør fikses først

> ✅ **Alle P0 + #3/#4 fikset i commit `fa2c1d6`.** Under gjenstår som dokumentasjon.
> En ny, beslektet load-crash (#0) ble funnet under testing og fikset i samme commit.

### 0. `mobHydroUI` kastet «Cannot set properties of null» ved mobil-innlasting ✅ FIKSET
- `syncMobControls()` kjøres fra `loadConfigThenStart` FØR mobil-HTML-en finnes i
  DOM-en (dokumentert ved `4161–4164`). Alle skrivinger der no-opper trygt via
  `s`/`t`-vaktene — bortsett fra `mobHydroUI()`, som skrev uvoktet til
  `mob-hlbl`/`mob-hcat` og kastet ved hver mobil-last for innloggede brukere.
- **Fiks:** samme null-vakt som `syncMobControls`/`mobSetMode`. Fanget av
  `page_loads_without_script_errors`-testen (som feilet 3/3 også på uendret kode).

### 1. Hurtigdeig dobbelttelller vann OG gjær (hele oppskriften blir feil) ✅ FIKSET
Regresjon fra v6.01 «gjær-kickstart».
- Kickstart-steget (`1734`, `needs` på `1735`) løser opp **hele** vannmengden
  `w = mel·hydro/100` og **hele** gjærmengden `ya`:
  «Rør `${ya}` ut i `${w}g` lunkent vann … 🫙 `${ya}` · 💧 `${w}g` lunkent vann».
- Det påfølgende blandesteget (`1745`/`1748`, `needs` på `1749`, understeg `1751`)
  ble aldri oppdatert til å *bruke* denne blandingen — det ber om `${w}g vann` og
  `${ya}` på nytt, både i teksten og i chips-ene.
- **Symptom:** en bruker som følger stegene tilsetter dobbelt vann og dobbelt
  gjær → ødelagt, altfor bløt og overgjæret deig. «Oppskrift»-fanen (`3504`)
  lister vannet bare én gang, så appen motsier seg selv. Rammer både PC og mobil.
- **Fiks:** blandesteget skal referere til kickstart-blandingen («hell gjær-/
  vannblandingen fra forrige steg i bollen») og fjerne vann + gjær fra sine egne
  `needs`-chips og understeg. Behold mel/salt/olje/smør/sukker der.

### 2. Å åpne en lagret deig sletter dens avhaking på serveren (desktop, datatap) ✅ FIKSET
- `openBake` (`5246`) setter `window._checked` fra den lagrede deigen (`5251`),
  gjør så `Object.assign(S, b.config)` (`5255`) som kan endre `S.method`, og
  kaller `gen()` (`5277`).
- Under render kaller `methodFlashHTML()` (`5200`); den ser `_lastMethod !== S.method`,
  kjører `window._checked.clear(); persistCheckedSteps();` (`5203`) — tømmer den
  nettopp innlastede avhakingen **og PATCH-er det tomme settet til serveren**.
- **Symptom:** på desktop sletter det å åpne en lagret deig, hvis metoden skiller
  seg fra planen som allerede står på skjermen, deigens lagrede steg-fremdrift —
  permanent, på server. Mobilens render kaller aldri `methodFlashHTML`, så dette
  er også en PC/mobil-desync.
- **Fiks:** se punkt 3 — fjern `methodFlashHTML`s nullstilling helt; `openBake`
  eier sin egen `_checked`, og `clearStepProgress()` dekker allerede ekte
  metodebytter fra brukeren.

---

## P1 — Feil / inkonsistens

### 3. `methodFlashHTML` er overlappende og desktop-only nullstilling ✅ FIKSET
- `methodFlashHTML` (`5203`) nullstiller kun `window._checked` (ikke
  `_checkedIngredients` / `_checkedSubsteps`), mens v6.01-`clearStepProgress`
  (`727`) nullstiller alle tre og allerede kjører ved hvert ekte metodebytte
  (`943`, `4319`). Den gamle mekanismen er eneste årsak til punkt 2.
- **Fiks:** la `methodFlashHTML` kun returnere «endret»-badgen; fjern
  `.clear()/persistCheckedSteps()`. Da forsvinner både datatapet (2) og
  PC/mobil-desyncen på ett brett.

### 4. Hurtigdeig: motstridende vanntemperatur ✅ FIKSET (løst sammen med #1)
- Kickstarten (`1734`) sier «lunkent vann (40–43 °C)» — for *hele* vannmengden.
  Blandesteget (`1745`/`1748`, understeg `1751`) sier samme `w` gram ved
  `calcWaterTempC()` (kald/kjølig DDT-beregnet temp). «Why»-boksen (`1756`)
  forklarer til og med en vanntemp som ikke lenger brukes.
- **Symptom:** to motstridende temperaturer for samme vann; DDT-logikken («sikt
  mot ~24 °C ferdig deig») holder ikke lenger for Hurtigdeig når alt vannet
  allerede er tilsatt varmt.
- **Fiks:** henger sammen med 1 — når vannet flyttes til kickstarten, styr
  temperaturen der (og vurder om 40–43 °C er riktig mål, eller om DDT skal styre
  kickstart-vannet).

### 5. Avhaking blir stående ved endring av gjær/ovn/mel/hydrering/temp/kjøl ✅ DELVIS FIKSET (v6.12)
> **Fikset for de diskrete bryterne:** `oven` og `gjaer` er lagt til i den nye
> `PROGRESS_RESETTING_FIELDS`-mengden, som både `pgrp` (PC) og `mobPillGroup`
> (mobil) nå sjekker i stedet for en hardkodet `key==='type'`. Regresjonstesten
> `checkbox_progress_clears_on_content_changing_fields_only` vokter kontrakten
> (oven/gjaer nullstiller; kjøkkenmaskin gjør det bevisst ikke).
>
> **Bevisst IKKE fikset:** `mel`/`hydro`/`temp`/`cold` styres av kontinuerlige
> `oninput`-slidere — å nullstille der ville rive vekk flere dagers avhaking midt
> i ett enkelt dra. Stale tall på haket innhold er en akseptert begrensning av den
> indeksbaserte modellen; en ekte fiks krever innholdsbasert nøkling (eget punkt).

Samme klasse som v6.01-feilen, men bare halvfikset.
- `clearStepProgress()` kalles kun ved endring av `type` og `method`
  (`932`, `943`, `4273`, `4319`). Men avhaking er indeksbasert over innhold som
  *disse andre feltene* endrer: `oven` skriver om steke-understeg
  (`bakeSubsteps`, `1291`), `gjaer` bytter tørr↔fersk i gjær-chipen, og
  `mel`/`hydro`/`temp`/`cold` endrer gram og minutter i chips og understeg.
- **Symptom:** et understeg som «Varm pizzaovnen til 430 °C» blir stående avhaket
  etter bytte til vanlig ovn (nå «250 °C»); ingrediens-chips med endrede
  grammengder forblir avhaket — akkurat «avhaket på nytt innhold»-problemet
  v6.01-notatet beskriver, for feltene som ble utelatt.
- **Fiks:** kall `clearStepProgress()` (eller en mildere «reindekser»-variant)
  også ved `oven`/`gjaer`, og vurder om numeriske endringer skal nullstille.

### 6. Hurtigdeig: totaltid drifter fra sin egen «· X timer»-etikett ved ≠22 °C **[baseline]**
- `ba = Math.round(o.h*0.6*60*tf())` (`1723`) er temperaturskalert, men
  `afm = Math.round((o.h - o.h*0.6 - 0.25)*60)` er det **ikke**. Toppteksten
  skriver `${o.h} timer` (`3511` + mobil).
- **Symptom:** ved f.eks. 26–28 °C summerer ikke reell bulk + ettergjær lenger til
  `o.h`; «5 timer»-planen kan i praksis bli merkbart kortere. Etiketten og den
  faktiske tidsplanen er uenige.
- **Fiks:** skaler `afm` med `tf()` på samme måte, eller regn totaltiden ut fra de
  faktiske stegene. Oppdater baseline etterpå.

---

## P2 — Småfeil / kosmetisk

### 7. Biga overgjæring: avrundet vs. uavrundet romheving **[baseline?]**
- Tidsplanen bruker `rtB = Math.round(rt*1.5)` (`1592`), mens
  `fixedFermOverheadHours` bruker `rtM(60)*1.5` uavrundet (`2584`). Sub-minutts
  avvik mellom vist tidsplan og gjæringsvindu-varselet; lite trolig at det vipper
  et varsel, men de to er ikke lenger garantert like.
- **Fiks:** bruk samme avrundede verdi begge steder.

### 8. «👉 neste»- / «⚠️ ikke avhaket»-markører kan peke feil (følge av 5)
- Vente-rader og «neste steg»-markører nøkler på `window._checked`-indekser
  (`1855`, `1929–1930`). Med stale avhaking fra punkt 5 kan markørene peke på feil
  steg til et type-/metodebytte tvinger en nullstilling. Løses av 5.

---

## Funksjoner / UX

Rangert etter hvor godt de treffer produktets retning (changelog v5.49–v6.01):
å tette dekningshull på tvers av alle 7 metoder, stramme årsak→virkning, og
redusere friksjon i den tidsstyrte kjøkkenflyten.

### F1. Husk avhaking av understeg (økt → server + inn i lagret deig)
Understeg-avhaking lever kun i `window._checkedSubsteps` i minnet (`4799–4808`)
og forsvinner ved reload; den blir heller ikke med når en deig lagres (`saveBake`
sender bare `checkedSteps`/`checkedIngredients`, `5058`). Forfatteren har allerede
flagget dette (v5.96: «blir ikke husket når du laster siden på nytt»; kommentar
`4801` kaller persistering «naturlig neste steg»). Hovedsteg og ingredienser
persisteres allerede per bruker til server (`1995–2006`) — understeg er den eneste
som mangler.

### F2. Gjør «Understeg» til en fullverdig, husket modus
Bryteren kaller seg fortsatt forsøk: «📋 Prøv understeg (utprøving, kan slås av
igjen)» (`4782`), men v5.99 fullførte dekning på alle metoder + selve steketrinnet,
og v6.00 flyttet den til statuslinjen og fikset mobil. Funksjonen er ferdig;
rammingen henger etter. Dropp «utprøving»-ordlyden og husk `S.showSubsteps` over
reload (nullstilles i dag, som `showHelp`).

### F3. Gjenopprett påbegynt oppsett ved reload
Deig-konfigurasjonen `S` persisteres aldri til localStorage (kun font, layout,
guide-sett og bruker gjør det — `1072`, `4184`). v6.01-banneret «Fortsetter: X · Y»
(`4474`) virker bare under SPA-navigasjon i økten; etter en ekte reload er
oppsettet borte og banneret kan ikke utløses. Persister `S` til localStorage og
rehydrer ved last — da innfrir «Start ny deig»/«Fortsetter» sitt løfte.

### F4. Uavhengig mørk/lys-bryter (frikoblet fra layout)
Hele «Forno» mørk palett er gated bak `body.mob-mode` (`50–152`) — mørk modus er
altså kun tilgjengelig ved å bytte til mobil-layout. En kokk på laptop/nettbrett i
et mørkt kjøkken får ikke mørkt uten å også få den smale mobil-layouten. Legg til en
ekte tema-preferanse (persistert som `pizzaLayout`) + `prefers-color-scheme`-default.
Forno-tokenene finnes; det meste er å re-scope selektoren.

### F5. Live «neste steg om X» / nåværende-steg-spotlight i appen
Tidsplanen regner allerede ut `curIdx` og `nextIdx` (`1846–1856`), men ingenting
teller ned eller løfter fram «hva gjør jeg nå/neste» uten å scrolle hele Tidsplan.
Siden produktet ER en tidsplan, er en kompakt live-stripe («Neste: Ta ut av
kjøleskap — om 3 t 20 min», ev. med Notification API) en naturlig utvidelse. I dag
er eneste tidsnudge ICS-eksport med 10-min-varsler (`5220`).

### F6. Fullfør den halvbygde PWA-en (offline) ✅ GJORT (commit `91d41ec`)
> Manifest flyttet til site-roten (var 404), service worker lagt til (nettverk-
> først for kode, cache-først for ikoner, API-kall røres ikke), og «Legg til på
> hjemskjerm»-knapp: ekte prompt på Android, instruksjons-sheet på iOS Safari.
> Samme commit fikset en pre-eksisterende load-crash i mobil-init (loadConfigThenStart
> kjørte DOM-avhengig oppstart før mob-HTML-en var parset) — utvider #0.
> Rester som kan gjøres senere: rikere install-UI (screenshots i manifest), evt.
> maskable ikon, og «oppdatering tilgjengelig»-varsel fra service workeren.

_Opprinnelig beskrivelse:_
`manifest.json` er lenket (`7`) og hele ikonsettet finnes, men det er ingen service
worker noe sted — en deig som følges over timer/dager på kjøkken-wifi ryker offline,
og appen er ikke reelt installerbar. En cache-first SW for skallet (index.html +
changelog.js) passer den fler-dagers, én-fils naturen. NB: `manifest.json` ligger i
`netlify/functions/`, ikke i site-roten `<link>` peker på — sjekk 404.

### F7. Tilgjengelig, tastaturstyrt avhaking + live-region på statuslinjen
Steg-, ingrediens- og understeg-avhaking er `onclick` på `<div>`/`<li>` uten
`role`/`button`/`checkbox`-semantikk eller `tabindex` (understeg `4816–4817`).
`aria-label` finnes bare på modal-lukk og varsel-lukk. Den live-oppdaterende
deig-statuslinjen (flaggskip siden v5.53–5.54) har ingen `aria-live`, så
skjermleser-brukere hører aldri årsak→virkning-oppdateringene. Gjør avhakinger til
ekte knapper/checkbokser og merk statuslinjen `aria-live="polite"`.

### F8. Søk / sorter / filter i «Deiger»-fanen
Lagret-deig-lista (`renderBakeList`, `5017`) har verken søk, filter eller sortering
(kun aktiv vs. ferdig). Med per-bruker-lagring (v5.73/5.94) og rating på ferdige
deiger vokser lista uendelig. Legg til filter på metode/type, sortering på dato og
tekstsøk — samme oppdagbarhets-polish som Beta-fanen fikk (v5.51, v5.56, v5.86).

### F9. Synliggjør deig-resultater («Hvordan ble den?») som historikk
Fullfør-deig-modalen (`532`, `confirmFinishBake`) samler inn hvordan en deig ble,
men signalet går ingensteds brukeren ser det igjen. En resultat-historikk per deig
(«forrige gang: 72t / 65 % → 4/5») lukker sløyfa og er distinkt — dataen samles
allerede inn. Passer med F8.

### F10. Samlet ingrediens-/handleliste
v5.95 la til «trenger du»-chips per steg (`2038`, `needchip`), men det finnes ingen
samlet kopierbar/eksporterbar ingrediensliste å handle etter før man starter —
spesielt nyttig for fler-dagers metoder (Poolish/Biga/Mania) der ingrediensene er
splittet over faser. Utvider v5.95-retningen og den eksisterende Kopier/Kalender-raden
(`5105–5107`).

### F11. Paritets-sjekk av tips/why på tvers av metoder
Forfatteren tetter dekningshull metode-for-metode (why-bokser v5.70, understeg
v5.98–5.99, PC/mobil 1:1 v5.63). Samme audit er verdt på `step.tip`/`step.why`:
flere steg definerer `substeps` uten `tip`/`why` (f.eks. passive Poolish/Biga-venter
`1659–1664`), så «💡 Tips»-bryteren (v6.00) avslører ujevn tetthet. En paritetspass +
en regresjonstest à la eksisterende `pc_mobil_1to1_*` passer måten forfatteren
allerede vokter konsistens på.

---

## Tips og triks (idéer til in-app-tekst)

Kandidater til «💡 Tips»/«Hvorfor»-tekst på de kalde stegene (kjøleskapsheving,
benktid). Ikke bare relevant for én bruker — noe mange som kald-gjærer kjenner
seg igjen i. Kilde: egen diagnose av kald gjæring.

- ✅ **Tegn å se etter underveis (kald deig):** størrelse (1,5–2×), bobler under
  overflaten. *Ikke* fingertrykk-testen på en kald deig — upålitelig når deigen
  er stiv av kulde. **Innbygget v6.10** som delt `TIP.coldRise`/`roomRise`/
  `benchTemper`/`poolishFerment`, med et fast «henger etter / på skjema / for
  langt fram»-mønster (hva du ser + hva du gjør) på alle gjæringssteg i alle
  metoder. Løser samtidig størstedelen av F11-hullet på gjæringsstegene.
- ✅ **Kjøleskapstemperatur er ikke til å stole på.** 1–5-skalaene er ikke
  universelle mellom merker — sjekk med termometer. **Innbygget v6.11** i
  `TIP.intoFridge` på «Sett i kjøleskap»-steget.
- ✅ **Ikke stable boksene i høyden.** Blokkerer luftsirkulasjonen, gir ujevn
  kjøling. **Innbygget v6.11** i `TIP.intoFridge`.
- ✅ **Kald gjæring tåler mer gjær enn man tror.** Kulda bremser alt, så deigen er
  tilgivende. **Innbygget v6.11** — lagt til i `WHY.fk` (kjøleskapsheving).

Hele seksjonen er nå tatt inn (v6.10 «les deigen»-tegn + v6.11 praktiske råd).

---

## Teknisk / prosess

- **Regresjonstest ved hver tallendring.** Punkt 6 (og ev. 7) flytter frosne tall —
  kjør `python3 test_regression.py` og oppdater `baseline_results.json` bevisst.
- **Én reset-vei.** Konsolider all avhaking-nullstilling i `clearStepProgress`
  (punkt 3, 5) i stedet for parallelle mekanismer som `methodFlashHTML`.
- **PC/mobil-paritet.** Både render-datatapet (2) og understeg-mobilfiksen (v6.00)
  viser at de to render-veiene lett kommer i utakt — vurder å utvide
  `pc_mobil_1to1`-testene til å dekke avhaking-oppførsel, ikke bare tekst.
