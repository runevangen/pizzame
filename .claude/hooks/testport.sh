#!/usr/bin/env bash
# Stop-hook: kjører de tre node-testlagene hver gang Claude avslutter en tur
# der kildefiler er endret. Feiler porten, får Claude feilene tilbake og
# fortsetter turen for å rette dem. Grønt gir én statuslinje til brukeren.
#
# Hvorfor Stop og ikke PostToolUse: en refaktor gjøres i mange små redigeringer,
# og tester midt i den ville bare gitt støy. Porten skal stå der Claude sier
# «ferdig» — samme sted som en utvikler ville kjørt testene selv.
#
# Nettleserlaget (test_regression.py, Playwright) kjøres ikke her. Det tar
# ~35 s og trenger Chromium; det eies av CI og av testvokter-agenten.

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0
input=$(cat)

# Vern mot evig løkke: når Claude alt fortsetter på grunn av denne hooken,
# skal et nytt Stop ikke blokkere igjen.
if printf '%s' "$input" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# Filene som testlagene dekker. Endret = ulik HEAD (ikke committet) eller
# ulik upstream (committet i denne økten, ikke pushet).
FILER=(engine.js steps.js guide.js index.html netlify)
endret=$( { git diff --name-only HEAD -- "${FILER[@]}"
            git diff --name-only '@{upstream}...HEAD' -- "${FILER[@]}" 2>/dev/null
          } | sort -u )
[ -z "$endret" ] && exit 0

export TZ=Europe/Oslo
utdata=""; rc=0
for t in test_enhet.mjs test_funksjoner.mjs test_steg.mjs; do
  o=$(node "$t" 2>&1) || rc=1
  utdata+="$o"$'\n'
done

if [ "$rc" -ne 0 ]; then
  jq -n --arg u "$utdata" '{
    decision: "block",
    reason: ("Testporten feilet etter endringene dine (node-lagene). Rett årsaken før du avslutter. Bruk testvokter-agenten hvis du trenger å knytte avvik til fil:linje. Ikke endre tester eller baseline_results.json for å komme forbi.\n\n" + $u)
  }'
else
  oppsummering=$(printf '%s' "$utdata" | grep -E '^(Enhetslag|Serverfunksjoner|Steglag):' | sed 's/ (.*//' | paste -sd '|' - | sed 's/|/ · /g')
  jq -n --arg m "Testport grønn: $oppsummering" '{systemMessage: $m}'
fi
exit 0
