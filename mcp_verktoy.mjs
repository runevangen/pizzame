// mcp_verktoy.mjs — det delte MCP-verktøylaget (v0.856, flyttet ut fra
// mcp_server.mjs). Begge transportene bruker dette:
//   mcp_server.mjs            — lokal stdio-server (Claude Code / Desktop på PC)
//   netlify/functions/mcp.js  — fjern-server over HTTP (Connector: mobil/web)
// Verktøydefinisjonene bor dermed ETT sted — samme prinsipp som gjorde at
// motoren aldri kan drifte fra appen: fjernutgaven leser engine.js/steps.js
// fra samme deploy som appen selv, og lokalutgaven fra samme klon.
//
// Laget bygges av engine.js + steps.js gjennom samme søm som test_steg.mjs
// (v0.836): null egen deiglogikk, null avhengigheter.

// Baseline og appen regner i norsk tidssone; verten setter TZ før Date brukes.
export const MCP_NAVN = 'pizzame-motor';
// Versjonen EIES av changelog.js (toppinnslaget) — vertene leser den derfra
// og sender den inn (v0.860). Serveren og appen er samme deploy, så de skal
// rapportere samme tall; en egen kopi her drev fra virkeligheten på tre dager.

const METODER = ['standard', 'poolish', 'biga', 'mania', 'hurtig', 'kveld'];
const TYPER = ['napoletana', 'newyork', 'langpanne', 'chicago', 'ingenelting'];

// Feltene en klient får lov å overstyre, med DEF som fasit for resten.
// Tall tvinges til Number (pgrp-lærdommen fra v0.802: strenger i tallfelt
// korrumperer regnestykkene stille).
const TALLFELT = ['mel', 'hydro', 'temp', 'cold', 'poolishH', 'bigaH', 'hurtigH', 'kveldH', 'fridgeC', 'sammaltPct'];
const VALGFELT = { meltype: null, oven: ['vanlig', 'pizza'], gjaer: ['torr', 'fersk'], sammaltType: null };

