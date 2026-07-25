// Endringslogg for Pizzaplanlegger — flyttet ut fra index.html (v5.61) for å redusere
// filstørrelsen på hovedfilen. Rent datainnhold, ingen logikk. Lastes via <script src>
// FØR hovedscriptet i index.html, slik at CHANGELOG er tilgjengelig når resten kjører.
const CHANGELOG = [
  {
    v: '5.77',
    d: 'juli 2026',
    changes: [
      'Knappene i varslene som sender deg et annet sted — "Rediger pizzatiden din", "Juster kjøleskapstid", "Se i Finjuster", "Se i Metode" — var enveisdører. Du landet et sted, endret noe, og fikk aldri vite om problemet du kom for å løse faktisk ble borte. Nå dukker det opp en linje nederst på skjermen du ble sendt til, med en vei tilbake dit du kom fra.',
      'Linjen svarer mens du redigerer. Justerer du pizzatiden til at steget passer, sier den fra med det samme at alle steg ligger innenfor — du trenger ikke gå ut og inn for å sjekke. Står konflikten fortsatt, sier den hvilket steg det gjelder og når. Linjen vises bare når du faktisk ble sendt dit av et varsel, og forsvinner så snart du navigerer videre på egen hånd.'
    ]
  },
  {
    v: '5.76',
    d: 'juli 2026',
    changes: [
      'Fikset at varselet om opptatt tid ble hengende med gammelt svar når du endret pizzatiden din i Beta-fanen. Redigeringen lagret riktig, men planen ble aldri regnet ut på nytt, så varselet svarte på tilstanden fra før endringen. Nå oppdaterer planen seg med en gang du endrer et tidspunkt.',
      'I tillegg regnes planen alltid ut på nytt når du går inn på Steg-fanen. Det er en generell sikring: ingen endring gjort i en annen fane skal kunne etterlate et varsel som svarer på gammel tilstand.',
      'Et halvferdig tidsrom midt i redigeringen — der du har fylt inn "fra" men ikke "til" ennå — teller ikke lenger som en gyldig periode.'
    ]
  },
  {
    v: '5.75',
    d: 'juli 2026',
    changes: [
      'Varselet om at et steg havner på et dårlig tidspunkt tilbyr nå bare knapper som faktisk kan løse akkurat det problemet. Tidligere fikk du "Juster kjøleskapstid" uansett — men steg som "Ta ut av kjøleskap" ligger fast fire timer før steking, så kjøleskapstiden kan ikke flytte dem i det hele tatt når du planlegger bakover fra et måltid. Du kunne justere så mye du ville uten at varselet forsvant.',
      'I stedet regner appen ut hvor mye du må flytte måltidet for at hele planen skal gå opp, og tilbyr det ferdig: "Spis tir 20:00 i stedet" — med en forklaring av hva det gjør med steget som kolliderte. Finnes det ingen spisetid som fungerer, sier varselet det rett ut i stedet for å tilby knapper som ikke virker, og peker mot en metode med kortere temperering.'
    ]
  },
  {
    v: '5.74',
    d: 'juli 2026',
    changes: [
      'Alle varsler har fått et kryss oppe i høyre hjørne som skjuler varselet for denne gangen. Det gjelder også nattevarselet — unntak finnes, du kan være våken uansett, eller ha lagt opp til det med vilje for smakens skyld.',
      'Krysset husker den konkrete konflikten, ikke varseltypen. Skjuler du "Ta ut av kjøleskap tir 14:00" og siden endrer noe slik at problemet flytter seg til et annet tidspunkt, dukker varselet opp igjen — men et uendret problem forblir skjult. Ingenting lagres: "denne gangen" varer til du laster appen på nytt.'
    ]
  },
  {
    v: '5.73',
    d: 'juli 2026',
    changes: [
      'Varselet "Et steg havner i arbeidstiden din" bygger nå på din egen Pizzatid fra Beta-fanen i stedet for en fast antakelse om at alle jobber mandag til fredag 08–16. Setter du opp når du faktisk er ledig, følger varselet det — og varselet har fått en knapp rett inn til redigeringen. Pizzatiden lagres per bruker på serveren, så den følger deg mellom telefon og PC.',
      'Rydding under panseret: appen hadde tre uavhengige oppfatninger av når du er ledig — varselets hardkodede 08–16, "Mine faste tidspunkter" sitt eget hardkodede sett, og Pizzatid. Nå er Pizzatid eneste kilde for alle tre. Standardverdiene er de samme tallene som før, så ingenting endrer seg for deg før du selv redigerer timeplanen. Nattevarselet (23–06) er fortsatt en universell regel.'
    ]
  },
  {
    v: '5.72',
    d: 'juli 2026',
    changes: [
      'Fjernet "Da starter du: …"-linjen under Kjøleskapsheving på Når?-steget, og under Poolish- og Biga-varigheten på Metode-steget. Etter at kjøleskapsblokken ble flyttet opp i v5.71 gjentok den bare oppstartstidspunktet statuslinjen viser noen linjer over.',
      'I stedet viser statuslinjen nå hvor mye oppstart flyttet seg når du justerer kjøleskapstid, poolish-varighet eller biga-varighet — en liten brikke ved siden av oppstartstidspunktet som sier f.eks. "6 t tidligere". Den forsvinner av seg selv etter noen sekunder. Trykker du flere ganger raskt etter hverandre summeres differansen mot der du startet, i stedet for å vise ett steg om gangen.'
    ]
  },
  {
    v: '5.71',
    d: 'juli 2026',
    changes: [
      'Kjøleskapshevingen på wizardens Når?-steg er flyttet opp og ligger nå rett under statuslinjen med oppstart og steketid, i stedet for nederst på siden. Kjøleskapstiden er den enkeltinnstillingen som flytter oppstartstidspunktet mest, og nå står årsak og virkning ved siden av hverandre. Blokken skjules fortsatt automatisk for Hurtigdeig og Kveldsdeig, som ikke har noen kjølefase.',
      'Fjernet forklaringsteksten "⚙️ Juster åpner flere valg: mel, gjærtype, meltype osv." under statuslinjen på samme steg — den leste rart løsrevet fra lenken den opprinnelig hørte til (fjernet i v5.67).'
    ]
  },
  {
    v: '5.70',
    d: 'juli 2026',
    changes: [
      'Ny dynamisk "hvorfor"-boks under metodevalg-kortene på wizardens Metode-steg — viser en kort forklaring av hvorfor du velger den metoden du har trykket på, i stedet for kun den korte strukturbeskrivelsen kortet selv har. Poolish og Biga gjenbruker de allerede eksisterende forklaringstekstene fra Steg-visningen; Langtidsdeig, Hurtigdeig, Kveldsdeig og Mania-poolish har fått nye korte tekster i samme stil.'
    ]
  },
  {
    v: '5.69',
    d: 'juli 2026',
    changes: [
      'Lagt til ±-knapper ved siden av alle fire sliderne i Finjuster (Melmengde, Hydrering, Kjøleskapsheving, Romtemperatur) — native slidere er vanskelige å treffe presist på mobil. Slideren selv er uendret og virker som før; knappene gir et nøyaktig ett-steg samtidig.'
    ]
  },
  {
    v: '5.68',
    d: 'juli 2026',
    changes: [
      'Fjernet "🌙 Maks smak"-boksen på wizardens steg 3. Den var kun en snarvei til ett bestemt tall — ikke en sikkerhetsmekanisme, siden det uavhengige varselsystemet for gjæringstid uansett fanger opp for lang eller kort kjøletid. ±-steppen for kjøleskapstid er uendret og fortsatt der.'
    ]
  },
  {
    v: '5.67',
    d: 'juli 2026',
    changes: [
      'Fjernet den overflødige lenken "⚙️ Finjuster (mel, gjærtype, meltype osv.)" nederst på wizardens steg 3 — den gjorde nøyaktig det samme som "⚙️ Juster"-knappen i statuslinjen øverst på samme skjerm. Forklaringsteksten "mel, gjærtype, meltype osv." er flyttet opp som en liten undertekst under Juster-knappen, kun synlig på steg 3.'
    ]
  },
  {
    v: '5.66',
    d: 'juli 2026',
    changes: [
      'Metoden "Standard" heter nå "Langtidsdeig" overalt i appen (PC og mobil) — fullfører et tidsbasert navnesystem sammen med Hurtigdeig og Kveldsdeig. Kun visningsnavnet er endret; ingenting i lagrede bakster eller egen logikk er rørt.'
    ]
  },
  {
    v: '5.65',
    d: 'juli 2026',
    changes: [
      'Tre tekstrettelser: stegtittelen "Kjøleskapsheiving" var en skrivefeil for "Kjøleskapsheving" (Standard/Poolish/Biga). "klede tørker ut overflaten" rettet til "kluter" (to steder, Standard og Kveldsdeig). Den kopierte tidsplanens toppfelt viste "Kjøleskapsheving: X timer" for Standard/Poolish/Biga, men det tallet inkluderer også 4 timers fast romtemperering og formingstid — ikke ren kjøletid. Endret til "Total heving: X timer" for å stemme med hva tallet faktisk er. Kveldsdeigs tilsvarende linje var allerede riktig (der er hele tallet ren kjøletid) og er ikke endret.'
    ]
  },
  {
    v: '5.64',
    d: 'juli 2026',
    changes: [
      'Stegpunktene øverst i wizarden (Pizzatype → Metode → Når?) kan nå klikkes både fram og tilbake — tidligere var det kun mulig å hoppe tilbake til steg du allerede hadde vært innom. Ikke-besøkte steg vises fortsatt med tall (ikke hake), men får nå en tynn aksentkant som viser at de er klikkbare.'
    ]
  },
  {
    v: '5.63',
    d: 'juli 2026',
    changes: [
      'Oppskriftsvisningen for Hurtigdeig og Kveldsdeig på mobil manglet radene for Romtemperatur og Ovntype som PC alltid har hatt — lagt til slik at PC og mobil viser nøyaktig samme informasjon. Kveldsdeig på mobil brukte også en kortere tekst ("Kjøleskap"/"10t") enn PC ("Kjøleskapsheving"/"10 timer") — nå samme ordlyd begge steder. Ny testtype (pc_mobil_1to1_*) sjekker fra nå av at PC og mobil er innholdsmessig identiske for alle tre metodene, ikke bare at hver plattform er intern-konsistent.'
    ]
  },
  {
    v: '5.62',
    d: 'juli 2026',
    changes: [
      'Arkitekturtiltak (ingen synlig endring): de 8 stedene i koden som bygde opp ingredienslisten (Mel/Vann/Salt/olje/smør/sukker/Gjær) hver for seg — for både PC og mobil, på tvers av Standard/Hurtigdeig/Kveldsdeig — er samlet i én felles funksjon (baseIngredientRows). De to nesten-identiske rendringsfunksjonene for oppskriftsradene (én for PC, én for mobil) er slått sammen til én. Ny regresjonstest fryser nå også selve HTML-utdataen fra dette laget, som tidligere ikke var testdekket.'
    ]
  },
  {
    v: '5.61',
    d: 'juli 2026',
    changes: [
      'Arkitekturtiltak (ingen synlig endring): Endringsloggen (denne listen) er flyttet ut av index.html og inn i en egen fil, changelog.js. Reduserer hovedfilens størrelse med ca. 15% og gjør fremtidige endringer i selve appen billigere å jobbe med.'
    ]
  },
  {
    v: '5.60',
    d: 'juli 2026',
    changes: [
      'Rullet ut valg-vs-handling-skillet fra Finjuster-testen (v5.55) til resten av wizarden: Pizzatype-pillene og Metode-kortene bruker nå samme omriss+hake for valgt alternativ, og begge "Neste"-knappene bruker samme dempede farge som de andre "gå videre"-knappene. Metodekortenes egen fargefremheving for Hurtigdeig/Kveldsdeig er fjernet til fordel for ett enhetlig valgspråk overalt.'
    ]
  },
  {
    v: '5.59',
    d: 'juli 2026',
    changes: [
      'Fjernet den pulserende prikken over "Steg" i bunnmenyen — den var ment å dytte deg mot Steg-fanen for å se konsekvensen av en endring, men det gjør deig-statuslinjen i wizarden allerede (oppstart/steketid vises der du står, uten å bytte fane). Overflødig nå, ryddet bort sammen med tilhørende kode.'
    ]
  },
  {
    v: '5.58',
    d: 'juli 2026',
    changes: [
      'Fjernet den sticky Kopier/Kalender/Lagre-baren (som av og til roter til skjermen) og lagt de tre handlingene inn i deig-statuslinjen i stedet — vanlig plassert, ikke sticky. Alle tre likestilt, ingen fremhevet fremfor de andre. Ryddet samtidig bort en del gammel, skjør JavaScript-logikk som fantes bare for å holde den forrige sticky-baren riktig plassert.'
    ]
  },
  {
    v: '5.57',
    d: 'juli 2026',
    changes: [
      'Deiger-fanen (lagrede oppskrifter) fikk samme fargepalette som resten av appen — kortene brukte fortsatt hardkodede lyse farger (hvit bakgrunn, lyse rammer) fra før Forno-restylingen, i stedet for de delte tokenene alt annet bruker. Bakgrunn, rammer og dempet tekst matcher nå riktig i mørk modus.'
    ]
  },
  {
    v: '5.56',
    d: 'juli 2026',
    changes: [
      '"Pizzatid" i Beta-fanen starter nå minimert (skjult som standard) — trykk "Vis" for å åpne de syv dagene med ledig tid. Mindre å scrolle forbi hver gang du bare vil sjekke Steketidspunkt eller Populære tidspunkt.'
    ]
  },
  {
    v: '5.55',
    d: 'juli 2026',
    changes: [
      'Testrunde av valg-vs-handling-skillet (Skisse A) på Finjuster sine Gjærtype/Kjøkkenmaskin/Ovntype-grupper: valgt alternativ vises nå med tykt omriss + liten hake i stedet for fylt bakgrunn. De to "gå videre"-knappene ("Se steg for steg →" og "Ferdig") bruker nå en dempet, mørkere oransje i stedet for den vanlige aksentfargen, for å skille handling fra valg. Lagt til (klar, men ikke synlig i praksis siden alle felt har standardverdi): en advarselsramme + "Velg én"-tekst rundt en gruppe hvis ingenting er valgt.'
    ]
  },
  {
    v: '5.54',
    d: 'juli 2026',
    changes: [
      'Deig-statuslinjen (oppstart + steketid) er nå også synlig i wizardens Metode-steg, Planlegging-steg og Finjuster — ikke bare i Steg-fanen. Oppdateres live idet du justerer noe, slik at du ser konsekvensen med en gang i stedet for å måtte bytte fane.'
    ]
  },
  {
    v: '5.53',
    d: 'juli 2026',
    changes: [
      'Ny deig-statuslinje øverst i Steg-fanen: viser pizzatype/metode, 🚀 oppstartstid og 🍕 steketid for oppsettet du jobber med — samme mønster som Beta-fanens kort. Oppdateres live når du endrer noe.',
      'Fast "⚙️ Juster"-knapp i statuslinjen som tar deg rett til Finjuster, med en "Se steg →"-knapp der for å hoppe rett tilbake — en tydelig juster-og-prøv-sløyfe mellom Steg og innstillingene.',
      'Liten orienteringshjelp i wizarden: "Gå fritt frem og tilbake — Steg-fanen viser alltid planen for gjeldende valg."'
    ]
  },
  {
    v: '5.52',
    d: 'juli 2026',
    changes: [
      'Fikset at Beta-fanens søk kunne foreslå en oppskrift som krevde oppstart FØR akkurat nå — matematisk "riktig" ut fra reglene, men umulig å faktisk følge. Søket prioriterer nå alltid kombinasjoner du faktisk rekker å starte, og faller kun tilbake til de umulige (med en tydelig advarsel) hvis absolutt ingenting annet finnes.'
    ]
  },
  {
    v: '5.51',
    d: 'juli 2026',
    changes: [
      '"Faste tider" i Beta-fanen døpt om til "Populære tidspunkt for pizza", med en tydelig visuell strek mot "Steketidspunkt"-søket over. Hvert resultat viser nå både 🚀 oppstartstid og 🍕 planlagt steketid direkte i kortet, i stedet for at du må trykke "Bruk denne" og hoppe til Steg-fanen for å se det.'
    ]
  },
  {
    v: '5.50',
    d: 'juli 2026',
    changes: [
      'Døpt om "Egen tid" til "Steketidspunkt" i Beta-fanen — tydeligere navn, matcher terminologien appen allerede bruker andre steder.'
    ]
  },
  {
    v: '5.49',
    d: 'juli 2026',
    changes: [
      'Fant den faktiske årsaken til at "Finn oppskrift" i Beta-fanen så ut til å ikke gjøre noe: resultatet vises ikke lenger nederst under hele "Faste tider"-listen (fem kort du måtte scrolle forbi) — det vises nå rett under selve knappen, og scrolles automatisk inn i synsfeltet.'
    ]
  },
  {
    v: '5.48',
    d: 'juli 2026',
    changes: [
      'Beta-fanens "Finn oppskrift"-knapp kunne feile stille (ingenting synlig skjedde) hvis datofeltet var tomt/ugyldig, eller hvis noe uventet gikk galt under selve søket. Viser nå alltid en tydelig tilbakemelding — "Sett en dato først", "Ugyldig dato/klokkeslett", eller en feilmelding hvis søket faktisk krasjer — i stedet for å bare ikke gjøre noe. Samme robusthet lagt til for "Faste tider"-listen.'
    ]
  },
  {
    v: '5.47',
    d: 'juli 2026',
    changes: [
      'Ny fane: 🧭 Beta — "omvendt planlegger". I stedet for å velge innstillinger og se når du må starte, oppgir du når du er ledig og når du vil spise, og får en anbefalt oppskrift tilbake. Søker på tvers av ALLE metoder (Standard, Poolish begge varianter, Biga, Mania-poolish, Hurtigdeig, Kveldsdeig) — ikke bare Poolish/Biga.',
      '"Pizzatid": din ukentlige ledige tid, mandag–søndag, med inntil to perioder per dag. Lagres delt på tvers av enheter (ny backend-funksjon pizzatid.js), ikke bare i denne nettleseren.',
      '"Egen tid": fritt spisetidspunkt, én søkeknapp. "Faste tider" (de fem tidligere målene) er flyttet hit fra Planlegging-steget, ikke duplisert.',
      'Resultatet viser toppanbefaling direkte (rangert på færrest tidskonflikter, deretter lengst trygg gjæring som "best smak"), med en "se flere alternativer"-lenke som åpner de neste to. Viser også ærlig hvilke meltyper som faktisk tåler den anbefalte gjæringstiden — eller sier rett ut hvis ingen gjør det.',
      'PC fikk en enkel lenke inn til samme fane (via ☰ Meny → "Finn oppskrift (Beta)"), som bytter til mobilvisning.'
    ]
  },
  {
    v: '5.46',
    d: 'juli 2026',
    changes: [
      'Ny metode: Mania-poolish (oppkalt etter Pizzamania, kilden til oppskriften) — et eget metodekort ved siden av Poolish/Biga. Strukturelt annerledes enn de andre: poolish gjæres 12t romtemperatur og kjøles ned FØR den blandes inn i hoveddeigen, hele deigen kjøleskapheves udelt i 10t og deles i emner ETTERPÅ, med en lang 10-timers romtemperaturheving til slutt (i stedet for kort etterheving) — total gjæringstid ca. 37 timer. Egen, korrekt oppskrift (64% hydrering, todelt Poolish/Hoveddeig-ingrediensliste) i Oppskrift-fanen, ikke den generiske beregningen.'
    ]
  },
  {
    v: '5.45',
    d: 'juli 2026',
    changes: [
      '"Mine faste tidspunkter" fant tidligere en løsning uten reelle konflikter for lørdag/søndag 19:00 — men romtemperatur-Poolish sitt smale 12-16 timers justeringsrom var noen ganger for trangt til at NOEN verdi unngikk natt-kollisjon ("Lag poolish" kl. 05:40 var "minst ille", ikke en reell løsning). Søket prøver nå automatisk kjøleskaps-varianten (12-48t) også når romtemperatur ikke strekker til, og bruker den hvis den faktisk finner noe bedre — vises som "Alt passer ✓ (krever ❄️ Kjøleskap-poolish)". Fant en reell løsning for lørdag 19:00 som tidligere manglet.'
    ]
  },
  {
    v: '5.44',
    d: 'juli 2026',
    changes: [
      'Rettet "Mine faste tidspunkter": helger (lørdag/søndag) er ledige hele dagen bortsett fra natt — en helt annen, enklere regel enn hverdagenes to smale vinduer. Tidligere ble den samme, smale hverdags-regelen brukt for alle dager, som gjorde at "Ta ut av kjøleskap" feilaktig ble markert som et problem midt på lørdags-/søndagsettermiddagen. Alle fire helgemålene viser nå riktig "Alt passer ✓".'
    ]
  },
  {
    v: '5.43',
    d: 'juli 2026',
    changes: [
      '"Mine faste tidspunkter" gjort om fra rent oppslagsverk til reell søking: for hvert av de fem målene finner den nå den beste kombinasjonen av hevetid og kjøleskapstid som får flest mulig steg til å havne i dine egne ledige vinduer (16:00–23:30 og 06:30–08:00) — helt uavhengig av dagens dato, som avtalt. Trykk på et mål for å sette opp akkurat den kombinasjonen direkte. Avdekket samtidig en strukturell begrensning: "Ta ut av kjøleskap" ligger alltid fast 4 timer før spisetidspunktet uansett hva som justeres, og havner for alle fem målene midt i hullet mellom vinduene dine (12:00–15:00) — ingen kombinasjon kan fikse akkurat det steget per i dag.'
    ]
  },
  {
    v: '5.42',
    d: 'juli 2026',
    changes: [
      'Forenklet "Mine faste tidspunkter" kraftig: fjernet ✅/⚠️-vurderingen og "for kort varsel"-sjekken helt. Den er nå et rent oppslagsverk — viser bare beregnet starttidspunkt for hvert av de fem faste målene med din nåværende metode/hevetid, uten å dømme om det er lurt eller mulig.'
    ]
  },
  {
    v: '5.41',
    d: 'juli 2026',
    changes: [
      'Fikset "Mine faste tidspunkter": den sjekket bare om steg havnet innenfor dine ledige vinduer, men aldri om planen faktisk var mulig å starte FRA NÅ — et mål bare timer unna (som fredag når det allerede er torsdag) kunne be deg starte poolishen tidligere på dagen enn klokka faktisk er, altså i fortiden. Vises nå tydelig som "For kort varsel" i stedet for en misvisende status. Rettet samtidig en beslektet risiko: forhåndsvisningen leste ikke "Starter nå/Steketid"-valget riktig for Hurtigdeig/Kveldsdeig, som kunne gitt feil resultat der også.'
    ]
  },
  {
    v: '5.40',
    d: 'juli 2026',
    changes: [
      'Ny konsept-test i Planlegging-fanen: "🍕 Mine faste tidspunkter" — en snarvei som viser om nåværende metode/hevetid passer med fem faste mål (fre 19:00, lør 16:00/19:00, søn 16:00/19:00), sjekket mot dine egne, hardkodede ledige tidsvinduer (16:00–23:30 og 06:30–08:00). ✅/⚠️ per mål, trykk for å sette opp akkurat den planen direkte. Helt isolert fra det generelle natt/arbeidstid-varselet — endrer ingenting automatisk, kun en rask oversikt du kan hente frem når du vil.'
    ]
  },
  {
    v: '5.39',
    d: 'juli 2026',
    changes: [
      'Fikset at "arbeidstid"-varselet feilaktig fyrte i helgen — det sjekket bare klokkeslettet, ikke ukedagen, i motsetning til "Finn beste kombinasjon" som allerede korrekt utelot lørdag/søndag. De to var ikke enige med hverandre; nå bruker begge samme regel.'
    ]
  },
  {
    v: '5.38',
    d: 'juli 2026',
    changes: [
      'Nytt alternativ for Poolish: "❄️ Kjøleskap" ved siden av "🌡️ Romtemperatur" i Metode-steget. Med kjøleskap-varianten blander du poolishen 1,5t i romtemperatur for å sette i gang gjæren, deretter i kjøleskap i en mye bredere og friere periode (12–48t i steg à 6t, i stedet for det smale 12–16t-vinduet) — nøyaktig klokkeslett blir langt mindre kritisk, siden kulda holder poolishen stabil til du er klar for neste steg.',
      '"🔍 Finn beste kombinasjon"-knapp lagt til i natt/arbeidstid-varselet for Poolish/Biga — søker gjennom hevetid og kjøleskapstid og finner alternativet med færrest forstyrrelser, i stedet for at du må teste deg fram manuelt.',
      '"Prøv Kveldsdeig i stedet"-knapp lagt til samme sted — et reelt alternativ når ingen Poolish/Biga-kombinasjon blir god nok innenfor tiden du har.',
      'Ny påminnelse når du velger Poolish/Biga onsdag–fredag: "Planlegger du helgepizza? Start så tidlig du kan for mest fleksibilitet."'
    ]
  },
  {
    v: '5.37',
    d: 'juli 2026',
    changes: [
      'Nytt varsel i Steg-fanen hvis et steg som faktisk krever at du gjør noe (blande, forme, ta ut av kjøleskap, steke — ikke bare vente) havner midt på natten (23:00–06:00) eller i arbeidstiden din (08:00–16:00, hardkodet foreløpig), med hurtigknapper for å justere hevetid (Poolish/Biga) eller kjøleskapstid direkte.',
      'Live forhåndsvisning av beregnet starttidspunkt når du justerer hevetid i Poolish/Biga eller kjøleskapstid i Planlegging — slipper å bla til Steg-fanen for å sjekke.',
      'Standard/Poolish/Biga sine tre første aktive steg (bland, la heve, form emner) er nå tydelig merket som én sammenhengende arbeidsøkt, med et lite banner som viser hvor lang tid du bør sette av.',
      'Rettet Ankarsrum-terminologi i tekstene — "rullekniv" fantes ikke, riktig er "deigrullen" (ruller) og "deigkniv"/skraper (to separate deler brukt sammen).',
      'Nytt tips: "Kjøleskapspause" for Poolish/Biga — hvordan pause et forspill i kjøleskapet hvis livet kommer i veien.',
      'Feedback viser nå hvem som sendte den inn, samme mønster som lagrede deiger og notater.',
      'Fikset at bakgrunnen kunne scrolle gjennom modaler (Admin og andre) på mobil — manglende overscroll-behation er nå satt.',
      'Fikset at overskriftene i Tips og teknikk var lyse og uleselige — samme mangel på mørk-modus som flere tidligere runder.',
      'LØST en ekte backend-bug: sletting av bruker og "Ny PIN" i Admin-visningen brukte feil lagringsnøkkel og virket aldri, selv om ingen feilmelding vistes — brukere lagres med normalisert navn som nøkkel, ikke intern id. Krever ny users.js på serveren.'
    ]
  },
  {
    v: '5.36',
    d: 'juli 2026',
    changes: [
      'Kjøleskapsheving viste "dager" i stedet for timer når verdien tilfeldigvis traff et helt døgn (f.eks. "1 dag" for 24 timer) — inkonsekvent med resten av det nye time-baserte systemet. Viser nå alltid timer, overalt.'
    ]
  },
  {
    v: '5.35',
    d: 'juli 2026',
    changes: [
      'Poolish og Biga sin forspill-varighet er nå justerbar (12–16t for Poolish, 16–24t for Biga, med navngitte alternativer — samme mønster som Hurtigdeig/Kveldsdeig), i stedet for fast 14t/18t. Gjærmengden i forspillet skaleres automatisk med valgt varighet. Standardverdiene (14t/18t) gir nøyaktig samme oppskrift som før — ingen endring for deg som ikke rører denne nye innstillingen. Motivert av at kontroll på nettopp denne fasen (den minst fleksible, siden forspill og ferdig-blanding er rigid låst til hverandre) lar deg justere når disse to øyeblikkene faktisk havner på klokka. Foreløpig kun på mobil — PC-visningen bruker fortsatt de faste standardverdiene.'
    ]
  },
  {
    v: '5.34',
    d: 'juli 2026',
    changes: [
      'Kjøleskapsheving for Standard/Poolish/Biga er byttet fra hele dager til timer, med finere 6-timers steg — samme presisjonsnivå som Hurtigdeig/Kveldsdeig allerede hadde. Gjærmengde-tabellen som var koblet til antall dager er bygget om til en jevnt interpolert versjon i timer, basert på nøyaktig de samme, allerede uttestede verdiene som før — ingen ny gjetning, bare finere oppløsning mellom de kjente punktene. "Maks smak" utnytter nå melets faktiske gjæringsgrense mye bedre: f.eks. Caputo Nuvola (maks 48t) fikk tidligere kun 24t foreslått siden systemet rundet ned til hele døgn — nå foreslår den 42t. Fant og rettet samtidig en tredje, uavhengig kopi av gjæringstid-regnestykket i overmodning-varselet som ikke ble fanget opp i forrige versjon.'
    ]
  },
  {
    v: '5.33',
    d: 'juli 2026',
    changes: [
      'Gjæringstid-regnestykket (brukt av meltype-varselet og "Maks smak") tok ikke med romtemperaturhevingen FØR kjøleskapet — bare forspill (Poolish/Biga) og kjøleskapsdager ble talt. Lagt til, og samtidig rettet et lite avvik der Biga sitt forspill ble regnet som 20 timer ett sted i koden og 18 timer et annet — alt bruker nå samme, delte regnestykke, så det aldri kan drive fra hverandre igjen.'
    ]
  },
  {
    v: '5.32',
    d: 'juli 2026',
    changes: [
      'Gjort det tydeligere at wizardens Metode- og Planlegging-steg begge har to separate valg: hvert valg har nå en liten nummerert markør ("①"/"②") foran en kort overskrift, samme mønster på begge sider.',
      'Rettet rekkefølgen på Planlegging-steget slik at "Når vil du spise?" kommer først (matcher tittelen), og "Antall pizzaer" kommer etter — som Metode-steget sitt mønster.',
      'Ryddet opp i "Når vil du spise?"-valget: for Standard/Poolish/Biga (lang gjæring) er "Starter nå" fjernet helt — det ga ikke mening der. For Hurtigdeig/Kveldsdeig beholdes begge alternativene, men spørsmålet er nå det nøytrale "Planlegg fra:", med "🍕 Når jeg vil spise" og "▶ Nå" som to likestilte svar.',
      'Kjøleskapsheving er nå synlig direkte i Planlegging-steget for Standard/Poolish/Biga (i tillegg til i Finjuster), sammen med en ny "🌙 Maks smak"-knapp — den setter automatisk lengst trygge kjøleskapstid, begrenset av enten tiden du har til spisetidspunktet eller hva valgt meltype tåler, og forteller alltid hvilken av de to som faktisk var flaskehalsen.'
    ]
  },
  {
    v: '5.31',
    d: 'juli 2026',
    changes: [
      'Fant den egentlige, underliggende årsaken til flere runder med "må scrolle for å finne resten"-bugs på mobil, som har dukket opp flere steder over tid: CSS zoom (brukt til skriftstørrelse-innstillingen) skalerer alt synlig innhold opp med zoom-faktoren, men "100dvh" — som hele mobilvisningens høyde er satt til — regnes ut fra den ekte, uskalerte skjermhøyden. Resultatet: hele siden ble malt zoom-faktoren ganger for høy (f.eks. 30% for høy ved "Stor" skrift), som gjorde HELE siden — ikke bare enkeltfaner — scrollbar, og en hvilken som helst ting som trigget sidescroll (som et fokusert dato-/tidsfelt) kunne skyve toppen av et wizard-steg ut av syne. Bekreftet med Chrome sin mobil-emulering (samme miljø som avslørte feilen), og fikset ved å regne ut mobilvisningens høyde eksplisitt i ekte skjerm-piksler, uavhengig av zoom-nivå.'
    ]
  },
  {
    v: '5.30',
    d: 'juli 2026',
    changes: [
      '"Se i Finjuster"-lenken i meltype-varselet (Steg-fanen) gjorde ingenting synlig — den forberedte Finjuster-innholdet bak kulissene, men byttet aldri selve fanen til Innstillinger, hvor Finjuster faktisk bor. Lenken bytter nå fane først, så du faktisk ser endringen.'
    ]
  },
  {
    v: '5.29',
    d: 'juli 2026',
    changes: [
      'Fikset selve feedback-listen (de innsendte tilbakemeldingene, ikke bare kategori-boblene) som var nesten uleselig — kortene rundt hver tilbakemelding hadde fortsatt hvit bakgrunn, mens teksten inni allerede var riktig lysnet, altså lys tekst på hvit bunn. Siden denne listen deles mellom PC og mobil, er den nå fikset med ordentlige delte fargevariabler (samme mønster som resten av appen) i stedet for en snarvei — bekreftet at mobil viser mørkt kort/lys tekst og PC fortsatt viser hvitt kort/mørk tekst, helt uendret.'
    ]
  },
  {
    v: '5.28',
    d: 'juli 2026',
    changes: [
      'Fikset meltype-nedtrekksmenyen i wizarden som var hvit på hvit — samme "mangler mørk-modus"-mønster som flere andre steder. Systematisk gjennomgang av alle gjenværende lyse bakgrunner fant tre til: statistikk-boksene ("Antall"/"Emnestørrelse") på Oppskrift-fanen, og en feilskrevet klassenavn som gjorde at Ankarsrum-instruksjonsboksen på samme fane brukte PC sin lyse stil i stedet for mobilens mørke. Alle fire rettet og verifisert med fargemålinger.'
    ]
  },
  {
    v: '5.27',
    d: 'juli 2026',
    changes: [
      'Rettet 8 flere steder med samme "mørk tekst på mørk bunn"-mønster som "Hva er nytt" hadde: selve "Hva er nytt"-teksten og datoene, "Lukk"-knappen der, Guide sin "Ikke vis igjen"-knapp (som en tidligere fiks ikke tok skikkelig), introtekstene i Feedback/Formler/Fullfør bakst-modalene, "av [navn]"-linjen på deig-kort, og gjennomstreket tekst på avhakede ingredienser. Funnet ved systematisk gjennomgang av alle hardkodede grå/mørke tekstfarger i mobilvisningen, ikke bare det ene rapporterte stedet.'
    ]
  },
  {
    v: '5.26',
    d: 'juli 2026',
    changes: [
      'Meltype-valget er flyttet fra Finjuster inn i wizardens Metode-steg (steg 2), rett under gjærtype/kjøkkenmaskin — synlig når du faktisk tar det valget, i stedet for gjemt bak "Finjuster". Meltype endres fortsatt ikke automatisk når du bytter pizzatype (i motsetning til hydrering), siden det handler om hvilket mel du faktisk har i skapet, ikke en beregnet anbefaling.',
      'Nytt varsel når valgt metode ikke passer med god tid til rådighet — f.eks. Hurtigdeig valgt samtidig som du planlegger å spise om flere dager. Samme mønster som meltype-varselet: forklaring, en "Bytt til Standard"-hurtigknapp, og en lenke tilbake til Metode-steget.'
    ]
  },
  {
    v: '5.25',
    d: 'juli 2026',
    changes: [
      'Lysnet den dempede/svake tekstfargen (brukt på etiketter, tidsstempler og sekundær tekst gjennom hele mobilvisningen) — teknisk sett innenfor tilgjengelighetskravene fra før, men for svak til å lese komfortabelt i praksis, spesielt i liten skriftstørrelse. Kontrasten er nå 6,2:1 (opp fra 5,1:1).'
    ]
  },
  {
    v: '5.24',
    d: 'juli 2026',
    changes: [
      'Fikset den andre halvparten av v5.23-bugen: forrige fiks gjorde riktignok teksten lys, men flere av radene/boksene den satt på (Info-fanens menyrader, skriftstørrelse-velgeren, valg-boblene for gjærtype/kjøkkenmaskin/ovntype/pizzatype i wizarden, dato-/tidsfeltene) hadde fortsatt hvit bakgrunn — så lys tekst på hvit bunn ble like usynlig, bare omvendt. Alle disse er nå rettet til å bruke mørk bunn på mobil. Fant også separate, litt andre farge-instanser i wizardens JavaScript-genererte valg-bobler som ikke hang sammen med v5.23-fiksen i det hele tatt — samme rettet.'
    ]
  },
  {
    v: '5.23',
    d: 'juli 2026',
    changes: [
      'Fant og rettet en systemisk variant av admin-fargefeilen fra forrige versjon: Guide-teksten, Info-sidens menyrader, Formler-tabellen, Feedback-listen, deig-kortene og flere andre steder brukte alle den samme hardkodede mørke tekstfargen fra før restylingen — usynlig mot den nye mørke mobilbakgrunnen. I stedet for å lappe hvert sted for seg, er dette nå rettet med én delt fargevariabel (47 steder samtidig) som automatisk følger lys/mørk-modus riktig — PC-visningen er bekreftet uendret.'
    ]
  },
  {
    v: '5.22',
    d: 'juli 2026',
    changes: [
      'Fikset at brukernavnene i Admin-visningen var usynlige på mobil — teksten hadde hardkodet mørk farge fra før restylingen, som forsvant mot den nye mørke modal-bakgrunnen. Admin-listen bruker nå farger som tilpasser seg både lys (PC) og mørk (mobil) visning. Samme feil rettet i Notater-fanens overskrift.',
      'Lagrede deiger og notater viser nå hvem som står bak: deig-kortene i "Mine deiger" viser "av [navn]" på deiger lagret fra nå av, og notater viser "sist lagret av [navn]" (og en signaturlinje under notatet på ferdige deiger). Eldre deiger og notater lagret før denne versjonen har ikke navn registrert, og vises uten.'
    ]
  },
  {
    v: '5.21',
    d: 'juli 2026',
    changes: [
      'Fremtidige steg i "Steg"-fanen er nå tydelig leselige (demping myknet fra 40 % til 75 % synlighet), slik at du kan lese hele oppskriften og få oversikt over alle stegene — dagens steg skiller seg fortsatt ut med den oransje kanten. Valgt som den enkleste av tre skisserte løsninger; en innholdsfortegnelse øverst kan bygges på toppen senere om behovet fortsatt er der.',
      'Avkrysningsboksene på stegene er gjort mye lettere å se: større (24px), med en lys, varm kantfarge som faktisk synes mot det mørke kortet — tidligere hadde kanten nesten samme farge som bakgrunnen. Haket tilstand fylles med ember-oransje.'
    ]
  },
  {
    v: '5.20',
    d: 'juli 2026',
    changes: [
      'Fant og fikset den egentlige årsaken til at nye brukere feilaktig fikk "Hei igjen! Du har brukt appen før" (v5.19 sin diagnose var ufullstendig og løste ikke problemet): deig-lageret er med vilje DELT for hele gruppen, men wizarden brukte "finnes det en aktiv deig eller favoritt i det delte lageret?" som bevis på at akkurat DU hadde brukt appen før — dermed fikk enhver ny bruker "Hei igjen" så lenge noen som helst i gruppen hadde en deig liggende. Avgjørelsen tas nå kun på det reelle per-bruker-signalet (ditt eget sist brukte oppsett); favoritt-snarveien vises fortsatt, men bare for faktisk tilbakevendende brukere.',
      'Fikset også at skjermen kunne stå scrollet nedover (og se tom ut) rett etter innlogging: tastatur/fokus på navn- og PIN-feltene scroller skjermen bak innloggingsbildet, og ingenting nullstilte dette før etter et nettverkskall. Scroll nullstilles nå umiddelbart når innloggingsbildet lukkes.'
    ]
  },
  {
    v: '5.19',
    d: 'juli 2026',
    changes: [
      'Fikset en variant av wizard-regresjonen fra tidligere: en ny bruker på en nettleser/enhet som tidligere er brukt av en annen konto kunne bli møtt med "Hei igjen!" og feil favoritt-status. Årsaken var beslektet med forrige fiks, men på et annet felt — syncFavoriteButton() kjørte ved sideinnlasting, før innlogging var reell, og window._favoriteId ble aldri hentet på nytt etter at den faktiske brukeren logget inn. Nå henter authComplete() riktig favoritt-status før wizarden avgjør noe.'
    ]
  },
  {
    v: '5.18',
    d: 'juli 2026',
    changes: [
      'Dempet "Hvorfor"/"Tips"-boksene i "Steg"-fanen, som følte seg for kraftige og stjal oppmerksomhet fra selve steget. Byttet fra fylt bakgrunnsfarge til en tynn kantstrek uten fyll (ett av tre skisserte alternativer) — beholder nok visuell distinksjon til å skille tilleggsinfo fra hovedteksten, uten å konkurrere med steget selv.'
    ]
  },
  {
    v: '5.17',
    d: 'juli 2026',
    changes: [
      'Fikset at fanebytte og wizard-navigering kunne vise en synlig hopp-bevegelse i scroll-posisjonen ("starter litt opp og ned"). Den forrige fiksen rettet selve sluttresultatet, men kunne fortsatt vise et kort, forvirrende hopp underveis. Fanen holdes nå usynlig helt til scroll-posisjonen er bekreftet på plass, i stedet for å vise feil posisjon og så korrigere den — brukeren ser aldri lenger selve hoppet. Samme forbedring gjort for wizard-steg-navigering, med en liten justering slik at "Se i Finjuster"-fremhevingen fortsatt fungerer korrekt sammen med det.'
    ]
  },
  {
    v: '5.16',
    d: 'juli 2026',
    changes: [
      'Fikset at en ny bruker på samme nettleser/enhet kunne bli møtt med "Hei igjen!" og en annen brukers siste innstillinger. Årsaken var at "sist brukte oppsett" ble lagret under én delt nøkkel i nettleserens lokale lagring, uten kobling til hvilken bruker som faktisk var innlogget — nå lagres og leses dette per bruker-id, så en fersk registrering på samme enhet aldri lenger arver en annen brukers historikk. Bekreftet med to simulerte brukere på samme nettleser.'
    ]
  },
  {
    v: '5.15',
    d: 'juli 2026',
    changes: [
      'Fullført Forno-restylingen av wizarden (Pizzatype → Metode → Planlegging → Finjuster), som brukte fargekoder direkte i HTML-en (ikke CSS-klasser) og derfor ikke arvet tokens automatisk fra forrige runde. Nå Forno-stylet: alle knapper og kort, metode-valg-kortene, pizza-teller, "Starter nå"/"Steketid"-bryteren, dato-/tidsfeltene, Finjuster sine seksjoner, og oppskrift-fanens ingrediensliste. Bekreftet med fargemålinger for alle wizard-steg.'
    ]
  },
  {
    v: '5.14',
    d: 'juli 2026',
    changes: [
      'Startet restylingen til "Forno"-retningen (valgt av to skisserte alternativer): kullsvart bunn, ember-oransje aksent, Archivo Black/IBM Plex Mono-typografi. Bygget som en tokens-basert bunnstruktur (CSS-variabler for farger/fonter definert ett sted, arvet automatisk) fremfor å style hver fane for seg. Dekker foreløpig: hele mobil-skallet (toppfelt, bunn-menyfaner, fane-bakgrunn), steg-kortene i "Steg"-fanen (den mest brukte skjermen), dag-overskrifter, innstillings-rader/slidere, og alle modal-vinduer (Feedback/Formler/Hva er nytt/Guide). Bekreftet med fargemålinger i headless nettleser. PC-visningen og enkelte inline-stylede detaljer i wizarden (pizza-teller, metode-kort) er ikke omfattet ennå — naturlig neste steg.'
    ]
  },
  {
    v: '5.13',
    d: 'juli 2026',
    changes: [
      'Fjernet "Aa"-knappen (hurtig skriftstørrelse-bytte) fra toppen av mobilvisningen, i forkant av en større restyling av appen. Skriftstørrelse kan fortsatt justeres via segmentert-kontrollen i Info-fanen.'
    ]
  },
  {
    v: '5.12',
    d: 'juli 2026',
    changes: [
      'Styrket scroll-nullstillingen ved bytte av wizard-steg og faner ytterligere (dobbel animasjonsramme + en liten etterfølgende sjekk), samt lagt til "overflow-anchor:none" som ekstra sikring mot at nettleseren selv justerer scroll-posisjonen når innhold endrer størrelse rett etter et fanebytte. Gjelder spesielt "Planlegging"-steget i wizarden, som kan bli høyere enn skjermen på ekte telefon (native dato-/tidsfelt rendres ofte høyere på iOS enn i vanlige testverktøy) uten at det alltid lot seg gjenskape i testing her.'
    ]
  },
  {
    v: '5.11',
    d: 'juli 2026',
    changes: [
      'Meltype-varselet har nå en "⚙️ Se i Finjuster"-lenke i tillegg til hurtigknappene, for de som heller vil forstå og justere selv i stedet for å bruke en hurtigknapp. Den relevante seksjonen (Hydrering, eller Kjøleskapsheving ved gjæringstid-avvik) markeres kort med en gul fremheving og scrolles til automatisk, så du raskt ser hvor endringen bør gjøres.'
    ]
  },
  {
    v: '5.10',
    d: 'juli 2026',
    changes: [
      'Fikset at fanebytte på mobil (spesielt Info-fanen) av og til landet scrollet nedover i stedet for øverst. Rot-årsaken var en kappløps-situasjon: scroll-nullstillingen skjedde synkront rett etter at fanen byttet fra skjult til synlig, og noen ganger rakk ikke nettleseren å oppdatere fanens scroll-område før nullstillingen ble utført, så den ble uten effekt. Nullstillingen skjer nå i neste "frame" i stedet, samme mønster som allerede brukes andre steder i appen for tilsvarende mål-etter-rendring-situasjoner. Samme fiks lagt til i wizardens steg-navigering for konsekvens.'
    ]
  },
  {
    v: '5.9',
    d: 'juli 2026',
    changes: [
      'Fikset et ekte tilfelle av toppfeltet på mobil som overlappet innholdet under (f.eks. et meltype-varsel) — toppfeltet hadde fast høyde og rakk ikke plass til både navn/versjon og tidsstempel på to linjer. Toppfeltet vokser nå naturlig ved behov i stedet for å klippe/overlappe. Bekreftet med skjermbilde-mål.',
      'Meltype-varselet (gjæringstid/hydrering stemmer ikke) har nå også en hurtigknapp for selve gjæringstiden — "Øk hevetiden"/"Reduser hevetiden" — i tillegg til hydrerings- og melbytte-knappene som fantes fra før. Justerer time-/dags-innstillingen for gjeldende metode (Hurtigdeig, Kveldsdeig, eller kjøleskapsdager for Standard/Poolish/Biga), og bytter om nødvendig bort fra en fordeig-metode hvis selve fordeigen alene bruker mer tid enn melet tåler.',
      'Fjernet to overflødige elementer fra mobilvisningen: "startoppsett"-varselet ("Velg pizzatype... eller åpne en lagret deig") som overlappet med badgen på 🍽️ Mine deiger-knappen i toppen, og stjerne/favoritt-snarveien i toppen (favorittdeigen er fortsatt tilgjengelig via "Mine deiger"-listen, og via ★ Min favoritt i PC-menyen).',
      'Fikset at tekst inni modal-vinduer (Feedback, Formler, Hva er nytt, Guide) sluttet å vokse med skriftstørrelse-innstillingen, og dermed ble merkbart mindre enn resten av appen — spesielt tydelig på Feedback-siden. Dette var en bevisst, men for streng, avveining fra v5.8 sin fiks (se under) som skulle hindre at modalen ble høyere enn skjermen. Modal-boksens maks-høyde regnes nå ut i ekte skjerm-piksler via JavaScript i stedet for CSS zoom-kansellering, så teksten kan skalere normalt igjen samtidig som lukkeknappen garantert forblir synlig uansett skriftstørrelse. Bekreftet med skjermbilder og faktiske mål på alle tre nivåer.'
    ]
  },
  {
    v: '5.8',
    d: 'juli 2026',
    changes: [
      'Større font og ikon på bunn-menyfanene (mobil) — lettere å lese/treffe uansett skriftstørrelse-innstilling.',
      'Fikset tomrommet mellom Kopier/Kalender/Lagre-raden og bunn-fanelinja på "Steg"-fanen, som varierte med skriftstørrelse-innstillingen. Rot-årsaken var strukturell: knapperaden var "sticky" i forhold til selve fane-innholdet (som må kunne vokse med skriftstørrelsen for lesbarhet), mens bunn-menyen er sticky i forhold til hele siden — to ulike referanserammer som ikke alltid stemte overens. Knapperaden er nå "fixed" i forhold til selve skjermen, med posisjonen regnet ut i ekte skjerm-piksler via JavaScript, uavhengig av skriftstørrelse-innstillingen.',
      'Chicago sitt "Rund godt med begge hender"-steg presiserer nå at emnet presses ut i den runde jernpanna ved steking — samme presisering som Langpanne allerede hadde, for å unngå misforståelsen om at Chicago formes fritt for hånd som en napoletansk pizza.',
      '"Om appen" heter nå "Info" i bunn-menyen på mobil.',
      '"Tips og teknikk" er nå en egen knapp i Info-fanen (ved siden av Guide) i stedet for å alltid vises øverst — fanen blir kortere og ryddigere, og du slår opp teknikk-tipsene når du faktisk vil ha dem.',
      'Ryddet opp Info-fanen: gruppert i Hjelp (Guide/Tips og teknikk/Feedback), Admin (Formler/Admin) og Konto (Logg ut), med pil (›) på klikkbare rader. Versjonsnummer og "Hva er nytt" flyttet fra toppen til en rolig fotnote nederst.',
      'Forsøkt rettet: skriftstørrelse-kontrollen kunne overlappe radene under på enkelte enheter — flyttet mot-zoom-korreksjonen fra selve kontrollen til hele omsluttende boks, samme mønster som løste knapperad-avviket. Ikke bekreftet på ekte enhet ennå.'
    ]
  },
  {
    v: '5.7',
    d: 'juli 2026',
    changes: [
      'Wizarden på mobil: "antall pizzaer" er flyttet fra Finjuster til Planlegging-steget, rett under "Når vil du spise?" — melmengde i gram ligger fortsatt alene i Finjuster.',
      'Lagt til app-ikon for hjemskjerm på iPhone og Android (manifest + apple-touch-icon), slik at "Legg til på Hjem-skjerm" viser et ordentlig ikon og navn i stedet for standard nettleser-favicon.',
      'Egen avkrysningsboks lagt til venstre for det grønne steg-nummeret i "Steg"-fanen, for å gjøre det tydeligere at steg kan hakes av — hele raden er fortsatt tap-mål for avhaking.',
      'Fikset en rot-årsak som ga to synlige feil: Kopier/Kalender/Lagre-knapperaden i "Steg"-fanen var ikke reelt sticky (måtte scrolle helt ned for å se den, eller den dukket opp midt i steg-listen i stedet for rett over bunn-menyen), og fanebytte kunne se tomt ut. Den fulle årsaken viste seg å være to ting sammen: mobil-visningen manglet en avgrenset skjermhøyde, og selve "Steg"-fanen manglet "min-height:0" som flex-element — uten den vokser fanen seg like høy som innholdet i stedet for å bli klippet til tilgjengelig skjermplass, uansett hvor lang tidsplanen er. Bekreftet rettet med faktiske skjermbilde-tester. I samme slengen: navigering mellom wizardens steg (Pizzatype → Metode → Planlegging → Finjuster) nullstiller nå også scroll-posisjonen, og en gammel duplikat-id i markupen (to elementer med samme id) er ryddet opp.',
      'Fikset at "Hva er nytt" (og andre modal-vinduer) kunne miste lukkeknappen ved "Ekstra stor" skrift-innstilling — modalen ble da fysisk høyere enn skjermen og sentrerte seg slik at toppen (med ✕-knappen) havnet utenfor synsfeltet. Modal-vinduer bruker nå samme mot-zoom-teknikk som knapper og faner allerede gjorde, slik at de alltid forblir innenfor skjermen uansett skriftstørrelse-innstilling. (Denne teknikken ble senere forbedret i v5.9 — se over.)',
      'Fikset en regresjon der nye brukere ikke fikk se wizarden ved aller første innlogging.',
      'Lagt til "Logg ut" i PC-versjonens ☰ Meny (fantes tidligere kun på mobil).',
      'Feedback-listen vises nå direkte når du åpner "Feedback", i stedet for bak en "Se tidligere tilbakemeldinger"-toggle. Alle tilbakemeldinger kan nå stemmes opp (👍, én stemme per person per sak). "Merk som løst" og "Slett" er strammet inn til kun å vises for admin — disse var tidligere synlige for alle ved en feil.'
    ]
  },
  {
    v: '5.6',
    d: 'juli 2026',
    changes: [
      '"Pizzaplanlegger"-fanen på mobil heter nå "Planlegging".',
      '"Neste steg å gjøre" vises nå alltid fullt lesbart, selv om du ligger foran skjema og klokken teknisk sett ikke har nådd steget ennå.',
      'Skriftstørrelse-skalaen er forskjøvet ett hakk opp: "Normal" er nå det som før het "Stor", "Stor" er det som før het "Ekstra stor" (ny standard for alle nye brukere), og "Ekstra stor" er et helt nytt, enda større nivå.',
      'Dato-overskriften i steg-listen er forstørret, for tydeligere skille mellom dager.',
      'Litt større skrift på bunn-fanene (Planlegging/Steg/Oppskrift/Notater/Deiger/Om appen).',
      'Finjuster-skjermen har nå en ekte tilbakepil øverst (går til Planlegging-steget) og en tydelig, fylt "✓ Ferdig — se steg for steg"-knapp nederst — venstrepilen betydde tidligere "avslutt alt", noe som lett kunne forveksles med wizardens vanlige tilbake-navigasjon.',
      'Fjernet stjerne-ikonet fra vurderings-knappen på ferdige deiger (var forvirrende ved siden av favoritt-stjernen på samme kort) — viser nå konsekvent et blyant-ikon.',
      'Wizardens fremdriftsindikator er bygget om til en tydelig tidslinje — nummererte/hakede sirkler med linjer mellom, og alle tre stegnavn synlige samtidig (oppdateres til dine faktiske valg etter hvert). Innholdet starter også litt lenger ned fra toppen for mer luft.',
      '"Starter nå" viser ikke lenger et dato/tid-felt å fylle ut — bruker nåværende tidspunkt stille i bakgrunnen. Feltet finnes fortsatt under "Steketid", der det faktisk gir mening å oppgi et tidspunkt.',
      'Tre nye meltyper lagt til: Vanlig hvetemel, Regal Pizzamel og Regal Tipo 00 — proteininnhold hentet fra faktisk næringsinnhold, mens hydrerings- og fermenteringstall er merket "(anslått)" siden disse ikke er produsent-oppgitt slik de er for Caputo-melene.'
    ]
  },
  {
    v: '5.5',
    d: 'juli 2026',
    changes: [
      'Meltype-varselet (gjæringstid/hydrering stemmer ikke) har nå hurtigjustering direkte i varselet — "Sett hydrering til X%" og/eller "Bytt til [meltype]" — i stedet for at du må bytte til Pizzaplanlegger-fanen for å justere. Bruker nøyaktig samme funksjoner som selve fanen, så resultatet blir identisk uansett hvor du justerer fra. Fungerer likt på PC og mobil.'
    ]
  },
  {
    v: '5.4',
    d: 'juli 2026',
    changes: [
      'Trykk på logoen ("🍕 Pizzaplanlegger") for å åpne Guiden — både PC og mobil. Versjonsnummeret under logoen åpner fortsatt "Hva er nytt" som før, uavhengig av dette.'
    ]
  },
  {
    v: '5.3',
    d: 'juli 2026',
    changes: [
      'Lagt til en tydelig "Lukk"-knapp nederst i "Hva er nytt" — en veldig lang endringslogg kunne gjøre ✕-knappen øverst vanskelig å nå uten å scrolle helt tilbake opp.',
      'Fikset en reell feil: wizarden på mobil viste seg ikke ved aller første sideinnlasting — måtte bytte fane frem og tilbake for at den skulle dukke opp. Innstillinger-fanen var allerede markert aktiv i selve HTML-en fra start, så koblingen som skulle starte wizarden ble aldri utløst automatisk.',
      '"Tips" er slått sammen med "Om appen" til én fane — samler tips, skriftstørrelse, versjon/Hva er nytt, Guide, Feedback, Formler og Admin på ett sted. Innstillinger-fanen (wizarden) er nå ren konfigurasjon, uten noe av dette.',
      'Nullstill-knappen er fjernet, både PC og mobil — "Start noe nytt" i wizarden dekker samme behov på mobil.',
      'Guiden har nå en "Prøv det nå →"-knapp på mobil som starter wizarden direkte, i stedet for å bare beskrive stegene i tekst.'
    ]
  },
  {
    v: '5.2',
    d: 'juli 2026',
    changes: [
      'Ny wizard-flyt for innstillinger på mobil — erstatter den lange ettsides listen med tre korte steg (Pizzatype → Metode → Når vil du spise), med brødsmule-sti øverst du kan trykke på for å hoppe rett tilbake til et tidligere valg.',
      'Returnerende brukere møtes av et valg først: "Bruk samme som sist", "Åpne favoritten min", eller "Start noe nytt" — for å unngå at wizarden blir tungvint hvis du baker samme oppskrift ofte.',
      '"Finjuster"-lenke på siste steg åpner alle de andre innstillingene (mel, hydrering, gjærtype, meltype osv.) samlet, for de som vil justere mer.',
      'Kun mobil — PC-versjonen er uendret.'
    ]
  },
  {
    v: '5.1',
    d: 'juli 2026',
    changes: [
      'Mobilens "Steg for steg"-fane er kortet ned til "Steg" — den forrige teksten ble dårlig wrappet i bunnmenyen.',
      'Dytt-videre-indikatoren er endret fra en engangs-pulsering til noe varig: den vises nå konsekvent hver gang du er på Innstillinger-fanen (du har nettopp valgt noe, gå videre til Steg), og skjules kun mens du faktisk står i Steg-fanen — ikke en engangsting du kan "bruke opp".'
    ]
  },
  {
    v: '5.0',
    d: 'juli 2026',
    changes: [
      '"Tidsplan" heter nå "Steg for steg" — mer tydelig for nye brukere at det er her selve fremgangsmåten vises, ikke bare en kalenderoversikt.',
      'Ny pulserende prikk på "Steg for steg"-fanen på mobil, synlig helt til du besøker den første gang — en tydelig dytt videre etter at du har valgt pizzatype/metode i innstillinger.'
    ]
  },
  {
    v: '4.9',
    d: 'juli 2026',
    changes: [
      'Fikset en reell feil i gjærregnskapet for Poolish og Biga — kun 50% (Poolish) og 10% (Biga) av beregnet gjærmengde ble faktisk brukt i oppskriftene, resten forsvant sporløst. All gjæren legges nå riktig i selve for-deigen (poolishen/bigaen), ingenting tilsettes i sluttblandingen — det er slik det faktisk skal gjøres.',
      'Rettet en upresis forklaring om melkesyrebakterier i Poolish-teknikken — det er primært enzymer, gjærens egne fermenteringsprodukter og milde organiske syrer som bygger smak, ikke melkesyrebakterier (som spiller en mye større rolle i ekte surdeig).',
      '"Poolish gir løsere glutenstruktur" er endret til riktig beskrivelse: poolish gjør deigen mer extensibel (lettere å strekke), ikke løsere.',
      'New York-pizzaens steketemperatur er endret fra et absolutt tak ("ikke over 350°C") til et veiledende intervall med rom for justering etter egen ovn.'
    ]
  },
  {
    v: '4.8',
    d: 'juli 2026',
    changes: [
      'Fikset en oppstartsfeil på mobil der Pizzatype og Metode kunne vises tomme når appen ble åpnet direkte på telefon (ikke via "bytt til mobil" på PC) — mobil-innholdet ligger fysisk etter hovedskriptet i selve filen, og kunne i noen tilfeller forsøke å fylles ut før den delen av siden var ferdig lastet inn. Lagt til et sikkerhetsnett som garantert fyller alt på nytt når absolutt alt er klart.'
    ]
  },
  {
    v: '4.7',
    d: 'juli 2026',
    changes: [
      'Rettet en upresis forklaring på romtemperaturheving/bulk-heving — den blandet en generell påstand om gjærbiologi ("gjæren er mest aktiv 25–35°C") med et urelatert 60-minutters referansetall, uavhengig av hvor lang selve hevingen faktisk var. Forklaringen viser nå riktig, faktisk varighet for akkurat det steget.',
      'Elting nevner nå et mål for sluttdeigtemperatur (ca. 24°C for Hurtigdeig, ca. 20–22°C for Kveldsdeig) i tillegg til minuttall — mer robust enn ren tid, siden kjøkkenmaskiner og mel varierer.',
      'Forvarming i Hurtigdeig presiserer nå at vanlig ovn med pizzastein/-stål trenger 45–60 min forvarming, ikke bare selve lufttemperaturen — samme presisjon Standard-metoden allerede hadde.',
      'Rettet en gjenstående entall/flertall-feil ("1 timer" → "1 time") i visning av hevetider.'
    ]
  },
  {
    v: '4.6',
    d: 'juli 2026',
    changes: [
      'Fikset et avvik i "Kopier"-funksjonen: gjærmengden i ingredienslisten stemte ikke alltid med det som faktisk sto i selve tidsplan-steget for Hurtigdeig og Kveldsdeig, siden kopieringen brukte en annen (generell) beregning enn de to metodene faktisk bruker.'
    ]
  },
  {
    v: '4.5',
    d: 'juli 2026',
    changes: [
      'Hurtigdeig bruker nå en beregnet vanntemperatur i stedet for et fast "lunkent, 35–38°C" — basert på samme "ønsket deigtemperatur"-formel profesjonelle bakere bruker (3 × måltemperatur − romtemperatur × 2 − friksjon fra eltemetoden). Målet er ca. 24°C ferdig deig uansett timevalg, siden det er gjærmengden som skal styre hvor fort deigen går — ikke vanntemperaturen. Tallet endrer seg med romtemperatur og valgt kjøkkenmaskin.',
      'Ny forklaring i Teknikk om hvorfor vanntemperaturen nå regnes ut i stedet for å være fast.'
    ]
  },
  {
    v: '4.4',
    d: 'juli 2026',
    changes: [
      'Meltype-varselet sjekker nå også hydrering, ikke bare gjæringstid — velger du f.eks. Dallari pizzamel (55–60%) mens hydreringen står på 65%, får du nå beskjed om det. Viser begge problemene samlet hvis både tid og hydrering ikke stemmer.'
    ]
  },
  {
    v: '4.3',
    d: 'juli 2026',
    changes: [
      '"★ Min favoritt" er flyttet fra en egen knapp i sidepanelet til en handling i "☰ Meny". Fikset samtidig en underliggende svakhet — å åpne favoritten kunne feile stille hvis "Deiger" aldri var åpnet i økten ennå.',
      'Guiden vises nå automatisk hver gang du logger inn, helt til du trykker "Ikke vis igjen" — å bare lukke den med ✕ viser den på nytt neste gang.',
      'Standard kjøleskapsheving er endret fra 3 til 1 dag — 3 dager kombinert med standard meltype (Doppio Zero) ga et gjæringsvarsel til nesten alle nye brukere med en gang, siden 72 timer ligger utenfor Doppio Zero sitt 24-timers vindu. Gjelder også ved Nullstill.'
    ]
  },
  {
    v: '4.2',
    d: 'juli 2026',
    changes: [
      'Fikset en reell feil: etter å ha lagret en deig på PC, viste appen fortsatt "Ulagret oppsett" til du gjorde en annen endring — lagringen fungerte, men visningen oppdaterte seg ikke med en gang.',
      'Overskriften viser nå navnet på lagret deig, f.eks. "Langpannepizza · standard · Runes lagrede pizza".',
      '"Pålogget som [navn]" vises nå nederst i sidepanelet.',
      'Feedback-skjemaet lukker seg selv kort tid etter vellykket sending, i stedet for at du må trykke ✕ manuelt.'
    ]
  },
  {
    v: '4.1',
    d: 'juli 2026',
    changes: [
      'Kalender-påminnelser ("📅 Påminnelser") tilbake på PC — lastet ned som en .ics-fil med varsel 10 min før hvert steg. Fantes fra før kun på mobil.',
      'Ferdige deiger kan nå få et bilde og en stjernevurdering (1–5) — trykk "Ferdig" på en aktiv deig, eller "✏️"/"⭐" på en allerede ferdig deig for å legge til eller endre i etterkant.',
      'Ingredienser i Oppskrift-fanen kan nå hakes av (mel, vann, salt osv.) mens du henter dem frem — lagres sammen med deigen, akkurat som avhaking av steg i Tidsplan.',
      'Guiden nevner nå at Tips, Deiger, Feedback og mer finnes i "☰ Meny" øverst.',
      '"⋯ Mer" er omdøpt til "☰ Meny" for å signalisere navigasjon tydeligere, og "IngenElting" skrives nå "Ingen elting" i alle visningstekster.'
    ]
  },
  {
    v: '4.0',
    d: 'juli 2026',
    changes: [
      'Nytt gjennomgående design — kjøligere fargepalett, hvite kort med skygge i stedet for synlige kanter, og et strammere visuelt uttrykk gjennom hele appen.',
      'Meltype er endret fra piller til en vanlig nedtrekksmeny (dropdown) — seks lange melnavn i pille-form så rotete ut, spesielt på mobil der hover-tekst uansett ikke fungerer.',
      'Gjærtype, Kjøkkenmaskin og Ovntype vises nå som en ekte segmentert kontroll (én sammenhengende boks) i stedet for løse piller, både på PC og mobil.',
      'Sidenav (Guide/Tips/Deiger/Feedback/Formler/Admin) er samlet i én kompakt "⋯ Mer"-meny i stedet for seks alltid-synlige knapper.',
      'Knapper er redusert til to konsekvente stiler i hele appen — fylt primær og nøytral "ghost" — med fast høyde.',
      'Skriftstørrelse-innstillingen påvirker nå kun lesetekst (steg, forklaringer) — knapper, piller og navigasjon holder fast størrelse uansett innstilling.'
    ]
  },
  {
    v: '3.9',
    d: 'juli 2026',
    changes: [
      'Fjernet dupliserte "Vis/skjul forklaringer"-kontroller (fantes både i sidepanelet/mobil-Visning og i handlingsgruppen) — finnes nå kun ett sted.',
      '"Planlegging" (når du vil spise) er flyttet opp til rett etter Metode, både på PC og mobil — tidligere lå den nederst, bak seks andre innstillinger, selv om det ofte er den første beslutningen man faktisk tar.',
      'Ny "❓ Guide"-lenke lagt til på mobil — fantes tidligere kun på PC (bortsett fra automatisk førstegangsvisning).',
      'Visuelt skille i navigasjonen mellom verktøy for alle (Guide/Tips/Deiger/Feedback) og admin-verktøy (Formler/Admin), på både PC og mobil.'
    ]
  },
  {
    v: '3.8',
    d: 'juli 2026',
    changes: [
      'Ny "📊 Formler"-side i sidenav — viser salt/olje/gjær/hydrering for alle pizzatyper. Åpen for alle å se, redigerbar for admin.',
      'Admin kan nå endre disse kjernetallene direkte i appen, uten å be meg redigere kode og deploye på nytt. Forrige verdi vises alltid ved siden av, med en "↺ angre"-knapp.',
      'Vanlige brukere kan foreslå en ny verdi for et tall (med begrunnelse) — admin ser innsendte forslag i Formler-siden og kan bruke eller avvise dem med ett trykk.',
      'Appen venter nå på å hente disse tallene fra serveren før noe vises ved oppstart, slik at ingen noensinne ser utdaterte tall.'
    ]
  },
  {
    v: '3.7',
    d: 'juli 2026',
    changes: [
      'Meltype viser nå protein, styrke (W), hydrering og fermenteringsvindu i en alltid-synlig infolinje under pillene — fungerer på mobil, der den gamle hover-teksten aldri var synlig i utgangspunktet siden touch-skjermer ikke har hover.'
    ]
  },
  {
    v: '3.6',
    d: 'juli 2026',
    changes: [
      'Neste steg å gjøre får nå en tydelig blå markering ("👉 neste") — det er det første ikke-avhakede steget, og henger sammen med klokka: er du på etterskudd peker den på det du mangler, er du i rute faller den sammen med den vanlige "nå"-fremhevingen (og vises da ikke som en ekstra boks).',
      'Haker du av et steg, scroller siden nå automatisk til neste steg — nyttig på en lang tidsplan der du ellers må lete etter hvor du var.'
    ]
  },
  {
    v: '3.5',
    d: 'juli 2026',
    changes: [
      'Fikset lukkeknappen på popup-vinduer (Tips, Hva er nytt, Deiger, Feedback, Guide, Admin) på telefoner med hakk/dynamisk øy — vinduet kunne tidligere rendres bak den øverste sikkerhetssonen, slik at ✕ ble vanskelig eller umulig å treffe.'
    ]
  },
  {
    v: '3.4',
    d: 'juli 2026',
    changes: [
      'Gjærtype, Kjøkkenmaskin, Meltype og Ovntype er samlet bak "⚙️ Avanserte innstillinger" i sidepanelet, lukket som standard — kjernevalgene (Pizzatype, Metode, Melmengde, Planlegging) er nå det eneste en ny bruker møter først.',
      'Ny "❓ Guide"-lenke i sidepanelet — en kort 4-stegs quickstart som viser seg automatisk første gang du logger inn, og er tilgjengelig når som helst etterpå.',
      '"Teknikk" heter nå "Tips" — samme innhold, mindre teknisk klingende navn.'
    ]
  },
  {
    v: '3.3',
    d: 'juli 2026',
    changes: [
      'Enkel innlogging med navn + 4-sifret PIN — første gang du skriver navnet ditt, lager du en PIN; neste gang logger du inn med samme navn og PIN. Forblir innlogget til du selv logger ut.',
      'Ny admin-visning (lenke nederst på innloggingsskjermen, passordbeskyttet) for å se alle brukere, sette ny PIN, og slette brukere.'
    ]
  },
  {
    v: '3.2',
    d: 'juli 2026',
    changes: [
      'Favoritt-merking av lagrede deiger (★ på kortet i Mine deiger) — kun én av gangen. En ny "★ Min favoritt"-knapp dukker opp i sidepanelet (og mobiltoppfeltet) og åpner favoritten direkte, uten å lete gjennom listen.',
      'Ny "Gi tilbakemelding"-funksjon — send inn kategori (mel/feil/forslag/annet) + melding, med versjon og gjeldende innstillinger sendt med automatisk. Lagres delt via Netlify Blobs, med en egen liste du kan se og merke som løst inne i appen.'
    ]
  },
  {
    v: '3.1',
    d: 'juli 2026',
    changes: [
      'Hurtigdeig utvidet fra 2–10 til 2–16 timer — de tre nye alternativene (12/14/16t) er kalibrert for et kjøligere kjøkken (18–20°C), etter research som viser at dette er helt vanlig praksis ved lavere romtemperatur.',
      'Beskrivelsen er endret fra "uten kjøleskapsheving" til "romtemperatur", siden det er det som faktisk kjennetegner metoden.',
      'Nytt varsel hvis du velger en lang hurtigdeig-variant (12t+) samtidig som romtemperaturen er stilt til 22°C eller høyere — de lange alternativene forutsetter et kjøligere kjøkken enn det.'
    ]
  },
  {
    v: '3.0',
    d: 'juli 2026',
    changes: [
      'Caputo Pizzeria og Nuvola sitt gjæringstak økt fra hhv. 36t/40t til 48t, etter kryssjekk mot Maschmanns (norsk Caputo-distributør) — Doppio Zero sitt tak på 24t stemte allerede.',
      'Mindre presiseringer i protein/styrke-tall for Couco og Manitoba Oro basert på samme kryssjekk.',
      'Fikset en timing-illusjon: pille- og kortvalg (pizzatype, metode, meltype, gjærtype, kjøkkenmaskin, ovntype, timevalg, nullstill) oppdaterer nå tidsplanen umiddelbart i stedet for etter en liten forsinkelse — klikker du fort gjennom flere valg, henger ikke visningen lenger igjen på det forrige valget.'
    ]
  },
  {
    v: '2.9',
    d: 'juli 2026',
    changes: [
      'Nytt valg: Meltype (Dallari, Caputo Doppio Zero/Pizzeria/Nuvola/Couco/Manitoba Oro) — basert på MENY sin meloversikt, med protein, styrke (W) og anbefalt fermenteringsvindu per mel.',
      'Nytt varsel direkte øverst i Tidsplan hvis planlagt total gjæringstid ligger utenfor det valgte melets anbefalte vindu — for kort tid gir dårlig glutenutvikling, for lang tid kan bryte ned gluten. Regner riktig uansett metode (dager for Standard/Poolish/Biga, timer for Hurtigdeig/Kveldsdeig/IngenElting).'
    ]
  },
  {
    v: '2.8',
    d: 'juli 2026',
    changes: [
      'Chicago: lagt til smør som egen ingrediens (12% av melvekten), i tillegg til oljen — etter sammenligning med flere anerkjente oppskrifter som viste at appen brukte 2–3× for lite fett for den karakteristiske flakete Chicago-skorpen.',
      'Chicago: hydrering justert ned fra 59% til 55%, nærmere det som er vanlig i ekte deep dish-oppskrifter.',
      'Gjærkurven for lange kaldhevinger (Standard/Poolish/Biga, 1–6 dager) er skalert ned ~25% — samme type justering som Kveldsdeig fikk, etter at sammenligning med AVPN-kilder viste at kurven lå i overkant for flerdagers kaldheving.',
      'Ny forklaring i Teknikk om hvorfor Chicago har mer smør enn andre stiler, med valgfri "laminering"-teknikk for en ekstra flakete skorpe.'
    ]
  },
  {
    v: '2.7',
    d: 'juli 2026',
    changes: [
      'Salt for Napoletansk økt fra 2,5% til 2,8% (12,5g → 14g ved 500g mel) etter tilbakemelding om bedre smak ved høy steketemperatur.',
      'Kveldsdeig utvidet til 5–24 timer (var 5–15t) — nye valg på 18 og 24 timer gir et ekte "kveld til neste kveld"-vindu, ikke bare korte varianter. Tempereringstiden øker til 2 timer for de lengste variantene.'
    ]
  },
  {
    v: '2.6',
    d: 'juli 2026',
    changes: [
      'Kveldsdeig: gjærmengden er redusert ca. 25% etter tilbakemelding om at den lå i overkant — mindre margin for overgjæring, spesielt i varmere kjøleskap.',
      'Kveldsdeig: mindre skråsikker "hvorfor kaldt vann"-forklaring — presiserer at det handler om kontroll på deigtemperatur, ikke en påstand om at lunkent vann gir "ukontrollert" gjæring.'
    ]
  },
  {
    v: '2.5',
    d: 'juli 2026',
    changes: [
      'Ny metode: Kveldsdeig — 5–15 timer i kjøleskapet, mellom Hurtigdeig (samme dag, romtemperatur) og Standard (flere dagers planlegging). Bland om kvelden, stek neste dag.',
      'Bruker kaldt vann i blandefasen (ikke lunkent som Hurtigdeig), for bedre kontroll på gjæringen før kjøleskapet kjøler ned deigen.',
      'Egen gjærkurve for kort kaldheving, og kortere temperering (90 min) enn Standard-metodens 4 timer siden deigen ikke har vært kald like lenge.'
    ]
  },
  {
    v: '2.4',
    d: 'juli 2026',
    changes: [
      'Ny "rund opp"-knapp for Langpanne/IngenElting — dukker kun opp når melmengden din gir en ujevnt fylt langpanne, og foreslår nøyaktig hvor mye ekstra mel som trengs for å fylle den helt. Endrer aldri noe automatisk — du må selv trykke.'
    ]
  },
  {
    v: '2.3',
    d: 'juli 2026',
    changes: [
      'Varsel ved fare for overfermentering — dukker opp i Teknikk ved lang gjæringstid, og regner med forgjæringen i poolish/biga (ikke bare kjøleskapsdager alene).',
      'Steg som er passert i tid uten å være avhaket, får nå en tydelig "ikke avhaket"-markering.',
      'Skriftstørrelse flyttet til "Denne deigen" som en enkel +/− -knapp, med en snarveiknapp ("Aa") og et to-fingers sveip opp/ned for rask justering på mobil.',
      'Kun én Nullstill-knapp igjen (var to) — den viser nå "velg pizzatype"-hintet på nytt, som om appen er helt fersk.',
      '"IngenElting" er flyttet fra Metode til Pizzatype, siden den alltid gir samme resultat (fokaccia-aktig pannepizza) uansett hvilken metode som var valgt før.',
      'Antall "pizzaer" for Langpanne og IngenElting viser nå riktig antall langpanner (beregnet fra formstørrelse), i stedet for å late som de er runde enkeltpizzaer.',
      'Bytter du pizzatype, dukker det opp en kort, corny animasjon som bekrefter valget.',
      'Varselbjelken for aktive deiger øverst i vinduet er fjernet — telling ligger fortsatt i sidepanelet og mobiltoppfeltet.',
      '"Lagre deig"-knappen har samme nøytrale stil som resten av knapperaden, i stedet for å skille seg ut i grønt.'
    ]
  },
  {
    v: '2.2',
    d: 'juli 2026',
    changes: [
      'Nytt valg: Kjøkkenmaskin (Ankarsrum / Manuell elting / Annen maskin) — instruksjonene i tidsplanen og Teknikk-fanen tilpasser seg faktisk til valget, ikke bare tekst/etiketter.',
      'Manuell elting skiller mellom vanlig "press, brett, drei"-teknikk og fransk elting (slap-and-fold) ved høy hydrering, siden våt deig ikke lar seg elte for hånd på vanlig vis.',
      'Ny forklaring i Teknikk om vanntemperatur tilpasset kjøkkenmaskin — vanlige kjøkkenmaskiner tilfører mye mer friksjonsvarme enn Ankarsrum/håndelting, og trenger derfor kaldere vann for å nå samme deigtemperatur.',
      'Gjærtype, Kjøkkenmaskin og Ovntype bruker nå samme visuelle stil (piller) i sidepanelet, i stedet for to ulike stiler som før.'
    ]
  },
  {
    v: '2.1',
    d: 'juli 2026',
    changes: [
      'Deiger kan lagres delt (Netlify Blobs) — lagre, åpne og fullfør samme deig fra flere enheter, sammen med familie/venner.',
      'Notater er nå knyttet direkte til hver deig i stedet for en generell logg i nettleseren.',
      'Steg i tidsplanen kan hakes av, og fremdriften lagres sammen med deigen.',
      'Ny "Deiger"-oversikt viser aktive og ferdige bakster, med varselbjelke og telling som viser hvor mange som er aktive.',
      'Teknikk og Deiger åpnes nå som popup-vinduer i stedet for faner, og forstyrrer ikke tidsplanen du står i.',
      'Alle handlingsknapper (Lagre, Mine deiger, Kopier, Vis/skjul forklaringer) samlet i én gruppe.',
      'Meltype er fjernet som eget valg — informasjon om meltyper og vannmengde ligger nå i Teknikk.',
      'Overskriften viser nå metode og antall pizzaer tydelig, og hovedvinduet er tonet ned til du gjør ditt første valg.'
    ]
  }
];
