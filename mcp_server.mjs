// MCP-server for pizzamotoren (v0.852) — motoren som samtaleflate.
//
// Dette er et nytt «hode» på NØYAKTIG samme søm som test_steg.mjs har brukt
// siden v0.836: engine.js + steps.js lastes i ett globalt scope med et lite
// window-stubb, og hele kjeden — oppskrift, stegplan med klokkeslett og
// ingrediensmengder — regnes uten nettleser. Serveren inneholder derfor NULL
// egen deiglogikk; alt den svarer kommer fra de samme funksjonene appen og
// testene bruker, og node-testlagene fryser atferden. Endrer motoren seg,
// endres svarene her i samme commit — det finnes ingen kopi som kan drifte.
//
// Protokoll: MCP over stdio (JSON-RPC 2.0, linjedelte meldinger). Ingen
// avhengigheter — i samme ånd som resten av repoet (ingen byggesteg).
//
// Bruk: `node mcp_server.mjs` fra en MCP-klient (Claude Code plukker den opp
// via .mcp.json i repo-rota). Verktøyene:
//   lag_plan — komplett tidsplan + oppskrift for et gitt tidspunkt
//   mengder  — bare kjernetallene (mel/vann/salt/gjær ...)
//
// Testes av test_mcp.mjs (Gruppe 0d i porten): samme frosne scenarier som
// steglaget, gjennom selve stdio-protokollen.

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

// Baseline og appen regner i norsk tidssone — serveren svarer i samme.
process.env.TZ = 'Europe/Oslo';

// ===== Bygg motorlaget — verbatim samme søm som test_steg.mjs =====
const engineSrc = readFileSync(new URL('./engine.js', import.meta.url), 'utf8');
const stepsSrc = readFileSync(new URL('./steps.js', import.meta.url), 'utf8');
globalThis.window = { _lang: 'no', _openSub: new Set(), _openTip: new Set(), _openIng: new Set() };
const S = {};
const lag = new Function('window', 'S',
  engineSrc + '\n' + stepsSrc + `
  ;return { rawSteps, hurtigSteps, kveldSteps, stepsForAnchor, maniaRecipe, R, DEF,
            recipeFor, preheatMin, stepLoc };
`)(globalThis.window, S);

const METODER = ['standard', 'poolish', 'biga', 'mania', 'hurtig', 'kveld'];
const TYPER = ['napoletana', 'newyork', 'langpanne', 'chicago', 'ingenelting'];

// Feltene en klient får lov å overstyre, med DEF som fasit for resten.
// Tall tvinges til Number (pgrp-lærdommen fra v0.802: strenger i tallfelt
// korrumperer regnestykkene stille).
const TALLFELT = ['mel', 'hydro', 'temp', 'cold', 'poolishH', 'bigaH', 'hurtigH', 'kveldH', 'fridgeC', 'sammaltPct'];
const VALGFELT = { meltype: null, oven: ['vanlig', 'pizza'], gjaer: ['torr', 'fersk'], sammaltType: null };

function settScenario(args) {
  const metode = String(args.metode || 'standard');
  if (!METODER.includes(metode)) throw new Error(`ukjent metode «${metode}» — gyldige: ${METODER.join(', ')}`);
  const type = String(args.type || 'napoletana');
  if (!TYPER.includes(type)) throw new Error(`ukjent type «${type}» — gyldige: ${TYPER.join(', ')}`);
  window._lang = args.lang === 'en' ? 'en' : 'no';
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
      const nar = new Date(String(args.tidspunkt));
      if (isNaN(nar)) throw new Error(`ugyldig tidspunkt ${JSON.stringify(args.tidspunkt)} — bruk ISO-format, f.eks. "2026-11-07T18:00"`);
      const steg = lag.stepsForAnchor(nar);
      const fmt = (ms) => new Date(ms).toLocaleString(window._lang === 'en' ? 'en-GB' : 'no-NO',
        { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return {
        oppskrift: oppskrift(metode),
        forvarmingMin: lag.preheatMin(),
        steg: steg.map((s, i) => ({
          tid: fmt(s.at),
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
];

// ===== JSON-RPC over stdio (linjedelte meldinger) =====
function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }

function handle(req) {
  const { id, method, params } = req;
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: {
      protocolVersion: (params && params.protocolVersion) || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'pizzame-motor', version: '0.852' },
    } });
  }
  if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
  if (method && method.startsWith('notifications/')) return; // ingen svar på varsler
  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: {
      tools: VERKTOY.map(v => ({ name: v.name, description: v.description, inputSchema: v.inputSchema })),
    } });
  }
  if (method === 'tools/call') {
    const v = VERKTOY.find(x => x.name === (params && params.name));
    if (!v) return send({ jsonrpc: '2.0', id, error: { code: -32602, message: `ukjent verktøy «${params && params.name}»` } });
    try {
      const res = v.kjor((params && params.arguments) || {});
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(res, null, 1) }] } });
    } catch (e) {
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Feil: ' + e.message }], isError: true } });
    }
  }
  if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
}

createInterface({ input: process.stdin }).on('line', (linje) => {
  if (!linje.trim()) return;
  let req;
  try { req = JSON.parse(linje); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  try { handle(req); }
  catch (e) { if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, error: { code: -32603, message: e.message } }); }
});