// Bygg en komplett, selvstendig MCP-håndterer. `handter(melding)` tar én
// JSON-RPC-melding og returnerer svaret (eller null for varsler) — transporten
// rundt (stdio-linjer eller HTTP) er vertens jobb.
export function lagMcpHandterer({ engineSrc, stepsSrc, apiBase, versjon }) {
  // ===== Motorlaget — verbatim samme søm som test_steg.mjs =====
  const vindu = { _lang: 'no', _openSub: new Set(), _openTip: new Set(), _openIng: new Set() };
  const S = {};
  const lag = new Function('window', 'S',
    engineSrc + '\n' + stepsSrc + `
    ;return { rawSteps, hurtigSteps, kveldSteps, stepsForAnchor, maniaRecipe, R, DEF,
              recipeFor, preheatMin, stepLoc, smartKandidater, mN, byggIcs, L,
              validerFlours, melSomTaaler, totalFermentHours,
              lesMelregister: () => MELTYPER,
              settMelregister: (valide) => { MELTYPER = byggMelregister(valide); } };
  `)(vindu, S);

  // ===== Det levende melregisteret (v0.854) =====
  // Hentes fra appens /api/flours ved FØRSTE verktøykall som leser mel — lat
  // og memoisert, så serveren starter øyeblikkelig og fungerer uten nett
  // (seed-en er fasiten da, akkurat som i appen når backend ikke svarer).
  // Valideres av samme validerFlours som applyFlours i index.html bruker.
  // I fjernutgaven peker apiBase på deployens egen URL — samme hus.
  let _melkildePromise = null;
  function hentMelregister() {
    if (!_melkildePromise) {
      _melkildePromise = (async () => {
        try {
          const ctl = new AbortController();
          const tid = setTimeout(() => ctl.abort(), 3000);
          const res = await fetch(apiBase + '/api/flours', { signal: ctl.signal });
          clearTimeout(tid);
          if (res.ok) {
            const data = await res.json();
            const valid = lag.validerFlours(data && data.flours);
            if (valid) { lag.settMelregister(valid); return 'server'; }
          }
        } catch (e) { /* uten nett / feil: innebygd seed er fasiten */ }
        return 'innebygd';
      })();
    }
    return _melkildePromise;
  }

  function settScenario(args) {
    const metode = String(args.metode || 'standard');
    if (!METODER.includes(metode)) throw new Error(`ukjent metode «${metode}» — gyldige: ${METODER.join(', ')}`);
    const type = String(args.type || 'napoletana');
    if (!TYPER.includes(type)) throw new Error(`ukjent type «${type}» — gyldige: ${TYPER.join(', ')}`);
    vindu._lang = args.lang === 'en' ? 'en' : 'no';
    for (const k of Object.keys(S)) delete S[k];
    Object.assign(S, lag.DEF, { method: metode, type });
    for (const f of TALLFELT) {
      if (args[f] === undefined) continue;
      const n = Number(args[f]);
      if (!Number.isFinite(n)) throw new Error(`feltet «${f}» må være et tall, fikk ${JSON.stringify(args[f])}`);
      S[f] = n;
    }
    for (const [f, gyldige] of Object.entries(VALGFELT)) {
      if (args[f] === undefined) continue;
      if (gyldige && !gyldige.includes(args[f])) throw new Error(`feltet «${f}» må være en av: ${gyldige.join(', ')}`);
      S[f] = args[f];
    }
    if (args.poolishCold !== undefined) S.poolishCold = !!args.poolishCold;
    return { metode, type };
  }

  function oppskrift(metode) {
    return metode === 'mania' ? lag.maniaRecipe() : lag.recipeFor();
  }

  function fmtTid(ms) {
    return new Date(ms).toLocaleString(vindu._lang === 'en' ? 'en-GB' : 'no-NO',
      { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' });
  }

  function lesTid(verdi, felt) {
    const d = new Date(String(verdi));
    if (isNaN(d)) throw new Error(`ugyldig ${felt} ${JSON.stringify(verdi)} — bruk ISO-format, f.eks. "2026-11-07T18:00"`);
    return d;
  }

  // Kalenderlenken en plan bærer (v0.859) — delt mellom lag_plan og
  // juster_underveis, så begge peker på /api/kalender med samme feltnavn.
  const KALENDERFELT = ['metode', 'type', 'tidspunkt', 'anker', 'mel', 'hydro', 'temp', 'cold',
                        'poolishH', 'poolishCold', 'bigaH', 'hurtigH', 'kveldH', 'oven', 'lang'];
  function kalenderLenke(args) {
    const q = new URLSearchParams();
    for (const f of KALENDERFELT) if (args[f] !== undefined) q.set(f, String(args[f]));
    return apiBase + '/api/kalender?' + q.toString();
  }

  // ===== Verktøyene =====
  const VERKTOY = [
    {
      name: 'lag_plan',
      description:
        'Komplett pizzaplan fra pizzame-motoren: oppskrift (gram mel/vann/salt/gjær) og tidsplan ' +
        'med klokkeslett for hvert steg (blanding, hevinger, utbaking, steking). ' +
        'Angi tidspunktet pizzaen skal være FERDIG (anker="ferdig", standard) eller når du vil STARTE ' +
        '(anker="start"). Tall kommer fra selve motoren i appen — ikke gjett deigmengder selv.',
      inputSchema: {
        type: 'object',
        properties: {
          metode: { type: 'string', enum: METODER, description: 'Deigmetode. standard=langtidsdeig (kald heving i dager), poolish/biga=fordeig, mania=Mania-poolish, hurtig=samme dag (3–8 t), kveld=kveld-til-neste-dag.' },
          type: { type: 'string', enum: TYPER, description: 'Pizzatype. Standard: napoletana.' },
          tidspunkt: { type: 'string', description: 'Lokalt tidspunkt (Europe/Oslo), ISO-format, f.eks. "2026-11-07T18:00".' },
          anker: { type: 'string', enum: ['ferdig', 'start'], description: 'Hva tidspunktet betyr: "ferdig" (standard) = pizzaen skal være klar da; "start" = du begynner da.' },
          mel: { type: 'number', description: 'Gram mel totalt. Standard 500 (≈3–4 pizzaer napoletana).' },
          hydro: { type: 'number', description: 'Hydrering i % (vann/mel). Standard 65.' },
          temp: { type: 'number', description: 'Romtemperatur i °C. Standard 22.' },
          cold: { type: 'number', description: 'Kald heving i timer (standard/poolish/biga). Standard 24.' },
          poolishH: { type: 'number', description: 'Poolish-modningstid i timer. Standard 14.' },
          poolishCold: { type: 'boolean', description: 'Poolish i kjøleskap i stedet for romtemperatur.' },
          bigaH: { type: 'number', description: 'Biga-modningstid i timer. Standard 18.' },
          hurtigH: { type: 'number', description: 'Total tid for hurtigdeig i timer. Standard 5.' },
          kveldH: { type: 'number', description: 'Kald natt-tid for kveldsdeig i timer. Standard 10.' },
          oven: { type: 'string', enum: ['vanlig', 'pizza'], description: 'Ovn: vanlig stekeovn eller pizzaovn. Standard pizza.' },
          lang: { type: 'string', enum: ['no', 'en'], description: 'Språk på stegtekstene. Standard no.' },
        },
        required: ['metode', 'tidspunkt'],
      },
      kjor(args) {
        const { metode } = settScenario(args);
        S.mode = args.anker === 'start' ? 'start' : 'end';
        const nar = lesTid(args.tidspunkt, 'tidspunkt');
        const steg = lag.stepsForAnchor(nar);
        // v0.859: hver plan bærer sin kalenderlenke — /api/kalender regner
        // NØYAKTIG samme plan på serveren (samme felter) og svarer med en
        // .ics-fil: ett trykk på mobilen gir varsler per steg via kalenderen.
        return {
          oppskrift: oppskrift(metode),
          kalender_url: kalenderLenke(args),
          forvarmingMin: lag.preheatMin(),
          steg: steg.map((s, i) => ({
            tid: fmtTid(s.at),
            tid_iso: new Date(s.at).toISOString(),
            tittel: s.title,
            beskrivelse: s.desc,
            trenger: s.needs || [],
            sted: lag.stepLoc(s),
            passiv: !!s.passive,
            minTilNeste: steg[i + 1] ? Math.round((steg[i + 1].at - s.at) / 60000) : 0,
          })),
        };
      },
    },
    {
      name: 'mengder',
      description:
        'Bare kjernetallene fra pizzame-motoren: gram mel, vann, salt, olje, sukker og gjær (tørr/fersk) ' +
        'for en gitt pizzatype og metode — uten tidsplan. Bruk lag_plan når tidspunkt er kjent.',
      inputSchema: {
        type: 'object',
        properties: {
          metode: { type: 'string', enum: METODER, description: 'Deigmetode (påvirker gjærmengden og evt. fordeig).' },
          type: { type: 'string', enum: TYPER, description: 'Pizzatype. Standard: napoletana.' },
          mel: { type: 'number', description: 'Gram mel totalt. Standard 500.' },
          hydro: { type: 'number', description: 'Hydrering i %. Standard 65.' },
          hurtigH: { type: 'number', description: 'For metode=hurtig: total tid i timer.' },
          lang: { type: 'string', enum: ['no', 'en'] },
        },
        required: ['metode'],
      },
      kjor(args) {
        const { metode } = settScenario(args);
        return oppskrift(metode);
      },
    },
    {
      name: 'metoder_som_rekker',
      description:
        'Hvilke deigmetoder rekker du til et gitt ferdigtidspunkt? Kjører Smart-plan-sveipet fra ' +
        'pizzame-motoren (samme kandidater som appens Smart-plan-fane): for hver metode får du om den ' +
        'rekker, seneste mulige start, og den beste gjennomførbare varianten (lengst gjæring = mest smak). ' +
        'Bruk lag_plan etterpå med oppsett-feltene fra svaret for full tidsplan.',
      inputSchema: {
        type: 'object',
        properties: {
          tidspunkt: { type: 'string', description: 'Når pizzaen skal være ferdig. Lokalt tidspunkt (Europe/Oslo), ISO-format, f.eks. "2026-11-07T18:00".' },
          type: { type: 'string', enum: TYPER, description: 'Pizzatype. Standard: napoletana.' },
          mel: { type: 'number', description: 'Gram mel totalt. Standard 500.' },
          hydro: { type: 'number', description: 'Hydrering i %. Standard 65.' },
          temp: { type: 'number', description: 'Romtemperatur i °C. Standard 22.' },
          oven: { type: 'string', enum: ['vanlig', 'pizza'], description: 'Ovn. Standard pizza.' },
          naa: { type: 'string', description: 'Hva som regnes som «nå» (ISO). Standard: faktisk klokkeslett. Sett den for å planlegge fram i tid.' },
          lang: { type: 'string', enum: ['no', 'en'] },
        },
        required: ['tidspunkt'],
      },
      async kjor(args) {
        settScenario({ ...args, metode: 'standard' }); // sveipet varierer metoden selv
        const anker = lesTid(args.tidspunkt, 'tidspunkt');
        const naa = args.naa !== undefined ? lesTid(args.naa, 'naa').getTime() : Date.now();
        // Sveipets 120t-tak leses fra melregisteret — hent det levende først.
        const melkilde = await hentMelregister();
        const kand = lag.smartKandidater(anker);
        const metoder = METODER.map((m) => {
          const mine = kand.filter(c => c.snapshot.method === m);
          const mulige = mine.filter(c => new Date(c.startIso).getTime() >= naa);
          const ut = { metode: m, navn: lag.mN(m), rekker: mulige.length > 0 };
          if (mulige.length) {
            // Seneste start = mest slakk; beste = lengst gjæring (mest smak),
            // samme smaks-tiebreak som Smart-plan bruker blant like kandidater.
            const senest = mulige.reduce((a, b) => (a.startIso > b.startIso ? a : b));
            const beste = mulige.reduce((a, b) => (b.totalHrs > a.totalHrs ? b : a));
            ut.senesteStart = fmtTid(new Date(senest.startIso));
            ut.senesteStart_iso = senest.startIso;
            ut.beste = { variant: beste.label, start: fmtTid(new Date(beste.startIso)),
                         start_iso: beste.startIso, totalGjaeringTimer: beste.totalHrs, oppsett: beste.snapshot };
          } else if (mine.length) {
            // Ærlig når det ikke rekker: vis hva som var nærmest, så svaret kan
            // si «du skulle startet i går 14:00», ikke bare nei.
            const naermest = mine.reduce((a, b) => (a.startIso > b.startIso ? a : b));
            ut.maatteStartet = fmtTid(new Date(naermest.startIso));
            ut.maatteStartet_iso = naermest.startIso;
          }
          return ut;
        });
        return { ferdig: fmtTid(anker), ferdig_iso: anker.toISOString(), melkilde, metoder };
      },
    },
    {
      name: 'mel_som_passer',
      description:
        'Hvilke meltyper tåler deigen din? Regner total gjæringstid for oppsettet (metode + ' +
        'tidsinnstillinger) og sjekker hvert mel i registeret: gjæringsvindu og hydrering. ' +
        'Registeret hentes levende fra appen (fallback: innebygd liste — svaret sier hvilken).',
      inputSchema: {
        type: 'object',
        properties: {
          metode: { type: 'string', enum: METODER, description: 'Deigmetode.' },
          type: { type: 'string', enum: TYPER, description: 'Pizzatype. Standard: napoletana.' },
          hydro: { type: 'number', description: 'Hydrering i %. Standard 65 — sjekkes mot hvert mels anbefalte spenn.' },
          temp: { type: 'number', description: 'Romtemperatur i °C. Standard 22.' },
          cold: { type: 'number', description: 'Kald heving i timer (standard/poolish/biga). Standard 24.' },
          poolishH: { type: 'number', description: 'Poolish-modningstid i timer.' },
          poolishCold: { type: 'boolean', description: 'Poolish i kjøleskap.' },
          bigaH: { type: 'number', description: 'Biga-modningstid i timer.' },
          hurtigH: { type: 'number', description: 'For metode=hurtig: total tid i timer.' },
          kveldH: { type: 'number', description: 'For metode=kveld: kald natt-tid i timer.' },
          lang: { type: 'string', enum: ['no', 'en'] },
        },
        required: ['metode'],
      },
      async kjor(args) {
        settScenario(args);
        const melkilde = await hentMelregister();
        const timer = lag.totalFermentHours();
        // Motorens melSomTaaler er fasiten for hvem som tåler tiden — verktøyet
        // regner ikke sitt eget filter (v0.833-prinsippet).
        const taalerSett = new Set(lag.melSomTaaler(timer).map(m => m.v));
        const mel = lag.lesMelregister().filter(m => !m.generic).map(m => ({
          navn: m.t,
          taaler: taalerSett.has(m.v),
          gjaeringsvindu: `${m.ferm.mn}–${m.ferm.mx} t`,
          hydroPasser: S.hydro >= m.hydroRange.mn && S.hydro <= m.hydroRange.mx,
          hydrovindu: m.hydro,
          ...(m.estimated ? { anslaatt: true } : {}),
        }));
        // De som tåler gjæringstiden først; innenfor hver gruppe beholdes
        // registerets rekkefølge (svakest → sterkest mel).
        mel.sort((a, b) => (b.taaler ? 1 : 0) - (a.taaler ? 1 : 0));
        return { totalGjaeringTimer: timer, melkilde, mel };
      },
    },
    {
      name: 'juster_underveis',
      description:
        'Planen er i gang og tidspunktet flytter seg («gjestene er en time forsinket»). Oppgi det ' +
        'OPPRINNELIGE ferdigtidspunktet, oppsettet (samme felter som lag_plan) og forsinkelsen — ' +
        'verktøyet regner hele kjeden på nytt mot det nye tidspunktet og svarer med hva som er ' +
        'fullført, hvor forskyvningen lander, nye klokkeslett for gjenstående steg, og en ærlig ' +
        'advarsel hvis en fremskynding ikke rekker. Ny kalenderlenke følger med.',
      inputSchema: {
        type: 'object',
        properties: {
          metode: { type: 'string', enum: METODER, description: 'Deigmetode planen ble laget med.' },
          opprinnelig: { type: 'string', description: 'Planens opprinnelige FERDIG-tidspunkt (ISO, Europe/Oslo).' },
          forsinkelseMin: { type: 'number', description: 'Minutter senere (positiv) eller tidligere (negativ). Alternativ til nyttTidspunkt.' },
          nyttTidspunkt: { type: 'string', description: 'Nytt ferdigtidspunkt (ISO). Alternativ til forsinkelseMin.' },
          naa: { type: 'string', description: 'Hva som regnes som «nå» (ISO). Standard: faktisk klokkeslett.' },
          type: { type: 'string', enum: TYPER },
          mel: { type: 'number' }, hydro: { type: 'number' }, temp: { type: 'number' },
          cold: { type: 'number' }, poolishH: { type: 'number' }, poolishCold: { type: 'boolean' },
          bigaH: { type: 'number' }, hurtigH: { type: 'number' }, kveldH: { type: 'number' },
          oven: { type: 'string', enum: ['vanlig', 'pizza'] },
          lang: { type: 'string', enum: ['no', 'en'] },
        },
        required: ['metode', 'opprinnelig'],
      },
      kjor(args) {
        settScenario(args);
        S.mode = 'end';
        const foer = lesTid(args.opprinnelig, 'opprinnelig');
        if ((args.nyttTidspunkt === undefined) === (args.forsinkelseMin === undefined)) {
          throw new Error('oppgi nøyaktig én av nyttTidspunkt og forsinkelseMin');
        }
        if (args.forsinkelseMin !== undefined && !Number.isFinite(Number(args.forsinkelseMin))) {
          throw new Error('feltet «forsinkelseMin» må være et tall');
        }
        const etterTid = args.nyttTidspunkt !== undefined
          ? lesTid(args.nyttTidspunkt, 'nyttTidspunkt')
          : new Date(foer.getTime() + Number(args.forsinkelseMin) * 60000);
        const naa = args.naa !== undefined ? lesTid(args.naa, 'naa').getTime() : Date.now();
        const deltaMin = Math.round((etterTid - foer) / 60000);
        // Samme oppsett, to ankre: kjedene er like lange, så stegene parres på
        // indeks. Total gjæringstid er uendret — bare klokka flytter seg, og
        // det som allerede er gjort kan ikke flyttes: forskyvningen lander i
        // perioden du står i NÅ (typisk en hvile).
        const stegFoer = lag.stepsForAnchor(foer);
        const stegEtter = lag.stepsForAnchor(etterTid);
        const fullfort = [], gjenstaar = [];
        let rekker = true;
        stegFoer.forEach((s, i) => {
          const nyAt = stegEtter[i].at;
          if (s.at.getTime() <= naa) {
            fullfort.push({ tittel: s.title, tid: fmtTid(s.at) });
          } else {
            if (nyAt.getTime() < naa) rekker = false;
            gjenstaar.push({ tittel: s.title, foer: fmtTid(s.at), naa: fmtTid(nyAt),
                             naa_iso: new Date(nyAt).toISOString(), passiv: !!s.passive });
          }
        });
        // Rådet er stedsbasert (kjøleskap tåler strekk godt; romtemperatur er
        // mer sårbar) — uten å dikte nye tall.
        const sisteGjorte = stegFoer.filter(s => s.at.getTime() <= naa).slice(-1)[0] || null;
        const standerI = sisteGjorte
          ? { tittel: sisteGjorte.title, sted: lag.stepLoc(sisteGjorte), endringMin: deltaMin }
          : null;
        const raad = !rekker
          ? lag.L('Fremskyndingen rekker ikke — sammenlign naa_iso på første gjenstående steg med klokka.',
              'The move-up does not fit — compare naa_iso on the first remaining step with the clock.')
          : sisteGjorte && lag.stepLoc(sisteGjorte) === 'kjol'
          ? lag.L(`Forskyvningen (${deltaMin} min) tas i kjøleskapshvilen — det tåler deigen godt.`,
              `The shift (${deltaMin} min) lands in the fridge rest — the dough handles that well.`)
          : sisteGjorte && deltaMin > 0
          ? lag.L(`Forskyvningen (${deltaMin} min) strekker en hvile i romtemperatur — blir ventetiden lang, sett emnene kaldt i mellomtiden.`,
              `The shift (${deltaMin} min) stretches a room-temperature rest — if the wait gets long, move the dough to the fridge in the meantime.`)
          : lag.L(`Alle gjenstående steg flytter ${deltaMin} min.`, `All remaining steps move ${deltaMin} min.`);
        // Kalenderlenken peker på den NYE planen. /api/kalender tolker tider i
        // norsk tid, så det nye ankeret skrives som lokal ISO uten sone.
        const lokalIso = new Date(etterTid.getTime() - etterTid.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        return {
          opprinneligFerdig: fmtTid(foer), nyFerdig: fmtTid(etterTid),
          nyFerdig_iso: etterTid.toISOString(), forskyvningMin: deltaMin,
          rekker, raad, standerI, fullfort, gjenstaar,
          kalender_url: kalenderLenke({ ...args, tidspunkt: lokalIso, anker: 'ferdig' }),
        };
      },
    },
  ];

  // Verktøyene deler S, så kjøringen må være sekvensiell — køen serialiserer
  // kall som kommer inn mens et annet venter på nett (melregisteret).
  let _koen = Promise.resolve();
  function iKoen(fn) {
    const p = _koen.then(fn, fn);
    _koen = p.then(() => {}, () => {});
    return p;
  }

  // Én JSON-RPC-melding inn, ett svarobjekt ut (null for varsler, som ikke
  // skal besvares). Transporten rundt er vertens jobb.
  async function handter(melding) {
    const { id, method, params } = melding || {};
    if (method === 'initialize') {
      return { jsonrpc: '2.0', id, result: {
        protocolVersion: (params && params.protocolVersion) || '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: MCP_NAVN, version: versjon || '0' },
        // v0.857: tonen. instructions følger connectoren inn i hver samtale
        // som bruker den — dette er stedet å forme HVORDAN svarene legges
        // fram, uten å røre verktøyene eller tallene de regner.
        instructions:
          'Du er en vennlig og presis pizzacoach. Presenter verktøysvarene som dine egne råd, ' +
          'på naturlig språk — si aldri «motoren sier», «verktøyet returnerte» eller annen teknisk sjargong. ' +
          'Tidene, klokkeslettene og mengdene i svarene er fasit fra appens beregninger: gjengi dem nøyaktig, ' +
          'aldri rund av eller juster dem på egen hånd. Rekker ikke en metode fram i tid, si det ærlig ' +
          '(«da måtte du ha startet …») og pek på det beste alternativet som faktisk rekker. ' +
          'Når du har gitt en plan, tilby kalenderlenken (kalender_url i svaret): ett trykk legger ' +
          'hele planen i telefonens kalender med varsel før hvert aktive steg. ' +
          'La pizzaen farge stemningen, men språket forblir norsk: baker vi italiensk ' +
          '(napoletana), dryss inn noen italienske gloser for moro skyld (allora, la farina, il forno, ' +
          'cornicione — og en «mamma mia!» når planen går opp); baker vi amerikansk (New York eller ' +
          'Chicago deep dish), vær skikkelig amerikansk i gemyttet — entusiastisk, «alright!», ' +
          '«that\'s a proper pie» — fortsatt på norsk. Langpanne er trygt og hjemmekoselig norsk. ' +
          'Svar på brukerens språk; bruk lang="en" i verktøykallene når brukeren skriver engelsk.',
      } };
    }
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method && method.startsWith('notifications/')) return null;
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: {
        tools: VERKTOY.map(v => ({ name: v.name, description: v.description, inputSchema: v.inputSchema })),
      } };
    }
    if (method === 'tools/call') {
      const v = VERKTOY.find(x => x.name === (params && params.name));
      if (!v) return { jsonrpc: '2.0', id, error: { code: -32602, message: `ukjent verktøy «${params && params.name}»` } };
      return iKoen(async () => {
        try {
          const res = await v.kjor((params && params.arguments) || {});
          return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(res, null, 1) }] } };
        } catch (e) {
          return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Feil: ' + e.message }], isError: true } };
        }
      });
    }
    if (id !== undefined) return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
    return null;
  }

  // v0.859: ICS-utgaven av en plan — samme felter som lag_plan, samme kø
  // (deler S). Brukes av /api/kalender; kaster med forklaring ved ugyldige felt.
  function lagIcs(args) {
    return iKoen(() => {
      settScenario(args);
      S.mode = args.anker === 'start' ? 'start' : 'end';
      const nar = lesTid(args.tidspunkt, 'tidspunkt');
      return lag.byggIcs(lag.stepsForAnchor(nar));
    });
  }

  return { handter, lagIcs };
}
