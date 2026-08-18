// Endringslogg for Pizzaplanlegger — flyttet ut fra index.html (v5.61) for å redusere
// filstørrelsen på hovedfilen. Rent datainnhold, ingen logikk. Lastes via <script src>
// FØR hovedscriptet i index.html, slik at CHANGELOG er tilgjengelig når resten kjører.
const CHANGELOG = [
  {
    "v": "0.827",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Endringsloggen er ryddet: den hadde vokst til 356 poster som hver bruker lastet ved hver appstart. Nå står siste måned i full detalj, mens juli 2026 (173 versjoner) er kondensert til én samlepost med månedens store løft. Fila er omtrent halvert — appen starter lettere, og «Hva er nytt» er blitt mulig å bla i.",
      "Ingenting er slettet: alle detaljpostene er flyttet ordrett (begge språk) til CHANGELOG-ARKIV.md i kodelageret på GitHub. Flyttingen gjøres av et skript som selv verifiserer at hver eneste versjon og hvert eneste punkt kom trygt frem før noe fjernes.",
      "Dette er nå en fast månedsrutine: ved månedsskiftet kondenseres forrige hele måned på samme måte, så loggen i appen alltid er detaljert der det er ferskt og kort der det er historie."
    ],
    "changes_en": [
      "The changelog has been tidied: it had grown to 356 entries that every user downloaded on every app start. Now the latest month stays fully detailed, while July 2026 (173 versions) is condensed into one summary entry with the month's big lifts. The file is roughly halved — the app starts lighter, and \"What's new\" is browsable again.",
      "Nothing is deleted: all detailed entries were moved verbatim (both languages) to CHANGELOG-ARKIV.md in the repository on GitHub. The move is done by a script that verifies every single version and bullet arrived safely before anything is removed.",
      "This is now a fixed monthly routine: at each month's turn the previous full month is condensed the same way, so the in-app log is always detailed where it's fresh and brief where it's history."
    ]
  },
  {
    "v": "0.826",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Planen følger avhakingen: haker du av et steg merkbart tidligere eller senere enn planlagt (mer enn fem minutter), spør appen «Gjorde du dette nå?» — og tilbyr å flytte resten av planen tilsvarende, med ny steketid vist før du velger. Meldt inn fra et ekte bak: oppstarten skjedde tjue minutter før planen, og planen ble stående og peke på det gamle klokkeslettet.",
      "Flyttingen er en ren forskyvning — deigen, varighetene og gjæringsvinduet er uendret, bare klokkeslettene flytter. Svarer du «Nei, la planen stå» holder appen munn en stund, så etterregistrering av flere steg på rad ikke maser med samme spørsmål.",
      "Tilbudet kommer bare når planen har et fast tidspunkt å flytte («spis kl.» eller en gjenåpnet deig med lagret oppstart), og aldri på siste steg — da er det ingenting igjen å flytte."
    ],
    "changes_en": [
      "The plan follows your check-offs: if you check off a step noticeably earlier or later than planned (more than five minutes), the app asks \"Did you do this now?\" — and offers to move the rest of the plan accordingly, showing the new baking time before you choose. Reported from a real bake: the start happened twenty minutes before plan, and the plan kept pointing at the old clock time.",
      "The move is a pure shift — the dough, the durations and the fermentation window are unchanged, only the clock times move. If you answer \"No, keep the plan\" the app stays quiet for a while, so back-filling several steps in a row is not nagged with the same question.",
      "The offer only appears when the plan has a fixed time to move (\"eat at\" or a reopened dough with a saved start), and never on the last step — there is nothing left to move then."
    ]
  },
  {
    "v": "0.825",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "±15-minuttknappene er blitt ærlige etter oppstart: har du haket av minst ett steg, flyttes ikke tiden i stillhet lenger. I stedet kommer et lite varsel som sier hva flyttingen faktisk betyr — det som er gjort ligger fast, så det er den gjenværende hevingen som strekkes eller kortes, med gammel og ny varighet på fasen det gjelder.",
      "Varselet feller også dom mot melets gjæringsvindu: holder den nye totaltiden seg innenfor det melet ditt tåler, sier det ✓ — går den utenfor, får du ⚠️ før du velger. «Flytt likevel» og «Avbryt» — valget er ditt, men du velger med åpne øyne.",
      "Før første avhaking oppfører knappene seg som før — da er hele planen fortsatt bare en plan, og kan flyttes fritt."
    ],
    "changes_en": [
      "The ±15-minute buttons are now honest after you have started: once at least one step is checked off, the time no longer moves silently. Instead a small notice explains what the move actually means — what is done stays fixed, so it is the remaining proof that gets stretched or shortened, with the old and new duration of the phase in question.",
      "The notice also passes judgement against your flour's fermentation window: if the new total stays within what your flour handles, it says ✓ — if it falls outside, you get a ⚠️ before you choose. \"Move anyway\" and \"Cancel\" — the choice is yours, but you make it with open eyes.",
      "Before the first check-off the buttons behave as before — the whole plan is still just a plan, and moves freely."
    ]
  },
  {
    "v": "0.824",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Gjær-kickstarten (vekk gjæren i litt lunkent vann med honning) finnes nå også i Langtidsdeig og Kveldsdeig — død gjær skal avsløres før melet er brukt, ikke når hevingen uteblir timer eller et døgn senere. I Langtidsdeig gjøres den mens autolysen hviler og koster null ekstra tid; i Kveldsdeig ligger den først og legger fem minutter til planen.",
      "Varmeregnskapet er med: det lunkne kickstartvannet bokføres i varmebalansen, så anbefalt vanntemperatur i blandesteget er justert tilsvarende ned (typisk et par grader). Deigen lander fortsatt på målet.",
      "Poolish, Biga og Mania trenger ingen kickstart — fordeigen er selv gjærtesten. Det står nå eksplisitt i stegene: boblene (og bigaens heving) er samtidig kvitteringen på at gjæren lever."
    ],
    "changes_en": [
      "The yeast kickstart (wake the yeast in a little lukewarm water with honey) now also exists in Long-ferment dough and Evening dough — dead yeast should be exposed before the flour is used, not when the rise fails to appear hours or a day later. In Long-ferment dough it is done while the autolyse rests and costs zero extra time; in Evening dough it comes first and adds five minutes to the plan.",
      "The heat accounting comes along: the lukewarm kickstart water is booked in the heat balance, so the recommended water temperature in the mixing step is adjusted down accordingly (typically a couple of degrees). The dough still lands on target.",
      "Poolish, Biga and Mania need no kickstart — the preferment is itself the yeast test. The steps now say so explicitly: the bubbles (and the biga's rise) double as your receipt that the yeast is alive."
    ]
  },
  {
    "v": "0.823",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rydding under panseret: metodenavnene («Langtidsdeig», «Hurtigdeig» …) sto i fem lokale kopier rundt i appen — metodekortene, statuslinja, Smart-plan og flere. Nå leses alle fra ett register, med variantnavnene (kald bulk, kjøleskaps-poolish) fra samme kilde. Ingenting ser annerledes ut — men navnene kan aldri mer sprike mellom flatene, og et fremtidig navnebytte er én linje."
    ],
    "changes_en": [
      "Under-the-hood cleanup: the method names (\"Long-ferment dough\", \"Quick dough\" …) lived in five local copies around the app — the method cards, the status bar, Smart plan and more. They are now all read from one register, with the variant names (cold bulk, fridge poolish) from the same source. Nothing looks different — but the names can never again diverge between surfaces, and a future rename is one line."
    ]
  },
  {
    "v": "0.822",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Langtidsdeig har fått en variant: «Kald bulk» (etter Pizzamanis mønster). Deigen kjøles samlet i én boks, formes til emner ETTER kjøleskapet — kald deig er fastere og lettere å runde stramt — og får en lang etterheving (ca. 8 timer ved 22°C). Det gir svært strekkbare emner og et bredt stekevindu: ferdighevde emner med så lite gjær holder seg i timevis. Velges under Kjøleskapsheving i Finjuster; gjærmengden regnes om automatisk av samme gjæringsmodell som ellers.",
      "Ny innstilling under Meltype: «Sammalt innslag» — 5, 10 eller 15 % fin sammalt rug eller emmer i melblandingen, for smak og sprøhet (10 % er Pizzamanis klassiske andel). Melraden i oppskriften viser blandingen («450g + 50g sammalt rug»), totalen er uendret, og grunnmelets gjæringsvindu styrer fortsatt planen. Skalaen stopper på 15 % fordi sammalt svekker gluten. Mania-poolish følger kildeoppskriften sin og er unntatt fra begge."
    ],
    "changes_en": [
      "Long-ferment dough has a new variant: \"Cold bulk\" (after Pizzamani's pattern). The dough is chilled whole in one container, shaped into balls AFTER the fridge — cold dough is firmer and easier to round tightly — and gets a long final proof (about 8 hours at 22°C). That gives very stretchable balls and a wide baking window: fully proofed balls with this little yeast keep for hours. Chosen under Cold fermentation in Fine-tune; the yeast amount is recalculated automatically by the same fermentation model as everything else.",
      "New setting under Flour type: \"Wholemeal share\" — 5, 10 or 15% fine wholemeal rye or emmer in the flour blend, for flavour and crispness (10% is Pizzamani's classic share). The flour row in the recipe shows the blend (\"450g + 50g wholemeal rye\"), the total is unchanged, and the base flour's fermentation window still governs the plan. The scale stops at 15% because wholemeal weakens gluten. Mania poolish follows its source recipe and is exempt from both."
    ]
  },
  {
    "v": "0.821",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Innloggingen leder nå med løftet i stedet for navnet: «Si når du vil spise. Appen finner ut resten.» står som overskrift, med appnavnet som liten etikett over. Det er appens kjerneidé i én setning — planen tilpasses livet ditt, ikke omvendt — og nå er det det første en ny bruker møter."
    ],
    "changes_en": [
      "The login now leads with the promise instead of the name: \"Say when you want to eat. The app works out the rest.\" stands as the headline, with the app name as a small label above. It is the app's core idea in one sentence — the plan adapts to your life, not the other way around — and it is now the first thing a new user meets."
    ]
  },
  {
    "v": "0.820",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "På Ferdige-kortene under «Deiger» delte knappene (✏️ / Se / Slett) linje med teksten — og med stor skrift på telefonen ble tekstkolonnen så smal at det sto ett ord per linje, mens knappene la seg oppå navnet. Nå bryter knappene ned på egen linje under teksten når det er trangt, og teksten får hele bredden. Samme grep på de aktive kortene."
    ],
    "changes_en": [
      "On the Finished cards under \"Doughs\", the buttons (✏️ / View / Delete) shared a line with the text — and with large text on the phone, the text column got so narrow it showed one word per line, while the buttons sat on top of the name. The buttons now wrap onto their own line below the text when space is tight, and the text gets the full width. Same treatment on the active cards."
    ]
  },
  {
    "v": "0.819",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny side under Mer: «🩺 Hvorfor gikk det feil?» — lærdommen fra ekte bakst, ordnet etter symptomet du står med: deigen hever tregt, emnene ser flate ut, første pizza ble dårligst, ingen luftig kant, deigen rakner, klokka stemmer ikke, kickstarten bobler ikke.",
      "Hvert symptom får årsakene i sannsynlighetsrekkefølge og en konkret test eller fiks — fingertesten, gjærens tilstand, romtemperaturmåling, IR mot stekedekket, bakerekkefølgen ved flere pizzaer. Kort nok til å skumme med deig på fingrene."
    ],
    "changes_en": [
      "New page under More: \"🩺 Why did it go wrong?\" — lessons from real bakes, organised by the symptom in front of you: dough rising slowly, balls looking flat, first pizza worst, no airy rim, dough tearing, clock not matching, kickstart not bubbling.",
      "Each symptom gets its causes in order of likelihood and a concrete test or fix — the finger test, yeast condition, measuring room temperature, IR on the baking surface, bake order with several pizzas. Short enough to skim with dough on your fingers."
    ]
  },
  {
    "v": "0.818",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Åpnet du en lagret deig, kunne avhakede steg stå som ugjort igjen. Hakene kjenner stegene på innholdet — og hvis en appoppdatering (eller en innstilling som «Gjærens tilstand») hadde omformulert et tall i stegteksten siden sist, kjente ikke haket igjen steget sitt.",
      "Nå flyttes haket ved gjenåpning: matcher det ikke lenger eksakt, men stegtittelen finnes nøyaktig én gang i planen, følger haket med — et gjort steg er gjort selv om tallene i teksten er skrevet om. Gjelder også understeg.",
      "Flyttingen gjetter aldri: har to steg samme tittel, eller finnes ikke tittelen lenger, står haket urørt. Og redigerer du planen mens du står i den, faller haket på et endret steg som før — det er fortsatt riktig at et nytt steg ikke er gjort."
    ],
    "changes_en": [
      "When you opened a saved dough, checked-off steps could show as not done. Checkmarks recognise steps by their content — and if an app update (or a setting like \"Yeast condition\") had reworded a number in the step text since then, the checkmark no longer recognised its step.",
      "The checkmark now moves on reopening: if it no longer matches exactly but the step title occurs exactly once in the plan, the checkmark follows — a done step is done even if the numbers in the text were rewritten. This also applies to sub-steps.",
      "The move never guesses: if two steps share a title, or the title no longer exists, the checkmark is left untouched. And if you edit the plan while in it, a checkmark on a changed step drops as before — it is still true that a new step has not been done."
    ]
  },
  {
    "v": "0.817",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny innstilling i Finjuster: «Gjærens tilstand». En åpnet boks tørrgjær mister styrke av fukt og romtemperatur — gjæren kan boble i koppen og likevel dra deigen 20–30 % bak skjema, slik dagens bakst viste. Velg «Åpnet nylig» (~85 %) eller «Åpnet lenge» (~70 %), så ganges mengden opp slik at virkningen blir som fersk gjær og alle hevetider står.",
      "Prosentene er anslag og merket som det. Vil du ha ditt eget tall: sett to glass lunkent vann med honning, samme mengde gammel og fersk gjær i hvert, sammenlign skummet etter 10 minutter — og velg «Målt %». Finjuster viser begge tall («2,1g i stedet for 1,5g»), så du ser hva justeringen gjør.",
      "Gjelder alle metoder unntatt Mania-poolish, som følger kildeoppskriften sin ordrett. Samtidig leser Hurtigdeig-stegene nå gjæren fra samme kilde som oppskriftsfanen, i stedet for en egen utregning — så de to aldri kan vise ulike tall."
    ],
    "changes_en": [
      "New setting under Fine-tune: \"Yeast condition\". An opened tin of dry yeast loses strength to moisture and room temperature — the yeast can bubble in the cup and still drag the dough 20–30% behind schedule, as today's bake showed. Choose \"Opened recently\" (~85%) or \"Open a while\" (~70%), and the amount is scaled up so the effect matches fresh yeast and all rise times hold.",
      "The percentages are estimates and labelled as such. Want your own number? Set up two glasses of lukewarm water with honey, the same amount of old and fresh yeast in each, compare the foam after 10 minutes — and choose \"Measured %\". Fine-tune shows both numbers (\"2.1g instead of 1.5g\"), so you can see what the adjustment does.",
      "Applies to every method except Mania poolish, which follows its source recipe verbatim. At the same time, the Quick dough steps now read the yeast from the same source as the recipe tab instead of their own calculation — so the two can never show different numbers."
    ]
  },
  {
    "v": "0.816",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Åpnet du en lagret deig som var startet «nå» for å fortsette på den, gled hele tidsplanen til gjenåpningstidspunktet — en deig startet 09:47 og gjenåpnet 12:43 fikk alle steg forskjøvet tre timer. Nå beholder en gjenåpnet deig sitt lagrede starttidspunkt: starten er et historisk faktum, og det som eventuelt endres, skal flytte slutten — aldri starten.",
      "Ankeret ryddes overalt der det skal: lukker du deigen, fullfører du Planlegging, eller henter du en ny plan fra Smart-plan, gjelder «starter nå» som før. Deiger lagret i «spis kl.»-modus var aldri rammet."
    ],
    "changes_en": [
      "If you opened a saved dough that was started \"now\" to continue it, the whole timeline slid to the moment you reopened it — a dough started at 09:47 and reopened at 12:43 had every step shifted three hours. A reopened dough now keeps its saved start time: the start is a historical fact, and whatever changes should move the end — never the start.",
      "The anchor is cleared everywhere it should be: close the dough, finish Planning, or fetch a new plan from Smart plan, and \"starting now\" applies as before. Doughs saved in \"eat at\" mode were never affected."
    ]
  },
  {
    "v": "0.815",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "På deig-kortene under «Deiger» kunne et langt navn male seg under Åpne-knappen når plassen ble trang. Navnekolonnen manglet krympe- og brytereglene som Ferdige-kortet allerede hadde — nå deler begge kortene samme oppskrift, og lange navn bryter pent i stedet for å krasje med knappene."
    ],
    "changes_en": [
      "On the dough cards under \"Doughs\", a long name could paint itself under the Open button when space got tight. The name column was missing the shrink and wrap rules the Finished card already had — now both cards share the same recipe, and long names wrap neatly instead of colliding with the buttons."
    ]
  },
  {
    "v": "0.814",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kickstart-steget sa «la stå til det bobler og skummer» — men med rundt 1 gram gjær i 60 gram vann ser et helt friskt resultat ut som små nålestikk-bobler og en tynn, melkete film, ikke noe skumberg. En fersk bakst viste at teksten fikk et sunt resultat til å ligne en bom. Nå kalibrerer steget forventningen til gjærmengden.",
      "Dødsgrensa i tipset står uendret: bobler det ikke i det hele tatt etter 5–10 minutter, er gjæren død — bytt den før du blander inn melet."
    ],
    "changes_en": [
      "The kickstart step said \"let it sit until it bubbles and foams\" — but with about 1 gram of yeast in 60 grams of water, a perfectly healthy result looks like tiny pinprick bubbles and a thin, milky film, not a foam dome. A real bake showed the text made a healthy result look like a failure. The step now calibrates the expectation to the amount of yeast.",
      "The dead-yeast threshold in the tip is unchanged: if nothing bubbles at all after 5–10 minutes, the yeast is dead — replace it before mixing in the flour."
    ]
  },
  {
    "v": "0.813",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nye − / + -knapper på Steketid-raden øverst i Tidsplan: hvert trykk flytter hele planen et kvarter — oppstarten følger med, og deigen er identisk. Vil du spise en time tidligere, er det fire trykk i stedet for en tur innom Juster og klokkeslettvelgeren.",
      "Knappene sitter på raden du faktisk styrer: i «spis kl.»-modus er det steketiden som er ankeret. I «starter nå»-modus finnes de ikke — der starter planen når du starter, og det er ingen tid å flytte.",
      "Forskyvningen skrur på de samme feltene som Planlegging leser, så knappene og veiviseren kan aldri være uenige om når du skal spise. Kolliderer den nye tiden med «Ledig tid», sier de vanlige varslene fra som før."
    ],
    "changes_en": [
      "New − / + buttons on the Baking time row at the top of the Timeline: each tap shifts the whole plan by a quarter hour — the start moves with it, and the dough is identical. Want to eat an hour earlier? Four taps instead of a trip into Adjust and the time picker.",
      "The buttons sit on the row you actually control: in \"eat at\" mode the baking time is the anchor. In \"starting now\" mode they don't exist — there the plan starts when you do, and there is no time to move.",
      "The shift turns the same fields the planner reads, so the buttons and the wizard can never disagree about when you eat. If the new time collides with your free time, the usual warnings speak up as before."
    ]
  },
  {
    "v": "0.812",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Hurtigdeigens kickstart ber om 60g vann på 40–43°C — men varmeregnskapet bak anbefalt vanntemperatur regnet ALT vannet som likt temperert. Fulgte du planen bokstavelig, landet deigen rundt 26°C der planen lovet 24. Samme vann sto altså med to temperaturer i to steg.",
      "Nå bokføres kickstartvannet som sitt eget, varme ledd i varmebalansen, og resten av vannet beregnes kaldere for å kompensere: for en typisk plan (500g mel, 20°C kjøkken) sier eltesteget nå 15°C i stedet for 20°C — og deigen treffer faktisk 24°C.",
      "Kickstartens temperaturspenn har én kilde som både stegteksten og regnestykket leser, så de to kan ikke lenger drive fra hverandre. De andre metodene er uberørt — de har ingen varm kickstart."
    ],
    "changes_en": [
      "Quick dough's kickstart calls for 60g of water at 40–43°C — but the heat budget behind the recommended water temperature counted ALL the water at one temperature. Following the plan literally landed the dough around 26°C where the plan promised 24. The same water was booked at two temperatures in two steps.",
      "The kickstart water is now its own warm term in the heat balance, and the rest of the water is computed colder to compensate: for a typical plan (500g flour, 20°C kitchen) the kneading step now says 15°C instead of 20°C — and the dough actually hits 24°C.",
      "The kickstart's temperature range has one source that both the step text and the calculation read, so the two can no longer drift apart. The other methods are untouched — they have no warm kickstart."
    ]
  },
  {
    "v": "0.811",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Passive steg på tidslinjen sa «1 time venting» — under en tittel som allerede sa «Romtemperaturheving». Deigen hever, modner eller hviler; det er bare du som venter, og ordet leste som at ingenting skjer. Nå viser passive steg bare varigheten: «· 1 time».",
      "Skillet mellom din tid og deigens tid bæres i stedet av «aktivt»-merket, som står igjen kun på stegene der du faktisk må gjøre noe: står det «15 min aktivt», koster tiden deg — står det bare «1 time», jobber deigen alene."
    ],
    "changes_en": [
      "Passive steps on the timeline said \"1 hour waiting\" — under a title that already said \"Room-temperature rise\". The dough is rising, maturing or resting; only you are waiting, and the word read as if nothing was happening. Passive steps now show just the duration: \"· 1 hour\".",
      "The distinction between your time and the dough's time is instead carried by the \"active\" mark, which remains only on steps where you actually have to do something: \"15 min active\" costs you time — a bare \"1 hour\" means the dough is working alone."
    ]
  },
  {
    "v": "0.810",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Hurtigdeigens «Etterheving + forvarme» var ett steg som ba deg varme ovnen ved stegstart — ved 2 timers deig er hevingen 33 minutter, men ved 8 timer er den nesten 3 timer, og en pizzaovn på 450°C skal ikke stå og fyre så lenge. Nå er det to steg: en ren etterheving, og et eget «Sett på ovnen 🔥» som kommer akkurat tidsnok — 20 minutter før steking for pizzaovn, 45 for vanlig ovn, samme regel som alle de andre metodene.",
      "Ovnssteget nevner også Hurtigdeigens egen måltemperatur (den varierer med hevetiden), så du slipper å bla frem til stekesteget for å vite hva du skal stille inn.",
      "Er etterhevingen kortere enn ovnen trenger — kort deig og vanlig ovn — settes ovnen på allerede før hevingen starter, så den rekker å bli gjennomvarm."
    ],
    "changes_en": [
      "Quick dough's \"Final proof + preheat\" was one step that told you to heat the oven at the start of the proof — with a 2-hour dough the proof is 33 minutes, but at 8 hours it is nearly 3 hours, and a 450°C pizza oven should not blaze away that long. It is now two steps: a pure final proof, and a separate \"Turn on the oven 🔥\" that arrives just in time — 20 minutes before baking for a pizza oven, 45 for a regular oven, the same rule as every other method.",
      "The oven step also names Quick dough's own target temperature (it varies with the rise time), so you do not have to skip ahead to the baking step to know what to set.",
      "If the proof is shorter than the oven needs — short dough and a regular oven — the oven goes on before the proof even starts, so it has time to heat through."
    ]
  },
  {
    "v": "0.809",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Ledig tid»-raden i Smart-plan ble for rotete med klokkeslett — «man 6:30–8 +1 · tir–fre 16–22 · …» er et regnestykke, ikke en orientering. Nå oversettes periodene til dagsdeler: «man–fre kveld · helg hele dagen», eller «man–fre morgen og kveld» når du har to økter.",
      "Passer ikke uken din i to grupper, sier raden heller «egne tider · 7 dager» enn å bli en remse igjen. De nøyaktige klokkeslettene står i boksen, ett trykk unna.",
      "Standardteksten er kortet til bare «standardoppsettet» — raden er allerede en dør, oppfordringen var dobbel. Pausen vinner fortsatt over alt."
    ],
    "changes_en": [
      "The \"Free time\" row in Smart plan got too cluttered with clock times — \"Mon 6:30–8 +1 · Tue–Fri 16–22 · …\" is arithmetic, not orientation. Periods now translate to parts of the day: \"Mon–Fri evening · weekend all day\", or \"Mon–Fri morning and evening\" when you have two sessions.",
      "If your week does not fit in two groups, the row says \"custom times · 7 days\" rather than becoming a strip again. The exact times live in the box, one tap away.",
      "The default label is shortened to just \"the default setup\" — the row is already a door, the prompt was doubled. The pause still wins over everything."
    ]
  },
  {
    "v": "0.808",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Brikkene under Smart-plan er byttet med to rader: «Søket bruker det appen vet om deg». De gamle brikkene hadde to svakheter — tidsbrikken stilte et spørsmål i stedet for å vise svaret ditt, og begge så ut som handlingsknapper.",
      "Radene viser levende tilstand for begge: «Melet mitt — 3 av 10 valgt» og «Ledig tid — man–fre 16–22 · lør–søn 10–22», med like dager slått sammen. Trykk på en rad for å endre.",
      "Tidsraden er ærlig i alle tilstander: står du på standardoppsettet, sier den det i stedet for å ramse opp tider du aldri har valgt — og har du satt ledig tid på pause, vinner pausen over alt annet."
    ],
    "changes_en": [
      "The chips under Smart plan have been replaced with two rows: \"The search uses what the app knows about you\". The old chips had two weaknesses — the time chip asked a question instead of showing your answer, and both looked like action buttons.",
      "The rows show live state for both: \"My flour — 3 of 10 selected\" and \"Free time — Mon–Fri 16–22 · Sat–Sun 10–22\", with equal days merged. Tap a row to change it.",
      "The time row is honest in every state: if you are on the default setup it says so instead of listing times you never chose — and if free time is paused, the pause wins over everything else."
    ]
  },
  {
    "v": "0.807",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Inngangsskjermens Smart-plan-kort sa «Si når du har tid og når du vil spise» — men tiden oppgir du ikke der lenger; appen leser den fra «Når er du ledig?». Kortet sier nå nøyaktig det samme som Smart-plan-skjermens første setning, så de to aldri kan love forskjellige ting."
    ],
    "changes_en": [
      "The entry screen's Smart plan card said \"Tell it when you have time and when you want to eat\" — but you no longer state your time there; the app reads it from \"When are you free?\". The card now says exactly the same as the Smart plan screen's first sentence, so the two can never promise different things."
    ]
  },
  {
    "v": "0.806",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan sier nå hva søket faktisk bygger på. Underteksten var utdatert — den ba deg oppgi når du har tid, men det gjør du ikke der lenger; appen leser det fra «Når er du ledig?». Ny tekst: «Si når du vil spise — appen prøver alle metodene og finner den som passer best i din uke. Stemmer melet og tidene dine, stemmer planen.»",
      "Under teksten står søkets to egne inndata som trykkbare brikker: 🌾 Melet mitt (med antallet ditt, live) og 🗓️ Når er du ledig? Begge åpner boksene sine direkte — de er dører, ikke kopier, og melbrikken får teksten fra samme kilde som alle andre «Melet mitt»-etiketter."
    ],
    "changes_en": [
      "Smart plan now says what the search actually builds on. The subtitle was outdated — it asked you to state when you have time, but you no longer do that there; the app reads it from \"When are you free?\". New text: \"Say when you want to eat — the app tries every method and finds the one that fits your week best. If your flour and your times are right, the plan is right.\"",
      "Below it, the search's two personal inputs sit as tappable chips: 🌾 My flour (with your count, live) and 🗓️ When are you free? Both open their boxes directly — they are doors, not copies, and the flour chip gets its text from the same source as every other \"My flour\" label."
    ]
  },
  {
    "v": "0.805",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tempereringssteget for kjøleskaps-poolish sa «halvparten av melet, over to tredeler av varmekapasiteten, lander rundt 13°C». Alle tre tallene var skrevet inn for hånd én gang — og ved 30 % poolish var alle tre feil: der er sannheten 30 % av melet, 40 % av varmekapasiteten, og rundt 18°C.",
      "Nå regnes de av samme varmebalanse som resten av appen, så setningen er sann for akkurat din deig — uansett mengde, andel, romtemperatur og kjøkkenmaskin.",
      "Dermed er hvert eneste tall i stegtekstene enten regnet av planen eller en bevisst avskrift fra en kilde — og en test vokter at det forblir slik."
    ],
    "changes_en": [
      "The warm-up step for fridge poolish said \"half the flour, over two thirds of the heat capacity, lands around 13°C\". All three numbers were typed in by hand once — and at 30% poolish all three were wrong: the truth there is 30% of the flour, 40% of the heat capacity, and around 18°C.",
      "They are now computed by the same heat balance as the rest of the app, so the sentence is true for your exact dough — regardless of amount, share, room temperature and mixer.",
      "With that, every number in the step texts is either computed from the plan or a deliberate transcript from a source — and a test guards that it stays that way."
    ]
  },
  {
    "v": "0.804",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ramlösa-melet fra v0.803 var ikke synlig i appen likevel — og Cuoco-navnerettingen fra v0.801 hadde heller aldri nådd fram. Mellisten på serveren vant over koden så snart den fantes, så endringer i kodens liste ble aldri lest igjen.",
      "Nå flettes de: nye mel i koden legges inn på riktig plass i serverlista, og kjente feilverdier rettes — men bare hvis de står uendret. Har du redigert et mel selv i admin, røres det ikke."
    ],
    "changes_en": [
      "The Ramlösa flour from v0.803 was not actually visible in the app — and the Cuoco name fix from v0.801 had never arrived either. The server's flour list won over the code as soon as it existed, so changes to the code's list were never read again.",
      "Now they merge: new flours in the code are inserted at their proper place in the server list, and known bad values are corrected — but only if they are unchanged. A flour you have edited yourself in admin is left alone."
    ]
  },
  {
    "v": "0.803",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt mel i lista: Ramlösa Kvarn Tipo 00 (Finax) — siktet svensk vårvete med 12,5 % protein, selges blant annet hos Coop.",
      "Produsenten oppgir ikke W-verdi, så gjæringstiden (10–36 t) og hydreringen (58–70 %) er anslått av oss og merket slik i appen. Samme protein som Caputo Pizzeria, men uten dokumentert styrke settes taket forsiktig til 36 timer — ikke Pizzerias 48."
    ],
    "changes_en": [
      "New flour in the list: Ramlösa Kvarn Tipo 00 (Finax) — sifted Swedish spring wheat with 12.5% protein, sold at Coop among others.",
      "The manufacturer publishes no W value, so the fermentation range (10–36h) and hydration (58–70%) are our estimates and marked as such in the app. Same protein as Caputo Pizzeria, but without documented strength the ceiling is set cautiously at 36 hours — not Pizzeria's 48."
    ]
  },
  {
    "v": "0.802",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "PC-visningen var vanskelig å lese: Pizzatype-pillene, ☰ Meny og ⚙️ Avanserte innstillinger sto med nesten hvit tekst på lys bakgrunn. En fargevariabel pekte på mobilens mørke tema i stedet for reserven sin — nå har PC hele den lyse paletten selv, og teksten er mørk der den skal være mørk.",
      "«Fra–til» fantes bare på mobil. Nå står den som tredje valg under Planlegging på PC også: oppgi tidligst mulig oppstart og ønsket steketid, og få de samme kandidatkortene — beste alternativ, «slik får du den til å passe», og melvarslene.",
      "Smart-plan lå som nest siste rad i ☰ Meny, bak Formler og Admin. Den har fått en egen, synlig inngang øverst i sidepanelet — og raden i menyen er flyttet til toppen.",
      "Bytter du fra mobil- til PC-visning, speiler sidepanelet nå tilstanden din: modusvalget (og et Fra–til-vindu du sto i) følger med i stedet for å vise noe annet enn planen."
    ],
    "changes_en": [
      "The desktop view was hard to read: the pizza-type pills, ☰ Menu and ⚙️ Advanced settings showed near-white text on a light background. A colour variable pointed at the mobile dark theme instead of its fallback — desktop now carries the full light palette itself, and text is dark where it should be dark.",
      "\"From–to\" only existed on mobile. It is now the third choice under Planning on desktop too: state the earliest you can start and when you want to bake, and get the same candidate cards — best option, \"here's how to make it fit\", and the flour notes.",
      "Smart plan sat as the second-to-last row in ☰ Menu, behind Formulas and Admin. It now has its own visible entry at the top of the sidebar — and the menu row has moved to the top.",
      "Switching from mobile to desktop view now mirrors your state: the mode choice (and a From–to window you were in) carries over instead of showing something other than the plan."
    ]
  },
  {
    "v": "0.801",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Melet het «Caputo Couco». Det riktige navnet er «Caputo Cuoco» — den røde posen, også kjent som Saccorosso. W-verdien er samtidig rettet fra 300–340 til produsentens 300–320.",
      "Bare navnet er endret. Nøkkelen bak ligger lagret i hver bakelogg, så deigene du har bakt med den peker fortsatt riktig — og en ny test vokter at nøklene ikke kan døpes om i vanvare."
    ],
    "changes_en": [
      "The flour was called \"Caputo Couco\". The correct name is \"Caputo Cuoco\" — the red bag, also known as Saccorosso. The W value has been corrected from 300–340 to the manufacturer's 300–320.",
      "Only the name changed. The key behind it is stored in every bake log, so the doughs you have already baked still point to the right flour — and a new test guards against keys being renamed by accident."
    ]
  },
  {
    "v": "0.800",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Blandesteget sa «kjølig eller romtemperert vann (anbefalt ca. 4°C)». 4°C er ingen av delene. Ordene var hardkodet etter hvilken kjøkkenmaskin du har, mens tallet ble regnet ut — så de drev fra hverandre. Nå følger ordene tallet: 4°C er «vann rett fra kjøleskapet», 14°C er «kaldt vann fra springen», 17°C er «kjølig vann».",
      "Det var ikke bare språk: følger du ordene i stedet for tallet, lander deigen på 25–26°C — som appens eget varsel kaller for varm.",
      "Og noen ganger er tallet ikke et svar, men en grense. Med halve melet i en romtemperert poolish er bare 75 av 325g vann justerbart, og regnestykket kan be om vann kaldere enn det finnes — i verste målte tilfelle −53°C. Appen skrev ut 4°C og kalte det «anbefalt». Nå sier den fra: «4°C — kaldere finnes ikke, og det rekker ikke helt her», med hvor mye vann som faktisk er justerbart og hvorfor.",
      "Men bare når det koster noe. Av 27 kombinasjoner blir svaret klemt i 9, og i 5 av dem lander deigen fint likevel — der sier appen ingenting.",
      "Og den slutter å foreslå 30 %-poolishen til folk som allerede har valgt den."
    ],
    "changes_en": [
      "The mixing step said \"cool or room-temperature water (recommended about 4°C)\". 4°C is neither. The words were hard-coded by which stand mixer you have while the number was computed, so the two drifted apart. Now the words follow the number: 4°C is \"water straight from the fridge\", 14°C is \"cold tap water\", 17°C is \"cool water\".",
      "This was not just language: follow the words instead of the number and the dough lands at 25–26°C — which the app's own warning calls too warm.",
      "And sometimes the number is not an answer but a limit. With half the flour in a room-temperature poolish, only 75 of 325g of water is adjustable, and the arithmetic can ask for water colder than exists — in the worst measured case −53°C. The app printed 4°C and called it \"recommended\". Now it says so: \"4°C — it does not get colder, and it is not quite enough here\", with how much water is actually adjustable and why.",
      "But only when it costs something. Across 27 combinations the answer is clamped in 9, and in 5 of those the dough lands fine anyway — there the app stays quiet.",
      "And it stops suggesting the 30 % poolish to people who have already chosen it."
    ]
  },
  {
    "v": "0.799",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Når er du ledig?» er flyttet ut av Smart-plan. Den styrer også hvert «du er ikke ledig da»-varsel i resten av appen, og en innstilling som treffer overalt kan ikke bo inne i én fane. Ligger nå under Mer og i ☰ Meny på PC — der finnes den for første gang.",
      "«Metoder du blir tilbudt» er borte fra Smart-plan. Filteret gjelder Fra–til like mye, så det står ett sted: Mer → Hva du blir tilbudt.",
      "Og det lå faktisk egen logikk i Smart-plan: hadde du skrudd av alle metodene, viste den alle likevel — mens Fra–til ble stående tom. Samme innstilling ga altså to forskjellige svar. Nå er regelen én, og begge slipper den tomme skjermen.",
      "Nytt: et lite tips første gang som peker på Mer → Hva du blir tilbudt, så melkurven og metodefilteret ikke blir funksjoner ingen finner. Det forsvinner når du har vært der én gang.",
      "Kommer du til ukedagene fra et varsel, svarer boksen mens du redigerer: «du har fortsatt et steg utenfor tiden din» → «alle steg ligger innenfor». Å lukke den er returen — du forlot aldri skjermen du sto i."
    ],
    "changes_en": [
      "\"When are you free?\" has moved out of Smart plan. It also governs every \"you are not free then\" warning across the app, and a setting that affects everything cannot live inside one tab. It is now under More, and in ☰ Menu on desktop — where it exists for the first time.",
      "\"Methods you are offered\" is gone from Smart plan. The filter applies to From–to just as much, so it lives in one place: More → What you are offered.",
      "And Smart plan did carry its own logic: if you switched every method off, it showed them all anyway — while From–to came up empty. One setting, two different answers. The rule is now single, and neither gives you an empty screen.",
      "New: a small first-time tip pointing to More → What you are offered, so the flour list and method filter do not stay features nobody finds. It disappears once you have been there.",
      "If you reach the weekday times from a warning, the box answers while you edit: \"you still have a step outside your time\" → \"all steps are within\". Closing it is the way back — you never left the screen you were on."
    ]
  },
  {
    "v": "0.798",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Har du krysset av for melet du har, bytter appen til det når du velger en plan. Før sa Fra–til «45t over det Caputo Doppio Zero er ment for» — om et mel du ikke engang eier — mens Manitoba Oro i kurven din dekket alle de tre lengste forslagene.",
      "Byttet skjer uten å spørre, men ikke uten å si fra: kortet sier «🌾 Bruker Caputo Manitoba Oro — den tåler disse timene» før du trykker. Gjelder både Fra–til og Smart-plan, så melet ikke avhenger av hvilken fane du gikk gjennom.",
      "Tre unntak: appen bytter aldri når melet du står på er ditt eget og klarer planen, aldri bort fra «Annet mel / ikke i listen», og aldri hvis du ikke har sagt hva du har.",
      "«Bytt til …»-knappen i melvarselet var taus når den trengtes mest. Den krevde treff på både tid og hydrering, så et mel som tålte timene men ville ha mer vann ble aldri nevnt. Gjæringstiden er en hard grense; vannet kan du flytte med knappen ved siden av."
    ],
    "changes_en": [
      "If you have ticked the flours you own, the app switches to one of them when you pick a plan. Before, From–to said \"45h beyond what Caputo Doppio Zero is meant for\" — about a flour you do not even own — while Manitoba Oro in your list covered all three of the longest suggestions.",
      "The switch happens without asking, but not without saying: the card reads \"🌾 Uses Caputo Manitoba Oro — it handles these hours\" before you tap. Applies to both From–to and Smart plan, so the flour does not depend on which tab you came through.",
      "Three exceptions: it never switches when the flour you are on is yours and handles the plan, never away from \"Other / not listed\", and never if you have not said what you have.",
      "The \"Switch to …\" button in the flour warning went quiet exactly when it was needed. It required a match on both time and hydration, so a flour that handled the hours but wanted more water was never mentioned. Fermentation time is a hard limit; the water you can move with the button next to it."
    ]
  },
  {
    "v": "0.797",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Melet mitt» og «Metoder du blir tilbudt» er samlet i én boks: 🎛️ Hva du blir tilbudt. Begge svarer på spørsmål om deg og kjøkkenet ditt, ikke om denne deigen, og lå spredt — den ene inne i Finjuster, den andre inne i Smart-plan.",
      "Boksen nås fra Mer på mobil og fra ☰ Meny på PC. Melkurven fantes ikke på PC i det hele tatt før nå.",
      "Det står fortsatt en lenke dit de virker: under Meltype i Finjuster, og under søket i Smart-plan. Men avkryssingen finnes bare ett sted — to kopier av samme bryter kan si to forskjellige ting.",
      "Hjelpeteksten sa at filteret gjaldt Smart-plan. Det gjelder Fra–til også, og nå står det."
    ],
    "changes_en": [
      "\"My flour\" and \"Methods you are offered\" are now in one box: 🎛️ What you are offered. Both answer questions about you and your kitchen rather than about this dough, and they were scattered — one inside Fine-tune, the other inside Smart plan.",
      "The box is reached from More on mobile and from ☰ Menu on desktop. The flour list did not exist on desktop at all until now.",
      "There is still a link where they take effect: under Flour type in Fine-tune, and under the search in Smart plan. But the tick boxes exist in one place only — two copies of the same switch can say two different things.",
      "The help text said the filter applied to Smart plan. It applies to From–to as well, and now it says so."
    ]
  },
  {
    "v": "0.796",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt: «Melet mitt» under Meltype i Finjuster. Huk av det du har hjemme, så vet appen hva du faktisk kan bake med — og sier hva kurven din rekker: «Med disse melene: 4–24 timer gjæring og 55–70 % hydrering.»",
      "Ingenting skjules. Melene du ikke har står fortsatt i lista, bare under overskriften «Andre mel» — skjulte vi dem, ville du aldri fått vite at deigen du prøver å lage finnes og bare mangler et mel du kunne kjøpt.",
      "Smart-plan rangerer nå etter melet ditt, ikke etter alle mel i verden. Før kunne den løfte en plan du ikke kunne bake fordi tre mel du ikke eier tålte den.",
      "«Bytt til …»-knappen i melvarselet leter i kurven din først, og sier fra når det beste melet ikke står der.",
      "Under Pizzatype dukker det opp en linje når melet ditt ikke rekker typens anbefalte hydrering — med navnet på et mel som ville nådd dit."
    ],
    "changes_en": [
      "New: \"My flour\" under Flour type in Fine-tune. Tick what you have at home and the app knows what you can actually bake with — and tells you what your selection reaches: \"With these flours: 4–24 hours of fermentation and 55–70% hydration.\"",
      "Nothing is hidden. Flours you do not have are still in the list, just under the heading \"Other flours\" — hiding them would mean never learning that the dough you are trying to make exists and merely needs a flour you could buy.",
      "Smart plan now ranks by your flour rather than by every flour in the world. Before, it could promote a plan you could not bake because three flours you do not own tolerated it.",
      "The \"Switch to …\" button in the flour warning looks in your selection first, and says so when the best flour is not there.",
      "Under Pizza type a line appears when your flour cannot reach the type's recommended hydration — naming a flour that would."
    ]
  },
  {
    "v": "0.795",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mania-poolish kan nå velges på PC. Den har bare stått i mobilvelgeren — oppskriften og tidsplanen har regnet den riktig hele tiden, den var ikke mulig å trykke på.",
      "Mania er også med i Fra–til nå. Før kunne du skru den av og på i metodefilteret som styrer Fra–til, mens den aldri kunne komme opp der uansett hva du valgte. Den har ingen skruer å justere, så kortet svarer på det ene spørsmålet som gjelder: får de faste 36 timene plass i vinduet ditt, eller mangler du så og så mye?",
      "Appen hadde fire lister over hvilke metoder du blir tilbudt, og de var ikke like. Nå er det én — og en test som feller enhver ny forskjell mellom dem."
    ],
    "changes_en": [
      "Mania poolish can now be chosen on desktop. It only ever appeared in the mobile picker — the recipe and schedule have computed it correctly all along, it just was not clickable.",
      "Mania is now part of From–to as well. Before, you could switch it on and off in the method filter that governs From–to, while it could never show up there no matter what you chose. It has no knobs to adjust, so the card answers the one question that applies: do the fixed 36 hours fit in your window, or how much are you short?",
      "The app had four lists of which methods you are offered, and they did not match. Now there is one — and a test that fails on any new divergence between them."
    ]
  },
  {
    "v": "0.794",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Melvelgeren viser nå hvor lenge hvert mel er ment å gjære: «Caputo Manitoba Oro · 24–120 t». Tallene har alltid ligget i appen, men de dukket først opp som et varsel etter at du hadde valgt — så spørsmålet «hvilket mel tåler 69 timer?» måtte besvares ved å prøve seg fram.",
      "«Annet mel / ikke i listen» står fortsatt uten tall. Der kjenner ikke appen melet, og da er det riktigere å tie enn å gjette."
    ],
    "changes_en": [
      "The flour picker now shows how long each flour is meant to ferment: \"Caputo Manitoba Oro · 24–120 h\". The numbers were always in the app, but they only showed up as a warning after you had chosen — so \"which flour handles 69 hours?\" had to be answered by trial and error.",
      "\"Other / not listed\" still shows no range. There the app does not know the flour, and saying nothing is more honest than guessing."
    ]
  },
  {
    "v": "0.793",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kortene i Fra–til sa «Poolish · 54 timer», men de 54 timene var kjøleskapstiden — ikke poolishen. Poolishen var 14. Planen var riktig hele veien; det var etiketten som ikke sa hva tallet gjaldt.",
      "Nå står begge fasene: «Poolish · 14t romtemp + 54t kaldheving». Forspillet sier også hvor det står, siden en poolish på benken og en i kjøleskapet er to helt forskjellige deiger.",
      "Biga får samme behandling. Langtidsdeig sier bare «54t kaldheving» — den har ikke noe forspill, så der var det aldri tvetydig."
    ],
    "changes_en": [
      "The cards in the From–to picker said \"Poolish · 54 hours\", but those 54 hours were the fridge time — not the poolish. The poolish was 14. The plan was right all along; it was the label that did not say which hours it meant.",
      "Now both phases are shown: \"Poolish · 14h room temp + 54h cold rise\". The preferment also says where it sits, since a poolish on the counter and one in the fridge are two entirely different doughs.",
      "Biga gets the same treatment. Long-ferment dough just says \"54h cold rise\" — it has no preferment, so it was never ambiguous there."
    ]
  },
  {
    "v": "0.792",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Klapp har fått et tredje nivå: ett klapp er neste, to er forrige, og tre ruller nedover i steget. Når du har rullet helt ned, går neste tre-klapp oppover igjen — retningen snur ved endene og blir stående, så du ikke vipper mellom de to siste skjermene.",
      "Tre klapp fyrer med en gang. Ett og to må vente ut par-vinduet for å vite at det ikke kommer flere — men etter tre kan ingenting komme, så den slipper å vente.",
      "Vinkestyringen er tatt ut av Fokus. Den treffer ikke godt nok ennå, og en halvgod bevegelse midt i et steg du står i koster mer enn den gir.",
      "Til gjengjeld: ny treningsrute under Mer → Utprøving. Seks ganger seks ruter, ett mål av gangen, og tall som viser om vinket ble lest som riktig retning — ikke bare om det ble sett i det hele tatt. Det er forskjellen mellom «den bommet» og «den leste venstre da jeg mente opp», og de to krever helt ulik fiks."
    ],
    "changes_en": [
      "Clapping has a third level: one clap is next, two is previous, and three scrolls down within the step. Once you have scrolled all the way down, the next triple clap goes back up — the direction turns at the ends and stays, so you do not bounce between the last two screens.",
      "Three claps fire immediately. One and two have to wait out the pair window to know no more are coming — but nothing can follow three, so it does not have to wait.",
      "Wave control has been taken out of Focus. It does not hit reliably enough yet, and a half-working gesture in the middle of a step you are standing in costs more than it gives.",
      "In return: a new practice grid under More → Trials. Six by six squares, one target at a time, and numbers showing whether the wave was read as the right direction — not just whether it was seen at all. That is the difference between \"it missed\" and \"it read left when I meant up\", and the two need completely different fixes."
    ]
  },
  {
    "v": "0.791",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fagordene i stegteksten er nå trykkbare. Ser du «overflatespenning», «ovnsløft» eller «emne» med prikket strek under, kan du trykke og få forklaringen der og da — i stedet for å slå opp i ordlista etterpå, når spørsmålet er glemt.",
      "Bare første forekomst i hvert avsnitt merkes. Et steg som sier «emne» fire ganger skal ikke se ut som en vegg av understreker.",
      "Understegene er med vilje holdt utenfor. De er en trykkflate for avhaking, og et trykkbart ord inni ville slåss med den bevegelsen du er der for å gjøre.",
      "Samtidig rettet: «extensibel» skrives ekstensibel på norsk, og «rundt» (som i «rundt 20 minutter») ble en periode forvekslet med formingsordet «runding»."
    ],
    "changes_en": [
      "The baking terms in the step text are now tappable. If you see \"surface tension\", \"oven spring\" or \"dough ball\" with a dotted underline, you can tap it and get the explanation right there — instead of looking it up in the glossary afterwards, when the question has been forgotten.",
      "Only the first occurrence in each paragraph is marked. A step that says \"dough ball\" four times should not look like a wall of underlines.",
      "Sub-steps are deliberately left out. They are a tap surface for ticking off, and a tappable word inside would fight the very gesture you are there to make.",
      "Also fixed: \"extensible\" is spelled correctly in Norwegian now, and \"around\" (as in \"around 20 minutes\") was briefly confused with the shaping term \"rounding\"."
    ]
  },
  {
    "v": "0.790",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny ordliste i bruksanvisningen. Stegtekstene har hele tiden lent seg på bakespråk uten å forklare noe av det — målt over alle metoder og typer sto «emne» 275 ganger, «gluten» 106, «autolyse» 20, uten at et eneste av ordene var definert noe sted i appen. Nå er de fjorten viktigste forklart, med «emne» først: det er enheten hele appen regner i.",
      "«Oven spring» sto på engelsk midt i norsk tekst. Det heter nå ovnsløft, med fagbegrepet i parentes første gang — du får det norske ordet, og kan fortsatt gjenkjenne uttrykket når du møter det andre steder.",
      "«Dekket» betydde to helt ulike ting i samme app: å dekke bollen med lokk, og steinen pizzaen ligger på i ovnen. Den siste heter nå stekedekket.",
      "Ordlista holdes ærlig av en test i begge retninger: hvert oppslag må faktisk brukes i minst én stegtekst, og en vaktliste over kjente fagord kan ikke dukke opp i tekstene uten å ha et oppslag. Den kan altså ikke bli utdatert i stillhet når tekstene endres."
    ],
    "changes_en": [
      "A new glossary in the user manual. The step texts have always leaned on baking language without explaining any of it — measured across every method and type, \"dough ball\" appeared 275 times, \"gluten\" 106, \"autolyse\" 20, without a single one of those words being defined anywhere in the app. The fourteen most important are now explained, starting with the dough ball: it is the unit the whole app counts in.",
      "\"Oven spring\" stood in English in the middle of Norwegian text. It now uses the Norwegian word, with the baking term in brackets the first time — you get your own language, and can still recognise the expression when you meet it elsewhere.",
      "\"The cover/deck\" meant two entirely different things in the same app: covering the bowl with a lid, and the stone the pizza sits on in the oven. The latter is now called the baking deck.",
      "The glossary is kept honest by a test in both directions: every entry must actually be used in at least one step text, and a watch list of known jargon cannot appear in the texts without having an entry. So it cannot go out of date quietly when the texts change."
    ]
  },
  {
    "v": "0.788",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Du kan nå velge hvor langt du må vinke. Tre valg dukker opp i Fokus når vinkestyringen er på: Kort, Normal og Lang. Bytt midt i en bakst og kjenn forskjellen med en gang — du trenger ikke velge riktig på forhånd.",
      "Standarden er senket. Før måtte hånden krysse rundt 41 % av bildet ved vanlig vinketempo; nå holder det med 31 %. Kort krever bare 19 % — under halvparten av det gamle kravet.",
      "Grunnen til at det er trygt: fire scenarier som aldri skal utløse noe — noen som går forbi i fem sekunder, en hånd som skjelver på stedet, en hånd som strekker seg inn og ut, og en kort nøling fram og tilbake — gikk klar selv ved en terskel langt under den nye. Det er støygulvet i bildet som holder tilfeldig bevegelse ute, ikke kravet til hvor langt du vinker. Kravet kostet altså treffsikkerhet uten å gi beskyttelse tilbake.",
      "Lang er nøyaktig den gamle oppførselen, og den blir stående. Målingene er gjort på en syntetisk hånd på et rent bilde — mel på benken, folk som går forbi og skiftende lys finnes ikke i en testrigg. Opplever du at noe utløser seg selv, har du et sted å gå tilbake til."
    ],
    "changes_en": [
      "You can now choose how far you have to wave. Three options appear in Focus when wave control is on: Short, Normal and Long. Switch mid-bake and feel the difference right away — you don't have to pick correctly up front.",
      "The default has been lowered. Before, your hand had to cross about 41 % of the frame at a normal waving pace; now 31 % is enough. Short needs only 19 % — less than half the old requirement.",
      "Why that is safe: four scenarios that should never trigger anything — someone walking past over five seconds, a hand shaking in place, a hand reaching in and out, and a short back-and-forth hesitation — all stayed clear even at a threshold far below the new one. It is the noise floor in the image that keeps random movement out, not the requirement for how far you wave. The requirement was costing accuracy without buying protection.",
      "Long is exactly the old behaviour, and it stays. The measurements were made with a synthetic hand on a clean image — flour on the counter, people walking past and changing light do not exist in a test rig. If something triggers on its own, you have somewhere to go back to."
    ]
  },
  {
    "v": "0.787",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny valgmulighet under Poolish: hvor mye av melet som forgjæres. 50 % er som før — mest aroma og mest strekkbar deig. 30 % er der de fleste publiserte oppskriftene ligger: sterkere gluten, mildere smak, og kortere temperering (2 timer mot 3).",
      "Vanntemperaturen regnes nå av en varmebalanse i stedet for bakerformelen appen brukte før. Den gamle formelen hadde ikke noe ledd for fordeigen, og en fordeig er halve deigen — målt over åtte metoder traff den eksakt på hver metode uten fordeig og bommet på hver eneste metode med. Nå lander alle på 23 grader. Direktedeig får samme anbefaling som før.",
      "Et varmt kjøkken fikk også feil svar før: ved 26°C rom foreslo den gamle formelen 9°C vann, som i praksis gir 20 graders deig. Formelen vektet rom, mel og vann likt, men vannet er rundt 60 % av varmen i en deig. Riktig svar er 14°C.",
      "«Deigtemperatur: 22–24°C» sto som en fast setning i blandesteget, uansett hva planen faktisk ville gi. Nå står tallet appen leverer — og der fysikken ikke rekker fram, som en romtemperert poolish i et 26-graders kjøkken, sier setningen det og peker på den spaken som faktisk flytter tallet."
    ],
    "changes_en": [
      "New choice under Poolish: how much of the flour is pre-fermented. 50 % is as before — most aroma and the most extensible dough. 30 % is where most published recipes sit: stronger gluten, milder flavour, and a shorter warm-up (2 hours instead of 3).",
      "The water temperature is now calculated from a heat balance instead of the baker's formula the app used before. The old formula had no term for the preferment, and a preferment is half the dough — measured across eight methods it hit exactly on every method without one and missed on every single method with one. Now they all land at 23 degrees. Direct dough gets the same recommendation as before.",
      "A warm kitchen got the wrong answer too: at 26°C room the old formula suggested 9°C water, which in practice gives a 20-degree dough. The formula weighted room, flour and water equally, but water is around 60 % of the heat in a dough. The right answer is 14°C.",
      "\"Dough temperature: 22–24°C\" was a fixed sentence in the mixing step, regardless of what the plan would actually give. Now it states the figure the app delivers — and where the physics falls short, such as a room-temperature poolish in a 26-degree kitchen, the sentence says so and points at the lever that actually moves the number."
    ]
  },
  {
    "v": "0.786",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kjøleskaps-poolish kunne bare begynne på fire klokkeslett i døgnet, og det var grunnen til at Smart-plan stadig foreslo oppstart midt på natta. Både poolishtiden og kjøleskapstiden gikk i seks-timerssteg, og to seks-timersrutenett summerer til ett seks-timersrutenett — så uansett hvor mange kombinasjoner planleggeren prøvde, fantes det bare fire ruter å velge mellom.",
      "Poolishtiden går nå i tre-timerssteg. Målt på steketid fredag kl. 19: før fantes 05:40, 11:40, 17:40 og 23:40 — bare to av dem brukbare. Nå er det åtte tidspunkt, fem av dem på dagtid. Lørdag og onsdag går fra tre brukbare til seks.",
      "Ingen ny kalibrering var nødvendig: gjærkurven for kald poolish regner mellom timene fra før, så 15 og 21 timer har allerede riktige tall."
    ],
    "changes_en": [
      "A fridge poolish could only start at four times of day, and that was why Smart plan kept suggesting you begin in the middle of the night. Both the poolish time and the fridge time moved in six-hour steps, and two six-hour grids add up to one six-hour grid — so no matter how many combinations the planner tried, there were only four slots to choose from.",
      "The poolish time now moves in three-hour steps. Measured for a Friday 7pm bake: before there were 05:40, 11:40, 17:40 and 23:40 — only two of them usable. Now there are eight times, five of them during the day. Saturday and Wednesday go from three usable to six.",
      "No new calibration was needed: the yeast curve for cold poolish already interpolates between the hours, so 15 and 21 hours already have the right numbers."
    ]
  },
  {
    "v": "0.785",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kjøleskapspausen hadde nøyaktig samme feil som kjøleskaps-poolishen: en romtemperert poolish som har stått kaldt, er like kald i det den går i maskinen. Målt til 12,7°C ferdig deig mot de 22–24 planen oppgir. Pausen får nå det samme tempereringssteget, og tiden tas av pausen i stedet for å legges oppå — velger du 12 timers pause, står poolishen 9 timer kaldt og 3 timer på benken.",
      "Etter de to siste rettelsene lander kald poolish på 22,1°C mot 12,7 før. Fem av åtte metoder treffer nå båndet appen selv oppgir, mot tre før."
    ],
    "changes_en": [
      "The fridge pause had exactly the same flaw as the fridge poolish: a room-temperature poolish that has been sitting cold is just as cold when it goes into the mixer. Measured at 12.7°C finished dough against the 22–24 the plan states. The pause now gets the same warm-up step, and the time is taken from the pause rather than added on top — choose a 12-hour pause and the poolish sits 9 hours cold and 3 hours on the counter.",
      "After the last two fixes, cold poolish lands at 22.1°C against 12.7 before. Five of eight methods now hit the band the app itself states, up from three."
    ]
  },
  {
    "v": "0.784",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kjøleskaps-poolishen sto oppført som ett steg på kjøkkenbenken, selv om den tilbringer det meste av tiden i kjøleskapet. Det var ikke bare en etikett: motoren leser nettopp det feltet for å vite hvor kaldt deigen har det. Alle 18 timene ble derfor regnet som romtemperatur, og med gjærtesten på ga det omtrent halv gjærmengde — målt til 27,4 timer gjæringsbelastning der riktig svar er 14,3.",
      "Poolishen er nå delt i de tre fasene den faktisk har: halvannen time framme på benken, så kjøleskapet, så temperering. Blandetidspunktet og resten av planen står stille — fasene er de samme timene, bare plassert der deigen virkelig står.",
      "Nytt steg: ta poolishen ut av kjøleskapet før du blander. Uten det går to tredeler av deigmassen kald i maskinen, og ferdig deig lander rundt 13°C i stedet for de 22–24 oppskriften oppgir. Det kan ikke rettes med varmere vann — når poolishen er halvparten av melet, er det bare noen få desiliter vann igjen å skru på. Tempereringstiden tas av poolishens egne timer, så planen blir ikke lengre av å bli riktig.",
      "Poolish som allerede står kaldt får ikke lenger et eget «kjøleskapspause»-steg oppå kjøleskapsfasen. Tidene er de samme; det er bare ett kjøleskap, så det vises som ett."
    ],
    "changes_en": [
      "The fridge poolish was listed as a single step on the kitchen counter, even though it spends most of its time in the fridge. That was not just a label: the engine reads exactly that field to know how cold the dough is. All 18 hours were therefore counted as room temperature, and with the yeast test on that gave roughly half the yeast — measured at 27.4 hours of fermentation load where the correct answer is 14.3.",
      "The poolish is now split into the three phases it actually has: an hour and a half out on the counter, then the fridge, then warming up. The mixing time and the rest of the plan stay put — the phases are the same hours, only placed where the dough really stands.",
      "New step: take the poolish out of the fridge before you mix. Without it two thirds of the dough mass goes into the mixer cold, and the finished dough lands around 13°C instead of the 22–24 the recipe states. Warmer water cannot fix it — when the poolish is half the flour, only a few decilitres of water are left to adjust. The warm-up time is taken from the poolish's own hours, so the plan does not get longer by becoming right.",
      "A poolish that is already sitting cold no longer gets a separate \"fridge pause\" step on top of the fridge phase. The times are the same; there is only one fridge, so it shows as one."
    ]
  },
  {
    "v": "0.783",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Vinkestyringen i Fokus var vanskelig å treffe, og målingen viste hvorfor: kravet var i praksis fartsavhengig. En rask flick på 0,4 sekunder trengte at hånda krysset 41 % av bildet, et vink på 0,7 sekunder trengte 59 %, ett sekund trengte 81 % — og over ~1,2 sekunder var det umulig å treffe uansett hvor stort du vinket. Den som bommet, vinket instinktivt større og roligere. Det gjorde vondt verre.",
      "To årsaker, begge fikset. Sporet ble klippet av et 700 millisekunders rullerende vindu — nå klippes det av at bevegelsen snur retning, så et rolig, stort vink er like treffsikkert som en rask flick: reisen er den samme, den tar bare lengre tid. Og rolig bevegelse flytter hånda under én piksel per frame i den nedskalerte analysen, så signalet druknet i støygulvet — nå sammenlignes bildet også mot en kvart sekund gammel referanse, som lar rolig bevegelse samle seg opp til tydelig signal.",
      "Etter fiksene treffer vink på 41 % av bildet i hele spennet fra rask flick til halvannet sekunds rolig sveip. En stille scene og sakte forbipasserende utløser fortsatt ingenting — støygulvet står urørt, målt med fem sekunders drift over hele bildet.",
      "Underveis ble to mellomløsninger målt og forkastet: én gammel referanse alene ødela den raske flicken (håndas «spøkelse» smørte målingen), og fritt valg av referanse per bilde rev sporet midt i vinket. Løsningen er at referansen låses når sporet starter."
    ],
    "changes_en": [
      "The wave control in Focus was hard to hit, and measurement showed why: the requirement was effectively speed-dependent. A quick 0.4-second flick needed the hand to cross 41% of the frame, a 0.7-second wave needed 59%, one second needed 81% — and beyond ~1.2 seconds it was impossible no matter how big you waved. Whoever missed would instinctively wave bigger and slower. That made it worse.",
      "Two causes, both fixed. The track was clipped by a 700-millisecond rolling window — it is now clipped by the motion reversing direction, so a calm, large wave is exactly as reliable as a quick flick: the travel is the same, it just takes longer. And calm motion moves the hand less than one pixel per frame in the downscaled analysis, so the signal drowned in the noise floor — the image is now also compared against a quarter-second-old reference, which lets calm motion accumulate into a clear signal.",
      "After the fixes, waves crossing 41% of the frame register across the whole range from quick flick to a one-and-a-half-second calm sweep. A still scene and slow passers-by still trigger nothing — the noise floor is untouched, verified with a five-second drift across the entire frame.",
      "Two intermediate solutions were measured and discarded along the way: an old reference alone broke the quick flick (the hand's \"ghost\" smeared the measurement), and choosing the reference freely per frame tore the track mid-wave. The solution is that the reference locks when the track starts."
    ]
  },
  {
    "v": "0.782",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Treffer ingen av Smart-plan-forslagene, sier appen nå fra om det finnes et tidspunkt like ved som treffer: «Stek heller man kl. 18:30 — da treffer alt innenfor tiden din.» Målt på et ekte søk: ved 18:00 fantes ingen konfliktfri kandidat, ved 18:30 gikk alt opp — en halvtime unna, og appen sa ingenting. Du måtte finne det ved prøving. Mekanismen har eksistert i tidsplan-varslene siden v0.753 («Spis … i stedet»); nå finnes den der tidspunktet faktisk velges.",
      "Forslaget er verifisert, ikke gjettet: appen prøver nærliggende steketider (±3 timer, nærmeste først, aldri i fortid, aldri natt) og foreslår bare et tidspunkt der søket faktisk gir null konflikter. Finnes ingen slik tid, vises ingenting — samme regel som kjøleskapspausen og melknappen fikk tidligere.",
      "Ett trykk på forslaget setter feltene og kjører søket på nytt — samme vei som å endre tiden selv, så feltene og resultatet kan aldri vise hver sin sannhet.",
      "Og Smart-plan-kortene bruker nå samme rangeringsspråk som Fra–til: «✓ Beste alternativ» over vinneren, «eller dette valget» som skille foran hvert av de neste. To steder som gjør samme jobb ser nå like ut."
    ],
    "changes_en": [
      "When none of the Smart plan suggestions fit, the app now tells you if a nearby time does: \"Bake Mon 18:30 instead — then everything lands within your time.\" Measured on a real search: at 18:00 no conflict-free candidate existed, at 18:30 everything worked — half an hour away, and the app said nothing. You had to find it by trial. The mechanism has existed in the schedule warnings since v0.753 (\"Eat at … instead\"); now it exists where the time is actually chosen.",
      "The suggestion is verified, not guessed: the app probes nearby bake times (±3 hours, nearest first, never in the past, never at night) and only proposes a time where the search actually yields zero conflicts. If no such time exists, nothing is shown — the same rule the cold pause and the flour button got earlier.",
      "One tap on the suggestion sets the fields and reruns the search — the same path as changing the time yourself, so the fields and the result can never tell different truths.",
      "And the Smart plan cards now use the same ranking language as From–to: \"✓ Best option\" above the winner, \"or this option\" as a divider before each of the rest. Two places doing the same job now look the same."
    ]
  },
  {
    "v": "0.781",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Reduser hevetiden»-knappen i melvarselet gjorde ingenting i situasjonen der den oftest vises. Målt: Langtidsdeig med Caputo Doppio Zero — målet krever 18 timers kjøletid, metodens minimum er 24, så koden klampet tilbake til verdien du allerede sto på. Trykket tegnet planen på nytt, ellers null. Knappen vises nå bare når justeringen faktisk lander innenfor melets spenn — samme regel som kjøleskapspausen fikk i v0.776. Kan den ikke levere, står de ærlige valgene igjen: bytt mel eller bytt metode.",
      "En regnefeil på motsatt side rettet i samme slengen: «Øk hevetiden» rundet ned til nærmeste 6 timer og kunne lande under melets minimum — en økning som ikke økte nok. For kort tid rundes nå opp, for lang tid ned.",
      "Og roten: Fra–til-velgeren sjekket aldri melet ditt. Den tilbød Poolish, Biga og Langtidsdeig med «Bruk denne» selv når alle tre lå over det valgte melets tåleevne — og melvarselet skjente i det du landet på tidsplanen. Kortene priser nå melet før du velger: «🌾 27t over det Caputo Doppio Zero er ment for». Med et mel som tåler tiden, står det ingenting.",
      "Prisen avslører noe nyttig: med et svakt mel kan «Beste alternativ» være det dårligste valget for melet ditt — og det korteste kortet det eneste uten konflikt. Nå ser du det på kortene, ikke i et varsel etterpå."
    ],
    "changes_en": [
      "The \"Reduce rise time\" button in the flour warning did nothing in the situation where it most often appears. Measured: Long-ferment dough with Caputo Doppio Zero — the target requires 18 hours of cold time, the method's minimum is 24, so the code clamped back to the value you were already on. The press re-rendered the plan, otherwise nothing. The button now only appears when the adjustment actually lands within the flour's range — the same rule the cold pause got in v0.776. If it cannot deliver, the honest choices remain: switch flour or switch method.",
      "A rounding error on the opposite side fixed in the same pass: \"Increase rise time\" rounded down to the nearest 6 hours and could land below the flour's minimum — an increase that didn't increase enough. Too short now rounds up, too long rounds down.",
      "And the root: the From–to picker never checked your flour. It offered Poolish, Biga and Long-ferment with \"Use this\" even when all three exceeded the selected flour's tolerance — and the flour warning scolded you the moment you landed on the schedule. The cards now price the flour before you choose: \"🌾 27h beyond what Caputo Doppio Zero is meant for\". With a flour that handles the time, nothing is shown.",
      "The price reveals something useful: with a weak flour, the \"Best option\" can be the worst choice for your flour — and the shortest card the only one without a conflict. You now see that on the cards, not in a warning afterwards."
    ]
  },
  {
    "v": "0.780",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fra–til foreslår ikke lenger oppstart på tider du ikke er ledig. Plasseringssøket brukte bare den faste natt-regelen (23–06) — mens Pizzatid, planen din over når du faktisk kan drive med pizza, lå ubrukt rett ved siden av. Nå letes det først etter en plassering der både «begynn» og «stek» ligger innenfor Pizzatid; natt-regelen er bare reserven. Med Pizzatid avslått er alt som før.",
      "Samme regel for «start tidligere»-forslagene på metodene som ikke får plass: en foreslått start utenfor Pizzatid skyves til siste ledige tidspunkt i planen din — tidligere start er alltid gyldig, så det koster ingenting.",
      "«Den trengte oppstart søn kl. 02:40» er borte. Et klokkeslett som både er passert og midt på natta er dobbelt ubrukelig. Nå står det hvor mye for sent du er ute: «den måtte vært i gang for 8t 25m siden» — relativt, sant uansett når du leser det.",
      "Og underteksten «samme klokkeslett, senere dag» — som kunne leses som «senere i dag» — er byttet med svaret på kortets eget spørsmål: «da rekker den»."
    ],
    "changes_en": [
      "From–to no longer suggests starting at times you are not available. The placement search only used the fixed night rule (23–06) — while Pizzatid, your plan for when you can actually do pizza work, sat unused right next to it. It now first looks for a placement where both \"begin\" and \"bake\" fall within Pizzatid; the night rule is only the fallback. With Pizzatid off, everything behaves as before.",
      "The same rule applies to the \"start earlier\" suggestions on methods that don't fit: a proposed start outside Pizzatid is pushed to the latest available time in your plan — starting earlier is always valid, so it costs nothing.",
      "\"It needed to start Sun at 02:40\" is gone. A time that is both in the past and in the middle of the night is doubly useless. It now says how late you are: \"it needed to be underway 8h 25m ago\" — relative, and true whenever you read it.",
      "And the subtext \"same time, a later day\" — which could be read as \"later today\" — is replaced with the answer to the card's own question: \"that's enough time\"."
    ]
  },
  {
    "v": "0.779",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fra–til stiller nå to spørsmål med ren tekst: «Når vil du begynne å lage deigen?» og «Når vil du steke?» — i stedet for etikettene «Jeg kan tidligst starte» og «Jeg vil steke».",
      "Og kortene svarer på spørsmålene med samme ord, som første linje: «Begynn søn kl. 14:40 → stek tir kl. 18:00». Tidene er kandidatens faktiske plassering, ikke pynt — for Hurtigdeig-kortet ser du dermed med én gang at valget flytter steketiden til ca. 15:15, noe som før sto lenger ned i liten skrift.",
      "Vinnerkortet bærer «✓ Beste alternativ», og hvert av de neste kortene innledes med et skille: «eller dette valget». Før var fargen på vinnerkortet det eneste som rangerte listen.",
      "Designet er Runes, fra brukertesting — tegnet som skisser først, så bygget."
    ],
    "changes_en": [
      "From–to now asks two plain questions: \"When do you want to start making the dough?\" and \"When do you want to bake?\" — instead of the labels \"I can start at the earliest\" and \"I want to bake\".",
      "And the cards answer the questions in the same words, as their first line: \"Begin Sun 14:40 → bake Tue 18:00\". The times are the candidate's actual placement, not decoration — so on the Quick dough card you immediately see that the choice moves the bake time to about 15:15, which used to sit further down in small print.",
      "The winning card carries \"✓ Best option\", and each following card is introduced with a divider: \"or this option\". Previously the winner's colour was the only thing ranking the list.",
      "The design is Rune's, from user testing — sketched first, then built."
    ]
  },
  {
    "v": "0.778",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nattkortene i Fra–til ledet fortsatt med natta. v0.777 fikset utveiene, men hovedforslaget på kortet var «Oppstart tir kl. 01:40 🌙» — mens den fornuftige plasseringen sto nedgradert i en stiplet boks under. Nå er rekkefølgen snudd: kortet leder med «Oppstart man kl. 22:55 · klar tir kl. 15:15», og natt-varianten er sekundæren: «Vil du ha den klar nøyaktig 18:00? Da må du starte 01:40 — midt på natten.» Begge fortsatt ett trykk.",
      "Og appen snakket mot seg selv: velgeren tilbød Hurtigdeig med «Bruk denne» og nøytralt «38t 40m ubrukt» — hvorpå tidsplanen skjente «passer dårlig, resten av tiden går til spille» og anbefalte Langtidsdeig. En annen metode enn velgerens egen vinner, til og med. Appen inviterte til et valg, kjeftet for at du takket ja, og anbefalte så noe tredje.",
      "Nå sier begge stedene det samme, og de sier det FØR du velger: kortet priser slakket med varselets egne ord — «39t 10m går til spille — mer smak med Poolish» — og peker på velgerens faktiske vinner, ikke en hardkodet metode.",
      "Selve varselet tier i Fra–til-modus, der velgeren er autoriteten og prisen allerede står på kortet. I Steketid-modus, der Hurtigdeig kan være valgt manuelt uten at noen pris er vist, står varselet som før."
    ],
    "changes_en": [
      "The night cards in From–to still led with the night. v0.777 fixed the escapes, but the card's main proposal was \"Start Tue 01:40 🌙\" — while the sensible placement sat demoted in a dashed box below. The order is now flipped: the card leads with \"Start Mon 22:55 · ready Tue 15:15\", and the night variant is the secondary: \"Want it ready exactly at 18:00? Then you have to start at 01:40 — in the middle of the night.\" Both still one tap.",
      "And the app argued with itself: the picker offered Quick dough with \"Use this\" and a neutral \"38h 40m unused\" — whereupon the schedule scolded \"poor fit, the rest of the time is wasted\" and recommended Long-ferment dough. A different method than the picker's own winner, no less. The app invited a choice, told you off for accepting, and then recommended a third thing.",
      "Both places now say the same thing, and they say it BEFORE you choose: the card prices the slack in the warning's own words — \"39h 10m goes to waste — more flavour with Poolish\" — and points at the picker's actual winner, not a hardcoded method.",
      "The warning itself stays quiet in From–to mode, where the picker is the authority and the price is already on the card. In Bake-time mode, where Quick dough may have been chosen manually with no price shown, the warning stands as before."
    ]
  },
  {
    "v": "0.777",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fra–til-forslagene var ren regning mot vinduskantene: start nøyaktig så mye tidligere som det mangler, eller stek nøyaktig så mye senere. Målt på et ekte vindu foreslo de «Start lør kl. 22:10» — i går — og «Stek tir kl. 01:50» — pizza midt på natta. Appen har både nattbegrepet og «starter-før-nå er ikke en løsning»-regelen andre steder; her gjaldt ingen av dem.",
      "Nå må «Start tidligere» være fysisk mulig. Er tidspunktet passert, forsvinner knappen, og det står i stedet ærlig hva som skulle til: «For sent å rekke ved å starte tidligere — den trengte oppstart lør 8. aug kl. 22:10.» Et forslag du ikke kan trykke på uten tidsmaskin er ikke et forslag.",
      "«Stek senere» snapper til ditt eget klokkeslett. I stedet for tir kl. 02:26: «Stek tir 11. aug kl. 18:00 — samme klokkeslett, senere dag.» Senere steking er alltid gyldig, så da velger vi den senere stekingen et menneske faktisk vil ha.",
      "Og «Start heller»-utveien på nattkortene lovet «klar 02:50» — den byttet én natt-vekking mot en annen. Nå letes det etter siste plassering i vinduet der både oppstart og klar-tidspunkt er utenfor natta: «Start heller søn kl. 22:55 — klar man kl. 15:15.» Ett unntak består med vilje: har du selv oppgitt at du er ledig fra 23:30, er 23:30 ikke en natt-vekking appen påfører deg — men klar-tida sjekkes alltid, for den har ingen valgt."
    ],
    "changes_en": [
      "The From–to suggestions were pure arithmetic against the window edges: start exactly as much earlier as is missing, or bake exactly as much later. Measured on a real window they proposed \"Start Sat 22:10\" — yesterday — and \"Bake Tue 01:50\" — pizza in the middle of the night. The app has both the night concept and the \"starting-before-now is not a solution\" rule elsewhere; neither applied here.",
      "\"Start earlier\" now has to be physically possible. If the time has passed, the button disappears, and instead it honestly states what it would have taken: \"Too late to make it by starting earlier — it needed to start Sat 8 Aug at 22:10.\" A suggestion you cannot press without a time machine is not a suggestion.",
      "\"Bake later\" snaps to your own clock time. Instead of Tue 02:26: \"Bake Tue 11 Aug at 18:00 — same time, a later day.\" Baking later is always valid, so we pick the later bake a human actually wants.",
      "And the \"Start earlier instead\" escape on the night cards promised \"ready at 02:50\" — it traded one night wake-up for another. It now searches for the last placement in the window where both the start and the ready time are outside the night: \"Start Sun 22:55 instead — ready Mon 15:15.\" One exception remains on purpose: if you yourself said you are free from 23:30, then 23:30 is not a night wake-up the app imposes on you — but the ready time is always checked, because nobody chose that."
    ]
  },
  {
    "v": "0.776",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Varselet om at et steg havner i natta tilbød to like oransje knapper og oppførte seg som om en av dem var fasiten. Det er den ikke. Målt på en poolish med Caputo Doppio Zero: uansett hvilken du trykker, blir planen liggende 13–17 timer over det melet er ment for. Problemet er ikke løsbart — det er bare flyttbart. Nå står det øverst i kortet, i stedet for at en fylt knapp antyder at planen blir hel.",
      "Og «Flytt til …» hadde en pris ingen kunne se: gjæren gikk fra 0,74 g til 1,35 g. Kortere heving må kompenseres med mer gjær, og appen regnet det om i stillhet mens knappen bare snakket om klokkeslett. Du trodde du flyttet en tid — du endret oppskriften. Nå står den endringen på knappen, med begge tallene.",
      "Hvert valg oppgir nå prisen sin på tre akser: tid, mel og deig. Pluss for det du vinner, minus for det du gir, likhetstegn for det som står stille. «Deigen er uendret — samme gjær, samme gjæringstid» er like mye informasjon som «+82 % gjær», og det viste seg å være kjøleskapspausens største fordel — noe som aldri har stått noe sted.",
      "Kjøleskapspausen tilbys ikke lenger når ingen pauselengde hjelper. Den valgte beste av 6, 12 og 18 timer, men null var ikke et alternativ, så den satte alltid inn en pause. Brukte du den på en plan som allerede gikk opp, gikk konfliktene fra 0 til 4 — knappen var en felle, ikke en utvei. Bryteren under Planlegging gir fortsatt en ekte pause når du selv ber om en."
    ],
    "changes_en": [
      "The warning that a step lands at night offered two identical orange buttons and behaved as though one of them was the answer. It is not. Measured on a poolish with Caputo Doppio Zero: whichever you press, the plan stays 13–17 hours beyond what the flour is meant for. The problem is not solvable — only movable. That now says so at the top of the card, instead of a filled button implying the plan can be made whole.",
      "And \"Move to …\" had a price nobody could see: the yeast went from 0.74 g to 1.35 g. A shorter rise has to be compensated with more yeast, and the app recalculated it silently while the button only talked about clock times. You thought you were moving a time — you were changing the recipe. That change is now stated on the button, with both numbers.",
      "Every option now states its price on three axes: time, flour and dough. Plus for what you gain, minus for what you give, equals for what stays put. \"The dough is unchanged — same yeast, same fermentation time\" is just as much information as \"+82% yeast\", and it turned out to be the cold pause's biggest advantage — something that had never been stated anywhere.",
      "The cold pause is no longer offered when no pause length helps. It picked the best of 6, 12 and 18 hours, but zero was not an option, so it always inserted one. Used on a plan that already worked out, conflicts went from 0 to 4 — the button was a trap, not a way out. The switch under Planning still gives you a real pause when you ask for one yourself."
    ]
  },
  {
    "v": "0.775",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Deigballen het fire forskjellige ting på norsk. «Emne» 75 ganger, «ball» 4, «kule» 6 — og «bolle» 30, men det siste er blandebolla, altså en helt annen gjenstand. Nå heter den «emne» overalt.",
      "Verst var Mania-poolish, som i én og samme setning skrev «lag en stram, rund bolle. Legg i bakebolle eller lignende». Samme ord om deigen og om kara den legges i, fire ord fra hverandre — i en metode som ellers sier «Hell poolish i bollen». Steget het «Form til bolle → romtemperatur» og heter nå «Form til emne → romtemperatur».",
      "«Kule» sto i forklaringen til Langtidsdeig, Poolish og Biga: «en løs, dårlig rundet kule flyter utover» — rett under steg som kalte det samme et emne. Engelsken var forresten konsekvent hele veien; det var bare norsken som spriket.",
      "En invariant holder det slik. Den morsomme biten er «bolle»: ordet kunne ikke forbys, for det er jo redskapet 28 steder. Regelen er derfor at «bolle» aldri får stå som noe du former — et rent forbud ville tvunget fram feil løsning, nemlig å døpe om blandebolla.",
      "Dette er forarbeid til ordlista som skal komme. En ordliste som forklarer «emne» mens tekstene sier «ball» og «bolle» hjelper ingen; nå finnes det ett ord å slå opp."
    ],
    "changes_en": [
      "The dough ball had four different names in Norwegian. \"Emne\" 75 times, \"ball\" 4, \"kule\" 6 — and \"bolle\" 30, but that last one is the mixing bowl, an entirely different object. It is now \"emne\" everywhere.",
      "The worst offender was Mania poolish, which in one single sentence wrote \"shape a tight, round bolle. Place in a baking bolle or similar\". The same word for the dough and for the vessel it goes into, four words apart — in a method that elsewhere says \"pour the poolish into the bollen\". The step was called \"Shape into a bolle → room temperature\" and is now \"Shape into an emne → room temperature\".",
      "\"Kule\" appeared in the explanation for Long-ferment, Poolish and Biga: \"a loose, poorly rounded kule spreads out\" — right below steps calling the same thing an emne. The English text was consistent throughout, as it happens; only the Norwegian drifted.",
      "An invariant keeps it that way. The interesting part is \"bolle\": the word could not simply be banned, since it is the actual bowl in 28 places. The rule is therefore that \"bolle\" may never be something you shape — a flat ban would have forced the wrong fix, namely renaming the mixing bowl.",
      "This is groundwork for the glossary to come. A glossary explaining \"emne\" while the texts say \"ball\" and \"bolle\" helps nobody; now there is one word to look up."
    ]
  },
  {
    "v": "0.774",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Fikk bare biga som alternativ.» Målt, og det stemte: for et søk en uke frem var topp tre Biga 48t, Biga 46t og Biga 44t — mens Poolish 43t og Langtidsdeig 25t lå gjemt rett under på plass 4 og 6. Søket prøver hver metode i mange kombinasjoner, så de nest beste treffene er nesten alltid vinnerens egne naboer med to timers forskjell og et par hundredels gram gjær.",
      "Samme metode minus to timer er ikke et alternativ. Kortene viser nå beste kandidat per metode: vinneren kåres nøyaktig som før, men alternativkortene er andre metoder — reelle valg med annen arbeidsflyt. For søket over blir kortene Biga 48t (anbefalt), Poolish 43t og Langtidsdeig 25t. Har du skrudd av alt unntatt én metode, fylles kortene med tidsvarianter som før.",
      "Med ulike metoder på kortene kunne teksten «gjærmengden er den eneste som skiller» blitt usann — Mania-poolish følger sin egen publiserte oppskrift med annet vann og salt. Teksten leser nå av kortene: står Mania der, sier den det i stedet for å påstå noe annet.",
      "Og en liten en: resultatblokka ligger over metodelista og skifter høyde når vinneren skifter. Da gled filteret du sto og trykket i, noen titalls piksler — selv om rullingen sto stille. Nå er det filterets posisjon på skjermen som holdes fast, ikke rulletallet."
    ],
    "changes_en": [
      "\"Only got biga as an alternative.\" Measured, and it was true: for a search one week out, the top three were Biga 48h, Biga 46h and Biga 44h — while Poolish 43h and Long-ferment 25h sat hidden just below at places 4 and 6. The search tries each method in many combinations, so the runners-up are almost always the winner's own neighbours, two hours apart with a few hundredths of a gram of yeast between them.",
      "The same method minus two hours is not an alternative. The cards now show the best candidate per method: the winner is chosen exactly as before, but the alternative cards are other methods — real choices with a different workflow. For the search above the cards become Biga 48h (recommended), Poolish 43h and Long-ferment 25h. If you have switched off everything except one method, the cards fill with time variants as before.",
      "With different methods on the cards, the line \"the amount of yeast is the only difference\" could become false — Mania poolish follows its own published recipe with different water and salt. The text now reads the cards: if Mania is there, it says so instead of claiming otherwise.",
      "And a small one: the result block sits above the method list and changes height when the winner changes. That made the filter you were tapping drift a few dozen pixels — even though the scroll stood still. It is now the filter's position on screen that is held fixed, not the scroll number."
    ]
  },
  {
    "v": "0.773",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«772 fortsatt grå.» Og det stemte — men knappen VAR oransje. Den sto bak et slør: helt siden appens første versjon har alle faner ligget under 85 % gråtone og nedsatt kontrast til du gjør din første endring i Planlegging. Fiksene i v0.772 var ekte, de var bare ikke synlige gjennom filteret. Målingen min gikk rett gjennom sløret og sa «oransje», skjermen din sa grå. Skjermen hadde rett.",
      "Sløret er ment som et hint: «planen du ser er en plassholder til du velger». Men Smart-plan er selve stedet man velger — å gråtone døra inn er samme feil som den grå søkeknappen, bare ett lag opp. Smart-plan er nå unntatt sløret og står alltid i fulle farger.",
      "Verre: ingenting du gjorde i Smart-plan telte som «din første endring». Du kunne søke, sammenligne og trykke «Åpne planen →» — et valg så reelt som noe — og resten av appen, selve Tidsplanen du nettopp åpnet, ble stående i gråtone. Nå teller Smart-plan som første interaksjon, og sløret løftes for hele appen.",
      "Testen som skal hindre gjentagelse måler ikke knappens egen farge — den sjekker hele forfedrekjeden for filtre. Det var sånn feilen gjemte seg: fargemålinger ser tvers gjennom et gråtonefilter på en forelder."
    ],
    "changes_en": [
      "\"772 still grey.\" And that was true — but the button WAS orange. It stood behind a veil: ever since the app's first version, every tab has sat under 85% greyscale and reduced contrast until you make your first change in Planning. The v0.772 fixes were real, they just weren't visible through the filter. My measurement went straight through the veil and said \"orange\"; your screen said grey. The screen was right.",
      "The veil is meant as a hint: \"the plan you see is a placeholder until you choose\". But Smart plan is where you choose — greying out the entrance is the same mistake as the grey search button, one layer up. Smart plan is now exempt from the veil and always shows in full colour.",
      "Worse: nothing you did in Smart plan counted as \"your first change\". You could search, compare and press \"Open the plan →\" — as real a choice as any — and the rest of the app, the very Schedule you just opened, stayed greyed. Smart plan now counts as a first interaction, and the veil lifts for the whole app.",
      "The test guarding against a repeat does not measure the button's own colour — it checks the whole ancestor chain for filters. That is how the bug hid: colour measurements see straight through a greyscale filter on a parent."
    ]
  },
  {
    "v": "0.772",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Finn oppskriften» var grå. Den var grå fordi den ventet på at du skulle røre klokka eller datoen — men den har hele tiden vært trykkbar, og begge feltene har alltid hatt gyldige verdier. Grått på en knapp som virker er ikke et hint, det er fargen alle andre grensesnitt bruker for «denne gjør ingenting». Nå er den oransje støtt.",
      "Da jeg målte, viste det seg å være verre enn meldt inn. Knappen skiftet farge — og glemte det igjen. Panelet nullstiller veiledningen hver gang fanen åpnes, så du kunne sette datoen, se den bli oransje, gå til Planlegging, komme tilbake, og finne den grå med datoen fortsatt satt. Den grå var altså ikke unntaket, den var det du så nesten hver gang.",
      "Og skjermen var ikke bare «litt grå»: null flater i aksentfarge av 35 elementer før du søker. Veiledningen ligger fortsatt i det lille glødet på klokkefeltet, som peker på hva du kan gjøre uten å påstå at knappen er død.",
      "«Åpne planen →» på alternativforslagene var en gjennomsiktig omriss-knapp. På krem bakgrunn leses det som tomt, ikke som «nummer to». De har fått et dempet oransje fyll. Vinneren er fortsatt den eneste med full farge, så rekkefølgen er like tydelig."
    ],
    "changes_en": [
      "\"Find the recipe\" was grey. It was grey because it was waiting for you to touch the clock or the date — but it has always been clickable, and both fields have always held valid values. Grey on a button that works is not a hint, it is the colour every other interface uses for \"this does nothing\". It is now orange at all times.",
      "When I measured it, it turned out to be worse than reported. The button did change colour — and then forgot again. The panel resets the guidance every time the tab is opened, so you could set the date, watch it turn orange, go to Planning, come back, and find it grey with the date still set. Grey was not the exception; it was what you saw almost every time.",
      "And the screen was not merely \"a bit grey\": zero accent-coloured surfaces out of 35 elements before you search. The guidance still lives in the small glow on the clock field, which points at what you can do without claiming the button is dead.",
      "\"Open the plan →\" on the alternative suggestions was a transparent outline button. On a cream background that reads as empty, not as \"runner-up\". They now have a muted orange fill. The winner is still the only one with the full colour, so the ranking is just as clear."
    ]
  },
  {
    "v": "0.771",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Brukertesting av Smart-plan viste at folk ikke skjønte at det lå ekte oppskrifter bak knappen. Diagnosen var ikke at knappen er utydelig — det STO ingen oppskrift i svaret. Kortene ga metode og timer: «Biga ~48t» tre ganger på rad, uten mel, vann, salt, gjær, emnevekt eller hva slags pizza det blir.",
      "Så jeg målte hva som faktisk skiller forslagene. Over de fire toppkandidatene er type, antall, emnevekt, mel, vann, hydrering og salt identiske. Bare gjæren varierer, og bare med noen tideler. Derfor står oppskriften nå ÉN gang over kortene — «Napoletana · 4 emner à 250g · 🌾 500g mel · 💧 325g vann (65%) · 🧂 15g salt» — og gjærmengden på hvert kort, der forskjellen faktisk er.",
      "Kortene sier nå hva valget betyr i stedet for bare hvor lenge det tar: «Anbefalt», «+4t · mer smak», «-6t · raskere». Og knappen sier hvor du havner: «Åpne planen →» i stedet for «Bruk denne».",
      "Hintet nederst påsto blindt at «alternativene over gir mer smak». Det er bare sant når de er lengre enn vinneren — og vinneren er ofte den lengste. Teksten sto altså rett under tre kort merket «raskere». Den leser nå hva alternativene faktisk er, og sier det.",
      "Og et hopp du meldte inn: huket du av en metode nede i filteret, ble du kastet 803 px opp. Ingenting glemte plassen din — resultatblokka ble bevisst rullet til, og den ligger over metodelista. Nå står du der du står, og resultatblokka blinker kort så du ser at den svarte. Å bare la være å rulle hadde vært halvveis: da oppdateres svaret helt utenfor syne, og du vet ikke om avhakingen gjorde noen forskjell."
    ],
    "changes_en": [
      "User testing of Smart plan showed that people did not realise there were real recipes behind the button. The diagnosis was not that the button is unclear — there was no recipe in the answer. The cards gave method and hours: \"Biga ~48h\" three times in a row, with no flour, water, salt, yeast, ball weight or what kind of pizza it becomes.",
      "So I measured what actually separates the suggestions. Across the four top candidates, type, count, ball weight, flour, water, hydration and salt are identical. Only the yeast varies, and only by tenths of a gram. The recipe therefore now appears ONCE above the cards — \"Napoletana · 4 balls à 250g · 🌾 500g flour · 💧 325g water (65%) · 🧂 15g salt\" — and the yeast on each card, where the difference actually is.",
      "The cards now say what the choice means rather than just how long it takes: \"Recommended\", \"+4h · more flavour\", \"-6h · faster\". And the button says where you end up: \"Open the plan →\" instead of \"Use this\".",
      "The hint at the bottom blindly claimed that \"the alternatives above give more flavour\". That is only true when they are longer than the winner — and the winner is often the longest. So the text sat right under three cards labelled \"faster\". It now reads what the alternatives actually are, and says that.",
      "And a jump you reported: tick a method down in the filter and you were thrown 803 px upwards. Nothing forgot your place — the result block was deliberately scrolled to, and it sits above the method list. Now you stay where you are, and the result block flashes briefly so you can see that it answered. Simply not scrolling would have been half a fix: then the answer updates completely out of sight, and you have no idea whether the tick made any difference."
    ]
  },
  {
    "v": "0.770",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fokus-modus hoppet til toppen hver gang du haket av et understeg. Krysset du av punkt fire i en lang liste, ble du kastet tilbake til starten og måtte rulle ned igjen for å finne punkt fem.",
      "Årsaken var at panelet nullstilte rullingen hver gang det ble tegnet på nytt — og det skjer ved alt som endrer noe: avhaking, og å slå vink eller klapp av og på. Nå nullstilles den bare når du faktisk bytter steg, for da er det en ny tekst å begynne på.",
      "Jeg lette etter det samme andre steder også — Tidsplan, Planlegging, Mer og Smart-plan, hver eneste knapp og avkryssing i hver fane. Der holder rullingen seg allerede.",
      "Ett tilfelle som ser ut som en feil, men ikke er det: velger du en metode langt nede i Planlegging, kan siden bli kortere fordi et panel forsvinner. Da flyttes du opp til den nye bunnen. Det er innholdet som ble mindre, ikke plassen din som ble glemt."
    ],
    "changes_en": [
      "Focus mode jumped to the top every time you ticked off a substep. Tick item four in a long list and you were thrown back to the start, and had to scroll down again to find item five.",
      "The cause was that the panel reset the scroll every time it was redrawn — and that happens on anything that changes: ticking off, and switching waving or clapping on and off. It now resets only when you actually move to another step, because then there is new text to start on.",
      "I looked for the same thing elsewhere too — Schedule, Planning, More and Smart plan, every button and checkbox in every tab. There the scroll position already holds.",
      "One case that looks like a bug but is not: pick a method far down in Planning and the page can get shorter because a panel disappears. You are then moved up to the new bottom. That is the content shrinking, not your place being forgotten."
    ]
  },
  {
    "v": "0.769",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Vinkestyringen har fått en akse til: hånd opp og ned ruller i stegteksten. Et langt steg får ikke plass på skjermen, og da hjalp det lite å kunne bla videre uten å kunne lese ferdig.",
      "Sideveis blar mellom steg som før, opp og ned ruller. Opp betyr opp — som en kommando, ikke som å dra i en skjerm. Sideveis er allerede «høyre er framover», og å blande de to metaforene i samme håndbevegelse ville vært verre enn å velge feil.",
      "En skrå bevegelse gjør ingenting. Med to akser betyr plutselig alt noe, og en diagonal ville blitt en tilfeldig av fire handlinger — så den ene retningen må være tydelig størst, ellers svarer appen ikke. Bedre å la være enn å gjette feil.",
      "Er du allerede nederst i teksten, sier den «↓ alt lest» i stedet for å se ut som om vinket ikke ble oppfattet.",
      "Og prikken som viser hva kameraet ser er nå en liten flate i stedet for en strek, siden den har to retninger å vise."
    ],
    "changes_en": [
      "The wave control has gained another axis: hand up and down scrolls the step text. A long step does not fit on the screen, and being able to move on without being able to finish reading was not much help.",
      "Sideways moves between steps as before, up and down scrolls. Up means up — as a command, not as dragging a screen. Sideways is already “right is forward”, and mixing the two metaphors in the same hand movement would have been worse than picking the wrong one.",
      "A diagonal movement does nothing. With two axes everything suddenly means something, and a diagonal would have become a random one of four actions — so one direction has to be clearly the larger, otherwise the app does not answer. Better to stay silent than to guess wrong.",
      "If you are already at the bottom of the text it says “↓ all read” rather than looking as though the wave went unnoticed.",
      "And the dot showing what the camera sees is now a small pad rather than a line, since it has two directions to show."
    ]
  },
  {
    "v": "0.768",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt i Fokus: bla med klapp. Ett klapp går til neste steg, to klapp til forrige. Det virker når du står med ryggen til, utenfor kameraets synsfelt — og med deig på hendene.",
      "Klapp ble valgt framfor ekte talegjenkjenning med vilje. Talegjenkjenning i nettleseren sender lyden fra kjøkkenet ditt til Apple eller Google. Et klapp trenger ingen sky: appen måler bare lydstyrke, her på telefonen.",
      "Kjøkkenmaskinen din blar ikke. Det som teller er ikke hvor høyt noe er, men at det er et brått smell som faller like fort igjen. En maskin er langt høyere enn et klapp, men den blir stående — og da skjer ingenting. Klapper du mens den går, teller det fortsatt.",
      "Første gang du slår på vink eller klapp får du en forklaring: hva som brukes, at alt regnes ut på telefonen, at ingenting lagres eller sendes, og at begge er av hver gang du åpner appen. Den kommer i det øyeblikket du ber om det — ikke som en advarsel ved oppstart om noe som er avslått."
    ],
    "changes_en": [
      "New in Focus: flip with a clap. One clap moves to the next step, two claps to the previous one. It works when your back is turned, out of the camera's view — and with dough on your hands.",
      "Clapping was chosen over real speech recognition deliberately. Speech recognition in the browser sends the sound from your kitchen to Apple or Google. A clap needs no cloud: the app measures only loudness, here on the phone.",
      "Your stand mixer will not flip the step. What counts is not how loud something is, but that it is a sudden bang that falls away just as fast. A machine is far louder than a clap, but it stays — and then nothing happens. Clap while it runs and it still counts.",
      "The first time you switch on waving or clapping you get an explanation: what is used, that everything is worked out on the phone, that nothing is stored or sent, and that both are off every time you open the app. It comes at the moment you ask for it — not as a startup warning about something that is switched off."
    ]
  },
  {
    "v": "0.767",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Vinkestyringen viser nå at den ser deg. Under stegteksten står en hånd og en tynn stripe: hånden er nedtonet når alt er rolig, lyser opp og vokser når kameraet ser bevegelse, og prikken på stripa følger hånden din i sanntid.",
      "I forrige versjon var bare det som lyktes synlig. Vinket du og ingenting skjedde, visste du ikke om kameraet var dødt, om det ikke så deg, eller om vinket var for lite — og da står man og veiver stadig hardere.",
      "Derfor sier den også fra når den så deg uten at det holdt: «litt større». Det er den beskjeden som lærer deg hvor stort et vink må være.",
      "Og når vinket går gjennom, står det «→ Neste» eller «← Forrige» i stedet for bare en pil, så du vet hvilken vei den oppfattet."
    ],
    "changes_en": [
      "The wave control now shows that it can see you. Below the step text sit a hand and a thin track: the hand is dimmed when everything is still, brightens and grows when the camera sees movement, and the dot on the track follows your hand in real time.",
      "In the previous version only success was visible. If you waved and nothing happened, you had no way to tell whether the camera was dead, whether it could not see you, or whether the wave was too small — and then you just wave harder and harder.",
      "So it also speaks up when it saw you but it was not enough: “a bit bigger”. That is the message that teaches you how big a wave has to be.",
      "And when a wave does go through, it says “→ Next” or “← Previous” rather than just an arrow, so you know which way it read you."
    ]
  },
  {
    "v": "0.766",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt i Fokus-modus: bla mellom stegene ved å vinke, uten å ta på telefonen. Sett telefonen opp mot noe, trykk «👋 Bla med vink» én gang, og vink deretter med hånden — mot høyre for neste steg, mot venstre for forrige. Laget for øyeblikket der hendene er fulle av deig.",
      "Kameraet ser bare etter HVOR i bildet det beveger seg. Hvert bilde krymper til 32 × 24 punkter, sammenlignes med det forrige, og kastes. Ingen bilder lagres, og ingenting sendes noe sted.",
      "Av som standard, og det krever et bevisst trykk å slå på. Kameraet slippes når du slår det av, når du lukker Fokus, og når appen går i bakgrunnen.",
      "Røring i en bolle blar ikke — bevegelsen må komme et sted, ikke bare fram og tilbake. Men en person som går forbi bak deg beveger seg jevnt i én retning og kan se ut som et vink. Det er en kjent begrensning."
    ],
    "changes_en": [
      "New in Focus mode: move between steps by waving, without touching the phone. Prop the phone up, tap “👋 Flip with a wave” once, then wave your hand — to the right for the next step, to the left for the previous one. Made for the moment when your hands are covered in dough.",
      "The camera only looks at WHERE in the picture something moves. Each frame shrinks to 32 × 24 points, is compared with the previous one, and is thrown away. No images are stored, and nothing is sent anywhere.",
      "Off by default, and it takes a deliberate tap to switch on. The camera is released when you switch it off, when you close Focus, and when the app goes into the background.",
      "Stirring a bowl will not flip the step — the movement has to get somewhere, not just go back and forth. But a person walking past behind you moves steadily in one direction and can look like a wave. That is a known limitation."
    ]
  },
  {
    "v": "0.765",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Søkefeltet i Deiger er borte når du har få deiger. Med en håndfull finner du fram raskere ved å bla enn ved å skrive, og feltet var den bredeste kontrollen — det dyttet sorteringen ned på egen linje, så tre kontroller sto over en liste på fem kort. Nå står metode og sortering side om side på én linje.",
      "Det er skjult, ikke slettet. Baker du ukentlig i et år er 50 deiger et reelt tall, og da er søk den eneste måten å finne igjen «den med Nuvola». Feltet kommer tilbake av seg selv når lista passerer tolv.",
      "Og har du søkt på noe før feltet forsvinner, nullstilles søket samtidig — ellers ville lista vært filtrert av noe du verken kunne se eller fjerne."
    ],
    "changes_en": [
      "The search box in Doughs is gone when you have only a few doughs. With a handful you find what you want faster by scrolling than by typing, and the box was the widest control — it pushed the sort dropdown onto a line of its own, so three controls sat above a list of five cards. Method and sort now sit side by side on one line.",
      "It is hidden, not deleted. If you bake weekly for a year, 50 doughs is a real number, and then search is the only way to find “the one with Nuvola” again. The box comes back by itself once the list passes twelve.",
      "And if you had searched for something before the box disappears, the search is cleared at the same time — otherwise the list would have been filtered by something you could neither see nor remove."
    ]
  },
  {
    "v": "0.764",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tilbakemeldingskortet brakk teksten midt inne i merkelappene. «Mangler mel» ble til «Mangler» på én linje og «mel» på neste, med fargen delt i to. Merkelappene lå i samme tekstflyt som dato, versjon og innstillinger, så alt brøt vilkårlig.",
      "Nå har merkelappene sin egen rad og kan ikke deles, og metadata brytes mellom feltene i stedet for inni dem: «lør 8. aug kl. 11:36» blir stående samlet, det samme med «napoletana/standard».",
      "Verst var det med de skjulte admin-knappene synlige og største skriftstørrelse: da ble ett enkelt kort 683 piksler høyt på en liten skjerm. Knappene tar nå sin egen linje når det blir trangt, og samme kort er 260 piksler.",
      "Ny test måler dette på ekte layout ved største skrift, så det ikke kan komme snikende tilbake."
    ],
    "changes_en": [
      "The feedback card broke text in the middle of its labels. “Missing flour” became “Missing” on one line and “flour” on the next, with the colour split in two. The labels sat in the same text flow as the date, version and settings, so everything broke arbitrarily.",
      "The labels now have a row of their own and cannot be split, and the metadata breaks between fields rather than inside them: “Sat 8 Aug, 11:36” stays together, and so does “napoletana/standard”.",
      "It was worst with the hidden admin buttons showing and the largest font size: a single card then came to 683 pixels tall on a small screen. The buttons now take a line of their own when space is tight, and the same card is 260 pixels.",
      "A new test measures this on real layout at the largest font size, so it cannot creep back in."
    ]
  },
  {
    "v": "0.763",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Poolish og Biga oppga hvor mye vann, men ikke hvor varmt. Nå står det «250g vann (18–21°C)» — også i ingredienslista for steget.",
      "Det er nettopp i en forgjæring det betyr mest. En poolish står 12–16 timer uten elting, så vannets temperatur er forgjæringens starttemperatur — det finnes ingen eltefriksjon som retter den opp igjen, slik det gjør i en hoveddeig som eltes i ti minutter.",
      "Mania-metoden sa det allerede, siden originaloppskriften gjør det. Så appen ga to ulike svar på samme spørsmål avhengig av hvilken metode du sto i.",
      "Ny invariant-test: det første steget som tilsetter vann må oppgi en temperatur. Senere steg slipper — «de 20 g vannet du holdt av» er samme vann, målt opp med temperatur ett steg tidligere, og å gjenta den ville bare vært støy."
    ],
    "changes_en": [
      "Poolish and Biga stated how much water, but not how warm. It now reads “250g water (18–21°C)” — including in the step's own ingredient list.",
      "A preferment is exactly where this matters most. A poolish sits for 12–16 hours without kneading, so the water temperature is the preferment's starting temperature — there is no kneading friction to correct it afterwards, as there is in a main dough kneaded for ten minutes.",
      "The Mania method already said so, because the original recipe does. So the app gave two different answers to the same question depending on which method you were in.",
      "New invariant test: the first step that adds water must state a temperature. Later steps need not — “the 20g of water you held back” is the same water, measured out with a temperature one step earlier, and repeating it would only be noise."
    ]
  },
  {
    "v": "0.762",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Utprøving-panelet oppga en gjærmengde selv om du ikke hadde valgt metode eller melmengde ennå. «1,13g som vanlig» var da bare standardverdiene — 500 g napoletana — og ikke din deig i det hele tatt. Nå står det «Slår inn når du har valgt metode og mengde», og tallet kommer først når det finnes et oppsett å regne det ut fra.",
      "Beskrivelsen sier nå hva testen faktisk gjør: den regner gjæren etter hvor mye gjæringen rekker ved temperaturen deigen står i, i stedet for etter faste tabeller.",
      "Og den sier hvilken vei det slår ut — begge veier. På Poolish og Biga gir det mindre gjær. På Kveldsdeig gir det mer, ofte over det dobbelte. Å bare skrive «mindre gjær» ville vært galt i den ene metoden der en glemt bryter koster deg deigen."
    ],
    "changes_en": [
      "The Experiments panel stated an amount of yeast even when you had not yet chosen a method or a quantity of flour. “1.13g as usual” was then just the default settings — 500g Neapolitan — and not your dough at all. It now says “Takes effect once you have chosen a method and an amount”, and the figure appears only when there is a setup to work it out from.",
      "The description now says what the test actually does: it works out the yeast from how much fermentation happens at the temperature the dough sits at, instead of from fixed tables.",
      "And it says which way that goes — both ways. On Poolish and Biga it means less yeast. On Evening dough it means more, often more than double. Writing only “less yeast” would have been wrong in the one method where a forgotten switch costs you the dough."
    ]
  },
  {
    "v": "0.761",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kopiert plan sier nå hvor mye gjærtesten endrer, ikke bare at den er på: «(forsøksmengde — gjærtest på, +107 % mot vanlig)». Ett tall og én retning.",
      "Grunnen er konkret. En gjennomgang av en plan med testen på leste forsøksmengden som oppskriftens normale mengde og forklarte den bort som et bevisst valg — fordi merket bare sa «forsøksmengde», uten størrelse. Uten den kan ingen vurdere om forsøket er rimelig eller vilt.",
      "Dette er ikke tilbake til det gamle. Den gamle linja oppga to konkurrerende gjærmengder og lot leseren finne ut hvilken som gjaldt. Denne oppgir mengden som faktisk brukes, og hvor langt fra vanlig den ligger."
    ],
    "changes_en": [
      "A copied plan now states how much the yeast test changes things, not just that it is on: “(experimental amount — yeast test on, +107% vs normal)”. One number, one direction.",
      "The reason is concrete. A review of a plan with the test on read the experimental amount as the recipe's normal amount and explained it away as a deliberate choice — because the marker only said “experimental amount”, with no magnitude. Without it, nobody can judge whether the experiment is reasonable or wild.",
      "This is not a return to the old form. The old line gave two competing amounts of yeast and left the reader to work out which applied. This one states the amount actually used, and how far from normal it sits."
    ]
  },
  {
    "v": "0.760",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Benketid-steget i Kveldsdeig forklarte den korte tempereringen med at «emnene ikke har vært kalde like lenge». Den begrunnelsen holder ikke. Et emne på 280 g er gjennomkaldt etter to–tre timer i kjøleskapet; etter 18 timer er det nøyaktig like kaldt som ett som har stått i 48. Hvor lenge det har vært kaldt sier ingenting om hvor kaldt det er.",
      "Appens egne tall motsier den også. Kveldsdeig på 24 timer og Langtidsdeig på 48 timer har identisk gjærmengde, men 2 mot 4 timers benketid — så verken kulden eller gjæren kan være forklaringen. Og innad i Kveldsdeig gir lengre kaldtid lengre benketid, ikke kortere: 90 minutter under 15 timer, 120 over. Stikk motsatt av det som sto.",
      "Den ekte grunnen er metodens form, ikke deigens temperatur: Kveldsdeig er bygget rundt å bake dagen etter, og fire timer på benken ville flyttet steketiden ut av kvelden. Nå står det, sammen med regelen som faktisk gjelder — et emne rett fra kjøleskapet er like kaldt uansett, så gå etter emnet og ikke klokka.",
      "Selve tiden er uendret. Det var begrunnelsen som var gal, ikke tallet."
    ],
    "changes_en": [
      "The bench-rest step in Evening dough explained its short warm-up with “the balls haven't been cold as long”. That reasoning does not hold. A 280g ball is cold right through after two to three hours in the fridge; after 18 hours it is exactly as cold as one that has sat for 48. How long it has been cold says nothing about how cold it is.",
      "The app's own numbers contradict it too. Evening dough at 24 hours and Long-rise dough at 48 hours have identical amounts of yeast, but 2 versus 4 hours of bench rest — so neither the cold nor the yeast can be the explanation. And within Evening dough, a longer cold gives a longer bench rest, not a shorter one: 90 minutes below 15 hours, 120 above. The exact opposite of what it said.",
      "The real reason is the shape of the method, not the temperature of the dough: Evening dough is built around baking the next day, and four hours on the counter would push the bake out of the evening. That is what it now says, along with the rule that actually applies — a ball straight from the fridge is equally cold either way, so go by the dough rather than the clock.",
      "The time itself is unchanged. It was the reasoning that was wrong, not the number."
    ]
  },
  {
    "v": "0.759",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mania-metoden er nå etterprøvd mot originaloppskriften — «Lørdagspizza med poolish tilpasset tidsklemma» fra pizzamani.no — og en ny test fryser avskriften. Tidsplanen stemmer på hvert eneste ledd: 12 timer poolish, nedkjøling, 30 minutters hvile, 1–1,5 time i romtemperatur, 10 timer i kjøleskap, 10 timer på ferdige emner, pluss fire timers buffer.",
      "Ingredienslista for seks pizza stemmer til siste desimal. For fire pizza er poolish, vann og salt like, men hovedgjæren blir 0,71g mot oppskriftens 0,76g. Grunnen er at oppskriftens egne to kolonner ikke er proporsjonale med hverandre — hovedgjæren spriker 6,7 % mellom dem — så ett tall kan bare treffe den ene. Appen er kalibrert på seks-pizza-kolonnen, og avviket er nå skrevet ned og låst så det ikke kan vokse i det stille.",
      "En ting til, notert for ettertiden: i oppskriftens poolish er fersk gjær 2,2 ganger tørr, som er normalt. I hoveddeigen er den 0,8 ganger — altså mindre fersk enn tørr, som er snudd. Bruker du fersk gjær, får du derfor mindre heving enn med tørr. Tallene står med vilje urørt, for Mania er en avskrift og skal ikke justeres — men nå vet du det, og koden sier fra til den som måtte finne på å «rette» det."
    ],
    "changes_en": [
      "The Mania method has now been verified against the original recipe — “Lørdagspizza med poolish tilpasset tidsklemma” from pizzamani.no — and a new test freezes the transcription. The schedule matches at every step: 12 hours of poolish, chilling, a 30-minute rest, 1–1.5 hours at room temperature, 10 hours in the fridge, 10 hours on shaped balls, plus a four-hour buffer.",
      "The ingredient list for six pizzas matches to the last decimal. For four pizzas the poolish, water and salt are identical, but the main-dough yeast comes out at 0.71g against the recipe's 0.76g. The reason is that the recipe's own two columns are not proportional to each other — the main-dough yeast differs by 6.7% between them — so a single figure can only match one. The app is calibrated on the six-pizza column, and the deviation is now written down and locked so it cannot grow quietly.",
      "One more thing, noted for the record: in the recipe's poolish, fresh yeast is 2.2 times the dry. In the main dough it is 0.8 times — less fresh than dry, which is the wrong way round. So if you use fresh yeast you get less rise than with dry. The numbers are deliberately left untouched, because Mania is a transcription and is not to be adjusted — but now you know, and the code warns anyone who might be tempted to “fix” it."
    ]
  },
  {
    "v": "0.758",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mania-metodens siste heving er ti timer ved romtemperatur på ferdig formede emner, etter at deigen alt har stått ti timer kaldt. Der sto det bare «La emnene heve i romtemperatur ved 22°C» — og tipset tilbød fire timer ekstra som buffer, uten et eneste forbehold. Et emne som har flytt utover kommer ikke tilbake.",
      "Nå står de samme tre tegnene som resten av hevestegene har: klar når emnet har vokst tydelig og fortsatt holder kuppelformen; lite endret og fast betyr mer tid; flytt utover og flatt, med en kant som går i ett med bunnen, betyr strekk og stek med en gang. Bufferen gjelder bare hvis emnet fortsatt holder formen.",
      "«Ingen elting» hadde samme hull og verre: femten timer på benken, og steget hadde ikke noe tips i det hele tatt, på noen av språkene. Den deigen har bare én heving, så det finnes ikke noe senere sjekkpunkt å redde seg på. Nå sier den at deigen skal skjelve som gelé — og at en sunket midte med skarpt sur lukt betyr at du skal bruke den nå.",
      "Ingen tall i oppskriftene er endret. Mania er en avskrift av en publisert oppskrift, og fasevarighetene står urørt — dette er bare hva planen tør si om det den allerede gjør.",
      "Ny invariant-test: en passiv heving på fire timer eller mer må beskrive hvordan for langt fram ser ut. Å si hva som er klart holder ikke — det forteller deg når du kan gå videre, ikke når toget har gått."
    ],
    "changes_en": [
      "The Mania method's final rise is ten hours at room temperature on fully shaped balls, after the dough has already spent ten hours cold. All it said was “Let the balls rise at room temperature at 22°C” — and the tip offered four extra hours as a buffer, without a single caveat. A ball that has spread out does not come back.",
      "It now carries the same three signs as the other rising steps: ready when the ball has grown clearly and still holds its domed shape; barely changed and firm means more time; spread out and flat, with an edge that merges into the base, means stretch and bake right away. The buffer only applies if the ball still holds its shape.",
      "“No-knead” had the same gap and worse: fifteen hours on the counter, and the step had no tip at all, in either language. That dough has only one rise, so there is no later checkpoint to fall back on. It now says the dough should wobble like jelly — and that a sunken middle with a sharply sour smell means use it now.",
      "No numbers in the recipes have changed. Mania is a transcription of a published recipe, and its phase durations are untouched — this is only what the plan dares to say about what it already does.",
      "New invariant test: a passive rise of four hours or more must describe what too far gone looks like. Saying what ready looks like is not enough — that tells you when you may move on, not when you have missed the moment."
    ]
  },
  {
    "v": "0.757",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Varselet om mel og gjæringstid skrev «ca. 35.916666666666664 timer». Nå står det «ca. 36 timer». Desimaler er uansett falsk presisjon på en gjæring som styres av hvordan deigen ser ut — og fjorten av dem er et regnestykke som har lekket ut i teksten.",
      "Selve sammenligningen bruker fortsatt det eksakte tallet, så varselet slår ut på nøyaktig samme tidspunkt som før. Det er bare visningen som er rundet.",
      "Ny invariant-test vokter hele klassen: ingen tekst du skal lese kan inneholde et tall med tre eller flere desimaler. Gjær oppgis med to (0,48g), alt annet med færre. Sjekken dekker både stegtekstene og hele sjekk-panelet der varslene bor — panelet hentes ferdig rendret, så et varsel som kommer til senere blir dekket uten at testen må kjenne navnet på det."
    ],
    "changes_en": [
      "The flour and fermentation-time warning read “about 35.916666666666664 hours”. It now says “about 36 hours”. Decimals are false precision on a fermentation governed by how the dough looks anyway — and fourteen of them is a calculation that has leaked into the text.",
      "The comparison itself still uses the exact number, so the warning triggers at precisely the same point as before. Only the display is rounded.",
      "A new invariant test guards the whole class: no text you are meant to read may contain a number with three or more decimals. Yeast is given with two (0.48g), everything else with fewer. The check covers both the step texts and the entire check panel where the warnings live — the panel is captured fully rendered, so a warning added later is covered without the test having to know its name."
    ]
  },
  {
    "v": "0.756",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«📤 Del»-knappen er tatt ut igjen. Den ble meldt inn som årsak til at appen henger etter bruk på iPhone — ingenting virker etterpå.",
      "Feilen lar seg ikke reprodusere her: deling som fullfører, avbrytes, nektes eller aldri svarer, gir alle en app som fortsatt bytter fane, regner ut planen på nytt og svarer på trykk. Mekanismen er derfor sannsynligvis noe iOS gjør — appen kjører som en installert PWA, deling sender den i bakgrunnen, og iOS er hard mot bakgrunnede apper.",
      "Uten en enhet å bekrefte på, er en gjetning i produksjon verre enn ingen knapp. «Kopier» virker som før, og deler du derfra, går det gjennom systemets egen lim-inn i stedet.",
      "Alt annet fra samme runde blir stående: «Kopier» gir fortsatt bekreftelse på mobil, og knappeteksten på PC drifter ikke lenger."
    ],
    "changes_en": [
      "The “📤 Share” button has been taken out again. It was reported as the cause of the app hanging after use on iPhone — nothing works afterwards.",
      "The fault cannot be reproduced here: sharing that completes, is cancelled, is denied, or never answers all leave an app that still switches tabs, recalculates the plan and responds to taps. The mechanism is therefore most likely something iOS does — the app runs as an installed PWA, sharing sends it to the background, and iOS is harsh with backgrounded apps.",
      "Without a device to confirm on, a guess in production is worse than no button. “Copy” works as before, and sharing from there goes through the system's own paste instead.",
      "Everything else from the same round stays: “Copy” still confirms on mobile, and the button label on desktop no longer drifts."
    ]
  },
  {
    "v": "0.755",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "En kopiert Mania-plan manglet steketemperaturen helt. Stekesteget sa bare «Pizzaovn.» — 430–450°C og 90–120 sek lå kun i understegene, og understeg blir ikke med når du kopierer eller deler. Det gjaldt alle fire pizzatypene og begge ovnstypene: åtte kombinasjoner.",
      "Årsaken var at Mania var den eneste metoden som ikke hentet stekebeskrivelsen fra samme kilde som de andre. Nå gjør den det, og kopien sier «Pizzaovn: 430–450°C, 90–120 sek» som overalt ellers.",
      "Ny invariant-test vokter regelen bak funnet: ingen opplysning skal bo BARE i understegene. Understeg kan gjerne dele opp — «70g vann totalt» blir til 50g og 20g — men et tall som ikke finnes noe sted utenfor dem, er noe appen viser og kopien mister. Sjekken går over alle metoder, typer, ovner og hydreringer.",
      "Massebalanse-testen kunne ikke fanget dette: den summerer gram mot oppskriften, og en temperatur som forsvinner har ingen sum å bryte."
    ],
    "changes_en": [
      "A copied Mania plan was missing the baking temperature entirely. The bake step said only “Pizza oven.” — 430–450°C and 90–120 sec lived solely in the substeps, and substeps are not included when you copy or share. This affected all four pizza types and both oven types: eight combinations.",
      "The cause was that Mania was the only method not taking its bake description from the same source as the others. It now does, and the copy reads “Pizza oven: 430–450°C, 90–120 sec” as it does everywhere else.",
      "A new invariant test guards the rule behind the finding: no fact may live ONLY in the substeps. Substeps may of course break things down — “70g water in total” becomes 50g and 20g — but a number found nowhere outside them is something the app shows and the copy loses. The check runs across every method, type, oven and hydration.",
      "The mass-balance test could not have caught this: it sums grams against the recipe, and a temperature that vanishes has no sum to break."
    ]
  },
  {
    "v": "0.754",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kopiert plan oppgir gjærmengden — ikke hva den kunne ha vært. Før sto det en egen linje: «Gjærtest (beta): PÅ — Poolish gir normalt 1.13g (−58%)». To tall for én ingrediens, og den som leste måtte selv finne ut hvilket som gjaldt.",
      "Nå står det bare «Gjær: 0.48g tørrgjær (forsøksmengde — gjærtest på)». Sammenligningen mellom de to tallene hører hjemme i appen, der du kjører forsøket og skal se forskjellen — ikke i en oppskrift du sender til noen andre.",
      "Merket blir stående, men uten tall. Uten et ord om at dette er en forsøksmengde, måler både et menneske og del 2 av sjekk-instruksjonen 0,48g mot vanlige poolish-mengder og melder et bevisst valg som en feil."
    ],
    "changes_en": [
      "A copied plan states the amount of yeast — not what it might have been. It used to carry a line of its own: “Yeast test (beta): ON — Poolish normally gives 1.13g (−58%)”. Two numbers for one ingredient, and the reader had to work out which one applied.",
      "It now simply says “Yeast: 0.48g dry yeast (experimental amount — yeast test on)”. The comparison between the two numbers belongs in the app, where you are running the trial and want to see the difference — not in a recipe you send to someone else.",
      "The marker stays, but without a number. Without a word saying this is an experimental amount, both a human and part 2 of the check instruction would measure 0.48g against ordinary poolish amounts and report a deliberate choice as an error."
    ]
  },
  {
    "v": "0.753",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«🔍 Finn beste kombinasjon» gjorde ingenting når du trykket på den i «begynn nå»-modus. Ikke en feilmelding engang — knappen ble tegnet uten å se på hvilken modus du var i, mens funksjonen bak sa nei med en gang. Søket virker nå begge veier.",
      "Verre var det at «Juster hevetid i Poolish» sendte deg til en glidebryter uten å si hvilken vei. På et vanlig oppsett løste bare én av fem verdier problemet: 12 til 15 timer landet alle mellom 02:58 og 05:58, bare 16 timer kom ut på 06:58. Fire av fem valg var feil, og appen visste hvilket som var riktig hele tiden.",
      "Nå står svaret på knappen: «Flytt til 06:58 — poolish 16t». Ett trykk utfører det, kvitteringen sier hva som ble endret, og «Angre» setter det tilbake. Kjøleskapspausen beholder plassen sin ved siden av, siden den løser det på en annen måte; resten ligger under «Andre måter».",
      "Og en utvei godtas bare hvis HELE planen blir konfliktfri. En innstilling som redder ett steg og dytter et annet inn i natta, har flyttet problemet — ikke løst det. Finner appen ingen utvei, står varselet igjen som ren informasjon, for du skal fortsatt få vite at et steg ligger kl. 04:45.",
      "Kvitteringen øverst sier nå «Deigen er klar rundt søndag 9. august kl. 08:45. Følg stegene og du får en pizza i premie.» Den gamle sa «ingen frist å bomme på» — men man bommer på et mål, ikke på en frist, og «frist» er uansett skattekontor-språk."
    ],
    "changes_en": [
      "“🔍 Find best combination” did nothing when you pressed it in “start now” mode. Not even an error — the button was drawn without looking at which mode you were in, while the function behind it refused immediately. The search now works both ways.",
      "Worse, “Adjust rise time in Poolish” sent you to a slider without saying which way. On an ordinary setup only one of five values solved the problem: 12 to 15 hours all landed between 02:58 and 05:58, only 16 hours came out at 06:58. Four of five choices were wrong, and the app knew which one was right the whole time.",
      "The answer is now on the button: “Move to 06:58 — poolish 16h”. One press does it, the receipt says what changed, and “Undo” puts it back. The cold pause keeps its place alongside, since it solves things a different way; the rest sits under “Other ways”.",
      "And a way out is only accepted if the WHOLE plan comes out clear. A setting that rescues one step and pushes another into the night has moved the problem, not solved it. If the app finds no way out, the warning remains as plain information, because you should still know a step sits at 04:45.",
      "The receipt at the top now reads “The dough is ready around Sunday 9 August at 08:45. Follow the steps and you get a pizza as your prize.”"
    ]
  },
  {
    "v": "0.752",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Poolish-steget sier nå hvor lenge den faktisk trenger på ditt kjøkken. Gjærmengden i poolishen er den samme enten det er 18 eller 26 grader, og planen setter av like mange timer uansett — men gjæringen bryr seg ikke om planen. På et 26-graders kjøkken er poolishen klar rundt 10 timer, ikke 14. Står den til 14, har den toppet og falt, og deigen blir slapp uten at du skjønner hvorfor.",
      "Derfor står det nå: «Men på et 26°C kjøkken går det fortere enn planen sier — regn med at den er klar rundt 10 timer, og se etter fra da av. Har midten begynt å synke, er den over toppen.» Kaldt kjøkken får motsatt beskjed. Ingen gram er endret — planen tør bare si mer.",
      "Ved 22 grader står det ingenting, for da stemmer planen. Og har du satt poolishen i kjøleskapet, sier den heller ingenting: der er vinduet så bredt at en time fra eller til ikke betyr noe.",
      "Under panseret: tallet regnes med nøyaktig samme Q10-modell som resten av appen bruker til gjæring, ikke en egen formel som kunne sagt noe annet.",
      "Invariant-testene sveipet alle metoder, typer og ovner — men alltid på 65 % hydrering. Nå dekkes 55, 65 og 80 også, så en feil som bare slår ut på tørre eller våte deiger ikke lenger er usynlig."
    ],
    "changes_en": [
      "The poolish step now says how long it actually needs in your kitchen. The amount of yeast in the poolish is the same whether it is 18 or 26 degrees, and the plan sets aside the same number of hours either way — but the fermentation does not care about the plan. In a 26-degree kitchen the poolish is ready around 10 hours, not 14. Leave it to 14 and it has peaked and fallen, and the dough goes slack without you understanding why.",
      "So it now says: “But in a 26°C kitchen it goes faster than the plan says — expect it ready around 10 hours, and start checking from then. If the middle has begun to sink, it is past its peak.” A cold kitchen gets the opposite message. Not a gram has changed — the plan simply dares to say more.",
      "At 22 degrees it says nothing, because there the plan is right. And if you put the poolish in the fridge it stays quiet too: there the window is so wide that an hour either way does not matter.",
      "Under the hood: the number is worked out with exactly the same Q10 model the rest of the app uses for fermentation, not a separate formula that could say something different.",
      "The invariant tests swept every method, type and oven — but always at 65% hydration. They now cover 55, 65 and 80 as well, so a fault that only shows up on dry or wet doughs is no longer invisible."
    ]
  },
  {
    "v": "0.751",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny «📤 Del»-knapp under tidsplanen. Der telefonen har et delingsark, går hele planen rett inn i appen du velger — Claude, ChatGPT, Notater, Meldinger. På iPhone slipper du kopier, bytt app, hold inne, lim. Det er verdt mer enn det høres ut: iOS kaster apper ut av minnet, så turen ut for å lime kunne koste deg planen du sto i.",
      "Delt tekst er nøyaktig den samme som kopiert tekst, sjekk-instruksjonen inkludert. Uten den ville en delt plan blitt lest som en helt vanlig oppskrift.",
      "Avbryter du delingsarket, skjer ingenting — det er ikke en feil. Går delingen derimot faktisk galt, havner planen på utklippstavla i stedet, så den aldri forsvinner i stillhet.",
      "«Kopier» ga ingen bekreftelse på mobil. Kvitteringen lette etter en knapp som bare fantes på PC, så på telefonen skjedde det ingenting synlig — og på iOS kan du ikke se utklippstavla, så du fikk ikke vite om det gikk bra før du limte inn et annet sted. Nå svarer knappen du faktisk trykket på.",
      "Og på PC drev knappeteksten: den het «📋 Kopier», men ble satt til «📋 Kopier tidsplan» etter første trykk. Nå legges knappens egen etikett tilbake."
    ],
    "changes_en": [
      "New “📤 Share” button below the schedule. Where the phone has a share sheet, the whole plan goes straight into the app you pick — Claude, ChatGPT, Notes, Messages. On iPhone that saves you copy, switch app, long-press, paste. It matters more than it sounds: iOS evicts apps from memory, so the trip out to paste could cost you the plan you were looking at.",
      "The shared text is exactly the same as the copied text, check instruction included. Without it a shared plan would read as an ordinary recipe.",
      "Cancel the share sheet and nothing happens — that is not an error. If the share genuinely fails, the plan lands on the clipboard instead, so it never disappears silently.",
      "“Copy” gave no confirmation on mobile. The receipt looked for a button that only existed on desktop, so nothing visible happened on the phone — and on iOS you cannot see the clipboard, so you had no way to know it worked until you pasted somewhere else. Now the button you actually pressed answers.",
      "And on desktop the button label drifted: it read “📋 Copy”, but was set to “📋 Copy schedule” after the first press. It now puts its own label back."
    ]
  },
  {
    "v": "0.750",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Varigheter oppgis ikke lenger i døgn. Kjøleskapssteget sa «ca. 1,3 døgn» — riktig regnet, men du må gjøre om i hodet før det betyr noe. Resten av planen snakker timer hele veien, og valgene for kjøleskapstid heter «24, 48 og 72 timer». Nå står det «ca. 32 timer».",
      "Lange varigheter rundes til hele timer. «31,8 timer» er falsk presisjon på en gjæring som uansett styres av hvordan deigen ser ut. Under seks timer beholdes halvtimen, for der betyr den noe: «2,5 timer».",
      "I forme-steget står melmengden nå som «(hvorav 167g mel)» i stedet for «(167g mel per pizza)». Den gamle formuleringen sto rett etter emnevekten på 280g og kunne leses som om emnet besto av mel alene."
    ],
    "changes_en": [
      "Durations are no longer given in days. The fridge step said “about 1.3 days” — correctly worked out, but you have to convert it in your head before it means anything. The rest of the plan talks in hours throughout, and the cold-proof options are called “24, 48 and 72 hours”. It now says “about 32 hours”.",
      "Long durations are rounded to whole hours. “31.8 hours” is false precision on a fermentation that is governed by how the dough looks anyway. Below six hours the half hour is kept, because there it means something: “2.5 hours”.",
      "In the shaping step the flour amount now reads “(of which 167g is flour)” instead of “(167g flour per pizza)”. The old wording sat right after the 280g ball weight and could be read as if the ball were flour alone."
    ]
  },
  {
    "v": "0.749",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Instruksjonen som følger med «Kopier tidsplan» er delt i to. Del 1 er den interne sjekken, som før: feil og motsigelser, vurdert bare mot det som faktisk står i planen. Del 2 er ny — den ber om at lignende oppskrifter slås opp på nett og sammenlignes med din.",
      "De to holdes bevisst fra hverandre. Del 1 skal ikke måle deigen din mot bransjenormer — det er den regelen som hindrer at du får «napoletana bør ligge på 60–65 % hydrering» når du selv valgte 70. I del 2 er avvik ikke feil, men valg, og den må oppgi hvilke oppskrifter den sammenligner med.",
      "Ny regel mot pirk: avrunding er ikke feil. Tallene er avrundet for visning, så en sum kan avvike fra summen av de viste tallene. Sprik under 1 % er nesten alltid dette. Unntaket står eksplisitt — er samme størrelse oppgitt med to ulike verdier, skal det meldes uansett hvor lite spriket er, for det er nettopp en motsigelse.",
      "Og den bes sortere: det som faktisk endrer deigen øverst. Begge gjennomgangene vi har fått åpnet med avrunding og dyttet de ekte funnene nedover."
    ],
    "changes_en": [
      "The instruction that comes with “Copy schedule” is now in two parts. Part 1 is the internal check, as before: errors and contradictions, judged only against what is actually written in the plan. Part 2 is new — it asks for similar recipes to be looked up online and compared with yours.",
      "The two are kept deliberately apart. Part 1 must not measure your dough against industry norms — that is the rule that stops you getting “Neapolitan should be 60–65% hydration” when you chose 70 yourself. In part 2 differences are not errors but choices, and it has to state which recipes it is comparing with.",
      "A new rule against nitpicking: rounding is not an error. The numbers are rounded for display, so a total can differ from the sum of the displayed numbers. Discrepancies below 1% are almost always this. The exception is spelled out — if the same quantity is given with two different values it must be reported however small the gap, because that is precisely a contradiction.",
      "And it is asked to sort: what actually changes the dough goes first. Both reviews we have had opened with rounding and pushed the real findings down the list."
    ]
  },
  {
    "v": "0.748",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Gjærtesten heter nå «Teste ny måte å regne ut gjærmengden», og etiketten sier rett ut hvilke metoder den gjelder: Poolish, Biga og Kveldsdeig. Det gamle navnet — «Utfordre gjærmengden» — sa ikke hva som skjer, og hvem som utfordret hvem sto det ingenting om.",
      "Da forsvant behovet for forklaringsboksen. Står du i Langtidsdeig og etiketten sier Poolish, Biga og Kveldsdeig, vet du allerede hvorfor det ikke skjedde noe da du slo den på.",
      "I stedet står det én linje som svarer på det samme spørsmålet uansett metode: hva er gjæren min nå? «0.48g i stedet for 1.13g» der testen virker, «1.13g som vanlig» der den ikke gjør det. «Ingen endring akkurat nå» er borte — det var skrevet fra maskinens side, om en verdi som ikke ble endret, til en som ikke hadde noe «før» å sammenligne med.",
      "Ett unntak fortjener fortsatt en begrunnelse: velger du Ingen elting, virker testen ikke selv om du står i Poolish. Der sier den fra hvorfor."
    ],
    "changes_en": [
      "The yeast test is now called “Test a new way of working out the yeast”, and the label states outright which methods it covers: Poolish, Biga and Evening dough. The old name — “Challenge the yeast amount” — did not say what happens, and left it unclear who was challenging whom.",
      "That removed the need for the explanation box. If you are in Long-rise dough and the label says Poolish, Biga and Evening dough, you already know why nothing happened when you switched it on.",
      "In its place is a single line that answers the same question in every method: what is my yeast right now? “0.48g instead of 1.13g” where the test applies, “1.13g as usual” where it does not. “No change right now” is gone — it was written from the machine's side, about a value that did not change, to someone who had no “before” to compare against.",
      "One exception still deserves a reason: pick No-knead and the test does not apply even in Poolish. There it says why."
    ]
  },
  {
    "v": "0.747",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Forklaringen i Utprøving-panelet var vanskelig å forstå. Det sto «Testen er på, men Langtidsdeig rører den ikke» — som om metoden lot være å røre testen, når det er testen som ikke rører metoden. Og den svarte ikke på spørsmålet du faktisk sitter med: hvorfor skjedde det ingenting da jeg slo den på?",
      "Nå står det «Ingen endring akkurat nå», etterfulgt av grunnen for nettopp den metoden du står i — Langtidsdeig regner allerede gjæren slik, Mania er en fast oppskrift fra en kilde, Hurtigdeig henter gjæren fra sin egen tabell — og til slutt hva du kan gjøre: velg Poolish, Biga eller Kveldsdeig for å se testen i arbeid.",
      "Beskrivelsen av selve testen er skrevet om uten fagord. «Q10-modellen» og «tabellene» sier ingenting hvis du ikke har lest koden; nå står det hva den faktisk gjør, og hvorfor du skulle ønske å prøve den."
    ],
    "changes_en": [
      "The explanation in the Experiments panel was hard to follow. It said “The test is on, but Long-rise dough does not touch it” — as if the method were leaving the test alone, when it is the test that leaves the method alone. And it did not answer the question you are actually sitting with: why did nothing happen when I switched it on?",
      "It now says “No change right now”, followed by the reason for the method you are actually in — Long-rise dough already works out the yeast this way, Mania is a fixed recipe from a source, Quick dough takes its yeast from its own table — and finally what you can do about it: pick Poolish, Biga or Evening dough to see the test at work.",
      "The description of the test itself has been rewritten without jargon. “The Q10 model” and “the tables” mean nothing unless you have read the code; it now says what the test actually does, and why you might want to try it."
    ]
  },
  {
    "v": "0.746",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Start ny deig» slo av gjærtesten i det stille. Det ødela hele poenget: du skal bake flere deiger med samme innstilling og sammenligne terningkastene, og stiller bakst nummer to seg tilbake til vanlig gjærmengde, sammenligner du to ulike ting uten å vite det.",
      "Favorittmetoden din — stjerna i Smart-plan — forsvant på nøyaktig samme måte. Begge overlever nå både «Start ny deig» og en omstart av appen.",
      "Selve deigen nullstilles fortsatt: mel, hydrering, type, metode og hevetider går tilbake til utgangspunktet. Det er innstillinger som gjelder deg, ikke den ene deigen, som blir stående."
    ],
    "changes_en": [
      "“Start a new dough” silently switched the yeast test off. That defeated the whole point: you are meant to bake several doughs on the same setting and compare the ratings, and if the second bake quietly reverts to the normal yeast amount, you are comparing two different things without knowing it.",
      "Your favourite method — the star in Smart plan — disappeared in exactly the same way. Both now survive “Start a new dough” as well as restarting the app.",
      "The dough itself is still reset: flour, hydration, type, method and proofing times all return to the starting point. It is the settings that belong to you, rather than to that one dough, that stay put."
    ]
  },
  {
    "v": "0.745",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Gjærtesten var usynlig utenfor Mer-fanen. Bryteren står der, men gjærmengden endres i Tidsplan og Planlegging — og der sto det bare «0.48g tørrgjær», som ser ut som et helt vanlig tall. Slår du testen på og glemmer den, fikk du 58 % mindre gjær uten at noe sa fra.",
      "Nå står det et merke øverst i både Tidsplan og Planlegging: «🧪 Gjærtest på — 0.48g i stedet for 1.13g (−58 %)», med en «Slå av»-knapp.",
      "Merket vises bare når testen faktisk endrer noe. Står du i Langtidsdeig eller Mania, som testen ikke rører, er det borte — et varsel som maser der ingenting er endret, lærer man seg bare å overse."
    ],
    "changes_en": [
      "The yeast test was invisible outside the More tab. The switch lives there, but the yeast amount changes in Schedule and Planning — where it just said “0.48g dry yeast”, which looks like a perfectly ordinary number. Turn the test on and forget it, and you got 58% less yeast with nothing to tell you.",
      "There is now a marker at the top of both Schedule and Planning: “🧪 Yeast test on — 0.48g instead of 1.13g (−58%)”, with a “Turn off” button.",
      "The marker only appears when the test actually changes something. In Long-ferment or Mania, which it does not touch, it is gone — a warning that nags where nothing changed is one you learn to ignore."
    ]
  },
  {
    "v": "0.744",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Gjæren telles nå med i emnevekten. Den sto utenfor for alle metoder unntatt Mania, så veide du opp alt i ingredienslista, fikk du ikke helt den vekten planen oppga. Deigvekten leses samtidig fra samme oppskriftskilde som alt annet — Hurtigdeig og Kveldsdeig regnet den tidligere med en annen gjærmengde enn den som sto i lista.",
      "Kveldsdeigens forklaring sa «Kald heving over 5–15 timer» uansett hva du valgte. Velger du 24 timer, motsa den sin egen overskrift. Den oppgir nå tiden du faktisk har valgt.",
      "New York-pizza i pizzaovn forklarte temperaturgrensen med «sukkeret i deigen brunes raskt og kan brenne over 350°C». Men i pizzaovn er sukkeret droppet med vilje, så teksten viste til en ingrediens oppskriften ikke inneholder — og grensen på 350°C motsa tipset rett under, som ber deg justere opp mot 350–370°C hvis pizzaen blir for lys. Beskrivelsen oppgir nå utgangspunktet, og tipset eier finjusteringen."
    ],
    "changes_en": [
      "The yeast now counts toward the ball weight. It was left out for every method except Mania, so weighing out everything in the ingredient list did not quite give you the weight the plan stated. The dough weight is also read from the same recipe source as everything else — Quick dough and Evening dough previously calculated it with a different amount of yeast than the one listed.",
      "Evening dough's explanation said “Cold proofing over 5–15 hours” no matter what you picked. Choose 24 hours and it contradicted its own heading. It now states the time you actually selected.",
      "New York pizza in a pizza oven explained the temperature limit with “the sugar in the dough browns quickly and can burn above 350°C”. But in a pizza oven the sugar is deliberately dropped, so the text referred to an ingredient the recipe does not contain — and the 350°C limit contradicted the tip right below it, which tells you to adjust up toward 350–370°C if the pizza is too pale. The description now gives the starting point, and the tip owns the fine-tuning."
    ]
  },
  {
    "v": "0.743",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Lager du én pizza, snakket appen fortsatt om «emnene» og «boksene». Verst i tipset om å ikke stable boksene tett i høyden og spre dem utover — med én boks er det ingenting å spre. Alle stegtekstene bøyer seg nå etter hvor mange emner planen faktisk lager, på begge språk.",
      "Det ble mer synlig med forrige versjon: siden appen nå svarer 160g mel på én pizza, er én pizza blitt det vanlige tilfellet.",
      "Kveldsdeigens forklaring sa «Kortere enn standardmetodens 4 timer». Det stemte da det ble skrevet, men benketida i standardmetoden ble senere gjort avhengig av romtemperaturen — den er 6,4 timer på et kjølig kjøkken og 2 timer på et varmt. Teksten leser nå den faktiske verdien i stedet for et fast tall."
    ],
    "changes_en": [
      "When you make a single pizza, the app still talked about “the balls” and “the containers”. Worst in the tip about not stacking the boxes and spreading them out — with one box there is nothing to spread. Every step text now matches how many balls the plan actually makes, in both languages.",
      "The previous version made this more visible: since the app now answers 160g flour for one pizza, a single pizza has become the common case.",
      "Evening dough's explanation said “Shorter than the standard method's 4 hours”. That was true when it was written, but the standard method's bench time was later made to depend on room temperature — 6.4 hours in a cool kitchen, 2 hours in a warm one. The text now reads the actual value instead of a fixed number."
    ]
  },
  {
    "v": "0.742",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ba du om mel til én napoletansk pizza, svarte appen 200g — og laget så ett emne på 336g. Det er 24 % over de 270g appen selv definerer et napoletansk emne som. Årsaken var et gulv på 200g som overstyrte målvekten. Nå svarer den 160g, som gir 269g.",
      "Antall emner må rundes til et helt tall, og da treffer vekten per emne ikke alltid: 240g mel ga ett emne på 403g uten at noe sa fra. Oppskriften viser nå en «Emnevekt»-linje når emnet havner mer enn 12 % fra målvekten — med melmengden som ville truffet, så den er til å gjøre noe med.",
      "Romtemperaturhevingen i Langtidsdeig ba deg gjøre windowpane-testen midt i hevingen, mens steget over sier at den testen er sluttpunktet for eltingen. Den bruker nå fingertrykk-testen, som Poolish, Biga og Hurtigdeig alltid har gjort på samme fase.",
      "Forvarmingssteget og stekesteget hadde ordrett samme tips, og for napoletansk ba stekesteget deg forvarme ovnen 20 minutter etter at du hadde gjort det. Forvarmingssteget handler nå om forvarmingen, stekesteget om stekingen.",
      "Forvarmingen snakket om pizzastein også når du steker i pizzaovn, der det er et dekke og ingen løs stein. Teksten følger nå ovnstypen — og pizzaovn-brukere får ikke lenger råd om en ovnstermostat de ikke har."
    ],
    "changes_en": [
      "Ask for the flour for one Neapolitan pizza and the app answered 200g — then made a single 336g ball. That is 24% above the 270g the app itself defines a Neapolitan ball as. The cause was a 200g floor overriding the target weight. It now answers 160g, which gives 269g.",
      "The number of balls has to round to a whole number, so the weight per ball does not always land: 240g flour gave one 403g ball with nothing to warn you. The recipe now shows a “Ball weight” line when the ball ends up more than 12% off target — with the flour amount that would have hit it.",
      "The room-temperature rise in Long-ferment dough told you to do the windowpane test mid-rise, while the step above says that test is the endpoint of kneading. It now uses the finger-poke test, as Poolish, Biga and Quick dough always have on the same phase.",
      "The preheat step and the baking step carried word-for-word the same tip, and for Neapolitan the baking step told you to preheat the oven 20 minutes after you had done so. The preheat step is now about preheating and the baking step about baking.",
      "The preheat text mentioned a pizza stone even when baking in a pizza oven, which has a deck and no loose stone. The text now follows the oven type — and pizza oven users no longer get advice about an oven thermostat they do not have."
    ]
  },
  {
    "v": "0.741",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny bryter under Innstillinger → 🧪 Utprøving: «Utfordre gjærmengden». Den regner gjæren med Q10-modellen — samme fysikk Langtidsdeig allerede bruker — i stedet for tabellene, og viser hva metoden normalt ville gitt rett under gjærmengden.",
      "Den gjelder Poolish, Biga og Kveldsdeig, som fortsatt regner gjæren med tabeller. Langtidsdeig bruker Q10 fra før; Mania er en publisert oppskrift fra en kilde og skal ikke overprøves; Hurtigdeig har sin egen modell.",
      "Utslagene er store og går begge veier: Poolish −58 %, Biga −65 %, men Kveldsdeig +133 %. Modellen mener altså at forspillene er kraftig overdosert og kveldsdeigen underdosert. Hvem som har rett vet vi ikke — det er derfor dette er en test og ikke en endring.",
      "Bryteren er av som standard. Slår du den på, lagres valget sammen med deigen, så terningkastet i Deiger-fanen forteller hvilken gjærmengde det faktisk gjelder. Bak begge, gi dem terning, og spørsmålet avgjøres av deig i stedet for av regnestykker."
    ],
    "changes_en": [
      "New switch under Settings → 🧪 Trials: “Challenge the yeast amount”. It calculates the yeast with the Q10 model — the same physics Long-ferment dough already uses — instead of the tables, and shows what the method would normally give right below the yeast amount.",
      "It applies to Poolish, Biga and Evening dough, which still calculate yeast from tables. Long-ferment already uses Q10; Mania is a published recipe from a source and should not be overruled; Quick dough has its own model.",
      "The differences are large and go both ways: Poolish −58%, Biga −65%, but Evening dough +133%. The model reckons the pre-ferments are heavily overdosed and the evening dough underdosed. Which is right, we do not know — that is why this is a test and not a change.",
      "The switch is off by default. Turn it on and the choice is saved with the dough, so the rating in the Doughs tab tells you which yeast amount it actually applies to. Bake both, rate them, and the question gets settled by dough instead of by arithmetic."
    ]
  },
  {
    "v": "0.740",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Se bort fra ledig tid» varte bare ut dagen. Er du hjemme hele uka — ferie, fri, permisjon — måtte du slå den på igjen hver morgen. Nå kan pausen vare ut uka, til og med søndag.",
      "Valget står i Pizzatid-panelet som tre trinn: På · Av ut dagen · Av ut uka. Lenka på konfliktkortet er uendret — der vil du bare videre, og den gir deg fortsatt ett trykk for resten av dagen.",
      "Merkelappen sier nå hvor lenge pausen varer, ikke bare at den er på. Det er viktigere jo lengre den gjelder: en glemt ukespause er sju dager med anbefalinger som ikke tar hensyn til timeplanen din i det hele tatt.",
      "Trykker du «ut uka» på en søndag, varer den ut kvelden — det er det uka har igjen. Da vises heller ikke knappen, siden den ville gjort nøyaktig det samme som «ut dagen»."
    ],
    "changes_en": [
      "“Ignore free time” only lasted for the rest of the day. If you were home all week — holiday, time off, leave — you had to turn it on again every morning. The pause can now last the week, through Sunday.",
      "The choice sits in the Pizzatid panel as three steps: On · Off for today · Off this week. The link on the conflict card is unchanged — there you just want to move on, and it still gives you one tap for the rest of the day.",
      "The label now says how long the pause lasts, not just that it is on. That matters more the longer it runs: a forgotten week-long pause is seven days of recommendations that take no account of your schedule at all.",
      "Tap “this week” on a Sunday and it lasts through the evening — that is what the week has left. The button is hidden then, since it would do exactly what “off for today” does."
    ]
  },
  {
    "v": "0.739",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "New York-pizza i vanlig ovn har 7,5g sukker i oppskriften — det er sukkeret som gir skorpa farge når ovnen ikke blir varmere enn 250°C. Med Poolish og Biga nevnte ingen av stegene det. Ingredienslista ba deg veie opp sukker, og så fikk du aldri beskjed om å ha det i. Nå står det i blandesteget, som hos de andre metodene.",
      "Mania-poolish og Kveldsdeig manglet steget «Sett på ovnen 🔥». Stekesteget krevde 45 minutters forvarming med pizzastein, mens tidsplanen gikk rett fra siste heving til steking — samme feil som ble rettet for tre andre metoder i v0.737, der vi trodde disse to alt hadde steget. Alle metoder bygger nå steget fra samme sted, så en ny metode arver det i stedet for å måtte huske det.",
      "Begge feilene ble funnet av tre nye tester som sjekker hele matrisen av metoder, pizzatyper og ovnstyper på én gang: at det stegene ber deg måle opp summerer til oppskriften, at ingen mengde står uten tall, og at tidsplanen setter av den forvarmingen den selv krever.",
      "Gjærmengden er uendret i alle oppskrifter."
    ],
    "changes_en": [
      "New York pizza in a regular oven has 7.5g sugar in the recipe — that sugar is what gives the crust its colour when the oven cannot go above 250°C. With Poolish and Biga, none of the steps mentioned it. The ingredient list told you to weigh out sugar, and then you were never told to add it. It is now in the mixing step, as with the other methods.",
      "Mania poolish and Evening dough were missing the step “Turn on the oven 🔥”. The baking step demanded 45 minutes of preheating with a pizza stone, while the schedule went straight from the last rise to baking — the same fault fixed for three other methods in v0.737, where we believed these two already had the step. Every method now builds the step from one place, so a new method inherits it instead of having to remember it.",
      "Both faults were found by three new tests that check the whole matrix of methods, pizza types and oven types at once: that what the steps ask you to measure out adds up to the recipe, that no amount is stated without a number, and that the schedule sets aside the preheating it demands itself.",
      "The amount of yeast is unchanged in every recipe."
    ]
  },
  {
    "v": "0.738",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Steget «Form emner → kjøleskap» sto merket «❄️ Kjøleskap». Men i disse 15 minuttene deler, veier og runder du emnene på kjøkkenbenken — kjøleskapet er først der på slutten. Merkelappen sier nå «🔧 Kjøkkenbenk», som er der du faktisk står.",
      "Gjærmengden er uendret. Det er med vilje: den samme feilmerkingen gjør at gjæringsberegningen regner disse minuttene som kalde, og å rette det ville flyttet gjæren i alle oppskrifter med under to prosent. Den delen venter til gjærkalibreringen uansett skal åpnes."
    ],
    "changes_en": [
      "The step “Shape balls → fridge” was labelled “❄️ Fridge”. But during those 15 minutes you divide, weigh and round the balls on the kitchen counter — the fridge only comes in at the end. The label now reads “🔧 Counter”, which is where you actually stand.",
      "The amount of yeast is unchanged. That is deliberate: the same mislabelling makes the fermentation calculation treat those minutes as cold, and correcting it would shift the yeast in every recipe by less than two percent. That part waits until the yeast calibration is due to be opened anyway."
    ]
  },
  {
    "v": "0.737",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tidsplanen for Langtidsdeig, Poolish og Biga gikk rett fra «ferdig temperert» til «strekk og stek», mens tipset på stekesteget sa at ovnen trenger 15–20 minutter (pizzaovn) eller minst 45 minutter (vanlig ovn med stein). Kravet dukket altså opp i det øyeblikket det var for sent å innfri.",
      "Nå står «Sett på ovnen 🔥» som et eget steg på riktig tidspunkt — 20 min før steking med pizzaovn, 45 min med vanlig ovn og pizzastein. Hurtigdeig og Kveldsdeig har hatt et slikt steg hele tiden; det var bare disse tre som manglet det.",
      "Steget forklarer også hvorfor steinen må inn med en gang: luften i ovnen blir varm lenge før steinen er det, og det er steinen som gir bunnen.",
      "Gjærmengden er uendret. Steget står oppført på benken (der deigen faktisk er) selv om du selv går til ovnen, nettopp for at gjæringsberegningen ikke skulle merke at det kom et nytt steg."
    ],
    "changes_en": [
      "The schedule for Long-rise, Poolish and Biga went straight from “done warming up” to “stretch and bake”, while the tip on the baking step said the oven needs 15–20 minutes (pizza oven) or at least 45 minutes (regular oven with a stone). The requirement showed up at the exact moment it was too late to meet.",
      "“Turn on the oven 🔥” is now its own step at the right time — 20 min before baking with a pizza oven, 45 min with a regular oven and a pizza stone. Quick dough and Evening dough have always had such a step; only these three were missing it.",
      "The step also explains why the stone must go in right away: the air in the oven gets hot long before the stone does, and it is the stone that makes the base.",
      "The amount of yeast is unchanged. The step is listed as being at the counter (where the dough actually is) even though you yourself walk over to the oven — precisely so the fermentation calculation would not notice that a new step had appeared."
    ]
  },
  {
    "v": "0.736",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en motsigelse i Langtidsdeigen som gjorde oppskriften umulig å følge bokstavelig: autolysen ba deg helle ALT vannet i melet, og steget etter ba deg løse gjæren «i litt vann». Det vannet fantes ikke — og hentet du nytt fra springen, ble deigen både tyngre og våtere enn oppskriften sa.",
      "Nå holdes en liten del av det oppmålte vannet av til gjæren, og begge stegene oppgir mengden i gram. Delene summerer seg til totalen, så hydreringen står som før. Ved 500g mel og 65% blir det 305g i autolysen og 20g til gjæren.",
      "«Hvorfor»-teksten sa at gjæren løses i vannet «på forhånd». Det er umulig når autolysen er første steg, og er nå rettet til at den løses i vannet du holdt av."
    ],
    "changes_en": [
      "Fixed a contradiction in the Long-rise dough that made the recipe impossible to follow literally: the autolyse told you to pour ALL the water into the flour, and the next step told you to dissolve the yeast “in a little water”. That water did not exist — and if you took fresh water from the tap, the dough came out both heavier and wetter than the recipe said.",
      "A small part of the measured water is now held back for the yeast, and both steps state the amount in grams. The parts add up to the total, so the hydration is unchanged. At 500g flour and 65% that means 305g in the autolyse and 20g for the yeast.",
      "The “why” text said the yeast is dissolved in the water “beforehand”. That is impossible when the autolyse is step one, and it now says it is dissolved in the water you held back."
    ]
  },
  {
    "v": "0.735",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny knapp når Smart-plan sier at et steg havner utenfor den ledige tiden din: «Se bort fra ledig tid ut dagen». Den er for fridagen — ferie, avspasering, hjemmekontor — der den vanlige uka di rett og slett ikke stemmer.",
      "Timeplanen din røres ikke. Appen slutter bare å bry seg, og ved midnatt teller den ledige tiden med igjen helt av seg selv. Det er ingenting å huske å skru tilbake.",
      "Natten (23–06) holdes utenfor. «Fri hele dagen» skal ikke bety at appen foreslår elting kl. 03.",
      "Mens pausen varer står det «🔕 Ledig tid telles ikke med — til midnatt» både over søkeresultatet og øverst i timeplan-redigeringen, med «Slå på igjen» ved siden av. Uten den beskjeden ville en glemt pause blitt en stille feil: appen sier at alt passer, og du vet ikke hvorfor."
    ],
    "changes_en": [
      "New button when Smart plan reports that a step falls outside your free time: “Ignore free time for the rest of today”. It is for the day off — holiday, time in lieu, working from home — where your usual week simply does not apply.",
      "Your schedule is left untouched. The app just stops caring, and at midnight free time counts again all by itself. There is nothing to remember to switch back.",
      "The night (23–06) stays out of it. “Free all day” must not mean the app suggests kneading at 3 am.",
      "While the pause is on, “🔕 Free time is not counted — until midnight” appears both above the search result and at the top of the schedule editor, with “Turn back on” next to it. Without that notice a forgotten pause becomes a silent bug: the app says everything fits, and you have no idea why."
    ]
  },
  {
    "v": "0.734",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fokus-knappen sa \u00abett steg om gangen\u00bb \u2014 det beskriver en begrensning, ikke det du faktisk f\u00e5r. N\u00e5 st\u00e5r det \u00abFokus\u00bb med \u00abstor tekst \u00b7 skjermen sovner ikke\u00bb i mindre skrift under. Det er nemlig hele poenget: n\u00e5r telefonen ligger p\u00e5 kj\u00f8kkenbenken og du har deig p\u00e5 hendene, skal skjermen holde seg v\u00e5ken og teksten v\u00e6re lesbar p\u00e5 avstand. Hjelpeteksten n\u00e5r du holder inne forteller ogs\u00e5 at du kan bla mellom stegene inne i Fokus."
    ],
    "changes_en": [
      "The Focus button said \u201cone step at a time\u201d \u2014 which describes a limitation, not what you actually get. It now reads \u201cFocus\u201d with \u201clarge text \u00b7 screen stays awake\u201d in smaller type below. That is the whole point: when the phone is on the kitchen counter and your hands are covered in dough, the screen should stay awake and the text readable from a distance. The tooltip also mentions that you can move between steps inside Focus."
    ]
  },
  {
    "v": "0.733",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at tidspunktet i steg-kortene ble kuttet av h\u00f8yre kant n\u00e5r man bruker st\u00f8rre tekst. Ved \u00abSt\u00f8rre tekst\u00bb forsvant 43 piksler ut av skjermen, ved \u00abSt\u00f8rst\u00bb 88 \u2014 s\u00e5 «kl. 21:30 \u00b7 30 min» ble stumpet midt i.",
      "L\u00f8sningen var \u00e5 rydde i venstre marg: stegnummeret bor n\u00e5 INNE i avhukingsboksen. Den viser nummeret til du haker av steget, og \u2713 etterp\u00e5. F\u00f8r brukte to kontroller ved siden av hverandre plassen til \u00e9n funksjon \u2014 nummeret var uansett bare pynt, uten egen handling. Det gir ogs\u00e5 mer plass til selve steg-tittelen, som f\u00f8r brakk over to linjer.",
      "Varigheten (\u00ab\u00b7 30 min\u00bb) kan n\u00e5 flytte ned p\u00e5 egen linje n\u00e5r plassen er trang, mens selve datoen fortsatt holdes samlet \u2014 den skal aldri brekke midt i, slik den gjorde f\u00f8r v0.694."
    ],
    "changes_en": [
      "Fixed the time in the step cards being cut off at the right edge when using larger text. At \u201cLarger text\u201d 43 pixels disappeared off screen, at \u201cLargest\u201d 88 \u2014 so \u201c21:30 \u00b7 30 min\u201d was chopped mid-way.",
      "The fix was to tidy the left margin: the step number now lives INSIDE the checkbox. It shows the number until you check the step off, and \u2713 afterwards. Previously two controls side by side used the space of one function \u2014 the number was decorative anyway, with no action of its own. It also gives the step title more room, which used to wrap onto two lines.",
      "The duration (\u201c\u00b7 30 min\u201d) can now move to its own line when space is tight, while the date itself is still kept together \u2014 it must never break mid-way, as it did before v0.694."
    ]
  },
  {
    "v": "0.732",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mengdelinja i statuslinja viser n\u00e5 ogs\u00e5 hydrering: \u00ab3 stk \u00b7 500g mel \u00b7 65% \u00b7 0,75g t\u00f8rrgj\u00e6r\u00bb. Hydreringen er tatt med fordi den sier noe om hva slags deig du lager \u2014 ikke bare hvor mye. Mania-poolish viser sine egne 64%.",
      "Ikonet og den fete skriften p\u00e5 linja er fjernet. Det var ikke bare kosmetikk: begge deler frigjorde nettopp bredden hydreringen trengte, s\u00e5 linja n\u00e5 holder seg p\u00e5 \u00e9n linje ogs\u00e5 p\u00e5 smale telefoner og med fersk gj\u00e6r (som er lengre \u00e5 skrive). Samtidig leser den n\u00e5 tydeligere som referanse \u2014 det er tidspunktene som skal v\u00e6re overskriften.",
      "Vann, salt, olje og sukker holdes fortsatt utenfor. Vannet kan du regne ut av mel og hydrering, saltet er nesten konstant, og alle st\u00e5r uansett i selve steget n\u00e5r du trenger dem \u2014 der med mer nytte, som anbefalt vanntemperatur. Hele lista finnes p\u00e5 Oppskrift-fanen ett trykk unna."
    ],
    "changes_en": [
      "The amount line in the status bar now also shows hydration: \u201c3 pcs \u00b7 500g flour \u00b7 65% \u00b7 0.75g dry yeast\u201d. Hydration is included because it says something about what kind of dough you are making \u2014 not just how much. Mania poolish shows its own 64%.",
      "The icon and bold text on the line have been removed. That was not just cosmetic: both freed exactly the width hydration needed, so the line now stays on one line on narrow phones and with fresh yeast (which is longer to write). It also reads more clearly as reference now \u2014 the times should be the headline.",
      "Water, salt, oil and sugar are still left out. You can work out the water from flour and hydration, the salt is nearly constant, and all of them appear in the step itself when you need them \u2014 there with more use, such as the recommended water temperature. The full list is one tap away on the Recipe tab."
    ]
  },
  {
    "v": "0.731",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Statuslinja \u00f8verst i Tidsplan viser n\u00e5 ogs\u00e5 mengdene: \u00ab3 stk \u00b7 500g mel \u00b7 0,75g t\u00f8rrgj\u00e6r\u00bb. Da ser du HVA du skal blande samtidig med N\u00c5R \u2014 f\u00f8r m\u00e5tte du bytte til Oppskrift-fanen for \u00e5 sjekke. Tallene leses fra samme kilde som oppskriften og kopier-funksjonen, s\u00e5 de kan ikke sprike, og de f\u00f8lger metoden du har valgt (Mania-poolish viser sine egne 0,85g, ikke standardens)."
    ],
    "changes_en": [
      "The status bar at the top of the Schedule now also shows the amounts: \u201c3 pcs \u00b7 500g flour \u00b7 0.75g dry yeast\u201d. So you see WHAT to mix at the same time as WHEN \u2014 previously you had to switch to the Recipe tab to check. The numbers come from the same source as the recipe and the copy function, so they cannot disagree, and they follow your chosen method (Mania poolish shows its own 0.85g, not the standard one\u2019s)."
    ]
  },
  {
    "v": "0.730",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Du kan nå velge en favorittmetode (stjerna i «Metoder du blir tilbudt»). Favoritten løftes i Fra–til-rangeringen, men aldri i det stille: vinner den over et alternativ med mer gjæringstid, står prislappen på kortet — «2t 30m mindre gjæring enn Biga». Er favoritten klart dårligere enn beste alternativ, vinner den ikke; da er det viktigere at du får vite det.",
      "Metodefilteret gjelder nå også Fra–til. Skrur du av en metode du aldri lager, tar den ikke lenger plass i lista. Tidligere gjaldt filteret bare Smart-plan, så de to stedene kunne mene ulike ting om hva du bryr deg om.",
      "Poolish og Biga er nå med i Fra–til. De ble holdt utenfor da modusen kom, fordi lista ville blitt lang — men nå styrer du lengden selv med filteret.",
      "Passer ikke en metode inn i tiden du har, sier appen nå hva du må gjøre for å få den til likevel — ikke bare hvor mye som mangler. Du får to knapper: «Start ons 22:10 i stedet» eller «Stek lør 05:50 i stedet», og ett trykk setter både metoden og den nye tiden. Favoritten din legges øverst blant dem som ikke passer, siden det er den du helst vil få til."
    ],
    "changes_en": [
      "You can now pick a favourite method (the star in “Methods you are offered”). The favourite is lifted in the From–to ranking, but never silently: if it beats an option with more fermentation time, the price is stated on the card — “2h 30m less fermentation than biga”. If the favourite is clearly worse than the best option, it doesn't win; knowing that matters more.",
      "The method filter now applies to From–to as well. Turn off a method you never make and it no longer takes up space in the list. Previously the filter only applied to Smart-plan, so the two places could disagree about what you care about.",
      "Poolish and biga are now included in From–to. They were left out when the mode launched because the list would have got long — but now you control the length yourself with the filter.",
      "When a method doesn't fit the time you have, the app now tells you what to do about it rather than just how much is missing. You get two buttons: “Start Wed 22:10 instead” or “Bake Sat 05:50 instead”, and one tap sets both the method and the new time. Your favourite is listed first among those that don't fit, since that's the one you most want to make work."
    ]
  },
  {
    "v": "0.729",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Langtidsdeigen regner nå gjærmengden med én fysisk lov i stedet for tre sammenganget tabeller: gjæringsraten halveres for hver 10°C temperaturen faller (Q10). Appen summerer hvor mye gjæring hvert steg i din faktiske tidsplan bidrar med — kjøleskapet, romhevingen og benketida — og fordeler gjæren etter det. Tallene er kalibrert mot de uttestede punktene: 24 og 72 timer gir nøyaktig samme gjærmengde som før, 48 timer 0,04 g mindre, altså mindre enn en kjøkkenvekt kan vise.",
      "Kjøleskapstemperaturen (lagt til i forrige uke) virker nå gjennom den samme fysikken i stedet for en anslått kurve. Utslaget ble mildere enn anslaget: et kaldt skap på 0–2°C gir nå ca. 11% mer gjær, ikke 30%.",
      "Poolish, Biga, Hurtigdeig, Kveldsdeig og Mania er bevisst uendret og beholder sine egne kurver. For Poolish ville den nye modellen halvert gjærmengden — muligens riktig, men en så stor endring skal bakes og smakes før den slippes, ikke bare regnes ut."
    ],
    "changes_en": [
      "Long-ferment dough now computes yeast from a single physical law instead of three multiplied tables: the fermentation rate halves for every 10°C drop in temperature (Q10). The app sums how much fermentation each step in your actual schedule contributes — the fridge, the room rise and the bench rest — and sets the yeast from that. The numbers are calibrated against the tested reference points: 24 and 72 hours give exactly the same yeast as before, 48 hours 0.04 g less, which is below what a kitchen scale can show.",
      "The fridge temperature (added last week) now works through the same physics instead of an estimated curve. The effect turned out gentler than the estimate: a cold 0–2°C fridge now gives about 11% more yeast, not 30%.",
      "Poolish, biga, quick dough, evening dough and Mania are deliberately unchanged and keep their own curves. For poolish the new model would have halved the yeast — possibly correct, but a change that large should be baked and tasted before it ships, not just calculated."
    ]
  },
  {
    "v": "0.728",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Sivilisert oppstart i Fra–til. Fyller man vinduet bakfra, havner det beste alternativet ofte midt på natta — nettopp fordi det er det lengste (kan du starte 23:30 og vil steke 18:00, krever full gjæring oppstart 01:30). Slike forslag er nå merket «🌙 midt på natten», og de får en straff i rangeringen så et alternativ med menneskelig oppstart vinner når det ikke er stort dårligere.",
      "Nytt: når selv det beste alternativet starter om natta, tilbyr appen «Start heller kl. …» — samme metode og samme gjæringstid, men du starter når du faktisk sa du var ledig. Til gjengjeld er pizzaen klar litt før ønsket steketid, og appen sier tydelig når (f.eks. «Klar 16:30 i stedet for 18:00»). Steketiden i planen flyttes tilsvarende, så alt henger sammen.",
      "Rettet at «Bruk denne» kunne overskrive steketiden du selv hadde satt: den kjørte en full oppfriskning av innstillingene, som nullstiller steketid-feltet til en standardverdi. Planen du landet på gjaldt da et annet tidspunkt enn det du ba om. Nå oppdateres kun de kontrollene valget faktisk endrer."
    ],
    "changes_en": [
      "Civilized start times in From–to. When the window is filled from the end, the best option often lands in the middle of the night — precisely because it's the longest (if you can start at 23:30 and want to bake at 18:00, full fermentation demands a 01:30 start). Such suggestions are now marked “🌙 middle of the night”, and they take a penalty in the ranking so an option with a human start time wins when it isn't much worse.",
      "New: when even the best option starts at night, the app offers “Start at … instead” — same method and same fermentation time, but you start when you actually said you were free. In exchange the pizza is ready a little before your target bake time, and the app says clearly when (e.g. “Ready 16:30 instead of 18:00”). The bake time in the plan moves accordingly, so everything stays consistent.",
      "Fixed “Use this” potentially overwriting the bake time you had set: it ran a full settings refresh, which resets the bake-time field to a default value. The plan you landed on then applied to a different time than the one you asked for. Now only the controls the choice actually changes are updated."
    ]
  },
  {
    "v": "0.727",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Bruk denne» i Fra–til tar deg nå rett til Tidsplan-fanen, slik «Bruk denne» i Smart-plan alltid har gjort — før ble valget lagret uten at du så resultatet. Tidspunktene du fylte inn beholdes, så du kan gå tilbake og ombestemme deg uten å skrive dem på nytt.",
      "Endret overskriften i Fra–til fra «mest gjæring som får plass» til «mest fermenteringstid» — kortere og mer presist."
    ],
    "changes_en": [
      "“Use this” in From–to now takes you straight to the Schedule tab, the way “Use this” in Smart-plan always has — previously the choice was applied without showing you the result. The times you entered are kept, so you can go back and change your mind without retyping them.",
      "Changed the From–to heading from “most fermentation that fits” to “most fermentation time” — shorter and more precise."
    ]
  },
  {
    "v": "0.726",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet to feil i den nye «Fra–til»-modusen som gjorde at forslagene kunne regne mot feil steketid. Endret du steketiden, oppdaterte ikke forslagslista seg — den ble stående mot den forrige tiden, så vinduet kunne vise f.eks. «47 timer» der feltene sa 23, og oppstarten lå et døgn feil. I tillegg flyttet appen steketiden automatisk et døgn fram når du gikk inn i Fra–til, fordi den sjekket om tiden var mulig for metoden som tilfeldigvis var valgt — men i Fra–til er det jo appen som skal finne metoden, og grensen er når du kan starte. Nå står steketiden du oppgir, og passer ingen av metodene, sier lista det ærlig.",
      "Ryddet i forslagskortene: overskriften brøt over to linjer for Langtidsdeig («42 t kaldheving»). Tiden står nå kort i overskriften, og hva slags gjæring det er, står i linja under."
    ],
    "changes_en": [
      "Fixed two bugs in the new “From–to” mode that could make the suggestions compute against the wrong bake time. If you changed the bake time, the suggestion list didn't refresh — it stayed on the previous time, so the window could read e.g. “47 hours” where the fields said 23, and the start time was a day off. On top of that the app automatically pushed the bake time a day forward when you entered From–to, because it checked whether the time was feasible for whichever method happened to be selected — but in From–to it's the app that picks the method, and the bound is when you can start. Now the bake time you enter stays put, and if nothing fits, the list says so honestly.",
      "Tidied the suggestion cards: the heading wrapped onto two lines for long-ferment dough (“42 h cold proof”). The duration is now short in the heading, with the kind of fermentation on the line below."
    ]
  },
  {
    "v": "0.725",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny «Fra–til»-modus: oppgi når du tidligst kan starte og når du vil steke, så finner appen metoden og gjæringstiden som gir MEST smak innenfor det vinduet. Eksempel: starter du kl. 20 i kveld og vil steke kl. 18 i morgen (22 timer), foreslår den Kveldsdeig med 18 timer kaldheving — den fyller 20 av 22 timer, mens Hurtigdeig ville kastet bort nesten 6 timer og Langtidsdeig ikke får plass i det hele tatt.",
      "Alle alternativene vises med hvor mye av vinduet de bruker, når du da må starte, og hva de heter på appens egen smaksskala («Lang kveld», «Utmerket», «Full smak»). Metoder som ikke får plass sier ærlig hvor mye tid de mangler. Ingenting endres automatisk — du trykker «Bruk denne» selv.",
      "Steketiden er den harde betingelsen: pizzaen blir ferdig når du faktisk vil spise, ikke et par timer for tidlig. Oppstarten er kun en nedre grense, så et forslag starter aldri før du er tilgjengelig. Førsteutgaven dekker Hurtigdeig, Kveldsdeig og Langtidsdeig — Poolish og Biga har lengre, sammensatte vinduer og kommer eventuelt senere."
    ],
    "changes_en": [
      "New “From–to” mode: enter when you can start at the earliest and when you want to bake, and the app finds the method and fermentation time that gives the MOST flavor within that window. Example: start at 8pm tonight and bake at 6pm tomorrow (22 hours) and it suggests evening dough with an 18-hour cold proof — it fills 20 of the 22 hours, while quick dough would waste nearly 6 hours and long-ferment dough doesn't fit at all.",
      "Every option shows how much of the window it uses, when you'd then have to start, and what it's called on the app's own flavor scale (“Long evening”, “Excellent”, “Full flavor”). Methods that don't fit say honestly how much time they're short. Nothing changes automatically — you tap “Use this” yourself.",
      "The bake time is the hard constraint: the pizza is ready when you actually want to eat, not a couple of hours early. The start time is only a lower bound, so a suggestion never starts before you're available. The first release covers quick, evening and long-ferment dough — poolish and biga have longer, compound windows and may follow later."
    ]
  },
  {
    "v": "0.724",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "New York-pizza: sukkeret droppes nå automatisk når du har valgt pizzaovn. Sukkeret er der for å gi skorpa farge i vanlig ovn (6–9 min steketid) — i pizzaovn på 400°C+ rekker det bare å brenne seg før skorpa er ferdig. Med vanlig ovn får du 1,5% sukker som før. (Klassisk NY-råd: «skip sugar if baking with open flame» — appen vet jo allerede hvilken ovn du har.)"
    ],
    "changes_en": [
      "New York pizza: the sugar is now dropped automatically when you've selected a pizza oven. The sugar is there to color the crust in a regular oven (6–9 min bake) — in a pizza oven at 400°C+ it only manages to burn before the crust is done. With a regular oven you get 1.5% sugar as before. (Classic NY advice: “skip sugar if baking with open flame” — the app already knows which oven you have.)"
    ]
  },
  {
    "v": "0.723",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at appen kunne krasje ved oppstart etter forrige oppdatering. Offline-mekanismen (service workeren) hentet alltid fersk hovedside, men serverte motorfila (engine.js, ny i v0.719) fra en gammel lokal kopi — den ferske siden kalte da funksjoner som ikke fantes i den gamle fila. Nå behandles alle kodefiler likt (fersk kopi vinner alltid når du er på nett), gamle mellomlagre ryddes automatisk, og allerede rammede brukere repareres ved første innlasting. En ny automatisk sjekk hindrer at feilen kan gjeninnføres for fremtidige filer."
    ],
    "changes_en": [
      "Fixed the app potentially crashing at startup after the previous update. The offline mechanism (service worker) always fetched a fresh main page but served the engine file (engine.js, new in v0.719) from an old local copy — the fresh page then called functions that didn't exist in the old file. All code files are now treated the same (a fresh copy always wins when online), old caches are cleaned up automatically, and already-affected users are repaired on first load. A new automatic check prevents the bug from being reintroduced for future files."
    ]
  },
  {
    "v": "0.722",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt valg i Finjuster: kjøleskapstemperatur (0–2 / 2–4 / 4–6 / 6–8°C). Appen kompenserer gjærmengden automatisk — et kaldere kjøleskap bremser gjæringen, så du får litt mer gjær for samme resultat til samme tid (ca. +30% ved 0–2°C); et varmere skap eller dørhylle gir litt mindre. Standardvalget 2–4°C er et riktig innstilt kjøleskap (Mattilsynet: 0–4°C) og endrer ingen tall. Gjelder Langtidsdeig, Poolish, Biga og Kveldsdeig; Mania-poolish er en fast, publisert oppskrift og justeres ikke. Usikker på temperaturen? Mål med termometer — 1–5-skalaene er ikke like mellom merker."
    ],
    "changes_en": [
      "New choice in Fine-tune: fridge temperature (0–2 / 2–4 / 4–6 / 6–8°C). The app compensates the yeast amount automatically — a colder fridge slows fermentation, so you get slightly more yeast for the same result at the same time (about +30% at 0–2°C); a warmer fridge or door shelf gives slightly less. The default 2–4°C is a correctly set fridge and changes no numbers. Applies to long-ferment, poolish, biga and evening dough; Mania poolish is a fixed published recipe and is not adjusted. Unsure of the temperature? Measure with a thermometer — the 1–5 dials differ between brands."
    ]
  },
  {
    "v": "0.721",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Blandestegene for Langtidsdeig, Poolish og Biga anbefaler nå en konkret vanntemperatur i °C — regnet ut fra romtemperaturen din og kjøkkenmaskinens friksjonsvarme, slik Hurtigdeig allerede gjorde. Et kaldt kjøkken om vinteren og et varmt om sommeren treffer dermed samme måltemperatur på ferdig deig (ca. 23°C). Eksempel ved 22°C rom: ca. 17°C vann med Ankarsrum, ca. 9°C med vanlig kjøkkenmaskin (som tilfører mer friksjonsvarme). «Ingen elting» beholder den enkle teksten — der blandes det med skje og starttemperaturen betyr lite."
    ],
    "changes_en": [
      "The mixing steps for long-ferment, poolish and biga now recommend a concrete water temperature in °C — computed from your room temperature and your mixer's friction heat, as the quick dough already did. A cold kitchen in winter and a warm one in summer thus hit the same target dough temperature (about 23°C). Example at a 22°C room: about 17°C water with the Ankarsrum, about 9°C with a regular stand mixer (which adds more friction heat). No-knead keeps its simple wording — it's mixed with a spoon, and the starting temperature matters little there."
    ]
  },
  {
    "v": "0.720",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Benketida etter kjøleskapet («Ta ut av kjøleskap»-steget) tilpasser seg nå romtemperaturen din, slik steg-teksten hele tiden har sagt at den burde: ved 22°C er den 4 timer som før, ved 18°C får deigen lengre tid på å bli strekkbar (ca. 6,4 t), ved 26°C kortere (ca. 2,6 t). Steketiden og middagen flyttes ikke — det er bare fordelingen mellom kald tid og benketid som justeres, og kald tid går aldri under 1 time. Gjelder Langtidsdeig, Poolish og Biga (Kveldsdeig har sin egen, kortere temperering som skalerer med kjøletiden). Poolish/biga-forspillet er bevisst upåvirket — det er et valg du selv har satt."
    ],
    "changes_en": [
      "The bench time after the fridge (the “Take out of the fridge” step) now adapts to your room temperature, as the step text always said it should: at 22°C it stays 4 hours as before, at 18°C the dough gets longer to become stretchable (about 6.4h), at 26°C shorter (about 2.6h). The bake time and dinner don't move — only the split between cold time and bench time adjusts, and cold time never drops below 1 hour. Applies to long-ferment, poolish and biga (evening dough has its own shorter temper that scales with the chill hours). The poolish/biga preferment is deliberately unaffected — that's a number you chose yourself."
    ]
  },
  {
    "v": "0.719",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: selve beregningsmotoren (oppskrifts-sannheten, kalibreringskurvene, metode-registeret og gjæringstid-utregningene) er skilt ut i en egen fil, engine.js — samme mønster som endringsloggen og guiden. Ingen synlige endringer; all oppførsel er verifisert identisk. Dette fullfører motor-robusthetsarbeidet (seks trinn siden v0.714): én ingredienskilde, én interpolator, én planleggingsretning, ett metoderegister, invariant-tester som vokter det hele — og nå en ren, avgrenset motorfil."
    ],
    "changes_en": [
      "Under the hood: the calculation engine itself (the recipe truth, calibration curves, method registry and fermentation-time derivations) has been split into its own file, engine.js — same pattern as the changelog and guide. No visible changes; all behavior verified identical. This completes the engine robustness work (six steps since v0.714): one ingredient source, one interpolator, one scheduling direction, one method registry, invariant tests guarding it all — and now a clean, bounded engine file."
    ]
  },
  {
    "v": "0.718",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at PC-visningen viste den justerbare «Kjøleskapsheving»-slideren for Mania-poolish — metoden har fast struktur, og mobilvisningen skjulte den allerede riktig. Årsaken var at metode-egenskaper lå spredt i flere hardkodede lister som var kommet i utakt; alle metodenavn og -egenskaper leses nå fra ett felles register (også Smart-plan-lista og Deiger-filteret), så en slik utakt ikke kan oppstå igjen."
    ],
    "changes_en": [
      "Fixed the desktop view showing the adjustable “Cold proof” slider for Mania poolish — the method has a fixed structure, and the mobile view already hid it correctly. The cause was method properties living in several hardcoded lists that had drifted apart; all method names and properties are now read from one shared registry (including the Smart-plan list and the Doughs filter), so that kind of drift can no longer happen."
    ]
  },
  {
    "v": "0.717",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: tidsplan-motoren regner nå alltid i én retning. «Planlagt steketid»-modus trekker bare totaltiden fra steketiden og bygger så planen fremover — tidligere fantes det to håndskrevne kjeder per metode (én fremover, én baklengs) som måtte holdes i takt manuelt. Mania-poolish sine fasevarigheter ligger nå i én konstantblokk som både tidsplanen og gjæringsvarslene leser, så de to kan aldri mer vise ulike totaltider. Alle tidspunkter er verifisert identiske med før."
    ],
    "changes_en": [
      "Under the hood: the schedule engine now always computes in one direction. \"Planned bake time\" mode simply subtracts the total time from the bake time and then builds the plan forward — previously each method had two hand-written chains (one forward, one backward) that had to be kept in sync manually. Mania poolish's phase durations now live in one constant block read by both the schedule and the fermentation warnings, so the two can never again show different totals. All timestamps verified identical to before."
    ]
  },
  {
    "v": "0.716",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: alle gjærings- og gjærkurvene (temperaturfaktor, kaldhevings-multiplikator, poolish/biga-forspillskurver) er samlet i én kalibreringsblokk, tolket av én felles interpolator — tre funksjoner hadde hver sin kopi av samme utregning. Tallene er bevist bit-identiske med før (ny test fryser kurveverdiene mellom ankerpunktene). Åpner for at kurvene senere kan versjoneres eller redigeres på ett sted."
    ],
    "changes_en": [
      "Under the hood: all fermentation and yeast curves (temperature factor, cold-proof multiplier, poolish/biga preferment curves) are gathered in one calibration block, interpreted by one shared interpolator — three functions each had their own copy of the same computation. The numbers are proven bit-identical to before (a new test freezes curve values between the anchor points). Paves the way for versioning or editing the curves in one place later."
    ]
  },
  {
    "v": "0.715",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Alle ingredienstall (mel, vann, salt, gjær, hydrering) hentes nå fra én felles kilde uansett metode og visning — tidsplan, oppskriftsfane, kopier-oppskrift og kalender kan ikke lenger vise ulike tall for samme deig. Dette retter samtidig to feil: PC-visningens oppskriftsfane viste generelle tall for Mania-poolish (325g vann/14g salt/65%) i stedet for Manias egne (320g/15g/64%), og «Ingen elting»-typen kunne vise feil oppskriftsfane hvis Mania sto valgt som metode.",
      "Mania-poolish på PC: «Kjøleskapsheving»-raden viste den justerbare kjøletiden fra andre metoder — Mania har fast struktur (10t udelt + 10t i emner). Raden sier nå det."
    ],
    "changes_en": [
      "All ingredient numbers (flour, water, salt, yeast, hydration) are now read from one shared source regardless of method and view — the schedule, recipe tab, copy-recipe and calendar can no longer show different numbers for the same dough. This also fixes two bugs: the desktop recipe tab showed generic numbers for Mania poolish (325g water/14g salt/65%) instead of Mania's own (320g/15g/64%), and the no-knead type could show the wrong recipe tab if Mania happened to be the selected method.",
      "Mania poolish on desktop: the “Cold proof” row showed the adjustable cold time from other methods — Mania has a fixed structure (10h undivided + 10h in balls). The row now says so."
    ]
  },
  {
    "v": "0.714",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Under panseret: nye automatiske konsistenssjekker som vokter selve beregningsmotoren. For hver metode sjekkes det nå at en plan regnet fremover fra oppstart og en plan regnet baklengs fra steketiden gir nøyaktig samme tidsplan, at stegene alltid kommer i riktig tidsrekkefølge, og at Mania-oppskriftens vanndeler alltid summerer til riktig hydrering uansett melmengde. Ingen synlige endringer — dette er sikkerhetsnett for videre utvikling."
    ],
    "changes_en": [
      "Under the hood: new automatic consistency checks guarding the calculation engine itself. For every method, we now verify that a plan computed forward from the start and one computed backward from the bake time produce exactly the same schedule, that steps always come in chronological order, and that the Mania recipe's water parts always sum to the correct hydration regardless of flour amount. No visible changes — this is a safety net for further development."
    ]
  },
  {
    "v": "0.713",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Mania-poolish: rettet at «Kopier oppskrift» viste andre ingrediensmengder enn selve tidsplanen. Kopien brukte den generelle oppskriften (325g vann, 14g salt, 1,13g gjær, 65% hydrering), mens stegene bruker Manias egen oppskrift (320g vann, 15g salt, 0,85g gjær, 64% hydrering). Kopien viser nå samme tall som stegene og Oppskrift-fanen.",
      "Mania-poolish: slo sammen to nedkjølingssteg som lå på samme tidspunkt og motsa hverandre om minstetiden («minimum 1 time» vs. «minst 2 timer»). Nå ett tydelig steg: kjøl poolishen i minst 2 timer (fleksibelt opp til 3–4 timer).",
      "Mania-poolish: ryddet i blande-steget for hoveddeigen, som brukte «resten av vannet» om to ulike mengder. Nå entydig: tilsett del 2 av vannet i dråper, hold igjen siste skvett til saltet.",
      "Mania-poolish: kjøleskapstipset for den udelte deigen sa «emnene skal vokse» — men deigen er ikke delt i emner ennå på det stadiet. Sier nå «deigen». Poolish-gjæringen er også presisert til 18–21°C (samme som blande-steget), og starter etter blandingen i stedet for på samme klokkeslett."
    ],
    "changes_en": [
      "Mania poolish: fixed “Copy recipe” showing different ingredient amounts than the schedule itself. The copy used the general recipe (325g water, 14g salt, 1.13g yeast, 65% hydration), while the steps use Mania's own recipe (320g water, 15g salt, 0.85g yeast, 64% hydration). The copy now shows the same numbers as the steps and the Recipe tab.",
      "Mania poolish: merged two cooling steps that sat at the same time and contradicted each other on the minimum time (“minimum 1 hour” vs. “at least 2 hours”). Now one clear step: cool the poolish for at least 2 hours (flexible up to 3–4 hours).",
      "Mania poolish: cleaned up the main-dough mixing step, which used “the rest of the water” for two different amounts. Now unambiguous: add water part 2 in drops, hold back the last splash for the salt.",
      "Mania poolish: the fridge tip for the undivided dough said “the balls should grow” — but the dough isn't divided into balls yet at that stage. It now says “the dough”. The poolish fermentation is also specified as 18–21°C (matching the mixing step), and now starts after mixing instead of at the same clock time."
    ]
  },
  {
    "v": "0.712",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en forvirrende formulering i temperer-tipset (steget «Ta ut av kjøleskap»). Det sa «gi dem mer tid før du former» og «form og stek uten å vente lenger» — men emnene er allerede formet til boller før kjøleskapet. Etter temperering strekker/åpner du bare emnet og steker; du former det ikke på nytt. Teksten sier nå «før du strekker og steker» / «strekk og stek uten å vente lenger». Gjelder alle metoder som kjølehever (standard/poolish/biga og Kveldsdeig)."
    ],
    "changes_en": [
      "Fixed a confusing phrasing in the bench-rest tip (the “Take out of the fridge” step). It said “give them more time before you shape” and “shape and bake without waiting longer” — but the balls are already shaped before the fridge. After tempering you only stretch/open the ball and bake; you don't re-shape it. The text now says “before you stretch and bake” / “stretch and bake without waiting longer”. Applies to all cold-proofed methods (standard/poolish/biga and Evening dough)."
    ]
  },
  {
    "v": "0.711",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en intern selvmotsigelse i standarddeigens steg 2 (Ankarsrum): selve instruksjonen og understegene sier at saltet skal i etter ca. 3 minutter elting, men «Hvorfor»-teksten sa «etter ca. 5 min». Harmonisert til ~3 minutter, så alle tre er enige."
    ],
    "changes_en": [
      "Fixed an internal contradiction in the standard dough's step 2 (Ankarsrum): the instruction and the sub-steps say the salt goes in after about 3 minutes of kneading, but the “Why” text said “after about 5 min”. Harmonized to ~3 minutes, so all three agree."
    ]
  },
  {
    "v": "0.710",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Finn oppskriften»-knappen i Smart-plan lyser nå opp så snart du endrer ETT av feltene — enten klokkeslettet eller datoen. Før krevde den at du tok begge (klokke, så dato) i rekkefølge, så endret du bare datoen forble knappen dempet og virket inaktiv. Og ✓-haka som dukket opp på feltene er fjernet — den forvirret mer enn den hjalp."
    ],
    "changes_en": [
      "The “Find the recipe” button in Smart plan now lights up as soon as you change EITHER field — the time or the date. Previously it required you to touch both (time, then date) in sequence, so changing only the date left the button dimmed and looking inactive. And the ✓ checkmark that appeared on the fields has been removed — it confused more than it helped."
    ]
  },
  {
    "v": "0.709",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre norsk på Smart-plan-merket: «kort håndgrep» er byttet til «raskt gjort» — mindre stivt, og tydeligere at konfliktsteget (som å ta ut av kjøleskap) er unnagjort på et øyeblikk. Samme ordbytte i forklaringslinja under alternativene."
    ],
    "changes_en": [
      "Better wording on the Smart plan badge: “quick handling” is now “quickly done” — less stiff, and clearer that the conflict step (like taking it out of the fridge) is over in a moment. Same wording change in the explanatory line under the alternatives."
    ]
  },
  {
    "v": "0.708",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "To rettelser på Smart-plan-valgene. (1) Det står nå tydelig at alternativenes «når»-boks ER en konflikt — en «⚠ Utenfor ledig tid»-etikett (eller «Midt på natten») over tidspunktet, så du slipper å gjette hvorfor steget er trukket fram. (2) Fikset at gjæringstiden kunne flyte ut av kortet: «mer smak» er flyttet ned på egen linje, så tallet (~43t) holder seg kort ved siden av lange metodenavn som wrapper over flere linjer."
    ],
    "changes_en": [
      "Two fixes for the Smart plan options. (1) It now says clearly that the alternatives' “when” box IS a conflict — a “⚠ Outside free time” label (or “Middle of the night”) above the time, so you don't have to guess why the step is highlighted. (2) Fixed the fermentation time overflowing the card: “more flavor” has moved to its own line, so the figure (~43h) stays short next to long method names that wrap across several lines."
    ]
  },
  {
    "v": "0.707",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-valgene er nå tydeligere å velge mellom. Hvert forslag — både det anbefalte og alternativene — er et eget kort med sin egen «Bruk denne»-knapp (fylt for det anbefalte, omriss for alternativene), så det er åpenbart at du kan velge et alternativ. Og konflikt-tidspunktet er løftet fram: det står nå stort og først på en egen «når»-linje (f.eks. «fre 14:00»), med steget og arbeidsmengden ved siden av — for det er nettopp klokkeslettet som avgjør om du rekker det håndgrepet."
    ],
    "changes_en": [
      "The Smart plan options are now clearer to choose between. Each suggestion — both the recommended one and the alternatives — is its own card with its own “Use this one” button (filled for the recommended, outlined for the alternatives), so it's obvious you can pick an alternative. And the conflict time is brought to the front: it now sits large and first on its own “when” line (e.g. “Fri 14:00”), with the step and effort beside it — because it's exactly the time that decides whether you can manage that handling."
    ]
  },
  {
    "v": "0.706",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Justerte layouten på Smart-plan-sammenligningen: konflikten står nå på en egen linje UNDER metoden og gjæringstiden, ikke som en trang sidekolonne. Metodenavn som «Poolish (romtemp + 18t kjøleskapspause)» wrapper over flere linjer, og da ble konflikt-kolonnen klemt. Nå får hver rad metode + gjæring øverst, og konflikt-detaljen (steg · tid · arbeidsmengde) i full bredde under — mye lettere å lese."
    ],
    "changes_en": [
      "Adjusted the layout of the Smart plan comparison: the conflict now sits on its own line BELOW the method and fermentation time, not as a cramped side column. Method names like “Poolish (room temp + 18h cold pause)” wrap across several lines, which squeezed the conflict column. Now each row has method + fermentation on top, and the conflict detail (step · time · effort) at full width underneath — much easier to read."
    ]
  },
  {
    "v": "0.705",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-resultatet viser nå en liten sammenligningstabell: det anbefalte forslaget øverst, pluss inntil to alternativer — med gjæringstid (mer smak) og hva konflikten deres faktisk er. For hvert alternativ ser du HVILKET steg som kolliderer, NÅR, og HVOR MYE arbeid det er: et grønt «kort håndgrep»-merke betyr et passivt/kjapt håndgrep (som å ta bollen ut av kjøleskapet — noe du fint kan gjøre hjemmefra), mens et oransje merke betyr ekte hands-on-arbeid (elte, forme). Da kan du selv velge et lengre, mer smaksrikt alternativ når du ser at «ulempen» bare er et minutts arbeid. Trykk raden for å bruke den. Vinneren rangeres fortsatt på færrest konflikter — tabellen bare synliggjør avveiningen så valget er ditt."
    ],
    "changes_en": [
      "The Smart plan result now shows a small comparison table: the recommended option at the top, plus up to two alternatives — with fermentation time (more flavor) and what their conflict actually is. For each alternative you see WHICH step conflicts, WHEN, and HOW MUCH work it is: a green “quick handling” badge means a passive/quick touch (like taking the bowl out of the fridge — something you can easily do from home), while an orange badge means real hands-on work (kneading, shaping). That lets you choose a longer, more flavorful option yourself when you can see the “downside” is just a minute of work. Tap a row to use it. The winner is still ranked by fewest conflicts — the table just surfaces the trade-off so the choice is yours."
    ]
  },
  {
    "v": "0.704",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Kopier oppskrift»-teksten ber nå AI-en også sjekke for interne inkonsistenser — tekst eller tall som motsier hverandre (samme tid, temperatur eller mengde oppgitt ulikt to steder, eller to steg med motstridende råd). Det er nettopp den typen feil de siste gjennomgangene faktisk fant. Samtidig er det lagt inn et vern mot støy: AI-en bes vurdere mot det som faktisk står i oppskriften og det du selv har oppgitt — ikke mot generelle bransjenormer eller antatt praksis (som er der de svakeste, mest villedende funnene pleide å komme fra)."
    ],
    "changes_en": [
      "The “Copy recipe” text now also asks the AI to check for internal inconsistencies — text or numbers that contradict each other (the same time, temperature or amount stated differently in two places, or two steps giving conflicting advice). That's exactly the kind of error the recent reviews actually found. At the same time it adds a guard against noise: the AI is asked to judge against what's actually written in the recipe and what you specified yourself — not against general industry norms or assumed practice (which is where the weakest, most misleading findings tended to come from)."
    ]
  },
  {
    "v": "0.703",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Ignorer» rett i Tidsplanen. Får et steg ⚠-merket «utenfor ledig tid» (eller «midt på natten»), sitter det nå en liten «Ignorer»-knapp rett på merket — så du kan skjule varselet der du faktisk ser det. Før bodde den knappen bare inne i wizardens «Sjekk», som Smart-planen aldri sender deg innom (den lander på Tidsplan), så hvis du kom den veien var det i praksis ingen måte å avvise varselet på. «Ignorer» her og «fortsett likevel» i Sjekk deler nå samme tilstand — ignorerer du ett sted, er det ignorert begge steder."
    ],
    "changes_en": [
      "“Ignore” right in the schedule. When a step gets the ⚠ “outside free time” (or “middle of the night”) mark, there's now a small “Ignore” button right on the mark — so you can hide the warning where you actually see it. Before, that button lived only inside the wizard's “Check”, which Smart plan never routes you through (it lands on the schedule), so if you came that way there was effectively no way to dismiss it. “Ignore” here and “continue anyway” in Check now share the same state — ignore it in one place and it's ignored in both."
    ]
  },
  {
    "v": "0.702",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kjøleskapspausen teller nå med i «ledig tid». Steget er passivt (deigen bare venter), men STARTEN krever at du er hjemme og setter poolish-bollen i kjøleskapet — og det tok ikke Smart-planen hensyn til før, så den kunne legge det midt på en travel formiddag uten å si ifra. Nå behandles det som et steg du må være til stede for: Smart-planen prøver å legge det i den ledige tida di, og faller det likevel utenfor (eller midt på natten), får du samme varsel som for andre steg — med en «Dette er greit — fortsett likevel»-knapp, i tilfelle du fint kan stikke innom og sette bollen i kjøleskapet den dagen likevel. Vanlige passive steg (gjæring, kjøleskapsheving) teller fortsatt ikke."
    ],
    "changes_en": [
      "The cold pause now counts toward your “free time”. The step is passive (the dough just waits), but its START requires you to be home to put the poolish bowl in the fridge — and Smart plan didn't account for that before, so it could place it in the middle of a busy morning without flagging it. It's now treated as a step you need to be present for: Smart plan tries to fit it into your free time, and if it still falls outside (or in the middle of the night) you get the same warning as for other steps — with a “This is fine — continue anyway” button, in case you can pop home to put the bowl in the fridge that day after all. Ordinary passive steps (fermenting, cold rise) still don't count."
    ]
  },
  {
    "v": "0.701",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet en liten selvmotsigelse i kjøleskapspause-steget: «Hvorfor»-teksten sa både at en moden poolish «tåler noen timer kaldt» og at pausen er «maks 18 timer» — men 18 timer er ikke «noen timer». Teksten er nå konsistent: i kjøleskapet nærmest pauses gjæringen, så poolishen holder seg godt en god stund, med 18 timer som øvre grense."
    ],
    "changes_en": [
      "Fixed a small contradiction in the cold-pause step: the “Why” text said both that a mature poolish “tolerates a few hours cold” and that the pause is “up to 18 hours” — but 18 hours isn't “a few hours”. The text is now consistent: in the fridge the fermentation is all but paused, so the poolish keeps well for a good while, with 18 hours as the upper limit."
    ]
  },
  {
    "v": "0.700",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet en liten uklarhet i poolish-blandesteget: steget er satt av ~20 minutter, men teksten sier «elt totalt 10–12 min», så planens tidsavsetning og eltetiden kunne virke motstridende. La til en presisering om at de ~20 minuttene er samlet arbeidstid — tilsetting av mel og salt, elting og temperaturmåling — mens selve eltingen er den kortere tiden. Den faktiske eltetiden står fortsatt. (En større idé fra samme gjennomgang — å oppgi en anbefalt vanntemperatur i °C i blandestegene, slik hurtigdeig allerede gjør — er lagt i backloggen.)"
    ],
    "changes_en": [
      "Cleared up a small ambiguity in the poolish mixing step: the step is allotted ~20 minutes, but the text says “knead 10–12 min total”, so the plan's time allocation and the kneading time could look contradictory. Added a note that the ~20 minutes is total working time — adding flour and salt, kneading and measuring temperature — while the kneading itself is the shorter time. The actual kneading time is still shown. (A larger idea from the same review — showing a recommended water temperature in °C in the mixing steps, the way the quick dough already does — has been added to the backlog.)"
    ]
  },
  {
    "v": "0.699",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre kjøleskapsråd: hvor du setter deigen betyr mer enn tallet på hjulet. Et kjøleskap er sonedelt — kaldeste sone er bakerst og nederst, over grønnsakskuffen (ca. 2–4 °C), mens døra er varmest (5–7 °C) og svinger hver gang du åpner. Tipset ber deg nå sette deigboksene i den kaldeste sonen og unngå døra, så hevingen blir jevn. «Hvorfor»-tekstene om kald fermentering er samtidig strammet til 2–4 °C (der deigen faktisk står), i stedet for et bredere kjøleskaps-snitt."
    ],
    "changes_en": [
      "Better fridge advice: where you put the dough matters more than the number on the dial. A fridge is zoned — the coldest zone is at the back and bottom, above the vegetable drawer (about 2–4 °C), while the door is the warmest (5–7 °C) and swings every time you open it. The tip now tells you to place the dough boxes in the coldest zone and avoid the door, so the rise stays even. The “Why” texts about cold fermentation are tightened to 2–4 °C (where the dough actually sits) rather than a broader fridge average."
    ]
  },
  {
    "v": "0.698",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Trakk tilbake gjærtipset fra forrige versjon. Rådet om å øke gjæren ~25–30 % «hvis kjøleskapet er kaldere enn ~4 °C» bygde på feil premiss for et norsk publikum: 1–3 °C er et riktig innstilt kjøleskap (Mattilsynet anbefaler 0–4 °C), ikke et for kaldt et — så teksten ville fått folk med korrekt temperatur til å legge til gjær de ikke trenger. Fjernet gjærprosenten fra den delte teksten; det gode rådet «mål med termometer» er beholdt, nå med riktig referanse (under 4 °C). Kjøleskapstemperaturen er også harmonisert til 0–4 °C i «Hvorfor»-tekstene (var 2–5 °C). Selve temperatur-kompensasjonen hører hjemme som et faktisk inndata-valg i Finjuster og er lagt i backloggen (F13), sammen med at benketida (steg 7) bør skalere med romtemperatur slik den korte hevingen allerede gjør (F14)."
    ],
    "changes_en": [
      "Rolled back the yeast tip from the previous version. The advice to raise the yeast ~25–30% “if your fridge runs colder than ~4 °C” rested on a wrong premise for a Norwegian audience: 1–3 °C is a correctly set fridge (food-safety guidance is 0–4 °C), not too cold — so the text would have told people with correct temperatures to add yeast they don't need. Removed the yeast percentage from the shared text; the good advice “measure with a thermometer” is kept, now with the right reference (below 4 °C). The fridge temperature is also harmonized to 0–4 °C in the “Why” texts (was 2–5 °C). The actual temperature compensation belongs as a real input in Fine-tune and has been added to the backlog (F13), together with the bench time (step 7) that should scale with room temperature the way the short rise already does (F14)."
    ]
  },
  {
    "v": "0.697",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet fire funn fra en grundig oppskriftsgjennomgang. (1) Forme-steget og kald-heving-steget hadde ordrett samme «Hvorfor»-tekst om kald fermentering — forme-steget har nå sin egen begrunnelse om runding og emner. (2) Stekesteget sa «pizzastein/-stål MÅ varmes minst 45 min» også for pizzaovn, der dekket er varmt på ~15–20 min; teksten er nå ovnstype-bevisst (vanlig ovn beholder 45 min). (3) Kjøleskapstemperaturen var oppgitt tre ulike steder (2–8 / 4 / 2–5 °C) — nå harmonisert til 2–5 °C, og steg-teksten «ca. 4 timer» er i tråd med «Hvorfor». (4) Poolish-gjæren er trukket litt ned for lange forspill (15–16 t), som ellers kunne toppe og falle før du blander; standard 14 t er uendret. I tillegg: et nytt tips om å øke gjæren ~25–30 % hvis kjøleskapet ditt er kaldere enn ~4 °C, og et mer realistisk hevekriterium på den korte romtemperaturhevingen (ca. 30–50 %, ikke «dobbelt»)."
    ],
    "changes_en": [
      "Fixed four findings from a thorough recipe review. (1) The shaping step and the cold-rise step had word-for-word the same “Why” text about cold fermentation — the shaping step now has its own rationale about rounding and balls. (2) The bake step said “the pizza stone/steel MUST preheat at least 45 min” even for a pizza oven, where the deck is hot in ~15–20 min; the text is now oven-aware (a regular oven keeps 45 min). (3) The fridge temperature was stated three different ways (2–8 / 4 / 2–5 °C) — now harmonized to 2–5 °C, and the step text “about 4 hours” matches the “Why”. (4) The poolish yeast is nudged down a little for long preferments (15–16 h), which could otherwise peak and collapse before you mix; the standard 14 h is unchanged. Plus: a new tip to raise the yeast ~25–30% if your fridge runs colder than ~4 °C, and a more realistic rise cue for the short room-temperature rise (about 30–50%, not “doubled”)."
    ]
  },
  {
    "v": "0.696",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fikset feil ventetekst for poolish/biga. Ventebanneret etter «Lag poolish» (og «Lag biga») sa «La stå i kjøleskap» når planen hadde en kjøleskapspause etterpå — men forspillet gjærer jo på benken ved romtemperatur. Nå står det riktig «🫧 Poolish gjærer i romtemperatur» (og tilsvarende for biga), med tiden i timer i stedet for avrundet til «1 dag». Velger du kjøleskaps-poolish, står det «❄️ Poolish modnes kaldt»."
    ],
    "changes_en": [
      "Fixed the wrong wait text for poolish/biga. The wait banner after “Make poolish” (and “Make biga”) said “Rest in the fridge” when the plan had a fridge pause afterwards — but the preferment actually ferments on the counter at room temperature. It now correctly reads “🫧 Poolish ferments at room temperature” (and likewise for biga), with the time in hours instead of rounded to “1 day”. If you choose a cold poolish, it reads “❄️ Poolish matures cold”."
    ]
  },
  {
    "v": "0.695",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ikonraden (🧾 / 📋 / 💡) på hvert steg hoppet opp og ned når du åpnet eller lukket understeg. Årsaken var at raden lå under prosateksten, som forsvinner når understeg tar over. Nå er ikonraden forankret rett under steg-tittelen, og alt du åpner (ingredienser, tekst/understeg, tips) utvider seg nedenfor — så ikonene holder seg i ro uansett hva du velger."
    ],
    "changes_en": [
      "The icon row (🧾 / 📋 / 💡) on each step jumped up and down when you opened or closed sub-steps. The cause was that the row sat below the prose text, which disappears when sub-steps take over. The icon row is now anchored right under the step title, and everything you open (ingredients, text/sub-steps, tips) expands below it — so the icons stay put no matter what you choose."
    ]
  },
  {
    "v": "0.694",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fikset at tidspunktet på hvert steg i tidsplanen brakk rart midt i datoen (f.eks. «man 3. aug kl.» på én linje og «15:10 · 30 min» på neste). Tiden holdes nå samlet på én linje. Får den og stedet ikke plass sammen, flyttes stedet ned i stedet for å splitte selve datoen."
    ],
    "changes_en": [
      "Fixed the timestamp on each schedule step breaking oddly in the middle of the date (e.g. “Mon Aug 3,” on one line and “15:10 · 30 min” on the next). The time is now kept together on one line. If it and the location don't fit together, the location moves down instead of splitting the date itself."
    ]
  },
  {
    "v": "0.693",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Understeg erstatter nå prosateksten i stedet for å komme i tillegg. Avsnittsteksten og understegene på et steg er i praksis samme innhold — samme oppskrift, én gang som paragraf og én gang som punktliste. Før viste vi begge når du åpnet 📋, så du leste det samme to ganger. Nå viker prosateksten for sjekklista når du åpner understeg (akkurat som Fokus-modus allerede gjør), og kommer tilbake når du lukker. Steg uten understeg beholder teksten som før. Ett format per steg, ingen dobbeltlesing."
    ],
    "changes_en": [
      "Sub-steps now replace the prose text instead of appearing in addition to it. A step's paragraph and its sub-steps are essentially the same content — the same recipe, once as a paragraph and once as a checklist. Previously we showed both when you opened 📋, so you read the same thing twice. Now the prose gives way to the checklist when you open sub-steps (just like Focus mode already does), and comes back when you close them. Steps without sub-steps keep their text as before. One format per step, no double reading."
    ]
  },
  {
    "v": "0.692",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fokus-modus viser mer av planen. Den enorme overskriften er krympet fra 32px til 21px, og i stedet for bare «Neste: …» får du nå en liten «Kommer»-stabel med de neste stegene (tid + tittel) rett under det aktive steget — trykk på et av dem for å hoppe dit. Slik ser du hva som venter uten å forlate fokus, og de store Ferdig-/Forrige-knappene og avhukingsflatene er uendret (laget for deigete fingre)."
    ],
    "changes_en": [
      "Focus mode shows more of the plan. The huge heading is shrunk from 32px to 21px, and instead of just “Next: …” you now get a small “Coming up” stack of the next steps (time + title) right below the active step — tap one to jump there. That way you see what's ahead without leaving focus, and the large Done/Back buttons and check-off targets are unchanged (built for doughy fingers)."
    ]
  },
  {
    "v": "0.691",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Selve stegteksten er tilbake på hvert kort. I forrige runde havnet også «hva du gjør»-teksten bak et ikon — nå står den alltid synlig øverst på steget igjen. Ingrediensene er samtidig blitt et rent 🧾-ikon på lik linje med understeg (📋) og tips (💡), så detaljraden er ryddig og kompakt. Trykk på ikonet for å hente fram akkurat det du trenger."
    ],
    "changes_en": [
      "The step text itself is back on every card. In the last round the “what you do” text also ended up behind an icon — now it's always visible at the top of the step again. Ingredients have at the same time become a plain 🧾 icon, on par with sub-steps (📋) and tips (💡), so the detail row stays tidy and compact. Tap an icon to bring up exactly what you need."
    ]
  },
  {
    "v": "0.690",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Renere stegkort i tidsplanen (skisse B \u2014 \u00abp\u00e5 foresp\u00f8rsel\u00bb). Hvert kort viser n\u00e5 bare selve handlingen (tittel, tid, sted). Ingrediensene ligger bak en \u00ab\ud83e\uddfe N ingredienser\u00bb-brikke, og fremgangsm\u00e5te (\ud83d\udccb) og tips (\ud83d\udca1) er rene ikoner \u2014 tapp for \u00e5 hente fram akkurat det du trenger. Det gj\u00f8r planen mye mer kompakt; ingrediens-boksene tok f\u00f8r mye plass p\u00e5 hvert steg. Fokus og \u00abn\u00e5\u00bb-uthevingen er uendret."
    ],
    "changes_en": [
      "Cleaner step cards in the schedule (sketch B \u2014 \u201con demand\u201d). Each card now shows just the action itself (title, time, place). Ingredients sit behind a \u201c\ud83e\uddfe N ingredients\u201d chip, and the how-to (\ud83d\udccb) and tips (\ud83d\udca1) are plain icons \u2014 tap to bring up exactly what you need. This makes the plan far more compact; the ingredient boxes used to take a lot of space on every step. Focus and the \u201cnow\u201d highlight are unchanged."
    ]
  },
  {
    "v": "0.689",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Flyttet «Kopier / Kalender / Lagre» fra toppen av tidsplanen ned til bunnen (under «Med denne planen»). De brukes sjelden og er handlinger du gj\u00f8r ETTER at planen er lest \u2014 s\u00e5 de tar ikke lenger toppplass fra selve stegene. Ikke sticky, bare nederst. \u00ab\ud83d\udd0e Fokus\u00bb blir v\u00e6rende \u00f8verst."
    ],
    "changes_en": [
      "Moved \"Copy / Calendar / Save\" from the top of the schedule down to the bottom (under \"With this plan\"). They are rarely used and are actions you take AFTER reading the plan \u2014 so they no longer take prime space above the steps. Not sticky, just at the bottom. \"\ud83d\udd0e Focus\" stays at the top."
    ]
  },
  {
    "v": "0.688",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Understeg og Tips er flyttet fra to globale brytere til sm\u00e5 ikoner PER STEG \u2014 kun p\u00e5 steg som faktisk har innhold. F\u00f8r sl\u00e5r \u00e9n bryter detaljene p\u00e5 for ALLE steg samtidig (en vegg av tekst); n\u00e5 er alt sammensl\u00e5tt som standard (en ryddig plan), og du \u00e5pner understeg eller tips der du trenger dem med \u00ab\ud83d\udccb Understeg\u00bb / \u00ab\ud83d\udca1 Tips\u00bb p\u00e5 det enkelte steget. Fokus er uendret (egen modus)."
    ],
    "changes_en": [
      "Substeps and Tips have moved from two global toggles to small PER-STEP icons \u2014 only on steps that actually have content. Before, one toggle turned the details on for ALL steps at once (a wall of text); now everything is collapsed by default (a tidy plan), and you open substeps or tips where you need them via \u201c\ud83d\udccb Substeps\u201d / \u201c\ud83d\udca1 Tips\u201d on the individual step. Focus is unchanged (its own mode)."
    ]
  },
  {
    "v": "0.687",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «Ulagret oppsett — endringer lagres ikke automatisk»-varselet øverst i tidsplanen. Det var unødvendig støy. «Du redigerer <deig>» vises fortsatt når du faktisk har åpnet en lagret deig."
    ],
    "changes_en": [
      "Removed the \"Unsaved setup — changes are not saved automatically\" notice at the top of the schedule. It was needless noise. \"You are editing <dough>\" still shows when you have actually opened a saved dough."
    ]
  },
  {
    "v": "0.686",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «👉 Neste»-stripa med nedtelling øverst i tidsplanen. Den duplikerte det lista allerede viser, brukte et annet «neste»-begrep enn selve stegene (den pekte forbi steget du står på), og konkurrerte med «nå»-uthevingen og Fokus-modus om oppmerksomheten. Tidsplanen er nå roligere: timelinen med sin egen nå-utheving for oversikt, og Fokus-modus for ett steg om gangen. Andre måter å varsle «neste» på kan komme senere."
    ],
    "changes_en": [
      "Removed the \"👉 Next\" strip with countdown at the top of the schedule. It duplicated what the list already shows, used a different notion of \"next\" than the steps themselves (it pointed past the step you're on), and competed with the \"now\" highlight and Focus mode for attention. The schedule is calmer now: the timeline with its own \"now\" highlight for the overview, and Focus mode for one step at a time. Other ways to signal \"next\" may come later."
    ]
  },
  {
    "v": "0.685",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Admin kan nå legge til, endre og slette meltyper direkte i appen (Admin → «🌾 Rediger meltyper»), uten en ny appversjon — fullfører eksternaliseringen fra forrige oppdatering. Hvert mel har navn, protein, W, hydrering og gjæringsvindu.",
      "Kald-hevings-taket følger nå sterkeste mel automatisk: legger admin inn et mel som tåler lengre gjæring, strekker kald-slideren seg tilsvarende (før var taket et fast tall). «Annet mel / ikke i listen» styres fortsatt av appen og kan ikke redigeres bort."
    ],
    "changes_en": [
      "Admin can now add, edit and delete flour types directly in the app (Admin → \"🌾 Edit flours\"), without a new app version — completing the externalization from the previous update. Each flour has name, protein, W, hydration and a fermentation window.",
      "The cold-proof cap now follows the strongest flour automatically: if admin adds a flour that tolerates a longer fermentation, the cold slider extends accordingly (previously the cap was a fixed number). \"Other / not listed\" is still controlled by the app and cannot be edited away."
    ]
  },
  {
    "v": "0.684",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Meltypene ligger nå på server (som kjernetallene bak «Formler»), så nye mel kan legges til og egenskaper endres uten en ny appversjon. Mel-nedtrekkene bygges nå fra dataene, med en innebygd standardliste som fallback hvis serveren ikke svarer — så appen virker likt offline. Dette er første del; selve admin-redigeringen av mel kommer i neste steg."
    ],
    "changes_en": [
      "The flour types now live on the server (like the core numbers behind \"Formulas\"), so new flours can be added and properties changed without a new app version. The flour dropdowns are now built from the data, with a built-in default list as a fallback if the server does not respond — so the app works the same offline. This is the first part; the admin editing of flours comes in the next step."
    ]
  },
  {
    "v": "0.683",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet feil merkelapp: et steg som havner utenfor den ledige tiden du har satt av til pizza sa «⚠ utenfor spisetid» — men du spiser jo ikke da, du jobber. Merket sier nå «⚠ utenfor ledig tid». Samtidig ble merket og hjelpeteksten oversatt (viste norsk i engelsk modus): «outside free time»."
    ],
    "changes_en": [
      "Fixed a wrong label: a step landing outside the free time you have set aside for pizza said \"⚠ outside eating time\" — but you are not eating then, you are working. The badge now says \"⚠ outside free time\". At the same time the badge and its tooltip were translated (they showed Norwegian in English mode)."
    ]
  },
  {
    "v": "0.682",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan slutter å over-tilby ekstremt lange gjæringer. Etter at kald-taket ble hevet til 120 timer (v0.680) foreslo den ofte ~115-timers deiger som bare Manitoba tåler, fordi «lengst = mest smak» avgjorde. Nå veies det inn hvor mange meltyper som faktisk støtter tiden: en 48-timers deig som 5 mel takler foreslås framfor en 115-timers bare ett mel takler. Innen samme dekning gjelder fortsatt lengst = mest smak, og de lange variantene ligger fremdeles under «Se flere alternativer»."
    ],
    "changes_en": [
      "Smart plan stops over-offering extremely long fermentations. After the cold cap was raised to 120 hours (v0.680) it often suggested ~115-hour doughs that only Manitoba can handle, because \"longest = most flavor\" decided. Now it factors in how many flour types actually support the time: a 48-hour dough that 5 flours handle is suggested over a 115-hour one only one flour handles. Within the same coverage, longest = most flavor still applies, and the long variants remain under \"See more options\"."
    ]
  },
  {
    "v": "0.681",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan lar deg nå styre hvilke metoder du blir tilbudt: under søket ligger en sammenleggbar «🎛️ Metoder du blir tilbudt» med avhuking for hver av de seks metodene (Langtidsdeig, Poolish, Biga, Mania, Hurtig, Kveld). Skrur du av en metode, foreslås den ikke lenger. Valget huskes, og et aktivt filter vises i overskriften («3 av 6»).",
      "Filteret gjelder kun forslagene i Smart-plan — den manuelle metodevelgeren er uberørt, så du kan alltid velge enhver metode selv. Skrur du av alle, viser Smart-plan alle likevel (aldri en tom skjerm) med en påminnelse om å skru på minst én."
    ],
    "changes_en": [
      "Smart plan now lets you control which methods you are offered: under the search there is a collapsible \"🎛️ Methods you are offered\" with a checkbox for each of the six methods (Long-ferment, Poolish, Biga, Mania, Quick, Evening). Turn a method off and it is no longer suggested. The choice is remembered, and an active filter is shown in the header (\"3 of 6\").",
      "The filter only affects the Smart-plan suggestions — the manual method picker is untouched, so you can always choose any method yourself. If you turn them all off, Smart plan shows all of them anyway (never an empty screen) with a reminder to turn at least one on."
    ]
  },
  {
    "v": "0.680",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kald-hevingen kan nå gå til 120 timer (5 døgn), opp fra 78. Sterke mel (Caputo Manitoba Oro, W340–390) tåler reelt lange kald-gjæringer, så taket var unødvendig lavt. Melspesifikke og overmodnings-varslene (begge ignorerbare) informerer om den lange enden i stedet for å sperre den — overmodnings-varselet er den ærlige bremsen i 96–120-timers-sona."
    ],
    "changes_en": [
      "Cold proof can now go up to 120 hours (5 days), up from 78. Strong flours (Caputo Manitoba Oro, W340–390) genuinely handle long cold fermentations, so the cap was needlessly low. The flour-specific and over-fermentation warnings (both dismissible) inform about the long end rather than blocking it — the over-fermentation warning is the honest brake in the 96–120 hour zone."
    ]
  },
  {
    "v": "0.679",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at teksten under «Mer → Visning» (Tema og Skriftstørrelse) var mindre enn resten av skjermen. Seksjonen var feilaktig «zoom-kansellert» (holdt på fast chrome-størrelse), mens nabo-seksjonen Språk/Enheter skalerte med lesetekst. Nå skalerer den likt, og etikettene matcher nabo-seksjonen på alle skriftstørrelser."
    ],
    "changes_en": [
      "Fixed the text under \"More → Display\" (Theme and Font size) being smaller than the rest of the screen. The section was mistakenly \"zoom-cancelled\" (held at a fixed chrome size), while the neighboring Language/Units section scaled with the reading text. It now scales the same way, and the labels match the neighboring section at every font size."
    ]
  },
  {
    "v": "0.678",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Overmodnings-varselet (det generelle «lang gjæringstid»-varselet ved ~4 døgn) er nå softere for «Annet mel / ikke i listen»: i stedet for «⚠️ fare for overfermentering» sier det «🌾 Lang gjæring for et ukjent mel — de fleste blir overmodne rundt her, men et veldig sterkt mel kan tåle det». Den nyttige sansesjekken beholdes; den falske sikkerheten om et mel appen ikke kjenner er borte. For kjente meltyper er varselet uendret."
    ],
    "changes_en": [
      "The over-fermentation warning (the general \"long fermentation time\" one at ~4 days) is now gentler for \"Other / not listed\": instead of \"⚠️ risk of over-fermentation\" it says \"🌾 Long fermentation for an unknown flour — most over-ripen around here, but a very strong flour may handle it\". The useful sensory check is kept; the false certainty about a flour the app doesn't know is gone. For known flours the warning is unchanged."
    ]
  },
  {
    "v": "0.677",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt melvalg «Annet mel / ikke i listen»: bruker du et mel appen ikke kjenner, slår dette av det mel-spesifikke gjærings-/hydreringsvarselet — appen maser ikke lenger om et spenn den umulig kan vite. Melet påvirker verken kald-taket eller Smart-plan-forslagene.",
      "«Verdt å vite»-hintene i «Jeg begynner nå» kan nå ignoreres (egen «Ignorer»-knapp), akkurat som varsler ellers i appen. I «Planlagt steketid» (der du har en frist) vises fortsatt hele sjekklista uten ignorering, så et reelt tidsproblem ikke blir skjult ved en port du ikke burde passere uoppmerksomt."
    ],
    "changes_en": [
      "New flour option \"Other / not listed\": if you use a flour the app does not know, this turns off the flour-specific fermentation/hydration warning — the app no longer nags about a range it cannot possibly know. The flour affects neither the cold-proof cap nor the Smart-plan suggestions.",
      "The \"Worth knowing\" hints in \"I start now\" can now be dismissed (their own \"Ignore\" button), just like warnings elsewhere in the app. In \"Planned baking time\" (where you have a deadline) the full checklist still shows without dismissal, so a real timing problem is not hidden at a gate you should not pass unnoticed."
    ]
  },
  {
    "v": "0.676",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Langtidsdeig får nå merkede tidsvalg rett under metodevalget i wizarden, akkurat som hurtigdeig og kveldsdeig: 24t «Rett fram», 48t «Mer smak», 72t «Full smak». Før lå kald-hevingen bare som en naken tall-slider gjemt i Finjuster. Slideren er der fortsatt for presis justering — begge setter samme verdi, så det er ett sannhetsgrunnlag."
    ],
    "changes_en": [
      "Long-ferment dough now gets labelled time options right under the method choice in the wizard, just like quick dough and evening dough: 24h \"Straightforward\", 48h \"More flavor\", 72h \"Full flavor\". Before, the cold proof was only a bare numeric slider tucked away in Fine-tune. The slider is still there for precise adjustment — both set the same value, so there is a single source of truth."
    ]
  },
  {
    "v": "0.675",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at tittelen i planleggings-statuslinja ble kuttet midt i ordet («Neapolitan pizza · Lon…»). Den viser nå det korte typenavnet uten det overflødige «pizza»-halet, og brytes til to linjer i stedet for å avkortes — så hele metoden alltid er lesbar."
    ],
    "changes_en": [
      "Fixed the planner status-bar title being cut off mid-word (\"Neapolitan pizza · Lon…\"). It now shows the short type name without the redundant \"pizza\" suffix, and wraps to two lines instead of truncating — so the full method is always readable."
    ]
  },
  {
    "v": "0.674",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Jeg begynner nå» er en kom-i-gang-modus uten frist — så kvalitetssjekken viser nå en rolig kvittering («✓ Du setter i gang nå · klar ca. …») i stedet for en «X ting å se på»-teller. Tips om mel, overmodning eller et steg midt på natta står fortsatt, men som myke «💡 Verdt å vite»-notater, ikke som blokkerende varsler. I «Planlagt steketid» (der du har en frist) er sjekken uendret."
    ],
    "changes_en": [
      "\"I start now\" is a get-going mode with no deadline — so the quality check now shows a calm receipt (\"✓ You start now · ready around …\") instead of an \"X things to look at\" counter. Tips about flour, over-ripening or a step landing in the middle of the night still appear, but as soft \"💡 Worth knowing\" notes rather than blocking warnings. In \"Planned baking time\" (where you do have a deadline) the check is unchanged."
    ]
  },
  {
    "v": "0.673",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at «lag pizza nå» kunne sette oppstarten bakover i tid: valgte du en lang metode mens «Jeg begynner nå» var på, tvang appen deg likevel over til en planlagt steketid — som med standardtiden kunne havne for tidlig. Nå respekteres «Jeg begynner nå», og deigen planlegges framover fra nå.",
      "I «Planlagt steketid»-modus flyttes standard-steketiden nå automatisk langt nok fram til at oppstarten faktisk er mulig, i stedet for å foreslå et tidspunkt som allerede har passert."
    ],
    "changes_en": [
      "Fixed \"make pizza now\" sometimes pushing the start time into the past: picking a long method while \"I start now\" was on still forced you over to a planned baking time — which, with the default time, could land too early. \"I start now\" is now respected, and the dough is planned forward from now.",
      "In \"Planned baking time\" mode the default baking time now moves forward automatically until the start is actually feasible, instead of suggesting a time that has already passed."
    ]
  },
  {
    "v": "0.672",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet «🛒 Handleliste»-knappen igjen — ingrediens-totalene finnes allerede i oppskrift-fanen og i «Kopier tidsplan», så en egen handleliste var overflødig."
    ],
    "changes_en": [
      "Removed the \"🛒 Shopping list\" button again — the ingredient totals are already in the recipe tab and in \"Copy schedule\", so a separate shopping list was redundant."
    ]
  },
  {
    "v": "0.671",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at kjøletiden på deig-kortene (i «Mer» → Deiger) viste den norske forkortelsen «t» i engelsk modus («48t fridge»). Den viser nå «48h fridge»."
    ],
    "changes_en": [
      "Fixed the fridge time on the dough cards (in \"More\" → Doughs) showing the Norwegian abbreviation \"t\" in English mode (\"48t fridge\"). It now shows \"48h fridge\"."
    ]
  },
  {
    "v": "0.670",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Statuslinja i planleggingen viser nå hvilket mel planen bruker, sammen med oppstart og steketid — så du med ett blikk ser om planen matcher melet du faktisk har hjemme."
    ],
    "changes_en": [
      "The planner's status bar now shows which flour the plan uses, alongside the start and bake times — so you can see at a glance whether the plan matches the flour you actually have at home."
    ]
  },
  {
    "v": "0.669",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet opp i skriftstørrelsene i planleggingen: metode-kortene ble ved en feil rendret litt større enn resten av kontrollene (de manglet i «kontroller beholder størrelse»-lista), noe som fikk meltype-velgeren til å se mindre ut. Nå deler metode, meltype og de andre kontrollene samme jevne skala."
    ],
    "changes_en": [
      "Tidied up the font sizes in the planner: the method cards were accidentally rendered a bit larger than the other controls (they were missing from the 'controls keep their size' list), which made the flour-type picker look smaller. Method, flour type and the other controls now share one even scale."
    ]
  },
  {
    "v": "0.668",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Engelsk oversettelse av PC-visningen: meny, metodekort, planleggings-boks, glidebryter-etiketter og fane-navnene (Steg for steg/Oppskrift/Notater) vises nå på engelsk. Bytter du språk på PC, oppdateres planen med det samme."
    ],
    "changes_en": [
      "English translation of the desktop view: menu, method cards, the planning box, slider labels and the tab names (Step by step/Recipe/Notes) now show in English. Switching language on desktop updates the plan right away."
    ]
  },
  {
    "v": "0.667",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tilgjengelighet: avhaking av steg, ingredienser og understeg er nå ekte avkryssingsbokser du kan bruke med tastatur (Enter/mellomrom), og den levende statuslinja annonseres for skjermlesere."
    ],
    "changes_en": [
      "Accessibility: checking off steps, ingredients and substeps are now real checkboxes you can operate with the keyboard (Enter/Space), and the live status bar is announced to screen readers."
    ]
  },
  {
    "v": "0.666",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Deiger-lista har fått søk, filter på metode og sortering (nyest, eldst, best vurdert) — så den holder seg ryddig når du har mange deiger.",
      "Ferdige deiger viser nå kjøletid og hydrering i oversikten, så vurderingen henger sammen med de konkrete tallene («72t · 65 % → ★★★★»)."
    ],
    "changes_en": [
      "The Doughs list now has search, filter by method and sorting (newest, oldest, highest rated) — so it stays tidy when you have many doughs.",
      "Finished doughs now show fridge time and hydration in the overview, so the rating ties to the concrete numbers (\"72h · 65% → ★★★★\")."
    ]
  },
  {
    "v": "0.665",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ny «🛒 Handleliste»-knapp: kopier en samlet liste med totale ingrediensmengder å handle etter — spesielt nyttig for fler-dagers metoder der ingrediensene ellers er delt over flere steg.",
      "Rettet en bitteliten avrundingsforskjell i biga: overgjærings-varselet og tidsplanen regner nå romhevingen helt likt."
    ],
    "changes_en": [
      "New \"🛒 Shopping list\" button: copy a consolidated list of total ingredient amounts to shop from — especially handy for multi-day methods where the ingredients are otherwise split across several steps.",
      "Fixed a tiny rounding difference in biga: the over-fermentation warning and the schedule now compute the room rise identically."
    ]
  },
  {
    "v": "0.664",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "«Mer»-fanen ligger nå lengst til høyre i menylinja (byttet plass med Smart-plan) — der en «mer»-meny vanligvis hører hjemme. Ny rekkefølge: Planlegging · Tidsplan · Smart-plan · Mer.",
      "Fylte inn manglende «hvorfor»-forklaringer på flere steg i hurtigdeig og Mania-poolish, så hvert steg i alle metoder nå forklarer hvorfor det er der."
    ],
    "changes_en": [
      "The \"More\" tab now sits furthest right in the menu bar (swapped with Smart plan) — where a \"more\" menu usually belongs. New order: Planner · Schedule · Smart plan · More.",
      "Filled in missing \"why\" explanations on several steps in the quick dough and Mania poolish, so every step in every method now explains why it is there."
    ]
  },
  {
    "v": "0.663",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan foreslår nå et smartere standard-tidspunkt. Åpner du appen tidlig nok på dagen til at en ekte deig rekker, foreslår den i dag kl. 18:00 — ellers hopper den til i morgen kl. 18:00. Før foreslo den alltid samme dag, som på ettermiddagen ga for kort tid og rare forslag. (Klokkeslettet er nå 18:00, som resten av appen.)"
    ],
    "changes_en": [
      "Smart plan now suggests a smarter default time. If you open the app early enough in the day for a real dough to fit, it suggests today at 18:00 — otherwise it jumps to tomorrow at 18:00. It used to always suggest the same day, which left too little time in the afternoon and gave odd suggestions. (The time is now 18:00, matching the rest of the app.)"
    ]
  },
  {
    "v": "0.662",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Alle varsler har nå en tydelig «Ignorer»-knapp i stedet for en diskré liten ✕ — samme handling (skjul varselet), men mye lettere å se. Smart-plan-varslene, som manglet den helt, har fått den også. Skillet består: du kan skjule et varsel om en fysisk grense (mel, overfermentering), men det får ikke en «det går bra likevel»-godkjenning som ville tilslørt et ekte kvalitetsproblem."
    ],
    "changes_en": [
      "Every warning now has a clear \"Ignore\" button instead of a discreet little ✕ — same action (hide the warning), but much easier to spot. The Smart plan warnings, which had none at all, got it too. The distinction stands: you can hide a warning about a physical limit (flour, over-fermentation), but it does not get an \"it's fine anyway\" acceptance that would mask a real quality problem."
    ]
  },
  {
    "v": "0.661",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan foreslår ikke lenger umulige deiger. Søket kappes ved det sterkeste melets tak (78t), så du aldri får forslag på ~145t «ingen mel dekker dette». Og når ingenting kan startes akkurat nå (f.eks. pizza om én time), foreslås den deigen som starter nærmest nå — typisk en hurtigdeig — i stedet for en flere-døgns deig som skulle startet for lenge siden. Korte deiger viser nå «alle mel passer» i stedet for en skremmende «ingen mel»-melding."
    ],
    "changes_en": [
      "Smart plan no longer suggests impossible doughs. The search is capped at the strongest flour's limit (78h), so you never get ~145h \"no flour covers this\" suggestions. And when nothing can start right now (e.g. pizza in an hour), it suggests the dough that starts closest to now — usually a quick dough — instead of a multi-day dough that should have started long ago. Short doughs now show \"any flour works\" instead of a scary \"no flour\" message."
    ]
  },
  {
    "v": "0.660",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Endringsloggen er nå tospråklig — hele «Hva er nytt» vises på engelsk når appen står på engelsk, og på norsk ellers. Alle tidligere versjoner er oversatt."
    ],
    "changes_en": [
      "The changelog is now bilingual — all of \"What's new\" shows in English when the app is set to English, and in Norwegian otherwise. Every past version has been translated."
    ]
  },
  {
    "v": "0.659",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Kappet kjøleskaps-spaken ved 78 timer (var 144t). Det sterkeste melet i appen, Caputo Manitoba Oro, er ratet for 24–78t — ingen mel tåler mer, så spaken lovet før noe ingen deig kunne innfri. Eldre oppsett med lengre heving justeres automatisk ned til 78t."
    ],
    "changes_en": [
      "Capped the fridge slider at 78 hours (was 144h). The strongest flour in the app, Caputo Manitoba Oro, is rated for 24–78h — no flour handles more, so the slider promised something no dough could deliver. Older setups with longer proofs are automatically adjusted down to 78h."
    ]
  },
  {
    "v": "0.658",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Versjonsnummeret øverst er nå klikkbart — trykk det for å åpne «Hva er nytt» og se endringsloggen. (Fungerte fra før via PC-stempelet og «Hva er nytt» nederst i Mer.)"
    ],
    "changes_en": [
      "The version number at the top is now clickable — tap it to open \"What's new\" and see the changelog. (This already worked via the PC stamp and \"What's new\" at the bottom of More.)"
    ]
  },
  {
    "v": "0.657",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet det doble Deiger-inngangspunktet på mobil: 🍽️-ikonet i topplinja er borte. Aktive deiger vises fortsatt via teller-badgen på «Mer»-fanen (der Deiger flyttet inn i v0.653), så det trengs bare ett sted."
    ],
    "changes_en": [
      "Removed the duplicate Doughs entry point on mobile: the 🍽️ icon in the top bar is gone. Active doughs still show up via the counter badge on the \"More\" tab (where Doughs moved in v0.653), so one place is enough."
    ]
  },
  {
    "v": "0.656",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at «Vis»-knappen i Smart-plan («Når er du ledig?») viste norsk tekst i engelsk modus helt til første trykk. Etiketten språktilpasses nå med det samme (Show/Hide)."
    ],
    "changes_en": [
      "Fixed the \"Show\" button in Smart plan (\"When are you free?\") displaying Norwegian text in English mode until the first tap. The label now switches languages right away (Show/Hide)."
    ]
  },
  {
    "v": "0.655",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Tidsplan er nå «tom» når du åpner appen uten å ha gjort et valg — i stedet for å vise en default-plan du aldri valgte. Det tomme feltet forklarer og guider deg til de to inngangene: Smart-plan og Planlegg selv. Planen fylles så snart du fullfører Planlegging, bruker Smart-plan eller åpner en lagret deig."
    ],
    "changes_en": [
      "The Schedule is now \"empty\" when you open the app without having made a choice — instead of showing a default plan you never picked. The empty state explains and guides you to the two entry points: Smart plan and Plan it yourself. The schedule fills in as soon as you finish the Planner, use Smart plan, or open a saved dough."
    ]
  },
  {
    "v": "0.654",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet at Smart-plan viste norske metodenavn (som «Langtidsdeig») også i engelsk modus. Metodeforslagene i søket oversettes nå riktig (Long-ferment dough, Quick dough, Evening dough osv.)."
    ],
    "changes_en": [
      "Fixed Smart plan showing Norwegian method names (like \"Langtidsdeig\") even in English mode. The method suggestions in the search now translate correctly (Long-ferment dough, Quick dough, Evening dough, etc.)."
    ]
  },
  {
    "v": "0.653",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Ryddet i fanene: «Info» heter nå «☰ Mer», og «Deiger» er flyttet inn øverst i Mer. Da er det fire faner igjen — Planlegging, Tidsplan, Smart-plan og Mer. Du ser fortsatt aktive deiger via 🍽️-telleren i toppen, og «Mer»-fanen får en liten teller når du har deiger på gang."
    ],
    "changes_en": [
      "Tidied up the tabs: \"Info\" is now \"☰ More\", and \"Doughs\" has moved to the top of More. That leaves four tabs — Planner, Schedule, Smart plan and More. You still see active doughs via the 🍽️ counter at the top, and the \"More\" tab gets a small counter when you have doughs in progress."
    ]
  },
  {
    "v": "0.652",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Byttet pulsen på det aktive Smart-plan-feltet til en mykere «glød» — et varmt halo som puster rolig inn og ut i stedet for en skarp ring. Følger fortsatt «redusert bevegelse»."
    ],
    "changes_en": [
      "Swapped the pulse on the active Smart plan field for a softer \"glow\" — a warm halo that breathes gently in and out instead of a sharp ring. Still respects \"reduced motion\"."
    ]
  },
  {
    "v": "0.651",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Byttet «👆 Trykk her»-teksten i Smart-plan-velgeren med en rolig pulserende ramme rundt det aktive feltet — samme guiding, mindre tekst. Følger «redusert bevegelse»-innstillingen (da står ringen stille)."
    ],
    "changes_en": [
      "Replaced the \"👆 Tap here\" text in the Smart plan picker with a calm pulsing frame around the active field — same guidance, less text. Respects the \"reduced motion\" setting (the ring stays still then)."
    ]
  },
  {
    "v": "0.650",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Smart-plan-velgeren leder deg nå gjennom flyten: klokke-kortet lyser opp med «👆 Trykk her», får en ✓ når du har satt det, og uthevingen flytter seg til dato-kortet. «Finn oppskriften» lyser opp når begge er satt. (Du kan fortsatt trykke rett på knappen — standardene virker.)"
    ],
    "changes_en": [
      "The Smart plan picker now walks you through the flow: the clock card lights up with \"👆 Tap here\", gets a ✓ once you've set it, and the highlight moves to the date card. \"Find the recipe\" lights up once both are set. (You can still tap the button directly — the defaults work.)"
    ]
  },
  {
    "v": "0.649",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Oversatte de resterende velger-knappene i engelsk modus: gjærtype (Dry yeast / Fresh yeast), kjøkkenmaskin (Manual kneading / Other machine) og ovntype (Pizza oven / Regular oven). Gjelder både mobil og PC."
    ],
    "changes_en": [
      "Translated the remaining picker buttons in English mode: yeast type (Dry yeast / Fresh yeast), stand mixer (Manual kneading / Other machine) and oven type (Pizza oven / Regular oven). Applies to both mobile and PC."
    ]
  },
  {
    "v": "0.648",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Pizzatype-knappene var på norsk også i engelsk modus. Nå oversettes de: «Ingen elting» → «No-knead», «Langpanne» → «Sheet pan», «Napoletansk» → «Neapolitan» (både mobil og PC)."
    ],
    "changes_en": [
      "The pizza type buttons were in Norwegian even in English mode. Now they're translated: \"Ingen elting\" → \"No-knead\", \"Langpanne\" → \"Sheet pan\", \"Napoletansk\" → \"Neapolitan\" (both mobile and PC)."
    ]
  },
  {
    "v": "0.647",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Pusset opp klokke/dato-velgeren i Smart-plan: klokka og datoen er nå to like store kort. Klokka er tonet litt ned, og datoen vises som «lør 1. aug» (ukedag + dag + måned) i stedet for det rå OS-formatet. Trykk hvor som helst på et kort for å åpne velgeren, som før."
    ],
    "changes_en": [
      "Polished the time/date picker in Smart plan: the time and date are now two equally sized cards. The time is toned down a little, and the date shows as \"Sat 1 Aug\" (weekday + day + month) instead of the raw OS format. Tap anywhere on a card to open the picker, as before."
    ]
  },
  {
    "v": "0.646",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Fjernet overflødig luft på topp og bunn i mobilvisning. Klaringen for Dynamic Island/home-indicator ble ganget opp med skriftstørrelsen (og vokste dermed på store skrifter/XXL). Nå får topp og bunn nøyaktig den plassen de trenger, uansett skriftstørrelse."
    ],
    "changes_en": [
      "Removed excess space at the top and bottom in mobile view. The clearance for the Dynamic Island/home indicator was multiplied by the font size (and so grew on large/XXL fonts). Now the top and bottom get exactly the space they need, whatever the font size."
    ]
  },
  {
    "v": "0.645",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Rettet «Tips og teknikk»: overskriftene i kortene ble klippet i toppen fordi kortene manglet innermarg. Nå har teksten luft rundt seg og kuttes ikke lenger."
    ],
    "changes_en": [
      "Fixed \"Tips and technique\": the card headings were clipped at the top because the cards had no inner padding. Now the text has room around it and is no longer cut off."
    ]
  },
  {
    "v": "0.644",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Nytt <b>XXL</b>-nivå øverst i skriftstørrelse-valget, for de som vil ha ekstra stor tekst på hele planen. Velges under Visning (eller med +/− ved skriftstørrelse). Passet samtidig på at oppskrift-radene ikke lenger klemmer etikett og verdi sammen på de største skriftene."
    ],
    "changes_en": [
      "New <b>XXL</b> level at the top of the font size options, for those who want extra large text across the whole plan. Choose it under Display (or with +/− next to font size). While at it, made sure the recipe rows no longer cram the label and value together at the largest font sizes."
    ]
  },
  {
    "v": "0.643",
    "d": "august 2026",
    "d_en": "August 2026",
    "changes": [
      "Bedre lesbarhet på lyst tema: brødteksten (understeg, «Hvorfor», «Tips») var i en dempet gråbrun som ble litt vanskelig å lese på krembakgrunn. Nå står selve teksten i tydelig mørk blekk, mens sekundær info (steg-tall, tider) er gjort mørkere men holdes dempet. Mørkt tema er uendret."
    ],
    "changes_en": [
      "Better readability on the light theme: the body text (subheadings, \"Why\", \"Tips\") was in a muted gray-brown that got a bit hard to read on the cream background. Now the text itself is in clear dark ink, while secondary info (step numbers, times) is darkened but kept muted. The dark theme is unchanged."
    ]
  },
  {
    "v": "0.470–0.642",
    "d": "juli 2026 — månedens store løft",
    "d_en": "July 2026 — the month's big lifts",
    "changes": [
      "<b>Delt lagring og innlogging:</b> deiger lagres i skyen (start på flere enheter, fullfør sammen), enkel innlogging med navn + PIN, favoritt-merking — og mot slutten av måneden ble deiger private per bruker med deling som eget valg.",
      "<b>Nye metoder og valg:</b> Kveldsdeig, Mania-poolish, kjøleskaps-poolish, justerbare forspill-varigheter, Hurtigdeig utvidet til 16 timer, valg av kjøkkenmaskin, og meltype-registeret med protein, styrke og gjæringsvindu per mel — med varsler når oppsettet ikke passer melet.",
      "<b>Riktigere deig:</b> reell gjærfeil i Poolish/Biga rettet, salt for napoletansk opp til 2,8 %, beregnet vanntemperatur i Hurtigdeig, overfermenterings-varsel, og gjæringsvinduer kryssjekket mot norske forhandlere.",
      "<b>Ny inngang og veiviser:</b> to dører ved oppstart (Smart-plan — «si når du vil spise» — og Planlegging), veiviseren bygget om til korte steg, fanelinja ryddet fra 7 til 5 faner, og Fokus-modus som viser det aktive steget i fullskjerm.",
      "<b>Forno-designet:</b> hele appen fikk den varme vedovn-paletten (mobil, siden PC), pluss valgfritt lyst tema, og en lang rekke mørk-på-mørk-lesbarhetsfeil ble funnet og rettet systematisk.",
      "<b>Engelsk og enheter:</b> hele appen på engelsk med imperiske enheter som valg, automatisk språkvalg første gang, og tospråklig endringslogg.",
      "<b>Stegene ble smartere:</b> avhaking følger innholdet i steget (ikke posisjonen), understeg på alle steg i alle metoder, «trenger du»-chips med mengder per steg, «👉 neste»-markering med nedtelling, og kalender-eksport som følger språk og enheter.",
      "<b>Navnet:</b> appen het Pizzaplanlegger, ble Pizzame, og landet på UltimatePizza — og versjonsskalaen ble lagt om til 0.x på vei mot 1.0.",
      "Full detaljlogg for alle 173 juli-versjonene ligger tapsfritt i CHANGELOG-ARKIV.md i kodelageret på GitHub (runevangen/pizzame) — appen laster den ikke, det er hele poenget."
    ],
    "changes_en": [
      "<b>Shared storage and login:</b> doughs are saved in the cloud (start on one device, finish on another), simple name + PIN login, favorite marking — and late in the month doughs became private per user with sharing as an explicit choice.",
      "<b>New methods and choices:</b> Evening dough, Mania poolish, fridge poolish, adjustable preferment durations, Quick dough extended to 16 hours, stand-mixer choice, and the flour-type register with protein, strength and fermentation window per flour — with warnings when your setup doesn't suit the flour.",
      "<b>More correct dough:</b> a real yeast bug in Poolish/Biga fixed, Neapolitan salt up to 2.8%, calculated water temperature in Quick dough, an over-fermentation warning, and fermentation windows cross-checked against Norwegian retailers.",
      "<b>New entrance and wizard:</b> two doors at startup (Smart plan — \"say when you want to eat\" — and Planning), the wizard rebuilt into short steps, the tab bar trimmed from 7 to 5 tabs, and Focus mode showing the active step full-screen.",
      "<b>The Forno design:</b> the whole app got the warm wood-fired palette (mobile, then PC), plus an optional light theme, and a long series of dark-on-dark readability bugs were found and fixed systematically.",
      "<b>English and units:</b> the whole app in English with imperial units as options, automatic language pick on first visit, and a bilingual changelog.",
      "<b>Smarter steps:</b> check-offs follow the content of a step (not its position), sub-steps on every step in every method, \"you need\" chips with amounts per step, a \"👉 next\" marker with countdown, and calendar export that follows your language and units.",
      "<b>The name:</b> the app was Pizzaplanlegger, became Pizzame, and landed on UltimatePizza — and the version scale moved to 0.x on the way to 1.0.",
      "The full detailed log for all 173 July versions lives losslessly in CHANGELOG-ARKIV.md in the repository on GitHub (runevangen/pizzame) — the app never loads it, which is the whole point."
    ]
  }
];
