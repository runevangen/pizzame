// MCP-server for pizzamotoren, FJERN-utgave (v0.856) — HTTP-transport.
//
// Samme fire verktøy som den lokale stdio-serveren (mcp_server.mjs): alt
// innhold bor i det delte mcp_verktoy.mjs. Denne funksjonen er bare
// transporten: MCP «Streamable HTTP» i sin enkleste, tilstandsløse form —
// én JSON-RPC-melding per POST, ett JSON-svar tilbake (ingen SSE-strøm,
// ingen sesjoner; GET svarer 405 slik spesifikasjonen tillater).
//
// Legges til i Claude (mobil/web/desktop) som Custom Connector:
//   Innstillinger → Connectors → Add custom connector → /api/mcp-URL-en.
//
// Poenget med å bo i SAMME repo og deploy som appen: engine.js/steps.js
// leses fra deployen (included_files i netlify.toml), så en endring i
// motoren og MCP-svarene går alltid i takt — automatisk, uten egen utrulling.
// Melregisteret hentes fra deployens egen /api/flours (process.env.URL).
//
// Ingen autentisering: verktøyene er rene regnestykker uten skrivetilgang,
// som resten av appens offentlige lese-API-er.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lagMcpHandterer } from '../../mcp_verktoy.mjs';

// Settes FØR første Date-bruk: anker som "2026-11-07T18:00" skal tolkes i
// norsk tid også når lambdaen kjører i UTC.
process.env.TZ = 'Europe/Oslo';

// engine.js/steps.js følger med deployen via included_files, men hvor de
// havner relativt til funksjonen varierer med bundler/kjøremiljø — prøv de
// kjente stedene og si ærlig fra hvis ingen treffer.
function lesKilde(navn) {
  const kandidater = [
    join(process.cwd(), navn),
    new URL('../../' + navn, import.meta.url).pathname,
    new URL('./' + navn, import.meta.url).pathname,
    '/var/task/' + navn,
  ];
  for (const sti of kandidater) {
    try { if (existsSync(sti)) return readFileSync(sti, 'utf8'); } catch (e) { /* prøv neste */ }
  }
  throw new Error(`fant ikke ${navn} i deployen (prøvde: ${kandidater.join(', ')})`);
}

const { handter, lagIcs } = lagMcpHandterer({
  engineSrc: lesKilde('engine.js'),
  stepsSrc: lesKilde('steps.js'),
  // PIZZAME_API lar tester peke på stubber; ellers deployens egen URL.
  apiBase: process.env.PIZZAME_API || process.env.URL || 'https://ultimatepizza.netlify.app',
  // Versjonen eies av changelog.js (toppinnslaget) — samme deploy, samme tall.
  versjon: (lesKilde('changelog.js').match(/"v":\s*"([\d.]+)"/) || [])[1],
});

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export default async (req) => {
  // /api/kalender (v0.859): planen som .ics-fil — lenken lag_plan-svarene
  // bærer. GET med samme felter som lag_plan; mobilen åpner kalenderimport.
  const sti = new URL(req.url).pathname;
  if (sti === '/api/kalender') {
    if (req.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    const args = Object.fromEntries(new URL(req.url).searchParams);
    if (args.poolishCold !== undefined) args.poolishCold = args.poolishCold === 'true';
    try {
      const ics = await lagIcs(args);
      return new Response(ics, { status: 200, headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pizzaplan.ics"',
      } });
    } catch (e) {
      return new Response('Feil: ' + e.message, { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  }
  if (req.method !== 'POST') {
    // Streamable HTTP: en server uten SSE-strøm svarer 405 på GET.
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  let melding;
  try { melding = await req.json(); }
  catch (e) { return json(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  try {
    const svar = await handter(melding);
    if (!svar) return new Response(null, { status: 202 }); // varsel — intet svar
    return json(200, svar);
  } catch (e) {
    return json(500, { jsonrpc: '2.0', id: (melding && melding.id) ?? null, error: { code: -32603, message: e.message } });
  }
};

export const config = { path: ['/api/mcp', '/api/kalender'] };
