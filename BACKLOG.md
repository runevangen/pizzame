# Backlog — UltimatePizza

Sist oppdatert: 11.08.2026 · v0.784–0.788 ute: kald poolish står der den faktisk står, kjøleskapspausen tempereres, finere timeraster, 30 %-poolish som variant, og vinkelengden er blitt et valg. Vanntemperaturen regnes nå av en varmebalanse som teller fordeigen med. Testriggen er delt i sju grupper, og CI kjører på hver push med nattlig stabilitetssjekk.
**Venter på bakst:** F33 (ny), F24. **Venter på avgjørelse:** F26, F12. **Ikke startet:** F29, F30, F32, T-i18n2.

Prioritert liste over reelle feil, inkonsistenser og forbedringer, forankret i
faktisk kode (fil:linje refererer til `index.html` med mindre annet er nevnt).
Rekkefølgen innen hver bolk er omtrent synkende viktighet. Hvert gjenstående punkt
har en **I klartekst**-linje som forklarer hva det er og hvor stort, i vanlig språk.

Status per v6.20: alle P0 + #1–6 fikset (#5 fullt via innholdsbasert nøkling),
#8 dermed løst. F1–F6 gjort, hele «Tips og triks» gjort. Levert siden v6.14:
engelsk språk + imperiske enheter (v6.15), innholdsbasert avhaking (v6.16),
lys/mørk-tema for mobil (v6.17, F4), sterkere kalender-eksport (v6.18),
feedback-fiks (v6.19) og en språkvask fra morsmåls-gjennomgang (v6.20).
Gjenstår: #7 (kosmetisk), funksjonene F7/F8/F9/F10/F11 + F5 nivå 3, og to nye
punkter fra denne økta — **F12 (PC-tema)** og **T-i18n (gjenstående i18n-hull)**,
begge under «Funksjoner / UX».

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

### 5. Avhaking blir stående ved endring av gjær/ovn/mel/hydrering/temp/kjøl ✅ FIKSET (v6.12 diskret + v6.15 innholdsbasert)

> ✅ **FULLT FIKSET i v6.15.** Avhaking nøkles nå på *innholdet* i steget
> (`stepSig`/`substepSig`/`ingSig` = kanonisk tittel + alle tall i tekst/understeg/
> chips), ikke på posisjonen. Drar du mel/hydrering/temp/kjøletid, endres tallene
> → signaturen endres → haken faller av seg selv, men KUN på de stegene som
> faktisk endret innhold; urelaterte steg beholder haken, og ingenting rives midt
> i et dra. Signaturen er kanonisk metrisk/norsk, så den er stabil på tvers av
> språk- og enhetsbytte (verifisert). Bakoverkompatibelt: gamle indeks-/etikett-
> haker lyser fortsatt og migreres til signatur når de toggles. Ny test:
> `checkbox_content_keyed_drops_stale_slider_changes_keeps_unaffected`. Render-
> baseline oppdatert (ingrediens-`onclick` bærer nå mengden — eneste endring).
> **Fikset for de diskrete bryterne:** `oven` og `gjaer` er lagt til i den nye
> `PROGRESS_RESETTING_FIELDS`-mengden, som både `pgrp` (PC) og `mobPillGroup`
> (mobil) nå sjekker i stedet for en hardkodet `key==='type'`. Regresjonstesten
> `checkbox_progress_clears_on_content_changing_fields_only` vokter kontrakten
> (oven/gjaer nullstiller; kjøkkenmaskin gjør det bevisst ikke).
>
> **Bevisst IKKE fikset:** `mel`/`hydro`/`temp`/`cold` styres av kontinuerlige
> `oninput`-slidere — å nullstille der ville rive vekk flere dagers avhaking midt
> i ett enkelt dra. Utdaterte tall på haket innhold er en akseptert begrensning av den
> indeksbaserte modellen; en ekte fiks krever innholdsbasert nøkling (eget punkt).
>
> **I klartekst (det som gjenstår):** Endrer du melmengde, hydrering, temperatur
> eller kjøletid mens du har haket av steg, kan haken bli stående på et tall som nå
> er endret (f.eks. en avhaket «500 g mel»-chip når du har dratt til 600 g). Vi lot
> den ligge med vilje — disse er glidebrytere som beveger seg kontinuerlig, og en
> nullstilling der ville slette flere dagers avhaking midt i et dra. Den ekte
> løsningen er å nøkle avhakingen på *innholdet* i steget i stedet for på posisjonen
> (indeks) — en arkitektur-endring, ikke en liten fiks. Størst jobb i denne bunken.

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

### 6. Hurtigdeig: totaltid drifter fra sin egen «· X timer»-etikett ved ≠22 °C ✅ FIKSET (v6.12) **[baseline]**
> **Fikset:** `afm` skaleres nå med `tf()` på samme måte som `ba` (`1805`), så begge
> gjæringsfasene reagerer likt på temperatur. Ved 22 °C (tf=1) er tallene uendret —
> `baseline_results.json` rørt ikke — så fiksen slår kun inn ved ≠22 °C. Ny test
> `hurtig_both_ferment_phases_scale_with_temperature` vokter at begge faser skalerer
> med samme faktor. (`· X timer`-etiketten beholdt som nominelt opsjonsnavn, som i
> velgeren og Kveldsdeig; den eksisterende «varmt kjøkken — sjekk underveis»-advarselen
> dekker at reell veggklokke-tid avviker ved høy temp.)

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

### 7. Biga overgjæring: avrundet vs. uavrundet romheving **[baseline?]** ✅ BYGGET (v0.665, gren)
> ✅ **Bygget (venter prod).** `fixedFermOverheadHours` runder nå biga-romhevingen
> `Math.round(rtM(60)*1.5)` — likt tidsplanens `rtB`. Ingen frosne tall rørt. Test:
> `biga_bulk_rise_rounded_consistently_in_overhead`.
> **I klartekst:** På biga-metoden regner tidsplanen og overgjærings-varselet
> romhevingen bittelitt ulikt — planen runder av til hele minutter, varselet gjør
> det ikke. Forskjellen er under ett minutt og synes nesten aldri, men de to tallene
> er ikke garantert like. Kosmetisk, lite. Flytter et frosset tall (oppdater baseline).
- Tidsplanen bruker `rtB = Math.round(rt*1.5)` (`1592`), mens
  `fixedFermOverheadHours` bruker `rtM(60)*1.5` uavrundet (`2584`). Sub-minutts
  avvik mellom vist tidsplan og gjæringsvindu-varselet; lite trolig at det vipper
  et varsel, men de to er ikke lenger garantert like.
- **Fiks:** bruk samme avrundede verdi begge steder.

### 8. «👉 neste»- / «⚠️ ikke avhaket»-markører kan peke feil (følge av 5) ✅ FIKSET (v6.15)
> ✅ **Løst sammen med #5.** «Neste»- og «ikke avhaket»-markørene gikk via samme
> `stepChecked()`-hjelper, som nå er innholdsbasert. Når haken faller riktig av ved
> innholdsendring, peker markørene også riktig. Ingen egen jobb — dekket av #5-fiksen.
- Vente-rader og «neste steg»-markører nøkler på `window._checked`-indekser
  (`1855`, `1929–1930`). Med utdatert avhaking fra punkt 5 kan markørene peke på feil
  steg til et type-/metodebytte tvinger en nullstilling. Løses av 5.

---

## Funksjoner / UX

Rangert etter hvor godt de treffer produktets retning (changelog v5.49–v6.01):
å tette dekningshull på tvers av alle 7 metoder, stramme årsak→virkning, og
redusere friksjon i den tidsstyrte kjøkkenflyten.

### F1. Husk avhaking av understeg (økt → server + inn i lagret deig) ✅ GJORT (v6.13)
> `persistCheckedSubsteps()` PATCHer nå `checkedSubsteps` per aktiv deig (samme
> mønster som `checkedSteps`/`checkedIngredients`), kalt fra `toggleSubstepDone`.
> `saveBake` sender `checkedSubsteps` i POST, `openBake` hydrerer settet igjen, og
> `bakes.js` lagrer feltet (POST + PATCH, cap 200 nøkler). Testet i
> `substep_progress_persists_and_view_is_remembered` (load-veien via openBake).

### F2. Gjør «Understeg» til en fullverdig, husket modus ✅ GJORT (v6.13)
> «utprøving»-ordlyden fjernet (knappen heter nå «📋 Vis understeg»), og
> `S.showSubsteps` huskes over reload via `localStorage['pizzaSubsteps']` —
> skrevet i `toggleSubsteps`, rehydrert i `loadConfigThenStart`s `finish()` før
> første render. `showHelp` forblir bevisst uendret (nullstilles ved reload).
> Samme test vokter localStorage-persisteringen og at etiketten ikke lenger
> rammer det som en «utprøving».

### F3. Gjenopprett påbegynt oppsett ved reload ✅ GJORT (v6.13)
> `persistSetup()`/`restoreSetup()` lagrer oppsettet (alle `DEF`-felt unntatt
> `showHelp`/`showSubsteps`) til `localStorage['pizzaSetup']`. Persisteres fra
> `gen()`/`mobGen()`, men kun for usagde oppsett (`_activeDeigId` falsy) — en
> åpnet, lagret deig eier sin egen tilstand via `openBake`. Rehydreres i
> `loadConfigThenStart`s `finish()` før layout/render, deretter `syncDesktop/
> MobControls` + `setMode` (samme sync openBake bruker), så «Fortsetter»-banneret
> og alle kontroller reflekterer oppsettet. `doReset` rydder nøkkelen. Testet i
> `setup_persists_and_restores_across_reload`.

### F4. Uavhengig mørk/lys-bryter (frikoblet fra layout) ✅ GJORT (v6.17)

> ✅ **Gjort i v6.17.** Lys tema lagt til for mobil-layouten via en `.theme-light`-
> klasse på `body` som redefinerer `--forno-*`-tokenene — hele Forno-UI-et var
> allerede token-drevet (kun 2 hardkodede farger måtte tokeniseres). Paletten er den
> varme krem/pergament-tonen fra Runes egen Tons of Rock-app (`body.light`), med
> samme oransje aksent Forno allerede bruker (`#e8590c`). Bryter under Info →
> Visning → «Tema»: System / Lys / Mørk. `setTheme`/`initTheme` persisterer valget
> (`pizzaTheme`), «System» følger `prefers-color-scheme` live. Standard er `dark`,
> så eksisterende brukere ser ingen endring før de selv velger. i18n på plass
> (Theme/System/Light/Dark). Native kontroller (dropdown/dato/tid) får `color-scheme:
> light` i lys modus. Alle 58 tester grønne.
> **I klartekst:** I dag finnes mørk modus *bare* hvis du bytter til mobil-layout —
> hele den mørke paletten er koblet til `body.mob-mode`. En kokk på laptop i et mørkt
> kjøkken får altså ikke mørkt uten å også få den smale mobil-visningen. F4 frikobler
> tema fra layout: en ekte lys/mørk-preferanse som huskes og følger systemets
> innstilling. Fargene finnes allerede — mest jobb er å endre *hvor* de gjelder.
> Middels stor.
Hele «Forno» mørk palett er gated bak `body.mob-mode` (`50–152`) — mørk modus er
altså kun tilgjengelig ved å bytte til mobil-layout. En kokk på laptop/nettbrett i
et mørkt kjøkken får ikke mørkt uten å også få den smale mobil-layouten. Legg til en
ekte tema-preferanse (persistert som `pizzaLayout`) + `prefers-color-scheme`-default.
Forno-tokenene finnes; det meste er å re-scope selektoren.

