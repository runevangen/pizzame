// MCP-server for pizzamotoren, LOKAL utgave (v0.852–v0.856) — stdio-transport.
//
// Alt innholdet — verktøyene, motorlaget, melregisteret — bor i det delte
// mcp_verktoy.mjs, som også driver fjernutgaven (netlify/functions/mcp.js,
// Connector for mobil/web). Denne fila er bare transporten: JSON-RPC 2.0
// over stdio, linjedelte meldinger. Ingen avhengigheter, ingen byggesteg.
//
// Bruk: `node mcp_server.mjs` fra en MCP-klient (Claude Code plukker den opp
// via .mcp.json i repo-rota; Claude Desktop via claude_desktop_config.json —
// se MCP.md). PIZZAME_API-miljøvariabelen overstyrer melregister-basen.
//
// Testes av test_mcp.mjs (Gruppe 0d i porten): de frosne scenariene gjennom
// selve stdio-protokollen.

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { lagMcpHandterer } from './mcp_verktoy.mjs';

// Baseline og appen regner i norsk tidssone — serveren tolker og svarer i samme.
process.env.TZ = 'Europe/Oslo';

const { handter } = lagMcpHandterer({
  engineSrc: readFileSync(new URL('./engine.js', import.meta.url), 'utf8'),
  stepsSrc: readFileSync(new URL('./steps.js', import.meta.url), 'utf8'),
  apiBase: process.env.PIZZAME_API || 'https://ultimatepizza.netlify.app',
});

function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }

createInterface({ input: process.stdin }).on('line', (linje) => {
  if (!linje.trim()) return;
  let req;
  try { req = JSON.parse(linje); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  handter(req).then(
    (svar) => { if (svar) send(svar); },
    (e) => { if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, error: { code: -32603, message: e.message } }); },
  );
});
