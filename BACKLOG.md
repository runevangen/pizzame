# Backlog — UltimatePizza

Sist oppdatert: 29.07.2026 · gjelder index.html rundt v6.20.

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
