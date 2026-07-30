// Bruksanvisning for UltimatePizza — ren data, ingen logikk. Lastes via <script src>
// FØR hovedscriptet i index.html og rendres av buildManualHTML() (i index.html).
//
// LEVENDE DOKUMENT: denne fila skal alltid stemme med appen. Endrer vi en funksjon,
// legger til en metode, eller flytter en knapp — oppdater tilsvarende seksjon her i
// samme slengen. Blokk-typer renderes slik:
//   {t:'p',       x:'avsnitt (kan ha <b>…</b>)'}
//   {t:'sub',     x:'underoverskrift'}
//   {t:'steps',   x:['nummerert','liste']}
//   {t:'bullets', x:['kulepunkt','liste']}
//   {t:'tip',     x:'💡-boks (praktisk tips)'}
//   {t:'smart',   x:'✨-boks (framhever en smart funksjon)'}

const GUIDE_INTRO = 'UltimatePizza regner <b>baklengs</b>: du sier når pizzaen skal være ferdig, så viser appen nøyaktig når og hvordan du må jobbe for å treffe. Denne bruksanvisningen går gjennom hele mobilappen — trykk et emne i lista under for å hoppe rett dit.';

const GUIDE = [

  {
    icon: '👋', title: 'Velkommen',
    body: [
      {t:'p', x:'Appen er bygd rundt én idé: <b>du bestemmer spisetiden, appen regner ut resten</b> — når deigen skal blandes, heve, stå i kjøleskap og stekes. Du trenger ikke kunne noe om baker-matematikk; velg pizza, metode og tidspunkt, så får du en ferdig tidsplan å følge steg for steg.'},
      {t:'sub', x:'De sju fanene nederst'},
      {t:'bullets', x:[
        '<b>⚙️ Planlegging</b> — veiviseren der du setter opp deigen (pizza, metode, tidspunkt).',
        '<b>📅 Tidsplan</b> — den ferdige, tidsstyrte planen du følger steg for steg.',
        '<b>🍕 Oppskrift</b> — ingredienslista med mengder.',
        '<b>📝 Notater</b> — dine notater til en lagret deig.',
        '<b>🍽️ Deiger</b> — lagrede deiger du (og andre) kan hente fram igjen.',
        '<b>ℹ️ Info</b> — visning, hjelp, denne bruksanvisningen og «Hva er nytt».',
        '<b>🧭 Beta</b> — «Finn oppskrift»: oppgi ledig tid, få en anbefalt metode tilbake.'
      ]},
      {t:'smart', x:'Du kan gå fritt fram og tilbake i planleggingen — <b>📅 Tidsplan</b> viser alltid resultatet av gjeldende valg. Ingenting «låses» før du vil.'}
    ]
  },

  {
    icon: '🍕', title: 'Din første pizza',
    body: [
      {t:'p', x:'Den raskeste veien fra tom skjerm til ferdig plan:'},
      {t:'steps', x:[
        'Åpne <b>⚙️ Planlegging</b> og velg <b>pizzatype</b> (f.eks. Napoletansk) og <b>antall</b>.',
        'Velg <b>når du vil spise</b> — «🍕 Planlagt steketid» med dato/klokkeslett, eller «▶ Jeg begynner nå».',
        'Trykk <b>Neste →</b> og velg en <b>metode</b>. Er du usikker: <b>Langtidsdeig</b> er et trygt førstevalg.',
        'Trykk <b>Neste →</b> til <b>«Holder dette?»</b>. Er alt grønt, trykk <b>Se tidsplanen →</b>.',
        'I <b>📅 Tidsplan</b> følger du stegene ovenfra og ned og haker av etter hvert.'
      ]},
      {t:'tip', x:'Vil du bare eksperimentere? Sett «▶ Jeg begynner nå» + <b>Hurtigdeig</b>, så har du pizza på noen få timer.'}
    ]
  },

  {
    icon: '⚙️', title: 'Planlegging: veiviseren',
    body: [
      {t:'p', x:'Planlegging er en veiviser i tre steg: <b>Pizza → Metode → Sjekk</b>. Øverst ser du stegene som prikker.'},
      {t:'bullets', x:[
        'Gå videre med <b>Neste →</b>, eller hopp fritt ved å trykke på steg-prikkene — begge veier.',
        'Du kan også <b>sveipe</b> til venstre/høyre for å bytte steg. (Sveip som starter på en glidebryter eller et datofelt teller ikke, så du endrer ikke steg ved et uhell.)',
        '<b>←</b>-pilen øverst tar deg ett steg tilbake.'
      ]},
      {t:'sub', x:'Steg 1 — «Hvilken pizza?»'},
      {t:'bullets', x:[
        '<b>Pizzatype</b>: Napoletansk (tynn, luftig), Langpanne (myk), New York (foldbar, med olje/sukker), Chicago (deep dish) eller Ingen elting.',
        '<b>Antall pizzaer</b> med −/+ (standard 4). Noen ganger foreslår appen å runde opp til en full langpanne.',
        '<b>Når vil du spise?</b> — se egen seksjon «Når vil du spise?».'
      ]},
      {t:'sub', x:'Steg 2 — «Hvilken metode?»'},
      {t:'bullets', x:[
        'Seks metodekort. Har du satt en steketid, viser hvert kort om det <b>passer godt</b> (grønt) eller <b>«rekker ikke — trenger ca. X t»</b> (nedtonet). Kort som ikke rekker, dempes.',
        'En <b>«💡 Hvorfor [metode]?»</b>-boks forklarer den valgte metoden. Noen metoder får egne valg her (f.eks. Poolish sin <b>🌡️ Romtemperatur / ❄️ Kjøleskap</b>-bryter, eller varighet for Hurtig/Kveld/Biga).',
        '<b>Meltype</b> velger du fra nedtrekkslista, med en infoboks under.'
      ]},
      {t:'smart', x:'Metodekortene er «ærlige»: rekker ikke en metode fram til spisetiden din, sier appen det rett ut i stedet for å la deg velge noe som ikke går opp.'},
      {t:'sub', x:'Steg 3 — «Holder dette?» (Sjekk)'},
      {t:'p', x:'Her får du kvalitetssjekken (se seksjonen «Sjekk & varsler»). Er alt i orden, står det <b>«✓ Planen holder»</b>. Herfra: <b>Se tidsplanen →</b>, eller juster kjøleskapstiden med −/+.'}
    ]
  },

  {
    icon: '🎛️', title: 'Innstillingene forklart',
    body: [
      {t:'p', x:'De fleste finjusteringene bor i <b>Finjuster</b> — panelet du åpner med <b>⚙️ Juster</b> (fra statuslinja eller Tidsplan-verktøylinja), eller via «⚙️ Se i Finjuster»-lenkene i varslene. Alt er levende glidebrytere med −/+: statuslinja oppdaterer seg med det samme.'},
      {t:'bullets', x:[
        '<b>Melmengde</b> — 300–1500 g. Alt annet (vann, salt, gjær) regnes ut fra dette.',
        '<b>Hydrering</b> — 55–80 %, altså hvor mye vann i forhold til mel. En chip viser <b>veldig fast / fast / anbefalt / høy / veldig høy</b> for pizzatypen din.',
        '<b>Kjøleskapsheving</b> — 24–144 t (skjult for Hurtig/Kveld/Mania/Ingen elting). Lengre tid = mer smak.',
        '<b>Romtemperatur</b> — 18–28 °C. Påvirker hvor raskt deigen hever, og dermed tidsplanen.',
        '<b>Gjærtype</b> — Tørrgjær eller Fersk gjær (1 g tørr = 3 g fersk).',
        '<b>Kjøkkenmaskin</b> — Ankarsrum, Annen maskin (eltekrok, mer friksjonsvarme) eller Manuell elting. Valget endrer eltetrinnene og teksten.',
        '<b>Ovntype</b> — Pizzaovn (430–450 °C) eller Vanlig ovn (maks 250 °C). Endrer steketrinnet.'
      ]},
      {t:'smart', x:'Endrer du melmengde, hydrering, kjøletid, temperatur, gjær eller ovn, regnes både <b>oppskrift</b> og <b>tidsplan</b> om automatisk — du ser effekten umiddelbart i statuslinja.'}
    ]
  },

  {
    icon: '⏰', title: 'Når vil du spise?',
    body: [
      {t:'p', x:'I steg 1 velger du hvordan tiden skal regnes:'},
      {t:'bullets', x:[
        '<b>🍕 Planlagt steketid</b> — sett dato og klokkeslett (standard 18:00). Appen regner <b>baklengs</b> og viser når du må starte.',
        '<b>▶ Jeg begynner nå</b> — deigen planlegges fra nå, og steketiden regnes ut framover og vises i statuslinja.'
      ]},
      {t:'tip', x:'Lange metoder (Langtidsdeig, Poolish, Biga, Mania) forutsetter en planlagt steketid. «Jeg begynner nå» er mest nyttig for <b>Hurtigdeig</b> og <b>Kveldsdeig</b>.'}
    ]
  },

  {
    icon: '📅', title: 'Tidsplanen',
    body: [
      {t:'p', x:'Dette er planen du faktisk jobber etter. Ovenfra og ned:'},
      {t:'bullets', x:[
        '<b>Statuslinje</b>: pizzatype · metode, <b>🚀 Oppstart</b> og <b>🍕 Steketid</b>. Justerer du kjøle-/hevetid, blinker en liten «X t tidligere»-chip.',
        '<b>Verktøylinje</b>: <b>⚙️ Juster</b>, <b>📋 Understeg</b> og <b>💡 Tips</b> (se neste seksjon).',
        '<b>Handlinger</b>: <b>📋 Kopier</b>, <b>📅 Kalender</b> og <b>💾 Lagre</b> (blir «Oppdater» når du redigerer en lagret deig).',
        '<b>Stegene</b>, gruppert per dag. Hvert steg har avkryssing, tid + varighet, sted (❄️ kjøleskap, 🏠 rom, 🔥 ovn, 🔧 benk) og «trenger du»-chips med mengder.'
      ]},
      {t:'sub', x:'Haking og markører'},
      {t:'bullets', x:[
        'Trykk på et steg for å hake det av (✓). Trykk igjen for å angre.',
        '<b>👉 neste</b> viser hvilket steg som står for tur.',
        '<b>⚠️ ikke avhaket</b> dukker opp hvis tiden for et steg har passert uten at du haket det av.',
        '<b>⚠ utenfor spisetid</b> / <b>⚠ midt på natten</b> er et nedtonet merke hvis et steg havner på et upraktisk tidspunkt — mer om det i «Sjekk & varsler».'
      ]},
      {t:'smart', x:'Avhakingen lagres sammen med deigen, så du kan legge fra deg telefonen midt i en flere-dagers heving og fortsette der du slapp — også på en annen enhet.'}
    ]
  },

  {
    icon: '🧩', title: 'Understeg, Tips og Juster',
    body: [
      {t:'p', x:'De tre bryterne i Tidsplan-verktøylinja gjør planen mer eller mindre detaljert — helt etter behov.'},
      {t:'bullets', x:[
        '<b>📋 Understeg</b> — deler hvert steg opp i nummererte deloppgaver du haker av én etter én. Fint når du står midt i det på kjøkkenet. (Passive steg som venting får understeg uten avhaking.)',
        '<b>💡 Tips</b> — viser en <b>«Hvorfor:»</b>- og en <b>«Tips:»</b>-boks på hvert steg, så du skjønner hensikten, ikke bare handlingen.',
        '<b>⚙️ Juster</b> — åpner Finjuster med de levende glidebryterne, uten at du mister planen.'
      ]},
      {t:'smart', x:'Understeg og Tips endrer bare hvor mye du får se — selve planen og tidene er de samme. Slå dem av igjen, og alt er som før.'}
    ]
  },

  {
    icon: '✅', title: 'Sjekk & varsler',
    body: [
      {t:'p', x:'Kvalitetssjekken i steg 3 stiller to spørsmål: <b>går planen opp i livet ditt</b>, og <b>blir deigen god</b>. Den fanger tidskollisjoner, mel som ikke passer gjæringstiden, overgjæring og varmt kjøkken. Er alt i orden: <b>«✓ Planen holder»</b>. Ellers: <b>«Én ting å se på»</b> / <b>«[N] ting å se på»</b> med kort du kan handle på.'},
      {t:'sub', x:'Tidskonflikt — to steder, med vilje'},
      {t:'bullets', x:[
        'I <b>veiviserens Sjekk</b> får du det <b>fulle varselet</b>: «Et steg havner i [natten / tid du ikke har satt av til pizza]», med forklaring og knapper.',
        'I <b>Tidsplan</b> er det samme nedtonet til et lite <b>⚠ utenfor spisetid</b>-merke på steget. På mobil tar et trykk på merket deg rett til å redigere pizzatiden.'
      ]},
      {t:'smart', x:'Varselet tilbyr bare knapper som faktisk flytter <b>det</b> steget som kolliderer. Er steget låst til steketidspunktet, foreslår appen heller <b>«Spis [tid] i stedet»</b> (minste forskyvning som får hele planen til å gå opp) eller en kortere metode — i stedet for knapper som ikke virker.'},
      {t:'bullets', x:[
        '<b>Rediger pizzatiden din</b> — endrer den ledige tiden din (se Beta → «Når er du ledig?»).',
        '<b>Juster hevetid / Juster kjøleskapstid / 🔍 Finn beste kombinasjon</b> — flytter steget via riktig spak.',
        '<b>Dette er greit — fortsett likevel</b> — godtar konflikten. Varselet blir da en nøytral «✓ Du har godtatt …» med <b>Angre</b>, og teller ikke lenger som et problem — men blir stående, så sjekken aldri lyver om at alt er perfekt.',
        '<b>⏰ Oppstarten har allerede passert</b> — dukker opp hvis starttiden er forbi; tilbyr det tidligste realistiske tidspunktet.'
      ]},
      {t:'smart', x:'Bruker du <b>Poolish</b> og tiden er vanskelig å få til å gå opp, dukker det opp en <b>🧊 Sett inn kjøleskapspause</b>-knapp. Den lar den ferdige poolishen «vente» kaldt (opptil 18t) og skyver resten av planen inn i den ledige tiden din — <b>uten å endre når du spiser</b>. Du kan også slå den av/på selv under Metode → «Poolish kjøleskapspause», og Beta-søket kjenner den også.'},
      {t:'tip', x:'Sender et varsel deg til en annen fane, får du en <b>«← Tilbake»</b>-linje nederst som også sier fra live når konflikten er løst.'}
    ]
  },

  {
    icon: '🕰️', title: 'De sju metodene',
    body: [
      {t:'p', x:'Kort om hva hver metode er og når den passer:'},
      {t:'bullets', x:[
        '<b>Langtidsdeig</b> — direkte deig med kald heving i 1–flere døgn. Enklest å planlegge, mest kontroll på smaksdybden. Trygt førstevalg.',
        '<b>Poolish</b> — løs fordeig (12–16 t) for kompleks smak. Har en <b>❄️ Kjøleskap</b>-variant som gir langt friere tidspunkt, og en valgfri <b>🧊 Poolish kjøleskapspause</b> (se «Sjekk & varsler») for å få tiden til å gå opp.',
        '<b>Biga</b> — fast, tørr fordeig (16–24 t). Nøtteaktig smak og seigere struktur. Lages alltid for hånd.',
        '<b>Hurtigdeig</b> — samme dag, ingen lang kjøletid; mer gjær kompenserer for tiden. Starter med en <b>gjær-kickstart</b> (gjæren vekkes i litt lunkent vann med honning før melet).',
        '<b>Kveldsdeig</b> — kortere kjøletid (5–24 timer, ikke dager). Elt i kveld, stek i morgen. Mer smak enn Hurtigdeig.',
        '<b>Ingen elting</b> — ingen elting, ingen maskin. Rør med skje, la stå natten over.',
        '<b>Mania-poolish</b> — to-trinns oppskrift med fast fasit (64 % hydrering), ingen justerbare variabler.'
      ]},
      {t:'smart', x:'Usikker på hvilken? La <b>🧭 Beta: Finn oppskrift</b> velge for deg ut fra når du er ledig og når du vil spise.'}
    ]
  },

  {
    icon: '🍕', title: 'Oppskrift-fanen',
    body: [
      {t:'p', x:'Viser ingredienslista for oppsettet ditt: mel, vann, salt, eventuell olje/smør/sukker og gjær, pluss metode-spesifikke rader (kjøleskapsheving, romtemperatur, ovntype) og antall/emnestørrelse. For de fleste metoder følger en kort Ankarsrum-oppsummering med. Mania-poolish vises som en todelt liste (poolish + hoveddeig).'},
      {t:'tip', x:'Oppskriften dukker opp så snart du har generert en tidsplan.'}
    ]
  },

  {
    icon: '🍽️', title: 'Lagre & hente deiger',
    body: [
      {t:'p', x:'Trykk <b>💾 Lagre</b> i Tidsplan for å ta vare på en deig. Den lagres <b>delt</b>, så du (og andre) kan hente den fram igjen — også på en annen enhet. Redigerer du en lagret deig, blir knappen <b>Oppdater</b>.'},
      {t:'bullets', x:[
        '<b>🍽️ Deiger</b>-fanen er delt i <b>Aktive</b> og <b>Ferdige</b>.',
        '<b>Åpne</b> laster deigen inn igjen og hopper til Tidsplan. <b>Ferdig</b> åpner stjernevurderingen.',
        '<b>★</b>-stjerna gjør en deig til favoritt (nås også fra ☰ Meny → «★ Min favoritt»).',
        'Lagret sammen med deigen: hele oppsettet, tidspunkt, avhakede steg, understeg og ingredienser, og hvem som lagret.'
      ]},
      {t:'sub', x:'«🍕 Hvordan ble den?»'},
      {t:'p', x:'Når du markerer en deig som ferdig, kan du gi den <b>stjerner (★)</b>, legge til et <b>📷 bilde</b> og et notat. Slik bygger du en liten historikk over hva som funket — perfekt til å gjenta suksessene.'}
    ]
  },

  {
    icon: '📝', title: 'Notater',
    body: [
      {t:'p', x:'Skriv ned hvordan det gikk — smak, heving, justeringer til neste gang. Notatet lagres sammen med deigen og er synlig for alle som åpner den, uansett enhet.'},
      {t:'tip', x:'Notater krever en aktiv deig: lagre en fra Tidsplan, eller åpne en fra <b>🍽️ Deiger</b> først.'}
    ]
  },

  {
    icon: '📤', title: 'Kopier & Kalender',
    body: [
      {t:'bullets', x:[
        '<b>📋 Kopier</b> — kopierer hele planen som ren tekst (ingredienser + nummerert tidslinje med tider og forklaringer). Teksten starter med en kort sjekk-instruksjon og appversjon + tidspunkt — praktisk hvis du vil få oppskriften kvalitetssjekket. Fin å lime inn i en melding eller et notat.',
        '<b>📅 Kalender / Påminnelser</b> — laster ned en kalenderfil (.ics) med ett innslag per steg, hver med <b>påminnelse 10 minutter før</b>. Da varsler telefonen deg gjennom hele hevingen.'
      ]}
    ]
  },

  {
    icon: '🧭', title: 'Beta: Finn oppskrift',
    body: [
      {t:'p', x:'Snu planleggingen på hodet: si <b>når du er ledig</b> og <b>når du vil spise</b>, så anbefaler appen en metode — søkt på tvers av alle metodene.'},
      {t:'steps', x:[
        'Åpne <b>«Når er du ledig?»</b> (trykk <b>Vis ▾</b>) og fyll inn de faste tidene du kan lage pizza. Trykk <b>Lagre ledig tid</b> — den lagres per bruker og synkes mellom enheter.',
        'Sett <b>steketidspunkt</b> (dato + klokkeslett), eller velg et av de populære tidspunktene.',
        'Trykk <b>🔍 Finn oppskrift</b>. Du får den beste anbefalingen med oppstartstid, steketid, hvor mange steg som eventuelt faller utenfor ledig tid, total gjæringstid og hvilke meltyper som passer.',
        'Trykk <b>Bruk denne</b> for å ta den i bruk, eller <b>«Se flere alternativer»</b> for de nest beste.'
      ]},
      {t:'smart', x:'Den ledige tiden du lagrer under <b>«Når er du ledig?»</b> er <b>samme kilde</b> som «utenfor spisetid»-varslene bruker ellers i appen. Retter du den ett sted, stemmer den overalt.'}
    ]
  },

  {
    icon: '📲', title: 'Legg appen på hjemskjermen',
    body: [
      {t:'p', x:'Du kan installere UltimatePizza som en app-ikon på telefonen, og bruke den offline. En liten linje <b>«📲 Legg appen til på hjemskjermen»</b> dukker opp når det er mulig.'},
      {t:'bullets', x:[
        '<b>Android</b> (Chrome): trykk <b>Legg til</b> → den ekte installasjonsdialogen kommer opp.',
        '<b>iPhone</b> (Safari): trykk <b>Legg til</b> → følg veiledningen: Del-ikonet nederst → «Legg til på Hjem-skjerm» → «Legg til».'
      ]},
      {t:'tip', x:'Lukker du linja, maser den ikke igjen. Når appen først er installert, virker den også uten nett — greit midt i en flere-dagers heving.'}
    ]
  },

  {
    icon: '🔧', title: 'Visning & mer',
    body: [
      {t:'bullets', x:[
        '<b>📤 Del appen</b> (Info → Del): del appen med andre. På mobil åpnes delingsmenyen (meldinger, e-post osv.); på PC kopieres lenken til utklippstavla. Praktisk når appen kjører installert og adressefeltet er skjult.',
        '<b>Skriftstørrelse</b> (Info → Visning): Normal / Stor / Ekstra stor.',
        '<b>Hva er nytt</b> (nederst i Info): endringsloggen med alt som er lagt til, versjon for versjon.',
        '<b>💬 Feedback</b> (Info): send inn ønsker og feil — det du sender knyttes til navnet ditt.',
        '<b>🖥 PC</b>-knappen øverst bytter til desktop-visning.'
      ]},
      {t:'tip', x:'Denne bruksanvisningen holdes oppdatert i takt med appen — kommer det nye funksjoner, oppdateres teksten her også.'}
    ]
  }

];