### F5. Live «neste steg om X» / nåværende-steg-spotlight i appen ✅ GJORT (v6.14, nivå 1–2)
> `nextStepStripeHTML()` prependes i `renderSteps` (delt PC+mobil), viser neste
> fremtidige ikke-avhakede steg + nedtelling («👉 Neste: X · om 3 t 20 min»).
> `startNextStepTicker()` oppdaterer nedtellingen hvert 30. sek uten å bygge om
> planen, og trigger én full render når tiden passerer et stegskille. Trykk på
> stripa scroller til neste steg (`scrollToNextStep`). «Alle steg gjort» når alt
> er avhaket; «på tide» når du er på etterskudd. Testet i
> `f5_next_step_stripe_shows_upcoming_step_and_countdown`.
>
> **Gjenstår (nivå 3):** push-varsling via Notification API når neste steg nærmer
> seg (krever tillatelse, ulik oppførsel iOS/Android — bevisst utsatt). I dag er
> eneste tidsnudge fortsatt ICS-eksport med 10-min-varsler.
>
> **I klartekst (nivå 3):** Stripa teller ned *inne i appen*. Nivå 3 er å pinge deg
> via `Notification API` når neste steg nærmer seg, selv når appen er lukket. Utsatt
> med vilje fordi det krever tillatelse fra brukeren og oppfører seg ulikt på iOS og
> Android. Middels, plattform-avhengig.

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

### F7. Tilgjengelig, tastaturstyrt avhaking + live-region på statuslinjen ✅ BYGGET (v0.667, gren)
> ✅ **Bygget (venter prod).** Steg-, ingrediens- og understeg-avhaking har nå
> `role="checkbox"` + `aria-checked` + `tabindex="0"` + Enter/Space-tastatur, og
> den levende statuslinja (`deigStatusBarHTML`) har `aria-live="polite"`. F5-stripa
> hadde alt tastatur/role fra før. Render-baseline oppdatert (kun de nye a11y-
> attributtene — verifisert at ingenting annet endret seg). Test:
> `checkboxes_keyboard_accessible_and_statusbar_aria_live`.
>
> **I klartekst:** Avhaking av steg/understeg er i dag klikkbare `<div>`-er uten
> «knapp»-semantikk eller tastaturstøtte, og den levende statuslinja har ingen
> `aria-live` — så en skjermleser-bruker hører aldri «oppstart flyttet 2 t tidligere»-
> oppdateringene. F7 gjør avhakinger til ekte knapper/avkryssingsbokser og annonserer
> statusendringer. (En bit av dette kom alt på F5-stripa: tastatur + fokus.) Middels.
Steg-, ingrediens- og understeg-avhaking er `onclick` på `<div>`/`<li>` uten
`role`/`button`/`checkbox`-semantikk eller `tabindex` (understeg `4816–4817`).
`aria-label` finnes bare på modal-lukk og varsel-lukk. Den live-oppdaterende
deig-statuslinjen (flaggskip siden v5.53–5.54) har ingen `aria-live`, så
skjermleser-brukere hører aldri årsak→virkning-oppdateringene. Gjør avhakinger til
ekte knapper/checkbokser og merk statuslinjen `aria-live="polite"`.

### F8. Søk / sorter / filter i «Deiger»-fanen ✅ BYGGET (v0.666, gren)
> ✅ **Bygget (venter prod).** Kontroll-rad over lista: tekstsøk (navn), metode-
> filter og sortering (nyest/eldst/best vurdert). Lista males om fra
> `window._bakesCache` uten ny fetch (`applyDeigFilter`/`paintBakeList`), så
> søkefeltet beholder fokus. Test: `doughs_search_filter_sort_and_config_in_meta`.
>
> **I klartekst:** Deiger-lista har bare Aktive vs. Ferdige. Med per-bruker-lagring
> og terningkast vokser den uendelig. F8 legger til filter på metode/type, sortering
> på dato og tekstsøk — samme oppdagbarhets-polish som Beta-fanen har fått. Middels.
Lagret-deig-lista (`renderBakeList`, `5017`) har verken søk, filter eller sortering
(kun aktiv vs. ferdig). Med per-bruker-lagring (v5.73/5.94) og rating på ferdige
deiger vokser lista uendelig. Legg til filter på metode/type, sortering på dato og
tekstsøk — samme oppdagbarhets-polish som Beta-fanen fikk (v5.51, v5.56, v5.86).

### F9. Synliggjør deig-resultater («Hvordan ble den?») som historikk ✅ BYGGET (v0.666, gren)
> ✅ **Bygget (venter prod).** Ferdig-kortene viste allerede vurdering + notat +
> bilde; nå viser `bakeMetaLine` også kjøletid + hydrering, så vurderingen er
> knyttet til konkrete tall («72t · 65% → ★★★★»). Sammen med F8s «best vurdert»-
> sortering fungerer Ferdige-lista som en resultat-historikk. (En kontekstuell
> «forrige gang for denne oppskriften»-nudge ved planlegging er fortsatt mulig
> senere, men dataen er nå synlig og sammenlignbar.)
>
> **I klartekst:** Når du markerer en deig som ferdig, samler appen inn terningkast,
> bilde og notat — men det vises aldri tilbake til deg som en historikk. F9 lukker
> sløyfa: «forrige gang: 72 t / 65 % → 4/5», så du kan gjenta suksessene. Dataen
> finnes allerede; det er visningen som mangler. Middels, passer med F8.
Fullfør-deig-modalen (`532`, `confirmFinishBake`) samler inn hvordan en deig ble,
men signalet går ingensteds brukeren ser det igjen. En resultat-historikk per deig
(«forrige gang: 72t / 65 % → 4/5») lukker sløyfa og er distinkt — dataen samles
allerede inn. Passer med F8.

### F10. Samlet ingrediens-/handleliste ❌ FJERNET (v0.672, etter tilbakemelding)
> ❌ **Bygget i v0.665, fjernet igjen i v0.672.** «🛒 Handleliste»-knappen ble
> vurdert unødvendig: ingrediens-totalene finnes allerede i oppskrift-fanen og i
> «Kopier tidsplan». Fjernet på brukerens forespørsel (funksjoner + knapper +
> test borte). (Handleliste ↔ kilder-utvidelsen under er uansett fortsatt parkert.)
>
> **I klartekst:** «Trenger du»-chipsene viser ingredienser per steg, men det finnes
> ingen samlet liste å handle etter *før* du starter — spesielt nyttig for fler-dagers
> metoder (Poolish/Biga/Mania) der ingrediensene er delt over faser. F10 er en
> kopierbar/eksporterbar totalliste. Liten–middels.
v5.95 la til «trenger du»-chips per steg (`2038`, `needchip`), men det finnes ingen
samlet kopierbar/eksporterbar ingrediensliste å handle etter før man starter —
spesielt nyttig for fler-dagers metoder (Poolish/Biga/Mania) der ingrediensene er
splittet over faser. Utvider v5.95-retningen og den eksisterende Kopier/Kalender-raden
(`5105–5107`).

**Utvidelses-idé (parkert):** koble handlelisten til en «Hvor får jeg tak i dette?»-seksjon
med kuraterte norske kilder for mel (Tipo 00 / sterkt hvetemel) og utstyr (pizzastål/-stein,
spade, gjæringsbokser, vekt, deigskraper). Anbefalt løsning er en *statisk kuratert kildeliste*
i appen (som guiden) — null infrastruktur, ingen sporing, offline. Alternativet «finn butikk nær
deg» (geolokasjon + kart-API) er bevisst vraket: krever backend, API-nøkkel, kostnad og
posisjons-personvern for tvilsom nytte. Åpne valg: lenke ut vs. bare navngi; hvilke kilder vi
faktisk står inne for (bør bestemmes av bruker, ikke oppdiktes); og om EN-visningen skjuler
seksjonen eller viser samme liste med «norske kilder»-merknad.

### F11. Paritets-sjekk av tips/why på tvers av metoder ✅ BYGGET (v0.664, gren)
> ✅ **Bygget (venter prod).** Audit av alle metode×type-kombinasjoner fant 8 steg
> med understeg men uten `why` (2 i hurtigdeig, 6 i Mania). Fylt hver med en kort
> tospråklig `why`. Kontrakt: hvert steg med understeg må ha en `why` (tip forblir
> valgfritt på passive vente-steg). Vokter-test:
> `every_substep_bearing_step_has_a_why_all_methods`.
>
> **I klartekst:** Vi tettet gjæringsstegene i v6.10, men en *full* gjennomgang av
> at alle steg i alle metoder har jevn `tip`/`hvorfor`-dekning — pluss en test som
> vokter det framover — gjenstår. Direkte fortsettelse av arbeidet vi gjorde, lav
> risiko. Blant de letteste å ta.
Forfatteren tetter dekningshull metode-for-metode (why-bokser v5.70, understeg
v5.98–5.99, PC/mobil 1:1 v5.63). Samme audit er verdt på `step.tip`/`step.why`:
flere steg definerer `substeps` uten `tip`/`why` (f.eks. passive Poolish/Biga-venter
`1659–1664`), så «💡 Tips»-bryteren (v6.00) avslører ujevn tetthet. En paritetspass +
en regresjonstest à la eksisterende `pc_mobil_1to1_*` passer måten forfatteren
allerede vokter konsistens på.

### F12. Lys/mørk-tema også for PC-visningen ⏸️ UTSATT (bevisst, aug 2026)
> ⏸️ **Utsatt etter avklaring.** Å koble PC på det delte tema-systemet (dark =
> ingen `.theme-light`-klasse, som er standard) ville gjort PC **mørkt som
> standard** — en synlig endring for dagens PC-brukere. Rune valgte å beholde PC
> lyst for nå. Kan tas opp igjen senere; da må default-oppførselen (mørkt som
> mobil vs. behold lyst med egen `.theme-dark`) bestemmes først. Forno-
> mørkpaletten finnes ferdig å gjenbruke.
>
> **I klartekst:** v6.17 ga mobil-layouten en ekte lys/mørk-bryter (Tons of Rock-
> kremtema). PC-visningen har fortsatt sin egen, faste lyse styling og får ikke
> temavalget. F12 er å la `.theme-light`/mørk-tokenene også styre desktop-layouten,
> så «Tema»-bryteren gjelder begge. Middels — mye av token-arbeidet er gjort; PC
> bruker `--dyn-*` i stedet for `--forno-*`, så det krever en egen mørk PC-palett
> og re-scoping, ikke bare gjenbruk.

