# Pizzamotoren som MCP-server

Motoren som samtaleflate: Claude (eller en annen MCP-klient) kan spørre selve
pizzamotoren. Verktøyene bor i én delt modul (`mcp_verktoy.mjs`) med to
transporter — begge laster `engine.js` + `steps.js` gjennom samme søm som
node-testlagene: null egen deiglogikk, så svarene kan aldri drifte fra appen.

- **Fjernutgave** — `netlify/functions/mcp.js`, servert på `/api/mcp` i samme
  deploy som appen. For mobil/web/desktop, uavhengig av egen PC.
- **Lokal utgave** — `mcp_server.mjs` over stdio. For utvikling på egen maskin.

Lesevennlig utgave av denne guiden: publisert som artifact
(«Pizzamotoren i Claude»); dette er kildeversjonen som bor hos koden.

## Enklest: Connector (mobil, nettleser og desktop)

Ingen installasjon, ingen PC som må stå på — endepunktet kjører hos Netlify:

1. Gå til **claude.ai → Innstillinger → Connectors → Add custom connector**.
2. Lim inn `https://ultimatepizza.netlify.app/api/mcp` og lagre.
3. Connectoren følger kontoen din — spør i vei fra mobilen.

Del gjerne URL-en: hvem som helst kan legge den til like enkelt. Endepunktet
er offentlig og uten autentisering — verktøyene er rene regnestykker uten
skrivetilgang, som appens øvrige lese-API-er.

## Også utenfor Claude: ChatGPT, Gemini og Grok

MCP er en åpen standard — samme URL virker i andre KI-er. Velg alltid
«ingen autentisering» der det spørres.

- **ChatGPT** (Plus/Pro/Team): slå først på Developer mode under
  Settings → Apps & Connectors → Advanced settings (ellers vises ikke
  verktøyene), deretter Settings → Apps & Connectors → Create → lim inn
  URL-en, autentisering None. Start en ny chat etterpå.
- **Gemini** (nettutgaven): Settings → Connected apps → Add a custom app →
  URL-en. **Gemini CLI**: i `~/.gemini/settings.json`:
  `{ "mcpServers": { "ultimatepizza": { "httpUrl": "https://ultimatepizza.netlify.app/api/mcp" } } }`
  — merk `httpUrl` (feltet for Streamable HTTP).
- **Grok** (betalte planer): grok.com/connectors → New Connector → Custom →
  URL-en.

Tone-instruksen (v0.857) sendes i MCP-håndtrykkets standardfelt; andre
klienter kan velge å ignorere den, så pizzacoach-stemmen er best i Claude.
Menyene i disse appene flytter på seg — stemmer ikke stegene, søk
«add custom MCP connector» for klienten.

## Lokal utgave (utvikling)

Krav: Node ≥ 18 og en klon av repoet. Ingen `npm install`, ingen byggesteg.

- **Claude Code:** `.mcp.json` i repo-rota gjør at serveren tilbys automatisk
  når du åpner repoet. Utenfor repoet:
  `claude mcp add pizzame-motor -- node /sti/til/pizzame/mcp_server.mjs`
- **Claude Desktop:** Innstillinger → Utvikler → `claude_desktop_config.json`:

  ```json
  {
    "mcpServers": {
      "pizzame-motor": { "command": "node", "args": ["/sti/til/pizzame/mcp_server.mjs"] }
    }
  }
  ```

- **Andre klienter:** standard MCP over stdio — pek på `node mcp_server.mjs`
  med repo-mappen som arbeidskatalog.

## Verktøyene

| Verktøy | Svarer på | Nøkkelfelter |
|---|---|---|
| `lag_plan` | Komplett oppskrift + tidsstemplet stegplan | `metode`, `tidspunkt`, `anker` (`ferdig`/`start`), `mel`, `hydro`, metode-timer |
| `metoder_som_rekker` | Hvilke metoder er gjennomførbare til et ferdigtidspunkt (Smart-plan-sveipet) | `tidspunkt`, valgfri `naa` for deterministisk «nå» |
| `mel_som_passer` | Hvilke mel tåler oppsettets totale gjæringstid (+ hydreringssjekk) | `metode` + tidsinnstillinger, `hydro` |
| `mengder` | Bare kjernetallene (mel/vann/salt/gjær) | `metode`, `type`, `mel`, `hydro` |

Alle svar er JSON med både ISO-tidspunkter og leselige norske tider
(Europe/Oslo, som appen). `lang: "en"` gir engelske tekster.
Oppsett-feltene fra `metoder_som_rekker` kan mates rett inn i `lag_plan` —
rundtur-vokteren i test_mcp.mjs beviser at det steker på ferdigtidspunktet.

## Melregisteret

Verktøyene som leser mel henter det LEVENDE registeret fra appens
`/api/flours` ved første behov (lat, memoisert, 3 s timeout) — validert av
samme `validerFlours` (engine.js) som appen bruker. Uten nett, eller ved
ugyldig svar, gjelder innebygd seed, og hvert svar sier ærlig hvilken kilde
som gjaldt: `melkilde: "server" | "innebygd"`. `PIZZAME_API`-miljøvariabelen
overstyrer basen (testene peker den på stubber).

## Testing

Gruppe 0d i porten (`node test_mcp.mjs`) tester begge transporter: den lokale
serveren spawnes som ekte prosess og de frosne scenariene i
baseline_results.json kjøres gjennom stdio-protokollen; Netlify-funksjonen
importeres i prosess og kalles med ekte Request/Response-objekter.
Melregister-testene bruker http-stubber og en lukket port som hoved-API,
så porten aldri avhenger av nett.

## Feilsøking

- **Verktøyene dukker ikke opp:** sjekk stien i konfigurasjonen og
  `node --version` ≥ 18; start klienten på nytt.
- **`melkilde: "innebygd"`:** maskinen når ikke ultimatepizza.netlify.app —
  helt ok å bake med, seed-lista er appens egen fallback.
- **«ukjent metode» o.l.:** som ment — serveren avviser heller enn å gjette,
  med gyldige verdier i meldingen.
