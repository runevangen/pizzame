// Endringslogg for Pizzaplanlegger — flyttet ut fra index.html (v5.61) for å redusere
// filstørrelsen på hovedfilen. Rent datainnhold, ingen logikk. Lastes via <script src>
// FØR hovedscriptet i index.html, slik at CHANGELOG er tilgjengelig når resten kjører.
const CHANGELOG = [
  {
    "v": "0.729",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Langtidsdeigen regner nå gjærmengden med én fysisk lov i stedet for tre sammenganget tabeller: gjæringsraten halveres for hver 10°C temperaturen faller (Q10). Appen summerer hvor mye gjæring hvert steg i din faktiske tidsplan bidrar med — kjøleskapet, romhevingen og benketida — og fordeler gjæren etter det. Tallene er kalibrert mot de uttestede punktene: 24 og 72 timer gir nøyaktig samme gjærmengde som før, 48 timer 0,04 g mindre, altså mindre enn en kjøkkenvekt kan vise.",
      "Kjøleskapstemperaturen (lagt til i forrige uke) virker nå gjennom den samme fysikken i stedet for en anslått kurve. Utslaget ble mildere enn anslaget: et kaldt skap på 0–2°C gir nå ca. 11% mer gjær, ikke 30%.",
      "Poolish, Biga, Hurtigdeig, Kveldsdeig og Mania er bevisst uendret og beholder sine egne kurver. For Poolish ville den nye modellen halvert gjærmengden — muligens riktig, men en så stor endring skal bakes og smakes før den slippes, ikke bare regnes ut."
    ],
    "changes_en": [
      "Long-ferment dough now computes yeast from a single physical law instead of three multiplied tables: the fermentation rate halves for every 10°C drop in temperature (Q10). The app sums how much fermentation each step in your actual schedule contributes — the fridge, the room rise and the bench rest — and sets the yeast from that. The numbers are calibrated against the tested reference points: 24 and 72 hours give exactly the same yeast as before, 48 hours 0.04 g less, which is below what a kitchen scale can show.",
      "The fridge temperature (added last week) now works through the same physics instead of an estimated curve. The effect turned out gentler than the estimate: a cold 0–2°C fridge now gives about 11% more yeast, not 30%.",
      "Poolish, biga, quick dough, evening dough and Mania are deliberately unchanged and keep their own curves. For poolish the new model would have halved the yeast — possibly correct, but a change that large should be baked and tasted before it ships, not just calculated."
    ]
  },
  {
    "v": "0.728",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Sivilisert oppstart i Fra–til. Fyller man vinduet bakfra, havner det beste alternativet ofte midt på natta — nettopp fordi det er det lengste (kan du starte 23:30 og vil steke 18:00, krever full gjæring oppstart 01:30). Slike forslag er nå merket «🌙 midt på natten», og de får en straff i rangeringen så et alternativ med menneskelig oppstart vinner når det ikke er stort dårligere.",
      "Nytt: når selv det beste alternativet starter om natta, tilbyr appen «Start heller kl. …» — samme metode og samme gjæringstid, men du starter når du faktisk sa du var ledig. Til gjengjeld er pizzaen klar litt før ønsket steketid, og appen sier tydelig når (f.eks. «Klar 16:30 i stedet for 18:00»). Steketiden i planen flyttes tilsvarende, så alt henger sammen.",
      "Rettet at «Bruk denne» kunne overskrive steketiden du selv hadde satt: den kjørte en full oppfriskning av innstillingene, som nullstiller steketid-feltet til en standardverdi. Planen du landet på gjaldt da et annet tidspunkt enn det du ba om. Nå oppdateres kun de kontrollene valget faktisk endrer."
    ],
    "changes_en": [
      "Civilized start times in From–to. When the window is filled from the end, the best option often lands in the middle of the night — precisely because it's the longest (if you can start at 23:30 and want to bake at 18:00, full fermentation demands a 01:30 start). Such suggestions are now marked “🌙 middle of the night”, and they take a penalty in the ranking so an option with a human start time wins when it isn't much worse.",
      "New: when even the best option starts at night, the app offers “Start at … instead” — same method and same fermentation time, but you start when you actually said you were free. In exchange the pizza is ready a little before your target bake time, and the app says clearly when (e.g. “Ready 16:30 instead of 18:00”). The bake time in the plan moves accordingly, so everything stays consistent.",
      "Fixed “Use this” potentially overwriting the bake time you had set: it ran a full settings refresh, which resets the bake-time field to a default value. The plan you landed on then applied to a different time than the one you asked for. Now only the controls the choice actually changes are updated."
    ]
  },
  {
    "v": "0.727",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Bruk denne» i Fra–til tar deg nå rett til Tidsplan-fanen, slik «Bruk denne» i Smart-plan alltid har gjort — før ble valget lagret uten at du så resultatet. Tidspunktene du fylte inn beholdes, så du kan gå tilbake og ombestemme deg uten å skrive dem på nytt.",
      "Endret overskriften i Fra–til fra «mest gjæring som får plass» til «mest fermenteringstid» — kortere og mer presist."
    ],
    "changes_en": [
      "“Use this” in From–to now takes you straight to the Schedule tab, the way “Use this” in Smart-plan always has — previously the choice was applied without showing you the result. The times you entered are kept, so you can go back and change your mind without retyping them.",
      "Changed the From–to heading from “most fermentation that fits” to “most fermentation time” — shorter and more precise."
    ]
  },
  {
    "v": "0.726",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet to feil i den nye «Fra–til»-modusen som gjorde at forslagene kunne regne mot feil steketid. Endret du steketiden, oppdaterte ikke forslagslista seg — den ble stående mot den forrige tiden, så vinduet kunne vise f.eks. «47 timer» der feltene sa 23, og oppstarten lå et døgn feil. I tillegg flyttet appen steketiden automatisk et døgn fram når du gikk inn i Fra–til, fordi den sjekket om tiden var mulig for metoden som tilfeldigvis var valgt — men i Fra–til er det jo appen som skal finne metoden, og grensen er når du kan starte. Nå står steketiden du oppgir, og passer ingen av metodene, sier lista det ærlig.",
      "Ryddet i forslagskortene: overskriften brøt over to linjer for Langtidsdeig («42 t kaldheving»). Tiden står nå kort i overskriften, og hva slags gjæring det er, står i linja under."
    ],
    "changes_en": [
      "Fixed two bugs in the new “From–to” mode that could make the suggestions compute against the wrong bake time. If you changed the bake time, the suggestion list didn't refresh — it stayed on the previous time, so the window could read e.g. “47 hours” where the fields said 23, and the start time was a day off. On top of that the app automatically pushed the bake time a day forward when you entered From–to, because it checked whether the time was feasible for whichever method happened to be selected — but in From–to it's the app that picks the method, and the bound is when you can start. Now the bake time you enter stays put, and if nothing fits, the list says so honestly.",
      "Tidied the suggestion cards: the heading wrapped onto two lines for long-ferment dough (“42 h cold proof”). The duration is now short in the heading, with the kind of fermentation on the line below."
    ]
  },
  {
    "v": "0.725",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny «Fra–til»-modus: oppgi når du tidligst kan starte og når du vil steke, så finner appen metoden og gjæringstiden som gir MEST smak innenfor det vinduet. Eksempel: starter du kl. 20 i kveld og vil steke kl. 18 i morgen (22 timer), foreslår den Kveldsdeig med 18 timer kaldheving — den fyller 20 av 22 timer, mens Hurtigdeig ville kastet bort nesten 6 timer og Langtidsdeig ikke får plass i det hele tatt.",
      "Alle alternativene vises med hvor mye av vinduet de bruker, når du da må starte, og hva de heter på appens egen smaksskala («Lang kveld», «Utmerket», «Full smak»). Metoder som ikke får plass sier ærlig hvor mye tid de mangler. Ingenting endres automatisk — du trykker «Bruk denne» selv.",
      "Steketiden er den harde betingelsen: pizzaen blir ferdig når du faktisk vil spise, ikke et par timer for tidlig. Oppstarten er kun en nedre grense, så et forslag starter aldri før du er tilgjengelig. Førsteutgaven dekker Hurtigdeig, Kveldsdeig og Langtidsdeig — Poolish og Biga har lengre, sammensatte vinduer og kommer eventuelt senere."
    ],
    "changes_en": [
      "New “From–to” mode: enter when you can start at the earliest and when you want to bake, and the app finds the method and fermentation time that gives the MOST flavor within that window. Example: start at 8pm tonight and bake at 6pm tomorrow (22 hours) and it suggests evening dough with an 18-hour cold proof — it fills 20 of the 22 hours, while quick dough would waste nearly 6 hours and long-ferment dough doesn't fit at all.",
      "Every option shows how much of the window it uses, when you'd then have to start, and what it's called on the app's own flavor scale (“Long evening”, “Excellent”, “Full flavor”). Methods that don't fit say honestly how much time they're short. Nothing changes automatically — you tap “Use this” yourself.",
      "The bake time is the hard constraint: the pizza is ready when you actually want to eat, not a couple of hours early. The start time is only a lower bound, so a suggestion never starts before you're available. The first release covers quick, evening and long-ferment dough — poolish and biga have longer, compound windows and may follow later."
    ]
  },
  {
    "v": "0.724",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "New York-pizza: sukkeret droppes nå automatisk når du har valgt pizzaovn. Sukkeret er der for å gi skorpa farge i vanlig ovn (6–9 min steketid) — i pizzaovn på 400°C+ rekker det bare å brenne seg før skorpa er ferdig. Med vanlig ovn får du 1,5% sukker som før. (Klassisk NY-råd: «skip sugar if baking with open flame» — appen vet jo allerede hvilken ovn du har.)"
    ],
    "changes_en": [
      "New York pizza: the sugar is now dropped automatically when you've selected a pizza oven. The sugar is there to color the crust in a regular oven (6–9 min bake) — in a pizza oven at 400°C+ it only manages to burn before the crust is done. With a regular oven you get 1.5% sugar as before. (Classic NY advice: “skip sugar if baking with open flame” — the app already knows which oven you have.)"
    ]
  },
  {
    "v": "0.723",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at appen kunne krasje ved oppstart etter forrige oppdatering. Offline-mekanismen (service workeren) hentet alltid fersk hovedside, men serverte motorfila (engine.js, ny i v0.719) fra en gammel lokal kopi — den ferske siden kalte da funksjoner som ikke fantes i den gamle fila. Nå behandles alle kodefiler likt (fersk kopi vinner alltid når du er på nett), gamle mellomlagre ryddes automatisk, og allerede rammede brukere repareres ved første innlasting. En ny automatisk sjekk hindrer at feilen kan gjeninnføres for fremtidige filer."
    ],
    "changes_en": [
      "Fixed the app potentially crashing at startup after the previous update. The offline mechanism (service worker) always fetched a fresh main page but served the engine file (engine.js, new in v0.719) from an old local copy — the fresh page then called functions that didn't exist in the old file. All code files are now treated the same (a fresh copy always wins when online), old caches are cleaned up automatically, and already-affected users are repaired on first load. A new automatic check prevents the bug from being reintroduced for future files."
    ]
  },
  {
    "v": "0.722",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt valg i Finjuster: kjøleskapstemperatur (0–2 / 2–4 / 4–6 / 6–8°C). Appen kompenserer gjærmengden automatisk — et kaldere kjøleskap bremser gjæringen, så du får litt mer gjær for samme resultat til samme tid (ca. +30% ved 0–2°C); et varmere skap eller dørhylle gir litt mindre. Standardvalget 2–4°C er et riktig innstilt kjøleskap (Mattilsynet: 0–4°C) og endrer ingen tall. Gjelder Langtidsdeig, Poolish, Biga og Kveldsdeig; Mania-poolish er en fast, publisert oppskrift og justeres ikke. Usikker på temperaturen? Mål med termometer — 1–5-skalaene er ikke like mellom merker."
    ],
    "changes_en": [
      "New choice in Fine-tune: fridge temperature (0–2 / 2–4 / 4–6 / 6–8°C). The app compensates the yeast amount automatically — a colder fridge slows fermentation, so you get slightly more yeast for the same result at the same time (about +30% at 0–2°C); a warmer fridge or door shelf gives slightly less. The default 2–4°C is a correctly set fridge and changes no numbers. Applies to long-ferment, poolish, biga and evening dough; Mania poolish is a fixed published recipe and is not adjusted. Unsure of the temperature? Measure with a thermometer — the 1–5 dials differ between brands."
    ]
  },
  {
    "v": "0.721",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Blandestegene for Langtidsdeig, Poolish og Biga anbefaler nå en konkret vanntemperatur i °C — regnet ut fra romtemperaturen din og kjøkkenmaskinens friksjonsvarme, slik Hurtigdeig allerede gjorde. Et kaldt kjøkken om vinteren og et varmt om sommeren treffer dermed samme måltemperatur på ferdig deig (ca. 23°C). Eksempel ved 22°C rom: ca. 17°C vann med Ankarsrum, ca. 9°C med vanlig kjøkkenmaskin (som tilfører mer friksjonsvarme). «Ingen elting» beholder den enkle teksten — der blandes det med skje og starttemperaturen betyr lite."
    ],
    "changes_en": [
      "The mixing steps for long-ferment, poolish and biga now recommend a concrete water temperature in °C — computed from your room temperature and your mixer's friction heat, as the quick dough already did. A cold kitchen in winter and a warm one in summer thus hit the same target dough temperature (about 23°C). Example at a 22°C room: about 17°C water with the Ankarsrum, about 9°C with a regular stand mixer (which adds more friction heat). No-knead keeps its simple wording — it's mixed with a spoon, and the starting temperature matters little there."
    ]
  },
  {
    "v": "0.720",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Benketida etter kjøleskapet («Ta ut av kjøleskap»-steget) tilpasser seg nå romtemperaturen din, slik steg-teksten hele tiden har sagt at den burde: ved 22°C er den 4 timer som før, ved 18°C får deigen lengre tid på å bli strekkbar (ca. 6,4 t), ved 26°C kortere (ca. 2,6 t). Steketiden og middagen flyttes ikke — det er bare fordelingen mellom kald tid og benketid som justeres, og kald tid går aldri under 1 time. Gjelder Langtidsdeig, Poolish og Biga (Kveldsdeig har sin egen, kortere temperering som skalerer med kjøletiden). Poolish/biga-forspillet er bevisst upåvirket — det er et valg du selv har satt."
    ],
    "changes_en": [
      "The bench time after the fridge (the “Take out of the fridge” step) now adapts to your room temperature, as the step text always said it should: at 22°C it stays 4 hours as before, at 18°C the dough gets longer to become stretchable (about 6.4h), at 26°C shorter (about 2.6h). The bake time and dinner don't move — only the split between cold time and bench time adjusts, and cold time never drops below 1 hour. Applies to long-ferment, poolish and biga (evening dough has its own shorter temper that scales with the chill hours). The poolish/biga preferment is deliberately unaffected — that's a number you chose yourself."
    ]
  },
  {
    "v": "0.719",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: selve beregningsmotoren (oppskrifts-sannheten, kalibreringskurvene, metode-registeret og gjæringstid-utregningene) er skilt ut i en egen fil, engine.js — samme mønster som endringsloggen og guiden. Ingen synlige endringer; all oppførsel er verifisert identisk. Dette fullfører motor-robusthetsarbeidet (seks trinn siden v0.714): én ingredienskilde, én interpolator, én planleggingsretning, ett metoderegister, invariant-tester som vokter det hele — og nå en ren, avgrenset motorfil."
    ],
    "changes_en": [
      "Under the hood: the calculation engine itself (the recipe truth, calibration curves, method registry and fermentation-time derivations) has been split into its own file, engine.js — same pattern as the changelog and guide. No visible changes; all behavior verified identical. This completes the engine robustness work (six steps since v0.714): one ingredient source, one interpolator, one scheduling direction, one method registry, invariant tests guarding it all — and now a clean, bounded engine file."
    ]
  },
  {
    "v": "0.718",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at PC-visningen viste den justerbare «Kjøleskapsheving»-slideren for Mania-poolish — metoden har fast struktur, og mobilvisningen skjulte den allerede riktig. Årsaken var at metode-egenskaper lå spredt i flere hardkodede lister som var kommet i utakt; alle metodenavn og -egenskaper leses nå fra ett felles register (også Smart-plan-lista og Deiger-filteret), så en slik utakt ikke kan oppstå igjen."
    ],
    "changes_en": [
      "Fixed the desktop view showing the adjustable “Cold proof” slider for Mania poolish — the method has a fixed structure, and the mobile view already hid it correctly. The cause was method properties living in several hardcoded lists that had drifted apart; all method names and properties are now read from one shared registry (including the Smart-plan list and the Doughs filter), so that kind of drift can no longer happen."
    ]
  },
  {
    "v": "0.717",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: tidsplan-motoren regner nå alltid i én retning. «Planlagt steketid»-modus trekker bare totaltiden fra steketiden og bygger så planen fremover — tidligere fantes det to håndskrevne kjeder per metode (én fremover, én baklengs) som måtte holdes i takt manuelt. Mania-poolish sine fasevarigheter ligger nå i én konstantblokk som både tidsplanen og gjæringsvarslene leser, så de to kan aldri mer vise ulike totaltider. Alle tidspunkter er verifisert identiske med før."
    ],
    "changes_en": [
      "Under the hood: the schedule engine now always computes in one direction. \"Planned bake time\" mode simply subtracts the total time from the bake time and then builds the plan forward — previously each method had two hand-written chains (one forward, one backward) that had to be kept in sync manually. Mania poolish's phase durations now live in one constant block read by both the schedule and the fermentation warnings, so the two can never again show different totals. All timestamps verified identical to before."
    ]
  },
  {
    "v": "0.716",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: alle gjærings- og gjærkurvene (temperaturfaktor, kaldhevings-multiplikator, poolish/biga-forspillskurver) er samlet i én kalibreringsblokk, tolket av én felles interpolator — tre funksjoner hadde hver sin kopi av samme utregning. Tallene er bevist bit-identiske med før (ny test fryser kurveverdiene mellom ankerpunktene). Åpner for at kurvene senere kan versjoneres eller redigeres på ett sted."
    ],
    "changes_en": [
      "Under the hood: all fermentation and yeast curves (temperature factor, cold-proof multiplier, poolish/biga preferment curves) are gathered in one calibration block, interpreted by one shared interpolator — three functions each had their own copy of the same computation. The numbers are proven bit-identical to before (a new test freezes curve values between the anchor points). Paves the way for versioning or editing the curves in one place later."
    ]
  },
  {
    "v": "0.715",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Alle ingredienstall (mel, vann, salt, gjær, hydrering) hentes nå fra én felles kilde uansett metode og visning — tidsplan, oppskriftsfane, kopier-oppskrift og kalender kan ikke lenger vise ulike tall for samme deig. Dette retter samtidig to feil: PC-visningens oppskriftsfane viste generelle tall for Mania-poolish (325g vann/14g salt/65%) i stedet for Manias egne (320g/15g/64%), og «Ingen elting»-typen kunne vise feil oppskriftsfane hvis Mania sto valgt som metode.",
      "Mania-poolish på PC: «Kjøleskapsheving»-raden viste den justerbare kjøletiden fra andre metoder — Mania har fast struktur (10t udelt + 10t i emner). Raden sier nå det."
    ],
    "changes_en": [
      "All ingredient numbers (flour, water, salt, yeast, hydration) are now read from one shared source regardless of method and view — the schedule, recipe tab, copy-recipe and calendar can no longer show different numbers for the same dough. This also fixes two bugs: the desktop recipe tab showed generic numbers for Mania poolish (325g water/14g salt/65%) instead of Mania's own (320g/15g/64%), and the no-knead type could show the wrong recipe tab if Mania happened to be the selected method.",
      "Mania poolish on desktop: the “Cold proof” row showed the adjustable cold time from other methods — Mania has a fixed structure (10h undivided + 10h in balls). The row now says so."
    ]
  },
  {
    "v": "0.714",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: nye automatiske konsistenssjekker som vokter selve beregningsmotoren. For hver metode sjekkes det nå at en plan regnet fremover fra oppstart og en plan regnet baklengs fra steketiden gir nøyaktig samme tidsplan, at stegene alltid kommer i riktig tidsrekkefølge, og at Mania-oppskriftens vanndeler alltid summerer til riktig hydrering uansett melmengde. Ingen synlige endringer — dette er sikkerhetsnett for videre utvikling."
    ],
    "changes_en": [
      "Under the hood: new automatic consistency checks guarding the calculation engine itself. For every method, we now verify that a plan computed forward from the start and one computed backward from the bake time produce exactly the same schedule, that steps always come in chronological order, and that the Mania recipe's water parts always sum to the correct hydration regardless of flour amount. No visible changes — this is a safety net for further development."
    ]
  },
  {
    "v": "0.713",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mania-poolish: rettet at «Kopier oppskrift» viste andre ingrediensmengder enn selve tidsplanen. Kopien brukte den generelle oppskriften (325g vann, 14g salt, 1,13g gjær, 65% hydrering), mens stegene bruker Manias egen oppskrift (320g vann, 15g salt, 0,85g gjær, 64% hydrering). Kopien viser nå samme tall som stegene og Oppskrift-fanen.",
      "Mania-poolish: slo sammen to nedkjølingssteg som lå på samme tidspunkt og motsa hverandre om minstetiden («minimum 1 time» vs. «minst 2 timer»). Nå ett tydelig steg: kjøl poolishen i minst 2 timer (fleksibelt opp til 3–4 timer).",
      "Mania-poolish: ryddet i blande-steget for hoveddeigen, som brukte «resten av vannet» om to ulike mengder. Nå entydig: tilsett del 2 av vannet i dråper, hold igjen siste skvett til saltet.",
      "Mania-poolish: kjøleskapstipset for den udelte deigen sa «emnene skal vokse» — men deigen er ikke delt i emner ennå på det stadiet. Sier nå «deigen». Poolish-gjæringen er også presisert til 18–21°C (samme som blande-steget), og starter etter blandingen i stedet for på samme klokkeslett."
    ],
    "changes_en": [
      "Mania poolish: fixed “Copy recipe” showing different ingredient amounts than the schedule itself. The copy used the general recipe (325g water, 14g salt, 1.13g yeast, 65% hydration), while the steps use Mania's own recipe (320g water, 15g salt, 0.85g yeast, 64% hydration). The copy now shows the same numbers as the steps and the Recipe tab.",
      "Mania poolish: merged two cooling steps that sat at the same time and contradicted each other on the minimum time (“minimum 1 hour” vs. “at least 2 hours”). Now one clear step: cool the poolish for at least 2 hours (flexible up to 3–4 hours).",
      "Mania poolish: cleaned up the main-dough mixing step, which used “the rest of the water” for two different amounts. Now unambiguous: add water part 2 in drops, hold back the last splash for the salt.",
      "Mania poolish: the fridge tip for the undivided dough said “the balls should grow” — but the dough isn't divided into balls yet at that stage. It now says “the dough”. The poolish fermentation is also specified as 18–21°C (matching the mixing step), and now starts after mixing instead of at the same clock time."
    ]
  },
  {
    "v": "0.712",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en forvirrende formulering i temperer-tipset (steget «Ta ut av kjøleskap»). Det sa «gi dem mer tid før du former» og «form og stek uten å vente lenger» — men emnene er allerede formet til boller før kjøleskapet. Etter temperering strekker/åpner du bare emnet og steker; du former det ikke på nytt. Teksten sier nå «før du strekker og steker» / «strekk og stek uten å vente lenger». Gjelder alle metoder som kjølehever (standard/poolish/biga og Kveldsdeig)."
    ],
    "changes_en": [
      "Fixed a confusing phrasing in the bench-rest tip (the “Take out of the fridge” step). It said “give them more time before you shape” and “shape and bake without waiting longer” — but the balls are already shaped before the fridge. After tempering you only stretch/open the ball and bake; you don't re-shape it. The text now says “before you stretch and bake” / “stretch and bake without waiting longer”. Applies to all cold-proofed methods (standard/poolish/biga and Evening dough)."
    ]
  },
  {
    "v": "0.711",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en intern selvmotsigelse i standarddeigens steg 2 (Ankarsrum): selve instruksjonen og understegene sier at saltet skal i etter ca. 3 minutter elting, men «Hvorfor»-teksten sa «etter ca. 5 min». Harmonisert til ~3 minutter, så alle tre er enige."
    ],
    "changes_en": [
      "Fixed an internal contradiction in the standard dough's step 2 (Ankarsrum): the instruction and the sub-steps say the salt goes in after about 3 minutes of kneading, but the “Why” text said “after about 5 min”. Harmonized to ~3 minutes, so all three agree."
    ]
  },
  {
    "v": "0.710",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Finn oppskriften»-knappen i Smart-plan lyser nå opp så snart du endrer ETT av feltene — enten klokkeslettet eller datoen. Før krevde den at du tok begge (klokke, så dato) i rekkefølge, så endret du bare datoen forble knappen dempet og virket inaktiv. Og ✓-haka som dukket opp på feltene er fjernet — den forvirret mer enn den hjalp."
    ],
    "changes_en": [
      "The “Find the recipe” button in Smart plan now lights up as soon as you change EITHER field — the time or the date. Previously it required you to touch both (time, then date) in sequence, so changing only the date left the button dimmed and looking inactive. And the ✓ checkmark that appeared on the fields has been removed — it confused more than it helped."
    ]
  },
  {
    "v": "0.709",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre norsk på Smart-plan-merket: «kort håndgrep» er byttet til «raskt gjort» — mindre stivt, og tydeligere at konfliktsteget (som å ta ut av kjøleskap) er unnagjort på et øyeblikk. Samme ordbytte i forklaringslinja under alternativene."
    ],
    "changes_en": [
      "Better wording on the Smart plan badge: “quick handling” is now “quickly done” — less stiff, and clearer that the conflict step (like taking it out of the fridge) is over in a moment. Same wording change in the explanatory line under the alternatives."
    ]
  },
  {
    "v": "0.708",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "To rettelser på Smart-plan-valgene. (1) Det står nå tydelig at alternativenes «når»-boks ER en konflikt — en «⚠ Utenfor ledig tid»-etikett (eller «Midt på natten») over tidspunktet, så du slipper å gjette hvorfor steget er trukket fram. (2) Fikset at gjæringstiden kunne flyte ut av kortet: «mer smak» er flyttet ned på egen linje, så tallet (~43t) holder seg kort ved siden av lange metodenavn som wrapper over flere linjer."
    ],
    "changes_en": [
      "Two fixes for the Smart plan options. (1) It now says clearly that the alternatives' “when” box IS a conflict — a “⚠ Outside free time” label (or “Middle of the night”) above the time, so you don't have to guess why the step is highlighted. (2) Fixed the fermentation time overflowing the card: “more flavor” has moved to its own line, so the figure (~43h) stays short next to long method names that wrap across several lines."
    ]
  },
  {
    "v": "0.707",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-valgene er nå tydeligere å velge mellom. Hvert forslag — både det anbefalte og alternativene — er et eget kort med sin egen «Bruk denne»-knapp (fylt for det anbefalte, omriss for alternativene), så det er åpenbart at du kan velge et alternativ. Og konflikt-tidspunktet er løftet fram: det står nå stort og først på en egen «når»-linje (f.eks. «fre 14:00»), med steget og arbeidsmengden ved siden av — for det er nettopp klokkeslettet som avgjør om du rekker det håndgrepet."
    ],
    "changes_en": [
      "The Smart plan options are now clearer to choose between. Each suggestion — both the recommended one and the alternatives — is its own card with its own “Use this one” button (filled for the recommended, outlined for the alternatives), so it's obvious you can pick an alternative. And the conflict time is brought to the front: it now sits large and first on its own “when” line (e.g. “Fri 14:00”), with the step and effort beside it — because it's exactly the time that decides whether you can manage that handling."
    ]
  },
  {
    "v": "0.706",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Justerte layouten på Smart-plan-sammenligningen: konflikten står nå på en egen linje UNDER metoden og gjæringstiden, ikke som en trang sidekolonne. Metodenavn som «Poolish (romtemp + 18t kjøleskapspause)» wrapper over flere linjer, og da ble konflikt-kolonnen klemt. Nå får hver rad metode + gjæring øverst, og konflikt-detaljen (steg · tid · arbeidsmengde) i full bredde under — mye lettere å lese."
    ],
    "changes_en": [
      "Adjusted the layout of the Smart plan comparison: the conflict now sits on its own line BELOW the method and fermentation time, not as a cramped side column. Method names like “Poolish (room temp + 18h cold pause)” wrap across several lines, which squeezed the conflict column. Now each row has method + fermentation on top, and the conflict detail (step · time · effort) at full width underneath — much easier to read."
    ]
  },
  {
    "v": "0.705",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-resultatet viser nå en liten sammenligningstabell: det anbefalte forslaget øverst, pluss inntil to alternativer — med gjæringstid (mer smak) og hva konflikten deres faktisk er. For hvert alternativ ser du HVILKET steg som kolliderer, NÅR, og HVOR MYE arbeid det er: et grønt «kort håndgrep»-merke betyr et passivt/kjapt håndgrep (som å ta bollen ut av kjøleskapet — noe du fint kan gjøre hjemmefra), mens et oransje merke betyr ekte hands-on-arbeid (elte, forme). Da kan du selv velge et lengre, mer smaksrikt alternativ når du ser at «ulempen» bare er et minutts arbeid. Trykk raden for å bruke den. Vinneren rangeres fortsatt på færrest konflikter — tabellen bare synliggjør avveiningen så valget er ditt."
    ],
    "changes_en": [
      "The Smart plan result now shows a small comparison table: the recommended option at the top, plus up to two alternatives — with fermentation time (more flavor) and what their conflict actually is. For each alternative you see WHICH step conflicts, WHEN, and HOW MUCH work it is: a green “quick handling” badge means a passive/quick touch (like taking the bowl out of the fridge — something you can easily do from home), while an orange badge means real hands-on work (kneading, shaping). That lets you choose a longer, more flavorful option yourself when you can see the “downside” is just a minute of work. Tap a row to use it. The winner is still ranked by fewest conflicts — the table just surfaces the trade-off so the choice is yours."
    ]
  },
  {
    "v": "0.704",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Kopier oppskrift»-teksten ber nå AI-en også sjekke for interne inkonsistenser — tekst eller tall som motsier hverandre (samme tid, temperatur eller mengde oppgitt ulikt to steder, eller to steg med motstridende råd). Det er nettopp den typen feil de siste gjennomgangene faktisk fant. Samtidig er det lagt inn et vern mot støy: AI-en bes vurdere mot det som faktisk står i oppskriften og det du selv har oppgitt — ikke mot generelle bransjenormer eller antatt praksis (som er der de svakeste, mest villedende funnene pleide å komme fra)."
    ],
    "changes_en": [
      "The “Copy recipe” text now also asks the AI to check for internal inconsistencies — text or numbers that contradict each other (the same time, temperature or amount stated differently in two places, or two steps giving conflicting advice). That's exactly the kind of error the recent reviews actually found. At the same time it adds a guard against noise: the AI is asked to judge against what's actually written in the recipe and what you specified yourself — not against general industry norms or assumed practice (which is where the weakest, most misleading findings tended to come from)."
    ]
  },
  {
    "v": "0.703",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Ignorer» rett i Tidsplanen. Får et steg ⚠-merket «utenfor ledig tid» (eller «midt på natten»), sitter det nå en liten «Ignorer»-knapp rett på merket — så du kan skjule varselet der du faktisk ser det. Før bodde den knappen bare inne i wizardens «Sjekk», som Smart-planen aldri sender deg innom (den lander på Tidsplan), så hvis du kom den veien var det i praksis ingen måte å avvise varselet på. «Ignorer» her og «fortsett likevel» i Sjekk deler nå samme tilstand — ignorerer du ett sted, er det ignorert begge steder."
    ],
    "changes_en": [
      "“Ignore” right in the schedule. When a step gets the ⚠ “outside free time” (or “middle of the night”) mark, there's now a small “Ignore” button right on the mark — so you can hide the warning where you actually see it. Before, that button lived only inside the wizard's “Check”, which Smart plan never routes you through (it lands on the schedule), so if you came that way there was effectively no way to dismiss it. “Ignore” here and “continue anyway” in Check now share the same state — ignore it in one place and it's ignored in both."
    ]
  },
  {
    "v": "0.702",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kjøleskapspausen teller nå med i «ledig tid». Steget er passivt (deigen bare venter), men STARTEN krever at du er hjemme og setter poolish-bollen i kjøleskapet — og det tok ikke Smart-planen hensyn til før, så den kunne legge det midt på en travel formiddag uten å si ifra. Nå behandles det som et steg du må være til stede for: Smart-planen prøver å legge det i den ledige tida di, og faller det likevel utenfor (eller midt på natten), får du samme varsel som for andre steg — med en «Dette er greit — fortsett likevel»-knapp, i tilfelle du fint kan stikke innom og sette bollen i kjøleskapet den dagen likevel. Vanlige passive steg (gjæring, kjøleskapsheving) teller fortsatt ikke."
    ],
    "changes_en": [
      "The cold pause now counts toward your “free time”. The step is passive (the dough just waits), but its START requires you to be home to put the poolish bowl in the fridge — and Smart plan didn't account for that before, so it could place it in the middle of a busy morning without flagging it. It's now treated as a step you need to be present for: Smart plan tries to fit it into your free time, and if it still falls outside (or in the middle of the night) you get the same warning as for other steps — with a “This is fine — continue anyway” button, in case you can pop home to put the bowl in the fridge that day after all. Ordinary passive steps (fermenting, cold rise) still don't count."
    ]
  },
  {
    "v": "0.701",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en liten selvmotsigelse i kjøleskapspause-steget: «Hvorfor»-teksten sa både at en moden poolish «tåler noen timer kaldt» og at pausen er «maks 18 timer» — men 18 timer er ikke «noen timer». Teksten er nå konsistent: i kjøleskapet nærmest pauses gjæringen, så poolishen holder seg godt en god stund, med 18 timer som øvre grense."
    ],
    "changes_en": [
      "Fixed a small contradiction in the cold-pause step: the “Why” text said both that a mature poolish “tolerates a few hours cold” and that the pause is “up to 18 hours” — but 18 hours isn't “a few hours”. The text is now consistent: in the fridge the fermentation is all but paused, so the poolish keeps well for a good while, with 18 hours as the upper limit."
    ]
  },
  {
    "v": "0.700",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet en liten uklarhet i poolish-blandesteget: steget er satt av ~20 minutter, men teksten sier «elt totalt 10–12 min», så planens tidsavsetning og eltetiden kunne virke motstridende. La til en presisering om at de ~20 minuttene er samlet arbeidstid — tilsetting av mel og salt, elting og temperaturmåling — mens selve eltingen er den kortere tiden. Den faktiske eltetiden står fortsatt. (En større idé fra samme gjennomgang — å oppgi en anbefalt vanntemperatur i °C i blandestegene, slik hurtigdeig allerede gjør — er lagt i backloggen.)"
    ],
    "changes_en": [
      "Cleared up a small ambiguity in the poolish mixing step: the step is allotted ~20 minutes, but the text says “knead 10–12 min total”, so the plan's time allocation and the kneading time could look contradictory. Added a note that the ~20 minutes is total working time — adding flour and salt, kneading and measuring temperature — while the kneading itself is the shorter time. The actual kneading time is still shown. (A larger idea from the same review — showing a recommended water temperature in °C in the mixing steps, the way the quick dough already does — has been added to the backlog.)"
    ]
  },
  {
    "v": "0.699",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre kjøleskapsråd: hvor du setter deigen betyr mer enn tallet på hjulet. Et kjøleskap er sonedelt — kaldeste sone er bakerst og nederst, over grønnsakskuffen (ca. 2–4 °C), mens døra er varmest (5–7 °C) og svinger hver gang du åpner. Tipset ber deg nå sette deigboksene i den kaldeste sonen og unngå døra, så hevingen blir jevn. «Hvorfor»-tekstene om kald fermentering er samtidig strammet til 2–4 °C (der deigen faktisk står), i stedet for et bredere kjøleskaps-snitt."
    ],
    "changes_en": [
      "Better fridge advice: where you put the dough matters more than the number on the dial. A fridge is zoned — the coldest zone is at the back and bottom, above the vegetable drawer (about 2–4 °C), while the door is the warmest (5–7 °C) and swings every time you open it. The tip now tells you to place the dough boxes in the coldest zone and avoid the door, so the rise stays even. The “Why” texts about cold fermentation are tightened to 2–4 °C (where the dough actually sits) rather than a broader fridge average."
    ]
  },
  {
    "v": "0.698",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Trakk tilbake gjærtipset fra forrige versjon. Rådet om å øke gjæren ~25–30 % «hvis kjøleskapet er kaldere enn ~4 °C» bygde på feil premiss for et norsk publikum: 1–3 °C er et riktig innstilt kjøleskap (Mattilsynet anbefaler 0–4 °C), ikke et for kaldt et — så teksten ville fått folk med korrekt temperatur til å legge til gjær de ikke trenger. Fjernet gjærprosenten fra den delte teksten; det gode rådet «mål med termometer» er beholdt, nå med riktig referanse (under 4 °C). Kjøleskapstemperaturen er også harmonisert til 0–4 °C i «Hvorfor»-tekstene (var 2–5 °C). Selve temperatur-kompensasjonen hører hjemme som et faktisk inndata-valg i Finjuster og er lagt i backloggen (F13), sammen med at benketida (steg 7) bør skalere med romtemperatur slik den korte hevingen allerede gjør (F14)."
    ],
    "changes_en": [
      "Rolled back the yeast tip from the previous version. The advice to raise the yeast ~25–30% “if your fridge runs colder than ~4 °C” rested on a wrong premise for a Norwegian audience: 1–3 °C is a correctly set fridge (food-safety guidance is 0–4 °C), not too cold — so the text would have told people with correct temperatures to add yeast they don't need. Removed the yeast percentage from the shared text; the good advice “measure with a thermometer” is kept, now with the right reference (below 4 °C). The fridge temperature is also harmonized to 0–4 °C in the “Why” texts (was 2–5 °C). The actual temperature compensation belongs as a real input in Fine-tune and has been added to the backlog (F13), together with the bench time (step 7) that should scale with room temperature the way the short rise already does (F14)."
    ]
  },
  {
    "v": "0.697",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet fire funn fra en grundig oppskriftsgjennomgang. (1) Forme-steget og kald-heving-steget hadde ordrett samme «Hvorfor»-tekst om kald fermentering — forme-steget har nå sin egen begrunnelse om runding og emner. (2) Stekesteget sa «pizzastein/-stål MÅ varmes minst 45 min» også for pizzaovn, der dekket er varmt på ~15–20 min; teksten er nå ovnstype-bevisst (vanlig ovn beholder 45 min). (3) Kjøleskapstemperaturen var oppgitt tre ulike steder (2–8 / 4 / 2–5 °C) — nå harmonisert til 2–5 °C, og steg-teksten «ca. 4 timer» er i tråd med «Hvorfor». (4) Poolish-gjæren er trukket litt ned for lange forspill (15–16 t), som ellers kunne toppe og falle før du blander; standard 14 t er uendret. I tillegg: et nytt tips om å øke gjæren ~25–30 % hvis kjøleskapet ditt er kaldere enn ~4 °C, og et mer realistisk hevekriterium på den korte romtemperaturhevingen (ca. 30–50 %, ikke «dobbelt»)."
    ],
    "changes_en": [
      "Fixed four findings from a thorough recipe review. (1) The shaping step and the cold-rise step had word-for-word the same “Why” text about cold fermentation — the shaping step now has its own rationale about rounding and balls. (2) The bake step said “the pizza stone/steel MUST preheat at least 45 min” even for a pizza oven, where the deck is hot in ~15–20 min; the text is now oven-aware (a regular oven keeps 45 min). (3) The fridge temperature was stated three different ways (2–8 / 4 / 2–5 °C) — now harmonized to 2–5 °C, and the step text “about 4 hours” matches the “Why”. (4) The poolish yeast is nudged down a little for long preferments (15–16 h), which could otherwise peak and collapse before you mix; the standard 14 h is unchanged. Plus: a new tip to raise the yeast ~25–30% if your fridge runs colder than ~4 °C, and a more realistic rise cue for the short room-temperature rise (about 30–50%, not “doubled”)."
    ]
  },
  {
    "v": "0.696",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fikset feil ventetekst for poolish/biga. Ventebanneret etter «Lag poolish» (og «Lag biga») sa «La stå i kjøleskap» når planen hadde en kjøleskapspause etterpå — men forspillet gjærer jo på benken ved romtemperatur. Nå står det riktig «🫧 Poolish gjærer i romtemperatur» (og tilsvarende for biga), med tiden i timer i stedet for avrundet til «1 dag». Velger du kjøleskaps-poolish, står det «❄️ Poolish modnes kaldt»."
    ],
    "changes_en": [
      "Fixed the wrong wait text for poolish/biga. The wait banner after “Make poolish” (and “Make biga”) said “Rest in the fridge” when the plan had a fridge pause afterwards — but the preferment actually ferments on the counter at room temperature. It now correctly reads “🫧 Poolish ferments at room temperature” (and likewise for biga), with the time in hours instead of rounded to “1 day”. If you choose a cold poolish, it reads “❄️ Poolish matures cold”."
    ]
  },
  {
    "v": "0.695",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ikonraden (🧾 / 📋 / 💡) på hvert steg hoppet opp og ned når du åpnet eller lukket understeg. Årsaken var at raden lå under prosateksten, som forsvinner når understeg tar over. Nå er ikonraden forankret rett under steg-tittelen, og alt du åpner (ingredienser, tekst/understeg, tips) utvider seg nedenfor — så ikonene holder seg i ro uansett hva du velger."
    ],
    "changes_en": [
      "The icon row (🧾 / 📋 / 💡) on each step jumped up and down when you opened or closed sub-steps. The cause was that the row sat below the prose text, which disappears when sub-steps take over. The icon row is now anchored right under the step title, and everything you open (ingredients, text/sub-steps, tips) expands below it — so the icons stay put no matter what you choose."
    ]
  },
  {
    "v": "0.694",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fikset at tidspunktet på hvert steg i tidsplanen brakk rart midt i datoen (f.eks. «man 3. aug kl.» på én linje og «15:10 · 30 min» på neste). Tiden holdes nå samlet på én linje. Får den og stedet ikke plass sammen, flyttes stedet ned i stedet for å splitte selve datoen."
    ],
    "changes_en": [
      "Fixed the timestamp on each schedule step breaking oddly in the middle of the date (e.g. “Mon Aug 3,” on one line and “15:10 · 30 min” on the next). The time is now kept together on one line. If it and the location don't fit together, the location moves down instead of splitting the date itself."
    ]
  },
  {
    "v": "0.693",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Understeg erstatter nå prosateksten i stedet for å komme i tillegg. Avsnittsteksten og understegene på et steg er i praksis samme innhold — samme oppskrift, én gang som paragraf og én gang som punktliste. Før viste vi begge når du åpnet 📋, så du leste det samme to ganger. Nå viker prosateksten for sjekklista når du åpner understeg (akkurat som Fokus-modus allerede gjør), og kommer tilbake når du lukker. Steg uten understeg beholder teksten som før. Ett format per steg, ingen dobbeltlesing."
    ],
    "changes_en": [
      "Sub-steps now replace the prose text instead of appearing in addition to it. A step's paragraph and its sub-steps are essentially the same content — the same recipe, once as a paragraph and once as a checklist. Previously we showed both when you opened 📋, so you read the same thing twice. Now the prose gives way to the checklist when you open sub-steps (just like Focus mode already does), and comes back when you close them. Steps without sub-steps keep their text as before. One format per step, no double reading."
    ]
  },
  {
    "v": "0.692",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fokus-modus viser mer av planen. Den enorme overskriften er krympet fra 32px til 21px, og i stedet for bare «Neste: …» får du nå en liten «Kommer»-stabel med de neste stegene (tid + tittel) rett under det aktive steget — trykk på et av dem for å hoppe dit. Slik ser du hva som venter uten å forlate fokus, og de store Ferdig-/Forrige-knappene og avhukingsflatene er uendret (laget for deigete fingre)."
    ],
    "changes_en": [
      "Focus mode shows more of the plan. The huge heading is shrunk from 32px to 21px, and instead of just “Next: …” you now get a small “Coming up” stack of the next steps (time + title) right below the active step — tap one to jump there. That way you see what's ahead without leaving focus, and the large Done/Back buttons and check-off targets are unchanged (built for doughy fingers)."
    ]
  },
  {
    "v": "0.691",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Selve stegteksten er tilbake på hvert kort. I forrige runde havnet også «hva du gjør»-teksten bak et ikon — nå står den alltid synlig øverst på steget igjen. Ingrediensene er samtidig blitt et rent 🧾-ikon på lik linje med understeg (📋) og tips (💡), så detaljraden er ryddig og kompakt. Trykk på ikonet for å hente fram akkurat det du trenger."
    ],
    "changes_en": [
      "The step text itself is back on every card. In the last round the “what you do” text also ended up behind an icon — now it's always visible at the top of the step again. Ingredients have at the same time become a plain 🧾 icon, on par with sub-steps (📋) and tips (💡), so the detail row stays tidy and compact. Tap an icon to bring up exactly what you need."
    ]
  },
  {
    "v": "0.690",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Renere stegkort i tidsplanen (skisse B \u2014 \u00abp\u00e5 foresp\u00f8rsel\u00bb). Hvert kort viser n\u00e5 bare selve handlingen (tittel, tid, sted). Ingrediensene ligger bak en \u00ab\ud83e\uddfe N ingredienser\u00bb-brikke, og fremgangsm\u00e5te (\ud83d\udccb) og tips (\ud83d\udca1) er rene ikoner \u2014 tapp for \u00e5 hente fram akkurat det du trenger. Det gj\u00f8r planen mye mer kompakt; ingrediens-boksene tok f\u00f8r mye plass p\u00e5 hvert steg. Fokus og \u00abn\u00e5\u00bb-uthevingen er uendret."
    ],
    "changes_en": [
      "Cleaner step cards in the schedule (sketch B \u2014 \u201con demand\u201d). Each card now shows just the action itself (title, time, place). Ingredients sit behind a \u201c\ud83e\uddfe N ingredients\u201d chip, and the how-to (\ud83d\udccb) and tips (\ud83d\udca1) are plain icons \u2014 tap to bring up exactly what you need. This makes the plan far more compact; the ingredient boxes used to take a lot of space on every step. Focus and the \u201cnow\u201d highlight are unchanged."
    ]
  },
  {
    "v": "0.689",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Flyttet «Kopier / Kalender / Lagre» fra toppen av tidsplanen ned til bunnen (under «Med denne planen»). De brukes sjelden og er handlinger du gj\u00f8r ETTER at planen er lest \u2014 s\u00e5 de tar ikke lenger toppplass fra selve stegene. Ikke sticky, bare nederst. \u00ab\ud83d\udd0e Fokus\u00bb blir v\u00e6rende \u00f8verst."
    ],
    "changes_en": [
      "Moved \"Copy / Calendar / Save\" from the top of the schedule down to the bottom (under \"With this plan\"). They are rarely used and are actions you take AFTER reading the plan \u2014 so they no longer take prime space above the steps. Not sticky, just at the bottom. \"\ud83d\udd0e Focus\" stays at the top."
    ]
  },
  {
    "v": "0.688",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Understeg og Tips er flyttet fra to globale brytere til sm\u00e5 ikoner PER STEG \u2014 kun p\u00e5 steg som faktisk har innhold. F\u00f8r sl\u00e5r \u00e9n bryter detaljene p\u00e5 for ALLE steg samtidig (en vegg av tekst); n\u00e5 er alt sammensl\u00e5tt som standard (en ryddig plan), og du \u00e5pner understeg eller tips der du trenger dem med \u00ab\ud83d\udccb Understeg\u00bb / \u00ab\ud83d\udca1 Tips\u00bb p\u00e5 det enkelte steget. Fokus er uendret (egen modus)."
    ],
    "changes_en": [
      "Substeps and Tips have moved from two global toggles to small PER-STEP icons \u2014 only on steps that actually have content. Before, one toggle turned the details on for ALL steps at once (a wall of text); now everything is collapsed by default (a tidy plan), and you open substeps or tips where you need them via \u201c\ud83d\udccb Substeps\u201d / \u201c\ud83d\udca1 Tips\u201d on the individual step. Focus is unchanged (its own mode)."
    ]
  },
  {
    "v": "0.687",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «Ulagret oppsett — endringer lagres ikke automatisk»-varselet øverst i tidsplanen. Det var unødvendig støy. «Du redigerer <deig>» vises fortsatt når du faktisk har åpnet en lagret deig."
    ],
    "changes_en": [
      "Removed the \"Unsaved setup — changes are not saved automatically\" notice at the top of the schedule. It was needless noise. \"You are editing <dough>\" still shows when you have actually opened a saved dough."
    ]
  },
  {
    "v": "0.686",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «👉 Neste»-stripa med nedtelling øverst i tidsplanen. Den duplikerte det lista allerede viser, brukte et annet «neste»-begrep enn selve stegene (den pekte forbi steget du står på), og konkurrerte med «nå»-uthevingen og Fokus-modus om oppmerksomheten. Tidsplanen er nå roligere: timelinen med sin egen nå-utheving for oversikt, og Fokus-modus for ett steg om gangen. Andre måter å varsle «neste» på kan komme senere."
    ],
    "changes_en": [
      "Removed the \"👉 Next\" strip with countdown at the top of the schedule. It duplicated what the list already shows, used a different notion of \"next\" than the steps themselves (it pointed past the step you're on), and competed with the \"now\" highlight and Focus mode for attention. The schedule is calmer now: the timeline with its own \"now\" highlight for the overview, and Focus mode for one step at a time. Other ways to signal \"next\" may come later."
    ]
  },
  {
    "v": "0.685",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Admin kan nå legge til, endre og slette meltyper direkte i appen (Admin → «🌾 Rediger meltyper»), uten en ny appversjon — fullfører eksternaliseringen fra forrige oppdatering. Hvert mel har navn, protein, W, hydrering og gjæringsvindu.",
      "Kald-hevings-taket følger nå sterkeste mel automatisk: legger admin inn et mel som tåler lengre gjæring, strekker kald-slideren seg tilsvarende (før var taket et fast tall). «Annet mel / ikke i listen» styres fortsatt av appen og kan ikke redigeres bort."
    ],
    "changes_en": [
      "Admin can now add, edit and delete flour types directly in the app (Admin → \"🌾 Edit flours\"), without a new app version — completing the externalization from the previous update. Each flour has name, protein, W, hydration and a fermentation window.",
      "The cold-proof cap now follows the strongest flour automatically: if admin adds a flour that tolerates a longer fermentation, the cold slider extends accordingly (previously the cap was a fixed number). \"Other / not listed\" is still controlled by the app and cannot be edited away."
    ]
  },
  {
    "v": "0.684",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Meltypene ligger nå på server (som kjernetallene bak «Formler»), så nye mel kan legges til og egenskaper endres uten en ny appversjon. Mel-nedtrekkene bygges nå fra dataene, med en innebygd standardliste som fallback hvis serveren ikke svarer — så appen virker likt offline. Dette er første del; selve admin-redigeringen av mel kommer i neste steg."
    ],
    "changes_en": [
      "The flour types now live on the server (like the core numbers behind \"Formulas\"), so new flours can be added and properties changed without a new app version. The flour dropdowns are now built from the data, with a built-in default list as a fallback if the server does not respond — so the app works the same offline. This is the first part; the admin editing of flours comes in the next step."
    ]
  },
  {
    "v": "0.683",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet feil merkelapp: et steg som havner utenfor den ledige tiden du har satt av til pizza sa «⚠ utenfor spisetid» — men du spiser jo ikke da, du jobber. Merket sier nå «⚠ utenfor ledig tid». Samtidig ble merket og hjelpeteksten oversatt (viste norsk i engelsk modus): «outside free time»."
    ],
    "changes_en": [
      "Fixed a wrong label: a step landing outside the free time you have set aside for pizza said \"⚠ outside eating time\" — but you are not eating then, you are working. The badge now says \"⚠ outside free time\". At the same time the badge and its tooltip were translated (they showed Norwegian in English mode)."
    ]
  },
  {
    "v": "0.682",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan slutter å over-tilby ekstremt lange gjæringer. Etter at kald-taket ble hevet til 120 timer (v0.680) foreslo den ofte ~115-timers deiger som bare Manitoba tåler, fordi «lengst = mest smak» avgjorde. Nå veies det inn hvor mange meltyper som faktisk støtter tiden: en 48-timers deig som 5 mel takler foreslås framfor en 115-timers bare ett mel takler. Innen samme dekning gjelder fortsatt lengst = mest smak, og de lange variantene ligger fremdeles under «Se flere alternativer»."
    ],
    "changes_en": [
      "Smart plan stops over-offering extremely long fermentations. After the cold cap was raised to 120 hours (v0.680) it often suggested ~115-hour doughs that only Manitoba can handle, because \"longest = most flavor\" decided. Now it factors in how many flour types actually support the time: a 48-hour dough that 5 flours handle is suggested over a 115-hour one only one flour handles. Within the same coverage, longest = most flavor still applies, and the long variants remain under \"See more options\"."
    ]
  },
  {
    "v": "0.681",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan lar deg nå styre hvilke metoder du blir tilbudt: under søket ligger en sammenleggbar «🎛️ Metoder du blir tilbudt» med avhuking for hver av de seks metodene (Langtidsdeig, Poolish, Biga, Mania, Hurtig, Kveld). Skrur du av en metode, foreslås den ikke lenger. Valget huskes, og et aktivt filter vises i overskriften («3 av 6»).",
      "Filteret gjelder kun forslagene i Smart-plan — den manuelle metodevelgeren er uberørt, så du kan alltid velge enhver metode selv. Skrur du av alle, viser Smart-plan alle likevel (aldri en tom skjerm) med en påminnelse om å skru på minst én."
    ],
    "changes_en": [
      "Smart plan now lets you control which methods you are offered: under the search there is a collapsible \"🎛️ Methods you are offered\" with a checkbox for each of the six methods (Long-ferment, Poolish, Biga, Mania, Quick, Evening). Turn a method off and it is no longer suggested. The choice is remembered, and an active filter is shown in the header (\"3 of 6\").",
      "The filter only affects the Smart-plan suggestions — the manual method picker is untouched, so you can always choose any method yourself. If you turn them all off, Smart plan shows all of them anyway (never an empty screen) with a reminder to turn at least one on."
    ]
  },
  {
    "v": "0.680",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kald-hevingen kan nå gå til 120 timer (5 døgn), opp fra 78. Sterke mel (Caputo Manitoba Oro, W340–390) tåler reelt lange kald-gjæringer, så taket var unødvendig lavt. Melspesifikke og overmodnings-varslene (begge ignorerbare) informerer om den lange enden i stedet for å sperre den — overmodnings-varselet er den ærlige bremsen i 96–120-timers-sona."
    ],
    "changes_en": [
      "Cold proof can now go up to 120 hours (5 days), up from 78. Strong flours (Caputo Manitoba Oro, W340–390) genuinely handle long cold fermentations, so the cap was needlessly low. The flour-specific and over-fermentation warnings (both dismissible) inform about the long end rather than blocking it — the over-fermentation warning is the honest brake in the 96–120 hour zone."
    ]
  },
  {
    "v": "0.679",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at teksten under «Mer → Visning» (Tema og Skriftstørrelse) var mindre enn resten av skjermen. Seksjonen var feilaktig «zoom-kansellert» (holdt på fast chrome-størrelse), mens nabo-seksjonen Språk/Enheter skalerte med lesetekst. Nå skalerer den likt, og etikettene matcher nabo-seksjonen på alle skriftstørrelser."
    ],
    "changes_en": [
      "Fixed the text under \"More → Display\" (Theme and Font size) being smaller than the rest of the screen. The section was mistakenly \"zoom-cancelled\" (held at a fixed chrome size), while the neighboring Language/Units section scaled with the reading text. It now scales the same way, and the labels match the neighboring section at every font size."
    ]
  },
  {
    "v": "0.678",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Overmodnings-varselet (det generelle «lang gjæringstid»-varselet ved ~4 døgn) er nå softere for «Annet mel / ikke i listen»: i stedet for «⚠️ fare for overfermentering» sier det «🌾 Lang gjæring for et ukjent mel — de fleste blir overmodne rundt her, men et veldig sterkt mel kan tåle det». Den nyttige sansesjekken beholdes; den falske sikkerheten om et mel appen ikke kjenner er borte. For kjente meltyper er varselet uendret."
    ],
    "changes_en": [
      "The over-fermentation warning (the general \"long fermentation time\" one at ~4 days) is now gentler for \"Other / not listed\": instead of \"⚠️ risk of over-fermentation\" it says \"🌾 Long fermentation for an unknown flour — most over-ripen around here, but a very strong flour may handle it\". The useful sensory check is kept; the false certainty about a flour the app doesn't know is gone. For known flours the warning is unchanged."
    ]
  },
  {
    "v": "0.677",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt melvalg «Annet mel / ikke i listen»: bruker du et mel appen ikke kjenner, slår dette av det mel-spesifikke gjærings-/hydreringsvarselet — appen maser ikke lenger om et spenn den umulig kan vite. Melet påvirker verken kald-taket eller Smart-plan-forslagene.",
      "«Verdt å vite»-hintene i «Jeg begynner nå» kan nå ignoreres (egen «Ignorer»-knapp), akkurat som varsler ellers i appen. I «Planlagt steketid» (der du har en frist) vises fortsatt hele sjekklista uten ignorering, så et reelt tidsproblem ikke blir skjult ved en port du ikke burde passere uoppmerksomt."
    ],
    "changes_en": [
      "New flour option \"Other / not listed\": if you use a flour the app does not know, this turns off the flour-specific fermentation/hydration warning — the app no longer nags about a range it cannot possibly know. The flour affects neither the cold-proof cap nor the Smart-plan suggestions.",
      "The \"Worth knowing\" hints in \"I start now\" can now be dismissed (their own \"Ignore\" button), just like warnings elsewhere in the app. In \"Planned baking time\" (where you have a deadline) the full checklist still shows without dismissal, so a real timing problem is not hidden at a gate you should not pass unnoticed."
    ]
  },
  {
    "v": "0.676",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Langtidsdeig får nå merkede tidsvalg rett under metodevalget i wizarden, akkurat som hurtigdeig og kveldsdeig: 24t «Rett fram», 48t «Mer smak», 72t «Full smak». Før lå kald-hevingen bare som en naken tall-slider gjemt i Finjuster. Slideren er der fortsatt for presis justering — begge setter samme verdi, så det er ett sannhetsgrunnlag."
    ],
    "changes_en": [
      "Long-ferment dough now gets labelled time options right under the method choice in the wizard, just like quick dough and evening dough: 24h \"Straightforward\", 48h \"More flavor\", 72h \"Full flavor\". Before, the cold proof was only a bare numeric slider tucked away in Fine-tune. The slider is still there for precise adjustment — both set the same value, so there is a single source of truth."
    ]
  },
  {
    "v": "0.675",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at tittelen i planleggings-statuslinja ble kuttet midt i ordet («Neapolitan pizza · Lon…»). Den viser nå det korte typenavnet uten det overflødige «pizza»-halet, og brytes til to linjer i stedet for å avkortes — så hele metoden alltid er lesbar."
    ],
    "changes_en": [
      "Fixed the planner status-bar title being cut off mid-word (\"Neapolitan pizza · Lon…\"). It now shows the short type name without the redundant \"pizza\" suffix, and wraps to two lines instead of truncating — so the full method is always readable."
    ]
  },
  {
    "v": "0.674",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Jeg begynner nå» er en kom-i-gang-modus uten frist — så kvalitetssjekken viser nå en rolig kvittering («✓ Du setter i gang nå · klar ca. …») i stedet for en «X ting å se på»-teller. Tips om mel, overmodning eller et steg midt på natta står fortsatt, men som myke «💡 Verdt å vite»-notater, ikke som blokkerende varsler. I «Planlagt steketid» (der du har en frist) er sjekken uendret."
    ],
    "changes_en": [
      "\"I start now\" is a get-going mode with no deadline — so the quality check now shows a calm receipt (\"✓ You start now · ready around …\") instead of an \"X things to look at\" counter. Tips about flour, over-ripening or a step landing in the middle of the night still appear, but as soft \"💡 Worth knowing\" notes rather than blocking warnings. In \"Planned baking time\" (where you do have a deadline) the check is unchanged."
    ]
  },
  {
    "v": "0.673",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at «lag pizza nå» kunne sette oppstarten bakover i tid: valgte du en lang metode mens «Jeg begynner nå» var på, tvang appen deg likevel over til en planlagt steketid — som med standardtiden kunne havne for tidlig. Nå respekteres «Jeg begynner nå», og deigen planlegges framover fra nå.",
      "I «Planlagt steketid»-modus flyttes standard-steketiden nå automatisk langt nok fram til at oppstarten faktisk er mulig, i stedet for å foreslå et tidspunkt som allerede har passert."
    ],
    "changes_en": [
      "Fixed \"make pizza now\" sometimes pushing the start time into the past: picking a long method while \"I start now\" was on still forced you over to a planned baking time — which, with the default time, could land too early. \"I start now\" is now respected, and the dough is planned forward from now.",
      "In \"Planned baking time\" mode the default baking time now moves forward automatically until the start is actually feasible, instead of suggesting a time that has already passed."
    ]
  },
  {
    "v": "0.672",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «🛒 Handleliste»-knappen igjen — ingrediens-totalene finnes allerede i oppskrift-fanen og i «Kopier tidsplan», så en egen handleliste var overflødig."
    ],
    "changes_en": [
      "Removed the \"🛒 Shopping list\" button again — the ingredient totals are already in the recipe tab and in \"Copy schedule\", so a separate shopping list was redundant."
    ]
  },
  {
    "v": "0.671",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at kjøletiden på deig-kortene (i «Mer» → Deiger) viste den norske forkortelsen «t» i engelsk modus («48t fridge»). Den viser nå «48h fridge»."
    ],
    "changes_en": [
      "Fixed the fridge time on the dough cards (in \"More\" → Doughs) showing the Norwegian abbreviation \"t\" in English mode (\"48t fridge\"). It now shows \"48h fridge\"."
    ]
  },
  {
    "v": "0.670",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Statuslinja i planleggingen viser nå hvilket mel planen bruker, sammen med oppstart og steketid — så du med ett blikk ser om planen matcher melet du faktisk har hjemme."
    ],
    "changes_en": [
      "The planner's status bar now shows which flour the plan uses, alongside the start and bake times — so you can see at a glance whether the plan matches the flour you actually have at home."
    ]
  },
  {
    "v": "0.669",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet opp i skriftstørrelsene i planleggingen: metode-kortene ble ved en feil rendret litt større enn resten av kontrollene (de manglet i «kontroller beholder størrelse»-lista), noe som fikk meltype-velgeren til å se mindre ut. Nå deler metode, meltype og de andre kontrollene samme jevne skala."
    ],
    "changes_en": [
      "Tidied up the font sizes in the planner: the method cards were accidentally rendered a bit larger than the other controls (they were missing from the 'controls keep their size' list), which made the flour-type picker look smaller. Method, flour type and the other controls now share one even scale."
    ]
  },
  {
    "v": "0.668",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Engelsk oversettelse av PC-visningen: meny, metodekort, planleggings-boks, glidebryter-etiketter og fane-navnene (Steg for steg/Oppskrift/Notater) vises nå på engelsk. Bytter du språk på PC, oppdateres planen med det samme."
    ],
    "changes_en": [
      "English translation of the desktop view: menu, method cards, the planning box, slider labels and the tab names (Step by step/Recipe/Notes) now show in English. Switching language on desktop updates the plan right away."
    ]
  },
  {
    "v": "0.667",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tilgjengelighet: avhaking av steg, ingredienser og understeg er nå ekte avkryssingsbokser du kan bruke med tastatur (Enter/mellomrom), og den levende statuslinja annonseres for skjermlesere."
    ],
    "changes_en": [
      "Accessibility: checking off steps, ingredients and substeps are now real checkboxes you can operate with the keyboard (Enter/Space), and the live status bar is announced to screen readers."
    ]
  },
  {
    "v": "0.666",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Deiger-lista har fått søk, filter på metode og sortering (nyest, eldst, best vurdert) — så den holder seg ryddig når du har mange deiger.",
      "Ferdige deiger viser nå kjøletid og hydrering i oversikten, så vurderingen henger sammen med de konkrete tallene («72t · 65 % → ★★★★»)."
    ],
    "changes_en": [
      "The Doughs list now has search, filter by method and sorting (newest, oldest, highest rated) — so it stays tidy when you have many doughs.",
      "Finished doughs now show fridge time and hydration in the overview, so the rating ties to the concrete numbers (\"72h · 65% → ★★★★\")."
    ]
  },
  {
    "v": "0.665",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny «🛒 Handleliste»-knapp: kopier en samlet liste med totale ingrediensmengder å handle etter — spesielt nyttig for fler-dagers metoder der ingrediensene ellers er delt over flere steg.",
      "Rettet en bitteliten avrundingsforskjell i biga: overgjærings-varselet og tidsplanen regner nå romhevingen helt likt."
    ],
    "changes_en": [
      "New \"🛒 Shopping list\" button: copy a consolidated list of total ingredient amounts to shop from — especially handy for multi-day methods where the ingredients are otherwise split across several steps.",
      "Fixed a tiny rounding difference in biga: the over-fermentation warning and the schedule now compute the room rise identically."
    ]
  },
  {
    "v": "0.664",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Mer»-fanen ligger nå lengst til høyre i menylinja (byttet plass med Smart-plan) — der en «mer»-meny vanligvis hører hjemme. Ny rekkefølge: Planlegging · Tidsplan · Smart-plan · Mer.",
      "Fylte inn manglende «hvorfor»-forklaringer på flere steg i hurtigdeig og Mania-poolish, så hvert steg i alle metoder nå forklarer hvorfor det er der."
    ],
    "changes_en": [
      "The \"More\" tab now sits furthest right in the menu bar (swapped with Smart plan) — where a \"more\" menu usually belongs. New order: Planner · Schedule · Smart plan · More.",
      "Filled in missing \"why\" explanations on several steps in the quick dough and Mania poolish, so every step in every method now explains why it is there."
    ]
  },
  {
    "v": "0.663",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan foreslår nå et smartere standard-tidspunkt. Åpner du appen tidlig nok på dagen til at en ekte deig rekker, foreslår den i dag kl. 18:00 — ellers hopper den til i morgen kl. 18:00. Før foreslo den alltid samme dag, som på ettermiddagen ga for kort tid og rare forslag. (Klokkeslettet er nå 18:00, som resten av appen.)"
    ],
    "changes_en": [
      "Smart plan now suggests a smarter default time. If you open the app early enough in the day for a real dough to fit, it suggests today at 18:00 — otherwise it jumps to tomorrow at 18:00. It used to always suggest the same day, which left too little time in the afternoon and gave odd suggestions. (The time is now 18:00, matching the rest of the app.)"
    ]
  },
  {
    "v": "0.662",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Alle varsler har nå en tydelig «Ignorer»-knapp i stedet for en diskré liten ✕ — samme handling (skjul varselet), men mye lettere å se. Smart-plan-varslene, som manglet den helt, har fått den også. Skillet består: du kan skjule et varsel om en fysisk grense (mel, overfermentering), men det får ikke en «det går bra likevel»-godkjenning som ville tilslørt et ekte kvalitetsproblem."
    ],
    "changes_en": [
      "Every warning now has a clear \"Ignore\" button instead of a discreet little ✕ — same action (hide the warning), but much easier to spot. The Smart plan warnings, which had none at all, got it too. The distinction stands: you can hide a warning about a physical limit (flour, over-fermentation), but it does not get an \"it's fine anyway\" acceptance that would mask a real quality problem."
    ]
  },
  {
    "v": "0.661",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan foreslår ikke lenger umulige deiger. Søket kappes ved det sterkeste melets tak (78t), så du aldri får forslag på ~145t «ingen mel dekker dette». Og når ingenting kan startes akkurat nå (f.eks. pizza om én time), foreslås den deigen som starter nærmest nå — typisk en hurtigdeig — i stedet for en flere-døgns deig som skulle startet for lenge siden. Korte deiger viser nå «alle mel passer» i stedet for en skremmende «ingen mel»-melding."
    ],
    "changes_en": [
      "Smart plan no longer suggests impossible doughs. The search is capped at the strongest flour's limit (78h), so you never get ~145h \"no flour covers this\" suggestions. And when nothing can start right now (e.g. pizza in an hour), it suggests the dough that starts closest to now — usually a quick dough — instead of a multi-day dough that should have started long ago. Short doughs now show \"any flour works\" instead of a scary \"no flour\" message."
    ]
  },
  {
    "v": "0.660",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Endringsloggen er nå tospråklig — hele «Hva er nytt» vises på engelsk når appen står på engelsk, og på norsk ellers. Alle tidligere versjoner er oversatt."
    ],
    "changes_en": [
      "The changelog is now bilingual — all of \"What's new\" shows in English when the app is set to English, and in Norwegian otherwise. Every past version has been translated."
    ]
  },
  {
    "v": "0.659",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kappet kjøleskaps-spaken ved 78 timer (var 144t). Det sterkeste melet i appen, Caputo Manitoba Oro, er ratet for 24–78t — ingen mel tåler mer, så spaken lovet før noe ingen deig kunne innfri. Eldre oppsett med lengre heving justeres automatisk ned til 78t."
    ],
    "changes_en": [
      "Capped the fridge slider at 78 hours (was 144h). The strongest flour in the app, Caputo Manitoba Oro, is rated for 24–78h — no flour handles more, so the slider promised something no dough could deliver. Older setups with longer proofs are automatically adjusted down to 78h."
    ]
  },
  {
    "v": "0.658",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Versjonsnummeret øverst er nå klikkbart — trykk det for å åpne «Hva er nytt» og se endringsloggen. (Fungerte fra før via PC-stempelet og «Hva er nytt» nederst i Mer.)"
    ],
    "changes_en": [
      "The version number at the top is now clickable — tap it to open \"What's new\" and see the changelog. (This already worked via the PC stamp and \"What's new\" at the bottom of More.)"
    ]
  },
  {
    "v": "0.657",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet det doble Deiger-inngangspunktet på mobil: 🍽️-ikonet i topplinja er borte. Aktive deiger vises fortsatt via teller-badgen på «Mer»-fanen (der Deiger flyttet inn i v0.653), så det trengs bare ett sted."
    ],
    "changes_en": [
      "Removed the duplicate Doughs entry point on mobile: the 🍽️ icon in the top bar is gone. Active doughs still show up via the counter badge on the \"More\" tab (where Doughs moved in v0.653), so one place is enough."
    ]
  },
  {
    "v": "0.656",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at «Vis»-knappen i Smart-plan («Når er du ledig?») viste norsk tekst i engelsk modus helt til første trykk. Etiketten språktilpasses nå med det samme (Show/Hide)."
    ],
    "changes_en": [
      "Fixed the \"Show\" button in Smart plan (\"When are you free?\") displaying Norwegian text in English mode until the first tap. The label now switches languages right away (Show/Hide)."
    ]
  },
  {
    "v": "0.655",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tidsplan er nå «tom» når du åpner appen uten å ha gjort et valg — i stedet for å vise en default-plan du aldri valgte. Det tomme feltet forklarer og guider deg til de to inngangene: Smart-plan og Planlegg selv. Planen fylles så snart du fullfører Planlegging, bruker Smart-plan eller åpner en lagret deig."
    ],
    "changes_en": [
      "The Schedule is now \"empty\" when you open the app without having made a choice — instead of showing a default plan you never picked. The empty state explains and guides you to the two entry points: Smart plan and Plan it yourself. The schedule fills in as soon as you finish the Planner, use Smart plan, or open a saved dough."
    ]
  },
  {
    "v": "0.654",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at Smart-plan viste norske metodenavn (som «Langtidsdeig») også i engelsk modus. Metodeforslagene i søket oversettes nå riktig (Long-ferment dough, Quick dough, Evening dough osv.)."
    ],
    "changes_en": [
      "Fixed Smart plan showing Norwegian method names (like \"Langtidsdeig\") even in English mode. The method suggestions in the search now translate correctly (Long-ferment dough, Quick dough, Evening dough, etc.)."
    ]
  },
  {
    "v": "0.653",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet i fanene: «Info» heter nå «☰ Mer», og «Deiger» er flyttet inn øverst i Mer. Da er det fire faner igjen — Planlegging, Tidsplan, Smart-plan og Mer. Du ser fortsatt aktive deiger via 🍽️-telleren i toppen, og «Mer»-fanen får en liten teller når du har deiger på gang."
    ],
    "changes_en": [
      "Tidied up the tabs: \"Info\" is now \"☰ More\", and \"Doughs\" has moved to the top of More. That leaves four tabs — Planner, Schedule, Smart plan and More. You still see active doughs via the 🍽️ counter at the top, and the \"More\" tab gets a small counter when you have doughs in progress."
    ]
  },
  {
    "v": "0.652",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Byttet pulsen på det aktive Smart-plan-feltet til en mykere «glød» — et varmt halo som puster rolig inn og ut i stedet for en skarp ring. Følger fortsatt «redusert bevegelse»."
    ],
    "changes_en": [
      "Swapped the pulse on the active Smart plan field for a softer \"glow\" — a warm halo that breathes gently in and out instead of a sharp ring. Still respects \"reduced motion\"."
    ]
  },
  {
    "v": "0.651",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Byttet «👆 Trykk her»-teksten i Smart-plan-velgeren med en rolig pulserende ramme rundt det aktive feltet — samme guiding, mindre tekst. Følger «redusert bevegelse»-innstillingen (da står ringen stille)."
    ],
    "changes_en": [
      "Replaced the \"👆 Tap here\" text in the Smart plan picker with a calm pulsing frame around the active field — same guidance, less text. Respects the \"reduced motion\" setting (the ring stays still then)."
    ]
  },
  {
    "v": "0.650",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-velgeren leder deg nå gjennom flyten: klokke-kortet lyser opp med «👆 Trykk her», får en ✓ når du har satt det, og uthevingen flytter seg til dato-kortet. «Finn oppskriften» lyser opp når begge er satt. (Du kan fortsatt trykke rett på knappen — standardene virker.)"
    ],
    "changes_en": [
      "The Smart plan picker now walks you through the flow: the clock card lights up with \"👆 Tap here\", gets a ✓ once you've set it, and the highlight moves to the date card. \"Find the recipe\" lights up once both are set. (You can still tap the button directly — the defaults work.)"
    ]
  },
  {
    "v": "0.649",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Oversatte de resterende velger-knappene i engelsk modus: gjærtype (Dry yeast / Fresh yeast), kjøkkenmaskin (Manual kneading / Other machine) og ovntype (Pizza oven / Regular oven). Gjelder både mobil og PC."
    ],
    "changes_en": [
      "Translated the remaining picker buttons in English mode: yeast type (Dry yeast / Fresh yeast), stand mixer (Manual kneading / Other machine) and oven type (Pizza oven / Regular oven). Applies to both mobile and PC."
    ]
  },
  {
    "v": "0.648",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Pizzatype-knappene var på norsk også i engelsk modus. Nå oversettes de: «Ingen elting» → «No-knead», «Langpanne» → «Sheet pan», «Napoletansk» → «Neapolitan» (både mobil og PC)."
    ],
    "changes_en": [
      "The pizza type buttons were in Norwegian even in English mode. Now they're translated: \"Ingen elting\" → \"No-knead\", \"Langpanne\" → \"Sheet pan\", \"Napoletansk\" → \"Neapolitan\" (both mobile and PC)."
    ]
  },
  {
    "v": "0.647",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Pusset opp klokke/dato-velgeren i Smart-plan: klokka og datoen er nå to like store kort. Klokka er tonet litt ned, og datoen vises som «lør 1. aug» (ukedag + dag + måned) i stedet for det rå OS-formatet. Trykk hvor som helst på et kort for å åpne velgeren, som før."
    ],
    "changes_en": [
      "Polished the time/date picker in Smart plan: the time and date are now two equally sized cards. The time is toned down a little, and the date shows as \"Sat 1 Aug\" (weekday + day + month) instead of the raw OS format. Tap anywhere on a card to open the picker, as before."
    ]
  },
  {
    "v": "0.646",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet overflødig luft på topp og bunn i mobilvisning. Klaringen for Dynamic Island/home-indicator ble ganget opp med skriftstørrelsen (og vokste dermed på store skrifter/XXL). Nå får topp og bunn nøyaktig den plassen de trenger, uansett skriftstørrelse."
    ],
    "changes_en": [
      "Removed excess space at the top and bottom in mobile view. The clearance for the Dynamic Island/home indicator was multiplied by the font size (and so grew on large/XXL fonts). Now the top and bottom get exactly the space they need, whatever the font size."
    ]
  },
  {
    "v": "0.645",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet «Tips og teknikk»: overskriftene i kortene ble klippet i toppen fordi kortene manglet innermarg. Nå har teksten luft rundt seg og kuttes ikke lenger."
    ],
    "changes_en": [
      "Fixed \"Tips and technique\": the card headings were clipped at the top because the cards had no inner padding. Now the text has room around it and is no longer cut off."
    ]
  },
  {
    "v": "0.644",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt <b>XXL</b>-nivå øverst i skriftstørrelse-valget, for de som vil ha ekstra stor tekst på hele planen. Velges under Visning (eller med +/− ved skriftstørrelse). Passet samtidig på at oppskrift-radene ikke lenger klemmer etikett og verdi sammen på de største skriftene."
    ],
    "changes_en": [
      "New <b>XXL</b> level at the top of the font size options, for those who want extra large text across the whole plan. Choose it under Display (or with +/− next to font size). While at it, made sure the recipe rows no longer cram the label and value together at the largest font sizes."
    ]
  },
  {
    "v": "0.643",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre lesbarhet på lyst tema: brødteksten (understeg, «Hvorfor», «Tips») var i en dempet gråbrun som ble litt vanskelig å lese på krembakgrunn. Nå står selve teksten i tydelig mørk blekk, mens sekundær info (steg-tall, tider) er gjort mørkere men holdes dempet. Mørkt tema er uendret."
    ],
    "changes_en": [
      "Better readability on the light theme: the body text (subheadings, \"Why\", \"Tips\") was in a muted gray-brown that got a bit hard to read on the cream background. Now the text itself is in clear dark ink, while secondary info (step numbers, times) is darkened but kept muted. The dark theme is unchanged."
    ]
  },
  {
    "v": "0.642",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Deiger er nå <b>private per bruker</b>. Du ser dine egne deiger + de som er delt med alle — ikke lenger alle andres. Hver av dine egne deiger har en «🔒 Privat — del med alle»-bryter; deler du, dukker den opp i «🌐 Delt med alle» for de andre, som kan åpne og kopiere den (men ikke endre den). «Min favoritt» er også per bruker nå.",
      "Deiger som allerede lå der beholdes som delt (synlige for alle) — ingenting forsvinner. Bare nye deiger er private som standard."
    ],
    "changes_en": [
      "Doughs are now <b>private per user</b>. You see your own doughs + the ones shared with everyone — no longer everyone else's. Each of your own doughs has a \"🔒 Private — share with everyone\" toggle; share one and it shows up in \"🌐 Shared with everyone\" for the others, who can open and copy it (but not edit it). \"My favorite\" is also per user now.",
      "Doughs that were already there stay shared (visible to everyone) — nothing disappears. Only new doughs are private by default."
    ]
  },
  {
    "v": "0.641",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet datofeltet i Smart-plan som ble stående blankt hvis man brukte «tøm»-knappen på iPhone. Nå fylles en fornuftig standard-dato tilbake automatisk, så feltet aldri står tomt."
    ],
    "changes_en": [
      "Fixed the date field in Smart plan going blank if you used the \"clear\" button on iPhone. Now a sensible default date is filled back in automatically, so the field is never empty."
    ]
  },
  {
    "v": "0.640",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet datofeltet i Smart-plan som lå litt skjevt på iPhone — det stakk ut til høyre forbi klokkeslett-boksen og «Finn oppskriften»-knappen. Nå fyller det raden likt som de andre."
    ],
    "changes_en": [
      "Fixed the date field in Smart plan that sat slightly off on iPhone — it stuck out to the right past the time box and the \"Find the recipe\" button. Now it fills the row evenly like the others."
    ]
  },
  {
    "v": "0.639",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt versjonsnummer: vi har lagt om til en 0.x-skala på vei mot 1.0, så tallet «hopper» fra 6.40 til 0.639. Hele endringsloggen er nummerert om til samme skala — innholdet i hver oppføring er uendret.",
      "Rettet blank skjerm når man byttet fra PC til mobil: den aktive mobil-fanen ble aldri rendret ved bytte (bare ved oppstart), så innholdet uteble. Nå får fanen innhold uansett hvordan du havner i mobilvisning."
    ],
    "changes_en": [
      "New version number: we've switched to a 0.x scale on the way to 1.0, so the number \"jumps\" from 6.40 to 0.639. The whole changelog has been renumbered to the same scale — the content of each entry is unchanged.",
      "Fixed a blank screen when switching from PC to mobile: the active mobile tab was never rendered on switch (only at startup), so the content didn't show. Now the tab gets content no matter how you end up in mobile view."
    ]
  },
  {
    "v": "0.638",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Lettere å gå tilbake til mobilvisning fra PC: «Til mobil»-knappen oppe til høyre er nå større og tydeligere (den satt for smått og gjemt i hjørnet før), og det er lagt til et eget «📱 Bytt til mobilvisning»-valg i ☰ Meny."
    ],
    "changes_en": [
      "Easier to get back to mobile view from PC: the \"To mobile\" button in the top right is now bigger and clearer (it was too small and hidden in the corner before), and a dedicated \"📱 Switch to mobile view\" option has been added to the ☰ Menu."
    ]
  },
  {
    "v": "0.637",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "PC-versjonen har fått samme varme «Forno»-følelse som mobilen: kremfargede flater i stedet for kald hvit/grå, brent-oransje aksent i stedet for grønn, og overskriftsfonten på tvers. Rent visuelt — alt fungerer som før, det ser bare ut som samme app enten du er på telefon eller skjerm."
    ],
    "changes_en": [
      "The PC version now has the same warm \"Forno\" feel as mobile: cream-colored surfaces instead of cold white/gray, a burnt-orange accent instead of green, and the heading font throughout. Purely visual — everything works as before, it just looks like the same app whether you're on your phone or a screen."
    ]
  },
  {
    "v": "0.636",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny <b>Fokus-modus</b> i Tidsplan: trykk «🔎 Fokus» og få det aktive steget i fullskjerm med stor skrift — laget for telefonen på benken mens du baker. Viser ett steg om gangen (tid, hva du gjør og understegene), åpner på steget du er kommet til, og du blar med store «Ferdig»/«Forrige»-knapper. Understeg kan hakes av her og deler fremdrift med Tidsplan. Skjermen holdes våken mens fokus er på, og lys/mørk følger resten av appen."
    ],
    "changes_en": [
      "New <b>Focus mode</b> in Schedule: tap \"🔎 Focus\" to get the current step full-screen in large type — made for the phone on the counter while you bake. It shows one step at a time (time, what you do, and the substeps), opens on the step you've reached, and you page through with big \"Done\"/\"Previous\" buttons. Substeps can be checked off here and share progress with Schedule. The screen stays awake while focus is on, and light/dark follows the rest of the app."
    ]
  },
  {
    "v": "0.635",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet «Kom i gang»-vinduet som poppet opp ved første besøk. Inngangsskjermen og hjelpetekstene underveis (metodekort, «hvorfor», tips, «Holder dette?») dekker det nå — ingen modal i ansiktet lenger. Den fulle <b>Bruksanvisningen</b> finnes fortsatt i Info-fanen (og bak logoen/menyen på PC)."
    ],
    "changes_en": [
      "Removed the \"Getting started\" window that popped up on your first visit. The entry screen and the in-context help (method cards, \"why\", tips, \"Does this hold up?\") cover it now — no more modal in your face. The full <b>User guide</b> is still in the Info tab (and behind the logo/menu on PC)."
    ]
  },
  {
    "v": "0.634",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ryddet inngangsskjermen: fjernet «Ny til pizzadeig? Slik funker det»-lenka. Guiden nås fortsatt fra Info-fanen."
    ],
    "changes_en": [
      "Tidied up the entry screen: removed the \"New to pizza dough? Here's how it works\" link. The guide is still reachable from the Info tab."
    ]
  },
  {
    "v": "0.633",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Du kan nå endre <b>meltype</b> og <b>antall</b> direkte under <b>⚙️ Finjuster</b> — ikke bare i veiviser-stegene. (Appen lovet allerede at meltype lå der; nå stemmer det.) Endringer synkes begge veier med stegene."
    ],
    "changes_en": [
      "You can now change <b>flour type</b> and <b>quantity</b> directly under <b>⚙️ Fine-tune</b> — not just in the wizard steps. (The app already promised flour type was there; now it actually is.) Changes sync both ways with the steps."
    ]
  },
  {
    "v": "0.632",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ryddet i fanelinja på mobil: fra 7 til <b>5 faner</b>. <b>Oppskrift</b> er nå en veksler øverst i <b>Tidsplan</b> (Tidsplan ↔ Oppskrift), og <b>Notater</b> ligger nå i <b>Deiger</b> (notatfeltet for den aktive deigen vises øverst der). Ingenting er borte — bare samlet der det hører hjemme, så fanelinja blir luftigere."
    ],
    "changes_en": [
      "Tidied up the tab bar on mobile: from 7 down to <b>5 tabs</b>. <b>Recipe</b> is now a toggle at the top of <b>Schedule</b> (Schedule ↔ Recipe), and <b>Notes</b> now lives in <b>Doughs</b> (the note field for the active dough shows at the top there). Nothing is gone — just gathered where it belongs, so the tab bar feels less crowded."
    ]
  },
  {
    "v": "0.631",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant og fikset den egentlige årsaken til det tomme feltet nederst på iPhone (installert app): høyden ble regnet fra en skjermhøyde som iOS rapporterer for kort i standalone-modus. Appen bruker nå hele skjermhøyden, så fanelinja ligger helt i bunn."
    ],
    "changes_en": [
      "Found and fixed the real cause of the empty area at the bottom on iPhone (installed app): the height was calculated from a screen height that iOS reports as too short in standalone mode. The app now uses the full screen height, so the tab bar sits all the way at the bottom."
    ]
  },
  {
    "v": "0.630",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Bedre fiks for at appen ikke fylte hele skjermen på iPhone (installert på hjemskjerm): app-skallet festes nå til alle fire skjermkanter i stedet for å regne skjermhøyde — så fanelinja ligger helt i bunn uten tomt felt under."
    ],
    "changes_en": [
      "Better fix for the app not filling the whole screen on iPhone (installed to the home screen): the app shell is now pinned to all four screen edges instead of calculating screen height — so the tab bar sits all the way at the bottom with no empty area underneath."
    ]
  },
  {
    "v": "0.629",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at appen ikke fylte hele skjermen på iPhone (installert på hjemskjerm) — fanelinja lå for høyt med et tomt felt under. Appen strekker seg nå helt ned til bunnen."
    ],
    "changes_en": [
      "Fixed the app not filling the whole screen on iPhone (installed to the home screen) — the tab bar sat too high with an empty area beneath it. The app now stretches all the way to the bottom."
    ]
  },
  {
    "v": "0.628",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en <b>hvit stripe nederst på skjermen</b> (under fanelinja, ved home-indikatoren på iPhone) i mørk modus — bakgrunnen følger nå temaet helt ut i kantene."
    ],
    "changes_en": [
      "Fixed a <b>white strip at the bottom of the screen</b> (below the tab bar, near the home indicator on iPhone) in dark mode — the background now follows the theme all the way to the edges."
    ]
  },
  {
    "v": "0.627",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at <b>logoen/navnet øverst</b> lå for høyt og havnet under statuslinja / Dynamic Island på iPhone. Topplinja tar nå hensyn til det trygge området øverst på skjermen."
    ],
    "changes_en": [
      "Fixed the <b>logo/name at the top</b> sitting too high and ending up under the status bar / Dynamic Island on iPhone. The top bar now accounts for the safe area at the top of the screen."
    ]
  },
  {
    "v": "0.626",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Appen har byttet navn til <b>UltimatePizza</b>. Samme app — oppdatert overalt du ser det: tittel, logo, innlogging, del-tekst, guiden og PWA-ikon. (Er appen installert på hjemskjermen, kan ikonnavnet henge igjen til du installerer på nytt — det styres av telefonen, ikke appen.)"
    ],
    "changes_en": [
      "The app has been renamed to <b>UltimatePizza</b>. Same app — updated everywhere you see it: title, logo, login, share text, the guide, and the PWA icon. (If the app is installed on your home screen, the icon name may linger until you reinstall — that's controlled by the phone, not the app.)"
    ]
  },
  {
    "v": "0.625",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Appen velger nå språk automatisk <b>første gang</b>: har du norsk (bokmål/nynorsk) i nettleseren eller på telefonen, starter den på norsk — ellers på engelsk. Har du valgt språk selv, huskes valget som før og overstyrer alltid gjettingen."
    ],
    "changes_en": [
      "The app now picks a language automatically the <b>first time</b>: if your browser or phone is set to Norwegian (Bokmål/Nynorsk), it starts in Norwegian — otherwise in English. If you've picked a language yourself, that choice is remembered as before and always overrides the guess."
    ]
  },
  {
    "v": "0.624",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Smart-plan: tidsvelgeren er redesignet. «Steketidspunkt» er byttet til det tydeligere spørsmålet <b>«Når skal deigen være klar?»</b> (med undertittel «Ferdig hevet og klar for ovnen») — det er akkurat tidspunktet planen regner mot. Klokkeslettet vises nå <b>stort og trykkbart</b> i fokus, med datoen under."
    ],
    "changes_en": [
      "Smart plan: the time picker has been redesigned. \"Bake time\" has been changed to the clearer question <b>\"When should the dough be ready?\"</b> (with the subtitle \"Fully risen and ready for the oven\") — that's exactly the moment the plan counts toward. The time is now shown <b>large and tappable</b> front and center, with the date below."
    ]
  },
  {
    "v": "0.623",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Inngangs-skjermen ønsker deg nå velkommen med «<b>La oss starte!</b>».",
      "«Når er du ledig?» er blitt tydeligere og mer fleksibel: hver tidsrad er nå merket <b>Fra</b> og <b>Til</b>, og du kan legge inn <b>flere tidsrom per dag</b> med en «<b>+ Legg til tid</b>»-knapp (f.eks. ledig både morgen, lunsj og kveld). Hver rad har et ✕ for å fjerne den igjen.",
      "Rettet en underliggende feil der endring av ledig tid på én hverdag kunne smitte over på de andre hverdagene — nå er hver dag helt uavhengig."
    ],
    "changes_en": [
      "The entry screen now welcomes you with \"<b>Let's get started!</b>\".",
      "\"When are you free?\" has become clearer and more flexible: each time row is now labeled <b>From</b> and <b>To</b>, and you can add <b>several time slots per day</b> with a \"<b>+ Add time</b>\" button (e.g. free in the morning, at lunch, and in the evening). Each row has an ✕ to remove it again.",
      "Fixed an underlying bug where changing free time on one weekday could carry over to the other weekdays — now each day is fully independent."
    ]
  },
  {
    "v": "0.622",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Appen har byttet navn til <b>Pizzame</b> (tidligere «Pizzaplanlegger»). Samme app, kortere navn — oppdatert overalt du ser det: tittel, logo, innlogging, del-tekst og PWA-ikon. (Er appen installert på hjemskjermen, kan ikonnavnet henge igjen til du installerer på nytt — det styres av telefonen, ikke appen.)"
    ],
    "changes_en": [
      "The app has been renamed to <b>Pizzame</b> (formerly \"Pizzaplanlegger\"). Same app, shorter name — updated everywhere you see it: title, logo, login, share text, and the PWA icon. (If the app is installed on your home screen, the icon name may linger until you reinstall — that's controlled by the phone, not the app.)"
    ]
  },
  {
    "v": "0.621",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en <b>blank skjerm</b>: valgte du «Smart-plan» og trykket deretter «Planlegging», ble skjermen tom. Nå kommer du tilbake til startvalget (de to dørene) i stedet.",
      "Logoen øverst tar deg nå <b>tilbake til startvalget</b> (Smart-plan / velg selv). Oppsettet ditt beholdes — det er bare en snarvei tilbake til inngangen. (Guiden når du fortsatt fra menyen og Info-fanen.)",
      "Fikset at hele <b>deig-lista</b> kunne feile med «Kunne ikke hente deiger» hvis én enkelt lagret deig var uleselig — én rar post veltet alt, så du fikk verken sett eller slettet noe. Nå hoppes en slik post over, og resten av deigene vises som normalt."
    ],
    "changes_en": [
      "Fixed a <b>blank screen</b>: if you chose \"Smart plan\" and then tapped \"Planner\", the screen went empty. Now you're taken back to the starting choice (the two doors) instead.",
      "The logo at the top now takes you <b>back to the starting choice</b> (Smart plan / choose yourself). Your setup is kept — it's just a shortcut back to the entrance. (You can still reach the guide from the menu and the Info tab.)",
      "Fixed the whole <b>dough list</b> failing with \"Couldn't load doughs\" if a single saved dough was unreadable — one odd entry toppled everything, so you couldn't view or delete anything. Now such an entry is skipped, and the rest of your doughs show up as normal."
    ]
  },
  {
    "v": "0.620",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny <b>inngang</b>: når du åpner appen på nytt møter du nå to likestilte dører — <b>🧭 Smart-plan</b> («si når du har tid og når du vil spise, så finner appen metoden som passer livet ditt») og <b>🍕 Jeg vet hva jeg vil ha</b> (velg type og metode selv, som før). Ett trykk og du er i riktig løype. Har du et påbegynt oppsett, hopper vi rett inn i det uten å avbryte.",
      "Funksjonen som før het «<b>Beta</b>» heter nå <b>Smart-plan</b> — samme motor (den søker på tvers av alle metoder etter den som passer din ledige tid best), men uten «uferdig»-stempelet den aldri fortjente. Første gang du åpner den, foldes «Når er du ledig?» automatisk ut, så anbefalingen faktisk bygger på din tid og ikke en generisk standard.",
      "Mykere språk når en plan ikke passer perfekt: «Krever litt jobbing utenom din vanlige ledige tid» i stedet for «2 avvik»."
    ],
    "changes_en": [
      "New <b>entry point</b>: when you reopen the app you now meet two equal doors — <b>🧭 Smart plan</b> (\"tell us when you have time and when you want to eat, and the app finds the method that fits your life\") and <b>🍕 I know what I want</b> (pick type and method yourself, as before). One tap and you're on the right track. If you have a setup in progress, we jump straight into it without interrupting.",
      "The feature previously called \"<b>Beta</b>\" is now <b>Smart plan</b> — same engine (it searches across every method for the one that best fits your free time), but without the \"unfinished\" label it never deserved. The first time you open it, \"When are you free?\" unfolds automatically, so the recommendation actually builds on your time and not a generic default.",
      "Gentler wording when a plan doesn't fit perfectly: \"Needs a little work outside your usual free time\" instead of \"2 deviations\"."
    ]
  },
  {
    "v": "0.619",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Språkvask og småfikser etter en grundig gjennomgang. Lange varigheter vises nå som «8 t 24 min» i stedet for rå «504 min», og «1.3 time» er ryddet til «1 t 15 min». Entall håndteres riktig når det bare er én av noe («1 emne», «1 boks» — ikke «1 emner»). Kopi-teksten skriver «Mania-poolish» (ikke «mania») og «Antall … : 1» uten det engelske «pcs». På engelsk er en rekke formuleringer gjort mer naturlige (bl.a. amerikansk «flavor», «warm up» i stedet for «temper» om deig, og «sheet pans»/«pizzas» oversatt i antall-linja). På norsk: «Vekk gjæren» (ikke «Væk»), «veiviseren» konsekvent, og «stjerner» der appen faktisk viser ★ (ikke «terningkast»)."
    ],
    "changes_en": [
      "Language cleanup and small fixes after a thorough review. Long durations now show as \"8 h 24 min\" instead of raw \"504 min\", and \"1.3 hours\" is tidied up to \"1 h 15 min\". Singular is handled correctly when there's just one of something (\"1 topic\", \"1 box\" — not \"1 topics\"). The copy text now writes \"Mania poolish\" (not \"mania\") and \"Count … : 1\" without the odd \"pcs\". In English, a number of phrasings have been made more natural (including American \"flavor\", \"warm up\" instead of \"temper\" for dough, and \"sheet pans\"/\"pizzas\" translated in the count line). In Norwegian: \"Wake the yeast\" (not \"Væk\"), \"the guide\" used consistently, and \"stars\" where the app actually shows ★ (not \"dice roll\")."
    ]
  },
  {
    "v": "0.618",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at en nettopp sendt <b>tilbakemelding</b> så ut til å forsvinne. To ting: (1) tilbakemeldings-vinduet lukket seg selv etter ett sekund, så du rakk ikke se at meldingen kom inn — nå blir det stående åpent. (2) Lista var sortert etter stemmer, så en fersk melding (0 stemmer) havnet nederst — nå vises den du nettopp sendte <b>øverst</b>, tydelig merket «✓ nettopp sendt», selv om serveren skulle henge et øyeblikk. Meldingene ble alltid lagret; de var bare vanskelige å få øye på."
    ],
    "changes_en": [
      "Fixed a just-sent piece of <b>feedback</b> appearing to vanish. Two things: (1) the feedback window closed itself after one second, so you didn't have time to see the message arrive — now it stays open. (2) The list was sorted by votes, so a fresh message (0 votes) landed at the bottom — now the one you just sent shows <b>at the top</b>, clearly marked \"✓ just sent\", even if the server hangs for a moment. Messages were always saved; they were just hard to spot."
    ]
  },
  {
    "v": "0.617",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Bedre <b>kalender-eksport</b> (📅 Påminnelser). Kalenderfila følger nå språk og enheter du har valgt (engelske titler og oz/°F når det er valgt), varsel kommer 10 min før hvert <b>handlingssteg</b> (ikke lenger et pling før hver passive heving), og hvert innslag har fått «trenger»-liste og sted (kjøleskap/benk/ovn). Under panseret er fila gjort robust etter kalender-standarden — den manglet et påkrevd tidsstempel og escaping, som kunne få enkelte kalendere (bl.a. Google) til å avvise eller vise hendelser feil."
    ],
    "changes_en": [
      "Better <b>calendar export</b> (📅 Reminders). The calendar file now follows the language and units you've chosen (English titles and oz/°F when selected), a reminder comes 10 min before each <b>action step</b> (no longer a ping before every passive rise), and each entry now has a \"needs\" list and location (fridge/counter/oven). Under the hood the file has been made robust per the calendar standard — it was missing a required timestamp and escaping, which could cause some calendars (including Google) to reject or display events incorrectly."
    ]
  },
  {
    "v": "0.616",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny <b>lys modus</b> ved siden av den mørke. Under <b>Info → Visning → Tema</b> velger du <b>System</b> (følger telefonens innstilling), <b>Lys</b> eller <b>Mørk</b>. Den lyse paletten er en varm krem/pergament-tone med samme oransje aksent som før. Valget huskes, og standard er fortsatt mørk — så ingenting endrer seg før du selv velger noe annet."
    ],
    "changes_en": [
      "New <b>light mode</b> alongside the dark one. Under <b>Info → Display → Theme</b> you can choose <b>System</b> (follows your phone's setting), <b>Light</b> or <b>Dark</b>. The light palette is a warm cream/parchment tone with the same orange accent as before. Your choice is remembered, and the default is still dark — so nothing changes until you choose something else yourself."
    ]
  },
  {
    "v": "0.615",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Avhaking av steg følger nå <b>innholdet</b> i steget, ikke bare posisjonen. Justerer du melmengde, hydrering, temperatur eller kjøletid <i>etter</i> at du har haket av noe, faller haken automatisk av de stegene som faktisk endret seg (nye grammengder, temperaturer eller minutter) — mens steg som ikke ble berørt beholder haken. Før kunne en hake bli stående på et tall som var endret (f.eks. en avhaket «500 g mel» etter at du dro til 600 g). Haken rives aldri vekk midt i et glidebryter-dra, og den overlever språk- og enhetsbytte."
    ],
    "changes_en": [
      "Checking off steps now follows the <b>content</b> of the step, not just its position. If you adjust flour amount, hydration, temperature or chill time <i>after</i> you've checked something off, the checkmark automatically drops off the steps that actually changed (new gram amounts, temperatures or minutes) — while steps that weren't touched keep their checkmark. Before, a checkmark could stay on a number that had changed (e.g. a checked-off \"500 g flour\" after you dragged it to 600 g). The checkmark is never torn off mid slider-drag, and it survives language and unit switches."
    ]
  },
  {
    "v": "0.614",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Appen finnes nå på <b>engelsk</b>, og du kan vise mål i <b>imperiske enheter</b> (oz og °F). Begge deler er egne, uavhengige brytere under <b>Info → Språk / Enheter</b> — du kan f.eks. ha norsk tekst med imperiske enheter, eller engelsk med metrisk. Hele mobilappen er oversatt: oppskrifter, tidsplan, alle sju metodene, veiviser, varsler, «📋 Kopier»-teksten, bruksanvisningen og Tips &amp; teknikk. Engelsk er <b>maskinoversatt (AI)</b> — et lite varsel minner om å dobbeltsjekke kritiske steg — og selve utregningen er uendret; det er kun visningen som bytter språk/enhet."
    ],
    "changes_en": [
      "The app is now available in <b>English</b>, and you can show measurements in <b>imperial units</b> (oz and °F). Both are separate, independent toggles under <b>Info → Language / Units</b> — you can, for example, have Norwegian text with imperial units, or English with metric. The entire mobile app is translated: recipes, schedule, all seven methods, guide, notifications, the \"📋 Copy\" text, the instructions and Tips &amp; techniques. English is <b>machine-translated (AI)</b> — a small notice reminds you to double-check critical steps — and the calculation itself is unchanged; only the display switches language/unit."
    ]
  },
  {
    "v": "0.613",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny <b>«👉 Neste»-stripe</b> øverst i tidsplanen: den viser hva neste steg er og teller ned til det — «Ta ut av kjøleskap · om 3 t 20 min» — så du slipper å scrolle gjennom hele planen for å se hva som skjer nå. Nedtellingen oppdaterer seg selv, og et trykk på stripa hopper rett til neste steg. Står du midt i en lang heving, peker den på slutten av hevingen; er alt gjort, sier den fra. (Er du på etterskudd og har steg som skulle vært gjort, viser den «på tide».)"
    ],
    "changes_en": [
      "New <b>\"👉 Next\" strip</b> at the top of the schedule: it shows what the next step is and counts down to it — \"Take out of fridge · in 3 h 20 min\" — so you don't have to scroll through the whole plan to see what's happening now. The countdown updates itself, and a tap on the strip jumps straight to the next step. If you're in the middle of a long rise, it points to the end of the rise; if everything's done, it lets you know. (If you're behind and have steps that should already be done, it shows \"time to\".)"
    ]
  },
  {
    "v": "0.612",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Understeg er nå en fullverdig, husket visning — ikke lenger merket som «utprøving». To ting huskes: (1) <b>Avhakingen av understeg</b> lagres nå sammen med deigen og synkes mellom enheter, akkurat som hovedsteg og ingredienser. Legger du fra deg telefonen midt i en flerdagers heving, står understegene du har haket av der når du kommer tilbake — også på en annen enhet. (2) <b>Selve understeg-visningen</b> huskes mellom økter: slår du den på, er den på neste gang du åpner appen (som skriftstørrelse og layout). Knappen heter nå «📋 Vis understeg».",
      "Et påbegynt oppsett overlever nå en full sideoppfriskning. Før husket appen valgene dine bare mens fanen var åpen — lastet du siden på nytt, var pizzatype, metode og finjusteringer tilbake på standard. Nå gjenopprettes hele oppsettet automatisk, og «Fortsetter: … »-linja i planleggeren dukker opp igjen der du slapp. «Start ny deig» nullstiller som før. (Åpner du en lagret deig, styrer den som vanlig — dette gjelder det ulagrede oppsettet du holder på med.)"
    ],
    "changes_en": [
      "Sub-steps are now a full, remembered view — no longer marked as \"experimental\". Two things are remembered: (1) <b>Checking off sub-steps</b> is now saved with the dough and synced between devices, just like main steps and ingredients. If you put your phone down in the middle of a multi-day rise, the sub-steps you've checked off are still there when you come back — even on another device. (2) <b>The sub-step view itself</b> is remembered between sessions: if you turn it on, it's on the next time you open the app (like font size and layout). The button is now called \"📋 Show sub-steps\".",
      "A setup in progress now survives a full page refresh. Before, the app only remembered your choices while the tab was open — if you reloaded the page, pizza type, method and fine-tuning were back to default. Now the whole setup is restored automatically, and the \"Continuing: … \" line in the planner reappears where you left off. \"Start new dough\" resets as before. (If you open a saved dough, it takes charge as usual — this applies to the unsaved setup you're working on.)"
    ]
  },
  {
    "v": "0.611",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet en feil der avhaking kunne bli stående på utdatert innhold: bytter du <b>ovntype</b> eller <b>gjærtype</b> mens du har haket av steg, nullstilles avhakingen nå — på samme måte som ved bytte av pizzatype eller metode. Før kunne f.eks. «Varm pizzaovnen til 430°C» stå avhaket selv etter at du byttet til vanlig ovn (som sier 250°C), og gjær-chips beholde gammel grammengde. Gjelder både PC og mobil. (Melmengde/hydrering/temperatur/kjøletid nullstiller bevisst <b>ikke</b> — de justeres med glidebrytere som beveger seg kontinuerlig, og en nullstilling der ville rive vekk flere dagers avhaking midt i et dra.)",
      "Hurtigdeig: rettet at etterhevingen ikke fulgte kjøkkentemperaturen. Bulk-hevingen ble justert etter romtemperatur (varmere = raskere), men etterhevingen sto fast — så ved et varmt kjøkken (26–28°C) reagerte deigens to gjæringsfaser ulikt, og planen ble internt inkonsistent. Nå skaleres begge fasene likt med temperaturen. Ved 22°C er tidsplanen uendret; forskjellen merkes bare ved kjøligere eller varmere kjøkken."
    ],
    "changes_en": [
      "Fixed a bug where checkmarks could stay on outdated content: if you switch <b>oven type</b> or <b>yeast type</b> while you have steps checked off, the checkmarks are now cleared — the same way as when switching pizza type or method. Before, for example \"Heat the pizza oven to 430°C\" could stay checked off even after you switched to a regular oven (which says 250°C), and the yeast chips could keep the old gram amount. Applies to both PC and mobile. (Flour amount/hydration/temperature/chill time deliberately do <b>not</b> reset — they're adjusted with sliders that move continuously, and a reset there would tear away several days of checkmarks mid-drag.)",
      "Quick dough: fixed the final proof not following the kitchen temperature. The bulk rise was adjusted to room temperature (warmer = faster), but the final proof was fixed — so in a warm kitchen (26–28°C) the dough's two fermentation phases reacted differently, and the plan became internally inconsistent. Now both phases scale equally with temperature. At 22°C the schedule is unchanged; the difference is only noticeable in a cooler or warmer kitchen."
    ]
  },
  {
    "v": "0.610",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Tre praktiske kald-gjæring-råd lagt til: (1) «Sett i kjøleskap»-steget minner nå om å <b>ikke stable boksene tett i høyden</b> — det kan blokkere luftsirkulasjonen og gi ujevn kjøling — og om at kjøleskapstallet på hjulet ikke er til å stole på (1–5-skalaene varierer mellom merker; sjekk med termometer at det ligger rundt 2–5°C). (2) «Hvorfor»-teksten på kjøleskapshevingen nevner at kald gjæring er <b>tilgivende</b>: siden kulda bremser hele prosessen, tåler deigen litt mer gjær enn man skulle tro før det blir et problem. Gjelder alle metoder med kjøleskapsheving."
    ],
    "changes_en": [
      "Three practical cold-fermentation tips added: (1) The \"Put in fridge\" step now reminds you <b>not to stack the boxes tightly on top of each other</b> — it can block air circulation and cause uneven cooling — and that the fridge dial number isn't to be trusted (the 1–5 scales vary between brands; check with a thermometer that it's around 2–5°C). (2) The \"why\" text on the fridge rise notes that cold fermentation is <b>forgiving</b>: since the cold slows the whole process, the dough tolerates a bit more yeast than you'd think before it becomes a problem. Applies to all methods with a fridge rise."
    ]
  },
  {
    "v": "0.609",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Gjæringsstegene forteller nå ikke bare <b>når</b>, men <b>hva du ser etter</b> — og hva du gjør hvis deigen henger etter eller er kommet for langt. Klokka er fortsatt planen, men tida stemmer sjelden på minuttet: kjøleskap og kjøkken varierer. Under «💡 Tips» får de kalde hevingene, romtemperatur-/bulk-hevingene, benktida og poolish-gjæringen et fast mønster med tegn å kjenne igjen (størrelse, bobler, lukt, fingertrykk) og et konkret «gi den mer tid» / «bak tidligere». Kald deig: fingertrykk-testen holdes bevisst ute — den er upålitelig når deigen er stiv av kulde. Gjelder alle metoder (Langtidsdeig, Poolish, Biga, Hurtigdeig, Kveldsdeig, Mania)."
    ],
    "changes_en": [
      "The fermentation steps now tell you not just <b>when</b>, but <b>what to look for</b> — and what to do if the dough is lagging behind or has gone too far. The clock is still the plan, but the timing rarely lands to the minute: fridges and kitchens vary. Under \"💡 Tips\", the cold rises, the room-temperature/bulk rises, the counter time and the poolish fermentation get a consistent pattern with signs to recognize (size, bubbles, smell, finger poke) and a concrete \"give it more time\" / \"bake earlier\". Cold dough: the finger-poke test is deliberately left out — it's unreliable when the dough is stiff from the cold. Applies to all methods (Long-ferment dough, Poolish, Biga, Quick dough, Evening dough, Mania)."
    ]
  },
  {
    "v": "0.608",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny teknikk: «🧊 Poolish kjøleskapspause». Er tidene vanskelige å få til å gå opp, kan du la den ferdige poolishen «vente» kaldt (opptil 18t) mellom «poolish er klar» og «bland ferdig deig». Det skyver resten av planen inn i den ledige tiden din — <b>uten å endre når du spiser</b>. Slå den av/på under Metode → «Poolish kjøleskapspause», eller trykk «🧊 Sett inn kjøleskapspause» rett i tidskonflikt-varselet når den dukker opp. Appen velger den korteste pausen (6/12/18t) som gir færrest steg utenfor tiden din, og viser pausen som et eget steg. Beta-søket «Finn oppskrift» kjenner også teknikken og kan foreslå den."
    ],
    "changes_en": [
      "New technique: \"🧊 Poolish fridge pause\". If the timings are hard to make line up, you can let the finished poolish \"wait\" cold (up to 18h) between \"poolish is ready\" and \"mix the final dough\". This shifts the rest of the plan into your free time — <b>without changing when you eat</b>. Turn it on/off under Method → \"Poolish fridge pause\", or tap \"🧊 Insert fridge pause\" right in the timing-conflict alert when it appears. The app picks the shortest pause (6/12/18h) that leaves the fewest steps outside your time, and shows the pause as its own step. The Beta \"Find recipe\" search also knows the technique and can suggest it."
    ]
  },
  {
    "v": "0.607",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "«Ta ut av kjøleskap»-steget forklarer nå benktida (tempereringen) etter kjøleskapsfermenteringen bedre: den gjør to ting på én gang — glutenet slapper av så deigen blir strekkbar, og gjæren våkner fra kulda og gir en siste, kort heving som gjør skorpa luftig. Hopper du over den, blir deigen både vanskelig å strekke og tettere stekt. Tipset er også utvidet: for kort gir stiv, tett deig; altfor lenge kan overheve. Gjelder alle metoder med kjøleskapsheving (Langtidsdeig, Poolish, Biga)."
    ],
    "changes_en": [
      "The \"Take out of fridge\" step now better explains the counter time (warming up) after the fridge fermentation: it does two things at once — the gluten relaxes so the dough becomes stretchy, and the yeast wakes from the cold and gives one last, short rise that makes the crust airy. Skip it, and the dough becomes both hard to stretch and denser when baked. The tip is also expanded: too short gives stiff, dense dough; far too long can overproof. Applies to all methods with a fridge rise (Long-ferment dough, Poolish, Biga)."
    ]
  },
  {
    "v": "0.606",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet tre tidsbeskrivelser som ikke stemte med selve tidsplanen (funnet ved manuell kvalitetssjekk): (1) kjøleskaps-steget skrev «ca. 24 timer» selv om den faktiske urørte kjøletiden er kortere — de siste 4 timene av den kalde fasen er temperering ute (eget steg). Teksten viser nå den reelle kjøletiden (f.eks. ca. 19,8 timer), i tråd med tidslinja på steget. (2) «Total heving» i den kopierte oppskriften viste bare den kalde halen (f.eks. 24t), ikke den reelle totaltiden — nå står «Total tid fra start til steking: ca. X timer» regnet fra første steg til steking (for en poolish med 24t kald hale blir det ca. 40 timer). (3) Fagteksten om poolish sa «har allerede fermentert mesteparten av deigen» — poolishen er halvparten av melet, så det står nå «halvparten av melet og bidrar med mye av smak- og aromautviklingen»."
    ],
    "changes_en": [
      "Fixed three time descriptions that didn't match the actual schedule (found during a manual quality check): (1) the fridge step said \"about 24 hours\" even though the actual undisturbed chill time is shorter — the last 4 hours of the cold phase are warming up on the counter (a separate step). The text now shows the real chill time (e.g. about 19.8 hours), in line with the timeline on the step. (2) \"Total rise\" in the copied recipe showed only the cold tail (e.g. 24h), not the real total time — now it says \"Total time from start to bake: about X hours\" counted from the first step to baking (for a poolish with a 24h cold tail, that's about 40 hours). (3) The technical text about poolish said \"has already fermented most of the dough\" — the poolish is half the flour, so it now says \"half the flour and contributes much of the flavor and aroma development\"."
    ]
  },
  {
    "v": "0.605",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"📋 Kopier\" tar nå med en sjekk-instruksjon øverst (\"Sjekk denne pizzaoppskriften systematisk for feil i ingredienser, matematikk og tidsplan — se spesielt etter avvik fra det jeg selv har oppgitt:\"), pluss appversjon og dato/klokkeslett for kopieringen. Nyttig hvis du vil lime hele oppskriften rett inn i en manuell kvalitetssjekk — og det blir sporbart hvilken versjon planen kom fra."
    ],
    "changes_en": [
      "\"📋 Copy\" now includes a check instruction at the top (\"Systematically check this pizza recipe for errors in ingredients, math and schedule — look especially for deviations from what I entered myself:\"), plus the app version and the date/time of the copy. Useful if you want to paste the whole recipe straight into a manual quality check — and it becomes traceable which version the plan came from."
    ]
  },
  {
    "v": "0.604",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Beta-fanen er ryddet: \"Pizzatid\" heter nå \"Når er du ledig?\", med en forklaringsboks som sier hva den er og hvordan den påvirker appen — den brukes både til å foreslå oppskrifter som passer tiden din, og til å varsle hvis et steg havner på en tid du ikke har satt av. \"Eller velg et populært tidspunkt\" har fått tydeligere skille fra feltene over og en kort forklaring av hva knappene gjør. Elementene følger nå samme stil som resten av appen."
    ],
    "changes_en": [
      "The Beta tab has been tidied up: \"Pizza time\" is now \"When are you free?\", with an explanation box that says what it is and how it affects the app — it's used both to suggest recipes that fit your time, and to warn you if a step lands at a time you haven't set aside. \"Or pick a popular time\" now has a clearer separation from the fields above and a short explanation of what the buttons do. The elements now follow the same style as the rest of the app."
    ]
  },
  {
    "v": "0.603",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny \"📤 Del appen\"-knapp (under Info → Del, og i ☰ Meny på PC). På mobil åpner den delingsmenyen så du kan sende appen videre i meldinger, e-post osv.; på PC kopieres lenken til utklippstavla. Løser at det ikke fantes noen adresse å kopiere når appen kjøres installert fra hjemskjermen (da er nettleserens adressefelt skjult). Bruksanvisningen er oppdatert med dette."
    ],
    "changes_en": [
      "New \"📤 Share app\" button (under Info → Share, and in ☰ Menu on PC). On mobile it opens the share menu so you can pass the app along in messages, email, etc.; on PC the link is copied to the clipboard. This solves there being no address to copy when the app runs installed from the home screen (where the browser's address bar is hidden). The instructions have been updated with this."
    ]
  },
  {
    "v": "0.602",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny \"📖 Bruksanvisning\" under Info-fanen: en komplett, pedagogisk gjennomgang av hele appen — alle fanene, innstillingene, metodene og de smarte funksjonene (veiviseren og Sjekk, understeg/tips/juster, varsler og pizzatid, lagring og terningkast, kopier/kalender, install på hjemskjerm, og Beta-søket). Den har en innholdsfortegnelse øverst så du kan hoppe rett til det du lurer på. Bruksanvisningen holdes oppdatert i takt med appen."
    ],
    "changes_en": [
      "New \"📖 User guide\" under the Info tab: a complete, walk-you-through tour of the whole app — every tab, all the settings, the methods and the smart features (the wizard and Check, sub-steps/tips/adjust, notifications and pizza time, saving and the dice roll, copy/calendar, install to home screen, and the Beta search). It has a table of contents at the top so you can jump straight to whatever you're wondering about. The guide is kept up to date as the app evolves."
    ]
  },
  {
    "v": "0.601",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Tidskonflikt-varselet (\"Et steg havner i tid du ikke har satt av til pizza\") er tonet ned i Tidsplan: steget som kolliderer får nå bare et lite «⚠ utenfor spisetid»-merke rett på steg-raden, i stedet for hele kortet. Det fulle varselet — med forklaringen og valgene «Rediger pizzatiden» og «Fortsett likevel» — bor nå i wizardens «Sjekk», som er der du blir gjort oppmerksom på det før du starter. På mobil tar et trykk på merket deg rett til å redigere pizzatiden.",
      "Rettet en reell feil i Hurtigdeig-kickstarten fra v6.01: hele vannmengden og gjæren ble listet i BÅDE kickstarten og eltesteget, så fulgte du stegene bokstavelig tilsatte du dobbelt av begge. Nå vekkes gjæren i en liten, varm porsjon av vannet, mens resten tilsettes i eltesteget på den beregnede temperaturen — vann og gjær telles én gang, og deigen sikter fortsatt mot ca. 24°C.",
      "Ny \"Legg til på hjemskjerm\"-knapp: på Android får du den ekte installasjonsdialogen, på iPhone en kort veiledning via Del-ikonet i Safari. Appen kan nå også installeres og brukes offline.",
      "Rettet en feil som kunne gi en kort \"hikke\" ved lasting på mobil for innloggede brukere — et internt oppstartssteg kunne kjøre før mobilvisningen var ferdig bygget. Ingen synlig endring utover at oppstarten er stødigere."
    ],
    "changes_en": [
      "The timing-conflict warning (\"A step lands during time you haven't set aside for pizza\") has been toned down in the Schedule: the clashing step now just gets a small \"⚠ outside eating time\" badge right on the step row, instead of taking over the whole card. The full warning — with the explanation and the \"Edit pizza time\" and \"Continue anyway\" choices — now lives in the wizard's \"Check\", which is where you're alerted to it before you start. On mobile, tapping the badge takes you straight to editing the pizza time.",
      "Fixed a real bug in the Quick dough kickstart from v6.01: the entire amount of water and the yeast were listed in BOTH the kickstart and the kneading step, so if you followed the steps literally you added double of both. Now the yeast is woken up in a small, warm portion of the water, while the rest is added in the kneading step at the calculated temperature — water and yeast are counted once, and the dough still aims for about 24°C.",
      "New \"Add to home screen\" button: on Android you get the real install dialog, on iPhone a short guide via the Share icon in Safari. The app can now also be installed and used offline.",
      "Fixed a bug that could cause a brief \"hiccup\" while loading on mobile for logged-in users — an internal startup step could run before the mobile view had finished building. No visible change beyond a steadier startup."
    ]
  },
  {
    "v": "0.600",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny \"Start ny deig\"-knapp på wizardens første steg. Den vises kun som en liten \"Fortsetter: X · Y\"-linje når du faktisk ikke er på standardverdier — kommer du tilbake til wizarden og alt er nullstilt fra før, ser du ingenting ekstra.",
      "Rettet en reell feil: å bytte pizzatype eller metode midt i økten kunne la gamle avhukinger (steg, ingredienser, understeg) henge igjen og vises feilaktig som fullført på det nye innholdet. Bytter du nå, nullstilles alle tre riktig — men et trykk på samme type/metode du allerede har valgt endrer ingenting, som forventet.",
      "Hurtigdeig har fått et nytt første steg: en gjær-kickstart der du rører gjæren ut i lunkent vann med litt honning og lar den boble noen minutter før melet tilsettes — en enkel sjekk på at gjæren faktisk lever, og et forsprang før den skal konkurrere med melet om maten.",
      "Steketrinnet i Hurtigdeig har fått et tips om å bruke semulegryn i stedet for vanlig mel til utbakingen — tåler høyere varme bedre."
    ],
    "changes_en": [
      "New \"Start new dough\" button on the wizard's first step. It only shows up as a small \"Continuing: X · Y\" line when you're actually not on the default values — come back to the wizard with everything already reset, and you'll see nothing extra.",
      "Fixed a real bug: switching pizza type or method mid-session could leave old checkmarks (steps, ingredients, sub-steps) hanging around and showing up incorrectly as done on the new content. Now when you switch, all three reset correctly — but tapping the same type/method you've already chosen changes nothing, as expected.",
      "Quick dough got a new first step: a yeast kickstart where you stir the yeast into lukewarm water with a little honey and let it bubble for a few minutes before the flour goes in — a simple check that the yeast is actually alive, and a head start before it has to compete with the flour for food.",
      "The baking step in Quick dough got a tip to use semolina instead of regular flour for shaping — it handles higher heat better."
    ]
  },
  {
    "v": "0.599",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Prøv understeg\" er flyttet ned til statuslinjen, rett ved siden av \"⚙️ Juster\" — og en ny \"💡 Tips\"-bryter har fått plass der også. Alle tre står nå samlet på én rad i Tidsplan, med pizzatype og metode alene på linjen over. Tips-bryteren fungerte tidligere kun på PC; den virker nå på mobil også.",
      "Wizardens egne statuslinjer (Metode, Sjekk, Finjuster) er urørt — Juster ligger fortsatt rett ved navnet der, uten Understeg eller Tips i veien."
    ],
    "changes_en": [
      "\"Try sub-steps\" has moved down to the status line, right next to \"⚙️ Fine-tune\" — and a new \"💡 Tips\" toggle has found a spot there too. All three now sit together on one row in the Schedule, with pizza type and method alone on the line above. The Tips toggle used to work only on desktop; it now works on mobile as well.",
      "The wizard's own status lines (Method, Check, Fine-tune) are untouched — Fine-tune still sits right by the name there, with no Sub-steps or Tips in the way."
    ]
  },
  {
    "v": "0.598",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Understeg finnes nå på alle steg, i alle metoder — Langtidsdeig, Poolish, Biga, Hurtigdeig, Kveldsdeig, Mania-poolish og Ingen elting. Selve steketrinnet (som var det siste, gjentagende hullet) er også dekket nå, for alle pizzatyper og begge ovnstyper."
    ],
    "changes_en": [
      "Sub-steps now exist on every step, in every method — Long-rise dough, Poolish, Biga, Quick dough, Evening dough, Mania poolish and No-knead. The baking step itself (which was the last, recurring gap) is covered now too, for all pizza types and both oven types."
    ]
  },
  {
    "v": "0.597",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant hvorfor \"Prøv understeg\" kunne føles som den ikke gjorde noe: knappen virket helt fint, men Kveldsdeig hadde ennå ikke fått understeg skrevet — bare Langtidsdeig hadde det. Alt falt derfor tilbake til gammel tekst, og ingenting synlig endret seg når du trykket. Kveldsdeig har nå understeg på alle sine steg unntatt selve stekingen."
    ],
    "changes_en": [
      "Found out why \"Try sub-steps\" could feel like it did nothing: the button worked fine, but Evening dough hadn't had its sub-steps written yet — only Long-rise dough had them. So everything fell back to the old text, and nothing visibly changed when you tapped. Evening dough now has sub-steps on all of its steps except the baking itself."
    ]
  },
  {
    "v": "0.596",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant selv at \"📋 Prøv understeg\"-knappen fra forrige versjon var plassert for langt ned — den satt etter statuslinjen, som på mange oppskrifter er høy nok til å skyve knappen under skjermkanten uten at du visste den var der. Den bor nå helt øverst på Tidsplan, ved siden av det lille pizzaikonet, synlig med det samme uten å scrolle."
    ],
    "changes_en": [
      "Noticed ourselves that the \"📋 Try sub-steps\" button from the last version was placed too far down — it sat after the status line, which on many recipes is tall enough to push the button below the edge of the screen without you knowing it was there. It now lives right at the top of the Schedule, next to the little pizza icon, visible immediately without scrolling."
    ]
  },
  {
    "v": "0.595",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny utprøvende knapp på Tidsplan: \"📋 Prøv understeg\". Slår du den på, deles teksten i hvert steg opp i nummererte understeg du kan hake av én etter én, i stedet for ett sammenhengende avsnitt — så langt bygget for Langtidsdeig. Slår du den av igjen er alt akkurat som før, ingenting er borte. Passive steg (som venting i romtemperatur eller kjøleskap) får understeg uten avhaking, siden det ikke er noe å gjøre der.",
      "Avhakingen på understeg er kun lagret i økten så lenge dette utprøves — den blir ikke husket når du laster siden på nytt."
    ],
    "changes_en": [
      "New experimental button on the Schedule: \"📋 Try sub-steps\". Turn it on and the text in each step is broken up into numbered sub-steps you can check off one by one, instead of one continuous paragraph — so far built for Long-rise dough. Turn it back off and everything is exactly as before, nothing is lost. Passive steps (like resting at room temperature or in the fridge) get sub-steps without checkboxes, since there's nothing to do there.",
      "Checking off sub-steps is only saved within the session while this is being tested — it won't be remembered when you reload the page."
    ]
  },
  {
    "v": "0.594",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Hvert steg som bruker målte ingredienser viser nå en liten rad med \"trenger du\"-chips over selve teksten — f.eks. vann, mel, salt og gjær med mengder — så du kan se hva du trenger uten å lese deg gjennom hele avsnittet først. Selve teksten er uendret, mengdene står fortsatt der også.",
      "Gjelder alle metoder — Langtidsdeig, Poolish, Biga, Hurtigdeig, Kveldsdeig, Mania-poolish og Ingen elting — både på mobil og PC."
    ],
    "changes_en": [
      "Every step that uses measured ingredients now shows a small row of \"what you need\" chips above the text itself — e.g. water, flour, salt and yeast with amounts — so you can see what you need without reading through the whole paragraph first. The text itself is unchanged, and the amounts are still there too.",
      "Applies to all methods — Long-rise dough, Poolish, Biga, Quick dough, Evening dough, Mania poolish and No-knead — on both mobile and desktop."
    ]
  },
  {
    "v": "0.593",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet en feil som gjorde at lagring av bakst kunne feile med meldingen \"currentUserName is not defined\". En funksjon for a hente navnet ditt til lagringen ble kalt fire steder, men var aldri skrevet noe sted i koden -- den feilet før selve lagringen i det hele tatt rakk å starte. Lagring av bakst og notater skal nå fungere normalt igjen."
    ],
    "changes_en": [
      "Fixed a bug that made saving a bake fail with the message \"currentUserName is not defined\". A function to fetch your name for the save was called in four places, but was never written anywhere in the code — it failed before the save itself even got a chance to start. Saving bakes and notes should now work normally again."
    ]
  },
  {
    "v": "0.592",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ingen synlig endring i appen denne runden — rendyrket arbeid på test-sikkerhetsnettet bak kulissene. Tre tester feilet når regresjonssuiten kjørte sent på kvelden, fordi de planla bakover fra en dato som ikke lenger ga nok margin mot å havne i fortiden. De søker nå aktivt etter et tidspunkt som faktisk er konfliktfritt, i stedet for å gjette ett fast klokkeslett. Ny delt resetTestState()-hjelper rydder global tilstand mellom tester."
    ],
    "changes_en": [
      "No visible change in the app this round — pure behind-the-scenes work on the test safety net. Three tests failed when the regression suite ran late at night, because they planned backwards from a date that no longer left enough margin against ending up in the past. They now actively search for a time that's genuinely conflict-free, instead of guessing one fixed clock time. A new shared resetTestState() helper cleans up global state between tests."
    ]
  },
  {
    "v": "0.591",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet \"Ikke vis igjen\"-knappen i velkomstguiden på PC — den var mørk med mørk tekst og vanskelig å lese. Årsaken var en reserveverdi i CSS-en som aldri faktisk ble brukt, så knappen alltid endte opp i den mobile, mørke fargen selv på PC. Retter seg nå etter samme lyse/mørke-mekanisme som resten av knappene i appen."
    ],
    "changes_en": [
      "Fixed the \"Don't show again\" button in the welcome guide on desktop — it was dark with dark text and hard to read. The cause was a fallback value in the CSS that was never actually used, so the button always ended up in the mobile, dark color even on desktop. It now follows the same light/dark mechanism as the rest of the app's buttons."
    ]
  },
  {
    "v": "0.590",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Varselet om at et steg havner utenfor tiden du har satt av, eller på natten, har fått en tredje knapp: \"Dette er greit — fortsett likevel\". Noen ganger vet du at du kan ordne deigen på et upassende tidspunkt akkurat denne ene gangen, uten å gå inn og endre pizzatiden din for godt. Trykker du den, blir varselet til en nøytral bekreftelse i stedet for å bare forsvinne — sjekken sier \"Planen holder — med ett godtatt forbehold\" i stedet for å late som ingenting eller late som noe fortsatt står uløst. Et \"Angre\"-alternativ tar deg tilbake til varselet.",
      "Gjelder kun disse to varslene — ikke meltype, overfermentering eller varmt kjøkken, som handler om deigens fysiske grenser og ikke bør kunne \"godtas bort\"."
    ],
    "changes_en": [
      "The warning that a step lands outside the time you've set aside, or during the night, has gained a third button: \"This is fine — continue anyway\". Sometimes you know you can handle the dough at an awkward time just this once, without going in and changing your pizza time for good. Tap it and the warning turns into a neutral confirmation instead of just disappearing — the check says \"The plan holds — with one accepted exception\" rather than pretending nothing happened or pretending something's still unresolved. An \"Undo\" option takes you back to the warning.",
      "Applies only to these two warnings — not flour type, over-fermentation or a warm kitchen, which are about the dough's physical limits and shouldn't be able to be \"accepted away\"."
    ]
  },
  {
    "v": "0.589",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet velkomstskjermen som dukket opp ved ny oppstart med knappene Bruk samme som sist og Åpne favoritten min. Den ga et løfte den ikke helt holdt — den gjenbrukte det meste av forrige oppsett, men ikke tidspunktet du planla for — og hoppet forbi hele wizarden, inkludert sjekken som nå ser over planen din. Favoritten din er fortsatt like lett å finne via Mine deiger. Appen går nå rett til første steg hver gang du starter noe nytt."
    ],
    "changes_en": [
      "Removed the welcome screen that appeared on a fresh start with the buttons \"Use same as last time\" and \"Open my favorite\". It made a promise it didn't quite keep — it reused most of your previous setup, but not the time you'd planned for — and skipped past the whole wizard, including the check that now looks over your plan. Your favorite is still just as easy to find via My doughs. The app now goes straight to the first step every time you start something new."
    ]
  },
  {
    "v": "0.588",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "To navn byttet ut fordi de var for generiske. Fanen som viser tidsplanen din (oppstart, steketid, alle stegene) het bare Steg, rett ved siden av fanen Planlegging — forvirrende likt. Den heter nå Tidsplan. Wizardens siste steg het Holder? i den lille etiketten øverst, mens de to andre etikettene er substantiv — den heter nå Sjekk."
    ],
    "changes_en": [
      "Two names swapped out because they were too generic. The tab that shows your schedule (start, baking time, all the steps) was just called Steps, right next to the Planner tab — confusingly alike. It's now called Schedule. The wizard's last step was called \"Holds?\" in the little label at the top, while the other two labels are nouns — it's now called Check."
    ]
  },
  {
    "v": "0.587",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet en feil som fikk appen til å vise en nesten blank skjerm rett etter forrige oppdatering. En tekstlinje i endringsloggen manglet et avsluttende anførselstegn, noe som stanset all JavaScript fra og med den linjen. Ingen funksjonell endring i appen for øvrig."
    ],
    "changes_en": [
      "Fixed a bug that made the app show a nearly blank screen right after the last update. A line of text in the changelog was missing a closing quotation mark, which stopped all JavaScript from that line onward. No functional change in the app otherwise."
    ]
  },
  {
    "v": "0.586",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Passer godt\"-teksten under metodekortene var ustabil — kunne mangle helt, eller vise et svar som ikke stemte med tiden du faktisk hadde satt av. To årsaker: kortene ble tegnet før datofeltene fikk sin første verdi, så den aller første visningen manglet alltid teksten; og kortene ble aldri tegnet på nytt når du kom inn på Metode-steget, så teksten viste alltid resultatet fra forrige gang et kort ble klikket — ikke det som stemte med datoen du nettopp hadde satt på forrige steg. Metodekortene oppdaterer seg nå hver gang du åpner Metode-steget.\""
    ],
    "changes_en": [
      "The \"Good fit\" text under the method cards was unstable — it could be missing entirely, or show an answer that didn't match the time you'd actually set aside. Two causes: the cards were drawn before the date fields got their first value, so the very first view always lacked the text; and the cards were never redrawn when you entered the Method step, so the text always showed the result from the last time a card was clicked — not what matched the date you'd just set on the previous step. The method cards now refresh every time you open the Method step.\""
    ]
  },
  {
    "v": "0.585",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Steketidspunkt\" og \"Populære tidspunkt for pizza\" i Beta-fanen var to helt uavhengige søk som ikke hadde noe med hverandre å gjøre — et populært tidspunkt skrev til sin egen boks uten å røre feltene over. Nå fyller et klikk på et populært tidspunkt de samme feltene og viser svaret i det samme resultatfeltet som det frie søket bruker. Ett svar om gangen, uansett hvilken vei du kommer inn.",
      "Standarddatoen i det frie søket var alltid \"i dag kl. 19:00\", selv om klokken alt var passert — et forslag som kunne være ugjennomførbart før du rakk å lese det. Den er nå alltid neste gjennomførbare kl. 19:00, i dag eller i morgen."
    ],
    "changes_en": [
      "\"Baking time\" and \"Popular times for pizza\" in the Beta tab were two completely independent searches that had nothing to do with each other — a popular time wrote to its own box without touching the fields above. Now clicking a popular time fills those same fields and shows the answer in the same result field the free search uses. One answer at a time, no matter which way you come in.",
      "The default date in the free search was always \"today at 19:00\", even if that time had already passed — a suggestion that could be impossible before you'd finished reading it. It's now always the next doable 19:00, today or tomorrow."
    ]
  },
  {
    "v": "0.584",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet \"Tidligst mulig\"-linjen under Når vil du spise-spørsmålet på første wizardsteg. Skulle du be om et tidspunkt som ikke går opp, får du i stedet det tydelige varselet fra v5.84 med en ferdig utregnet knapp — det tar seg av akkurat den situasjonen bedre enn en passiv linje gjorde."
    ],
    "changes_en": [
      "Removed the \"Earliest possible\" line under the \"When do you want to eat\" question on the first wizard step. If you ask for a time that doesn't work out, you instead get the clear warning from v5.84 with a ready-calculated button — it handles that exact situation better than a passive line did."
    ]
  },
  {
    "v": "0.583",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Velger du et steketidspunkt som er for tett på, kunne appen regne seg bakover til en oppstart som allerede hadde passert — og vise den uten å si fra. Nå får du et tydelig varsel både i kvalitetssjekken og på Steg-fanen, med en knapp som flytter steketiden til det tidligste tidspunktet som faktisk går, ferdig utregnet for metoden og innstillingene dine.",
      "Beta-fanens søk fikk denne sperren allerede i v5.52 — nå gjelder den også når du planlegger direkte i wizarden."
    ],
    "changes_en": [
      "If you picked a baking time that was too close, the app could calculate its way back to a start time that had already passed — and show it without telling you. Now you get a clear warning both in the quality check and on the Steps tab, with a button that moves the baking time to the earliest slot that actually works, fully calculated for your method and settings.",
      "The Beta tab's search got this guard back in v5.52 — now it also applies when you plan directly in the wizard."
    ]
  },
  {
    "v": "0.582",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Spørsmålet om når er nå to ærlige valg: \"Planlagt steketid\" med dato og klokkeslett, eller \"Jeg begynner nå\" — der planlegges deigen fra nå, og steketiden regnes ut for deg. Datofeltene på nå-grenen er fjernet: de har en stund vært uten funksjon (appen brukte alltid nå-tidspunktet uansett hva du skrev), så de sto der og så redigerbare ut uten å være det.",
      "\"Tidligst mulig\"-hintet og metodekortenes passform regnes nå ut av den samme motoren som bygger selve tidsplanen, for alle seks metoder. Før brukte de en egen forenklet formel som manglet Kveldsdeig og Mania-poolish — begge fremsto derfor som klare umiddelbart, og Kveldsdeig-kortet sa \"passer godt\" selv når du ville spise om en time.",
      "Overskriften på spørsmålet følger nå valget ditt med en gang du trykker, i stedet for først neste gang du kom inn på steget."
    ],
    "changes_en": [
      "The \"when\" question is now two honest choices: \"Scheduled baking time\" with a date and time, or \"I'm starting now\" — where the dough is planned from now and the baking time is calculated for you. The date fields on the now branch are gone: they've been non-functional for a while (the app always used the current time no matter what you typed), so they sat there looking editable without actually being editable.",
      "The \"Earliest possible\" hint and the method cards' fit are now calculated by the same engine that builds the actual schedule, for all six methods. Before, they used a separate simplified formula that was missing Evening dough and Mania poolish — so both looked ready immediately, and the Evening dough card said \"good fit\" even when you wanted to eat in an hour.",
      "The question's heading now follows your choice the moment you tap, instead of only the next time you came back to the step."
    ]
  },
  {
    "v": "0.581",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Spørsmålet om når du vil spise sto med samme overskrift to ganger på første wizardsteg. Den ene er borte."
    ],
    "changes_en": [
      "The question about when you want to eat showed the same heading twice on the first wizard step. One is gone."
    ]
  },
  {
    "v": "0.580",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Finjuster er ikke lenger et eget steg i wizarden. Den nås nå derfra du oppdager at du trenger den: hvert varsel i kvalitetssjekken har fått en \"Se i Finjuster\"-lenke som tar deg rett til spaken som hører til akkurat det problemet — hydreringen for melvarselet, kjøleskapstiden for lang gjæring, romtemperaturen for varmt kjøkken. ⚙️ Juster øverst i statuslinjen åpner Finjuster som før.",
      "Wizarden er dermed tre steg igjen: Pizza, Metode, Holder? Rekkefølgen var blitt bakvendt — du finjusterte før du fikk vite om det var noe å finjustere.",
      "Både knappen og et dra til siden tar deg tilbake til sjekken du kom fra når du er ferdig i Finjuster."
    ],
    "changes_en": [
      "Fine-tune is no longer a separate step in the wizard. You now reach it from wherever you discover you need it: every warning in the quality check has a \"See in Fine-tune\" link that takes you straight to the slider tied to that exact problem — hydration for the flour warning, fridge time for a long ferment, room temperature for a warm kitchen. ⚙️ Adjust at the top of the status bar opens Fine-tune as before.",
      "That leaves the wizard at three steps: Pizza, Method, Ready? The order had gotten backwards — you fine-tuned before you knew whether there was anything to fine-tune.",
      "Both the button and a swipe to the side take you back to the check you came from when you're done in Fine-tune."
    ]
  },
  {
    "v": "0.579",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kvalitetssjekken på siste wizardsteg sjekker nå også deigen, ikke bare tidene. Passer ikke melet til gjæringstiden, er hydreringen utenfor det melet tåler, blir gjæringen så lang at deigen kan bryte sammen, eller er kjøkkenet for varmt for hurtigdeigen — så står det der, sammen med tidskonfliktene. Står alt riktig, sier den fortsatt fra om det.",
      "Grunnen til at de hører hjemme akkurat der: inne i wizarden er det ett swipe tilbake til spaken som fikser problemet. Fra Steg-fanen måtte du bytte fane og lete.",
      "Er det flere ting å se på, teller sjekken dem opp øverst. Og et varsel du har trykket bort med krysset dukker likevel opp i sjekken — der har du nettopp bedt om dommen, så der holder vi ikke noe tilbake."
    ],
    "changes_en": [
      "The quality check on the last wizard step now checks the dough too, not just the timing. If the flour doesn't suit the ferment time, the hydration is beyond what that flour can handle, the ferment gets so long the dough might collapse, or the kitchen is too warm for the quick dough — it says so, right alongside the timing conflicts. If everything's right, it still tells you that.",
      "Why they belong right there: inside the wizard it's one swipe back to the slider that fixes the problem. From the Steps tab you had to switch tabs and go hunting.",
      "If there's more than one thing to look at, the check counts them up at the top. And a warning you dismissed with the X still shows up in the check — you just asked for the verdict, so we hold nothing back."
    ]
  },
  {
    "v": "0.578",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet den lille meldingen som spratt opp øverst på skjermen hver gang du byttet pizzatype. Den var morsom én gang og i veien de neste tjue."
    ],
    "changes_en": [
      "Removed the little message that popped up at the top of the screen every time you switched pizza type. It was fun once and in the way the next twenty times."
    ]
  },
  {
    "v": "0.577",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Wizarden er bygget om til fire steg. Antall pizzaer og når du vil spise er flyttet opp til første steg, sammen med pizzatypen — det er tingene du allerede vet når du bestemmer deg for å lage pizza. Viktigere: metodevalget avhenger av hvor mye tid du har, og nå vet appen det før du velger. Metodekortene sier derfor selv om de passer, i stedet for at du får en advarsel etterpå.",
      "Finjuster er nå et vanlig steg i rekken i stedet for en sidedør, så du kan bla forbi den eller innom den som du vil.",
      "Siste steg er nytt: en kvalitetssjekk som svarer på om planen holder. Står alt riktig, sier den fra om det — appen har hittil bare snakket når noe var galt. Kolliderer et steg med tiden du har satt av, viser den den utregnede fiksen, og er planen låst fast sier den det rett ut og foreslår en annen metode.",
      "Du kan nå dra til siden for å bla mellom stegene i wizarden, i tillegg til knappene og stegprikkene. Sliderne i Finjuster virker som før — et dra som starter på en slider stiller slideren, det bytter ikke steg."
    ],
    "changes_en": [
      "The wizard is rebuilt into four steps. The number of pizzas and when you want to eat have moved up to the first step, together with the pizza type — those are the things you already know when you decide to make pizza. More importantly: the method choice depends on how much time you have, and now the app knows that before you choose. So the method cards say for themselves whether they fit, instead of you getting a warning afterward.",
      "Fine-tune is now a regular step in the sequence instead of a side door, so you can page past it or into it as you like.",
      "The last step is new: a quality check that answers whether the plan holds up. If everything's right, it says so — until now the app only spoke up when something was wrong. If a step collides with the time you've set aside, it shows the calculated fix, and if the plan is locked solid it says so outright and suggests a different method.",
      "You can now swipe to the side to page between the wizard steps, in addition to the buttons and step dots. The sliders in Fine-tune work as before — a drag that starts on a slider adjusts the slider, it doesn't change steps."
    ]
  },
  {
    "v": "0.576",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Knappene i varslene som sender deg et annet sted — \"Rediger pizzatiden din\", \"Juster kjøleskapstid\", \"Se i Finjuster\", \"Se i Metode\" — var enveisdører. Du landet et sted, endret noe, og fikk aldri vite om problemet du kom for å løse faktisk ble borte. Nå dukker det opp en linje nederst på skjermen du ble sendt til, med en vei tilbake dit du kom fra.",
      "Linjen svarer mens du redigerer. Justerer du pizzatiden til at steget passer, sier den fra med det samme at alle steg ligger innenfor — du trenger ikke gå ut og inn for å sjekke. Står konflikten fortsatt, sier den hvilket steg det gjelder og når. Linjen vises bare når du faktisk ble sendt dit av et varsel, og forsvinner så snart du navigerer videre på egen hånd."
    ],
    "changes_en": [
      "The buttons in the warnings that send you elsewhere — \"Edit your pizza time\", \"Adjust fridge time\", \"See in Fine-tune\", \"See in Method\" — were one-way doors. You landed somewhere, changed something, and never found out whether the problem you came to solve actually went away. Now a line appears at the bottom of the screen you were sent to, with a way back to where you came from.",
      "The line responds while you edit. Adjust the pizza time so the step fits, and it tells you right away that all steps are within range — you don't need to go out and back in to check. If the conflict remains, it says which step it's about and when. The line only shows when you were actually sent there by a warning, and disappears as soon as you navigate on somewhere on your own."
    ]
  },
  {
    "v": "0.575",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at varselet om opptatt tid ble hengende med gammelt svar når du endret pizzatiden din i Beta-fanen. Redigeringen lagret riktig, men planen ble aldri regnet ut på nytt, så varselet svarte på tilstanden fra før endringen. Nå oppdaterer planen seg med en gang du endrer et tidspunkt.",
      "I tillegg regnes planen alltid ut på nytt når du går inn på Steg-fanen. Det er en generell sikring: ingen endring gjort i en annen fane skal kunne etterlate et varsel som svarer på gammel tilstand.",
      "Et halvferdig tidsrom midt i redigeringen — der du har fylt inn \"fra\" men ikke \"til\" ennå — teller ikke lenger som en gyldig periode."
    ],
    "changes_en": [
      "Fixed the busy-time warning getting stuck with an old answer when you changed your pizza time in the Beta tab. The edit saved correctly, but the plan was never recalculated, so the warning was answering the state from before the change. Now the plan updates the moment you change a time.",
      "On top of that, the plan is always recalculated when you enter the Steps tab. It's a general safeguard: no change made in another tab should be able to leave a warning answering an old state.",
      "A half-finished time range mid-edit — where you've filled in \"from\" but not \"to\" yet — no longer counts as a valid period."
    ]
  },
  {
    "v": "0.574",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Varselet om at et steg havner på et dårlig tidspunkt tilbyr nå bare knapper som faktisk kan løse akkurat det problemet. Tidligere fikk du \"Juster kjøleskapstid\" uansett — men steg som \"Ta ut av kjøleskap\" ligger fast fire timer før steking, så kjøleskapstiden kan ikke flytte dem i det hele tatt når du planlegger bakover fra et måltid. Du kunne justere så mye du ville uten at varselet forsvant.",
      "I stedet regner appen ut hvor mye du må flytte måltidet for at hele planen skal gå opp, og tilbyr det ferdig: \"Spis tir 20:00 i stedet\" — med en forklaring av hva det gjør med steget som kolliderte. Finnes det ingen spisetid som fungerer, sier varselet det rett ut i stedet for å tilby knapper som ikke virker, og peker mot en metode med kortere temperering."
    ],
    "changes_en": [
      "The warning that a step lands at a bad time now only offers buttons that can actually solve that particular problem. Before, you got \"Adjust fridge time\" regardless — but steps like \"Take out of fridge\" sit fixed four hours before baking, so fridge time can't move them at all when you're planning backward from a meal. You could adjust all you wanted without the warning going away.",
      "Instead, the app calculates how much you need to move the meal for the whole plan to work out, and offers it ready-made: \"Eat Tue 20:00 instead\" — with an explanation of what that does to the step that collided. If there's no meal time that works, the warning says so outright instead of offering buttons that don't work, and points toward a method with shorter tempering."
    ]
  },
  {
    "v": "0.573",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Alle varsler har fått et kryss oppe i høyre hjørne som skjuler varselet for denne gangen. Det gjelder også nattevarselet — unntak finnes, du kan være våken uansett, eller ha lagt opp til det med vilje for smakens skyld.",
      "Krysset husker den konkrete konflikten, ikke varseltypen. Skjuler du \"Ta ut av kjøleskap tir 14:00\" og siden endrer noe slik at problemet flytter seg til et annet tidspunkt, dukker varselet opp igjen — men et uendret problem forblir skjult. Ingenting lagres: \"denne gangen\" varer til du laster appen på nytt."
    ],
    "changes_en": [
      "Every warning has gotten an X in the top right corner that hides the warning for this time. That includes the night warning — exceptions exist, you might be up anyway, or have planned it that way on purpose for the flavor.",
      "The X remembers the specific conflict, not the warning type. Hide \"Take out of fridge Tue 14:00\" and then change something so the problem moves to a different time, and the warning comes back — but an unchanged problem stays hidden. Nothing is saved: \"this time\" lasts until you reload the app."
    ]
  },
  {
    "v": "0.572",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Varselet \"Et steg havner i arbeidstiden din\" bygger nå på din egen Pizzatid fra Beta-fanen i stedet for en fast antakelse om at alle jobber mandag til fredag 08–16. Setter du opp når du faktisk er ledig, følger varselet det — og varselet har fått en knapp rett inn til redigeringen. Pizzatiden lagres per bruker på serveren, så den følger deg mellom telefon og PC.",
      "Rydding under panseret: appen hadde tre uavhengige oppfatninger av når du er ledig — varselets hardkodede 08–16, \"Mine faste tidspunkter\" sitt eget hardkodede sett, og Pizzatid. Nå er Pizzatid eneste kilde for alle tre. Standardverdiene er de samme tallene som før, så ingenting endrer seg for deg før du selv redigerer timeplanen. Nattevarselet (23–06) er fortsatt en universell regel."
    ],
    "changes_en": [
      "The \"A step lands in your working hours\" warning is now based on your own Pizza time from the Beta tab instead of a fixed assumption that everyone works Monday to Friday 08–16. Set up when you're actually free, and the warning follows it — and the warning has gotten a button straight into the editor. Pizza time is saved per user on the server, so it follows you between phone and PC.",
      "Cleanup under the hood: the app had three independent notions of when you're free — the warning's hardcoded 08–16, \"My fixed times\" with its own hardcoded set, and Pizza time. Now Pizza time is the only source for all three. The default values are the same numbers as before, so nothing changes for you until you edit the schedule yourself. The night warning (23–06) is still a universal rule."
    ]
  },
  {
    "v": "0.571",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet \"Da starter du: …\"-linjen under Kjøleskapsheving på Når?-steget, og under Poolish- og Biga-varigheten på Metode-steget. Etter at kjøleskapsblokken ble flyttet opp i v5.71 gjentok den bare oppstartstidspunktet statuslinjen viser noen linjer over.",
      "I stedet viser statuslinjen nå hvor mye oppstart flyttet seg når du justerer kjøleskapstid, poolish-varighet eller biga-varighet — en liten brikke ved siden av oppstartstidspunktet som sier f.eks. \"6 t tidligere\". Den forsvinner av seg selv etter noen sekunder. Trykker du flere ganger raskt etter hverandre summeres differansen mot der du startet, i stedet for å vise ett steg om gangen."
    ],
    "changes_en": [
      "Removed the \"So you start: …\" line under Fridge proofing on the When? step, and under the Poolish and Biga duration on the Method step. After the fridge block was moved up in v5.71, it just repeated the start time the status bar shows a few lines above.",
      "Instead, the status bar now shows how much the start moved when you adjust fridge time, poolish duration, or biga duration — a little chip next to the start time that says, e.g., \"6 h earlier\". It disappears on its own after a few seconds. Tap several times in quick succession and the difference is summed from where you started, instead of showing one step at a time."
    ]
  },
  {
    "v": "0.570",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kjøleskapshevingen på wizardens Når?-steg er flyttet opp og ligger nå rett under statuslinjen med oppstart og steketid, i stedet for nederst på siden. Kjøleskapstiden er den enkeltinnstillingen som flytter oppstartstidspunktet mest, og nå står årsak og virkning ved siden av hverandre. Blokken skjules fortsatt automatisk for Hurtigdeig og Kveldsdeig, som ikke har noen kjølefase.",
      "Fjernet forklaringsteksten \"⚙️ Juster åpner flere valg: mel, gjærtype, meltype osv.\" under statuslinjen på samme steg — den leste rart løsrevet fra lenken den opprinnelig hørte til (fjernet i v5.67)."
    ],
    "changes_en": [
      "The fridge proofing on the wizard's When? step has moved up and now sits right under the status bar with the start and baking time, instead of at the bottom of the page. Fridge time is the single setting that moves the start time the most, and now cause and effect sit side by side. The block still hides automatically for Quick dough and Evening dough, which have no chilling phase.",
      "Removed the explanatory text \"⚙️ Adjust opens more choices: flour, yeast type, flour type, etc.\" under the status bar on that step — it read oddly detached from the link it originally belonged to (removed in v5.67)."
    ]
  },
  {
    "v": "0.569",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny dynamisk \"hvorfor\"-boks under metodevalg-kortene på wizardens Metode-steg — viser en kort forklaring av hvorfor du velger den metoden du har trykket på, i stedet for kun den korte strukturbeskrivelsen kortet selv har. Poolish og Biga gjenbruker de allerede eksisterende forklaringstekstene fra Steg-visningen; Langtidsdeig, Hurtigdeig, Kveldsdeig og Mania-poolish har fått nye korte tekster i samme stil."
    ],
    "changes_en": [
      "New dynamic \"why\" box under the method-choice cards on the wizard's Method step — shows a short explanation of why you'd pick the method you've tapped, instead of only the brief structure description the card itself has. Poolish and Biga reuse the existing explanations from the Steps view; Long-ferment dough, Quick dough, Evening dough and Mania poolish have gotten new short texts in the same style."
    ]
  },
  {
    "v": "0.568",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Lagt til ±-knapper ved siden av alle fire sliderne i Finjuster (Melmengde, Hydrering, Kjøleskapsheving, Romtemperatur) — native slidere er vanskelige å treffe presist på mobil. Slideren selv er uendret og virker som før; knappene gir et nøyaktig ett-steg samtidig."
    ],
    "changes_en": [
      "Added ± buttons next to all four sliders in Fine-tune (Flour amount, Hydration, Fridge proofing, Room temperature) — native sliders are hard to hit precisely on mobile. The slider itself is unchanged and works as before; the buttons give you an exact single step."
    ]
  },
  {
    "v": "0.567",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet \"🌙 Maks smak\"-boksen på wizardens steg 3. Den var kun en snarvei til ett bestemt tall — ikke en sikkerhetsmekanisme, siden det uavhengige varselsystemet for gjæringstid uansett fanger opp for lang eller kort kjøletid. ±-steppen for kjøleskapstid er uendret og fortsatt der."
    ],
    "changes_en": [
      "Removed the \"🌙 Max flavor\" box on wizard step 3. It was just a shortcut to one particular number — not a safety mechanism, since the independent warning system for ferment time catches too long or too short a chill anyway. The ± stepper for fridge time is unchanged and still there."
    ]
  },
  {
    "v": "0.566",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet den overflødige lenken \"⚙️ Finjuster (mel, gjærtype, meltype osv.)\" nederst på wizardens steg 3 — den gjorde nøyaktig det samme som \"⚙️ Juster\"-knappen i statuslinjen øverst på samme skjerm. Forklaringsteksten \"mel, gjærtype, meltype osv.\" er flyttet opp som en liten undertekst under Juster-knappen, kun synlig på steg 3."
    ],
    "changes_en": [
      "Removed the redundant \"⚙️ Fine-tune (flour, yeast type, flour type, etc.)\" link at the bottom of wizard step 3 — it did exactly the same thing as the \"⚙️ Adjust\" button in the status bar at the top of the same screen. The explanatory text \"flour, yeast type, flour type, etc.\" has moved up as a small subtext under the Adjust button, only visible on step 3."
    ]
  },
  {
    "v": "0.565",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Metoden \"Standard\" heter nå \"Langtidsdeig\" overalt i appen (PC og mobil) — fullfører et tidsbasert navnesystem sammen med Hurtigdeig og Kveldsdeig. Kun visningsnavnet er endret; ingenting i lagrede bakster eller egen logikk er rørt."
    ],
    "changes_en": [
      "The \"Standard\" method is now called \"Long-ferment dough\" everywhere in the app (PC and mobile) — completing a time-based naming system together with Quick dough and Evening dough. Only the display name has changed; nothing in saved bakes or the logic itself has been touched."
    ]
  },
  {
    "v": "0.564",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Tre tekstrettelser: stegtittelen \"Kjøleskapsheiving\" var en skrivefeil for \"Kjøleskapsheving\" (Standard/Poolish/Biga). \"klede tørker ut overflaten\" rettet til \"kluter\" (to steder, Standard og Kveldsdeig). Den kopierte tidsplanens toppfelt viste \"Kjøleskapsheving: X timer\" for Standard/Poolish/Biga, men det tallet inkluderer også 4 timers fast romtemperering og formingstid — ikke ren kjøletid. Endret til \"Total heving: X timer\" for å stemme med hva tallet faktisk er. Kveldsdeigs tilsvarende linje var allerede riktig (der er hele tallet ren kjøletid) og er ikke endret."
    ],
    "changes_en": [
      "Three text fixes: the step title \"Kjøleskapsheiving\" was a typo for \"Kjøleskapsheving\" (fridge rise) (Standard/Poolish/Biga). \"cloth dries out the surface\" corrected to \"cloths\" (two places, Standard and Evening dough). The copied schedule's header showed \"Fridge rise: X hours\" for Standard/Poolish/Biga, but that number also includes 4 hours of fixed room-temperature resting and shaping time — not pure fridge time. Changed to \"Total rise: X hours\" to match what the number actually is. Evening dough's equivalent line was already correct (there the whole number is pure fridge time) and is unchanged."
    ]
  },
  {
    "v": "0.563",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Stegpunktene øverst i wizarden (Pizzatype → Metode → Når?) kan nå klikkes både fram og tilbake — tidligere var det kun mulig å hoppe tilbake til steg du allerede hadde vært innom. Ikke-besøkte steg vises fortsatt med tall (ikke hake), men får nå en tynn aksentkant som viser at de er klikkbare."
    ],
    "changes_en": [
      "The step markers at the top of the wizard (Pizza type → Method → When?) can now be clicked both forward and back — previously you could only jump back to steps you'd already visited. Unvisited steps still show a number (not a checkmark), but now get a thin accent border showing they're clickable."
    ]
  },
  {
    "v": "0.562",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Oppskriftsvisningen for Hurtigdeig og Kveldsdeig på mobil manglet radene for Romtemperatur og Ovntype som PC alltid har hatt — lagt til slik at PC og mobil viser nøyaktig samme informasjon. Kveldsdeig på mobil brukte også en kortere tekst (\"Kjøleskap\"/\"10t\") enn PC (\"Kjøleskapsheving\"/\"10 timer\") — nå samme ordlyd begge steder. Ny testtype (pc_mobil_1to1_*) sjekker fra nå av at PC og mobil er innholdsmessig identiske for alle tre metodene, ikke bare at hver plattform er intern-konsistent."
    ],
    "changes_en": [
      "The recipe view for Quick dough and Evening dough on mobile was missing the Room temperature and Oven type rows that desktop has always had — added so desktop and mobile show exactly the same information. Evening dough on mobile also used shorter text (\"Fridge\"/\"10h\") than desktop (\"Fridge rise\"/\"10 hours\") — now the same wording in both places. A new test type (pc_mobil_1to1_*) now checks that desktop and mobile are content-identical for all three methods, not just that each platform is internally consistent."
    ]
  },
  {
    "v": "0.561",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Arkitekturtiltak (ingen synlig endring): de 8 stedene i koden som bygde opp ingredienslisten (Mel/Vann/Salt/olje/smør/sukker/Gjær) hver for seg — for både PC og mobil, på tvers av Standard/Hurtigdeig/Kveldsdeig — er samlet i én felles funksjon (baseIngredientRows). De to nesten-identiske rendringsfunksjonene for oppskriftsradene (én for PC, én for mobil) er slått sammen til én. Ny regresjonstest fryser nå også selve HTML-utdataen fra dette laget, som tidligere ikke var testdekket."
    ],
    "changes_en": [
      "Architecture work (no visible change): the 8 places in the code that built the ingredient list (Flour/Water/Salt/oil/butter/sugar/Yeast) separately — for both desktop and mobile, across Standard/Quick dough/Evening dough — are now consolidated into one shared function (baseIngredientRows). The two nearly-identical rendering functions for the recipe rows (one for desktop, one for mobile) have been merged into one. A new regression test now also freezes the actual HTML output from this layer, which previously wasn't test-covered."
    ]
  },
  {
    "v": "0.560",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Arkitekturtiltak (ingen synlig endring): Endringsloggen (denne listen) er flyttet ut av index.html og inn i en egen fil, changelog.js. Reduserer hovedfilens størrelse med ca. 15% og gjør fremtidige endringer i selve appen billigere å jobbe med."
    ],
    "changes_en": [
      "Architecture work (no visible change): The changelog (this list) has been moved out of index.html and into its own file, changelog.js. Reduces the main file's size by about 15% and makes future changes to the app itself cheaper to work with."
    ]
  },
  {
    "v": "0.559",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rullet ut valg-vs-handling-skillet fra Finjuster-testen (v5.55) til resten av wizarden: Pizzatype-pillene og Metode-kortene bruker nå samme omriss+hake for valgt alternativ, og begge \"Neste\"-knappene bruker samme dempede farge som de andre \"gå videre\"-knappene. Metodekortenes egen fargefremheving for Hurtigdeig/Kveldsdeig er fjernet til fordel for ett enhetlig valgspråk overalt."
    ],
    "changes_en": [
      "Rolled out the selection-vs-action distinction from the Fine-tune test (v5.55) to the rest of the wizard: the Pizza type pills and Method cards now use the same outline+checkmark for the selected option, and both \"Next\" buttons use the same muted color as the other \"continue\" buttons. The Method cards' own color highlight for Quick dough/Evening dough has been removed in favor of one consistent selection language everywhere."
    ]
  },
  {
    "v": "0.558",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet den pulserende prikken over \"Steg\" i bunnmenyen — den var ment å dytte deg mot Steg-fanen for å se konsekvensen av en endring, men det gjør deig-statuslinjen i wizarden allerede (oppstart/steketid vises der du står, uten å bytte fane). Overflødig nå, ryddet bort sammen med tilhørende kode."
    ],
    "changes_en": [
      "Removed the pulsing dot over \"Steps\" in the bottom menu — it was meant to nudge you toward the Steps tab to see the effect of a change, but the dough status bar in the wizard already does that (start/bake time show right where you are, without switching tabs). Redundant now, cleaned up along with its related code."
    ]
  },
  {
    "v": "0.557",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet den sticky Kopier/Kalender/Lagre-baren (som av og til roter til skjermen) og lagt de tre handlingene inn i deig-statuslinjen i stedet — vanlig plassert, ikke sticky. Alle tre likestilt, ingen fremhevet fremfor de andre. Ryddet samtidig bort en del gammel, skjør JavaScript-logikk som fantes bare for å holde den forrige sticky-baren riktig plassert."
    ],
    "changes_en": [
      "Removed the sticky Copy/Calendar/Save bar (which sometimes cluttered the screen) and put the three actions into the dough status bar instead — placed normally, not sticky. All three treated equally, none highlighted over the others. At the same time cleaned up some old, fragile JavaScript logic that existed only to keep the previous sticky bar correctly positioned."
    ]
  },
  {
    "v": "0.556",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Deiger-fanen (lagrede oppskrifter) fikk samme fargepalette som resten av appen — kortene brukte fortsatt hardkodede lyse farger (hvit bakgrunn, lyse rammer) fra før Forno-restylingen, i stedet for de delte tokenene alt annet bruker. Bakgrunn, rammer og dempet tekst matcher nå riktig i mørk modus."
    ],
    "changes_en": [
      "The Doughs tab (saved recipes) got the same color palette as the rest of the app — the cards still used hardcoded light colors (white background, light borders) from before the Forno restyling, instead of the shared tokens everything else uses. Background, borders, and muted text now match correctly in dark mode."
    ]
  },
  {
    "v": "0.555",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Pizzatid\" i Beta-fanen starter nå minimert (skjult som standard) — trykk \"Vis\" for å åpne de syv dagene med ledig tid. Mindre å scrolle forbi hver gang du bare vil sjekke Steketidspunkt eller Populære tidspunkt."
    ],
    "changes_en": [
      "\"Pizza time\" in the Beta tab now starts minimized (hidden by default) — tap \"Show\" to open the seven days of free time. Less to scroll past every time you just want to check Bake time or Popular times."
    ]
  },
  {
    "v": "0.554",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Testrunde av valg-vs-handling-skillet (Skisse A) på Finjuster sine Gjærtype/Kjøkkenmaskin/Ovntype-grupper: valgt alternativ vises nå med tykt omriss + liten hake i stedet for fylt bakgrunn. De to \"gå videre\"-knappene (\"Se steg for steg →\" og \"Ferdig\") bruker nå en dempet, mørkere oransje i stedet for den vanlige aksentfargen, for å skille handling fra valg. Lagt til (klar, men ikke synlig i praksis siden alle felt har standardverdi): en advarselsramme + \"Velg én\"-tekst rundt en gruppe hvis ingenting er valgt."
    ],
    "changes_en": [
      "Test round of the selection-vs-action distinction (Sketch A) on Fine-tune's Yeast type/Stand mixer/Oven type groups: the selected option now shows with a thick outline + small checkmark instead of a filled background. The two \"continue\" buttons (\"See step by step →\" and \"Done\") now use a muted, darker orange instead of the usual accent color, to separate action from selection. Added (ready, but not visible in practice since every field has a default value): a warning border + \"Pick one\" text around a group if nothing is selected."
    ]
  },
  {
    "v": "0.553",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Deig-statuslinjen (oppstart + steketid) er nå også synlig i wizardens Metode-steg, Planlegging-steg og Finjuster — ikke bare i Steg-fanen. Oppdateres live idet du justerer noe, slik at du ser konsekvensen med en gang i stedet for å måtte bytte fane."
    ],
    "changes_en": [
      "The dough status bar (start + bake time) is now also visible in the wizard's Method step, Planner step, and Fine-tune — not just in the Steps tab. Updates live as you adjust something, so you see the effect right away instead of having to switch tabs."
    ]
  },
  {
    "v": "0.552",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny deig-statuslinje øverst i Steg-fanen: viser pizzatype/metode, 🚀 oppstartstid og 🍕 steketid for oppsettet du jobber med — samme mønster som Beta-fanens kort. Oppdateres live når du endrer noe.",
      "Fast \"⚙️ Juster\"-knapp i statuslinjen som tar deg rett til Finjuster, med en \"Se steg →\"-knapp der for å hoppe rett tilbake — en tydelig juster-og-prøv-sløyfe mellom Steg og innstillingene.",
      "Liten orienteringshjelp i wizarden: \"Gå fritt frem og tilbake — Steg-fanen viser alltid planen for gjeldende valg.\""
    ],
    "changes_en": [
      "New dough status bar at the top of the Steps tab: shows pizza type/method, 🚀 start time and 🍕 bake time for the setup you're working on — same pattern as the Beta tab's cards. Updates live when you change something.",
      "A fixed \"⚙️ Adjust\" button in the status bar that takes you straight to Fine-tune, with a \"See steps →\" button there to jump right back — a clear adjust-and-try loop between Steps and the settings.",
      "A little orientation tip in the wizard: \"Move freely back and forth — the Steps tab always shows the plan for your current choices.\""
    ]
  },
  {
    "v": "0.551",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at Beta-fanens søk kunne foreslå en oppskrift som krevde oppstart FØR akkurat nå — matematisk \"riktig\" ut fra reglene, men umulig å faktisk følge. Søket prioriterer nå alltid kombinasjoner du faktisk rekker å starte, og faller kun tilbake til de umulige (med en tydelig advarsel) hvis absolutt ingenting annet finnes."
    ],
    "changes_en": [
      "Fixed the Beta tab's search suggesting a recipe that required starting BEFORE right now — mathematically \"correct\" per the rules, but impossible to actually follow. The search now always prioritizes combinations you can actually still start, and only falls back to the impossible ones (with a clear warning) if nothing else exists at all."
    ]
  },
  {
    "v": "0.550",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Faste tider\" i Beta-fanen døpt om til \"Populære tidspunkt for pizza\", med en tydelig visuell strek mot \"Steketidspunkt\"-søket over. Hvert resultat viser nå både 🚀 oppstartstid og 🍕 planlagt steketid direkte i kortet, i stedet for at du må trykke \"Bruk denne\" og hoppe til Steg-fanen for å se det."
    ],
    "changes_en": [
      "\"Fixed times\" in the Beta tab renamed to \"Popular times for pizza\", with a clear visual divider from the \"Bake time\" search above. Each result now shows both 🚀 start time and 🍕 planned bake time directly in the card, instead of you having to tap \"Use this\" and jump to the Steps tab to see it."
    ]
  },
  {
    "v": "0.549",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Døpt om \"Egen tid\" til \"Steketidspunkt\" i Beta-fanen — tydeligere navn, matcher terminologien appen allerede bruker andre steder."
    ],
    "changes_en": [
      "Renamed \"Custom time\" to \"Bake time\" in the Beta tab — a clearer name that matches the terminology the app already uses elsewhere."
    ]
  },
  {
    "v": "0.548",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant den faktiske årsaken til at \"Finn oppskrift\" i Beta-fanen så ut til å ikke gjøre noe: resultatet vises ikke lenger nederst under hele \"Faste tider\"-listen (fem kort du måtte scrolle forbi) — det vises nå rett under selve knappen, og scrolles automatisk inn i synsfeltet."
    ],
    "changes_en": [
      "Found the real reason \"Find recipe\" in the Beta tab looked like it did nothing: the result no longer appears at the bottom below the entire \"Fixed times\" list (five cards you had to scroll past) — it now shows right under the button itself, and scrolls automatically into view."
    ]
  },
  {
    "v": "0.547",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Beta-fanens \"Finn oppskrift\"-knapp kunne feile stille (ingenting synlig skjedde) hvis datofeltet var tomt/ugyldig, eller hvis noe uventet gikk galt under selve søket. Viser nå alltid en tydelig tilbakemelding — \"Sett en dato først\", \"Ugyldig dato/klokkeslett\", eller en feilmelding hvis søket faktisk krasjer — i stedet for å bare ikke gjøre noe. Samme robusthet lagt til for \"Faste tider\"-listen."
    ],
    "changes_en": [
      "The Beta tab's \"Find recipe\" button could fail silently (nothing visible happened) if the date field was empty/invalid, or if something unexpected went wrong during the search itself. It now always shows clear feedback — \"Set a date first\", \"Invalid date/time\", or an error message if the search actually crashes — instead of just doing nothing. The same robustness was added for the \"Fixed times\" list."
    ]
  },
  {
    "v": "0.546",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny fane: 🧭 Beta — \"omvendt planlegger\". I stedet for å velge innstillinger og se når du må starte, oppgir du når du er ledig og når du vil spise, og får en anbefalt oppskrift tilbake. Søker på tvers av ALLE metoder (Standard, Poolish begge varianter, Biga, Mania-poolish, Hurtigdeig, Kveldsdeig) — ikke bare Poolish/Biga.",
      "\"Pizzatid\": din ukentlige ledige tid, mandag–søndag, med inntil to perioder per dag. Lagres delt på tvers av enheter (ny backend-funksjon pizzatid.js), ikke bare i denne nettleseren.",
      "\"Egen tid\": fritt spisetidspunkt, én søkeknapp. \"Faste tider\" (de fem tidligere målene) er flyttet hit fra Planlegging-steget, ikke duplisert.",
      "Resultatet viser toppanbefaling direkte (rangert på færrest tidskonflikter, deretter lengst trygg gjæring som \"best smak\"), med en \"se flere alternativer\"-lenke som åpner de neste to. Viser også ærlig hvilke meltyper som faktisk tåler den anbefalte gjæringstiden — eller sier rett ut hvis ingen gjør det.",
      "PC fikk en enkel lenke inn til samme fane (via ☰ Meny → \"Finn oppskrift (Beta)\"), som bytter til mobilvisning."
    ],
    "changes_en": [
      "New tab: 🧭 Beta — a \"reverse planner\". Instead of picking settings and seeing when you have to start, you enter when you're free and when you want to eat, and get a recommended recipe back. It searches across ALL methods (Standard, Poolish both variants, Biga, Mania poolish, Quick dough, Evening dough) — not just Poolish/Biga.",
      "\"Pizza time\": your weekly free time, Monday–Sunday, with up to two periods per day. Saved shared across devices (new backend function pizzatid.js), not just in this browser.",
      "\"Custom time\": a freely chosen eating time, one search button. \"Fixed times\" (the five previous targets) has been moved here from the Planner step, not duplicated.",
      "The result shows the top recommendation directly (ranked by fewest time conflicts, then longest safe fermentation as \"best flavor\"), with a \"see more options\" link that opens the next two. It also honestly shows which flour types can actually handle the recommended fermentation time — or says outright if none can.",
      "Desktop got a simple link into the same tab (via ☰ Menu → \"Find recipe (Beta)\"), which switches to mobile view."
    ]
  },
  {
    "v": "0.545",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny metode: Mania-poolish (oppkalt etter Pizzamania, kilden til oppskriften) — et eget metodekort ved siden av Poolish/Biga. Strukturelt annerledes enn de andre: poolish gjæres 12t romtemperatur og kjøles ned FØR den blandes inn i hoveddeigen, hele deigen kjøleskapheves udelt i 10t og deles i emner ETTERPÅ, med en lang 10-timers romtemperaturheving til slutt (i stedet for kort etterheving) — total gjæringstid ca. 37 timer. Egen, korrekt oppskrift (64% hydrering, todelt Poolish/Hoveddeig-ingrediensliste) i Oppskrift-fanen, ikke den generiske beregningen."
    ],
    "changes_en": [
      "New method: Mania poolish (named after Pizzamania, the source of the recipe) — its own method card alongside Poolish/Biga. Structurally different from the others: the poolish ferments 12h at room temperature and is chilled down BEFORE it's mixed into the main dough, the whole dough cold-proofs undivided for 10h and is divided into balls AFTERWARD, with a long 10-hour room-temperature proof at the end (instead of a short final proof) — total fermentation time about 37 hours. Its own, correct recipe (64% hydration, split Poolish/Main dough ingredient list) in the Recipe tab, not the generic calculation."
    ]
  },
  {
    "v": "0.544",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Mine faste tidspunkter\" fant tidligere en løsning uten reelle konflikter for lørdag/søndag 19:00 — men romtemperatur-Poolish sitt smale 12-16 timers justeringsrom var noen ganger for trangt til at NOEN verdi unngikk natt-kollisjon (\"Lag poolish\" kl. 05:40 var \"minst ille\", ikke en reell løsning). Søket prøver nå automatisk kjøleskaps-varianten (12-48t) også når romtemperatur ikke strekker til, og bruker den hvis den faktisk finner noe bedre — vises som \"Alt passer ✓ (krever ❄️ Kjøleskap-poolish)\". Fant en reell løsning for lørdag 19:00 som tidligere manglet."
    ],
    "changes_en": [
      "\"My fixed times\" used to find a solution with no real conflicts for Saturday/Sunday 19:00 — but room-temperature Poolish's narrow 12-16 hour adjustment window was sometimes too tight for ANY value to avoid a nighttime collision (\"Make poolish\" at 05:40 was \"least bad\", not a real solution). The search now automatically tries the fridge variant (12-48h) as well when room temperature isn't enough, and uses it if it actually finds something better — shown as \"Everything fits ✓ (requires ❄️ Fridge poolish)\". Found a real solution for Saturday 19:00 that was previously missing."
    ]
  },
  {
    "v": "0.543",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet \"Mine faste tidspunkter\": helger (lørdag/søndag) er ledige hele dagen bortsett fra natt — en helt annen, enklere regel enn hverdagenes to smale vinduer. Tidligere ble den samme, smale hverdags-regelen brukt for alle dager, som gjorde at \"Ta ut av kjøleskap\" feilaktig ble markert som et problem midt på lørdags-/søndagsettermiddagen. Alle fire helgemålene viser nå riktig \"Alt passer ✓\"."
    ],
    "changes_en": [
      "Fixed \"My fixed times\": weekends (Saturday/Sunday) are free all day except at night — a completely different, simpler rule than weekdays' two narrow windows. Previously the same narrow weekday rule was applied to all days, which made \"Take out of fridge\" incorrectly flagged as a problem in the middle of Saturday/Sunday afternoon. All four weekend targets now correctly show \"Everything fits ✓\"."
    ]
  },
  {
    "v": "0.542",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Mine faste tidspunkter\" gjort om fra rent oppslagsverk til reell søking: for hvert av de fem målene finner den nå den beste kombinasjonen av hevetid og kjøleskapstid som får flest mulig steg til å havne i dine egne ledige vinduer (16:00–23:30 og 06:30–08:00) — helt uavhengig av dagens dato, som avtalt. Trykk på et mål for å sette opp akkurat den kombinasjonen direkte. Avdekket samtidig en strukturell begrensning: \"Ta ut av kjøleskap\" ligger alltid fast 4 timer før spisetidspunktet uansett hva som justeres, og havner for alle fem målene midt i hullet mellom vinduene dine (12:00–15:00) — ingen kombinasjon kan fikse akkurat det steget per i dag."
    ],
    "changes_en": [
      "\"My fixed times\" reworked from a pure lookup tool into a real search: for each of the five targets it now finds the best combination of proofing time and fridge time that gets as many steps as possible to land inside your own free windows (16:00–23:30 and 06:30–08:00) — completely independent of today's date, as agreed. Tap a target to set up exactly that combination directly. At the same time it revealed a structural limitation: \"Take out of fridge\" is always fixed 4 hours before the meal time no matter what's adjusted, and for all five targets lands right in the gap between your windows (12:00–15:00) — no combination can fix that particular step as of now."
    ]
  },
  {
    "v": "0.541",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Forenklet \"Mine faste tidspunkter\" kraftig: fjernet ✅/⚠️-vurderingen og \"for kort varsel\"-sjekken helt. Den er nå et rent oppslagsverk — viser bare beregnet starttidspunkt for hvert av de fem faste målene med din nåværende metode/hevetid, uten å dømme om det er lurt eller mulig."
    ],
    "changes_en": [
      "Greatly simplified \"My fixed times\": removed the ✅/⚠️ assessment and the \"too short notice\" check entirely. It's now a pure lookup tool — it just shows the calculated start time for each of the five fixed targets with your current method/proofing time, without judging whether it's wise or possible."
    ]
  },
  {
    "v": "0.540",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset \"Mine faste tidspunkter\": den sjekket bare om steg havnet innenfor dine ledige vinduer, men aldri om planen faktisk var mulig å starte FRA NÅ — et mål bare timer unna (som fredag når det allerede er torsdag) kunne be deg starte poolishen tidligere på dagen enn klokka faktisk er, altså i fortiden. Vises nå tydelig som \"For kort varsel\" i stedet for en misvisende status. Rettet samtidig en beslektet risiko: forhåndsvisningen leste ikke \"Starter nå/Steketid\"-valget riktig for Hurtigdeig/Kveldsdeig, som kunne gitt feil resultat der også."
    ],
    "changes_en": [
      "Fixed \"My fixed times\": it only checked whether steps landed within your free windows, but never whether the plan was actually possible to start FROM NOW — a target just hours away (like Friday when it's already Thursday) could ask you to start the poolish earlier in the day than it actually is, i.e. in the past. It's now clearly shown as \"Too short notice\" instead of a misleading status. At the same time fixed a related risk: the preview didn't read the \"Start now/Bake time\" choice correctly for Quick dough/Evening dough, which could have given wrong results there too."
    ]
  },
  {
    "v": "0.539",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny konsept-test i Planlegging-fanen: \"🍕 Mine faste tidspunkter\" — en snarvei som viser om nåværende metode/hevetid passer med fem faste mål (fre 19:00, lør 16:00/19:00, søn 16:00/19:00), sjekket mot dine egne, hardkodede ledige tidsvinduer (16:00–23:30 og 06:30–08:00). ✅/⚠️ per mål, trykk for å sette opp akkurat den planen direkte. Helt isolert fra det generelle natt/arbeidstid-varselet — endrer ingenting automatisk, kun en rask oversikt du kan hente frem når du vil."
    ],
    "changes_en": [
      "New concept test in the Planner tab: \"🍕 My fixed times\" — a shortcut that shows whether the current method/proofing time fits with five fixed targets (Fri 19:00, Sat 16:00/19:00, Sun 16:00/19:00), checked against your own, hardcoded free time windows (16:00–23:30 and 06:30–08:00). ✅/⚠️ per target, tap to set up exactly that plan directly. Completely isolated from the general night/work-hours warning — it changes nothing automatically, just a quick overview you can pull up whenever you like."
    ]
  },
  {
    "v": "0.538",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at \"arbeidstid\"-varselet feilaktig fyrte i helgen — det sjekket bare klokkeslettet, ikke ukedagen, i motsetning til \"Finn beste kombinasjon\" som allerede korrekt utelot lørdag/søndag. De to var ikke enige med hverandre; nå bruker begge samme regel."
    ],
    "changes_en": [
      "Fixed the \"work hours\" warning incorrectly firing on weekends — it only checked the time of day, not the weekday, unlike \"Find best combination\" which already correctly excluded Saturday/Sunday. The two didn't agree with each other; now both use the same rule."
    ]
  },
  {
    "v": "0.537",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt alternativ for Poolish: \"❄️ Kjøleskap\" ved siden av \"🌡️ Romtemperatur\" i Metode-steget. Med kjøleskap-varianten blander du poolishen 1,5t i romtemperatur for å sette i gang gjæren, deretter i kjøleskap i en mye bredere og friere periode (12–48t i steg à 6t, i stedet for det smale 12–16t-vinduet) — nøyaktig klokkeslett blir langt mindre kritisk, siden kulda holder poolishen stabil til du er klar for neste steg.",
      "\"🔍 Finn beste kombinasjon\"-knapp lagt til i natt/arbeidstid-varselet for Poolish/Biga — søker gjennom hevetid og kjøleskapstid og finner alternativet med færrest forstyrrelser, i stedet for at du må teste deg fram manuelt.",
      "\"Prøv Kveldsdeig i stedet\"-knapp lagt til samme sted — et reelt alternativ når ingen Poolish/Biga-kombinasjon blir god nok innenfor tiden du har.",
      "Ny påminnelse når du velger Poolish/Biga onsdag–fredag: \"Planlegger du helgepizza? Start så tidlig du kan for mest fleksibilitet.\""
    ],
    "changes_en": [
      "New option for Poolish: \"❄️ Fridge\" alongside \"🌡️ Room temperature\" in the Method step. With the fridge variant you mix the poolish for 1.5h at room temperature to kick-start the yeast, then in the fridge for a much wider and freer period (12–48h in 6h steps, instead of the narrow 12–16h window) — the exact time becomes far less critical, since the cold keeps the poolish stable until you're ready for the next step.",
      "\"🔍 Find best combination\" button added to the night/work-hours warning for Poolish/Biga — it searches through proofing time and fridge time and finds the option with the fewest disruptions, instead of you having to test your way there manually.",
      "\"Try Evening dough instead\" button added in the same place — a real alternative when no Poolish/Biga combination is good enough within the time you have.",
      "New reminder when you choose Poolish/Biga Wednesday–Friday: \"Planning weekend pizza? Start as early as you can for the most flexibility.\""
    ]
  },
  {
    "v": "0.536",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt varsel i Steg-fanen hvis et steg som faktisk krever at du gjør noe (blande, forme, ta ut av kjøleskap, steke — ikke bare vente) havner midt på natten (23:00–06:00) eller i arbeidstiden din (08:00–16:00, hardkodet foreløpig), med hurtigknapper for å justere hevetid (Poolish/Biga) eller kjøleskapstid direkte.",
      "Live forhåndsvisning av beregnet starttidspunkt når du justerer hevetid i Poolish/Biga eller kjøleskapstid i Planlegging — slipper å bla til Steg-fanen for å sjekke.",
      "Standard/Poolish/Biga sine tre første aktive steg (bland, la heve, form emner) er nå tydelig merket som én sammenhengende arbeidsøkt, med et lite banner som viser hvor lang tid du bør sette av.",
      "Rettet Ankarsrum-terminologi i tekstene — \"rullekniv\" fantes ikke, riktig er \"deigrullen\" (ruller) og \"deigkniv\"/skraper (to separate deler brukt sammen).",
      "Nytt tips: \"Kjøleskapspause\" for Poolish/Biga — hvordan pause et forspill i kjøleskapet hvis livet kommer i veien.",
      "Feedback viser nå hvem som sendte den inn, samme mønster som lagrede deiger og notater.",
      "Fikset at bakgrunnen kunne scrolle gjennom modaler (Admin og andre) på mobil — manglende overscroll-behation er nå satt.",
      "Fikset at overskriftene i Tips og teknikk var lyse og uleselige — samme mangel på mørk-modus som flere tidligere runder.",
      "LØST en ekte backend-bug: sletting av bruker og \"Ny PIN\" i Admin-visningen brukte feil lagringsnøkkel og virket aldri, selv om ingen feilmelding vistes — brukere lagres med normalisert navn som nøkkel, ikke intern id. Krever ny users.js på serveren."
    ],
    "changes_en": [
      "New warning in the Steps tab if a step that actually requires you to do something (mix, shape, take out of fridge, bake — not just wait) lands in the middle of the night (23:00–06:00) or during your work hours (08:00–16:00, hardcoded for now), with quick buttons to adjust proofing time (Poolish/Biga) or fridge time directly.",
      "Live preview of the calculated start time when you adjust proofing time in Poolish/Biga or fridge time in the Planner — no need to flip to the Steps tab to check.",
      "Standard/Poolish/Biga's first three active steps (mix, let proof, shape balls) are now clearly marked as one continuous work session, with a small banner showing how much time you should set aside.",
      "Fixed Ankarsrum terminology in the texts — \"roller knife\" didn't exist, the correct terms are \"the dough roller\" (roller) and \"dough knife\"/scraper (two separate parts used together).",
      "New tip: \"Fridge pause\" for Poolish/Biga — how to pause a preferment in the fridge if life gets in the way.",
      "Feedback now shows who submitted it, the same pattern as saved doughs and notes.",
      "Fixed the background being able to scroll through modals (Admin and others) on mobile — a missing overscroll behavior is now set.",
      "Fixed the headings in Tips and technique being light and unreadable — the same lack of dark mode as several earlier rounds.",
      "SOLVED a genuine backend bug: deleting a user and \"New PIN\" in the Admin view used the wrong storage key and never worked, even though no error was shown — users are stored with their normalized name as the key, not an internal id. Requires a new users.js on the server."
    ]
  },
  {
    "v": "0.535",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kjøleskapsheving viste \"dager\" i stedet for timer når verdien tilfeldigvis traff et helt døgn (f.eks. \"1 dag\" for 24 timer) — inkonsekvent med resten av det nye time-baserte systemet. Viser nå alltid timer, overalt."
    ],
    "changes_en": [
      "Cold proofing showed \"days\" instead of hours when the value happened to hit a whole day (e.g. \"1 day\" for 24 hours) — inconsistent with the rest of the new hour-based system. It now always shows hours, everywhere."
    ]
  },
  {
    "v": "0.534",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Poolish og Biga sin forspill-varighet er nå justerbar (12–16t for Poolish, 16–24t for Biga, med navngitte alternativer — samme mønster som Hurtigdeig/Kveldsdeig), i stedet for fast 14t/18t. Gjærmengden i forspillet skaleres automatisk med valgt varighet. Standardverdiene (14t/18t) gir nøyaktig samme oppskrift som før — ingen endring for deg som ikke rører denne nye innstillingen. Motivert av at kontroll på nettopp denne fasen (den minst fleksible, siden forspill og ferdig-blanding er rigid låst til hverandre) lar deg justere når disse to øyeblikkene faktisk havner på klokka. Foreløpig kun på mobil — PC-visningen bruker fortsatt de faste standardverdiene."
    ],
    "changes_en": [
      "Poolish and Biga's preferment duration is now adjustable (12–16h for Poolish, 16–24h for Biga, with named options — the same pattern as Quick dough/Evening dough), instead of a fixed 14h/18h. The amount of yeast in the preferment scales automatically with the chosen duration. The default values (14h/18h) give exactly the same recipe as before — no change for you if you don't touch this new setting. Motivated by the fact that control over precisely this phase (the least flexible one, since the preferment and final mix are rigidly locked to each other) lets you adjust when those two moments actually land on the clock. For now only on mobile — the PC view still uses the fixed default values."
    ]
  },
  {
    "v": "0.533",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kjøleskapsheving for Standard/Poolish/Biga er byttet fra hele dager til timer, med finere 6-timers steg — samme presisjonsnivå som Hurtigdeig/Kveldsdeig allerede hadde. Gjærmengde-tabellen som var koblet til antall dager er bygget om til en jevnt interpolert versjon i timer, basert på nøyaktig de samme, allerede uttestede verdiene som før — ingen ny gjetning, bare finere oppløsning mellom de kjente punktene. \"Maks smak\" utnytter nå melets faktiske gjæringsgrense mye bedre: f.eks. Caputo Nuvola (maks 48t) fikk tidligere kun 24t foreslått siden systemet rundet ned til hele døgn — nå foreslår den 42t. Fant og rettet samtidig en tredje, uavhengig kopi av gjæringstid-regnestykket i overmodning-varselet som ikke ble fanget opp i forrige versjon."
    ],
    "changes_en": [
      "Cold proofing for Standard/Poolish/Biga has been switched from whole days to hours, with finer 6-hour steps — the same level of precision that Quick dough/Evening dough already had. The yeast-amount table that was tied to number of days has been rebuilt into a smoothly interpolated version in hours, based on exactly the same, already tested values as before — no new guessing, just finer resolution between the known points. \"Max flavor\" now makes much better use of the flour's actual fermentation limit: e.g. Caputo Nuvola (max 48h) previously only got 24h suggested since the system rounded down to whole days — now it suggests 42h. At the same time found and fixed a third, independent copy of the fermentation-time calculation in the over-proofing warning that wasn't caught in the previous version."
    ]
  },
  {
    "v": "0.532",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Gjæringstid-regnestykket (brukt av meltype-varselet og \"Maks smak\") tok ikke med romtemperaturhevingen FØR kjøleskapet — bare forspill (Poolish/Biga) og kjøleskapsdager ble talt. Lagt til, og samtidig rettet et lite avvik der Biga sitt forspill ble regnet som 20 timer ett sted i koden og 18 timer et annet — alt bruker nå samme, delte regnestykke, så det aldri kan drive fra hverandre igjen."
    ],
    "changes_en": [
      "The fermentation-time calculation (used by the flour-type warning and \"Max flavor\") didn't include the room-temperature proof BEFORE the fridge — only the preferment (Poolish/Biga) and cold-proofing days were counted. Added it, and at the same time fixed a small discrepancy where Biga's preferment was counted as 20 hours in one place in the code and 18 hours in another — everything now uses the same, shared calculation, so it can never drift apart again."
    ]
  },
  {
    "v": "0.531",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Gjort det tydeligere at wizardens Metode- og Planlegging-steg begge har to separate valg: hvert valg har nå en liten nummerert markør (\"①\"/\"②\") foran en kort overskrift, samme mønster på begge sider.",
      "Rettet rekkefølgen på Planlegging-steget slik at \"Når vil du spise?\" kommer først (matcher tittelen), og \"Antall pizzaer\" kommer etter — som Metode-steget sitt mønster.",
      "Ryddet opp i \"Når vil du spise?\"-valget: for Standard/Poolish/Biga (lang gjæring) er \"Starter nå\" fjernet helt — det ga ikke mening der. For Hurtigdeig/Kveldsdeig beholdes begge alternativene, men spørsmålet er nå det nøytrale \"Planlegg fra:\", med \"🍕 Når jeg vil spise\" og \"▶ Nå\" som to likestilte svar.",
      "Kjøleskapsheving er nå synlig direkte i Planlegging-steget for Standard/Poolish/Biga (i tillegg til i Finjuster), sammen med en ny \"🌙 Maks smak\"-knapp — den setter automatisk lengst trygge kjøleskapstid, begrenset av enten tiden du har til spisetidspunktet eller hva valgt meltype tåler, og forteller alltid hvilken av de to som faktisk var flaskehalsen."
    ],
    "changes_en": [
      "Made it clearer that the wizard's Method and Planner steps both have two separate choices: each choice now has a small numbered marker (\"①\"/\"②\") in front of a short heading, the same pattern on both sides.",
      "Fixed the order of the Planner step so that \"When do you want to eat?\" comes first (matching the title), and \"Number of pizzas\" comes after — like the Method step's pattern.",
      "Cleaned up the \"When do you want to eat?\" choice: for Standard/Poolish/Biga (long fermentation) \"Start now\" has been removed entirely — it didn't make sense there. For Quick dough/Evening dough both options are kept, but the question is now the neutral \"Plan from:\", with \"🍕 When I want to eat\" and \"▶ Now\" as two equal answers.",
      "Cold proofing is now visible directly in the Planner step for Standard/Poolish/Biga (in addition to in Fine-tune), together with a new \"🌙 Max flavor\" button — it automatically sets the longest safe fridge time, limited by either the time you have until the meal or what the chosen flour type can handle, and always tells you which of the two was actually the bottleneck."
    ]
  },
  {
    "v": "0.530",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant den egentlige, underliggende årsaken til flere runder med \"må scrolle for å finne resten\"-bugs på mobil, som har dukket opp flere steder over tid: CSS zoom (brukt til skriftstørrelse-innstillingen) skalerer alt synlig innhold opp med zoom-faktoren, men \"100dvh\" — som hele mobilvisningens høyde er satt til — regnes ut fra den ekte, uskalerte skjermhøyden. Resultatet: hele siden ble malt zoom-faktoren ganger for høy (f.eks. 30% for høy ved \"Stor\" skrift), som gjorde HELE siden — ikke bare enkeltfaner — scrollbar, og en hvilken som helst ting som trigget sidescroll (som et fokusert dato-/tidsfelt) kunne skyve toppen av et wizard-steg ut av syne. Bekreftet med Chrome sin mobil-emulering (samme miljø som avslørte feilen), og fikset ved å regne ut mobilvisningens høyde eksplisitt i ekte skjerm-piksler, uavhengig av zoom-nivå."
    ],
    "changes_en": [
      "Found the real, underlying cause of several rounds of \"have to scroll to find the rest\" bugs on mobile, which have shown up in several places over time: CSS zoom (used for the font-size setting) scales all visible content up by the zoom factor, but \"100dvh\" — which the entire mobile view's height is set to — is calculated from the real, unscaled screen height. The result: the whole page was painted the zoom factor times too tall (e.g. 30% too tall at \"Large\" text), which made the ENTIRE page — not just individual tabs — scrollable, and anything that triggered a page scroll (like a focused date/time field) could push the top of a wizard step out of view. Confirmed with Chrome's mobile emulation (the same environment that revealed the bug), and fixed by calculating the mobile view's height explicitly in real screen pixels, independent of the zoom level."
    ]
  },
  {
    "v": "0.529",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Se i Finjuster\"-lenken i meltype-varselet (Steg-fanen) gjorde ingenting synlig — den forberedte Finjuster-innholdet bak kulissene, men byttet aldri selve fanen til Innstillinger, hvor Finjuster faktisk bor. Lenken bytter nå fane først, så du faktisk ser endringen."
    ],
    "changes_en": [
      "The \"See in Fine-tune\" link in the flour-type warning (Steps tab) did nothing visible — it prepared the Fine-tune content behind the scenes, but never switched the actual tab to Settings, where Fine-tune actually lives. The link now switches the tab first, so you actually see the change."
    ]
  },
  {
    "v": "0.528",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset selve feedback-listen (de innsendte tilbakemeldingene, ikke bare kategori-boblene) som var nesten uleselig — kortene rundt hver tilbakemelding hadde fortsatt hvit bakgrunn, mens teksten inni allerede var riktig lysnet, altså lys tekst på hvit bunn. Siden denne listen deles mellom PC og mobil, er den nå fikset med ordentlige delte fargevariabler (samme mønster som resten av appen) i stedet for en snarvei — bekreftet at mobil viser mørkt kort/lys tekst og PC fortsatt viser hvitt kort/mørk tekst, helt uendret."
    ],
    "changes_en": [
      "Fixed the feedback list itself (the submitted feedback, not just the category bubbles) which was nearly unreadable — the cards around each piece of feedback still had a white background, while the text inside was already correctly lightened, meaning light text on a white base. Since this list is shared between PC and mobile, it's now fixed with proper shared color variables (the same pattern as the rest of the app) instead of a shortcut — confirmed that mobile shows dark card/light text and PC still shows white card/dark text, completely unchanged."
    ]
  },
  {
    "v": "0.527",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset meltype-nedtrekksmenyen i wizarden som var hvit på hvit — samme \"mangler mørk-modus\"-mønster som flere andre steder. Systematisk gjennomgang av alle gjenværende lyse bakgrunner fant tre til: statistikk-boksene (\"Antall\"/\"Emnestørrelse\") på Oppskrift-fanen, og en feilskrevet klassenavn som gjorde at Ankarsrum-instruksjonsboksen på samme fane brukte PC sin lyse stil i stedet for mobilens mørke. Alle fire rettet og verifisert med fargemålinger."
    ],
    "changes_en": [
      "Fixed the flour-type dropdown menu in the wizard that was white on white — the same \"missing dark mode\" pattern as several other places. A systematic review of all remaining light backgrounds found three more: the statistics boxes (\"Count\"/\"Ball size\") on the Recipe tab, and a misspelled class name that made the Ankarsrum instruction box on the same tab use the PC's light style instead of mobile's dark one. All four fixed and verified with color measurements."
    ]
  },
  {
    "v": "0.526",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet 8 flere steder med samme \"mørk tekst på mørk bunn\"-mønster som \"Hva er nytt\" hadde: selve \"Hva er nytt\"-teksten og datoene, \"Lukk\"-knappen der, Guide sin \"Ikke vis igjen\"-knapp (som en tidligere fiks ikke tok skikkelig), introtekstene i Feedback/Formler/Fullfør bakst-modalene, \"av [navn]\"-linjen på deig-kort, og gjennomstreket tekst på avhakede ingredienser. Funnet ved systematisk gjennomgang av alle hardkodede grå/mørke tekstfarger i mobilvisningen, ikke bare det ene rapporterte stedet."
    ],
    "changes_en": [
      "Fixed 8 more spots with the same \"dark text on a dark background\" pattern that \"What's new\" had: the \"What's new\" text and dates themselves, the \"Close\" button there, the Guide's \"Don't show again\" button (which an earlier fix didn't fully catch), the intro text in the Feedback/Formulas/Finish bake modals, the \"by [name]\" line on dough cards, and the strikethrough text on checked-off ingredients. Found by systematically going through every hardcoded gray/dark text color in the mobile view, not just the one reported spot."
    ]
  },
  {
    "v": "0.525",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Meltype-valget er flyttet fra Finjuster inn i wizardens Metode-steg (steg 2), rett under gjærtype/kjøkkenmaskin — synlig når du faktisk tar det valget, i stedet for gjemt bak \"Finjuster\". Meltype endres fortsatt ikke automatisk når du bytter pizzatype (i motsetning til hydrering), siden det handler om hvilket mel du faktisk har i skapet, ikke en beregnet anbefaling.",
      "Nytt varsel når valgt metode ikke passer med god tid til rådighet — f.eks. Hurtigdeig valgt samtidig som du planlegger å spise om flere dager. Samme mønster som meltype-varselet: forklaring, en \"Bytt til Standard\"-hurtigknapp, og en lenke tilbake til Metode-steget."
    ],
    "changes_en": [
      "The flour-type choice has moved out of Fine-tune and into the wizard's Method step (step 2), right below yeast type/stand mixer — visible when you're actually making that choice, instead of hidden behind \"Fine-tune\". Flour type still doesn't change automatically when you switch pizza type (unlike hydration), since it's about which flour you actually have in the cupboard, not a calculated recommendation.",
      "New warning when the chosen method doesn't fit the time you have available — e.g. Quick dough selected while you're planning to eat several days from now. Same pattern as the flour-type warning: an explanation, a \"Switch to Standard\" quick button, and a link back to the Method step."
    ]
  },
  {
    "v": "0.524",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Lysnet den dempede/svake tekstfargen (brukt på etiketter, tidsstempler og sekundær tekst gjennom hele mobilvisningen) — teknisk sett innenfor tilgjengelighetskravene fra før, men for svak til å lese komfortabelt i praksis, spesielt i liten skriftstørrelse. Kontrasten er nå 6,2:1 (opp fra 5,1:1)."
    ],
    "changes_en": [
      "Lightened the muted/faint text color (used on labels, timestamps and secondary text throughout the mobile view) — technically within the accessibility requirements already, but too faint to read comfortably in practice, especially at small font sizes. Contrast is now 6.2:1 (up from 5.1:1)."
    ]
  },
  {
    "v": "0.523",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset den andre halvparten av v5.23-bugen: forrige fiks gjorde riktignok teksten lys, men flere av radene/boksene den satt på (Info-fanens menyrader, skriftstørrelse-velgeren, valg-boblene for gjærtype/kjøkkenmaskin/ovntype/pizzatype i wizarden, dato-/tidsfeltene) hadde fortsatt hvit bakgrunn — så lys tekst på hvit bunn ble like usynlig, bare omvendt. Alle disse er nå rettet til å bruke mørk bunn på mobil. Fant også separate, litt andre farge-instanser i wizardens JavaScript-genererte valg-bobler som ikke hang sammen med v5.23-fiksen i det hele tatt — samme rettet."
    ],
    "changes_en": [
      "Fixed the other half of the v5.23 bug: the previous fix did make the text light, but several of the rows/boxes it sat on (the Info tab's menu rows, the font-size picker, the choice bubbles for yeast type/stand mixer/oven type/pizza type in the wizard, the date/time fields) still had a white background — so light text on white was just as invisible, only in reverse. All of these are now fixed to use a dark background on mobile. Also found separate, slightly different color instances in the wizard's JavaScript-generated choice bubbles that weren't connected to the v5.23 fix at all — fixed those too."
    ]
  },
  {
    "v": "0.522",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant og rettet en systemisk variant av admin-fargefeilen fra forrige versjon: Guide-teksten, Info-sidens menyrader, Formler-tabellen, Feedback-listen, deig-kortene og flere andre steder brukte alle den samme hardkodede mørke tekstfargen fra før restylingen — usynlig mot den nye mørke mobilbakgrunnen. I stedet for å lappe hvert sted for seg, er dette nå rettet med én delt fargevariabel (47 steder samtidig) som automatisk følger lys/mørk-modus riktig — PC-visningen er bekreftet uendret."
    ],
    "changes_en": [
      "Found and fixed a systemic variant of the admin color bug from the previous version: the Guide text, the Info page's menu rows, the Formulas table, the Feedback list, the dough cards and several other spots all used the same hardcoded dark text color from before the restyle — invisible against the new dark mobile background. Instead of patching each spot individually, this is now fixed with one shared color variable (47 spots at once) that automatically follows light/dark mode correctly — the desktop view is confirmed unchanged."
    ]
  },
  {
    "v": "0.521",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at brukernavnene i Admin-visningen var usynlige på mobil — teksten hadde hardkodet mørk farge fra før restylingen, som forsvant mot den nye mørke modal-bakgrunnen. Admin-listen bruker nå farger som tilpasser seg både lys (PC) og mørk (mobil) visning. Samme feil rettet i Notater-fanens overskrift.",
      "Lagrede deiger og notater viser nå hvem som står bak: deig-kortene i \"Mine deiger\" viser \"av [navn]\" på deiger lagret fra nå av, og notater viser \"sist lagret av [navn]\" (og en signaturlinje under notatet på ferdige deiger). Eldre deiger og notater lagret før denne versjonen har ikke navn registrert, og vises uten."
    ],
    "changes_en": [
      "Fixed usernames in the Admin view being invisible on mobile — the text had a hardcoded dark color from before the restyle that disappeared against the new dark modal background. The Admin list now uses colors that adapt to both light (desktop) and dark (mobile) views. Same bug fixed in the Notes tab heading.",
      "Saved doughs and notes now show who's behind them: the dough cards in \"My doughs\" show \"by [name]\" on doughs saved from now on, and notes show \"last saved by [name]\" (plus a signature line under the note on finished doughs). Older doughs and notes saved before this version have no name recorded, and show without one."
    ]
  },
  {
    "v": "0.520",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fremtidige steg i \"Steg\"-fanen er nå tydelig leselige (demping myknet fra 40 % til 75 % synlighet), slik at du kan lese hele oppskriften og få oversikt over alle stegene — dagens steg skiller seg fortsatt ut med den oransje kanten. Valgt som den enkleste av tre skisserte løsninger; en innholdsfortegnelse øverst kan bygges på toppen senere om behovet fortsatt er der.",
      "Avkrysningsboksene på stegene er gjort mye lettere å se: større (24px), med en lys, varm kantfarge som faktisk synes mot det mørke kortet — tidligere hadde kanten nesten samme farge som bakgrunnen. Haket tilstand fylles med ember-oransje."
    ],
    "changes_en": [
      "Future steps in the \"Steps\" tab are now clearly readable (dimming eased from 40% to 75% visibility), so you can read the whole recipe and get an overview of all the steps — today's step still stands out with its orange border. Chosen as the simplest of three sketched solutions; a table of contents at the top could be built on later if the need is still there.",
      "The checkboxes on the steps are much easier to see: bigger (24px), with a light, warm border color that actually shows against the dark card — previously the border was nearly the same color as the background. The checked state fills with ember orange."
    ]
  },
  {
    "v": "0.519",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fant og fikset den egentlige årsaken til at nye brukere feilaktig fikk \"Hei igjen! Du har brukt appen før\" (v5.19 sin diagnose var ufullstendig og løste ikke problemet): deig-lageret er med vilje DELT for hele gruppen, men wizarden brukte \"finnes det en aktiv deig eller favoritt i det delte lageret?\" som bevis på at akkurat DU hadde brukt appen før — dermed fikk enhver ny bruker \"Hei igjen\" så lenge noen som helst i gruppen hadde en deig liggende. Avgjørelsen tas nå kun på det reelle per-bruker-signalet (ditt eget sist brukte oppsett); favoritt-snarveien vises fortsatt, men bare for faktisk tilbakevendende brukere.",
      "Fikset også at skjermen kunne stå scrollet nedover (og se tom ut) rett etter innlogging: tastatur/fokus på navn- og PIN-feltene scroller skjermen bak innloggingsbildet, og ingenting nullstilte dette før etter et nettverkskall. Scroll nullstilles nå umiddelbart når innloggingsbildet lukkes."
    ],
    "changes_en": [
      "Found and fixed the real reason new users were wrongly getting \"Welcome back! You've used the app before\" (v5.19's diagnosis was incomplete and didn't solve the problem): the dough store is deliberately SHARED for the whole group, but the wizard used \"is there an active dough or favorite in the shared store?\" as proof that YOU specifically had used the app before — so any new user got \"Welcome back\" as long as anyone at all in the group had a dough lying around. The decision is now based solely on the real per-user signal (your own last-used setup); the favorite shortcut still shows, but only for actually returning users.",
      "Also fixed the screen sometimes staying scrolled down (and looking empty) right after login: the keyboard/focus on the name and PIN fields scrolls the screen behind the login screen, and nothing reset it until after a network call. The scroll is now reset immediately when the login screen closes."
    ]
  },
  {
    "v": "0.518",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en variant av wizard-regresjonen fra tidligere: en ny bruker på en nettleser/enhet som tidligere er brukt av en annen konto kunne bli møtt med \"Hei igjen!\" og feil favoritt-status. Årsaken var beslektet med forrige fiks, men på et annet felt — syncFavoriteButton() kjørte ved sideinnlasting, før innlogging var reell, og window._favoriteId ble aldri hentet på nytt etter at den faktiske brukeren logget inn. Nå henter authComplete() riktig favoritt-status før wizarden avgjør noe."
    ],
    "changes_en": [
      "Fixed a variant of the earlier wizard regression: a new user on a browser/device previously used by another account could be greeted with \"Welcome back!\" and the wrong favorite status. The cause was related to the previous fix, but on a different field — syncFavoriteButton() ran on page load, before login was real, and window._favoriteId was never re-fetched after the actual user logged in. Now authComplete() correctly fetches the favorite status before the wizard decides anything."
    ]
  },
  {
    "v": "0.517",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Dempet \"Hvorfor\"/\"Tips\"-boksene i \"Steg\"-fanen, som følte seg for kraftige og stjal oppmerksomhet fra selve steget. Byttet fra fylt bakgrunnsfarge til en tynn kantstrek uten fyll (ett av tre skisserte alternativer) — beholder nok visuell distinksjon til å skille tilleggsinfo fra hovedteksten, uten å konkurrere med steget selv."
    ],
    "changes_en": [
      "Toned down the \"Why\"/\"Tips\" boxes in the \"Steps\" tab, which felt too heavy and stole attention from the step itself. Switched from a filled background color to a thin outline with no fill (one of three sketched options) — keeps enough visual distinction to separate the extra info from the main text, without competing with the step itself."
    ]
  },
  {
    "v": "0.516",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at fanebytte og wizard-navigering kunne vise en synlig hopp-bevegelse i scroll-posisjonen (\"starter litt opp og ned\"). Den forrige fiksen rettet selve sluttresultatet, men kunne fortsatt vise et kort, forvirrende hopp underveis. Fanen holdes nå usynlig helt til scroll-posisjonen er bekreftet på plass, i stedet for å vise feil posisjon og så korrigere den — brukeren ser aldri lenger selve hoppet. Samme forbedring gjort for wizard-steg-navigering, med en liten justering slik at \"Se i Finjuster\"-fremhevingen fortsatt fungerer korrekt sammen med det."
    ],
    "changes_en": [
      "Fixed tab switches and wizard navigation sometimes showing a visible jump in scroll position (\"starts a bit up and down\"). The previous fix corrected the end result, but could still show a brief, confusing jump along the way. The tab is now kept invisible until the scroll position is confirmed in place, instead of showing the wrong position and then correcting it — the user never sees the jump itself anymore. Same improvement made for wizard step navigation, with a small tweak so the \"See in Fine-tune\" highlight still works correctly alongside it."
    ]
  },
  {
    "v": "0.515",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at en ny bruker på samme nettleser/enhet kunne bli møtt med \"Hei igjen!\" og en annen brukers siste innstillinger. Årsaken var at \"sist brukte oppsett\" ble lagret under én delt nøkkel i nettleserens lokale lagring, uten kobling til hvilken bruker som faktisk var innlogget — nå lagres og leses dette per bruker-id, så en fersk registrering på samme enhet aldri lenger arver en annen brukers historikk. Bekreftet med to simulerte brukere på samme nettleser."
    ],
    "changes_en": [
      "Fixed a new user on the same browser/device being greeted with \"Welcome back!\" and another user's last settings. The cause was that \"last-used setup\" was saved under one shared key in the browser's local storage, with no link to which user was actually logged in — now it's saved and read per user id, so a fresh registration on the same device never inherits another user's history anymore. Confirmed with two simulated users on the same browser."
    ]
  },
  {
    "v": "0.514",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fullført Forno-restylingen av wizarden (Pizzatype → Metode → Planlegging → Finjuster), som brukte fargekoder direkte i HTML-en (ikke CSS-klasser) og derfor ikke arvet tokens automatisk fra forrige runde. Nå Forno-stylet: alle knapper og kort, metode-valg-kortene, pizza-teller, \"Starter nå\"/\"Steketid\"-bryteren, dato-/tidsfeltene, Finjuster sine seksjoner, og oppskrift-fanens ingrediensliste. Bekreftet med fargemålinger for alle wizard-steg."
    ],
    "changes_en": [
      "Completed the Forno restyle of the wizard (Pizza type → Method → Planner → Fine-tune), which used color codes directly in the HTML (not CSS classes) and therefore didn't inherit tokens automatically from the previous round. Now Forno-styled: all buttons and cards, the method-choice cards, the pizza counter, the \"Starting now\"/\"Bake time\" toggle, the date/time fields, Fine-tune's sections, and the recipe tab's ingredient list. Confirmed with color measurements for all wizard steps."
    ]
  },
  {
    "v": "0.513",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Startet restylingen til \"Forno\"-retningen (valgt av to skisserte alternativer): kullsvart bunn, ember-oransje aksent, Archivo Black/IBM Plex Mono-typografi. Bygget som en tokens-basert bunnstruktur (CSS-variabler for farger/fonter definert ett sted, arvet automatisk) fremfor å style hver fane for seg. Dekker foreløpig: hele mobil-skallet (toppfelt, bunn-menyfaner, fane-bakgrunn), steg-kortene i \"Steg\"-fanen (den mest brukte skjermen), dag-overskrifter, innstillings-rader/slidere, og alle modal-vinduer (Feedback/Formler/Hva er nytt/Guide). Bekreftet med fargemålinger i headless nettleser. PC-visningen og enkelte inline-stylede detaljer i wizarden (pizza-teller, metode-kort) er ikke omfattet ennå — naturlig neste steg."
    ],
    "changes_en": [
      "Started the restyle toward the \"Forno\" direction (chosen from two sketched options): coal-black background, ember-orange accent, Archivo Black/IBM Plex Mono typography. Built as a token-based foundation (CSS variables for colors/fonts defined in one place, inherited automatically) rather than styling each tab separately. Covers so far: the whole mobile shell (top bar, bottom-menu tabs, tab background), the step cards in the \"Steps\" tab (the most-used screen), day headers, settings rows/sliders, and all modal windows (Feedback/Formulas/What's new/Guide). Confirmed with color measurements in a headless browser. The desktop view and some inline-styled details in the wizard (pizza counter, method cards) aren't covered yet — the natural next step."
    ]
  },
  {
    "v": "0.512",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet \"Aa\"-knappen (hurtig skriftstørrelse-bytte) fra toppen av mobilvisningen, i forkant av en større restyling av appen. Skriftstørrelse kan fortsatt justeres via segmentert-kontrollen i Info-fanen."
    ],
    "changes_en": [
      "Removed the \"Aa\" button (quick font-size toggle) from the top of the mobile view, ahead of a larger restyle of the app. Font size can still be adjusted via the segmented control in the Info tab."
    ]
  },
  {
    "v": "0.511",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Styrket scroll-nullstillingen ved bytte av wizard-steg og faner ytterligere (dobbel animasjonsramme + en liten etterfølgende sjekk), samt lagt til \"overflow-anchor:none\" som ekstra sikring mot at nettleseren selv justerer scroll-posisjonen når innhold endrer størrelse rett etter et fanebytte. Gjelder spesielt \"Planlegging\"-steget i wizarden, som kan bli høyere enn skjermen på ekte telefon (native dato-/tidsfelt rendres ofte høyere på iOS enn i vanlige testverktøy) uten at det alltid lot seg gjenskape i testing her."
    ],
    "changes_en": [
      "Further strengthened the scroll reset when switching wizard steps and tabs (double animation frame + a small follow-up check), and added \"overflow-anchor:none\" as extra insurance against the browser itself adjusting the scroll position when content changes size right after a tab switch. Applies especially to the \"Planner\" step in the wizard, which can be taller than the screen on a real phone (native date/time fields often render taller on iOS than in ordinary test tools) without always being reproducible in testing here."
    ]
  },
  {
    "v": "0.510",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Meltype-varselet har nå en \"⚙️ Se i Finjuster\"-lenke i tillegg til hurtigknappene, for de som heller vil forstå og justere selv i stedet for å bruke en hurtigknapp. Den relevante seksjonen (Hydrering, eller Kjøleskapsheving ved gjæringstid-avvik) markeres kort med en gul fremheving og scrolles til automatisk, så du raskt ser hvor endringen bør gjøres."
    ],
    "changes_en": [
      "The flour-type warning now has a \"⚙️ See in Fine-tune\" link in addition to the quick buttons, for those who'd rather understand and adjust it themselves instead of using a quick button. The relevant section (Hydration, or Cold proof for a fermentation-time mismatch) is briefly marked with a yellow highlight and scrolled to automatically, so you quickly see where the change should be made."
    ]
  },
  {
    "v": "0.509",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset at fanebytte på mobil (spesielt Info-fanen) av og til landet scrollet nedover i stedet for øverst. Rot-årsaken var en kappløps-situasjon: scroll-nullstillingen skjedde synkront rett etter at fanen byttet fra skjult til synlig, og noen ganger rakk ikke nettleseren å oppdatere fanens scroll-område før nullstillingen ble utført, så den ble uten effekt. Nullstillingen skjer nå i neste \"frame\" i stedet, samme mønster som allerede brukes andre steder i appen for tilsvarende mål-etter-rendring-situasjoner. Samme fiks lagt til i wizardens steg-navigering for konsekvens."
    ],
    "changes_en": [
      "Fixed tab switches on mobile (especially the Info tab) sometimes landing scrolled down instead of at the top. The root cause was a race condition: the scroll reset happened synchronously right after the tab switched from hidden to visible, and sometimes the browser hadn't updated the tab's scroll area before the reset ran, so it had no effect. The reset now happens on the next frame instead, the same pattern already used elsewhere in the app for similar measure-after-render situations. The same fix was added to the wizard's step navigation for consistency."
    ]
  },
  {
    "v": "0.508",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset et ekte tilfelle av toppfeltet på mobil som overlappet innholdet under (f.eks. et meltype-varsel) — toppfeltet hadde fast høyde og rakk ikke plass til både navn/versjon og tidsstempel på to linjer. Toppfeltet vokser nå naturlig ved behov i stedet for å klippe/overlappe. Bekreftet med skjermbilde-mål.",
      "Meltype-varselet (gjæringstid/hydrering stemmer ikke) har nå også en hurtigknapp for selve gjæringstiden — \"Øk hevetiden\"/\"Reduser hevetiden\" — i tillegg til hydrerings- og melbytte-knappene som fantes fra før. Justerer time-/dags-innstillingen for gjeldende metode (Hurtigdeig, Kveldsdeig, eller kjøleskapsdager for Standard/Poolish/Biga), og bytter om nødvendig bort fra en fordeig-metode hvis selve fordeigen alene bruker mer tid enn melet tåler.",
      "Fjernet to overflødige elementer fra mobilvisningen: \"startoppsett\"-varselet (\"Velg pizzatype... eller åpne en lagret deig\") som overlappet med badgen på 🍽️ Mine deiger-knappen i toppen, og stjerne/favoritt-snarveien i toppen (favorittdeigen er fortsatt tilgjengelig via \"Mine deiger\"-listen, og via ★ Min favoritt i PC-menyen).",
      "Fikset at tekst inni modal-vinduer (Feedback, Formler, Hva er nytt, Guide) sluttet å vokse med skriftstørrelse-innstillingen, og dermed ble merkbart mindre enn resten av appen — spesielt tydelig på Feedback-siden. Dette var en bevisst, men for streng, avveining fra v5.8 sin fiks (se under) som skulle hindre at modalen ble høyere enn skjermen. Modal-boksens maks-høyde regnes nå ut i ekte skjerm-piksler via JavaScript i stedet for CSS zoom-kansellering, så teksten kan skalere normalt igjen samtidig som lukkeknappen garantert forblir synlig uansett skriftstørrelse. Bekreftet med skjermbilder og faktiske mål på alle tre nivåer."
    ],
    "changes_en": [
      "Fixed a real case of the top bar on mobile overlapping the content below it (e.g. a flour-type warning) — the top bar had a fixed height and couldn't fit both the name/version and the timestamp on two lines. The top bar now grows naturally when needed instead of clipping/overlapping. Confirmed with screenshot measurements.",
      "The flour-type warning (fermentation time/hydration doesn't match) now also has a quick button for the fermentation time itself — \"Increase proof time\"/\"Reduce proof time\" — in addition to the hydration and flour-swap buttons that were already there. It adjusts the hours/days setting for the current method (Quick dough, Evening dough, or cold-proof days for Standard/Poolish/Biga), and switches away from a preferment method if needed when the preferment alone uses more time than the flour can handle.",
      "Removed two redundant elements from the mobile view: the \"initial setup\" prompt (\"Choose a pizza type... or open a saved dough\") that overlapped with the badge on the 🍽️ My doughs button at the top, and the star/favorite shortcut at the top (the favorite dough is still available via the \"My doughs\" list, and via ★ My favorite in the desktop menu).",
      "Fixed text inside modal windows (Feedback, Formulas, What's new, Guide) no longer growing with the font-size setting, and therefore ending up noticeably smaller than the rest of the app — especially clear on the Feedback page. This was a deliberate, but too strict, trade-off from v5.8's fix (see below) meant to keep the modal from being taller than the screen. The modal box's max height is now calculated in real screen pixels via JavaScript instead of CSS zoom cancellation, so the text can scale normally again while the close button is guaranteed to stay visible regardless of font size. Confirmed with screenshots and actual measurements at all three levels."
    ]
  },
  {
    "v": "0.507",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Større font og ikon på bunn-menyfanene (mobil) — lettere å lese/treffe uansett skriftstørrelse-innstilling.",
      "Fikset tomrommet mellom Kopier/Kalender/Lagre-raden og bunn-fanelinja på \"Steg\"-fanen, som varierte med skriftstørrelse-innstillingen. Rot-årsaken var strukturell: knapperaden var \"sticky\" i forhold til selve fane-innholdet (som må kunne vokse med skriftstørrelsen for lesbarhet), mens bunn-menyen er sticky i forhold til hele siden — to ulike referanserammer som ikke alltid stemte overens. Knapperaden er nå \"fixed\" i forhold til selve skjermen, med posisjonen regnet ut i ekte skjerm-piksler via JavaScript, uavhengig av skriftstørrelse-innstillingen.",
      "Chicago sitt \"Rund godt med begge hender\"-steg presiserer nå at emnet presses ut i den runde jernpanna ved steking — samme presisering som Langpanne allerede hadde, for å unngå misforståelsen om at Chicago formes fritt for hånd som en napoletansk pizza.",
      "\"Om appen\" heter nå \"Info\" i bunn-menyen på mobil.",
      "\"Tips og teknikk\" er nå en egen knapp i Info-fanen (ved siden av Guide) i stedet for å alltid vises øverst — fanen blir kortere og ryddigere, og du slår opp teknikk-tipsene når du faktisk vil ha dem.",
      "Ryddet opp Info-fanen: gruppert i Hjelp (Guide/Tips og teknikk/Feedback), Admin (Formler/Admin) og Konto (Logg ut), med pil (›) på klikkbare rader. Versjonsnummer og \"Hva er nytt\" flyttet fra toppen til en rolig fotnote nederst.",
      "Forsøkt rettet: skriftstørrelse-kontrollen kunne overlappe radene under på enkelte enheter — flyttet mot-zoom-korreksjonen fra selve kontrollen til hele omsluttende boks, samme mønster som løste knapperad-avviket. Ikke bekreftet på ekte enhet ennå."
    ],
    "changes_en": [
      "Larger font and icons on the bottom menu tabs (mobile) — easier to read and tap regardless of your font-size setting.",
      "Fixed the gap between the Copy/Calendar/Save row and the bottom tab bar on the \"Steps\" tab, which varied with your font-size setting. The root cause was structural: the button row was \"sticky\" relative to the tab content itself (which has to be able to grow with the font size for readability), while the bottom menu is sticky relative to the whole page — two different frames of reference that didn't always line up. The button row is now \"fixed\" relative to the screen itself, with its position calculated in real screen pixels via JavaScript, independent of the font-size setting.",
      "Chicago's \"Round well with both hands\" step now clarifies that the dough is pressed out into the round pan during baking — the same clarification Sheet pan already had, to avoid the misconception that Chicago is shaped freehand like a Neapolitan pizza.",
      "\"About the app\" is now called \"Info\" in the bottom menu on mobile.",
      "\"Tips and technique\" is now its own button in the Info tab (next to Guide) instead of always showing at the top — the tab is shorter and tidier, and you pull up the technique tips when you actually want them.",
      "Tidied up the Info tab: grouped into Help (Guide/Tips and technique/Feedback), Admin (Formulas/Admin) and Account (Log out), with an arrow (›) on clickable rows. The version number and \"What's new\" moved from the top to a quiet footnote at the bottom.",
      "Attempted fix: the font-size control could overlap the rows below it on some devices — moved the counter-zoom correction from the control itself to the whole surrounding box, the same pattern that fixed the button-row discrepancy. Not yet confirmed on a real device."
    ]
  },
  {
    "v": "0.506",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Wizarden på mobil: \"antall pizzaer\" er flyttet fra Finjuster til Planlegging-steget, rett under \"Når vil du spise?\" — melmengde i gram ligger fortsatt alene i Finjuster.",
      "Lagt til app-ikon for hjemskjerm på iPhone og Android (manifest + apple-touch-icon), slik at \"Legg til på Hjem-skjerm\" viser et ordentlig ikon og navn i stedet for standard nettleser-favicon.",
      "Egen avkrysningsboks lagt til venstre for det grønne steg-nummeret i \"Steg\"-fanen, for å gjøre det tydeligere at steg kan hakes av — hele raden er fortsatt tap-mål for avhaking.",
      "Fikset en rot-årsak som ga to synlige feil: Kopier/Kalender/Lagre-knapperaden i \"Steg\"-fanen var ikke reelt sticky (måtte scrolle helt ned for å se den, eller den dukket opp midt i steg-listen i stedet for rett over bunn-menyen), og fanebytte kunne se tomt ut. Den fulle årsaken viste seg å være to ting sammen: mobil-visningen manglet en avgrenset skjermhøyde, og selve \"Steg\"-fanen manglet \"min-height:0\" som flex-element — uten den vokser fanen seg like høy som innholdet i stedet for å bli klippet til tilgjengelig skjermplass, uansett hvor lang tidsplanen er. Bekreftet rettet med faktiske skjermbilde-tester. I samme slengen: navigering mellom wizardens steg (Pizzatype → Metode → Planlegging → Finjuster) nullstiller nå også scroll-posisjonen, og en gammel duplikat-id i markupen (to elementer med samme id) er ryddet opp.",
      "Fikset at \"Hva er nytt\" (og andre modal-vinduer) kunne miste lukkeknappen ved \"Ekstra stor\" skrift-innstilling — modalen ble da fysisk høyere enn skjermen og sentrerte seg slik at toppen (med ✕-knappen) havnet utenfor synsfeltet. Modal-vinduer bruker nå samme mot-zoom-teknikk som knapper og faner allerede gjorde, slik at de alltid forblir innenfor skjermen uansett skriftstørrelse-innstilling. (Denne teknikken ble senere forbedret i v5.9 — se over.)",
      "Fikset en regresjon der nye brukere ikke fikk se wizarden ved aller første innlogging.",
      "Lagt til \"Logg ut\" i PC-versjonens ☰ Meny (fantes tidligere kun på mobil).",
      "Feedback-listen vises nå direkte når du åpner \"Feedback\", i stedet for bak en \"Se tidligere tilbakemeldinger\"-toggle. Alle tilbakemeldinger kan nå stemmes opp (👍, én stemme per person per sak). \"Merk som løst\" og \"Slett\" er strammet inn til kun å vises for admin — disse var tidligere synlige for alle ved en feil."
    ],
    "changes_en": [
      "Mobile wizard: \"number of pizzas\" moved from Fine-tune to the Planner step, right below \"When do you want to eat?\" — flour amount in grams still lives on its own in Fine-tune.",
      "Added a home-screen app icon for iPhone and Android (manifest + apple-touch-icon), so \"Add to Home Screen\" shows a proper icon and name instead of the default browser favicon.",
      "Added a dedicated checkbox to the left of the green step number in the \"Steps\" tab, to make it clearer that steps can be checked off — the whole row is still a tap target for checking off.",
      "Fixed a root cause behind two visible bugs: the Copy/Calendar/Save button row in the \"Steps\" tab wasn't truly sticky (you had to scroll all the way down to see it, or it appeared in the middle of the step list instead of just above the bottom menu), and switching tabs could look empty. The full cause turned out to be two things together: the mobile view lacked a bounded screen height, and the \"Steps\" tab itself lacked \"min-height:0\" as a flex element — without it, the tab grows as tall as its content instead of being clipped to the available screen space, no matter how long the schedule is. Confirmed fixed with actual screenshot tests. In the same pass: navigating between the wizard's steps (Pizza type → Method → Planner → Fine-tune) now also resets the scroll position, and an old duplicate id in the markup (two elements with the same id) was cleaned up.",
      "Fixed \"What's new\" (and other modal windows) potentially losing the close button at the \"Extra large\" font setting — the modal became physically taller than the screen and centered itself so the top (with the ✕ button) ended up out of view. Modal windows now use the same counter-zoom technique that buttons and tabs already did, so they always stay within the screen regardless of the font-size setting. (This technique was later improved in v5.9 — see above.)",
      "Fixed a regression where new users didn't see the wizard on their very first login.",
      "Added \"Log out\" to the PC version's ☰ Menu (previously only on mobile).",
      "The feedback list now shows directly when you open \"Feedback\", instead of behind a \"See earlier feedback\" toggle. All feedback can now be upvoted (👍, one vote per person per item). \"Mark as resolved\" and \"Delete\" have been tightened to only show for admins — these were previously visible to everyone by mistake."
    ]
  },
  {
    "v": "0.505",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Pizzaplanlegger\"-fanen på mobil heter nå \"Planlegging\".",
      "\"Neste steg å gjøre\" vises nå alltid fullt lesbart, selv om du ligger foran skjema og klokken teknisk sett ikke har nådd steget ennå.",
      "Skriftstørrelse-skalaen er forskjøvet ett hakk opp: \"Normal\" er nå det som før het \"Stor\", \"Stor\" er det som før het \"Ekstra stor\" (ny standard for alle nye brukere), og \"Ekstra stor\" er et helt nytt, enda større nivå.",
      "Dato-overskriften i steg-listen er forstørret, for tydeligere skille mellom dager.",
      "Litt større skrift på bunn-fanene (Planlegging/Steg/Oppskrift/Notater/Deiger/Om appen).",
      "Finjuster-skjermen har nå en ekte tilbakepil øverst (går til Planlegging-steget) og en tydelig, fylt \"✓ Ferdig — se steg for steg\"-knapp nederst — venstrepilen betydde tidligere \"avslutt alt\", noe som lett kunne forveksles med wizardens vanlige tilbake-navigasjon.",
      "Fjernet stjerne-ikonet fra vurderings-knappen på ferdige deiger (var forvirrende ved siden av favoritt-stjernen på samme kort) — viser nå konsekvent et blyant-ikon.",
      "Wizardens fremdriftsindikator er bygget om til en tydelig tidslinje — nummererte/hakede sirkler med linjer mellom, og alle tre stegnavn synlige samtidig (oppdateres til dine faktiske valg etter hvert). Innholdet starter også litt lenger ned fra toppen for mer luft.",
      "\"Starter nå\" viser ikke lenger et dato/tid-felt å fylle ut — bruker nåværende tidspunkt stille i bakgrunnen. Feltet finnes fortsatt under \"Steketid\", der det faktisk gir mening å oppgi et tidspunkt.",
      "Tre nye meltyper lagt til: Vanlig hvetemel, Regal Pizzamel og Regal Tipo 00 — proteininnhold hentet fra faktisk næringsinnhold, mens hydrerings- og fermenteringstall er merket \"(anslått)\" siden disse ikke er produsent-oppgitt slik de er for Caputo-melene."
    ],
    "changes_en": [
      "The \"Pizza planner\" tab on mobile is now called \"Planner\".",
      "\"Next step to do\" now always shows fully readable, even if you're ahead of schedule and the clock technically hasn't reached the step yet.",
      "The font-size scale has been shifted up one notch: \"Normal\" is now what used to be \"Large\", \"Large\" is what used to be \"Extra large\" (the new default for all new users), and \"Extra large\" is a brand-new, even larger level.",
      "The date heading in the step list has been enlarged, for a clearer distinction between days.",
      "Slightly larger text on the bottom tabs (Planner/Steps/Recipe/Notes/Doughs/About the app).",
      "The Fine-tune screen now has a real back arrow at the top (goes to the Planner step) and a clear, filled \"✓ Done — see step by step\" button at the bottom — the left arrow previously meant \"exit everything\", which was easy to confuse with the wizard's normal back navigation.",
      "Removed the star icon from the rating button on finished doughs (it was confusing next to the favorite star on the same card) — now consistently shows a pencil icon.",
      "The wizard's progress indicator has been rebuilt into a clear timeline — numbered/checked circles with lines between them, and all three step names visible at once (updated to your actual choices as you go). The content also starts a little further down from the top for more breathing room.",
      "\"Starting now\" no longer shows a date/time field to fill in — it quietly uses the current time in the background. The field still exists under \"Bake time\", where specifying a time actually makes sense.",
      "Three new flour types added: Plain wheat flour, Regal Pizzamel and Regal Tipo 00 — protein content taken from actual nutritional info, while hydration and fermentation figures are marked \"(estimated)\" since these aren't provided by the manufacturer the way they are for the Caputo flours."
    ]
  },
  {
    "v": "0.504",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Meltype-varselet (gjæringstid/hydrering stemmer ikke) har nå hurtigjustering direkte i varselet — \"Sett hydrering til X%\" og/eller \"Bytt til [meltype]\" — i stedet for at du må bytte til Pizzaplanlegger-fanen for å justere. Bruker nøyaktig samme funksjoner som selve fanen, så resultatet blir identisk uansett hvor du justerer fra. Fungerer likt på PC og mobil."
    ],
    "changes_en": [
      "The flour-type warning (fermentation time/hydration don't match) now has a quick adjustment right in the warning — \"Set hydration to X%\" and/or \"Switch to [flour type]\" — instead of having to switch to the Pizza planner tab to adjust. It uses exactly the same functions as the tab itself, so the result is identical no matter where you adjust from. Works the same on PC and mobile."
    ]
  },
  {
    "v": "0.503",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Trykk på logoen (\"🍕 Pizzaplanlegger\") for å åpne Guiden — både PC og mobil. Versjonsnummeret under logoen åpner fortsatt \"Hva er nytt\" som før, uavhengig av dette."
    ],
    "changes_en": [
      "Tap the logo (\"🍕 Pizza planner\") to open the Guide — on both PC and mobile. The version number under the logo still opens \"What's new\" as before, independently of this."
    ]
  },
  {
    "v": "0.502",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Lagt til en tydelig \"Lukk\"-knapp nederst i \"Hva er nytt\" — en veldig lang endringslogg kunne gjøre ✕-knappen øverst vanskelig å nå uten å scrolle helt tilbake opp.",
      "Fikset en reell feil: wizarden på mobil viste seg ikke ved aller første sideinnlasting — måtte bytte fane frem og tilbake for at den skulle dukke opp. Innstillinger-fanen var allerede markert aktiv i selve HTML-en fra start, så koblingen som skulle starte wizarden ble aldri utløst automatisk.",
      "\"Tips\" er slått sammen med \"Om appen\" til én fane — samler tips, skriftstørrelse, versjon/Hva er nytt, Guide, Feedback, Formler og Admin på ett sted. Innstillinger-fanen (wizarden) er nå ren konfigurasjon, uten noe av dette.",
      "Nullstill-knappen er fjernet, både PC og mobil — \"Start noe nytt\" i wizarden dekker samme behov på mobil.",
      "Guiden har nå en \"Prøv det nå →\"-knapp på mobil som starter wizarden direkte, i stedet for å bare beskrive stegene i tekst."
    ],
    "changes_en": [
      "Added a clear \"Close\" button at the bottom of \"What's new\" — a very long changelog could make the ✕ button at the top hard to reach without scrolling all the way back up.",
      "Fixed a real bug: the wizard on mobile didn't show on the very first page load — you had to switch tabs back and forth for it to appear. The Settings tab was already marked active in the HTML itself from the start, so the trigger meant to start the wizard was never fired automatically.",
      "\"Tips\" has been merged with \"About the app\" into one tab — gathering tips, font size, version/What's new, Guide, Feedback, Formulas and Admin in one place. The Settings tab (the wizard) is now pure configuration, without any of this.",
      "The Reset button has been removed, on both PC and mobile — \"Start something new\" in the wizard covers the same need on mobile.",
      "The Guide now has a \"Try it now →\" button on mobile that starts the wizard directly, instead of just describing the steps in text."
    ]
  },
  {
    "v": "0.501",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny wizard-flyt for innstillinger på mobil — erstatter den lange ettsides listen med tre korte steg (Pizzatype → Metode → Når vil du spise), med brødsmule-sti øverst du kan trykke på for å hoppe rett tilbake til et tidligere valg.",
      "Returnerende brukere møtes av et valg først: \"Bruk samme som sist\", \"Åpne favoritten min\", eller \"Start noe nytt\" — for å unngå at wizarden blir tungvint hvis du baker samme oppskrift ofte.",
      "\"Finjuster\"-lenke på siste steg åpner alle de andre innstillingene (mel, hydrering, gjærtype, meltype osv.) samlet, for de som vil justere mer.",
      "Kun mobil — PC-versjonen er uendret."
    ],
    "changes_en": [
      "New wizard flow for settings on mobile — replaces the long single-page list with three short steps (Pizza type → Method → When do you want to eat), with a breadcrumb trail at the top you can tap to jump straight back to an earlier choice.",
      "Returning users are met with a choice first: \"Use the same as last time\", \"Open my favorite\", or \"Start something new\" — to avoid the wizard becoming a hassle if you bake the same recipe often.",
      "A \"Fine-tune\" link on the last step opens all the other settings (flour, hydration, yeast type, flour type, etc.) together, for those who want to adjust more.",
      "Mobile only — the PC version is unchanged."
    ]
  },
  {
    "v": "0.500",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Mobilens \"Steg for steg\"-fane er kortet ned til \"Steg\" — den forrige teksten ble dårlig wrappet i bunnmenyen.",
      "Dytt-videre-indikatoren er endret fra en engangs-pulsering til noe varig: den vises nå konsekvent hver gang du er på Innstillinger-fanen (du har nettopp valgt noe, gå videre til Steg), og skjules kun mens du faktisk står i Steg-fanen — ikke en engangsting du kan \"bruke opp\"."
    ],
    "changes_en": [
      "The mobile \"Step by step\" tab has been shortened to \"Steps\" — the previous text wrapped badly in the bottom menu.",
      "The nudge-forward indicator has changed from a one-time pulse to something lasting: it now shows consistently every time you're on the Settings tab (you've just chosen something, move on to Steps), and hides only while you're actually on the Steps tab — not a one-time thing you can \"use up\"."
    ]
  },
  {
    "v": "0.499",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"Tidsplan\" heter nå \"Steg for steg\" — mer tydelig for nye brukere at det er her selve fremgangsmåten vises, ikke bare en kalenderoversikt.",
      "Ny pulserende prikk på \"Steg for steg\"-fanen på mobil, synlig helt til du besøker den første gang — en tydelig dytt videre etter at du har valgt pizzatype/metode i innstillinger."
    ],
    "changes_en": [
      "\"Schedule\" is now called \"Step by step\" — clearer for new users that this is where the actual method is shown, not just a calendar overview.",
      "New pulsing dot on the \"Step by step\" tab on mobile, visible until you visit it for the first time — a clear nudge forward after you've chosen pizza type/method in settings."
    ]
  },
  {
    "v": "0.498",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en reell feil i gjærregnskapet for Poolish og Biga — kun 50% (Poolish) og 10% (Biga) av beregnet gjærmengde ble faktisk brukt i oppskriftene, resten forsvant sporløst. All gjæren legges nå riktig i selve for-deigen (poolishen/bigaen), ingenting tilsettes i sluttblandingen — det er slik det faktisk skal gjøres.",
      "Rettet en upresis forklaring om melkesyrebakterier i Poolish-teknikken — det er primært enzymer, gjærens egne fermenteringsprodukter og milde organiske syrer som bygger smak, ikke melkesyrebakterier (som spiller en mye større rolle i ekte surdeig).",
      "\"Poolish gir løsere glutenstruktur\" er endret til riktig beskrivelse: poolish gjør deigen mer extensibel (lettere å strekke), ikke løsere.",
      "New York-pizzaens steketemperatur er endret fra et absolutt tak (\"ikke over 350°C\") til et veiledende intervall med rom for justering etter egen ovn."
    ],
    "changes_en": [
      "Fixed a real bug in the yeast calculation for Poolish and Biga — only 50% (Poolish) and 10% (Biga) of the calculated yeast amount was actually used in the recipes, the rest vanished without a trace. All the yeast is now correctly placed in the preferment itself (the poolish/biga), with nothing added to the final mix — which is how it's actually supposed to be done.",
      "Corrected an imprecise explanation about lactic acid bacteria in the Poolish technique — it's primarily enzymes, the yeast's own fermentation products and mild organic acids that build flavor, not lactic acid bacteria (which play a much bigger role in real sourdough).",
      "\"Poolish gives a looser gluten structure\" has been changed to the correct description: poolish makes the dough more extensible (easier to stretch), not looser.",
      "The New York pizza's baking temperature has been changed from an absolute cap (\"no higher than 350°C\") to a guiding range with room to adjust for your own oven."
    ]
  },
  {
    "v": "0.497",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en oppstartsfeil på mobil der Pizzatype og Metode kunne vises tomme når appen ble åpnet direkte på telefon (ikke via \"bytt til mobil\" på PC) — mobil-innholdet ligger fysisk etter hovedskriptet i selve filen, og kunne i noen tilfeller forsøke å fylles ut før den delen av siden var ferdig lastet inn. Lagt til et sikkerhetsnett som garantert fyller alt på nytt når absolutt alt er klart."
    ],
    "changes_en": [
      "Fixed a startup bug on mobile where Pizza type and Method could show empty when the app was opened directly on the phone (not via \"switch to mobile\" on PC) — the mobile content sits physically after the main script in the file itself, and in some cases could try to be filled in before that part of the page had finished loading. Added a safety net that is guaranteed to refill everything once absolutely everything is ready."
    ]
  },
  {
    "v": "0.496",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Rettet en upresis forklaring på romtemperaturheving/bulk-heving — den blandet en generell påstand om gjærbiologi (\"gjæren er mest aktiv 25–35°C\") med et urelatert 60-minutters referansetall, uavhengig av hvor lang selve hevingen faktisk var. Forklaringen viser nå riktig, faktisk varighet for akkurat det steget.",
      "Elting nevner nå et mål for sluttdeigtemperatur (ca. 24°C for Hurtigdeig, ca. 20–22°C for Kveldsdeig) i tillegg til minuttall — mer robust enn ren tid, siden kjøkkenmaskiner og mel varierer.",
      "Forvarming i Hurtigdeig presiserer nå at vanlig ovn med pizzastein/-stål trenger 45–60 min forvarming, ikke bare selve lufttemperaturen — samme presisjon Standard-metoden allerede hadde.",
      "Rettet en gjenstående entall/flertall-feil (\"1 timer\" → \"1 time\") i visning av hevetider."
    ],
    "changes_en": [
      "Corrected an imprecise explanation of room-temperature proofing/bulk fermentation — it mixed a general claim about yeast biology (\"yeast is most active at 25–35°C\") with an unrelated 60-minute reference figure, regardless of how long the proof actually was. The explanation now shows the correct, actual duration for that specific step.",
      "Kneading now mentions a target final dough temperature (about 24°C for Quick dough, about 20–22°C for Evening dough) in addition to minutes — more robust than time alone, since stand mixers and flour vary.",
      "Preheating in Quick dough now clarifies that a regular oven with a pizza stone/steel needs 45–60 min of preheating, not just the air temperature itself — the same precision the Standard method already had.",
      "Fixed a remaining singular/plural error (\"1 hours\" → \"1 hour\") in the display of proofing times."
    ]
  },
  {
    "v": "0.495",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset et avvik i \"Kopier\"-funksjonen: gjærmengden i ingredienslisten stemte ikke alltid med det som faktisk sto i selve tidsplan-steget for Hurtigdeig og Kveldsdeig, siden kopieringen brukte en annen (generell) beregning enn de to metodene faktisk bruker."
    ],
    "changes_en": [
      "Fixed a discrepancy in the \"Copy\" function: the yeast amount in the ingredient list didn't always match what was actually shown in the schedule step itself for Quick dough and Evening dough, since the copy used a different (general) calculation than the two methods actually use."
    ]
  },
  {
    "v": "0.494",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Hurtigdeig bruker nå en beregnet vanntemperatur i stedet for et fast \"lunkent, 35–38°C\" — basert på samme \"ønsket deigtemperatur\"-formel profesjonelle bakere bruker (3 × måltemperatur − romtemperatur × 2 − friksjon fra eltemetoden). Målet er ca. 24°C ferdig deig uansett timevalg, siden det er gjærmengden som skal styre hvor fort deigen går — ikke vanntemperaturen. Tallet endrer seg med romtemperatur og valgt kjøkkenmaskin.",
      "Ny forklaring i Teknikk om hvorfor vanntemperaturen nå regnes ut i stedet for å være fast."
    ],
    "changes_en": [
      "Quick dough now uses a calculated water temperature instead of a fixed \"lukewarm, 35–38°C\" — based on the same \"desired dough temperature\" formula professional bakers use (3 × target temperature − room temperature × 2 − friction from the kneading method). The goal is about 24°C finished dough regardless of the chosen hours, since it's the yeast amount that should control how fast the dough goes — not the water temperature. The number changes with room temperature and the chosen stand mixer.",
      "New explanation in Technique about why the water temperature is now calculated instead of fixed."
    ]
  },
  {
    "v": "0.493",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Meltype-varselet sjekker nå også hydrering, ikke bare gjæringstid — velger du f.eks. Dallari pizzamel (55–60%) mens hydreringen står på 65%, får du nå beskjed om det. Viser begge problemene samlet hvis både tid og hydrering ikke stemmer."
    ],
    "changes_en": [
      "The flour-type warning now also checks hydration, not just fermentation time — if you choose, say, Dallari pizzamel (55–60%) while hydration is set to 65%, you now get told about it. Shows both problems together if both time and hydration are off."
    ]
  },
  {
    "v": "0.492",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "\"★ Min favoritt\" er flyttet fra en egen knapp i sidepanelet til en handling i \"☰ Meny\". Fikset samtidig en underliggende svakhet — å åpne favoritten kunne feile stille hvis \"Deiger\" aldri var åpnet i økten ennå.",
      "Guiden vises nå automatisk hver gang du logger inn, helt til du trykker \"Ikke vis igjen\" — å bare lukke den med ✕ viser den på nytt neste gang.",
      "Standard kjøleskapsheving er endret fra 3 til 1 dag — 3 dager kombinert med standard meltype (Doppio Zero) ga et gjæringsvarsel til nesten alle nye brukere med en gang, siden 72 timer ligger utenfor Doppio Zero sitt 24-timers vindu. Gjelder også ved Nullstill."
    ],
    "changes_en": [
      "\"★ My favorite\" has been moved from its own button in the side panel to an action in the \"☰ Menu\". At the same time fixed an underlying weakness — opening the favorite could fail silently if \"Doughs\" had never been opened in the session yet.",
      "The Guide now shows automatically every time you log in, until you press \"Don't show again\" — just closing it with ✕ shows it again next time.",
      "The default refrigerator proof has been changed from 3 to 1 day — 3 days combined with the default flour type (Doppio Zero) gave a fermentation warning to almost every new user right away, since 72 hours is outside Doppio Zero's 24-hour window. Also applies on Reset."
    ]
  },
  {
    "v": "0.491",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset en reell feil: etter å ha lagret en deig på PC, viste appen fortsatt \"Ulagret oppsett\" til du gjorde en annen endring — lagringen fungerte, men visningen oppdaterte seg ikke med en gang.",
      "Overskriften viser nå navnet på lagret deig, f.eks. \"Langpannepizza · standard · Runes lagrede pizza\".",
      "\"Pålogget som [navn]\" vises nå nederst i sidepanelet.",
      "Feedback-skjemaet lukker seg selv kort tid etter vellykket sending, i stedet for at du må trykke ✕ manuelt."
    ],
    "changes_en": [
      "Fixed a real bug: after saving a dough on PC, the app still showed \"Unsaved setup\" until you made another change — the save worked, but the display didn't update right away.",
      "The heading now shows the name of the saved dough, e.g. \"Sheet pan pizza · standard · Rune's saved pizza\".",
      "\"Logged in as [name]\" now shows at the bottom of the side panel.",
      "The feedback form closes itself shortly after a successful send, instead of you having to press ✕ manually."
    ]
  },
  {
    "v": "0.490",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kalender-påminnelser (\"📅 Påminnelser\") tilbake på PC — lastet ned som en .ics-fil med varsel 10 min før hvert steg. Fantes fra før kun på mobil.",
      "Ferdige deiger kan nå få et bilde og en stjernevurdering (1–5) — trykk \"Ferdig\" på en aktiv deig, eller \"✏️\"/\"⭐\" på en allerede ferdig deig for å legge til eller endre i etterkant.",
      "Ingredienser i Oppskrift-fanen kan nå hakes av (mel, vann, salt osv.) mens du henter dem frem — lagres sammen med deigen, akkurat som avhaking av steg i Tidsplan.",
      "Guiden nevner nå at Tips, Deiger, Feedback og mer finnes i \"☰ Meny\" øverst.",
      "\"⋯ Mer\" er omdøpt til \"☰ Meny\" for å signalisere navigasjon tydeligere, og \"IngenElting\" skrives nå \"Ingen elting\" i alle visningstekster."
    ],
    "changes_en": [
      "Calendar reminders (\"📅 Reminders\") are back on PC — downloaded as an .ics file with an alert 10 min before each step. Previously only on mobile.",
      "Finished doughs can now get a photo and a star rating (1–5) — press \"Done\" on an active dough, or \"✏️\"/\"⭐\" on an already-finished dough to add or change it afterward.",
      "Ingredients in the Recipe tab can now be checked off (flour, water, salt, etc.) as you pull them out — saved together with the dough, just like checking off steps in the Schedule.",
      "The Guide now mentions that Tips, Doughs, Feedback and more are found in the \"☰ Menu\" at the top.",
      "\"⋯ More\" has been renamed to \"☰ Menu\" to signal navigation more clearly, and \"IngenElting\" is now written \"No-knead\" in all display text."
    ]
  },
  {
    "v": "0.489",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt gjennomgående design — kjøligere fargepalett, hvite kort med skygge i stedet for synlige kanter, og et strammere visuelt uttrykk gjennom hele appen.",
      "Meltype er endret fra piller til en vanlig nedtrekksmeny (dropdown) — seks lange melnavn i pille-form så rotete ut, spesielt på mobil der hover-tekst uansett ikke fungerer.",
      "Gjærtype, Kjøkkenmaskin og Ovntype vises nå som en ekte segmentert kontroll (én sammenhengende boks) i stedet for løse piller, både på PC og mobil.",
      "Sidenav (Guide/Tips/Deiger/Feedback/Formler/Admin) er samlet i én kompakt \"⋯ Mer\"-meny i stedet for seks alltid-synlige knapper.",
      "Knapper er redusert til to konsekvente stiler i hele appen — fylt primær og nøytral \"ghost\" — med fast høyde.",
      "Skriftstørrelse-innstillingen påvirker nå kun lesetekst (steg, forklaringer) — knapper, piller og navigasjon holder fast størrelse uansett innstilling."
    ],
    "changes_en": [
      "A new design throughout — a cooler color palette, white cards with shadow instead of visible borders, and a tighter visual look across the whole app.",
      "Flour type has been changed from pills to a regular dropdown menu — six long flour names in pill form looked cluttered, especially on mobile where hover text doesn't work anyway.",
      "Yeast type, Stand mixer and Oven type now show as a real segmented control (one continuous box) instead of loose pills, on both PC and mobile.",
      "The side nav (Guide/Tips/Doughs/Feedback/Formulas/Admin) has been gathered into one compact \"⋯ More\" menu instead of six always-visible buttons.",
      "Buttons have been reduced to two consistent styles across the whole app — filled primary and neutral \"ghost\" — with a fixed height.",
      "The font-size setting now only affects reading text (steps, explanations) — buttons, pills and navigation keep a fixed size regardless of the setting."
    ]
  },
  {
    "v": "0.488",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fjernet dupliserte \"Vis/skjul forklaringer\"-kontroller (fantes både i sidepanelet/mobil-Visning og i handlingsgruppen) — finnes nå kun ett sted.",
      "\"Planlegging\" (når du vil spise) er flyttet opp til rett etter Metode, både på PC og mobil — tidligere lå den nederst, bak seks andre innstillinger, selv om det ofte er den første beslutningen man faktisk tar.",
      "Ny \"❓ Guide\"-lenke lagt til på mobil — fantes tidligere kun på PC (bortsett fra automatisk førstegangsvisning).",
      "Visuelt skille i navigasjonen mellom verktøy for alle (Guide/Tips/Deiger/Feedback) og admin-verktøy (Formler/Admin), på både PC og mobil."
    ],
    "changes_en": [
      "Removed duplicate \"Show/hide explanations\" controls (they existed both in the side panel/mobile View and in the action group) — now there's just one.",
      "\"Planner\" (when you want to eat) has moved up to right after Method, on both desktop and mobile — it used to sit at the bottom, behind six other settings, even though it's often the first decision you actually make.",
      "New \"❓ Guide\" link added on mobile — it was previously only on desktop (apart from the automatic first-time view).",
      "Visual separation in the navigation between tools for everyone (Guide/Tips/Doughs/Feedback) and admin tools (Formulas/Admin), on both desktop and mobile."
    ]
  },
  {
    "v": "0.487",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny \"📊 Formler\"-side i sidenav — viser salt/olje/gjær/hydrering for alle pizzatyper. Åpen for alle å se, redigerbar for admin.",
      "Admin kan nå endre disse kjernetallene direkte i appen, uten å be meg redigere kode og deploye på nytt. Forrige verdi vises alltid ved siden av, med en \"↺ angre\"-knapp.",
      "Vanlige brukere kan foreslå en ny verdi for et tall (med begrunnelse) — admin ser innsendte forslag i Formler-siden og kan bruke eller avvise dem med ett trykk.",
      "Appen venter nå på å hente disse tallene fra serveren før noe vises ved oppstart, slik at ingen noensinne ser utdaterte tall."
    ],
    "changes_en": [
      "New \"📊 Formulas\" page in the side nav — shows salt/oil/yeast/hydration for every pizza type. Open for anyone to view, editable by admin.",
      "Admin can now change these core numbers directly in the app, without asking me to edit code and redeploy. The previous value is always shown alongside, with a \"↺ undo\" button.",
      "Regular users can suggest a new value for a number (with a reason) — admin sees submitted suggestions on the Formulas page and can apply or reject them with one tap.",
      "The app now waits to fetch these numbers from the server before showing anything at startup, so no one ever sees outdated numbers."
    ]
  },
  {
    "v": "0.486",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Meltype viser nå protein, styrke (W), hydrering og fermenteringsvindu i en alltid-synlig infolinje under pillene — fungerer på mobil, der den gamle hover-teksten aldri var synlig i utgangspunktet siden touch-skjermer ikke har hover."
    ],
    "changes_en": [
      "Flour type now shows protein, strength (W), hydration and fermentation window in an always-visible info line under the pills — works on mobile, where the old hover text was never visible in the first place since touch screens don't have hover."
    ]
  },
  {
    "v": "0.485",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Neste steg å gjøre får nå en tydelig blå markering (\"👉 neste\") — det er det første ikke-avhakede steget, og henger sammen med klokka: er du på etterskudd peker den på det du mangler, er du i rute faller den sammen med den vanlige \"nå\"-fremhevingen (og vises da ikke som en ekstra boks).",
      "Haker du av et steg, scroller siden nå automatisk til neste steg — nyttig på en lang tidsplan der du ellers må lete etter hvor du var."
    ],
    "changes_en": [
      "The next step to do now gets a clear blue highlight (\"👉 next\") — it's the first unchecked step, and it ties in with the clock: if you're behind, it points to what you're missing; if you're on track, it lines up with the usual \"now\" highlight (and then isn't shown as an extra box).",
      "Check off a step and the page now scrolls automatically to the next one — handy on a long schedule where you'd otherwise have to hunt for where you were."
    ]
  },
  {
    "v": "0.484",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Fikset lukkeknappen på popup-vinduer (Tips, Hva er nytt, Deiger, Feedback, Guide, Admin) på telefoner med hakk/dynamisk øy — vinduet kunne tidligere rendres bak den øverste sikkerhetssonen, slik at ✕ ble vanskelig eller umulig å treffe."
    ],
    "changes_en": [
      "Fixed the close button on popup windows (Tips, What's new, Doughs, Feedback, Guide, Admin) on phones with a notch/dynamic island — the window could previously render behind the top safe zone, making the ✕ hard or impossible to hit."
    ]
  },
  {
    "v": "0.483",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Gjærtype, Kjøkkenmaskin, Meltype og Ovntype er samlet bak \"⚙️ Avanserte innstillinger\" i sidepanelet, lukket som standard — kjernevalgene (Pizzatype, Metode, Melmengde, Planlegging) er nå det eneste en ny bruker møter først.",
      "Ny \"❓ Guide\"-lenke i sidepanelet — en kort 4-stegs quickstart som viser seg automatisk første gang du logger inn, og er tilgjengelig når som helst etterpå.",
      "\"Teknikk\" heter nå \"Tips\" — samme innhold, mindre teknisk klingende navn."
    ],
    "changes_en": [
      "Yeast type, Stand mixer, Flour type and Oven type are now grouped behind \"⚙️ Advanced settings\" in the side panel, closed by default — the core choices (Pizza type, Method, Flour amount, Planner) are now the only thing a new user meets first.",
      "New \"❓ Guide\" link in the side panel — a short 4-step quickstart that shows automatically the first time you log in, and is available any time afterward.",
      "\"Technique\" is now called \"Tips\" — same content, a less technical-sounding name."
    ]
  },
  {
    "v": "0.482",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Enkel innlogging med navn + 4-sifret PIN — første gang du skriver navnet ditt, lager du en PIN; neste gang logger du inn med samme navn og PIN. Forblir innlogget til du selv logger ut.",
      "Ny admin-visning (lenke nederst på innloggingsskjermen, passordbeskyttet) for å se alle brukere, sette ny PIN, og slette brukere."
    ],
    "changes_en": [
      "Simple login with name + 4-digit PIN — the first time you enter your name, you create a PIN; next time you log in with the same name and PIN. You stay logged in until you log out yourself.",
      "New admin view (link at the bottom of the login screen, password-protected) to see all users, set a new PIN, and delete users."
    ]
  },
  {
    "v": "0.481",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Favoritt-merking av lagrede deiger (★ på kortet i Mine deiger) — kun én av gangen. En ny \"★ Min favoritt\"-knapp dukker opp i sidepanelet (og mobiltoppfeltet) og åpner favoritten direkte, uten å lete gjennom listen.",
      "Ny \"Gi tilbakemelding\"-funksjon — send inn kategori (mel/feil/forslag/annet) + melding, med versjon og gjeldende innstillinger sendt med automatisk. Lagres delt via Netlify Blobs, med en egen liste du kan se og merke som løst inne i appen."
    ],
    "changes_en": [
      "Favorite-marking of saved doughs (★ on the card in My doughs) — only one at a time. A new \"★ My favorite\" button appears in the side panel (and the mobile top bar) and opens the favorite directly, without hunting through the list.",
      "New \"Give feedback\" feature — submit a category (flour/bug/suggestion/other) + message, with the version and current settings sent along automatically. Stored shared via Netlify Blobs, with its own list you can view and mark as resolved inside the app."
    ]
  },
  {
    "v": "0.480",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Hurtigdeig utvidet fra 2–10 til 2–16 timer — de tre nye alternativene (12/14/16t) er kalibrert for et kjøligere kjøkken (18–20°C), etter research som viser at dette er helt vanlig praksis ved lavere romtemperatur.",
      "Beskrivelsen er endret fra \"uten kjøleskapsheving\" til \"romtemperatur\", siden det er det som faktisk kjennetegner metoden.",
      "Nytt varsel hvis du velger en lang hurtigdeig-variant (12t+) samtidig som romtemperaturen er stilt til 22°C eller høyere — de lange alternativene forutsetter et kjøligere kjøkken enn det."
    ],
    "changes_en": [
      "Quick dough extended from 2–10 to 2–16 hours — the three new options (12/14/16h) are calibrated for a cooler kitchen (18–20°C), following research showing this is completely normal practice at lower room temperatures.",
      "The description has changed from \"without cold-proofing\" to \"room temperature\", since that's what actually characterizes the method.",
      "New alert if you pick a long quick-dough option (12h+) while room temperature is set to 22°C or higher — the long options assume a cooler kitchen than that."
    ]
  },
  {
    "v": "0.479",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Caputo Pizzeria og Nuvola sitt gjæringstak økt fra hhv. 36t/40t til 48t, etter kryssjekk mot Maschmanns (norsk Caputo-distributør) — Doppio Zero sitt tak på 24t stemte allerede.",
      "Mindre presiseringer i protein/styrke-tall for Couco og Manitoba Oro basert på samme kryssjekk.",
      "Fikset en timing-illusjon: pille- og kortvalg (pizzatype, metode, meltype, gjærtype, kjøkkenmaskin, ovntype, timevalg, nullstill) oppdaterer nå tidsplanen umiddelbart i stedet for etter en liten forsinkelse — klikker du fort gjennom flere valg, henger ikke visningen lenger igjen på det forrige valget."
    ],
    "changes_en": [
      "Caputo Pizzeria and Nuvola's fermentation cap raised from 36h/40h respectively to 48h, after cross-checking with Maschmanns (the Norwegian Caputo distributor) — Doppio Zero's 24h cap was already correct.",
      "Minor refinements to protein/strength figures for Couco and Manitoba Oro based on the same cross-check.",
      "Fixed a timing illusion: pill and card choices (pizza type, method, flour type, yeast type, stand mixer, oven type, hour choice, reset) now update the schedule immediately instead of after a slight delay — click quickly through several choices and the display no longer lags behind on the previous one."
    ]
  },
  {
    "v": "0.478",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt valg: Meltype (Dallari, Caputo Doppio Zero/Pizzeria/Nuvola/Couco/Manitoba Oro) — basert på MENY sin meloversikt, med protein, styrke (W) og anbefalt fermenteringsvindu per mel.",
      "Nytt varsel direkte øverst i Tidsplan hvis planlagt total gjæringstid ligger utenfor det valgte melets anbefalte vindu — for kort tid gir dårlig glutenutvikling, for lang tid kan bryte ned gluten. Regner riktig uansett metode (dager for Standard/Poolish/Biga, timer for Hurtigdeig/Kveldsdeig/IngenElting)."
    ],
    "changes_en": [
      "New choice: Flour type (Dallari, Caputo Doppio Zero/Pizzeria/Nuvola/Couco/Manitoba Oro) — based on MENY's flour overview, with protein, strength (W) and recommended fermentation window per flour.",
      "New alert right at the top of Schedule if the planned total fermentation time falls outside the chosen flour's recommended window — too short gives poor gluten development, too long can break down gluten. Calculates correctly regardless of method (days for Standard/Poolish/Biga, hours for Quick dough/Evening dough/No-knead)."
    ]
  },
  {
    "v": "0.477",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Chicago: lagt til smør som egen ingrediens (12% av melvekten), i tillegg til oljen — etter sammenligning med flere anerkjente oppskrifter som viste at appen brukte 2–3× for lite fett for den karakteristiske flakete Chicago-skorpen.",
      "Chicago: hydrering justert ned fra 59% til 55%, nærmere det som er vanlig i ekte deep dish-oppskrifter.",
      "Gjærkurven for lange kaldhevinger (Standard/Poolish/Biga, 1–6 dager) er skalert ned ~25% — samme type justering som Kveldsdeig fikk, etter at sammenligning med AVPN-kilder viste at kurven lå i overkant for flerdagers kaldheving.",
      "Ny forklaring i Teknikk om hvorfor Chicago har mer smør enn andre stiler, med valgfri \"laminering\"-teknikk for en ekstra flakete skorpe."
    ],
    "changes_en": [
      "Chicago: added butter as its own ingredient (12% of the flour weight), in addition to the oil — after comparing several respected recipes that showed the app was using 2–3× too little fat for the characteristic flaky Chicago crust.",
      "Chicago: hydration adjusted down from 59% to 55%, closer to what's common in real deep dish recipes.",
      "The yeast curve for long cold-proofs (Standard/Poolish/Biga, 1–6 days) has been scaled down ~25% — the same kind of adjustment Evening dough got, after comparing with AVPN sources showed the curve was running a bit high for multi-day cold proofing.",
      "New explanation in Tips about why Chicago has more butter than other styles, with an optional \"lamination\" technique for an extra flaky crust."
    ]
  },
  {
    "v": "0.476",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Salt for Napoletansk økt fra 2,5% til 2,8% (12,5g → 14g ved 500g mel) etter tilbakemelding om bedre smak ved høy steketemperatur.",
      "Kveldsdeig utvidet til 5–24 timer (var 5–15t) — nye valg på 18 og 24 timer gir et ekte \"kveld til neste kveld\"-vindu, ikke bare korte varianter. Tempereringstiden øker til 2 timer for de lengste variantene."
    ],
    "changes_en": [
      "Salt for Neapolitan raised from 2.5% to 2.8% (12.5g → 14g at 500g flour) after feedback about better flavor at high baking temperatures.",
      "Evening dough extended to 5–24 hours (was 5–15h) — new options at 18 and 24 hours give a true \"evening to next evening\" window, not just short variants. The tempering time increases to 2 hours for the longest variants."
    ]
  },
  {
    "v": "0.475",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Kveldsdeig: gjærmengden er redusert ca. 25% etter tilbakemelding om at den lå i overkant — mindre margin for overgjæring, spesielt i varmere kjøleskap.",
      "Kveldsdeig: mindre skråsikker \"hvorfor kaldt vann\"-forklaring — presiserer at det handler om kontroll på deigtemperatur, ikke en påstand om at lunkent vann gir \"ukontrollert\" gjæring."
    ],
    "changes_en": [
      "Evening dough: the yeast amount has been reduced about 25% after feedback that it was running a bit high — less margin for over-fermentation, especially in warmer fridges.",
      "Evening dough: less dogmatic \"why cold water\" explanation — clarifies that it's about controlling dough temperature, not a claim that lukewarm water gives \"uncontrolled\" fermentation."
    ]
  },
  {
    "v": "0.474",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny metode: Kveldsdeig — 5–15 timer i kjøleskapet, mellom Hurtigdeig (samme dag, romtemperatur) og Standard (flere dagers planlegging). Bland om kvelden, stek neste dag.",
      "Bruker kaldt vann i blandefasen (ikke lunkent som Hurtigdeig), for bedre kontroll på gjæringen før kjøleskapet kjøler ned deigen.",
      "Egen gjærkurve for kort kaldheving, og kortere temperering (90 min) enn Standard-metodens 4 timer siden deigen ikke har vært kald like lenge."
    ],
    "changes_en": [
      "New method: Evening dough — 5–15 hours in the fridge, between Quick dough (same day, room temperature) and Standard (several days' planning). Mix in the evening, bake the next day.",
      "Uses cold water in the mixing phase (not lukewarm like Quick dough), for better control of fermentation before the fridge cools the dough down.",
      "Its own yeast curve for short cold-proofing, and shorter tempering (90 min) than the Standard method's 4 hours since the dough hasn't been cold as long."
    ]
  },
  {
    "v": "0.473",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Ny \"rund opp\"-knapp for Langpanne/IngenElting — dukker kun opp når melmengden din gir en ujevnt fylt langpanne, og foreslår nøyaktig hvor mye ekstra mel som trengs for å fylle den helt. Endrer aldri noe automatisk — du må selv trykke."
    ],
    "changes_en": [
      "New \"round up\" button for Sheet pan/No-knead — only appears when your flour amount gives an unevenly filled sheet pan, and suggests exactly how much extra flour is needed to fill it completely. Never changes anything automatically — you have to tap it yourself."
    ]
  },
  {
    "v": "0.472",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Varsel ved fare for overfermentering — dukker opp i Teknikk ved lang gjæringstid, og regner med forgjæringen i poolish/biga (ikke bare kjøleskapsdager alene).",
      "Steg som er passert i tid uten å være avhaket, får nå en tydelig \"ikke avhaket\"-markering.",
      "Skriftstørrelse flyttet til \"Denne deigen\" som en enkel +/− -knapp, med en snarveiknapp (\"Aa\") og et to-fingers sveip opp/ned for rask justering på mobil.",
      "Kun én Nullstill-knapp igjen (var to) — den viser nå \"velg pizzatype\"-hintet på nytt, som om appen er helt fersk.",
      "\"IngenElting\" er flyttet fra Metode til Pizzatype, siden den alltid gir samme resultat (fokaccia-aktig pannepizza) uansett hvilken metode som var valgt før.",
      "Antall \"pizzaer\" for Langpanne og IngenElting viser nå riktig antall langpanner (beregnet fra formstørrelse), i stedet for å late som de er runde enkeltpizzaer.",
      "Bytter du pizzatype, dukker det opp en kort, corny animasjon som bekrefter valget.",
      "Varselbjelken for aktive deiger øverst i vinduet er fjernet — telling ligger fortsatt i sidepanelet og mobiltoppfeltet.",
      "\"Lagre deig\"-knappen har samme nøytrale stil som resten av knapperaden, i stedet for å skille seg ut i grønt."
    ],
    "changes_en": [
      "Alert when there's a risk of over-fermentation — appears in Tips at long fermentation times, and counts the pre-ferment in poolish/biga (not just cold-proof days alone).",
      "Steps that are past due without being checked off now get a clear \"not checked off\" marking.",
      "Font size moved to \"This dough\" as a simple +/− button, with a shortcut button (\"Aa\") and a two-finger swipe up/down for quick adjustment on mobile.",
      "Only one Reset button left (there were two) — it now shows the \"pick a pizza type\" hint again, as if the app were brand new.",
      "\"No-knead\" has moved from Method to Pizza type, since it always gives the same result (focaccia-like pan pizza) regardless of which method was selected before.",
      "The number of \"pizzas\" for Sheet pan and No-knead now shows the correct number of sheet pans (calculated from pan size), instead of pretending they're round individual pizzas.",
      "Switch pizza type and a short, corny animation pops up to confirm the choice.",
      "The alert bar for active doughs at the top of the window has been removed — the count is still in the side panel and mobile top bar.",
      "The \"Save dough\" button has the same neutral style as the rest of the button row, instead of standing out in green."
    ]
  },
  {
    "v": "0.471",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Nytt valg: Kjøkkenmaskin (Ankarsrum / Manuell elting / Annen maskin) — instruksjonene i tidsplanen og Teknikk-fanen tilpasser seg faktisk til valget, ikke bare tekst/etiketter.",
      "Manuell elting skiller mellom vanlig \"press, brett, drei\"-teknikk og fransk elting (slap-and-fold) ved høy hydrering, siden våt deig ikke lar seg elte for hånd på vanlig vis.",
      "Ny forklaring i Teknikk om vanntemperatur tilpasset kjøkkenmaskin — vanlige kjøkkenmaskiner tilfører mye mer friksjonsvarme enn Ankarsrum/håndelting, og trenger derfor kaldere vann for å nå samme deigtemperatur.",
      "Gjærtype, Kjøkkenmaskin og Ovntype bruker nå samme visuelle stil (piller) i sidepanelet, i stedet for to ulike stiler som før."
    ],
    "changes_en": [
      "New choice: Stand mixer (Ankarsrum / Hand kneading / Other mixer) — the instructions in the schedule and the Tips tab actually adapt to the choice, not just the text/labels.",
      "Hand kneading distinguishes between the usual \"press, fold, turn\" technique and French kneading (slap-and-fold) at high hydration, since wet dough can't be kneaded by hand the usual way.",
      "New explanation in Tips about water temperature adapted to the stand mixer — regular stand mixers add much more friction heat than an Ankarsrum/hand kneading, and therefore need colder water to reach the same dough temperature.",
      "Yeast type, Stand mixer and Oven type now use the same visual style (pills) in the side panel, instead of two different styles as before."
    ]
  },
  {
    "v": "0.470",
    "d": "juli 2026",
    "d_en": "July 2026",
    "changes": [
      "Deiger kan lagres delt (Netlify Blobs) — lagre, åpne og fullfør samme deig fra flere enheter, sammen med familie/venner.",
      "Notater er nå knyttet direkte til hver deig i stedet for en generell logg i nettleseren.",
      "Steg i tidsplanen kan hakes av, og fremdriften lagres sammen med deigen.",
      "Ny \"Deiger\"-oversikt viser aktive og ferdige bakster, med varselbjelke og telling som viser hvor mange som er aktive.",
      "Teknikk og Deiger åpnes nå som popup-vinduer i stedet for faner, og forstyrrer ikke tidsplanen du står i.",
      "Alle handlingsknapper (Lagre, Mine deiger, Kopier, Vis/skjul forklaringer) samlet i én gruppe.",
      "Meltype er fjernet som eget valg — informasjon om meltyper og vannmengde ligger nå i Teknikk.",
      "Overskriften viser nå metode og antall pizzaer tydelig, og hovedvinduet er tonet ned til du gjør ditt første valg."
    ],
    "changes_en": [
      "Doughs can be saved shared (Netlify Blobs) — save, open and finish the same dough from several devices, together with family/friends.",
      "Notes are now tied directly to each dough instead of a general log in the browser.",
      "Steps in the schedule can be checked off, and the progress is saved along with the dough.",
      "New \"Doughs\" overview shows active and finished bakes, with an alert bar and count showing how many are active.",
      "Tips and Doughs now open as popup windows instead of tabs, and don't disturb the schedule you're on.",
      "All action buttons (Save, My doughs, Copy, Show/hide explanations) gathered into one group.",
      "Flour type has been removed as a separate choice — information about flour types and water amount is now in Tips.",
      "The heading now clearly shows method and number of pizzas, and the main window is toned down until you make your first choice."
    ]
  }
];