### T-i18n. Gjenstående oversettelses-hull (engelsk) ✅ STORT SETT BYGGET (v0.668, gren)
> ✅ **PC-hovedlayout bygget (venter prod).** Oversatt: sidemenyen, metodekortene,
> seksjonsetikettene, planleggings-boksen, glidebryter-etikettene (Melmengde/
> Hydrering/Kjøleskapsheving/Romtemperatur) og topnav-fanene (Steg for steg/
> Oppskrift/Notater). `setLang` re-rendrer nå PC-planen når PC er aktiv, så
> topnav-en bytter språk med det samme. Endringsloggen ble tospråklig i v0.660.
> **Gjenstår (lav prio):** de bittesmå range-endepunkt-etikettene («55% fast»,
> «18°C kjølig»), det dype «Avanserte innstillinger»-panelet, og admin-verktøyet
> (internt). Test: `pc_static_html_localized_including_topnav`.
>
> **I klartekst:** Hele mobilappen er oversatt (v6.15 + v6.20-vask), men noen
> hjørner er fortsatt kun norske i engelsk modus:
> - **PC-visningens statiske HTML** (sidebar-slidere, desktop-topnav «Steg for
>   steg/Oppskrift/Notater», enkelte hint) — utenfor det mobil-fokuserte i18n-passet.
> - **Admin-verktøyet** (`openAdminLogin`/`loadAdminView`/`openFormlerModal` + prompts)
>   — internt, ikke sluttbruker-vendt, men fortsatt norsk.
> - **Endringsloggen** («Hva er nytt») rendres fra `CHANGELOG` som kun er norsk.
> Lav prioritet (dekkes av «AI-oversatt»-varselet), men verdt å notere så det ikke
> ser ut som en forglemmelse. Endringsloggen er den mest synlige av de tre.
>
> **Delvis løst (v0.660):** Endringsloggen er nå tospråklig (`d_en`/`changes_en`
> per entry, `buildChangelogHTML` språkbevisst). PC-statisk HTML og admin gjenstår.

### T-i18n2. Språkbytte re-tegner feil fane — genererte paneler «henger igjen» ⏳ NOTERT (aug 2026)
> **I klartekst:** Bytter du språk mens du står på **Deiger** eller **Smart-plan**
> (eller deler av Innstillinger), blir det du ser på stående på gammelt språk til
> du navigerer vekk og tilbake. Statiske tekster oversettes med det samme, men
> *genererte* paneler på andre faner enn Tidsplan gjør det ikke. Liten fiks, lav
> risiko — men bevisst parkert av Rune for nå (aug 2026).
>
> **Rotårsak:** `setLang` (`948`) oversetter statiske tekster (`syncStaticI18nUI`)
> og re-rendrer så innhold — men kaller **alltid `mobGen()`**, som tegner
> Tidsplan-fanen, uansett hvilken fane som faktisk vises. `mobShowTab` (`6056`)
> re-rendrer derimot hver fane *når man lander på den* (Deiger →
> `renderBaksterPanel`, Smart-plan → `renderBetaPanel`, Innstillinger →
> `wizEnterSettingsTab`). Står du på en annen fane enn Tidsplan når du bytter
> språk, oppdaterer `setLang` altså en skjult fane, mens den synlige beholder
> gammelt språk til neste navigering self-healer den.
>
> **Anbefalt fiks (låg endring, gjenbruk):** la `setLang` re-tegne den *aktive*
> fanen via samme render-vei som navigering (finn aktiv `mob-*`-skjerm og kjør
> dens renderer — `mobGen`/`renderBaksterPanel`/`renderBetaPanel`/
> `wizEnterSettingsTab`), i stedet for hardkodet `mobGen()`. PC-siden (`gen()`)
> bør sjekkes for samme fler-panel-lekkasje. ~5 linjer, ingen ny i18n-arkitektur.
>
> **Alternativer vurdert:** (a) `location.reload()` ved språkbytte — 1 linje, total
> dekning, men flimmer/lukker modaler/re-henter data; (b) deklarativ `data-i18n`-
> sveip som erstatter id-lista — dreper «manglende statisk streng»-klassen for
> alltid, men større engangsjobb og fikser ikke i seg selv de genererte panelene.
>
> **Forbehold:** dekker ikke en statisk streng som *mangler* i `syncStaticI18nUI`-
> lista (egen liten fiks per streng, eller `data-i18n` senere). Den genererte-
> panel-lekkasjen over er den klart største kilden til «henger igjen».

### F13. Bytt plass på «☰ Mer» og «🧭 Smart-plan» i mobil-tabbaren ✅ BYGGET (v0.664, gren)
> ✅ **Bygget (venter prod).** Fanene byttet i tabbar-HTML-en, `MOB_TABS` reordnet
> til å speile ny rekkefølge (Planlegging · Tidsplan · Smart-plan · Mer). Mer-
> badgen lander fortsatt på Mer. Test: `mer_tab_moved_rightmost_swapped_with_smartplan`.
>
> **I klartekst:** «Mer»-fanen bør ligge lengst til høyre — det er der en «mer/
> flere»-fane konvensjonelt hører hjemme (som en overløps-meny). I dag er
> rekkefølgen Planlegging · Tidsplan · Mer · Smart-plan, så «Mer» ligger nest
> sist og Smart-plan lengst til høyre. Bytt de to, så det blir Planlegging ·
> Tidsplan · Smart-plan · Mer. Rent kosmetisk/rekkefølge, liten jobb.
- Tabbaren bygges som fire `.mob-tab`-divs (rundt `mob-tabbar`, i dag rekkefølge
  `settings, plan, tips, beta`). Bytt om `tips` (☰ Mer) og `beta` (🧭 Smart-plan)
  i selve HTML-en. Sjekk at rekkefølgen også speiles der fanene itereres:
  `MOB_TABS`-arrayen, `mobShowTab`-løkka og `syncI18nUI`s tab-etikett/badge-løkke
  (Mer-badgen `mob-tab-mer-badge` må fortsatt havne på Mer-fanen). Logikken er
  rekkefølge-uavhengig; kun den visuelle plasseringen endres.
- Ingen frosne tall berørt (ikke baseline). Verifiser at aktiv-markering og
  Mer-tellerbadgen fortsatt lander riktig etter ombyttingen.

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

---

## Nytt (aug 2026 — oppskriftsgjennomgang v0.698)

To punkter som kom ut av en inndata-forankret oppskriftsgjennomgang. Gjærtips-
teksten som ble lagt til i v0.697 ble samtidig fjernet igjen (feil premiss for et
norsk publikum: 1–3 °C er et *riktig* innstilt kjøleskap, ikke et kaldt et), og
kompensasjonen hører hjemme i F13 under i stedet for som fast prosatall.

### F13. Kjøleskapstemperatur som inndata i Finjuster (med gjærkompensasjon) ✅ FIKSET (v0.722)
> ✅ **Fikset.** Fire soner i Finjuster (0–2/2–4/4–6/6–8°C, `S.fridgeC` = sone-
> midtpunkt), gjærkompensasjon via `CALIBRATION.fridgeMult` [[1,1.3],[3,1.0],
> [5,0.8],[7,0.65]] og `fridgeYeastMult()` i motoren. Referanse 2–4°C = 1,0× →
> standardvalget endrer ingen tall (baseline urørt), akkurat som backlog-punktet
> krevde (Mattilsynet-forankret, ikke «+25–30%» i prosa). Gjelder standard/
> poolish/biga (via R()) og kveld (via recipeFor — kveldSteps leser nå også
> recipeFor i stedet for lokal duplikat-utregning); mania (fast publisert
> oppskrift) og hurtig (kaldhever ikke) bevisst unntatt via nytt
> `METHODS.fridgeTemp`-flagg som også styrer synligheten i Finjuster. Test:
> `fridge_temp_input_compensates_yeast_default_unchanged`.
- **I klartekst:** Appen har i dag ingen anelse om hvor kaldt brukerens kjøleskap
  er — den antar en implisitt referanse. Legg til et valg for kjøleskapstemperatur
  (f.eks. 0–2 / 2–4 / 4–6 °C) i Finjuster, og la appen regne ut gjærkompensasjonen
  selv (kaldere → litt mer gjær for samme sluttresultat til samme tid). Da slipper
  vi et fast «+25–30 %»-tall i prosa som ikke vet hvilket kjøleskap leseren har.
- Mattilsynet-forankring: riktig kjøleskap er 0–4 °C (over frysing, under 4 °C), så
  standard/referanse bør ligge der — ikke «2–5 °C».
- **[baseline]** — endrer gjærtall når temp≠referanse.

### F14. Benketid/temperering (steg 7) skalerer ikke med romtemperatur ✅ FIKSET (v0.720)
> ✅ **Fikset.** `tailSteps` regner nå `temper=Math.max(60,Math.min(rtM(240),
> cM2-15-60))` — 22°C gir 240 min som før (baseline urørt), 18°C→384, 26°C→156.
> Kald tid = cM2−temper−15, aldri under 60 min. Stek/middag flyttes ikke (temper
> avledes fra stek-tidspunktet). Stegtekst + understeg viser nå dynamisk tid og
> romtemp; WHY.tu sier «noen timer» i stedet for «ca. 4 timer». Kveldsdeigs egen
> TEMPER_MIN bevisst urørt (skalerer med kjøletimer). Test:
> `bench_temper_scales_with_room_temp_dinner_fixed` (skalering, sum-invariant,
> fast middag, poolish-forspill upåvirket, nedre binding).
- **I klartekst:** Den korte romtemperaturhevingen (steg 4) skalerer allerede med
  `S.temp` via `rtM()`/`tf()` (18 °C → lengre, 26 °C → kortere). Men benketida etter
  kjøleskapet — «Ta ut av kjøleskap», steg 7 — er hardkodet **240 min** i
  `tailSteps()` (`index.html:2201`, `taUt=sM(bake,240)`; kald tid = `cM2-240-15`).
  En bruker på 18 °C og en på 26 °C får identiske 4 timer, selv om samme steg-tekst
  sier at «hvor lenge den trenger avhenger av hvor varmt rommet er». Gjelder
  standard/poolish/biga (Kveldsdeig har egen `TEMPER_MIN`, men den skalerer på
  kveld-timer, ikke romtemp).
- **Fiks (skisse):** bytt `240` mot en temp-skalert verdi (`rtM(240)` e.l.), men
  **bound den** slik at kald tid (`cM2 - temper - 15`) aldri blir negativ for korte
  kald-innstillinger, og gjør steg-tekstens «ca. 4 timer» dynamisk. Ankeret (stek =
  form + cM2) og middagstiden endres ikke — kun fordelingen kald tid ↔ benketid.
- **Test:** generer samme plan på 18 °C og 26 °C, assert at benketida i steg 7
  faktisk endrer seg (NB: poolish-*varigheten* i steg 1 skal IKKE endre seg — den er
  et brukervalgt tall, ikke temp-styrt).
- **[baseline]** — flytter tidsplan-tall.

