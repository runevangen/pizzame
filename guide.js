// Bruksanvisning for Pizzaplanlegger — ren data, ingen logikk. Lastes via <script src>
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

const GUIDE_INTRO = 'Pizzaplanlegger regner <b>baklengs</b>: du sier når pizzaen skal være ferdig, så viser appen nøyaktig når og hvordan du må jobbe for å treffe. Denne bruksanvisningen går gjennom hele mobilappen — trykk et emne i lista under for å hoppe rett dit.';

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
        'I <b>wizardens Sjekk</b> får du det <b>fulle varselet</b>: «Et steg havner i [natten / tid du ikke har satt av til pizza]», med forklaring og knapper.',
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
        '<b>Åpne</b> laster deigen inn igjen og hopper til Tidsplan. <b>Ferdig</b> åpner terningkast-vurderingen.',
        '<b>★</b>-stjerna gjør en deig til favoritt (nås også fra ☰ Meny → «★ Min favoritt»).',
        'Lagret sammen med deigen: hele oppsettet, tidspunkt, avhakede steg, understeg og ingredienser, og hvem som lagret.'
      ]},
      {t:'sub', x:'«🍕 Hvordan ble den?»'},
      {t:'p', x:'Når du markerer en deig som ferdig, kan du gi den <b>terningkast (★)</b>, legge til et <b>📷 bilde</b> og et notat. Slik bygger du en liten historikk over hva som funket — perfekt til å gjenta suksessene.'}
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
      {t:'p', x:'Du kan installere Pizzaplanlegger som en app-ikon på telefonen, og bruke den offline. En liten linje <b>«📲 Legg appen til på hjemskjermen»</b> dukker opp når det er mulig.'},
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