const GUIDE_INTRO_EN = 'UltimatePizza works <b>backwards</b>: you say when the pizza should be ready, and the app shows exactly when and how you need to work to hit that. This user manual walks through the entire mobile app — tap a topic in the list below to jump straight there.';

const GUIDE_EN = [

  {
    icon: '👋', title: 'Welcome',
    body: [
      {t:'p', x:'The app is built around one idea: <b>you decide the meal time, the app works out the rest</b> — when the dough should be mixed, rise, sit in the fridge and bake. You don\'t need to know anything about baker\'s math; choose pizza, method and time, and you get a finished schedule to follow step by step.'},
      {t:'sub', x:'The seven tabs at the bottom'},
      {t:'bullets', x:[
        '<b>⚙️ Planner</b> — the wizard where you set up the dough (pizza, method, time).',
        '<b>📅 Schedule</b> — the finished, time-driven plan you follow step by step.',
        '<b>🍕 Recipe</b> — the ingredient list with amounts.',
        '<b>📝 Notes</b> — your notes for a saved dough.',
        '<b>🍽️ Doughs</b> — saved doughs you (and others) can pull up again.',
        '<b>ℹ️ Info</b> — display, help, this user manual and "What\'s new".',
        '<b>🧭 Beta</b> — "Find recipe": enter your available time, get a recommended method back.'
      ]},
      {t:'smart', x:'You can move freely back and forth in the planning — <b>📅 Schedule</b> always shows the result of your current choices. Nothing is "locked" until you want it to be.'}
    ]
  },

  {
    icon: '🍕', title: 'Your first pizza',
    body: [
      {t:'p', x:'The fastest route from a blank screen to a finished plan:'},
      {t:'steps', x:[
        'Open <b>⚙️ Planner</b> and choose <b>pizza type</b> (e.g. Neapolitan) and <b>count</b>.',
        'Choose <b>when you want to eat</b> — "🍕 Scheduled bake time" with date/time, or "▶ I\'m starting now".',
        'Tap <b>Next →</b> and choose a <b>method</b>. Unsure? <b>Long-ferment dough</b> is a safe first choice.',
        'Tap <b>Next →</b> to <b>"Will this work?"</b>. If everything is green, tap <b>See the schedule →</b>.',
        'In <b>📅 Schedule</b> you follow the steps top to bottom and check them off as you go.'
      ]},
      {t:'tip', x:'Just want to experiment? Set "▶ I\'m starting now" + <b>Quick dough</b>, and you\'ll have pizza in a few hours.'}
    ]
  },

  {
    icon: '⚙️', title: 'Planning: the wizard',
    body: [
      {t:'p', x:'Planner is a three-step wizard: <b>Pizza → Method → Check</b>. At the top you see the steps as dots.'},
      {t:'bullets', x:[
        'Move on with <b>Next →</b>, or jump freely by tapping the step dots — both ways.',
        'You can also <b>swipe</b> left/right to switch steps. (A swipe that starts on a slider or a date field doesn\'t count, so you won\'t change step by accident.)',
        'The <b>←</b> arrow at the top takes you one step back.'
      ]},
      {t:'sub', x:'Step 1 — "Which pizza?"'},
      {t:'bullets', x:[
        '<b>Pizza type</b>: Neapolitan (thin, airy), Sheet pan (soft), New York (foldable, with oil/sugar), Chicago (deep dish) or No-knead.',
        '<b>Number of pizzas</b> with −/+ (default 4). Sometimes the app suggests rounding up to a full sheet pan.',
        '<b>When do you want to eat?</b> — see the separate section "When do you want to eat?".'
      ]},
      {t:'sub', x:'Step 2 — "Which method?"'},
      {t:'bullets', x:[
        'Six method cards. If you\'ve set a bake time, each card shows whether it <b>fits well</b> (green) or <b>"won\'t make it — needs about X h"</b> (dimmed). Cards that won\'t make it are dimmed.',
        'A <b>"💡 Why [method]?"</b> box explains the chosen method. Some methods get their own choices here (e.g. Poolish\'s <b>🌡️ Room temperature / ❄️ Fridge</b> toggle, or duration for Quick/Evening/Biga).',
        '<b>Flour type</b> you pick from the dropdown list, with an info box below.'
      ]},
      {t:'smart', x:'The method cards are "honest": if a method won\'t reach your meal time, the app says so outright instead of letting you pick something that doesn\'t add up.'},
      {t:'sub', x:'Step 3 — "Will this work?" (Check)'},
      {t:'p', x:'Here you get the quality check (see the section "Check & alerts"). If everything is in order, it says <b>"✓ The plan works"</b>. From here: <b>See the schedule →</b>, or adjust the cold proof time with −/+.'}
    ]
  },

  {
    icon: '🎛️', title: 'The settings explained',
    body: [
      {t:'p', x:'Most of the fine-tuning lives in <b>Fine-tune</b> — the panel you open with <b>⚙️ Adjust</b> (from the status bar or the Schedule toolbar), or via the "⚙️ See in Fine-tune" links in the alerts. Everything is live sliders with −/+: the status bar updates immediately.'},
      {t:'bullets', x:[
        '<b>Flour amount</b> — 300–1500 g. Everything else (water, salt, yeast) is calculated from this.',
        '<b>Hydration</b> — 55–80 %, i.e. how much water relative to flour. A chip shows <b>very stiff / stiff / recommended / high / very high</b> for your pizza type.',
        '<b>Cold proof</b> — 24–144 h (hidden for Quick/Evening/Mania/No-knead). Longer time = more flavor.',
        '<b>Room temperature</b> — 18–28 °C. Affects how fast the dough rises, and thus the schedule.',
        '<b>Yeast type</b> — Dry yeast or Fresh yeast (1 g dry = 3 g fresh).',
        '<b>Stand mixer</b> — Ankarsrum, Other machine (dough hook, more friction heat) or Manual kneading. The choice changes the kneading steps and the text.',
        '<b>Oven type</b> — Pizza oven (430–450 °C) or Regular oven (max 250 °C). Changes the baking step.'
      ]},
      {t:'smart', x:'If you change flour amount, hydration, cold time, temperature, yeast or oven, both the <b>recipe</b> and the <b>schedule</b> are recalculated automatically — you see the effect immediately in the status bar.'}
    ]
  },

  {
    icon: '⏰', title: 'When do you want to eat?',
    body: [
      {t:'p', x:'In step 1 you choose how the time should be calculated:'},
      {t:'bullets', x:[
        '<b>🍕 Scheduled bake time</b> — set date and time (default 18:00). The app calculates <b>backwards</b> and shows when you need to start.',
        '<b>▶ I\'m starting now</b> — the dough is planned from now, and the bake time is calculated forward and shown in the status bar.'
      ]},
      {t:'tip', x:'Long methods (Long-ferment dough, Poolish, Biga, Mania) assume a scheduled bake time. "I\'m starting now" is most useful for <b>Quick dough</b> and <b>Evening dough</b>.'}
    ]
  },

  {
    icon: '📅', title: 'The schedule',
    body: [
      {t:'p', x:'This is the plan you actually work by. From top to bottom:'},
      {t:'bullets', x:[
        '<b>Status bar</b>: pizza type · method, <b>🚀 Start</b> and <b>🍕 Bake time</b>. If you adjust the cold/rise time, a little "X h earlier" chip flashes.',
        '<b>Toolbar</b>: <b>⚙️ Adjust</b>, <b>📋 Substeps</b> and <b>💡 Tips</b> (see the next section).',
        '<b>Actions</b>: <b>📋 Copy</b>, <b>📅 Calendar</b> and <b>💾 Save</b> (becomes "Update" when you edit a saved dough).',
        '<b>The steps</b>, grouped by day. Each step has a checkbox, time + duration, place (❄️ fridge, 🏠 room, 🔥 oven, 🔧 counter) and "you need" chips with amounts.'
      ]},
      {t:'sub', x:'Checking off and markers'},
      {t:'bullets', x:[
        'Tap a step to check it off (✓). Tap again to undo.',
        '<b>👉 next</b> shows which step is up next.',
        '<b>⚠️ not checked</b> appears if the time for a step has passed without you checking it off.',
        '<b>⚠ outside meal time</b> / <b>⚠ middle of the night</b> is a dimmed marker if a step lands at an impractical time — more on that in "Check & alerts".'
      ]},
      {t:'smart', x:'The check-offs are saved together with the dough, so you can put your phone down in the middle of a multi-day rise and pick up where you left off — on another device too.'}
    ]
  },

  {
    icon: '🧩', title: 'Substeps, Tips and Adjust',
    body: [
      {t:'p', x:'The three toggles in the Schedule toolbar make the plan more or less detailed — entirely as needed.'},
      {t:'bullets', x:[
        '<b>📋 Substeps</b> — breaks each step into numbered subtasks you check off one by one. Great when you\'re in the thick of it in the kitchen. (Passive steps like waiting get substeps without check-offs.)',
        '<b>💡 Tips</b> — shows a <b>"Why:"</b> and a <b>"Tip:"</b> box on each step, so you understand the purpose, not just the action.',
        '<b>⚙️ Adjust</b> — opens Fine-tune with the live sliders, without losing your plan.'
      ]},
      {t:'smart', x:'Substeps and Tips only change how much you get to see — the plan itself and the times are the same. Turn them off again, and everything is as before.'}
    ]
  },

  {
    icon: '✅', title: 'Check & alerts',
    body: [
      {t:'p', x:'The quality check in step 3 asks two questions: <b>does the plan fit into your life</b>, and <b>will the dough turn out well</b>. It catches time collisions, flour that doesn\'t suit the fermentation time, over-fermentation and a warm kitchen. If everything is in order: <b>"✓ The plan works"</b>. Otherwise: <b>"One thing to look at"</b> / <b>"[N] things to look at"</b> with cards you can act on.'},
      {t:'sub', x:'Time conflict — two places, on purpose'},
      {t:'bullets', x:[
        'In the <b>wizard\'s Check</b> you get the <b>full alert</b>: "A step lands in [the night / time you haven\'t set aside for pizza]", with an explanation and buttons.',
        'In <b>Schedule</b> the same thing is toned down to a small <b>⚠ outside meal time</b> marker on the step. On mobile, a tap on the marker takes you straight to editing the pizza time.'
      ]},
      {t:'smart', x:'The alert only offers buttons that actually move the conflicting step. If the step is locked to the bake time, the app instead suggests <b>"Eat at [time] instead"</b> (the smallest shift that makes the whole plan work) or a shorter method — instead of buttons that don\'t work.'},
      {t:'bullets', x:[
        '<b>Edit your pizza time</b> — changes your available time (see Beta → "When are you free?").',
        '<b>Adjust rise time / Adjust cold proof time / 🔍 Find the best combination</b> — moves the step via the right lever.',
        '<b>This is fine — continue anyway</b> — accepts the conflict. The alert then becomes a neutral "✓ You have accepted …" with <b>Undo</b>, and no longer counts as a problem — but stays visible, so the check never lies about everything being perfect.',
        '<b>⏰ The start has already passed</b> — appears if the start time is past; offers the earliest realistic time.'
      ]},
      {t:'smart', x:'If you\'re using <b>Poolish</b> and the timing is hard to make work, a <b>🧊 Insert cold pause</b> button appears. It lets the finished poolish "wait" cold (up to 18h) and pushes the rest of the plan into your available time — <b>without changing when you eat</b>. You can also toggle it on/off yourself under Method → "Poolish cold pause", and the Beta search knows about it too.'},
      {t:'tip', x:'If an alert sends you to another tab, you get a <b>"← Back"</b> line at the bottom that also tells you live when the conflict is resolved.'}
    ]
  },

  {
    icon: '🕰️', title: 'The seven methods',
    body: [
      {t:'p', x:'A quick note on what each method is and when to use it:'},
      {t:'bullets', x:[
        '<b>Long-ferment dough</b> — direct dough with a cold rise over one to several days. Easiest to plan, most control over flavor depth. Safe first choice.',
        '<b>Poolish</b> — a loose pre-ferment (12–16 h) for complex flavor. Has a <b>❄️ Fridge</b> variant that gives far freer timing, and an optional <b>🧊 Poolish cold pause</b> (see "Check & alerts") to make the timing add up.',
        '<b>Biga</b> — a stiff, dry pre-ferment (16–24 h). Nutty flavor and chewier structure. Always made by hand.',
        '<b>Quick dough</b> — same day, no long cold time; more yeast compensates for the time. Starts with a <b>yeast kickstart</b> (the yeast is woken in a little lukewarm water with honey before the flour).',
        '<b>Evening dough</b> — shorter cold time (5–24 hours, not days). Knead tonight, bake tomorrow. More flavor than Quick dough.',
        '<b>No-knead</b> — no kneading, no machine. Stir with a spoon, let it sit overnight.',
        '<b>Mania poolish</b> — a two-stage recipe with a fixed formula (64 % hydration), no adjustable variables.'
      ]},
      {t:'smart', x:'Not sure which? Let <b>🧭 Beta: Find recipe</b> choose for you based on when you\'re free and when you want to eat.'}
    ]
  },

  {
    icon: '🍕', title: 'The Recipe tab',
    body: [
      {t:'p', x:'Shows the ingredient list for your setup: flour, water, salt, any oil/butter/sugar and yeast, plus method-specific rows (cold proof, room temperature, oven type) and count/dough ball size. For most methods a short Ankarsrum summary follows. Mania poolish is shown as a two-part list (poolish + main dough).'},
      {t:'tip', x:'The recipe appears as soon as you\'ve generated a schedule.'}
    ]
  },

  {
    icon: '🍽️', title: 'Saving & loading doughs',
    body: [
      {t:'p', x:'Tap <b>💾 Save</b> in Schedule to keep a dough. It\'s saved to the shared list, so you (and others) can pull it up again — on another device too. If you edit a saved dough, the button becomes <b>Update</b>.'},
      {t:'bullets', x:[
        'The <b>🍽️ Doughs</b> tab is split into <b>Active</b> and <b>Finished</b>.',
        '<b>Open</b> loads the dough back in and jumps to Schedule. <b>Done</b> opens the star rating.',
        'The <b>★</b> star makes a dough a favorite (also reachable from ☰ Menu → "★ My favorite").',
        'Saved together with the dough: the whole setup, the time, checked-off steps and ingredients, and who saved it.'
      ]},
      {t:'sub', x:'"🍕 How did it turn out?"'},
      {t:'p', x:'When you mark a dough as finished, you can give it a <b>star rating (★)</b>, add a <b>📷 photo</b> and a note. That\'s how you build a little history of what worked — perfect for repeating your successes.'}
    ]
  },

  {
    icon: '📝', title: 'Notes',
    body: [
      {t:'p', x:'Write down how it went — flavor, rise, adjustments for next time. The note is saved together with the dough and is visible to everyone who opens it, on any device.'},
      {t:'tip', x:'Notes require an active dough: save one from Schedule, or open one from <b>🍽️ Doughs</b> first.'}
    ]
  },

  {
    icon: '📤', title: 'Copy & Calendar',
    body: [
      {t:'bullets', x:[
        '<b>📋 Copy</b> — copies the whole plan as plain text (ingredients + a numbered timeline with times and explanations). The text starts with a short check instruction and the app version + time — handy if you want the recipe quality-checked. Great to paste into a message or a note.',
        '<b>📅 Calendar / Reminders</b> — downloads a calendar file (.ics) with one entry per step, each with a <b>reminder 10 minutes before</b>. Then your phone alerts you through the entire rise.'
      ]}
    ]
  },

  {
    icon: '🧭', title: 'Beta: Find recipe',
    body: [
      {t:'p', x:'Turn planning on its head: say <b>when you\'re free</b> and <b>when you want to eat</b>, and the app recommends a method — searched across all the methods.'},
      {t:'steps', x:[
        'Open <b>"When are you free?"</b> (tap <b>Show ▾</b>) and fill in the regular times you can make pizza. Tap <b>Save available time</b> — it\'s saved per user and syncs between devices.',
        'Set the <b>bake time</b> (date + time), or pick one of the popular times.',
        'Tap <b>🔍 Find recipe</b>. You get the best recommendation with start time, bake time, how many steps (if any) fall outside your available time, total fermentation time and which flour types suit.',
        'Tap <b>Use this</b> to put it to use, or <b>"See more options"</b> for the next best ones.'
      ]},
      {t:'smart', x:'The available time you save under <b>"When are you free?"</b> is the <b>same source</b> that the "outside meal time" alerts use elsewhere in the app. Fix it in one place, and it\'s right everywhere.'}
    ]
  },

  {
    icon: '📲', title: 'Add the app to your home screen',
    body: [
      {t:'p', x:'You can install UltimatePizza as an app icon on your phone, and use it offline. A little line <b>"📲 Add the app to your home screen"</b> appears when it\'s possible.'},
      {t:'bullets', x:[
        '<b>Android</b> (Chrome): tap <b>Add</b> → the real installation dialog comes up.',
        '<b>iPhone</b> (Safari): tap <b>Add</b> → follow the guide: the Share icon at the bottom → "Add to Home Screen" → "Add".'
      ]},
      {t:'tip', x:'If you close the line, it won\'t nag again. Once the app is installed, it works without a connection too — handy in the middle of a multi-day rise.'}
    ]
  },

  {
    icon: '🔧', title: 'Display & more',
    body: [
      {t:'bullets', x:[
        '<b>📤 Share app</b> (Info → Share): share the app with others. On mobile the share menu opens (messages, email, etc.); on PC the link is copied to the clipboard. Handy when the app runs installed and the address bar is hidden.',
        '<b>Font size</b> (Info → Display): Normal / Large / Extra large.',
        '<b>What\'s new</b> (at the bottom of Info): the changelog with everything that\'s been added, version by version.',
        '<b>💬 Feedback</b> (Info): submit requests and bugs — what you send is tied to your name.',
        '<b>🖥 PC</b> button at the top switches to desktop view.'
      ]},
      {t:'tip', x:'This user manual is kept updated in step with the app — when new features arrive, the text here is updated too.'}
    ]
  }

];