### F15. Anbefalt vanntemperatur (°C) i blandestegene for poolish/biga/standard ✅ FIKSET (v0.721)
> ✅ **Fikset.** `calcWaterTempC(target=24)` generalisert med target-parameter i
> stedet for en egen `recommendedWaterTempC` (én utregning, to mål: hurtig 24°C,
> standard/poolish/biga 23°C — midt i deres 22–24-mål). `waterTempPhrase()`
> fletter inn «(anbefalt ca. X°C)» og beholder maskin-avhengig ordlyd; FF-
> friksjonsvarmen (ankarsrum 8 / manuell 4 / annen 16) er innbakt. Ingen elting
> beholder kvalitativ tekst (skje-blanding, ingen friksjon, 15t romheving).
> Test: `mix_steps_recommend_concrete_water_temp_c_std_poolish_biga` (alle tre
> metodene, temp- og maskinrespons, hurtig uendret, ingenelting kvalitativ).
- **I klartekst:** Hurtigdeig oppgir allerede en konkret vanntemperatur i °C
  (regnet ut fra ønsket deigtemperatur og friksjonsvarme, `index.html:~2106`,
  `t = 3*target − S.temp − S.temp − FF`). Poolish/biga/standard sine blandesteg
  bruker bare den kvalitative `waterTempPhrase()` («kjølig eller romtemperert vann»).
  En konkret °C-anbefaling der ville gitt jevnere resultat gjennom året (kaldt
  kjøkken om vinteren vs varmt om sommeren treffer samme ~24 °C deigtemperatur).
- **Skisse:** gjenbruk hurtig-metodens vanntemp-utregning i et delt
  `recommendedWaterTempC()` og flett inn i blandestegenes desc ved siden av
  `waterTempPhrase()`. Husk friksjonsvarme varierer med kjøkkenmaskin (FF).
- Foreslått av oppskriftsgjennomgang, aug 2026 (sammen med work-time/knead-time-
  presiseringen som ble gjort i v0.700).
- **[baseline]** hvis tallet vises i frosne render-tester.

## Motor / arkitektur (aug 2026 — motorgjennomgang v0.713)

Resultat av en systematisk gjennomgang av beregningsmotoren (gjær, mel, tider).
Dommen: matten er sunn (prosentbasert + interpolerte gjærkurver med ærlige kilder),
og testharnesset (114 tester + `baseline_results.json`) er grunnen til at vi tør
endre noe som helst. Skjørheten er arkitektonisk: **flere sannhetskilder** og
**håndspeilede beregninger**. De tre siste oppskriftsgjennomgangene fant alle
sammen feil som F17+F19 ville gjort *umulige* (ikke bare usannsynlige): kopier-
oppskrift ≠ steg (v0.713 Mania, tidligere hurtig/kveld via `currentYeastAmount`),
duplikatsteg, skygge-konstanter i utakt.

Punktene er en trapp — hvert trinn kan shippes alene med grønne tester, i denne
rekkefølgen. F17 er det klart mest verdifulle.

### F17. Én oppskriftskilde: `recipeFor(state)` for ALLE metoder og flater ✅ BYGGET (v0.715)
> ✅ **Bygget.** `recipeFor()` returnerer hele sannheten (mel/vann/salt/fett/gjær/
> hydrering/forspill) for alle metoder; `currentYeastAmount` er nå et tynt lag over
> den, og copyP, PC-gen(), mobGen (mania + generisk gren) leser den. Fant og fikset
> to latente feil underveis: PC-oppskriftsfanen viste R()-tall for Mania (325/14/
> 1,13/65% + S.cold-rad), og mobGen's mania-gren manglet ingenelting-vakten.
> Invariant-test: `invariant_copy_recipe_matches_recipefor_all_methods` (alle 6
> metoder) + `pc_recipe_tab_mania_uses_maniarecipe_not_r`.
- **I klartekst:** Gjær-sannheten bor i dag på fire steder: `R()` med
  `BYEAST`×`coldMultForHours`×`prefermentYeastMult` (`index.html:1919`),
  `HOPTS.yp` for hurtig (`1283`), `KCOLDMULT` for kveld (`1337`) og
  `maniaRecipe()` (`1930`). Hver flate som viser ingredienser (Tidsplan-steg,
  Oppskrift-fanen PC + mobil, Kopier oppskrift, kalender) må kjenne alle fire —
  glemmer én flate ett tilfelle, spriker tallene. Det er nøyaktig feilklassen bak
  `currentYeastAmount()`-plasteret (`3048`) og v0.713-Mania-fiksen i `copyP`.
- **Fiks (skisse):** ett kall `recipeFor(state)` som returnerer hele sannheten
  — mel, vann, salt, fett, gjær (tørr/fersk), hydrering, ev. forspill-splitt
  (poolish/biga/mania) — uansett metode. Alle flater leser denne; `R()`,
  `maniaRecipe()` og `currentYeastAmount()` blir interne detaljer bak døra.
  Mest flytting av eksisterende kode, lite ny logikk.
- **Gevinst:** klassen «kopien viser andre tall enn stegene» dør strukturelt.
- Ikke [baseline] hvis riktig gjort — tallene skal være identiske før/etter.

### F18. Én interpolator + samlet `CALIBRATION`-blokk ✅ BYGGET (v0.716)
> ✅ **Bygget.** `CALIBRATION` samler tempFactor/coldMultHours/poolishRoom/
> poolishCold/biga-kurvene; `interpLin(pts,x,dec)` er den ene interpolatoren
> (dec-param bevarer tf sine 2 desimaler — verifisert bit-identisk). Død
> COLDMULT-dagstabell fjernet. HOPTS/KOPTS/KCOLDMULT bevisst ikke flyttet
> (menyer med UI-etiketter, ikke kurver). Test:
> `calibration_curves_unified_interpolator_identical_values`.
- **I klartekst:** `interpLin()` (`1328`) finnes, men `coldMultForHours()` (`1369`)
  og `tf()` (`~1495`) har hver sin kopi av samme løkke. Kalibreringskurvene ligger
  spredt: `HOPTS`, `KCOLDMULT`, `COLDMULT_HOURS`, poolish/biga-punktene i
  `prefermentYeastMult()`. Samle kurvene i ett `CALIBRATION`-objekt og bruk én
  interpolator overalt. Åpner for versjonering/admin-redigering senere (samme
  mønster som MELTYPER + `recomputeColdMax`, som allerede gjør dette riktig).
- Liten jobb, null adferdsendring. Ikke [baseline].

### F19. Deklarative fasespesifikasjoner + én planlegger (frem OG tilbake) ✅ BYGGET (v0.717, pragmatisk omfang)
> ✅ **Bygget — den strukturelle kjernen.** Alle metoder planlegger nå i ÉN
> retning: bakover-modus er kun «trekk totalen fra ankeret», deretter regnes alt
> fremover (ingenelting/hurtig/kveld hadde mønsteret; standard/poolish/biga/mania
> er skrevet om — Manias to håndskrevne speilkjeder er borte). Manias fase-
> varigheter hoistet til `MANIA_T`, lest av både stegbyggeren og
> `totalFermentHours()` — skygge-håndsummen «720/60 + …» er død. Tester:
> `mania_schedule_span_and_ferment_hours_from_same_constants` låser at spennet i
> faktisk tidsplan == sum(MANIA_T) og gjæringstimer == samme sum − deling;
> v0.714-invarianten vokter frem==tilbake. Alle tidspunkter bit-identiske
> (frosne ISO-baselines urørt).
>
> **Bevisst IKKE gjort:** full id-nøklet tekst/fase-separasjon (steg-tekstene
> ligger fortsatt inline i generatorene). Korrekthet-gevinsten er allerede tatt
> av én-retnings-planleggingen + invariant-testene; tekst-separasjonen ville
> vært stor flytting med liten sikkerhetsgevinst. Kan tas senere om behovet
> (gjenbruk av tekster på tvers av metoder) faktisk oppstår.
- **I klartekst:** Hver metode bygger stegkjeden sin to ganger for hånd — én
  fremover-gren og én baklengs-gren med minus-fortegn (`rawSteps` `2160`,
  mania-grenen `2410`, `hurtigSteps` `2506`, `kveldSteps` `2569`). Hvert nye steg
  må legges til begge steder. I tillegg finnes skygge-konstanter som håndsummerer
  strukturen på nytt: `totalFermentHours()` for Mania er bokstavelig talt
  `720/60 + 120/60 + 25/60 + …` (`3853`) — endres et steg uten at summen
  oppdateres, lyver Smart-plan og melvarslene stille.
- **Fiks (skisse):** beskriv hver metode som data:
  `[{id:'poolish-mix', dur:8, loc:'benk'}, {id:'poolish-ferment', dur:712, passive:true}, …]`
  med tekster for seg, nøklet på id. Én felles planlegger går kjeden fremover
  eller baklengs fra ankeret. Da kan frem/tilbake aldri sprike,
  `totalFermentHours = sum(durs)` (skygge-konstanten dør), og Smart-plan leser
  samme spesifikasjon. Migrér én metode om gangen (start med hurtig — enklest),
  med baseline-JSON som garanti for uendret output underveis.
- Størst jobb i bunken, størst strukturell gevinst. Ikke [baseline] per metode
  hvis migrert riktig (output skal være identisk).

### F20. Generiske invariant-tester (egenskaper, ikke bare frosne fasiter) ✅ BYGGET (v0.714)
> ✅ **Bygget.** To invariant-tester: (a) `invariant_forward_equals_backward_and_
> monotonic_all_methods` — 9 caser (alle metoder + poolish-varianter + ingen
> elting) verifiserer at fremover- og baklengs-planen er identisk (lengde, titler,
> tidspunkter) og at tidslinjen er monoton med ikke-negative varigheter;
> (b) `invariant_mania_water_parts_sum_to_hydration_and_salt_3pct` — mania-
> vanndelene summerer til 64,03%±2g og salt 3,0%±avrunding over mel 200–1000g.
> Ny metode dekkes ved én linje i case-lista. Kjørt grønn FØR refaktoreringen
> (F17/F19) starter — det var poenget.
- **I klartekst:** Dagens tester fryser konkrete tall (bra!) og vokter konkrete
  fikser (én test per feil vi har hatt). Legg til egenskaps-tester som kjøres for
  *alle* metoder × typer × moduser automatisk: (a) fremover(anker) og
  baklengs(samme steketid) gir identisk plan; (b) kopier-tall == oppskriftsfane-
  tall == steg-tall; (c) vanndeler summerer til hydrering×mel; (d) stegkjeden er
  monotont stigende i tid uten hull/overlapp. Én slik test dekker automatisk hver
  ny metode som fødes — i stedet for at hver review finner samme klasse på nytt.
- Kan bygges FØR F17/F19 og fungere som sikkerhetsnett under refaktoreringen.
  Middels jobb. Ikke [baseline].

### F21. Metode-register: ett `METHODS`-objekt i stedet for spredt dispatch ✅ BYGGET (v0.718, pragmatisk omfang)
> ✅ **Bygget.** `METHODS` (7 metoder: no/en/noShort/enShort + coldSlider/
> smartPlan-flagg) driver nå mN(), BETA_METHOD_DEFS (avledet), Deiger-filterets
> metodeliste (avledet) og kald-slider-synligheten på alle tre stedene via
> `methodShowsColdSlider()`. Avdekket og fikset PC/mobil-desync: applyTypeUI
> manglet mania i kald-slider-lista, så PC viste justerbar kjøletid for en
> fast-struktur-metode. Test: `methods_registry_drives_names_flags_and_pc_cold_
> slider_fix`. De gjenværende `S.method==='…'`-treffene er ekte logikkgrener
> (inne i generatorer/varsler), ikke lister — de hører hjemme der de er.
- **I klartekst:** 71 steder spør `S.method==='…'` og 21 spør `S.type==='…'`,
  inkludert hardkodede lister som `(v==='hurtig'||v==='kveld'||v==='mania')?'none'`
  for kald-slideren (`1597`, `5854`) og metode-lister i Smart-plan/filter
  (`3384`, `6927`). En metode nr. 7 betyr å finne alle sammen. Samle
  `{label, recipe, phases, uiFlags:{harKaldSlider, justerbar, …}}` per metode i
  ett register; dispatch-stedene blir oppslagsfelt.
