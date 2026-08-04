# Planlegger — dataarkitektur

Datalaget for en delt kanban-planlegger for en venne-/familiegruppe. Bygget som
egne Netlify-funksjoner ved siden av deig-appen, med egne blob-stores så de to
appene aldri kolliderer.

Prinsippet bak modellen: **det som blir redigerbart senere lagres som data nå.**
Kolonnene bor i lageret allerede i v1 selv om UI-et ikke lar deg endre dem ennå —
da blir v2 en ren UI-endring, ikke en datamigrering.

## Blob-stores

| Store                 | Nøkkel            | Innhold |
|-----------------------|-------------------|---------|
| `planlegger-users`    | normalisert navn  | `{ id, displayName, pinHash, color, createdAt, lastLoginAt }` |
| `planlegger-columns`  | `list`            | `[{ id, navn, rekkefolge }]` |
| `planlegger-cards`    | kort-id           | ett kort per blob (modell under) |

## Modeller

**Bruker** — navn + personlig PIN. PIN hashes (SHA-256) og sammenlignes kun i
funksjonen; klienten ser aldri hashen. `color` brukes til avatarer og
«ansvarlig»-visning uten bilder, og deles ut fra en palett når brukeren ikke
velger selv.

**Kolonne** — `{ id, navn, rekkefolge }`. Seedet med `Å gjøre / Pågår / Ferdig`.

**Kort**
```
{ id, kolonneId, rekkefolge, tittel, beskrivelse, ansvarligId, frist,
  prioritet, vedlegg[], kommentarer[], createdBy, createdAt, updatedAt }

prioritet   : 'lav' | 'normal' | 'hoy'      (standard 'normal')
frist       : ISO-dato-streng eller null
ansvarligId : bruker-id fra roster, eller null
vedlegg     : [{ id, navn, type, storrelse, data(base64) }]
kommentarer : [{ id, tekst, byId, byNavn, createdAt }]
```

De tre filtrene som dekker søkebehovet faller rett ut av modellen: **mine oppgaver**
(`ansvarligId`), **forfaller snart** (`frist`), **høy prioritet** (`prioritet`).
Fritekstsøk blir et supplement i front-end.

## API

Alle ruter under `/api/planlegger/`. Admin-endepunkter krever `ADMIN_PASSWORD`
(miljøvariabel i Netlify; faller tilbake til standard til den er satt).

### Brukere
- `GET  /users?name=X` → `{ exists }`
- `GET  /users/roster` → `{ users:[{id,navn,farge}] }` (offentlig, uten PIN — fyller ansvarlig-nedtrekk)
- `POST /users` → registrer `{ navn, pin, farge? }` → `{ id, navn, farge }`
- `POST /users/verify` → logg inn `{ navn, pin }` → `{ ok, id, navn, farge }`
- `GET/PATCH/DELETE /users/admin[/:id]` → full liste / sett PIN+farge / slett

### Kolonner
- `GET   /columns` → `{ columns }`
- `PATCH /columns/admin` → upsert `{ password, column }`
- `PATCH /columns/admin/order` → `{ password, order:[id,...] }`
- `DELETE /columns/admin/:id` → slett (sperret mot siste kolonne)

### Kort
- `GET    /cards` (evt. `?kolonneId=` / `?ansvarligId=`)
- `POST   /cards` → `{ tittel, kolonneId?, beskrivelse?, ansvarligId?, frist?, prioritet?, createdBy }`
- `PATCH  /cards/:id` → endre felt, flytt (`kolonneId`+`rekkefolge`), `addComment`,
  `removeCommentId`, `addAttachment`, `removeAttachmentId`
- `DELETE /cards/:id`

## Bevisst utsatt (endrer ikke modellen)
- **Maks filstørrelse:** `MAX_ATTACHMENT` ≈ 900 kB per vedlegg nå (Netlify-taket er ~6 MB). Én konstant å justere.
- **Filer når kort slettes:** vedlegg ligger inline på kortet og forsvinner med det — ingen foreldreløse filer.
- **Om søk treffer kommentarer:** et front-end-valg; kommentarene ligger på kortet uansett.