- Gjøres naturlig ETTER F17/F19 (da finnes recipe/phases å peke på). Middels.

### F22. Trekk motoren ut i `engine.js` (valgfritt sluttsteg) ✅ BYGGET (v0.719)
> ✅ **Bygget.** `engine.js` (190 linjer) inneholder nå kjernen: CALIBRATION +
> interpLin + prefermentYeastMult + coldMultForHours, tf/rtM, R/MANIA_T/
> maniaRecipe/yA/recipeFor/yLabelFor/pc, METHODS/mN/methodShowsColdSlider,
> currentYeastAmount, totalFermentHours/fixedFermOverheadHours, flourForCount.
> Lastes før hovedscriptet (som changelog.js/guide.js); deler globalt miljø, så
> ingen API-endring. Ingrediens-%-tabellene (BSALT m.fl.) ble bevisst igjen i
> index.html — de er `let` og admin-muterte via applyFlours/recomputeColdMax
> (DOM-koblet). Test: `engine_extracted_to_engine_js_and_functional`; hele
> suiten (122) beviser uendret oppførsel.
>
> **Med dette er hele motortrappen F17–F22 levert** (v0.714–v0.719, PR #115–#120).
- **I klartekst:** Samme grep som da `changelog.js` ble skilt ut: ren
  beregningskjerne (recipeFor, planlegger, kalibrering) uten DOM-avhengigheter i
  egen fil. Da kan mattetestene kjøre uten Playwright/nettleser (raskere, flere
  caser), og index.html krymper. Forutsetter F17+F19; ellers flytter man bare
  spaghettien. Liten jobb når trappen ellers er tatt.

### F23. Q10-modell: én gjæringslov i stedet for fem multipliserte tabeller ✅ BYGGET (v0.729, Langtidsdeig)
> ✅ **Bygget for Langtidsdeig.** `fermentLoadHours()` summerer over INTERVALLENE
> i den ekte stegkjeden (ikke `s.dur` — flere steg har `dur:0` og bærer tiden som
> avstand til neste steg, typisk hele benketida), med temperatur fra hvert stegs
> `loc`. `Q10=2,3`, `Q10_K=14,85`. Rekursjon (R→steg→R) løst med en vakt som
> faller tilbake på tabellveien under selve integralberegningen — trygt fordi
> TIMINGEN ikke avhenger av gjærmengden — pluss memoisering, siden `R()` kalles
> én gang per steg-tekst. Test: `q10_model_calibrated_for_standard_others_unchanged`.
>
> **Kalibrering (napoletana 500 g, 22 °C, 3 °C skap):** 24 t og 72 t treffer
> dagens tall eksakt; 48 t −0,04 g, 96 t +0,01 g, 120 t +0,04 g. Alle avvik under
> oppløsningen på en hjemmevekt. Baseline oppdatert kirurgisk — verifisert at
> KUN gjærverdien endret seg (0,79 → 0,75 i standard-scenarioene).
>
> **⚠️ Funnet som endret konklusjonen:** påstanden om at «romheving og benketid
> nå teller med» stemmer teknisk, men gir i praksis **ingen** endring —
> belastningen varierer bare 0,6 % fra 18 °C til 26 °C. Årsaken er at `tf()`
> allerede forlenger romfasene når det er kaldt, så gjæringsmengden holder seg
> konstant. Q10 **bekreftet** altså den eksisterende tidsskaleringen i stedet for
> å korrigere den. Testen låser dette (`tempCompensated`, spredning < 2 %), så
> bryter noen tf()-kompenseringen senere, faller den.
>
> **Reell gevinst ble derfor:** (1) én lov i stedet for tre multipliserte tabeller
> for denne metoden; (2) kjøleskapstemperatur virker nå gjennom fysikk i stedet
> for `fridgeMult`, som var en innrømmet gjetning (F13) — og gir et mildere
> utslag (1 °C: ×1,11 mot gjetningens ×1,3); (3) ærlig ekstrapolering utenfor
> tabellenes spenn.
>
> **Bevisst IKKE med: Poolish og Biga.** Q10-integralet ville kuttet
> poolish-gjæren med ~2,4× (fra 1,13 g til ~0,47 g for 14 t romtemperatur-
> poolish), fordi et 14-timers forspill ved 22 °C bærer enorm gjæringsbelastning.
> Det *kan* være riktig — 0,45 % gjær av poolish-melet er høyt mot vanlig praksis
> på 0,1–0,3 % — men en så stor endring må valideres mot ekte bakst før den
> shippes. **Eget backlog-punkt: F24.** Hurtigdeig (egen HOPTS-kurve med
> UI-etiketter), Kveldsdeig (KCOLDMULT) og Mania (fast oppskrift) beholder sine
> kurver.

### F33. Etterprøv gjærskaleringen for 30 % poolish — 🧪 VENTER PÅ BAKST (v0.787)

30 %-varianten bruker `prefermentShareScale()`: kurvene i CALIBRATION er satt for
en poolish på halvparten av melet, og avviket fra 1,0 skaleres med andelen. Ved
30 % blir 12-timers 1,20 til 1,12 og 48-timers 0,50 til 0,70.

**Dette er en resonnert skalering, ikke et bakt tall.** Resonnementet er at en
mindre poolish forgjærer mindre av melet og derfor bidrar tilsvarende mindre —
men det er lineært antatt, og gjæring er ikke lineær. Samme status som
`fridgeMult`-kurven har.

**Hva som må måles:** bak samme oppskrift med 50 % og 30 % poolish, samme timer,
samme kjøleskap. Er 30 %-deigen merkbart under- eller overhevet ved samme
tidspunkt, ligger skaleringen feil. Kjør gjerne sammen med F24-kontrollbaket —
det er samme aksen (hvor mye gjær trengs egentlig), bare fra en annen kant.

**Ikke rør noe før det:** deigtemperaturen og melsplitten er målt og verifisert
(r154, r155). Det er kun gjærmengden som står på et anslag.

### F24. Vurder Q10 også for Poolish og Biga — 🧪 FØRSTE BAKST-RESULTAT (v0.761)
> ⚠️ **Første ekte data, og de peker mot NEI for Kveldsdeig.**
>
> To bakst med gjærtesten på, Kveldsdeig 18 t / kjøleskap 3 °C. Det gir
> **1,86 g mot normalt 0,90 g — +107 %**. Meldte symptomer: veldig myk deig som
> flyter ut, lite volumøkning, ingen bobler igjen på toppen, nesten ingen
> ovnsheving. Det er bildet på en deig som har toppet og falt før steking, og
> det er hva dobbel gjærmengde på 18 timer kaldt gjør.
>
> **Ikke konkludert ennå.** Det mangler en kontroll: samme oppsett med testen AV.
> Uten den kan ikke gjæren skilles fra en annen svakhet vi kjenner — Kveldsdeig
> er den eneste metoden i appen uten noe mellomsteg mellom elting og balling
> (15 min, mot 80–159 min for alle andre). Begge kan gi myk deig som flyter ut.
> Derfor er prosessen bevisst IKKE endret ennå: to endringer samtidig gjør
> neste bakst umulig å tolke.
>
> Merk asymmetrien i risiko: for Poolish og Biga senker testen gjæren (−58 %,
> −65 %), og en underhevet deig venter man seg ut av. For Kveldsdeig hever den
> gjæren, og en overhevet deig kommer ikke tilbake. Samme bryter, motsatt
> retning, ulik pris ved feil.
>
> Læring om kopien: gjennomgangen som analyserte planen leste 1,86 g som
> oppskriftens NORMALE mengde og begrunnet den bort, fordi merket bare sa
> «forsøksmengde» uten størrelse. v0.761 legger til retning og prosent —
> ett tall, ikke to.

### F24 (bakgrunn). Verktøyet — 🧪 UTFORDRER BYGGET (v0.741)
> 🧪 **Verktøyet er bygget; spørsmålet står fortsatt åpent.** F24 sa selv at dette
> ikke kan avgjøres ved tastaturet. v0.741 gjør derfor ikke et bytte — den gir deg
> en utfordrer du kan slå på og bake mot: **Innstillinger → 🧪 Utprøving →
> «Teste ny måte å regne ut gjærmengden»**. Av som standard.
>
> **Målt sprik ved påslag** (napoletana 500 g, 22 °C rom, 3 °C skap):
>
> | Metode | I dag | Q10 sier | Endring |
> |---|---:|---:|---:|
> | Langtidsdeig 24/48/72 t | 1,13 / 0,75 / 0,56 | samme | **0,0 %** (kontroll ✓) |
> | Poolish 14 t + 24 t | 1,13 g | 0,48 g | **−58 %** |
> | Biga 18 t + 24 t | 1,13 g | 0,40 g | **−65 %** |
> | **Kveldsdeig 10 t** | 1,24 g | 2,89 g | **+133 %** |
> | Mania (ikke aktuell) | 0,85 g | 0,42 g | −51 % |
> | Hurtigdeig (ikke aktuell) | 3,00 g | 2,57 g | −14 % |
>
> **Kveldsdeig er et nytt funn** og sto ikke i F24 opprinnelig — den peker MOTSATT
> vei. Den er også det svakest funderte tilfellet: `Q10_K` er kalibrert på
> Langtidsdeig, der belastningen er 9,9–19,7 ekvivalenttimer, mens Kveldsdeig
> ligger på 3,9. Det er ekstrapolering langt utenfor kalibreringsområdet — altså
> nøyaktig den påstanden F23 gjorde om «ærlig ekstrapolering», ubevist til noen
> har bakt den.
>
> Langtidsdeig lander på 0,0 % og fungerer som kontroll: at den treffer eksakt
> bekrefter at målemetoden er riktig, ikke bare at tallene ser rimelige ut.
>
> **Hvorfor det er trygt:** flagget bor i `S` (og dermed i `SETUP_FIELDS`), så
> `saveBake` lagrer det med deigen av seg selv, og å åpne en gammel deig gjenskaper
> den med samme gjærmodell. Et forsøk der du ikke vet hvilken gjærmengde deigen
> hadde, er ikke et forsøk. Både oppskriftsraden og «Kopier plan» oppgir hva
> metoden normalt ville gitt — en test som bare viser det nye tallet er en endring,
> ikke en test.
>
> **Hva som gjenstår:** bak Poolish med og uten, gi dem terningkast i Deiger, og
> gjør det samme for Biga og Kveldsdeig. Først da kan modellen byttes for alvor —
> og da er det et **[baseline]**-bytte som skal tas sammen med F26.
>
> Testet av `yeast_test_challenges_three_methods_off_by_default`: av som standard,
> at registeret (`METHODS.yeastTest`) styrer hvem som utfordres, at begge tall
> vises, at retningen stemmer per metode, at stegene og oppskriften fortsatt viser
> samme gjær (F17-kontrakten), og at kopien sier fra når testen er på — og tier når den er av.
- **I klartekst:** F23 innførte Q10 for Langtidsdeig. Utvider vi den til Poolish,
  faller gjærmengden fra 1,13 g til ca. 0,47 g for standardvalget (14 t
  romtemperatur-poolish + 24 t kaldt) — en reduksjon på ~58 %. Modellen mener
  altså at dagens poolish er kraftig overdosert, og det er ikke åpenbart feil:
  1,13 g tørrgjær med alt i poolishen tilsvarer ~0,45 % av poolish-melet, mens
  vanlig praksis for en 12–16 t romtemperatur-poolish er 0,1–0,3 %.
- **Hvorfor det ikke ble gjort i F23:** en halvering av gjæren er den største
  enkeltendringen appen ville gjort mot en eksisterende bruker. Den må bakes,
  ikke bare regnes. Vi har allerede infrastrukturen for å teste det: Deiger-fanen
  lagrer terningkast, notat og bilde per deig (F9), så to bakst med gammel og ny
  gjærmengde kan sammenlignes direkte.
- **Merk også:** `prefermentYeastMult` (v0.697) trakk bevisst NED gjæren i den
  lange enden (15–16 t) fordi «all gjæren ligger i poolishen og den topper og
  faller lett». Q10-integralet gjør delvis det samme automatisk (lengre forspill
  → større belastning → mindre gjær), så kurven kan trolig fjernes ved et bytte —
  men sjekk at den lange enden ikke blir for aggressiv.
- **[baseline]** — vil flytte poolish- og biga-tallene betydelig.
- Middels. Avhenger av reell baketesting, ikke av kode.
- **I klartekst:** Gjærmengden regnes i dag ut ved å gange sammen fem separate,
  håndtunede oppslagstabeller — `tempFactor` (romheving), `coldMultHours`
  (kaldheving), `fridgeMult` (skaptemperatur), pluss egne kurver for poolish og
  biga (alle i `CALIBRATION`, `engine.js`). Alternativet er én fysisk lov: Q10 —
  gjæringsraten halveres for hver 10 °C temperaturen faller. Da regner man hver
  fase om til «ekvivalente timer ved 22 °C», summerer over hele planen, og løser
  for gjær ÉN gang. Konkurrenten Pandough bruker denne modellen.
- **Fire ting vi vinner:**
  1. **Konsistens gratis.** Tabellene er tunet uavhengig, så ingenting garanterer
     at 18 °C rom × 48 t kaldt × 1 °C skap henger sammen med 26 °C × 24 t × 5 °C.
     Én lov kan ikke motsi seg selv.
  2. **Ærlig ekstrapolering.** Kurvene våre klamrer utenfor 18–28 °C og
     24–144 t — en gjetning forkledd som en verdi. Q10 gir et begrunnet svar.
  3. **Romheving og benketid teller faktisk med.** I dag bidrar de ikke til
     gjærberegningen i det hele tatt; kun kaldtiden gjør det. Det er en reell
     unøyaktighet, ikke bare et arkitekturpoeng — og den ble større med F14, som
     lot benketida variere fra 2,6 t til 6,4 t med romtemperaturen.
  4. **Bedre provenienś.** Q10 ≈ 2–3 er en litteraturverdi. Våre ~30 tall har
     blandet opphav; `fridgeMult` (v0.722) er eksplisitt en kvalifisert gjetning,
     og det står i kodekommentaren.
- **Hvorfor dette er mulig nå (og ikke før):** F19 ga hvert steg en varighet, og
  hvert steg har allerede en `loc` (`kjol`/`rom`/`benk`/`ovn`) — altså en
  temperatur: `kjol` → `S.fridgeC`, `rom`/`benk` → `S.temp`. Integralet kan
  derfor regnes rett ut av den EKTE stegkjeden (samme kilde `planSpanMin()`
  bruker), uten en parallell modell som kan drifte. F17 samlet gjæren ett sted,
  så byttet skjer i `R()` og treffer alle flater samtidig.
- **Skisse:**
  `fermentLoadHours(steps) = Σ dur/60 × Q10^((T(loc) − 22)/10)`, deretter
  `yDry = mel × BYEAST[type] × k / load` med én kalibreringskonstant `k`.
  `Q10` og `k` i `CALIBRATION`, som eneste tall å tune.
- **Kritisk krav — [baseline]:** dette FLYTTER gjærtall. `k` må kalibreres slik
  at standardoppsettene (napoletana 24/48/72 t ved 22 °C og 3 °C skap) lander på
  dagens verdier, ellers endres oppskriften til alle eksisterende brukere. Samme
  disiplin som F13, der referansesonen 2–4 °C ble satt til 1,0× nettopp for at
  standardvalget ikke skulle endre noe. Forvent at avvik gjenstår i utkantene —
  det er poenget med å bytte modell, men det bør være et bevisst, dokumentert
  avvik per metode, ikke en overraskelse.
- **Test:** utvid `F20`-invariantene med en kurve-kontrakt (yDry synker monotont
  med lengre/varmere gjæring, aldri ≤ 0), og frys de kalibrerte referansepunktene
  slik `calibration_curves_unified_interpolator_identical_values` gjør i dag.
- Middels–stor. Forutsetter F17+F19 (levert). Kom ut av en konkurrentgjennomgang
  aug 2026 — se posisjoneringsnotatet: vi vinner på beslutningsstøtte, ikke kjemi.

---

### F16. Temperer-tipset (`TIP.benchTemper`) sier «form» etter kjøling — men forming skjer FØR ✅ FIKSET (v0.712)
- **I klartekst:** Tipset på «Ta ut av kjøleskap / temperer»-steget sier «gi dem mer
  tid **før du former**» og «**form og stek** uten å vente lenger». Men i alle
  metodene (standard/poolish/biga og Kveldsdeig) formes emnene til boller FØR
  kjøleskapet («Form emner → kjøleskap»). Etter temperering er neste steg «Strekk og
  stek» — du strekker/åpner emnet til pizza, du former det ikke på nytt. «Forme» er
  attpåtil navnet på det tidligere steget, så teksten leser som om forming skjer
  etter kjøling — motstridende med planens rekkefølge. Ser gjenbrukt fra en
  arbeidsflyt der man baller ETTER kald bulk (som ikke er appens flyt).
- **Fiks (skisse):** bytt «former/form» i `TIP.benchTemper` (`index.html:2068` NO,
  `2077` EN) mot strekke-/åpne-språk: f.eks. «gi dem mer tid før du strekker og
  steker» og «strekk og stek uten å vente lenger». Gjelder begge bruksstedene
  (`2262` standard-hale, `2622` Kveldsdeig) automatisk siden de deler `TIP.benchTemper`.
  Behold NO + EN, og «vanskelig å åpne»-formuleringen (den er allerede riktig).
- Funnet av Kveldsdeig-gjennomgang, aug 2026. Ikke [baseline] (tips-tekst, ingen frosne tall).

---

### F25. «Ledig tid av» med lengre varighet enn ut dagen (ferieuke) ✅ BYGGET (v0.740)
> ✅ **Bygget.** `pizzatidEndOfWeek()` + `setPizzatidOffWeek()` — samme motor,
> bare en annen utløpsdato, akkurat som skissen sa. Valget står som tre trinn i
> Pizzatid-panelet (`pizzatidOffControlHTML`): **På · Av ut dagen · Av ut uka**.
> `inPizzatidWindow`, `outsidePizzatid` og `scorePizzatidWindows` er urørt — de
> leser bare tidsstempelet, som forutsatt.
>
> **To valg verdt å notere.** (1) Merkelappen avledes nå av tidsstempelet
> (`pizzatidOffLabel`) i stedet for å bli satt sammen med knappen som ble trykket.
> Banneret hardkodet «til midnatt», som ville vært direkte feil for en ukespause —
> og en tekst som er utledet av den ekte verdien KAN ikke drifte fra den. Dette er
> samme grep som F17/F18/F21: én kilde i stedet for to som må holdes i takt.
> (2) Lenka på konfliktkortet er bevisst UENDRET — ett trykk, ut dagen. Der vil du
> bare videre; et valg med tre alternativer hører hjemme i panelet, ikke i det
> øyeblikket irritasjonen oppstår.
>
> **Søndag:** «ut uka» og «ut dagen» faller sammen, så knappen vises ikke. Samme
> logikk som v0.735 sitt «ut dagen = til midnatt, ikke 24 timer fram».
>
> Testet av `pizzatid_pause_can_last_the_week_and_says_so`: grensen over alle sju
> ukedager, begge sommertid-overgangene, at merkelappen følger tidsstempelet, og
> at semantikken er uendret (ukespausen frigjør de samme timene og rører fortsatt
> ikke natten). Mutasjonstestet.
- **Bakgrunn:** v0.735 leverte pausen med én varighet — ut dagen, til midnatt.
  Det opprinnelige ønsket var bredere: «fri hele dagen f.eks. pga feriedag eller
  den uka du er i», med automatisk retur til opptatt etter en uke. Vi valgte
  bevisst den minste versjonen først fordi den treffer det vanligste tilfellet
  («jeg er hjemme i dag likevel») med ett flagg og null backend.
- **Fiks (skisse):** samme motor, bare en annen utløpsdato. Bytt lenka mot tre
  trinn i Pizzatid-panelet — «På / Av ut dagen / Av ut uka» — der «ut uka» setter
  `pizzatidOffUntil` til midnatt førstkommende søndag. Ingenting i `inPizzatidWindow`,
  `outsidePizzatid` eller banneret trenger å endres; de leser bare tidsstempelet.
- **Vurdert og forkastet (aug 2026):** en datomodell (`freeDates`-liste lagret på
  server ved siden av `schedule`, med per-dag-maskering av ukesmalen). Den er
  mektigere — den takler «ferie om tre uker» og enkeltdager spredt utover — men
  krever endring i `netlify/functions/pizzatid.js` (`sanitizeSchedule` stripper alt
  ukjent), synkronisering mellom enheter, og opprydding av passerte datoer. Et
  tidsstempel gir det samme for de realistiske tilfellene til en brøkdel av prisen.
  Ta opp igjen kun hvis noen faktisk vil planlegge en ferie på forhånd.
- **Merk ved bygging:** jo lengre pausen varer, jo viktigere blir merkelappen.
  «Av ut uka» som er glemt bort er en uke med anbefalinger som ikke tar hensyn til
  timeplanen i det hele tatt — og rangeringen i Smart-plan endres, ikke bare
  varslene (`scorePizzatidWindows` faller bort som vekt, så lengst gjæring vinner).
- Liten. Ingen [baseline]-risiko (rører ingen gjærtall).

---

### F26. Formesteget regnes ved kjøleskapstemperatur selv om deigen står på benken
- **I klartekst:** Steget «Form emner → kjøleskap» (`tailSteps`, `index.html`) har
  `loc:'kjol'`. I disse 15 minuttene deler, veier og runder du emnene PÅ BENKEN —
  kjøleskapet er først der på slutten. `stepTempC()` i `engine.js` leser `loc` og
  regner derfor minuttene ved kjøleskapstemperatur (3 °C) i stedet for
  romtemperatur, slik at Q10-belastningen blir 0,199 timer for lav.
- **Status (v0.738):** merkelappen er rettet med `dispLoc:'benk'`, så visningen
  stemmer. Selve temperaturen står fortsatt feil — bevisst.
- **Hvorfor ikke fikset:** utslaget er −0,7 % til −2,0 % på gjærmengden
  (24 t: 1,13 → 1,11 g · 48 t: 0,75 → 0,74 g · 72 t: uendret 0,56 g · 120 t:
  0,38 → 0,37 g). Det er under det en kjøkkenvekt oppløser, men det bryter
  **[baseline]**-ankeret fra F23, som med vilje låser at 24 t gir 1,13 og 72 t
  gir 0,56 — eksakt som før Q10-modellen ble innført. Målt: ingen verdi av
  `Q10_K` kan holde begge ankerpunktene etter rettingen (holder du 24 t eksakt
  med K=15,15, blir 72 t 0,57; holder du 72 t med K=15,0, blir 24 t 1,12).
  Rune valgte aug 2026 å rette merkelappen alene og parkere fysikken.
- **Fiks når den tas:** bytt `loc:'kjol'` → `loc:'benk'` og fjern `dispLoc`
  (benk er da riktig på begge akser). Oppdater `q10_model_calibrated_for_standard_others_unchanged`
  (`calibrated`-sjekken), `standard_napoletana` i `baseline_results.json` og de
  frosne oppskriftsradene for standard.
- **Ta den sammen med F24** (Q10 for poolish/biga). Den åpner kalibreringen
  uansett, og da er det billigere å flytte begge ankerpunktene én gang enn to.
- Liten i kode, men **[baseline]**. Funnet i ekstern gjennomgang av en generert
  Langtidsdeig-plan, aug 2026.

### F27. Lag 1: maskinelt testbare invarianter over hele matrisen ✅ BYGGET (v0.739)
> ✅ **Bygget.** Tre invarianter i `test_regression.py` som sveiper metode × type ×
> ovnstype (60 konfigurasjoner) fra én felles `MATRIX_SWEEP`:
> (a) `invariant_step_amounts_sum_to_recipe_all_configs` — summen av det stegene
> ber deg måle opp er lik `recipeFor()` for hver ingrediens;
> (b) `invariant_no_vague_amounts_for_recipe_ingredients` — ingen mengdeord uten
> tall for en ingrediens som finnes i oppskriften (to bevisste unntak i
> `VAGUE_OK`: boksesmøring og gjærens honning, begge utenfor oppskriften);
> (c) `invariant_schedule_allows_the_preheat_it_demands` — tidsplanen setter av
> minst `preheatMin()` før steking.
> **Fant to reelle feil ved første kjøring**, begge fikset i samme versjon: sukkeret
> forsvant fra Poolish og Biga (NY-stil i vanlig ovn), og Mania + Kveldsdeig manglet
> forvarmingssteget helt. Alle tre er mutasjonstestet — gjeninnføres feilen, blir de røde.
- **I klartekst:** de fire funnene fra den manuelle gjennomgangen (v0.736–v0.738)
  tilhørte hver sin *klasse* av motsigelse. Tre av de fire klassene kan sjekkes med
  kode i stedet for med øyne. Denne testen gjør det, for alle konfigurasjoner samtidig.
- **Verdt å merke:** massebalansen alene ville IKKE ha funnet v0.736-vannfeilen —
  der sto hele vannmengden i steg 1 og steg 2 ba vagt om «vannet», så summen var
  korrekt. Det er vaghetslinten som fanger den klassen. Vaghet er ikke bare upresist
  språk; det er stedet en motsigelse kan gjemme seg, fordi et vagt tall ikke kan
  motsi et annet tall.
- **Gjenstår:** den fjerde klassen — semantiske motsigelser der ingen tall er gale
  («gjæren løses i vannet på forhånd» mot en tidsplan som sier noe annet). Den kan
  ikke regnes på. Se F28.

### F28. Lag 3: språkmodell-gjennomgang av hele matrisen ✅ BYGGET (`review_plans.py`)
> ✅ **Bygget.** `review_plans.py` — et frittstående skript, bevisst **utenfor**
> `test_regression.py`. Henter planteksten for hver konfigurasjon via `copyP()`
> (så gjennomgangen ser nøyaktig det brukeren limer inn), og kjører to trinn:
> **(1) gjennomgang** — én modell leter etter interne motsigelser, med krav om
> ordrett sitat fra begge sidene; **(2) verifisering** — en uavhengig skeptiker
> forsøker å *motbevise* hvert funn, og de som faller havner i en egen bolk
> nederst i rapporten i stedet for å bli presentert som ekte.
> Rapporten er markdown, sortert etter alvorlighet.
> ```
> python3 review_plans.py                      # hele matrisen, med verifisering
> python3 review_plans.py --grense 3           # rask prøvekjøring
> python3 review_plans.py --uten-verifisering  # halv kostnad, mer støy
> python3 review_plans.py --tørrkjøring        # ingen API-kall, viser prompten
> ```
> Krever `ANTHROPIC_API_KEY` (eller `ant auth login`) og `pip install anthropic`.
> Hele matrisen med verifisering koster typisk noen få dollar.
- **I klartekst:** `copyP()` sendte allerede med en sjekk-instruksjon, så halve
  jobben fantes. Det som manglet var å kjøre den systematisk over alle metoder ×
  typer × ovnstyper i stedet for den ene planen brukeren tilfeldigvis kopierte.
- **Hvorfor verifiseringsleddet er obligatorisk, ikke pynt:** en språkmodell som
  bes finne motsigelser vil finne dem, også der det ikke er noen. Uten skeptikeren
  drukner de reelle funnene i plausible påstander — og et verktøy som rapporterer
  støy blir slått av etter andre kjøring. Kravet om ordrett sitat fra begge sidene
  gjør dessuten at et menneske kan avvise et falskt funn på ti sekunder.
- **Ikke i testrunden, med vilje:** ikke-deterministisk, så to kjøringer på samme
  kode kan gi ulike funn. Den kan derfor ikke blokkere en commit, og skriptet
  returnerer alltid exit 0 — et funn er ikke en feil før et menneske har sett på det.
- Fanger klassen F27 ikke kan nå: påstander om rekkefølge, årsak og teknikk som
  motsier hverandre uten at et eneste tall er feil.
- **Testdekning:** alt utenom selve API-svaret er dekket av stubbtester —
  planuttrekk, rensing, feilhåndtering (avslag, avkortning, ugyldig JSON),
  rapportinndeling og forespørselsformatet mot SDK-et. Selve modellsvaret er
  per natur ikke testbart.
- **Kjent blindsone (funnet ved en manuell gjennomgang aug 2026).** Skriptet leser
  planen ALENE. En motsigelse som bare finnes mellom planen og *koden* ser den
  derfor ikke: en plan kan si «Napoletansk pizza» og «336g per emne» uten at det
  er selvmotsigende i teksten — det blir det først når du vet at appen selv
  definerer et napoletansk emne som 270g. Nøyaktig den feilen ble funnet manuelt
  og fikset i v0.742, og gjennomgangen ville ikke tatt den, fordi systemprompten
  med vilje avviser funn som bygger på bransjenorm. Tekstfunnene fra samme
  gjennomgang (identiske nabotips, windowpane midt i hevingen) er derimot midt i
  blinken for den.
- **Mulig utvidelse:** send med målverdiene fra koden (`targetBallWeight()`,
  `preheatMin()` o.l.) som en «fasit»-blokk i prompten, så kan den sammenligne
  planen mot spesifikasjonen og ikke bare mot seg selv.

### F29. Lag 2: `uses:{vann:305}` per steg — gjør klassen strukturelt umulig
- **I klartekst:** i dag er mengdene skrevet inn i prosaen, og `needs`-lista er en
  parallell håndskrevet oppsummering av den. F27 tester at de to stemmer; F29 ville
  gjort det umulig at de ikke gjør det, ved å la hvert steg deklarere `uses:{vann:305}`
  og generere både prosa og `needs` fra samme felt.
- Samme grep som F17 (`recipeFor`), F18 (`CALIBRATION`) og F21 (`METHODS`): hver av
  dem fjernet en hel klasse motsigelser i stedet for å teste seg til dem.
- Største jobben av de tre lagene — alle stegtekstene må røres. Ta den neste gang
  stegtekstene uansett skal åpnes. **[baseline]** (rendringslaget flytter seg).

### F30. Ordliste — appen bruker fagord den aldri forklarer
- **I klartekst:** stegtekstene lener seg tungt på bakespråk, og ingen av ordene
  er definert noe sted i appen. Den som aldri har bakt før leser «rund godt med
  begge hender» og «bygger overflatespenning» uten å ha noen mulighet til å
  vite hva det betyr.
- **Målt over hele matrisen** (metode × type, ~148 000 tegn stegtekst), og
  sjekket mot `guide.js`:

  | Ord | I stegtekstene | Forklart i guiden |
  |---|---:|---:|
  | emne / emnene | **275×** | nevnt 2×, aldri definert |
  | gluten / glutenstruktur | **106×** | 0 |
  | poolish | 72× | ✅ som metode |
  | fermenter(e) | 48× | 0 |
  | oven spring | **30×** | 0 |
  | biga | 24× | ✅ som metode |
  | autolyse | **20×** | 0 |
  | etterheving | 14× | 0 |
  | overflatespenning | 12× | 0 |
  | runding / rundet | 24× | 0 |
  | temperering / benketid | 20× | 0 |
  | leopardmønster | 10× | 0 |
  | bulk(heving) | 4× | 0 |
  | extensibel | 4× | 0 |

- **«Emne» er det viktigste.** 275 treff, og det er selve enheten hele appen
  regner i — emnevekt, antall emner, «del i 3 emner». Uten den er resten av
  planen vanskelig å følge.
- **To ord som er verre enn bare uforklarte:**
  - **«oven spring»** er engelsk midt i norsk tekst, og står uoversatt 30 ganger.
  - **«dekket»** betyr to helt ulike ting i samme app: «dekk bollen med lokk»
    (tildekket) og «dekket er varmt lenge før det er gjennomvarmt» (stekedekket i
    pizzaovnen). Samme ord, to betydninger, ingen av dem forklart.
  - **«extensibel»** er et lånord som ikke finnes i norsk til vanlig — «lett å
    strekke» står allerede i parentes noen steder, men ikke alle.
- **To trinn, ulik pris:**
  1. **En ordlisteside under Tips og teknikk.** Billig, ingen stegtekster røres,
     og den kan skrives ferdig i én omgang. Løser «jeg lurer på hva dette
     betyr» — men ikke i øyeblikket man lurer.
  2. **Trykkbare ord i stegteksten.** Det som faktisk hjelper, siden spørsmålet
     dukker opp mens man står og leser. Men det krever at hver stegtekst merkes,
     altså at alle strengene røres.
- **Ta trinn 2 sammen med F29.** F29 skal uansett åpne samtlige stegtekster for å
  innføre `uses:{}` — å merke fagord i samme runde koster nesten ingenting ekstra,
  mens to separate runder gjennom de samme strengene koster dobbelt.
- **Test:** en invariant kan holde lista ærlig — hvert ord i ordlista må faktisk
  forekomme i minst én stegtekst (ingen døde oppslag), og en liste over kjente
  fagord må ikke dukke opp i stegtekstene uten å stå i ordlista. Da kan ikke
  ordlista råtne fra hverandre når tekstene endres. Samme mønster som invariant
  D (ingenting bor bare i understegene).

#### Forarbeid gjort i v0.775: «emne» er nå det ENESTE ordet
Spurt om appen brukte andre ord enn «emne». Målt over all norsk stegtekst:

| Ord | Før | Etter | Hva det var |
|---|---:|---:|---|
| emne | 75 | **87** | standarden |
| bolle | 30 | 28 | *blandebolla* — riktig, skal stå |
| kule | 6 | **0** | i «Hvorfor» hos Langtidsdeig/Poolish/Biga |
| ball | 4 | **0** | bare Mania |

Verst var Mania: **«lag en stram, rund bolle. Legg i bakebolle»** — samme ord om
deigen og om kara den legges i, fire ord fra hverandre, i en metode som ellers
sier «Hell poolish i bollen». Steget het «Form til bolle → romtemperatur».
Engelsken var konsekvent hele veien («ball»); det var bare norsken som spriket.

Dette er forarbeid, ikke F30 selv: en ordliste som forklarer «emne» mens
tekstene sier «ball», «kule» og «bolle» hjelper ingen. Nå finnes det ett ord å
slå opp.

**Invariant H** (`invariant_dough_ball_has_one_norwegian_name`) holder det slik.
Den interessante delen er «bolle»: ordet kunne ikke bannlyses, for det ER
redskapet 28 steder. Regelen er derfor at «bolle» aldri får stå som objekt for
et formingsverb. En regel som bare forbød ordet ville tvunget fram feil fiks —
å døpe om blandebolla.

Samme runde: `MATRIX_SWEEP` pinner nå `_lang='no'`. Det gjorde den ikke før, så
alle de norske invariantene (B, D, F, G, H) arvet språket fra forrige test og
var rekkefølge-avhengige.

### F31. Smart-plan hopper 482 px opp hver gang du huker av en metode ✅ FIKSET (v0.771)

> ✅ **Bygget i v0.771.** `betaOppdaterResultat()` kjører `runBetaSearch(true)` og
> gir resultatblokka et kort blink. `toggleBetaMethod()` og `toggleFavMethod()`
> kaller den i stedet for `runBetaSearch()`.
>
> Testen (`smartplan_filter_change_keeps_your_place_and_still_recomputes`) tar
> begge halvdelene, og det viste seg å være helt nødvendig: mutasjonen som
> gjorde `betaOppdaterResultat()` til en tom funksjon **består**
> posisjonssjekken alene. Stillhet holder rullingen perfekt i ro.
>
> Én felle til, funnet ved mutasjonstesting: `scrollIntoView` er
> `behavior:'smooth'`, altså animert. Første utgave av testen leste posisjonen
> etter to `requestAnimationFrame` og bestod selv med fiksen reversert —
> rullingen hadde ikke rukket å begynne. Med 900 ms venting måles hoppet til
> 803 px i testoppsettet.
- **Meldt inn:** «inne på Smart-plan og metoder du blir tilbudt så hopper den til
  toppen ved hver endring».
- **Reprodusert og målt** (390×844, dato satt, søk kjørt, metodelista åpen):

  | | y-posisjon i fanen |
  |---|---:|
  | Resultatblokka | 644 |
  | Metodefilteret | 1555 |
  | Rulleposisjon før avhaking | 1113 |
  | **Rulleposisjon etter** | **631** |
  | **Hopp** | **482 px opp** |

- **Mekanismen er ikke en gjenoppbygging.** Ingenting nullstiller rullingen —
  det er en BEVISST `scrollIntoView` som drar deg vekk. `runBetaSearch()`
  avslutter med `resultEl.scrollIntoView({block:'center'})`, og resultatblokka
  ligger *over* metodelista. Du står nede ved filteret, huker av, søket kjøres på
  nytt, og resultatet sentreres — altså rulles du opp. Det oppleves som «til
  toppen» fordi filteret er det nederste på siden.
- **Rullingen er riktig for det FØRSTE søket** — du trykker «Søk» og vil se
  svaret. Den er feil for et søk som kjøres på nytt fordi du endret et filter:
  da ser du allerede på filteret, og resultatet oppdateres bak deg.
- **Fiksen finnes allerede halvveis.** `runBetaSearch(noScroll)` tar parameteren,
  og `pizzatidOffChanged()` sender `true` av nøyaktig denne grunnen (linje ~3618).
  De to metodebryterne — `toggleBetaMethod()` og `toggleFavMethod()` — kaller den
  uten. Det er samme klasse, oppdaget og løst ett sted, glemt to.
- **Men ikke bare send `true` og gå videre.** Da oppdateres resultatet helt utenfor
  syne, og du vet ikke om avhakingen gjorde noen forskjell. Det er den samme
  lærdommen som «litt større» i vinkestyringen: stillhet er dårlig
  tilbakemelding. Enten
  1. behold posisjonen og gi resultatblokka et kort «oppdatert»-blink, eller
  2. behold posisjonen og vis endringen i filterraden («Poolish av — 2 forslag
     igjen»).
- **Test når den bygges:** rulleposisjonen skal være uendret etter at et
  metodefilter endres, og resultatet skal likevel være regnet på nytt. Begge
  halvdelene må med — bare den første ville blitt bestått av å fjerne søket
  helt.
- Se etter samme mønster i andre `scrollIntoView`-kall som utløses av en
  innstillingsendring i stedet for av et bevisst «vis meg»-trykk.

### F32. Bilder til stegene — motivliste, kobling til steg, og de fire som må tas på nytt

- **I klartekst:** stegtekstene beskriver vurderinger som er vanskelige å sette
  ord på — «bobler aktivt», «fjærer sakte halvveis tilbake», «vokst 30–50 %».
  Det er der et bilde gjør jobben bedre enn en setning. Første serie er laget
  (Poolish, 8 bilder, KI-generert) og mappet mot planen.

#### Hvor stor er jobben egentlig
Målt over metode × ovnstype × kjøkkenmaskin (6 × 2 × 3):

| | Antall |
|---|---:|
| Distinkte stegtitler | **38** |
| Distinkte tittel × tekstvariant | **51** |

Merk: en tidligere telling ga 29 titler. Den varierte ikke kjøkkenmaskin, og
maskinvalget lager egne titler («Lag poolish i Ankarsrum-bollen» / «…i en bolle»
/ «…i kjøkkenmaskin-bolle»). 38 er tallet å planlegge etter.

#### Gjenbruken er svært ujevn — prioriter etter den
| Steg | Metoder | Tekstvarianter | Kommentar |
|---|---:|---:|---|
| Kjøleskapsheving | 3 | **1** | ett bilde dekker alt |
| Ta ut av kjøleskap | 3 | **1** | ett bilde dekker alt |
| Form emner → kjøleskap | 4 | 2 | nest best |
| Sett på ovnen 🔥 | 5 | 2 | pizzaovn / vanlig ovn |
| Strekk og stek 🔥 | **6** | 4 | mest brukte steg i appen |
| Romtemperaturheving | 3 | 3 | |
| Blandestegene | 1–2 | 3 maskiner hver | dyrest, gjelder færrest |

**Rekkefølge:** kjøleskapsheving + ta ut (ferdig for tre metoder på to bilder) →
form emner → vanlig-ovn-versjon av de to ovnsstegene → blandestegene sist.

#### Serie 1: Poolish, 8 bilder — status
Filene er ikke i repoet ennå; de ligger i chatten og må legges i en `bilder/`-mappe.

| # | Steg | Motiv | Dom |
|---|---|---|---|
| 1 | Lag poolish i Ankarsrum-bollen | boblete poolish, hånd med slikkepott | ❌ skyt om |
| 2 | Ankarsrum — bland ferdig deig | shaggy deig med mel i maskinbolle | ✅ |
| 3 | Romtemperaturheving | hevet deig i klar boks | ❌ skyt om |
| 4 | Form emner → kjøleskap | tre emner på benk, hånd i oljet boks | ✅ |
| 5 | Kjøleskapsheving | stablede bokser i kjøleskap | ⚠️ juster |
| 6 | Ta ut av kjøleskap | tre bokser på benken med kondens | ✅ |
| 7 | Sett på ovnen 🔥 | Ooni + IR-termometer «425» | ⚠️ juster |
| 8 | Strekk og stek 🔥 | pizza i Ooni med leopardmønster | ✅ |

**De fire som må rettes, med årsak fra stegteksten:**
1. **Bilde 1** viser to øyeblikk som ikke kan skje samtidig: boblene er 14 timer
   gamle, hånda med slikkepotten er minutt én. Steget sier «rør til **glatt**».
   Rører du i en ferdig hevet poolish, slår du ut boblene. Skyt den enten glatt
   og blek (handlingen) eller boblete uten hånd (tipsets «klar når overflaten
   bobler aktivt»).
2. **Bilde 3 er den farligste.** Tipset sier «regn med ca. 30–50 % … **ikke vent
   på at den dobler seg**», og hevingen varer **60 min**. Bildet viser en full
   bulkheving. Brukt som fasit lærer det bort overgjæring — stikk motsatt av
   det teksten advarer mot.
3. **Bilde 5:** tipset sier «bakerst og nederst, over grønnsakskuffen». Bildet
   viser boksene fremst på en midthylle, stablet tre i høyden — stablingen
   isolerer, og hele gjærberegningen bygger på kjøleskapstemperaturen.
   Antallet drifter også: bilde 4 viser 3 emner (riktig for 500 g mel), bilde 5
   ser ut til å vise 6. Appen skriver «Del i **3** emner» rett over.
4. **Bilde 7:** termometeret viser **425 °C**, teksten sier **430–450 °C**.
   Komposisjonen er ellers perfekt — steg 7 sitt tips ber deg bokstavelig talt
   sikte IR-termometeret på steinen. Be om 440.

#### Nøkkelen er ikke stegtittelen
«Sett på ovnen 🔥» og «Strekk og stek 🔥» heter **det samme** for pizzaovn og
vanlig ovn — bare teksten under skiller. Kobler man bilder på tittel, får den
som steker på 250 °C i stekeovnen se en vedfyrt Ooni. Nøkkelen må være
**metode + kjøkkenmaskin + ovnstype**, samme tre akser som lager de 51
variantene.

Naturlig hjem: `METHODS`-registeret (F21) eller samme sted som `uses:{}` i F29 —
begge åpner uansett samtlige stegdefinisjoner. Å legge bildenøkler på i samme
runde koster lite; to runder gjennom de samme strengene koster dobbelt.

- **Test når den bygges:** samme mønster som invariant D og F30 sin ordliste-test.
  1. Ingen døde bilder — hver bildenøkkel må treffe et steg som faktisk finnes i
     minst én konfigurasjon.
  2. Ingen bilde vist utenfor sin egen kombinasjon — et Ooni-bilde skal aldri
     rendres når `S.oven==='vanlig'`. Denne er den viktigste; den fanger nettopp
     tittelkollisjonen over.
  3. Mutasjonssjekk: fjern ovnsaksen fra nøkkelen, og test 2 må feile. Ellers
     tester den ingenting.
- **Åpent spørsmål:** KI-genererte bilder av mat viser gjerne tilstander som
  ikke finnes (bilde 1 og 3 her). Ett foto av en ekte bakst slår ti genererte
  på de stegene der bildet skal være en fasit å måle mot.
