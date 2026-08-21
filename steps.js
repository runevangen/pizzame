// steps.js — steglaget: alt som regner ut og formulerer selve stegkjedene.
// Flyttet ut av index.html i v0.836, verbatim (samme grep som engine.js i
// v0.832-æraen): rawSteps/hurtigSteps/kveldSteps med hele sin rene lukning —
// dato-hjelpere, tekst-tabellene (LOC/WHY/TIP/METHOD_WHY), forvarming,
// kickstart, fordeig- og deigtemperatur-modellen. Ingen linje endret.
//
// Hvorfor: funksjonene her er ALLEREDE DOM-frie (målt: null
// getElementById/querySelector i hele laget) — de var bare utilgjengelige for
// node fordi de bodde i index.html sitt inline-script, som rører DOM ved
// lasting. Nå kan stegkjedene testes i node på millisekunder (test_steg.mjs,
// gruppe 0c) med funksjonsnavn i feilmeldingene, i stedet for kun via
// nettleserlaget.
//
// Lastes som klassisk <script> ETTER engine.js og FØR hovedscriptet — alt er
// globalt, akkurat som før flyttingen. Laget LESER (ved kall, aldri ved
// lasting) disse globalene som fortsatt bor i index.html/engine.js:
//   engine.js:  recipeFor, R, maniaRecipe, MANIA_T, pc, yA, yLabelFor, tf,
//               rtM, poolishAndel, poolishWindowHours, mN ...
//   index.html: L, S, DEF, HOPTS, KOPTS, fmtSessionDur, fmtHM, durEn,
//               coldTimeLabel, poolishSplit, poolishTemperMin,
//               poolishRestText, poolishWindowText, POOLISH_ROMSTART_MIN,
//               MELTYPER (via meltype-tekster), window._lang
// Index-lista er sømmen som gjenstår: neste skive av utflyttingen er å la de
// hjelperne følge etter hit, så test_steg.mjs sin hentFraIndex()-liste krymper
// til null. Ikke legg NY stegkode i index.html — den hører hjemme her.

// ===== Tekst- og varighetshjelpere (v0.838, verbatim fra index.html) =====
// Sømmen fra v0.836 lukket: hjelperne steglaget leser bor nå her.
// Oversetter en norsk varighetsstreng fra fmtDur() ("2,5 timer", "45 min", "1,5 døgn") til engelsk.
function durEn(s){ return String(s).replace(' timer',' hours').replace(' time',' hour').replace(' døgn',' days'); }
// Timer + minutter for varigheter i steg-tekst ("8 t 25 min" / "8 h 25 min"),
// språk-bevisst. Brukes i beskrivelsene i stedet for rå "504 min" / desimal "1.3 time".
function fmtHM(mins){
  mins=Math.round(mins);
  if(mins<60) return mins+' min';
  const h=Math.floor(mins/60), m=mins%60, u=window._lang==='en'?'h':'t';
  return m ? h+' '+u+' '+m+' min' : h+' '+u;
}
// Enhets-post-prosessor: konverterer ALLE °C og gram i en ferdig tekst-blokk til
// Leselig visningstekst for kjøleskapstid — alltid i timer, aldri "dager", for
// konsekvens med resten av det time-baserte systemet (Poolish/Biga-valgene,
// Hurtigdeig/Kveldsdeig) som allerede viser timer gjennomgående.
function coldTimeLabel(h){
  return L(h+' timer', h+' hours');
}
// Leselig "Xt Ym"-tekst for øktbanneret (steg 2-4-i-én-økt).
function fmtSessionDur(mins){
  const h=Math.floor(mins/60), m=Math.round(mins%60);
  if(h<=0) return m+' min';
  if(m===0) return L(h+'t', h+'h');
  return L(h+'t '+m+'m', h+'h '+m+'m');
}
// v0.752: poolish-delingen ETT sted. Uttrykket `Math.round(r2.flour/2)` sto
// spredt på 36 steder i steg-teksten — beskrivelse, needs og understeg for tre
// kjøkkenmaskin-varianter — og hver kopi er en sjanse til å endre én og glemme
// resten. Nøyaktig den klassen F17 ble bygget for.
//
// Merk at poolishen tar vann etter MELET, ikke etter oppskriftens vann: den er
// en 100 %-hydrert forgjæring, så halvparten av melet og like mye vann. Under
// 50 % hydrering ville `rest` blitt negativ («Tilsett −10g vann»). Det er ikke
// nåbart i dag — hydreringsglideren har hatt min 55 i hele historikken, og
// HREC går aldri lavere — så her legges det ikke inn en vakt som ville skjult
// en ødelagt tilstand bak en pen null. Invariant-sveipet dekker nå
// hydreringsaksen (v0.752), så gulvet er under overvåkning i stedet.
// v0.787: andelen er ikke lenger låst til halvparten. `pool` er melet OG vannet
// i poolishen (100 % hydrering), `restMel` er melet som tilsettes i blandesteget,
// `rest` er vannet som tilsettes der. Ved 50 % er pool og restMel like store, og
// derfor sto det `pool` begge steder tidligere — en likhet som holdt så lenge
// andelen var fast, og som ville gitt 150g mel i stedet for 350g ved 30 %.
function poolishSplit(r){
  const pool=Math.round(r.flour*poolishAndel());
  return {pool, restMel:r.flour-pool, rest:Math.round(r.water-pool)};
}
// v0.784: en kald poolish er ikke ett steg på benken. Den starter i romtemperatur,
// modnes i kjøleskapet, og må TEMPERERES før den blandes. Målt før delingen:
// Q10-modellen leste `loc:'benk'` og regnet alle 18 timene som 22°C, og deigen
// landet på 12,7°C mot de 22–24°C oppskriften selv oppgir. Vannet kan ikke rette
// det — bare 75 av 325 gram vann er igjen å skru på når poolishen er 66 % av
// deigens varmekapasitet. Tempereringen er den eneste spaken som er koblet til noe.
const POOLISH_ROMSTART_MIN=90;
// Tempereringstiden tas AV poolishens egne timer, ikke i tillegg, så planen blir
// ikke lengre av å bli riktig. Anslaget er masse-styrt: 500g bruker ~3t fra 3°C
// til ~17°C i et 22°C rom, 300g ~2t. Dette er en PLANLEGGINGSverdi — bolle, form
// og kjøkken flytter det reelle tallet mer enn en formel kan fange, så teksten i
// steget forteller brukeren hva han skal kjenne etter.
function poolishTemperMin(){
  const masse=Math.round(S.mel*poolishAndel())*2;   // mel + vann; poolishen er 100 % hydrert
  return Math.max(60, Math.min(240, Math.round((30+masse*0.3)/15)*15));
}
function poolishRestText(){
  if(S.poolishCold){
    // Fasene er egne steg nå, så tipset skal ikke gjenta timeplanen. Det som IKKE
    // står i stegene er hvordan en poolish som er i gang faktisk ser ut.
    return L(`La den stå framme her — den skal i kjøleskapet i neste steg. Den er i gang når overflaten begynner å boble og lukte lett syrlig — boblene er samtidig kvitteringen på at gjæren lever.`,`Leave it out here — it goes into the fridge in the next step. It's under way when the surface starts to bubble and smells slightly sour — the bubbles double as your receipt that the yeast is alive.`);
  }
  return L(`La stå ca. ${S.poolishH} timer ved romtemperatur. Klar når overflaten bobler aktivt og lukter lett syrlig — boblene er samtidig kvitteringen på at gjæren lever.`,`Let sit about ${S.poolishH} hours at room temperature. Ready when the surface bubbles actively and smells slightly sour — the bubbles double as your receipt that the yeast is alive.`)+poolishWindowText();
}
// v0.752: vinduet. Gjærmengden i poolishen er den samme enten kjøkkenet holder
// 18 eller 26 grader, og timeplanen setter av like mange timer uansett — men
// gjæringen bryr seg ikke om planen. Uten denne setningen står en poolish på et
// varmt kjøkken flere timer for lenge, topper og faller sammen, og du får en
// slapp deig uten å skjønne hvorfor.
// Ingen gram endres her. Det eneste som gjøres, er å si HVOR i tida du bør
// begynne å se etter — og hvordan du kjenner igjen at den har gått for langt.
// Fallende midte er den viktigste, for det er den eneste som ikke kan tolkes
// som «litt mer tid trengs».
function poolishWindowText(){
  const v=poolishWindowHours();
  if(!v) return '';
  const t=fmtHalv(v.ekte);
  return v.raskere
    ? L(` Men på et ${v.temp}°C kjøkken går det fortere enn planen sier — regn med at den er klar rundt ${t} timer, og se etter fra da av. Har midten begynt å synke, er den over toppen: bland ferdig deig med en gang.`,
        ` But in a ${v.temp}°C kitchen it goes faster than the plan says — expect it ready around ${t} hours, and start checking from then. If the middle has begun to sink, it is past its peak: mix the final dough right away.`)
    : L(` Men på et ${v.temp}°C kjøkken går det saktere enn planen sier — regn med nærmere ${t} timer. Er den fortsatt flat og nesten uten bobler når tida er ute, gi den lengre tid framfor å blande videre.`,
        ` But in a ${v.temp}°C kitchen it goes slower than the plan says — expect closer to ${t} hours. If it is still flat and almost without bubbles when the time is up, give it longer rather than mixing on.`);
}
function fmtHalv(n){ return (Math.round(n*2)/2).toString().replace('.',','); }

function aM(d,m){return new Date(d.getTime()+m*60000);}
function sM(d,m){return new Date(d.getTime()-m*60000);}
function fDT(d){
  const tm=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if(window._lang==='en'){
    const dyE=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const moE=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return`${dyE[d.getDay()]} ${moE[d.getMonth()]} ${d.getDate()}, ${tm}`;
  }
  const dy=['søn','man','tir','ons','tor','fre','lør'];
  const mo=['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'];
  return`${dy[d.getDay()]} ${d.getDate()}. ${mo[d.getMonth()]} kl. ${tm}`;
}
function fT(d){return`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
// v0.830: «Begynn»-linja på Smart-plan-kortene. Nære tidspunkt sies
// menneskelig — «i dag»/«i kveld» (fra kl. 17) og «i morgen» — ellers full
// dato via fDT. Samme ånd som Fra–til-kortenes «Begynn … → stek …» (v0.779).
function fBegynn(d){
  const now=new Date();
  const sammeDag=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const tm=fT(d);
  if(sammeDag(d,now)) return d.getHours()>=17?L(`i kveld ${tm}`,`tonight at ${tm}`):L(`i dag ${tm}`,`today at ${tm}`);
  if(sammeDag(d,new Date(now.getTime()+864e5))) return L(`i morgen ${tm}`,`tomorrow at ${tm}`);
  return fDT(d);
}
// v0.753: samme tidspunkt, skrevet helt ut. fDT() forkorter («søn 9. aug»),
// som er riktig i en tett tidsplan der datoen står på hvert eneste steg. I
// kvitteringen øverst er dette derimot den ENE opplysningen som betyr noe —
// når er deigen klar — og der leses «ca. søn 9. aug» dårlig: en forkortet
// ukedag rett bak «ca.» skurrer, og du må dekode to ledd for å finne dagen.
function fDTLang(d){
  const tm=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if(window._lang==='en'){
    const dyE=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const moE=['January','February','March','April','May','June','July','August','September','October','November','December'];
    return`${dyE[d.getDay()]} ${moE[d.getMonth()]} ${d.getDate()}, ${tm}`;
  }
  const dy=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
  const mo=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
  return`${dy[d.getDay()]} ${d.getDate()}. ${mo[d.getMonth()]} kl. ${tm}`;
}

function pcUnitLabel(plural){
  const isPan = S.type==='langpanne' || S.type==='ingenelting';
  if(window._lang==='en'){
    if(isPan) return plural?'sheet pans':'sheet pan';
    return plural?'pizzas':'pizza';
  }
  if(isPan) return plural?'langpanner':'langpanne';
  return plural?'pizzaer':'pizza';
}
function pcCountBadge(){
  const n=pc().count;
  return `${n} ${pcUnitLabel(n!==1)}`;
}
function oD(t){
  const p=S.oven==='pizza';
  if(t==='napoletana')return p?L('Pizzaovn: 430–450°C, 90–120 sek. Leopardmønster og sprø kanter.','Pizza oven: 430–450°C, 90–120 sec. Leopard spotting and crisp edges.'):L('Vanlig ovn: 250°C, pizzastein/stål varmes 45 min. Stek 6–9 min øverste rille.','Regular oven: 250°C, preheat pizza stone/steel 45 min. Bake 6–9 min on the top rack.');
  // v0.744: teksten begrunnet temperaturtaket med «sukkeret i deigen». I pizzaovn
  // er det ikke noe sukker — v0.724 fjernet det nettopp fordi det brenner ved
  // 400°C+ — så forklaringen viste til en ingrediens oppskriften ikke inneholder.
  // Taket på 350°C motsa dessuten tipset rett under, som ber deg justere opp mot
  // 350–370°C hvis pizzaen blir for lys. Begge deler er borte: teksten oppgir
  // utgangspunktet, og tipset eier finjusteringen.
  if(t==='newyork')return p?L('Pizzaovn: 300–340°C, 4–6 min. Lavere temperatur enn napoletansk — NY-bunnen skal stekes gjennom og bli sprø, ikke svis på 90 sekunder.','Pizza oven: 300–340°C, 4–6 min. Lower temperature than Neapolitan — the NY base should bake through and go crisp, not be seared in 90 seconds.'):L('Vanlig ovn: 250°C på pizzastein/stål (varmes 45 min). Stek 6–8 min til gyllen og sprø bunn.','Regular oven: 250°C on a pizza stone/steel (preheat 45 min). Bake 6–8 min until golden with a crisp base.');
  if(t==='langpanne')return p?L('Pizzaovn: 300–350°C, 8–12 min.','Pizza oven: 300–350°C, 8–12 min.'):L('Vanlig ovn: 230–250°C, oljet langpanne, 12–16 min.','Regular oven: 230–250°C, oiled sheet pan, 12–16 min.');
  return p?L('Pizzaovn: 250–280°C i jernpanne, 20–25 min.','Pizza oven: 250–280°C in a cast-iron pan, 20–25 min.'):L('Vanlig ovn: 200–220°C, smørsmurt form, 28–35 min.','Regular oven: 200–220°C, buttered pan, 28–35 min.');
}
function oT(t){
  const p=S.oven==='pizza';
  if(t==='napoletana')return p?L('Forvarm pizzaovnen godt — dekket/steinen er klart på ~15–20 min, mye raskere enn en vanlig ovn.','Preheat the pizza oven well — the deck/stone is ready in ~15–20 min, much faster than a regular oven.'):L('Sett rist øverst. 250°C varmluft gir best resultat. Pizzastein/-stål må varmes minst 45 min.','Put the rack at the top. 250°C convection gives the best result. A pizza stone/steel must preheat at least 45 min.');
  if(t==='newyork')return p?L('Strekk tynt og bredt — kantene skal kunne brettes. 300–340°C er et godt utgangspunkt — juster opp mot 350–370°C hvis pizzaen blir for lys, ned igjen hvis den blir for mørk før bunnen er gjennomstekt.','Stretch thin and wide — the edges should be foldable. 300–340°C is a good starting point — turn up toward 350–370°C if the pizza is too pale, back down if it darkens before the base is cooked through.'):L('Pizzastål gir den klassiske sprø, foldbare NY-bunnen.','A pizza steel gives the classic crisp, foldable NY base.');
  if(t==='langpanne')return p?L('Tykkbunnet form tåler høy varme.','A thick-bottomed pan handles high heat.'):L('Olje i formen. Forhåndstek 5 min uten fyll.','Oil in the pan. Pre-bake 5 min without toppings.');
  return p?L('Jernpanne gir best varmeoverføring.','A cast-iron pan gives the best heat transfer.'):L('Ost UNDER sausen — Chicago-tradisjonen.','Cheese UNDER the sauce — the Chicago tradition.');
}
function oN(){return S.oven==='pizza'?L('Pizzaovn','Pizza oven'):L('Vanlig ovn (maks 250°C)','Regular oven (max 250°C)');}
// v0.737: hvor lenge ovnen må stå på FØR steking. Tallene er de samme som
// stekestegets tips allerede oppga — de var bare aldri lagt inn i tidsplanen,
// så planen gikk rett fra «ferdig temperert» til «stek» uten et minutt til
// oppvarming. Pizzastein/-stål er det trege leddet i en vanlig ovn: luften er
// varm lenge før steinen er det. Langpanne og Chicago stekes i form uten stein,
// så der holder det å nå temperatur.
function preheatMin(){
  if(S.oven==='pizza') return 20;
  return (S.type==='napoletana'||S.type==='newyork') ? 45 : 20;
}
// v0.739: selve forvarmingssteget, ETT sted. v0.737 la det inn som en inline-blokk
// i tailSteps og antok at Kveldsdeig og Mania alt hadde et — det stemte kun for
// Hurtigdeig. Invariant-testen (lag 1, regel C) fant de to: prosaen på stekesteget
// krevde 45 min forvarming mens tidsplanen satte av null. Nå bygger alle metoder
// steget herfra, så en ny metode arver det i stedet for å måtte huske det.
// roomMin = hvor mange minutter deigen uansett står i romtemperatur rett før
// steking; steget klemmes innenfor det (−5 min) så det aldri kan havne foran
// steget som slipper deigen ut på benken.
function preheatSteps(bakeAt, roomMin, type, tempTxt){
  const tp=type||S.type;
  const ph=Math.min(preheatMin(), Math.max(0,roomMin-5));
  if(ph<5) return [];
  const t=S.oven==='pizza'?L('pizzaovnen','the pizza oven'):L('ovnen','the oven');
  // v0.810: Hurtigdeig har egen måltemperatur per hevetid (HOPTS-kurven som
  // skåner honningdeigen) — den må stå i steget, siden stekestegets tall
  // varierer. De andre metodene sender ingen og beholder teksten sin ordrett.
  const mål=tempTxt?L(` Varm til ${tempTxt}.`,` Heat to ${tempTxt}.`):'';
  const stone=S.oven!=='pizza'&&(tp==='napoletana'||tp==='newyork');
  // loc:'rom' fordi DEIGEN fortsatt står på benken — det holder Q10-modellen
  // uendret (romtemperaturintervallet deles i to like varme deler i stedet for
  // å bli borte). dispLoc:'ovn' fordi det er dit DU går.
  return [{title:'Sett på ovnen 🔥',loc:'rom',dispLoc:'ovn',at:sM(bakeAt,ph),dur:0,
    desc:L(`Sett på ${t} nå — den trenger ca. ${fmtDur(ph)} før den er varm nok.${mål} ${stone?'Sett pizzastein/-stål inn med en gang: luften i ovnen blir varm lenge før steinen er det, og det er steinen som gir bunnen.':'Deigen står trygt på benken mens ovnen varmes.'}`,`Turn on ${t} now — it needs about ${durEn(fmtDur(ph))} before it is hot enough.${mål} ${stone?'Put the pizza stone/steel in right away: the air in the oven gets hot long before the stone does, and it is the stone that makes the base.':'The dough sits safely on the counter while the oven heats.'}`),
    substeps:[
      L(`Sett på ${t} — ca. ${fmtDur(ph)} til den er klar`,`Turn on ${t} — about ${durEn(fmtDur(ph))} until it is ready`),
      ...(stone?[L('Sett pizzastein/-stål inn med en gang','Put the pizza stone/steel in right away')]:[]),
      L(N('La deigemnet stå videre på benken','La deigemnene stå videre på benken'),N('Leave the dough ball on the counter','Leave the dough balls on the counter'))
    ],
    // v0.742: «Hvorfor» sto tidligere og snakket om pizzastein uansett ovnstype,
    // mens beskrivelsen rett over bevisst lot være når det ikke er noen stein.
    // Nå følger begge samme `stone`-vakt.
    why:stone
      ? L('Ovnen er det eneste i planen som ikke kan hastes. En pizzastein som ikke er gjennomvarm gir blek, seig bunn uansett hvor god deigen er — og du merker det ikke før pizzaen er inne.','The oven is the one thing in the plan that cannot be rushed. A stone that is not heated through gives a pale, chewy base no matter how good the dough is — and you will not notice until the pizza is already in.')
      : L('Ovnen er det eneste i planen som ikke kan hastes. En ovn som ikke er gjennomvarm gir blek, seig bunn uansett hvor god deigen er — og du merker det ikke før pizzaen er inne.','The oven is the one thing in the plan that cannot be rushed. An oven that is not heated through gives a pale, chewy base no matter how good the dough is — and you will not notice until the pizza is already in.'),
    // v0.742: her sto `oT(tp)` — nøyaktig samme streng som stekesteget bruker,
    // så de to nabostegene ga identisk tips. For napoletansk var den attpåtil
    // «forvarm ovnen godt», gjentatt på stekesteget 20 minutter ETTER at du
    // gjorde det. Forvarmingssteget har nå et tips om selve forvarmingen.
    // Tre tilfeller, ikke to: en pizzaovn har verken termostat som slår av og på
    // eller en løs stein å måle — den har et dekke. Å gi den termostat-rådet
    // ville vært et tips om utstyr brukeren ikke har.
    tip:S.oven==='pizza'
      ? L('Stekedekket er varmt lenge før det er gjennomvarmt. Har du et IR-termometer, sikt på stedet pizzaen skal ligge — det er den temperaturen som avgjør bunnen, ikke flammen.','The deck is hot long before it is heated through. If you have an IR thermometer, point it at the spot the pizza will sit — that is the temperature that decides the base, not the flame.')
      : stone
      ? L('Ovnstermostaten måler luften, ikke steinen — og luften er varm lenge før steinen er det. Har du et IR-termometer, sikt på steinen og vent til den er nær måltemperaturen.','The oven thermostat measures the air, not the stone — and the air is hot long before the stone is. If you have an IR thermometer, point it at the stone and wait until it is close to the target temperature.')
      : L('Ovnen er gjennomvarm først når termostaten har slått av og på et par ganger. Første gang den piper er ikke det samme som at den er klar.','The oven is heated through only once the thermostat has cycled on and off a couple of times. The first beep is not the same as being ready.')}];
}
// v0.742: tipset på selve stekesteget. For napoletansk var `oT()` ren
// forvarmingsinstruksjon («Forvarm pizzaovnen godt …») — den kom altså 20
// minutter etter at forvarmingssteget hadde bedt deg gjøre nettopp det, og var
// samtidig ordrett identisk med nabosteget. De øvrige typene har innhold som
// faktisk gjelder stekeøyeblikket (strekk tynt, tykkbunnet form, ost under
// sausen), så de leser fortsatt oT().
function bakeTip(t){
  if(t!=='napoletana') return oT(t);
  return S.oven==='pizza'
    ? L('Dra pizzaen ut og drei den en halv omgang etter ~30 sek — stekedekket er kaldest der pizzaen nettopp lå. Blir kanten mørk før bunnen er ferdig, senk temperaturen litt til neste.','Pull the pizza out and turn it half a turn after ~30 sec — the deck is coolest where the pizza has just been. If the rim darkens before the base is done, lower the temperature a little for the next one.')
    : L('Stek på øverste rille. Er bunnen blek når kanten er ferdig, flytt pizzaen ned et hakk de siste par minuttene.','Bake on the top rack. If the base is pale when the rim is done, move the pizza down a level for the last couple of minutes.');
}
// v5.99: understeg for det delte stekestegetet — samme gren-logikk (type ×
// ovnstype) som oD()/oT(), brutt opp i egne linjer i stedet for ett avsnitt.
// Brukt av tailSteps (Standard/Poolish/Biga), kveldSteps og hurtigSteps sine
// bakesteg, så alle metoder får samme behandling fra samme kilde.
function bakeSubsteps(type){
  const p=S.oven==='pizza';
  const warm = type==='napoletana'
    ? (p?L('Varm pizzaovnen til 430–450°C — dekket/steinen er klart på ~15–20 min','Heat the pizza oven to 430–450°C — the deck/stone is ready in ~15–20 min'):L('Varm ovnen til 250°C med pizzastein/-stål, 45 min, øverste rille','Heat the oven to 250°C with a pizza stone/steel, 45 min, top rack'))
    : type==='newyork'
    ? (p?L('Varm pizzaovnen til 300–340°C','Heat the pizza oven to 300–340°C'):L('Varm ovnen til 250°C med pizzastein/-stål, 45 min','Heat the oven to 250°C with a pizza stone/steel, 45 min'))
    : type==='langpanne'
    ? (p?L('Varm pizzaovnen til 300–350°C','Heat the pizza oven to 300–350°C'):L('Varm ovnen til 230–250°C','Heat the oven to 230–250°C'))
    : (p?L('Varm pizzaovnen til 250–280°C i jernpanne','Heat the pizza oven to 250–280°C in a cast-iron pan'):L('Varm ovnen til 200–220°C','Heat the oven to 200–220°C'));
  const shape = type==='langpanne'
    ? L('Press deigen utover i oljet langpanne — ikke elt, bare press med fingertuppene','Press the dough out in an oiled sheet pan — don\'t knead, just press with your fingertips')
    : type==='chicago'
    ? L('Press deigen ned og opp langs kantene i smørsmurt jernpanne','Press the dough down and up along the edges in a buttered cast-iron pan')
    : type==='newyork'
    ? L('Strekk tynt og bredt — kantene skal kunne brettes','Stretch thin and wide — the edges should be foldable')
    : L('Strekk emnet rundt, la kanten være tykkere enn midten','Stretch the ball out into a round, keeping the edge thicker than the center');
  const top = type==='chicago' ? L('Ost først, så fyll, saus øverst — Chicago-tradisjonen','Cheese first, then filling, sauce on top — the Chicago tradition') : L('Ha på saus, ost og ønsket topping','Add sauce, cheese and your chosen toppings');
  const bakeLine = type==='napoletana'
    ? (p?L('Stek 90–120 sek til leopardmønster og sprø kanter','Bake 90–120 sec until leopard-spotted with crisp edges'):L('Stek 6–9 min øverste rille','Bake 6–9 min on the top rack'))
    : type==='newyork'
    ? (p?L('Stek 4–6 min til gyllen og sprø','Bake 4–6 min until golden and crisp'):L('Stek 6–8 min til gyllen og sprø bunn','Bake 6–8 min until golden with a crisp base'))
    : type==='langpanne'
    ? (p?L('Stek 8–12 min','Bake 8–12 min'):L('Stek 12–16 min','Bake 12–16 min'))
    : (p?L('Stek 20–25 min','Bake 20–25 min'):L('Stek 28–35 min','Bake 28–35 min'));
  return [warm, shape, top, bakeLine];
}

const LOC_NO={
  kjol:'<span class="sloc k">❄️ Kjøleskap</span>',
  rom:'<span class="sloc r">🏠 Romtemperatur</span>',
  ovn:'<span class="sloc o">🔥 Ovn</span>',
  benk:'<span class="sloc r">🔧 Kjøkkenbenk</span>'
};
const LOC_EN={
  kjol:'<span class="sloc k">❄️ Fridge</span>',
  rom:'<span class="sloc r">🏠 Room temp.</span>',
  ovn:'<span class="sloc o">🔥 Oven</span>',
  benk:'<span class="sloc r">🔧 Counter</span>'
};
// Bruk en Proxy slik at eksisterende `LOC[s.loc]`-oppslag automatisk følger valgt språk.
// v0.737: `loc` sier hvor DEIGEN er — det er den som mater temperaturmodellen
// (stepTempC i engine.js). For de fleste steg er det også der DU er, men ikke
// alltid: mens ovnen forvarmes står deigen fremdeles på benken. `dispLoc` er
// derfor et rent visningsoverstyr; mangler den, brukes `loc` som før.
function stepLoc(s){ return s.dispLoc||s.loc; }
const LOC=new Proxy({},{get:(_,k)=>((window._lang==='en'?LOC_EN:LOC_NO)[k])});
const WHY_NO={
  fk:'Kald fermentering (2–4°C) bremser gjæren slik at enzymer bryter ned stivelse over tid. Gir dyp smak, god fordøyelighet og lang holdbarhet. Kulda er også tilgivende — siden den bremser hele prosessen, tåler en kald deig litt mer gjær enn du skulle tro før det blir et problem.',
  form:'Tette, godt rundede emner holder på gassen og formen gjennom hele kjøleskapshevingen. Et løst, dårlig rundet emne flyter utover og gir en flat, ustrukturert pizza. Rundingen bygger også overflatespenning som får emnet til å heve oppover i stedet for utover — grunnlaget for en luftig kant.',
  tu:'Benktida etter kjøleskapet gjør to ting på én gang. Glutenet slapper av — kald deig er stiv og seig ved 2–4°C, og noen timer i romtemperatur gjør den strekkbar så du kan åpne emnet uten at det river. Og gjæren, som lå nesten i dvale i kulda, våkner igjen og gir en siste, kort heving som gjør skorpa luftig og lett. Hopper du over benktida, blir deigen både vanskelig å strekke og tettere når den er stekt. Hvor lenge den trenger avhenger av hvor varmt rommet er — varmere rom går raskere, så bruk tiden som en pekepinn og deigen selv som fasit.',
  st:'Høy varme gir raskt ovnsløft — det bakerne kaller «oven spring». Pizzaen hever lynraskt, og det er der de luftige kantene og den sprø bunnen kommer fra.',
  pl:'Poolish fermenterer lenge med lite gjær. Enzymer bryter ned stivelse til sukker som gjæren fermenterer, og det utvikles aromastoffer og milde organiske syrer som gir mer kompleks smak og bedre fordøyelighet.',
  bi:'Fast fordeig med lav hydrasjon. Langsom fermentering gir nøtteaktig smak og seigere deig.',
};
const WHY_EN={
  fk:'Cold fermentation (2–4°C) slows the yeast so enzymes break down starch over time. Gives deep flavor, good digestibility and a long shelf life. The cold is also forgiving — since it slows the whole process, a cold dough tolerates a bit more yeast than you would think before it becomes a problem.',
  form:'Tight, well-rounded balls hold on to the gas and their shape throughout the cold rise. A loose, poorly rounded ball spreads out and gives a flat, structureless pizza. The rounding also builds surface tension that makes the ball rise upward rather than outward — the basis for an airy crust.',
  tu:'The counter time after the fridge does two things at once. The gluten relaxes — cold dough is stiff and tough at 2–4°C, and a few hours at room temperature make it stretchable so you can open the ball without it tearing. And the yeast, which lay almost dormant in the cold, wakes up again and gives one last short rise that makes the crust airy and light. If you skip the counter time, the dough is both hard to stretch and denser once baked. How long it needs depends on how warm the room is — a warmer room goes faster, so use the time as a guide and the dough itself as the final word.',
  st:'High heat gives a fast "oven spring" — the pizza rises in a flash for airy edges and a crisp base.',
  pl:'Poolish ferments for a long time with little yeast. Enzymes break starch down into sugar that the yeast ferments, and aromatic compounds and mild organic acids develop that give more complex flavor and better digestibility.',
  bi:'A stiff preferment with low hydration. Slow fermentation gives a nutty flavor and a chewier dough.',
};
// Proxy slik at eksisterende WHY.xx-oppslag følger valgt språk (byte-identisk norsk).
const WHY=new Proxy({},{get:(_,k)=>((window._lang==='en'?WHY_EN:WHY_NO)[k])});
// Sensoriske "les deigen"-tips til gjæringsstegene: hva du ser etter, og hva du
// GJØR hvis deigen henger etter eller er kommet for langt fram. Klokka er plan A —
// disse lar deg overstyre med øynene når temperatur/kjøleskap ikke stemmer med tallet.
// Delt tekst så tegnene er like på tvers av metoder (jf. paritets-tanken i BACKLOG F11).
// Ren tekst (ingen HTML) — s.tip kopieres ordrett til plan-teksten (📋 Kopier), så tagger
// ville lekket dit. Fingertrykk-test: kun på VARM deig (roomRise) — på kald deig er den
// upålitelig fordi deigen er stiv av kulde.
const TIP_NO={
  // v0.834: «henger den etter» pekte på ÉN årsak (kaldt skap) og ga én utvei
  // (mer tid) — som er en lapp for denne baksten, ikke en fiks. Og den lot det
  // stå åpent om gjæren var død, som er den skumleste tolkningen når emnet
  // ligger stille: da heller folk i mer gjær eller kaster deigen. Etter v0.824
  // ER det spørsmålet allerede besvart før kjøleskapet — direktedeigene har
  // kickstarten, fordeigsmetodene har boblene i fordeigen — så her sier vi det
  // rett ut i stedet for å la tvilen stå. Utveien som varer er
  // kjøleskapstemperaturen (F13), som kompenserer gjæren neste gang.
  coldRise:()=>'Sjekk gjennom lokket uten å åpne: '+N('emnet skal vokse','emnene skal vokse')+' til ca. 1,5–2× og få små bobler under overflaten. Henger den etter (nesten uendret, stiv): gjæren er ikke synderen — den viste seg i live '+(kickVannG()>0?'i kickstarten':'i fordeigen')+'. Da står kjøleskapet kaldere enn appen regner med — gi den lengre tid enn planen sier, og still Kjøleskapstemperatur i innstillingene, så treffer planen bedre neste gang. For langt fram (stor og blank, med bobler som kollapser lett) — ta den ut og bak litt tidligere. Ikke bruk fingertrykk-testen på kald deig; den er upålitelig når deigen er stiv av kulde.',
  roomRise:'Klar når den har vokst merkbart (regn med ca. 30–50 % på denne korte hevingen — ikke vent på at den dobler seg), myk og luftig med begynnende bobler. Fingertrykk-test: trykk lett med våt finger — gropa skal fjære sakte halvveis tilbake. Spretter den rett opp igjen, trenger den mer tid; blir gropa stående og deigen synker sammen, er den for langt fram — gå videre med en gang. Varmt kjøkken går raskere enn klokka antyder.',
  benchTemper:()=>N('Klart når det ikke lenger er kaldt og har hevet litt synlig i boksen. Fortsatt stivt og kaldt — gi det mer tid før du strekker og steker. Slapt og flyter utover i boksen — det er temperert nok; strekk og stek uten å vente lenger. For kort gir stiv, tett deig som er vanskelig å åpne; altfor lenge og det kan overheve og bli slapt.','Klare når de ikke lenger er kalde og har hevet litt synlig i boksen. Fortsatt stive og kalde — gi dem mer tid før du strekker og steker. Slappe og flyter utover i boksen — de er tempererte nok; strekk og stek uten å vente lenger. For kort gir stiv, tett deig som er vanskelig å åpne; altfor lenge og de kan overheve og bli slappe.'),
  poolishFerment:'Klar når overflaten er full av bobler, hvelver seg lett oppover og lukter friskt syrlig av gjær. Flat og stille ennå — la den stå lenger; kaldt kjøkken bremser den. Falt sammen i midten og lukter skarpt/alkoholaktig — den er gått litt for langt; bruk den likevel, men regn med noe mer syrlig smak.',
  // Praktisk "sett-i-kjøleskap"-tips (ikke "les deigen"): fysisk oppsett når emnene
  // settes kaldt. Brukes på form→kjøleskap-stegene (tailSteps + Kveldsdeig).
  intoFridge:()=>N('Bruk boks med lokk — klut tørker ut overflaten og lager skorpe. Sett den i den kaldeste sonen','Bruk bokser med lokk — kluter tørker ut overflaten og lager skorpe. Sett dem i den kaldeste sonen')+': bakerst og nederst, over grønnsakskuffen (ca. 2–4°C). Unngå kjøleskapsdøra (5–7°C) — den er varmest og svinger mest hver gang du åpner, så deigen hever ujevnt der.'+N('',' Ikke stable boksene tett i høyden; det kan blokkere luftsirkulasjonen — spre dem litt utover.')+' Og stol ikke blindt på tallet på kjøleskapshjulet: 1–5-skalaene varierer mellom merker, så har du et termometer, sjekk at den kaldeste sonen ligger under 4°C.'
};
const TIP_EN={
  coldRise:()=>'Check through the lid without opening: '+N('the ball should grow','the balls should grow')+' to about 1.5–2× and get small bubbles under the surface. If it lags (almost unchanged, stiff): the yeast is not the culprit — it proved itself alive '+(kickVannG()>0?'in the kickstart':'in the preferment')+'. Then the fridge is colder than the app assumes — give it more time than the plan says, and set Fridge temperature in the settings, so the plan lands closer next time. Too far along (large and shiny, with bubbles that collapse easily) — take it out and bake a little earlier. Don\'t use the finger-poke test on cold dough; it is unreliable when the dough is stiff from the cold.',
  roomRise:'Ready when it has grown noticeably (expect about 30–50% on this short rise — don\'t wait for it to double), soft and airy with the first bubbles appearing. Finger-poke test: press lightly with a wet finger — the dimple should spring back slowly, halfway. If it springs right back, it needs more time; if the dimple stays and the dough sinks, it is too far along — move on right away. A warm kitchen goes faster than the clock suggests.',
  benchTemper:()=>N('Ready when it is no longer cold and has risen a little visibly in the box. Still stiff and cold — give it more time before you stretch and bake. Slack and spreading out in the box — it is tempered enough; stretch and bake without waiting longer. Too short gives stiff, dense dough that is hard to open; far too long and it can over-proof and go slack.','Ready when they are no longer cold and have risen a little visibly in the box. Still stiff and cold — give them more time before you stretch and bake. Slack and spreading out in the box — they are tempered enough; stretch and bake without waiting longer. Too short gives stiff, dense dough that is hard to open; far too long and they can over-proof and go slack.'),
  poolishFerment:'Ready when the surface is full of bubbles, domes up easily and has a fresh, slightly tangy yeast smell. Flat and still — let it stand longer; a cold kitchen slows it down. Collapsed in the middle and smelling sharp/alcoholic — it has gone a bit too far; use it anyway, but expect a somewhat more sour taste.',
  intoFridge:()=>N('Use a box with a lid — a cloth dries out the surface and forms a skin. Put it in the coldest zone','Use boxes with lids — cloths dry out the surface and form a skin. Put them in the coldest zone')+': at the back and bottom, above the vegetable drawer (about 2–4°C). Avoid the fridge door (5–7°C) — it\'s the warmest part and swings the most every time you open it, so the dough rises unevenly there.'+N('',' Don\'t stack the boxes tightly on top of each other; it can block air circulation — spread them out a little.')+' And don\'t trust the number on the fridge dial blindly: the 1–5 scales vary between brands, so if you have a thermometer, check that the coldest zone sits below 4°C.'
};
// Proxy slik at eksisterende TIP.xx-oppslag følger valgt språk (byte-identisk norsk).
// v0.743: Proxyen kaller verdien hvis den er en funksjon. Det lar de tipsene som
// avhenger av ANTALL emner regnes ut ved oppslag, uten at et eneste kallsted
// («tip:TIP.intoFridge») måtte endres.
const TIP=new Proxy({},{get:(_,k)=>{
  const v=(window._lang==='en'?TIP_EN:TIP_NO)[k];
  return typeof v==='function' ? v() : v;
}});
// v0.743: entall/flertall etter hvor mange emner planen faktisk lager.
// Appen har alltid vært nøye med selve tellingen («Del i 1 emne à ca. 269g»),
// men fortsatte i flertall i alle instruksjonene rundt: «La emnene stå urørt»,
// «Ikke åpne boksene», «Ikke stable boksene». Med v0.742 ble én pizza dessuten
// det vanlige tilfellet — flourForCount(1) svarer nå 160g — så teksten snakket
// til flertall i den planen folk oftest lager.
function N(entall, flertall){
  try{ return pc().count>1 ? flertall : entall; }catch(e){ return flertall; }
}
// Kort "hvorfor"-forklaring til den dynamiske boksen under metodevalg-kortene
// (wizardens Metode-steg, v5.70). Poolish/Biga gjenbruker WHY.pl/WHY.bi
// ordrett i stedet for å duplisere teksten. Skrevet i samme stil, godkjent
// av Rune via skisse (skisse_metode_forklaring.html) før innbygging.
const METHOD_WHY_NO={
  standard:'Direkte deig uten fordeig-steg, med lang kjøleskapsheving (1–6 dager). Enklest å planlegge — du trenger ikke tenke på en egen fordeig i tillegg, og du styrer smaksdybden selv via hvor mange dager den står kaldt.',
  poolish:WHY_NO.pl,
  biga:WHY_NO.bi,
  hurtig:'Ingen fordeig og ingen lang kjøletid — mer gjær kompenserer for den korte tiden. Raskeste veien fra bolle til ovn, på bekostning av litt av smaksdybden de lengre metodene gir.',
  kveld:'Kortere kjøletid enn Langtidsdeig (5–24 timer, ikke dager) — for deg som vil elte i kveld og steke i morgen uten å planlegge flere dager frem. Gir mer smak enn Hurtigdeig, men litt mindre enn en flerdagers kald heving.',
  mania:'To-trinns metode fra Pizzamania: en egen poolish gjæres for seg i 12 timer og kjøles ned, blandes så inn i hoveddeigen som deretter kjøleskapheves samlet i 10 timer. Fast oppskrift, ingen justerbare variabler.'
};
const METHOD_WHY_EN={
  standard:'A direct dough with no preferment step, with a long cold proof (1–6 days). Easiest to plan — you don\'t have to think about a separate preferment as well, and you control the depth of flavor yourself via how many days it stays cold.',
  poolish:WHY_EN.pl,
  biga:WHY_EN.bi,
  hurtig:'No preferment and no long chill — more yeast compensates for the short time. The fastest route from bowl to oven, at the cost of some of the flavor depth the longer methods give.',
  kveld:'A shorter chill than the long-ferment dough (5–24 hours, not days) — for when you want to knead tonight and bake tomorrow without planning several days ahead. Gives more flavor than the quick dough, but a bit less than a multi-day cold proof.',
  mania:'A two-stage method from Pizzamania: a separate poolish ferments on its own for 12 hours and is cooled down, then mixed into the main dough which is then cold-proofed together for 10 hours. Fixed recipe, no adjustable variables.'
};
const METHOD_WHY=new Proxy({},{get:(_,k)=>((window._lang==='en'?METHOD_WHY_EN:METHOD_WHY_NO)[k])});
function rtW(actualMins){
  const durTxt = fmtDur(actualMins);
  return L(`Romtemperaturhevingen lar gjæren produsere gass og utvikle smak samtidig som glutenstrukturen modnes. Ved ${S.temp}°C og valgt gjærmengde tar dette ca. ${durTxt}.`,`The room-temperature rise lets the yeast produce gas and develop flavor while the gluten structure matures. At ${S.temp}°C and the chosen amount of yeast this takes about ${durEn(durTxt)}.`);
}

// ===== KJØKKENMASKIN: felles tekst-hjelpere =====
// Ankarsrum og manuell elting tilfører lite friksjonsvarme (nær hverandre) — trenger varmere vann
// for å nå samme sluttemperatur. Vanlige kjøkkenmaskiner (eltekrok) tilfører mye friksjonsvarme —
// trenger kaldere vann. Kilde: King Arthur Baking friksjonsfaktor-data (stand mixer ~22–24°F,
// håndelting ~0–4°F) og uavhengige Ankarsrum-sammenligninger (nær håndelting i friksjon).
// F15: konkret °C-anbefaling (DDT-regnet, som Hurtigdeig) også i standard/
// poolish/biga sine blandesteg — kaldt kjøkken om vinteren og varmt om sommeren
// treffer da samme ~23°C deigtemperatur (midt i 22–24-målet), med friksjons-
// varme per kjøkkenmaskin innbakt. Ingen elting beholder den kvalitative
// teksten: der blandes det med skje (ingen maskinfriksjon) og deigen står
// uansett 15 timer i romtemperatur, så starttemperaturen betyr lite.
// v0.763: forgjæringene oppga hvor mye vann, men ikke hvor varmt. Det er
// nettopp der det betyr mest: en poolish eller biga står 12–18 timer uten
// elting, så vannets temperatur ER forgjæringens starttemperatur — det finnes
// ingen eltefriksjon som retter den opp etterpå, slik det gjør i en hoveddeig.
// Mania sa det allerede («18–21°C», rett fra kilden), Poolish og Biga ikke.
// Samme opplysning, to ulike svar i samme app.
//
// Mania beholder sin egen literal med vilje. Den er en AVSKRIFT, frosset av
// test (v0.759), og skal ikke kunne endres av at en delt hjelpefunksjon
// justeres senere. Tallene er de samme i dag; det er koblingen som ikke skal
// finnes.
const PREF_VANN=' (18–21°C) ';
// v0.800: ordene følger TALLET, ikke kjøkkenmaskinen. Før var de to hardkodede
// varianter valgt på maskin, mens tallet ble regnet ut — så de drev fra
// hverandre. Meldt inn på en plan som sa «kjølig eller romtemperert vann
// (anbefalt ca. 4°C)». 4°C er ingen av delene, og målt: følger du ordene i
// stedet for tallet (18–22°C), lander deigen på 25,4–26,0°C — som appens eget
// varsel kaller for varm. Prosaen ledet altså til en deig appen selv ville
// protestert på.
function vannOrd(t){
  if(t<=6)  return L('vann rett fra kjøleskapet','water straight from the fridge');
  if(t<=14) return L('kaldt vann fra springen','cold tap water');
  if(t<=20) return L('kjølig vann','cool water');
  if(t<=26) return L('romtemperert vann','room-temperature water');
  return L('lunkent vann','lukewarm water');
}
function waterTempPhrase(){
  if(S.type==='ingenelting') return L('kjølig eller romtemperert vann (ikke iskaldt)','cool or room-temperature water (not ice-cold)');
  const t=calcWaterTempC(23), ord=vannOrd(t);
  // Er tallet gulvet i klemmingen og det koster deigtemperatur, sier vi det
  // her — ikke «anbefalt», som er en påstand om at det virker.
  return vannIkkeNok(23)
    ? L(`${ord} (${t}°C — kaldere finnes ikke, og det rekker ikke helt her)`,
        `${ord} (${t}°C — it does not get colder, and it is not quite enough here)`)
    : L(`${ord} (ca. ${t}°C)`,`${ord} (about ${t}°C)`);
}
// Blande-/elte-steget er satt av ~20 min, men selve eltingen er kortere (10–12 min
// e.l.). Uten denne presiseringen kunne planens «20 min» og teksten «elt 10–12 min»
// virke motstridende — de 20 er samlet arbeidstid (mel, salt, elting, temp-måling).
function mixWorkNote(){
  return L(' Merk: de ~20 minuttene som er satt av til dette steget, er samlet arbeidstid — å tilsette mel og salt, elte og måle deigtemperatur. Selve eltingen er den kortere tiden nevnt over.',' Note: the ~20 minutes allotted to this step is total working time — adding flour and salt, kneading and measuring the dough temperature. The kneading itself is the shorter time mentioned above.');
}
// "Desired Dough Temperature"-formelen bakere bruker for å styre sluttdeigens temperatur:
// vanntemp = 3×ønsket deigtemp − (romtemp + meltemp + friksjonsfaktor). Meltemp antas lik
// romtemp (vanlig forenkling når melet oppbevares i samme rom som mikseren). Friksjonsfaktoren
// varierer med eltemetode — Ankarsrum/hånd gir lite friksjonsvarme, kraftigere eltekroker mer.
// Mål: ~24°C ferdig deig, uansett hvor lang eller kort gjæringstiden er — det er gjærmengden,
// ikke vanntemperaturen, som skal styre farten på gjæringen.
// F15: target-parameter — Hurtigdeig sikter mot 24°C ferdig deig (standard),
// standard/poolish/biga-blandestegene mot 23°C (midt i 22–24-målet deres).
// v0.787: formelen over har intet ledd for FORDEIGEN, og en fordeig er halve
// deigen. Målt over alle åtte metodene: den traff eksakt på hver metode UTEN
// fordeig (23,0°) og bommet på hver metode MED — poolish rom +2,3°, biga +1,2°,
// mania −4,3°, kald poolish −10,3°. Det er ikke en slurvete konstant; det er en
// formel brukt utenfor sitt gyldighetsområde.
//
// Erstattet med den varmebalansen formelen er en tilnærming til: hver komponent
// bidrar med masse × varmekapasitet × temperatur, og vannet løses ut. De fysiske
// friksjonstallene er valgt slik at DIREKTEDEIG får samme anbefaling som før
// (17 / 21 / 10 °C mot gamle 17 / 21 / 9) — endringen gjelder fordeigene, som er
// der formelen faktisk var gal.
const C_MEL=1.8, C_VANN=4.186;                          // kJ/kg·K
// MÅLT 16.08.2026 (Runes Ankarsrum, 500g/62 %, trinn 3–4 i 10–12 min):
// 21°C i bollen etter blanding → 25–26°C etter elting = 4,5–5°C reell
// eltevarme. Ankarsrum-verdien er altså VALIDERT — ikke juster den ned mot
// spiralmikser-referanser (2–3°C); de gjelder andre maskiner/eltestiler.
// Samme måling viste to motvirkende småfeil som IKKE skal rettes hver for
// seg: kickstartvannet kjølner til ~34°C før blanding (modellen bokfører
// 41,5) og stålbollen varmer blandingen ~0,5–1° mot romtemperatur (ikke
// modellert). Med målte verdier lander 13°-vann fortsatt på ~24,3° deig —
// feilene kansellerer, og vannanbefalingen står seg.
const FRIKSJON_C={ankarsrum:4, manuell:1.5, annen:8};   // reell oppvarming fra elting
function friksjonC(){ return FRIKSJON_C[S.kjokkenmaskin] ?? 5; }
// v0.812: Hurtigdeigens kickstart ber om 60g vann på 40–43°C, men varmebalansen
// bokførte ALT vannet på den beregnede temperaturen — samme vann sto altså med
// to ulike temperaturer i to steg. Målt (500g mel, 62 %, 20°C rom, Ankarsrum):
// planen lovet 24°C ferdig deig, å følge den bokstavelig ga ~26,5°C. Nå er
// kickstartvannet et eget, fast ledd i balansen (midtpunktet av spennet), og
// resten av vannet beregnes til å treffe målet — for samme scenario: 15°C.
// Én kilde: både stegteksten og modellen leser KICK_TEMP.
const KICK_TEMP={mn:40,mx:43};
const KICK_DUR=5;
// v0.824: kickstarten gjelder nå alle de DIREKTE deigene — Hurtigdeig (v6.01),
// Langtidsdeig og Kveldsdeig. Verdien: død gjær avsløres FØR melet er brukt,
// og investeringen som beskyttes er størst for de lange metodene (dagens
// Langtidsdeig oppdager død gjær først når romhevingen uteblir, Kveldsdeig
// neste morgen). Fordeigsmetodene trenger den ikke — fordeigen ER gjærtesten
// (boblene er kvitteringen; sagt eksplisitt i fordeig-stegene fra v0.824).
// Vannmengden: hurtig bruker 60g-porsjonen sin; standard/kveld bruker samme
// avholdte gjærvann (yw) som før — nå lunkent. Én kilde for både stegtekst
// og varmebalanse (deigKomponenter leser samme funksjon).
function kickVannG(){
  if(S.type==='ingenelting') return 0;
  if(S.method==='hurtig') return Math.round(60*S.mel/500);
  if(S.method==='standard'||S.method==='kveld'){
    const vannG=Math.round(S.mel*S.hydro/100);
    return Math.max(10,Math.round(vannG*0.06));
  }
  return 0;
}
// Det ENE kickstart-steget, delt av alle tre metodene — tre kopier ville
// drevet fra hverandre (samme grunn som F17/mNVariant).
function kickstartStep(at, wk, wr, ya){
  const ktxt=`${KICK_TEMP.mn}–${KICK_TEMP.mx}`;
  return {title:'Vekk gjæren (kickstart)',loc:'benk',at,dur:KICK_DUR,
    // v0.814: forventningen kalibrert til gjærmengden (små bobler + tynn film
    // er nok); dødsgrensa i tipset står.
    desc:L(`Rør ${ya} ut i ${wk}g lunkent vann (${ktxt}°C) — en liten del av den totale vannmengden — med en teskje honning. La stå ca. 5 min. Med så lite gjær er små bobler og en tynn, melkete film på overflaten nok — ikke vent noe skumberg. Da vet du gjæren lever, og den får et forsprang før den skal konkurrere med melet om maten. Resten av vannet (${wr}g) tilsettes i neste steg.`,`Stir ${ya} into ${wk}g lukewarm water (${ktxt}°C) — a small part of the total water — with a teaspoon of honey. Let it sit about 5 min. With this little yeast, small bubbles and a thin, milky film on the surface are enough — don't wait for a foam dome. Then you know the yeast is alive, and it gets a head start before it has to compete with the flour for food. The rest of the water (${wr}g) is added in the next step.`),
    needs:[`🫙 ${ya}`, L(`💧 ${wk}g lunkent vann`,`💧 ${wk}g lukewarm water`), L('🍯 1 ts honning','🍯 1 tsp honey')],
    substeps:[
      L(`Rør ${ya} ut i ${wk}g lunkent vann (${ktxt}°C)`,`Stir ${ya} into ${wk}g lukewarm water (${ktxt}°C)`),
      L('Tilsett en teskje honning','Add a teaspoon of honey'),
      L('La stå ca. 5 min — små bobler og en tynn film er nok','Let it sit about 5 min — small bubbles and a thin film are enough')
    ],
    why:L('Bekrefter at gjæren faktisk lever før du blander inn resten, og gir den et forsprang siden den får lettfordøyelig mat med det samme i stedet for å vente på melet.','Confirms the yeast is actually alive before you mix in the rest, and gives it a head start since it gets easily digestible food right away instead of waiting for the flour.'),
    tip:L('Bobler det ikke i det hele tatt etter 5–10 min, er gjæren død — bytt den ut nå, ikke etter du har blandet inn alt melet.','If nothing bubbles at all after 5–10 min, the yeast is dead — replace it now, not after you have mixed in all the flour.')};
}
// Newton: en bolle nærmer seg omgivelsene eksponentielt, og tidskonstanten følger
// massen. 2,2 timer for 500g er anslaget tempereringstiden er bygget på — samme
// tall begge steder, så de to ikke kan sprike.
function fordeigTempC(startC, omgivelseC, timer, masseG){
  return omgivelseC+(startC-omgivelseC)*Math.exp(-timer/(2.2*Math.pow(masseG/500,1/3)));
}
// Fordeigen slik den er I DET DEN GÅR I MASKINEN. null = direktedeig.
// Mania står bevisst utenfor: den har egne, publiserte vannmengder og bruker
// ikke denne anbefalingen i det hele tatt.
function fordeigVedBlanding(){
  const fridge=(S.fridgeC==null?3:S.fridgeC);
  if(S.method==='poolish'){
    const mel=Math.round(S.mel*poolishAndel());
    const kaldFor=!!S.poolishCold||(S.poolishPauseH||0)>0;
    const temp=kaldFor
      ? fordeigTempC(fridge, S.temp, poolishTemperMin()/60, mel*2)
      : S.temp;
    return {melG:mel, vannG:mel, tempC:temp};
  }
  if(S.method==='biga'){
    const mel=Math.round(S.mel*0.6);
    return {melG:mel, vannG:Math.round(mel*0.44), tempC:S.temp};
  }
  return null;
}
// F15: target-parameter — Hurtigdeig sikter mot 24°C ferdig deig (standard),
// standard/poolish/biga-blandestegene mot 23°C (midt i 22–24-målet deres).
// Alt som går i bollen, som [masse kg, varmekapasitet, temperatur]. Én kilde,
// brukt både til å løse ut vannet og til å regne hva et gitt vann faktisk gir.
function deigKomponenter(vannC){
  const melG=S.mel, vannG=Math.round(S.mel*S.hydro/100);
  const fd=fordeigVedBlanding();
  if(fd) return [[fd.melG/1000,C_MEL,fd.tempC],[fd.vannG/1000,C_VANN,fd.tempC],
                 [(melG-fd.melG)/1000,C_MEL,S.temp],
                 [Math.max(0,vannG-fd.vannG)/1000,C_VANN,vannC]];
  // v0.812: kickstartvannet er et fast, varmt ledd — bare resten av vannet er
  // spaken. Siste ledd må forbli spaken: calcWaterTempRaw løser for
  // k[k.length-1]. v0.824: gjelder nå også Langtidsdeig og Kveldsdeig via
  // samme kickVannG (fordeigsmetodene fanges av fd-grenen over).
  const kick=kickVannG();
  if(kick>0 && vannG>kick)
    return [[melG/1000,C_MEL,S.temp],[kick/1000,C_VANN,(KICK_TEMP.mn+KICK_TEMP.mx)/2],
            [(vannG-kick)/1000,C_VANN,vannC]];
  return [[melG/1000,C_MEL,S.temp],[vannG/1000,C_VANN,vannC]];
}
function deigTempC(vannC){
  const k=deigKomponenter(vannC);
  const C=k.reduce((a,x)=>a+x[0]*x[1],0), E=k.reduce((a,x)=>a+x[0]*x[1]*x[2],0);
  return C>0 ? E/C+friksjonC() : S.temp;
}
// v0.800: den ukLEMTE verdien, skilt ut for seg. Uten den kan ingen se om
// tallet som vises er et svar eller bare gulvet i klemmingen — og de to ser
// helt like ut på skjermen. Målt på en poolish 50 % ved 26°C kjøkken med
// eltekrok: regnestykket ber om −53°C, og appen skrev ut 4°C som «anbefalt».
function calcWaterTempRaw(target=24){
  const k=deigKomponenter(0);
  const siste=k[k.length-1];
  const Cv=siste[0]*siste[1];                      // vannleddets varmekapasitet
  if(Cv<=0) return null;                           // ingen spak i det hele tatt
  const fast=k.slice(0,-1);
  const C=fast.reduce((a,x)=>a+x[0]*x[1],0), E=fast.reduce((a,x)=>a+x[0]*x[1]*x[2],0);
  return ((target-friksjonC())*(C+Cv)-E)/Cv;
}
function calcWaterTempC(target=24){
  const t=calcWaterTempRaw(target);
  // Er alt vannet bundet i fordeigen, finnes det ingen spak — da er et presist
  // tall en løgn, og romtemperert er det ærligste svaret.
  if(t===null) return Math.max(4, Math.min(38, Math.round(S.temp)));
  return Math.max(4, Math.min(Math.round(t), 38)); // fra kaldt kjøleskapsvann til lunkent
}
// Klemt OG dyrt. Begge delene må til: målt over 27 kombinasjoner (3 metoder ×
// 3 maskiner × 3 romtemperaturer) klemmes svaret i 9, men i 5 av dem koster det
// ingenting — deigen lander innenfor båndet likevel. Et varsel der ville vært
// støy om et tall som ikke er noe problem.
function vannIkkeNok(target=23){
  const raa=calcWaterTempRaw(target);
  if(raa===null) return null;
  const t=calcWaterTempC(target);
  if(Math.abs(raa-t)<0.6) return null;        // ikke klemt
  const av=deigTempAvvik(t);
  if(!av) return null;                        // klemt, men gratis
  return {raa:Math.round(raa), vist:t, deig:Math.round(av.d), for:av.for};
}
// v0.787: når vannet er klemt mot grensen og deigen likevel ikke når målet, er
// et presist tall en halv sannhet. Sveipet fant to slike hjørner av 54: en 50 %
// romtemperert poolish i et 26°C kjøkken lander på 26,9° selv med iskaldt vann
// (poolishen ER deigen, og den holder romtemperatur), og håndelting i et 18°C
// kjøkken kommer ikke høyere enn 19,7°. Begge er fysikk, ikke feil — men da skal
// det stå, sammen med den spaken som faktisk flytter tallet.
// Dette tallet sto hardkodet som «Deigtemperatur: 22–24°C» i blandesteget — et
// løfte planen ikke kunne innfri. Med kald poolish leverte den 12,7°C mens
// setningen fortsatt sa 22–24. Nå står det appen faktisk gir, regnet av samme
// varmebalanse som vanntemperaturen, og når fysikken ikke rekker fram sier
// setningen hvilken spak som faktisk flytter tallet.
function deigTempSetning(){
  const v=calcWaterTempC(23), av=deigTempAvvik(v), grad=Math.round(deigTempC(v));
  if(!av) return L(`Deigtemperatur: ca. ${grad}°C.`,`Dough temperature: about ${grad}°C.`);
  if(av.for==='varm'){
    // v0.800: 30 %-varianten ble tilbudt også når du ALLEREDE står på 30 % —
    // et råd om å gjøre det du nettopp har gjort. Nå nevnes bare de spakene du
    // faktisk har igjen.
    const spaker=[];
    if(S.method==='poolish' && !S.poolishCold) spaker.push(L('kjøleskaps-poolish','a fridge poolish'));
    if(S.method==='poolish' && poolishAndel()>0.3) spaker.push(L('30 %-varianten','the 30 % variant'));
    const utvei=spaker.length
      ? L(` Vil du ned, er det ${spaker.join(' eller ')} som flytter tallet — ikke vannet.`,
          ` To bring it down it is ${spaker.join(' or ')} that moves the number — not the water.`)
      : L(' Bare et kjøligere kjøkken flytter dette nevneverdig.',' Only a cooler kitchen moves this appreciably.');
    // v0.800: HVORFOR vannet ikke rekker, i tall. «Vannet er så kaldt det kan
    // bli» sier at spaken er brukt opp, men ikke at den knapt fantes: ved 50 %
    // poolish er bare 75 av 325g vann justerbart, og de resterende 250 står i
    // forgjæringen på romtemperatur. Da må de 75 grammene flyttes 7,2 grader
    // for å flytte deigen én.
    let hvorfor='';
    try{
      // Leser fordeigen fra samme kilde som varmeregnskapet gjør
      // (fordeigVedBlanding), så tallet i teksten ikke kan drifte fra modellen —
      // og så en avkjølt poolish oppgir SIN temperatur, ikke romtemperaturen.
      const r=recipeFor(), f=fordeigVedBlanding();
      const just=f ? r.water-f.vannG : null;
      if(just!=null && just>0 && just<r.water){
        hvorfor=L(` Bare ${just} av ${r.water}g vann er justerbart — resten står i forgjæringen på ${Math.round(f.tempC)}°C.`,
                  ` Only ${just} of ${r.water}g water is adjustable — the rest sits in the preferment at ${Math.round(f.tempC)}°C.`);
      }
    }catch(e){}
    return L(`Deigtemperatur: ca. ${grad}°C — varmere enn de 22–24 vi sikter mot, og vannet er allerede så kaldt det kan bli.${hvorfor}${utvei}`,
             `Dough temperature: about ${grad}°C — warmer than the 22–24 we aim for, and the water is already as cold as it can be.${hvorfor}${utvei}`);
  }
  return L(`Deigtemperatur: ca. ${grad}°C — kjøligere enn de 22–24 vi sikter mot. Den gjærer litt saktere enn planen antar, så la deigen og ikke klokka avgjøre når hevingen er ferdig.`,
           `Dough temperature: about ${grad}°C — cooler than the 22–24 we aim for. It ferments a little slower than the plan assumes, so let the dough rather than the clock decide when the rise is done.`);
}
function deigTempAvvik(vannC){
  const d=deigTempC(vannC);
  if(d>24.5) return {d, for:'varm'};
  if(d<21.5) return {d, for:'kald'};
  return null;
}
// v0.805: «rundt 13°C» i tempereringssteget var en håndregnet literal — en
// påstand OM modellen som ikke kom FRA den. Målt før fiksen: 11,7–14,9°C over
// spennet av innstillinger, så rådet var aldri galt, men tallet kunne ikke
// følge deigen — og ved 30 % poolish-andel er regnestykket et annet. Nå regnes
// det av samme varmebalanse som alt annet: fordeigen på kjøleskapstemperatur i
// stedet for temperert. Tallfeieren (r168) mistet med dette sitt siste reelle
// unntak — bare Mania-avskriften står igjen som bevisst literal.
function deigTempUtenTemperering(){
  const f=fordeigVedBlanding();
  if(!f) return null;
  const fridge=(S.fridgeC==null?3:S.fridgeC);
  const r=recipeFor();
  const k=[[Math.max(0,r.flour-f.melG)/1000, C_MEL,  S.temp],
           [f.melG/1000,                     C_MEL,  fridge],
           [f.vannG/1000,                    C_VANN, fridge],
           [Math.max(0,r.water-f.vannG)/1000,C_VANN, calcWaterTempC(23)]];
  const C=k.reduce((a,x)=>a+x[0]*x[1],0), E=k.reduce((a,x)=>a+x[0]*x[1]*x[2],0);
  return C>0 ? E/C+friksjonC() : null;
}
// Samme sannhetskrav for brøkene i samme setning: «halvparten av melet og over
// to tredeler av varmekapasiteten» stemte bare for 50 %-andelen. Ved 30 % er
// det 30 % av melet og ~40 % av varmekapasiteten — så også de regnes nå.
function poolishVarmeandelPct(){
  const f=fordeigVedBlanding();
  if(!f) return null;
  const r=recipeFor();
  const pool=f.melG/1000*C_MEL + f.vannG/1000*C_VANN;
  const tot =r.flour/1000*C_MEL + r.water/1000*C_VANN;
  return tot>0 ? Math.round(pool/tot*100) : null;
}
function machineLabel(){
  const m = window._lang==='en'
    ? {ankarsrum:'Ankarsrum',manuell:'by hand',annen:'the stand mixer'}
    : {ankarsrum:'Ankarsrum',manuell:'For hånd',annen:'kjøkkenmaskinen'};
  return m[S.kjokkenmaskin]||'Ankarsrum';
}
function whyAu(){
  if(S.kjokkenmaskin==='manuell') return L('Glutennettverket dannes naturlig når mel og vann hviler. Gir smidigere deig med mindre elting — spesielt nyttig ved håndelting, siden autolysen gjør mye av jobben før du i det hele tatt begynner.',`The gluten network forms on its own as flour and water rest. Gives a smoother dough with less kneading — especially useful for hand kneading, since the autolyse does much of the job before you even begin.`);
  if(S.kjokkenmaskin==='annen') return L('Glutennettverket dannes naturlig når mel og vann hviler. Gir smidigere deig med mindre elting, og kortere eltetid i maskinen — nyttig siden kjøkkenmaskiner lett overvarmer deigen ved lang eltetid.',`The gluten network forms on its own as flour and water rest. Gives a smoother dough with less kneading, and shorter kneading time in the machine — useful since stand mixers easily overheat the dough during long kneading.`);
  return L('Glutennettverket dannes naturlig når mel og vann hviler. Gir smidigere deig med mindre elting. I Ankarsrum: autolyse er ekstra effektiv fordi deigrullen allerede har fordelt vannet jevnt i melet.',`The gluten network forms on its own as flour and water rest. Gives a smoother dough with less kneading. In the Ankarsrum: autolyse is extra effective because the dough roller has already distributed the water evenly through the flour.`);
}
function whySg(){
  if(S.kjokkenmaskin==='manuell') return L('Salt styrker glutenstrukturen og kontrollerer gjærens aktivitet. Ved håndelting: bland saltet inn sammen med gjæren fra start — du styrer selv tempoet, så det er ikke samme fare for at saltet møter uutviklet gluten som i en maskin.',`Salt strengthens the gluten structure and controls the yeast's activity. For hand kneading: mix the salt in together with the yeast from the start — you control the pace yourself, so there isn't the same risk of the salt meeting undeveloped gluten as in a machine.`);
  if(S.kjokkenmaskin==='annen') return L('Salt styrker glutenstrukturen og kontrollerer gjærens aktivitet. I kjøkkenmaskinen: tilsett salt etter 2–3 min elting — gluten er da så vidt i gang og tåler saltet bedre. Gjæren løses i vannet du holdt av fra autolysen.',`Salt strengthens the gluten structure and controls the yeast's activity. In the stand mixer: add salt after 2–3 min of kneading — the gluten is just getting going and tolerates the salt better. The yeast is dissolved in the water you held back from the autolyse.`);
  return L('Salt styrker glutenstrukturen og kontrollerer gjærens aktivitet. I Ankarsrum: tilsett salt etter ca. 3 min elting — da er gluten allerede i gang og tåler saltet bedre. Gjæren løses i vannet du holdt av fra autolysen.',`Salt strengthens the gluten structure and controls the yeast's activity. In the Ankarsrum: add salt after about 3 min of kneading — the gluten is already going and tolerates the salt better. The yeast is dissolved in the water you held back from the autolyse.`);
}

function langpanneHintText(){
  if(S.type!=='langpanne' && S.type!=='ingenelting') return '';
  const p=pc();
  return L(` Denne mengden gir ${p.count} langpanne${p.count>1?'r':''} (ca. ${p.melPer}g mel per langpanne).`,` This amount makes ${p.count} sheet pan${p.count>1?'s':''} (about ${p.melPer}g flour per pan).`);
}

function rawSteps(a){
  const r=R(),c=S.cold,ie=S.mode==='end',cM2=c*60,rt=rtM(60),tp=S.type;
  if(S.type==='ingenelting'){
    // Verdens enkleste pizzadeig: bland med skje, ingen elting, én lang romtemperert heving.
    // Ingen kjøleskapsdager, ingen kjøkkenmaskin, ingen ovntype-valg — dette er en fast prosess
    // uavhengig av hvilken Metode som tilfeldigvis står valgt.
    const MIX_DUR=10, REST_MIN=900, SHAPE_DUR=15, PROOF_DUR=35;
    const totalOffset=MIX_DUR+REST_MIN+SHAPE_DUR+PROOF_DUR;
    const t0=ie?sM(a,totalOffset):a;
    const restAt=aM(t0,MIX_DUR);
    const shapeAt=aM(restAt,REST_MIN);
    const proofAt=aM(shapeAt,SHAPE_DUR);
    const bakeAt=aM(proofAt,PROOF_DUR);
    return[
      {title:'Bland alt i bollen',loc:'benk',at:t0,dur:MIX_DUR,
        desc:L(`Bland ${r.flour}g mel, ${r.salt}g salt og ${yA(r)} tørt i en stor bolle. Tilsett ${r.water}g ${waterTempPhrase()} og rør sammen med en skje til alt melet er fuktet. Klumpete og grovt er helt greit — ingen elting.${langpanneHintText()}`,`Mix ${r.flour}g flour, ${r.salt}g salt and ${yA(r)} dry in a large bowl. Add ${r.water}g ${waterTempPhrase()} and stir together with a spoon until all the flour is moistened. Lumpy and rough is perfectly fine — no kneading.${langpanneHintText()}`),
        needs:[L(`🌾 ${r.flour}g mel`,`🌾 ${r.flour}g flour`), `🧂 ${r.salt}g salt`, `🫙 ${yA(r)}`, L(`💧 ${r.water}g vann`,`💧 ${r.water}g water`)],
        substeps:[
          L(`Bland ${r.flour}g mel, ${r.salt}g salt og ${yA(r)} tørt i en stor bolle`,`Mix ${r.flour}g flour, ${r.salt}g salt and ${yA(r)} dry in a large bowl`),
          L(`Tilsett ${r.water}g vann`,`Add ${r.water}g water`),
          L(`Rør sammen med en skje til alt melet er fuktet — klumpete er helt greit`,`Stir together with a spoon until all the flour is moistened — lumpy is perfectly fine`)
        ],
        why:L('Lang, langsom heving bygger opp glutenstrukturen av seg selv — helt uten mekanisk arbeid.',`A long, slow rise builds up the gluten structure on its own — entirely without mechanical work.`),
        tip:L('Ingen kjøkkenmaskin eller håndelting nødvendig i det hele tatt — bare rør sammen med en skje.',`No stand mixer or hand kneading needed at all — just stir together with a spoon.`)},
      {title:'La stå (natt over)',loc:'rom',at:restAt,dur:REST_MIN,passive:true,
        desc:L(`Dekk bollen med plastfolie eller lokk. La stå i romtemperatur i ca. ${Math.round(REST_MIN/60)} timer, til overflaten er full av bobler og deigen har mer enn doblet seg.`,`Cover the bowl with plastic wrap or a lid. Let it sit at room temperature for about ${Math.round(REST_MIN/60)} hours, until the surface is full of bubbles and the dough has more than doubled.`),
        substeps:[
          L('Dekk bollen med plastfolie eller lokk',`Cover the bowl with plastic wrap or a lid`),
          L(`La stå i romtemperatur i ca. ${Math.round(REST_MIN/60)} timer, til den er full av bobler og har doblet seg`,`Let it sit at room temperature for about ${Math.round(REST_MIN/60)} hours, until it is full of bubbles and has doubled`)
        ],
        why:L('Enzymer og gjær jobber sakte over lang tid og bygger smak og glutenstruktur uten at du trenger å gjøre noe.',`Enzymes and yeast work slowly over a long time and build flavor and gluten structure without you needing to do anything.`),
        // v0.758: femten timer på benken, og steget hadde ikke noe tips i det
        // hele tatt — verken norsk eller engelsk. Beskrivelsen sier hva som er
        // KLART, men ingenting om hva som er for langt, og en ingen elting-deig
        // med bare ett hevesteg har ingen senere sjekkpunkt å redde seg på.
        // Samme tre tegn med hver sin handling som resten av hevestegene.
        tip:L('Klar når overflaten er full av bobler og deigen har mer enn doblet seg — den skal skjelve som gelé når du rister forsiktig på bollen. Er den lite vokst med få bobler, gi den mer tid; kjøkkenet er kaldere enn du tror. Har midten sunket inn og lukten blitt skarpt sur, er den for langt fram — bruk den med en gang, den blir ikke bedre av å vente.',
              `Ready when the surface is full of bubbles and the dough has more than doubled — it should wobble like jelly when you shake the bowl gently. If it has barely grown and has few bubbles, give it more time; the kitchen is colder than you think. If the middle has sunk and the smell has turned sharply sour, it is too far gone — use it right away, it will not improve by waiting.`)},
      {title:pc().count>1?'Del i langpanner, press ut':'Press ut i oljet form',loc:'benk',at:shapeAt,dur:SHAPE_DUR,
        desc:pc().count>1
          ?L(`Del deigen i ${pc().count} deler à ca. ${pc().perPizza}g. Fordel ${r.oil||30}g olivenolje totalt utover langpannene. Vend hver del forsiktig ut i sin egen form — ikke elt, bare press utover med fingertuppene til den dekker bunnen.`,`Divide the dough into ${pc().count} pieces of about ${pc().perPizza}g each. Spread ${r.oil||30}g olive oil in total across the sheet pans. Turn each piece gently out into its own pan — don't knead, just press outward with your fingertips until it covers the bottom.`)
          :L(`Fordel ${r.oil||30}g olivenolje godt i en langpanne. Vend deigen forsiktig ut i formen — ikke elt, bare press den utover med fingertuppene til den dekker bunnen.`,`Spread ${r.oil||30}g olive oil well in a sheet pan. Turn the dough gently out into the pan — don't knead, just press it outward with your fingertips until it covers the bottom.`),
        needs:[L(`🫒 ${r.oil||30}g olivenolje`,`🫒 ${r.oil||30}g olive oil`)],
        substeps: pc().count>1 ? [
          L(`Del deigen i ${pc().count} deler à ca. ${pc().perPizza}g`,`Divide the dough into ${pc().count} pieces of about ${pc().perPizza}g each`),
          L(`Fordel ${r.oil||30}g olivenolje utover langpannene`,`Spread ${r.oil||30}g olive oil across the sheet pans`),
          L('Vend hver del forsiktig ut, press med fingertuppene til den dekker bunnen',`Turn each piece gently out, press with your fingertips until it covers the bottom`)
        ] : [
          L(`Fordel ${r.oil||30}g olivenolje godt i langpannen`,`Spread ${r.oil||30}g olive oil well in the sheet pan`),
          L('Vend deigen ut i formen',`Turn the dough out into the pan`),
          L('Press den utover med fingertuppene til den dekker bunnen',`Press it outward with your fingertips until it covers the bottom`)
        ],
        why:L('Minimal håndtering bevarer luftboblene som har bygget seg opp under hevingen.',`Minimal handling preserves the air bubbles that have built up during the rise.`),
        tip:L('Er deigen for elastisk til å nå hjørnene med én gang: la den hvile 10 min og press videre — den gir lettere etter en kort pause.',`If the dough is too elastic to reach the corners right away: let it rest 10 min and keep pressing — it gives more easily after a short pause.`)},
      {title:'Etterheving + forvarm ovn',loc:'rom',at:proofAt,dur:PROOF_DUR,passive:true,
        desc:L(`Dekk formen${pc().count>1?'e':''} løst og la etterheve ${PROOF_DUR} min mens ovnen varmes til 250°C.`,`Cover the pan${pc().count>1?'s':''} loosely and let it final-proof ${PROOF_DUR} min while the oven heats to 250°C.`),
        substeps:[
          L(`Dekk formen${pc().count>1?'e':''} løst`,`Cover the pan${pc().count>1?'s':''} loosely`),
          L(`La etterheve ${PROOF_DUR} min mens ovnen varmes til 250°C`,`Let it final-proof ${PROOF_DUR} min while the oven heats to 250°C`)
        ],
        why:L('Gluten slapper av etter forming, og deigen får en siste, kort heving før steking.',`The gluten relaxes after shaping, and the dough gets a final, short rise before baking.`)},
      {title:'Press ut hjørnene, topp og stek 🔥',loc:'ovn',at:bakeAt,dur:0,
        desc:L(`Press fingertuppene ned i deigen${pc().count>1?' på hver panne':''} over hele flaten (som focaccia) rett før steking. Ha på saus, ost og topping. Stek på 250°C (vanlig ovn, midterste rille) i 20–25 min til gyllenbrun og sprø i kantene${pc().count>1?' — stek én panne om gangen om de ikke får plass samtidig i ovnen':''}.`,`Press your fingertips down into the dough${pc().count>1?' on each pan':''} across the whole surface (like focaccia) right before baking. Add sauce, cheese and toppings. Bake at 250°C (regular oven, middle rack) for 20–25 min until golden brown and crisp at the edges${pc().count>1?' — bake one pan at a time if they don\'t fit in the oven at once':''}.`),
        substeps:[
          L(`Press fingertuppene ned i deigen${pc().count>1?' på hver panne':''} over hele flaten, som focaccia`,`Press your fingertips down into the dough${pc().count>1?' on each pan':''} across the whole surface, like focaccia`),
          L('Ha på saus, ost og topping',`Add sauce, cheese and toppings`),
          L(`Stek på 250°C, midterste rille, 20–25 min til gyllenbrun og sprø`,`Bake at 250°C, middle rack, 20–25 min until golden brown and crisp`)
        ],
        why:WHY.st,
        tip:L('Denne deigen er for løs og våt til pizzaovn-stil på 430–450°C i 90 sekunder — den trenger lengre tid på lavere varme for å bli gjennomstekt uten å brenne toppen.',`This dough is too loose and wet for pizza-oven style at 430–450°C for 90 seconds — it needs more time at lower heat to cook through without burning the top.`)}
    ];
  }
  // Felles hjelper: bygger de fire siste stegene (form, kjøleskapsheving, ta ut, stek)
  // slik at fremover og bakover ALLTID gir identisk timing.
  // Ankerpunkt: form-tid. Stek = form + cM2. Ta ut = stek - temper. Kald tid = cM2 - temper - 15.
  // F14: benketida (temperering) var hardkodet 240 min uansett romtemperatur —
  // mens steg-teksten selv sa «hvor lenge den trenger avhenger av hvor varmt
  // rommet er». Nå skaleres den med tf() som de andre rom-fasene (22°C = 240 min
  // som før; 18°C → lengre, 26°C → kortere), bundet nedad til 60 min og oppad
  // slik at kald tid aldri blir under 60 min for korte kjøletider. Steketid og
  // middag flyttes IKKE — kun fordelingen kald tid ↔ benketid endres.
  function tailSteps(formAt){
    const temper=Math.max(60,Math.min(rtM(240), cM2-15-60));
    const coldDur=cM2-temper-15;
    const bake=aM(formAt,cM2),taUt=sM(bake,temper);
    return[
      // v0.738: steget sto merket «❄️ Kjøleskap» fordi tittelen ender i
      // «→ kjøleskap», men i disse 15 minuttene deler, veier og runder du emnene
      // PÅ BENKEN — kjøleskapet er først der på slutten. dispLoc retter
      // merkelappen uten å røre `loc`, som mater temperaturmodellen: å flytte den
      // til 'benk' ville vært fysisk riktigere, men endrer gjærmengden for alle
      // (24 t: 1,13 → 1,11 g) og bryter kalibreringsankeret fra F23. Den delen er
      // parkert som F26, til neste gang kalibreringen uansett skal åpnes.
      {title:S.type==='langpanne'?'Del i langpanner → kjøleskap':'Form emner → kjøleskap',loc:'kjol',dispLoc:'benk',at:formAt,dur:15,
        desc:S.type==='langpanne'
          ?L(`Del deigen i ${pc().count} del${pc().count>1?'er':''} à ca. ${pc().perPizza}g (${pc().melPer}g mel per langpanne). Rund ${pc().count>1?'hver del':'delen'} løst sammen — du strekker den ut i formen senere. Legg i ${pc().count>1?'oljede bokser':'oljet boks'} med tett lokk. Sett i kjøleskap.`,`Divide the dough into ${pc().count} piece${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''} (${pc().melPer}g flour per sheet pan). Loosely round ${pc().count>1?'each piece':'the piece'} — you stretch it out in the pan later. Place in ${pc().count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}. Put in the fridge.`)
          :S.type==='chicago'
          ?L(`Del i ${pc().count} emne${pc().count>1?'r':''} à ca. ${pc().perPizza}g (hvorav ${pc().melPer}g mel). Rund godt med begge hender. Legg i ${pc().count>1?'oljede bokser':'oljet boks'} med tett lokk. Sett i kjøleskap — du presser emnet ut i den runde jernpanna når du skal steke.`,`Divide into ${pc().count} ball${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''} (of which ${pc().melPer}g is flour). Round well with both hands. Place in ${pc().count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}. Put in the fridge — you press the ball out into the round cast-iron pan when you're ready to bake.`)
          :L(`Del i ${pc().count} emne${pc().count>1?'r':''} à ca. ${pc().perPizza}g (hvorav ${pc().melPer}g mel). Rund godt med begge hender. Legg i ${pc().count>1?'oljede bokser':'oljet boks'} med tett lokk. Sett i kjøleskap.`,`Divide into ${pc().count} ball${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''} (of which ${pc().melPer}g is flour). Round well with both hands. Place in ${pc().count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}. Put in the fridge.`),
        needs:[L(`📦 ${pc().count} boks${pc().count>1?'er':''} m/lokk`,`📦 ${pc().count} container${pc().count>1?'s':''} w/lid${pc().count>1?'s':''}`), L('🫒 litt olje',`🫒 a little oil`)],
        substeps:[
          L(`Del i ${pc().count} emne${pc().count>1?'r':''} à ca. ${pc().perPizza}g`,`Divide into ${pc().count} ball${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''}`),
          S.type==='langpanne' ? L(`Rund ${pc().count>1?'hver del':'delen'} løst sammen`,`Loosely round ${pc().count>1?'each piece':'the piece'}`) : L('Rund godt med begge hender',`Round well with both hands`),
          L(`Legg i ${pc().count>1?'oljede bokser':'oljet boks'} med tett lokk`,`Place in ${pc().count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}`),
          L('Sett i kjøleskap',`Put in the fridge`)
        ],
        why:WHY.form,
        tip:TIP.intoFridge},
      {title:'Kjøleskapsheving',loc:'kjol',at:aM(formAt,15),dur:coldDur,passive:true,
        desc:L(`${N('La emnet stå urørt','La emnene stå urørt')} i kjøleskapet i ca. ${fmtDur(coldDur)}. ${N('Ikke åpne boksen.','Ikke åpne boksene.')}`,`${N('Let the ball sit undisturbed','Let the balls sit undisturbed')} in the fridge for about ${durEn(fmtDur(coldDur))}. ${N("Don't open the container.","Don't open the containers.")}`),
        substeps:[
          L(`${N('La emnet stå urørt','La emnene stå urørt')} i kjøleskapet i ca. ${fmtDur(coldDur)}`,`${N('Let the ball sit undisturbed','Let the balls sit undisturbed')} in the fridge for about ${durEn(fmtDur(coldDur))}`),
          L(N('Ikke åpne boksen','Ikke åpne boksene'),N("Don't open the container","Don't open the containers"))
        ],
        why:WHY.fk,
        tip:TIP.coldRise},
      {title:'Ta ut av kjøleskap',loc:'rom',at:taUt,dur:0,
        desc:L(`${N('Ta deigemnet','Ta deigemnene')} ut på benken — dette er benktida (temperering) etter kjøleskapsfermenteringen. ${N('La det stå dekket','La dem stå dekket')} ved romtemperatur i ca. ${fmtDur(temper)} (ved ${S.temp}°C) før steking, så deigen både blir strekkbar og får en siste heving. ${N('Ikke åpne boksen ennå.','Ikke åpne boksene ennå.')}`,`Take the dough balls out onto the counter — this is the bench rest (warming up) after the cold fermentation. Let them sit covered at room temperature for about ${durEn(fmtDur(temper))} (at ${S.temp}°C) before baking, so the dough both becomes stretchable and gets a final rise. ${N("Don't open the container yet.","Don't open the containers yet.")}`),
        substeps:[
          L(N('Ta deigemnet ut av kjøleskapet, over på benken','Ta deigemnene ut av kjøleskapet, over på benken'),N('Take the dough ball out of the fridge, onto the counter','Take the dough balls out of the fridge, onto the counter')),
          L(`${N('La det stå','La dem stå')} dekket ved romtemperatur i ca. ${fmtDur(temper)} (benktid)`,`Let sit covered at room temperature for about ${durEn(fmtDur(temper))} (bench time)`),
          L(N('Ikke åpne boksen ennå','Ikke åpne boksene ennå'),N("Don't open the container yet","Don't open the containers yet"))
        ],
        why:WHY.tu,
        tip:TIP.benchTemper},
      // v0.737: stekesteget har alltid sagt at ovnen må forvarmes 15–20 min
      // (pizzaovn) eller minst 45 min (vanlig ovn med stein/stål), men tidsplanen
      // gikk rett fra «ferdig temperert» til «stek» — så du oppdaget kravet i det
      // øyeblikket det var for sent.
      // v0.739: selve steget bygges nå av preheatSteps(), som Mania og Kveldsdeig
      // også kaller. Klemt mot benketida så det aldri kan havne før «Ta ut av
      // kjøleskap», selv om noen senere skulle senke gulvet på temper (i dag ≥ 60 min).
      ...preheatSteps(bake, temper, tp),
      {title:'Strekk og stek 🔥',loc:'ovn',at:bake,dur:0,desc:oD(tp),substeps:bakeSubsteps(tp),why:WHY.st,tip:bakeTip(tp)}
    ];
  }
  if(S.method==='standard'){
    // F19: bakover-modus er kun «trekk totalen fra ankeret» — deretter regnes
    // alt alltid fremover fra t0 (45 min prep + romheving + kald hale til stek).
    // v0.822: kald bulk (Pizzamani-mønsteret, «Den ultimate oppskrift»,
    // pizzamani.no des. 2019): 2 t bulk i romtemperatur → S.cold timer kaldt
    // I BULK → forme emner av kald deig → LANG etterheving (8 t ved 22°) →
    // stek. Speilvendt logistikk av standardhalen (som kjøler EMNER og
    // tempererer 1–2 t): kald bulk gir én boks i skapet, lettformet kald
    // deig, og et etterhevingsplatå så bredt at stekevinduet (F38) nesten
    // løser seg selv — Pizzamani: «ferdighevde deiger holder seg 4–6 timer».
    // Prisen: serveringsdagen starter ~8 t før middag. Begge tider skaleres
    // med tf(), samme regel som all annen romheving. Gjæren trenger INGEN
    // egen kurve: Q10-integralet leser den faktiske stegkjeden (loc rom/kjol)
    // og skalerer selv — memo-nøkkelen i currentFermentLoad kan S.kaldBulk.
    const kbBulk=rtM(120), kbEtterhev=rtM(480);
    const TOTAL_STD=S.kaldBulk ? 45+kbBulk+cM2+15+kbEtterhev : 45+rt+cM2;
    const t0=ie?sM(a,TOTAL_STD):a;
    // v0.736: autolysen ba deg helle ALT vannet i melet, og steget etter ba deg
    // løse gjæren «i litt vann». Fulgte du oppskriften bokstavelig, fantes det
    // ikke vann igjen; hentet du nytt fra springen, sprakk både deigvekten og
    // hydreringen. Samme grep som Hurtigdeigens kickstart (wk/wr): en liten del
    // holdes av til gjæren, og yw + (r.water-yw) = r.water, så totalen står.
    const yw=kickVannG(); // v0.824: samme formel som før (6 % av vannet, min 10g) — nå fra én kilde, delt med varmebalansen
    const hode=[
      {title:S.kjokkenmaskin==='ankarsrum'?'Ankarsrum — bland og autolyse':S.kjokkenmaskin==='manuell'?'Bland for hånd og autolyse':'Kjøkkenmaskin — bland og autolyse',loc:'benk',at:t0,dur:30,
        sessionNote:S.kaldBulk
          ?L(`Sett av ca. ${fmtSessionDur(45)} sammenhengende nå — og vær hjemme om ${fmtHM(45+kbBulk)} for å sette deigen kaldt.`,`Set aside about ${fmtSessionDur(45)} of uninterrupted time now — and be home in ${fmtHM(45+kbBulk)} to put the dough in the fridge.`)
          :L(`Sett av ca. ${fmtSessionDur(60+rt)} sammenhengende — de neste tre stegene gjøres i ett strekk.`,`Set aside about ${fmtSessionDur(60+rt)} of uninterrupted time — the next three steps are done in one go.`),
        desc:(S.kjokkenmaskin==='ankarsrum'
          ?L(`Hell ${r.water-yw}g ${waterTempPhrase()} i Ankarsrum-bollen — hold av ${yw}g vann til gjær-kickstarten. Start maskinen på trinn 1 og tilsett ${r.flour}g mel gradvis i 3–4 omganger. Stopp når alt melet er inkorporert — ingen gjær eller salt ennå. Dekk bollen og la hvile 20–30 min (autolyse).`,`Pour ${r.water-yw}g ${waterTempPhrase()} into the Ankarsrum bowl — hold back ${yw}g of water for the yeast kickstart. Start the machine on speed 1 and add ${r.flour}g flour gradually in 3–4 batches. Stop when all the flour is incorporated — no yeast or salt yet. Cover the bowl and let rest 20–30 min (autolyse).`)
          :S.kjokkenmaskin==='manuell'
          ?L(`Hell ${r.water-yw}g ${waterTempPhrase()} i en bolle — hold av ${yw}g vann til gjær-kickstarten. Rør inn ${r.flour}g mel gradvis med en slikkepott eller hånden til alt melet er fuktet — ingen gjær eller salt ennå. Dekk bollen og la hvile 20–30 min (autolyse).`,`Pour ${r.water-yw}g ${waterTempPhrase()} into a bowl — hold back ${yw}g of water for the yeast kickstart. Stir in ${r.flour}g flour gradually with a spatula or your hand until all the flour is moistened — no yeast or salt yet. Cover the bowl and let rest 20–30 min (autolyse).`)
          :L(`Hell ${r.water-yw}g ${waterTempPhrase()} i bollen på kjøkkenmaskinen — hold av ${yw}g vann til gjær-kickstarten. Sett i eltekroken, kjør på laveste hastighet og tilsett ${r.flour}g mel gradvis. Stopp når alt melet er inkorporert — ingen gjær eller salt ennå. Dekk bollen og la hvile 20–30 min (autolyse).`,`Pour ${r.water-yw}g ${waterTempPhrase()} into the stand mixer bowl — hold back ${yw}g of water for the yeast kickstart. Fit the dough hook, run on the lowest speed and add ${r.flour}g flour gradually. Stop when all the flour is incorporated — no yeast or salt yet. Cover the bowl and let rest 20–30 min (autolyse).`))+langpanneHintText(),
        needs:[L(`💧 ${r.water-yw}g vann (av ${r.water}g)`,`💧 ${r.water-yw}g water (of ${r.water}g)`), L(`🌾 ${r.flour}g mel`,`🌾 ${r.flour}g flour`)],
        substeps:[
          L(`Hell ${r.water-yw}g ${waterTempPhrase()} i bollen — hold av ${yw}g til gjæren`,`Pour ${r.water-yw}g ${waterTempPhrase()} into the bowl — hold back ${yw}g for the yeast`),
          L(`Start på laveste hastighet/trinn, tilsett ${r.flour}g mel gradvis`,`Start on the lowest speed/setting, add ${r.flour}g flour gradually`),
          L(`Stopp når alt melet er inkorporert — ingen gjær eller salt ennå`,`Stop when all the flour is incorporated — no yeast or salt yet`),
          L(`Dekk bollen, la hvile 20–30 min (autolyse)`,`Cover the bowl, let rest 20–30 min (autolyse)`)
        ],
        why:whyAu(),
        tip:S.kjokkenmaskin==='ankarsrum'
          ?L('Ankarsrum liker væske i bunnen — melet trekkes jevnt inn under deigrullen. Ikke overfyll på én gang.',`The Ankarsrum likes liquid at the bottom — the flour is drawn in evenly under the dough roller. Don't overfill at once.`)
          :S.kjokkenmaskin==='manuell'
          ?L('Ingen grunn til å skynde seg her — bare bland til det ikke er tørt mel igjen. Autolysen gjør mye av arbeidet for deg.',`No reason to rush here — just mix until there's no dry flour left. The autolyse does much of the work for you.`)
          :L('Kjør kun på laveste hastighet i denne fasen — høyere hastighet før autolysen varmer opp deigen unødvendig mye.',`Run only on the lowest speed in this phase — higher speed before the autolyse warms the dough up unnecessarily.`)},
      // v0.824: kickstarten koster NULL ekstra tid her — den gjøres mens
      // autolysen hviler (starter 10 min før hvilen er ferdig). Død gjær
      // oppdages ellers først når romhevingen uteblir, en time senere med
      // alt melet brukt. Delt steg med Hurtigdeig/Kveldsdeig (kickstartStep).
      kickstartStep(aM(t0,20), yw, r.water-yw, yA(r)),
      {title:'Tilsett gjær og salt — elt ferdig',loc:'benk',at:aM(t0,30),dur:15,
        desc:S.kjokkenmaskin==='ankarsrum'
          ?L(`Hell gjærblandingen fra kickstarten i bollen${r.sugar?` sammen med ${r.sugar}g sukker`:''}. Start maskinen på trinn 2–3 og elt i 3 min. Tilsett deretter ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Øk gradvis til trinn 3–4. Elt totalt 12–15 min til deigen er glatt og smidig og slipper bollen. Mål deigtemperaturen — den skal vise 22–24°C.`,`Pour the yeast mixture from the kickstart into the bowl${r.sugar?` together with ${r.sugar}g sugar`:''}. Start the machine on speed 2–3 and knead for 3 min. Then add ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Increase gradually to speed 3–4. Knead 12–15 min total until the dough is smooth and supple and releases from the bowl. Measure the dough temperature — it should read 22–24°C.`)
          :S.kjokkenmaskin==='manuell'
          ?L(`Hell gjærblandingen fra kickstarten i bollen${r.sugar?` sammen med ${r.sugar}g sukker`:''}, og bland inn ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. ${S.hydro>68?'Deigen er for våt for vanlig håndelting ved denne hydreringen. Bruk fransk elting (slap-and-fold): løft deigen med begge hender, dra den ut til sidene, og «slå» den ned mot benken i et fast, rytmisk tempo. Gjenta i 10–15 min — deigen strammer seg gradvis og blir mindre klissete.':'Vend ut på lett melet benk. Press deigen ut med håndbaken, brett den tilbake over seg selv, drei en kvart omgang — «press, brett, drei». Gjenta i 8–12 min til deigen er glatt, smidig og bare lett klissete. Mål gjerne deigtemperaturen — sikt mot 22–24°C.'}`,`Pour the yeast mixture from the kickstart into the bowl${r.sugar?` together with ${r.sugar}g sugar`:''}, and mix in ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. ${S.hydro>68?'The dough is too wet for regular hand kneading at this hydration. Use French kneading (slap-and-fold): lift the dough with both hands, stretch it out to the sides, and "slap" it down against the counter in a firm, rhythmic tempo. Repeat for 10–15 min — the dough tightens gradually and becomes less sticky.':'Turn out onto a lightly floured counter. Press the dough out with the heel of your hand, fold it back over itself, turn a quarter turn — "press, fold, turn". Repeat for 8–12 min until the dough is smooth, supple and only lightly sticky. Measure the dough temperature if you like — aim for 22–24°C.'}`)
          :L(`Hell gjærblandingen fra kickstarten i bollen${r.sugar?` sammen med ${r.sugar}g sukker`:''}. Kjør eltekroken på lav hastighet i 2–3 min. Tilsett deretter ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Øk til middels lav hastighet. Elt totalt 6–10 min til deigen slipper bollen og er glatt — kjøkkenmaskiner overelter lett, så sjekk windowpane-testen tidlig og ofte.`,`Pour the yeast mixture from the kickstart into the bowl${r.sugar?` together with ${r.sugar}g sugar`:''}. Run the dough hook on low speed for 2–3 min. Then add ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Increase to medium-low speed. Knead 6–10 min total until the dough releases from the bowl and is smooth — stand mixers over-knead easily, so check the windowpane test early and often.`),
        needs:[`🧂 ${r.salt}g salt`, ...(r.oil?[L(`🫒 ${r.oil}g olje`,`🫒 ${r.oil}g oil`)]:[]), ...(r.butter?[L(`🧈 ${r.butter}g smør`,`🧈 ${r.butter}g butter`)]:[]), ...(r.sugar?[L(`🍯 ${r.sugar}g sukker`,`🍯 ${r.sugar}g sugar`)]:[])],
        substeps:[
          L(`Hell gjærblandingen fra kickstarten i bollen`,`Pour the yeast mixture from the kickstart into the bowl`),
          L(`Kjør på lav hastighet i 2–3 min`,`Run on low speed for 2–3 min`),
          L(`Tilsett ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}`,`Add ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}`),
          L(`Øk hastigheten, elt til deigen er glatt og slipper bollen`,`Increase the speed, knead until the dough is smooth and releases from the bowl`)
        ],
        why:whySg(),
        tip:S.kjokkenmaskin==='ankarsrum'
          ?L('Ankarsrum jobber best på lav-til-middels hastighet i lang tid. Unngå trinn 5–6 for pizzadeig — det overvarmer og bryter ned gluten.',`The Ankarsrum works best at low-to-medium speed for a long time. Avoid speed 5–6 for pizza dough — it overheats and breaks down the gluten.`)
          :S.kjokkenmaskin==='manuell'
          ?L('Windowpane-testen er din venn her — stopp når en liten bit deig kan strekkes tynt uten å rive.',`The windowpane test is your friend here — stop when a small piece of dough can be stretched thin without tearing.`)
          :L('De fleste kjøkkenmaskiner takler pizzadeig godt på trinn 2 (av typisk 1–10). Høyere hastighet enn det er sjelden nødvendig og øker faren for overoppheting.',`Most stand mixers handle pizza dough well on speed 2 (of a typical 1–10). Higher speed than that is rarely necessary and increases the risk of overheating.`)},
    ];
    if(S.kaldBulk){
      const bulkAt=aM(t0,45), kaldAt=aM(bulkAt,kbBulk), formAt=aM(kaldAt,cM2), ehAt=aM(formAt,15), bakeAt=aM(ehAt,kbEtterhev);
      return[...hode,
        {title:'Bulk-heving i romtemperatur',loc:'rom',at:bulkAt,dur:kbBulk,passive:true,
          desc:L(`Løft deigen over i en oljet boks eller bolle med lokk/plast. La stå samlet (i bulk) ved ${S.temp}°C i ca. ${fmtHM(kbBulk)} — gjæringen skal så vidt komme i gang før kulda.`,`Lift the dough into an oiled container or bowl with a lid/plastic. Let it sit whole (in bulk) at ${S.temp}°C for about ${fmtHM(kbBulk)} — the fermentation should just get going before the cold.`),
          substeps:[L('Legg deigen i oljet boks med lokk','Place the dough in an oiled container with a lid'),L(`La stå ved ${S.temp}°C i ca. ${fmtHM(kbBulk)}`,`Let sit at ${S.temp}°C for about ${fmtHM(kbBulk)}`)],
          why:L('En kort, varm start vekker gjæren før kjøleskapet bremser den — uten den ville den kalde fasen nesten stått stille.','A short, warm start wakes the yeast before the fridge slows it down — without it the cold phase would nearly stand still.'),tip:TIP.roomRise},
        {title:'Kjøleskapsheving i bulk',loc:'kjol',at:kaldAt,dur:cM2,passive:true,
          desc:L(`Sett boksen i kjøleskapet. La deigen stå samlet og urørt i ca. ${fmtDur(cM2)}. Ikke åpne boksen.`,`Put the container in the fridge. Let the dough sit whole and undisturbed for about ${durEn(fmtDur(cM2))}. Don't open the container.`),
          substeps:[L('Sett boksen i kjøleskapet','Put the container in the fridge'),L(`La stå urørt i ca. ${fmtDur(cM2)}`,`Let sit undisturbed for about ${durEn(fmtDur(cM2))}`)],
          why:WHY.fk,tip:TIP.coldRise},
        {title:'Form emner (kald deig)',loc:'benk',at:formAt,dur:15,
          desc:L(`Ta deigen rett fra kjøleskapet og del i ${pc().count} emne${pc().count>1?'r':''} à ca. ${pc().perPizza}g (hvorav ${pc().melPer}g mel). Kald deig er fastere og lettere å runde stramt. Legg ${pc().count>1?'emnene på et oljet brett eller i oljede bokser':'emnet i en oljet boks'}, dekk til.`,`Take the dough straight from the fridge and divide into ${pc().count} ball${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''} (of which ${pc().melPer}g is flour). Cold dough is firmer and easier to round tightly. Place ${pc().count>1?'the balls on an oiled tray or in oiled containers':'the ball in an oiled container'}, cover.`),
          needs:[L(`📦 brett eller ${pc().count} boks${pc().count>1?'er':''}`,`📦 a tray or ${pc().count} container${pc().count>1?'s':''}`), L('🫒 litt olje','🫒 a little oil')],
          substeps:[L(`Del i ${pc().count} emne${pc().count>1?'r':''} à ca. ${pc().perPizza}g`,`Divide into ${pc().count} ball${pc().count>1?'s':''} of about ${pc().perPizza}g${pc().count>1?' each':''}`),L('Rund stramt — kald deig er lett å jobbe med','Round tightly — cold dough is easy to work with'),L('Legg på oljet brett/i bokser, dekk til','Place on an oiled tray/in containers, cover')],
          why:L('Kald deig former seg lettere stramt, og stramme emner holder fasongen gjennom den lange etterhevingen.','Cold dough shapes tightly with ease, and tight balls hold their shape through the long final proof.'),
          tip:L('Ikke varm opp deigen med hendene mer enn nødvendig — jobb raskt.','Do not warm the dough with your hands more than necessary — work quickly.')},
        {title:`Etterheving (${fmtHM(kbEtterhev)})`,loc:'rom',at:ehAt,dur:kbEtterhev,passive:true,
          desc:L(`Etterhev tildekket ved ${S.temp}°C i ca. ${fmtHM(kbEtterhev)} — emnene tempererer og hever i samme fase. Klar når fingertesten fjærer sakte halvveis tilbake.`,`Final proof covered at ${S.temp}°C for about ${fmtHM(kbEtterhev)} — the balls warm up and rise in the same phase. Ready when the finger test springs slowly halfway back.`),
          substeps:[L(`Etterhev tildekket ved ${S.temp}°C i ca. ${fmtHM(kbEtterhev)}`,`Final proof covered at ${S.temp}°C for about ${fmtHM(kbEtterhev)}`),L('Fingertest mot slutten: gropa skal fjære sakte halvveis tilbake','Finger test near the end: the dent should spring slowly halfway back')],
          why:L('Den lange etterhevingen gjør emnene dypt avslappede og strekkbare — og gir et bredt stekevindu: ferdighevde emner med så lite gjær holder seg i timevis.','The long final proof makes the balls deeply relaxed and stretchable — and gives a wide baking window: fully proofed balls with this little yeast keep for hours.'),
          tip:L('Med flere pizzaer: bak det slappeste emnet først, det fasteste sist.','With several pizzas: bake the slackest ball first, the firmest last.')},
        ...preheatSteps(bakeAt, kbEtterhev, tp),
        {title:'Strekk og stek 🔥',loc:'ovn',at:bakeAt,dur:0,desc:oD(tp),substeps:bakeSubsteps(tp),why:WHY.st,tip:bakeTip(tp)}
      ];
    }
    return[...hode,
      {title:'Romtemperaturheving',loc:'rom',at:aM(t0,45),dur:rt,passive:true,
        desc:L(`Løft deigen ut av bollen. Legg i lett oljet bolle, dekk tett med plastfolie. La stå ved ${S.temp}°C i ca. ${rt} min. Deigen skal heve synlig.`,`Lift the dough out of the bowl. Place in a lightly oiled bowl, cover tightly with plastic wrap. Let sit at ${S.temp}°C for about ${rt} min. The dough should rise visibly.`),
        substeps:[
          L(`Løft deigen ut, legg i lett oljet bolle`,`Lift the dough out, place in a lightly oiled bowl`),
          L(`Dekk tett med plastfolie`,`Cover tightly with plastic wrap`),
          L(`La stå ved ${S.temp}°C i ca. ${rt} min — skal heve synlig`,`Let sit at ${S.temp}°C for about ${rt} min — should rise visibly`)
        ],
        why:rtW(rt),
        // v0.742: sto tidligere med et eget windowpane-tips her. Det var galt på
        // to måter: windowpane er sluttpunktet for ELTINGEN (og sier det i tipset
        // på steget over), så å gjøre den her betyr å rive løs deig fra en deig
        // som hever. Og Poolish, Biga og Hurtigdeig bruker alle TIP.roomRise med
        // fingertrykk-testen på nøyaktig samme fase — samme fase ga altså
        // motstridende råd avhengig av hvilken metode du sto i.
        tip:TIP.roomRise},
      ...tailSteps(aM(t0,45+rt))
    ];
  }
  if(S.method==='poolish'){
    const r2=R();
    // Poolish kjøleskapspause: et valgfritt, kaldt hold av den MODNE poolishen,
    // satt inn mellom «poolish er klar» (rdy) og «bland ferdig deig». Forskyver
    // alt nedstrøms med pauseMin, mens middagen holdes fast. Bakover-modus flytter
    // poolish-starten tilsvarende tidligere, slik at forover/bakover matcher.
    const pauseMin=(S.poolishPauseH||0)*60;
    // F19: bakover = trekk totalen (poolish-timer + ev. pause + 20 min miks +
    // romheving + kald hale) fra ankeret; alt regnes deretter fremover fra pa.
    const TOTAL_PL=S.poolishH*60+pauseMin+20+rt+cM2;
    const pa=ie?sM(a,TOTAL_PL):a;
    const rdy=aM(pa,S.poolishH*60);
    const mixAt=aM(rdy,pauseMin);
    // v0.784: kald poolish deles i tre faser slik Mania alt gjorde — romstart,
    // kjøleskap, temperering. Ingen av tidene nedstrøms flytter seg; delingen
    // legger bare stegene der deigen faktisk står, slik at Q10-modellen (som
    // leser `loc`) regner de kalde timene som kalde. Tempereringen ender presis
    // når blandingen begynner, så den tar av poolishens timer og ikke av planen.
    const kald=!!S.poolishCold;
    // v0.785: tempereringen gjelder enhver poolish som kommer RETT UT AV
    // KJØLESKAPET når den skal blandes — ikke bare kjøleskapsvarianten. En
    // romtemperert poolish med kald pause er like kald i det den går i maskinen,
    // og ga nøyaktig samme måling: 12,7°C deig mot oppgitte 22-24.
    const kaldFor=kald||pauseMin>0;
    const temperMin=kaldFor?poolishTemperMin():0;
    const kjolFra=aM(pa,POOLISH_ROMSTART_MIN);
    const temperAt=sM(mixAt,temperMin);
    // En «kald pause» på en poolish som allerede står kaldt er ikke et eget steg —
    // den forlenger bare kjøleskapsfasen. Tidene er de samme; vi viser bare ett
    // kjøleskapssteg i stedet for to som ser ut som ulike ting.
    const visPause=pauseMin>0 && !kald;
    // Tempereringen spiser den siste delen av pausen — den forlenger den ikke.
    // Bruker du 12 timers pause, står poolishen 9 timer kaldt og 3 på benken.
    const pauseKaldMin=Math.max(0,pauseMin-temperMin);
    return[
      {title:S.kjokkenmaskin==='ankarsrum'?'Lag poolish i Ankarsrum-bollen':S.kjokkenmaskin==='manuell'?'Lag poolish i en bolle':'Lag poolish i kjøkkenmaskin-bollen',loc:'benk',at:pa,dur:10,
        desc:(S.kjokkenmaskin==='ankarsrum'
          ?L(`Ta av deigrulle og skraper. Hell ${poolishSplit(r2).pool}g vann${PREF_VANN}i bollen, løs opp ${r2.yDry}g tørrgjær — all gjæren for hele oppskriften skal inn her, ingenting tilsettes senere. Tilsett ${poolishSplit(r2).pool}g mel og rør til glatt med en slikkepott. Dekk bollen med lokk eller plastfolie.`,`Take off the dough roller and scraper. Pour ${poolishSplit(r2).pool}g water${PREF_VANN}into the bowl, dissolve ${r2.yDry}g dry yeast — all the yeast for the whole recipe goes in here, nothing is added later. Add ${poolishSplit(r2).pool}g flour and stir until smooth with a spatula. Cover the bowl with a lid or plastic wrap.`)
          :L(`Hell ${poolishSplit(r2).pool}g vann${PREF_VANN}i en bolle, løs opp ${r2.yDry}g tørrgjær — all gjæren for hele oppskriften skal inn her, ingenting tilsettes senere. Tilsett ${poolishSplit(r2).pool}g mel og rør til glatt med en slikkepott. Dekk bollen med lokk eller plastfolie.`,`Pour ${poolishSplit(r2).pool}g water${PREF_VANN}into a bowl, dissolve ${r2.yDry}g dry yeast — all the yeast for the whole recipe goes in here, nothing is added later. Add ${poolishSplit(r2).pool}g flour and stir until smooth with a spatula. Cover the bowl with a lid or plastic wrap.`))+langpanneHintText(),
        needs:[L(`💧 ${poolishSplit(r2).pool}g vann (18–21°C)`,`💧 ${poolishSplit(r2).pool}g water (18–21°C)`), L(`🫙 ${r2.yDry}g tørrgjær`,`🫙 ${r2.yDry}g dry yeast`), L(`🌾 ${poolishSplit(r2).pool}g mel`,`🌾 ${poolishSplit(r2).pool}g flour`)],
        substeps:[
          L(`Hell ${poolishSplit(r2).pool}g vann${PREF_VANN}i bollen, løs opp ${r2.yDry}g tørrgjær`,`Pour ${poolishSplit(r2).pool}g water${PREF_VANN}into the bowl, dissolve ${r2.yDry}g dry yeast`),
          L(`Tilsett ${poolishSplit(r2).pool}g mel, rør til glatt med en slikkepott`,`Add ${poolishSplit(r2).pool}g flour, stir until smooth with a spatula`),
          L(`Dekk bollen med lokk eller plastfolie`,`Cover the bowl with a lid or plastic wrap`)
        ],
        why:WHY.pl,
        tip:S.kjokkenmaskin==='ankarsrum'
          ?L(`Ingen ekstra bolle å vaske — poolishen fermenterer rett i Ankarsrum-bollen. ${poolishRestText()}`,`No extra bowl to wash — the poolish ferments right in the Ankarsrum bowl. ${poolishRestText()}`)
          :poolishRestText()},
      ...(kald?[
        {title:'❄️ Poolish i kjøleskapet',loc:'kjol',at:kjolFra,dur:0,passive:true,
          desc:L(`Sett poolish-bollen i kjøleskapet. Her modnes den videre helt til du tar den ut igjen. Ikke rør den underveis.`,`Put the poolish bowl in the fridge. Here it keeps maturing right up until you take it out again. Don't disturb it along the way.`),
          substeps:[
            L(`Sett bollen i kjøleskapet`,`Put the bowl in the fridge`),
            L(`La stå urørt`,`Leave it undisturbed`)
          ],
          why:L('Kulda bremser gjæren kraftig, mens enzymene jobber videre nesten uforstyrret. Det er den forskjellen i tempo som gjør en kald poolish tilgivende: modningsvinduet blir timer bredt i stedet for minutter, så det spiller mindre rolle nøyaktig når på dagen du kommer tilbake til den.','The cold slows the yeast down sharply while the enzymes carry on almost undisturbed. That difference in pace is what makes a cold poolish forgiving: the ripeness window becomes hours wide instead of minutes, so it matters much less exactly when in the day you come back to it.'),
          // v0.835: teksten sa bare hva KLAR ser ut som — ikke hva for langt
          // ser ut som, på et steg som varer 10+ timer. Funnet av invarianten
          // «lange hevinger må beskrive overmodning» (118c) i det øyeblikket
          // sveipet faktisk fikk se kald-poolish-varianten; før v0.835 sveipet
          // porten den aldri (se MATRIX_SWEEP-notatet i testfila).
          tip:L('Sjekk gjennom lokket, ikke ved å åpne: den skal ha reist seg, være full av små bobler og lukte lett syrlig. En kald poolish går ikke like tydelig i taket som en romtemperert — det er normalt. Har den sunket i midten og lukter skarpt sur eller alkoholaktig, er den gått for langt — bruk den likevel, men regn med mer syrlig smak.','Check through the lid rather than opening it: it should have risen, be full of small bubbles and smell slightly sour. A cold poolish doesn\'t climb as dramatically as a room-temperature one — that\'s normal. If it has sunken in the middle and smells sharply sour or of alcohol, it has gone too far — use it anyway, but expect a more sour taste.')}
      ]:[]),
      ...(visPause?[{title:'🧊 Kjøleskapspause',loc:'kjol',at:rdy,dur:pauseKaldMin,passive:true,needsPresence:true,
        desc:L(`Sett poolish-bollen i kjøleskapet i ca. ${fmtDur(pauseKaldMin)}. Kulda bremser gjæringen kraftig ned uten å stoppe den — poolishen «venter» på deg til du er klar til å blande ferdig deig. Middagstiden er den samme.`,`Put the poolish bowl in the fridge for about ${durEn(fmtDur(pauseKaldMin))}. The cold slows the fermentation down sharply without stopping it — the poolish "waits" for you until you're ready to mix the final dough. Dinnertime stays the same.`),
        substeps:[
          L(`Sett poolish-bollen i kjøleskapet`,`Put the poolish bowl in the fridge`),
          L(`La stå ca. ${fmtDur(pauseKaldMin)} — gjæringen bremses, ikke stoppes`,`Let sit about ${durEn(fmtDur(pauseKaldMin))} — the fermentation slows, doesn't stop`),
          L(`Ta ut til temperering i neste steg`,`Take out for the warm-up in the next step`)
        ],
        why:L('Pausen skyver resten av planen inn i tiden du faktisk er ledig, uten å endre når du spiser. I kjøleskapet nærmest pauses gjæringen — en moden poolish holder seg godt kaldt en god stund, men ikke i det uendelige, derfor er pausen begrenset til maks 18 timer.',`The pause shifts the rest of the plan into the time you're actually free, without changing when you eat. In the fridge the fermentation is all but paused — a mature poolish keeps well cold for a good while, but not indefinitely, so the pause is limited to a maximum of 18 hours.`),
        tip:L(`At den er litt mer boblete og moden etter pausen er helt greit. Tempereringen etterpå er ikke valgfri — en poolish rett fra kjøleskapet er ${poolishVarmeandelPct()} % av deigens varmekapasitet og trekker ferdig deig ned mot ${Math.round(deigTempUtenTemperering())}°C.`,`It being a bit more bubbly and mature after the pause is perfectly fine. The warm-up afterwards is not optional — a poolish straight from the fridge is ${poolishVarmeandelPct()}% of the dough's heat capacity and pulls the finished dough down towards ${Math.round(deigTempUtenTemperering())}°C.`)}]:[]),
      ...(kaldFor?[
        {title:'🌡 Ta poolish ut — temperer',loc:'benk',at:temperAt,dur:0,passive:true,
          desc:L(`Ta poolish-bollen ut av kjøleskapet ca. ${fmtDur(temperMin)} før du skal blande, og la den stå tildekket på benken. Du gjør ingenting med den — den skal bare miste kulda.`,`Take the poolish bowl out of the fridge about ${durEn(fmtDur(temperMin))} before you mix, and leave it covered on the counter. You do nothing to it — it just needs to lose the chill.`),
          substeps:[
            L(`Ta bollen ut av kjøleskapet`,`Take the bowl out of the fridge`),
            L(`La stå tildekket på benken ca. ${fmtDur(temperMin)}`,`Leave it covered on the counter for about ${durEn(fmtDur(temperMin))}`)
          ],
          why:L(`Poolishen er ${Math.round(poolishAndel()*100)} % av melet og ${poolishVarmeandelPct()} % av deigens varmekapasitet. Går den rett fra kjøleskapet i maskinen, lander ferdig deig rundt ${Math.round(deigTempUtenTemperering())}°C i stedet for 22–24 — og det kan ikke rettes med varmere vann, for det er bare noen få desiliter vann igjen å skru på. Da gjærer den første hevingen i bare halvt til to tredels tempo, og timen på benken leverer ikke det planen lover.`,`The poolish is ${Math.round(poolishAndel()*100)}% of the flour and ${poolishVarmeandelPct()}% of the dough's heat capacity. Straight from the fridge into the mixer, the finished dough lands around ${Math.round(deigTempUtenTemperering())}°C instead of 22–24 — and warmer water cannot fix it, because only a few decilitres of water are left to adjust. The first rise then ferments at only half to two-thirds speed, and the hour on the counter doesn't deliver what the plan promises.`),
          tip:L('Kjenn på bollen framfor å se på klokka: den skal ikke lenger kjennes kald mot håndbaken. Er den fortsatt kjølig, gi den litt lenger — et varmt kjøkken går raskere enn tida her sier, et kaldt går tregere. Har du termometer, sikt på 16–18°C i poolishen.','Feel the bowl rather than watching the clock: it should no longer feel cold against the back of your hand. If it still feels chilly, give it a little longer — a warm kitchen goes faster than the time here says, a cold one slower. With a thermometer, aim for 16–18°C in the poolish.')}
      ]:[]),
      {title:S.kjokkenmaskin==='ankarsrum'?'Ankarsrum — bland ferdig deig':S.kjokkenmaskin==='manuell'?'Bland og elt ferdig deig for hånd':'Kjøkkenmaskin — bland ferdig deig',loc:'benk',at:mixAt,dur:20,
        sessionNote:L(`Sett av ca. ${fmtSessionDur(35+rt)} sammenhengende — de neste tre stegene gjøres i ett strekk.`,`Set aside about ${fmtSessionDur(35+rt)} of uninterrupted time — the next three steps are done in one go.`),
        desc:(S.kjokkenmaskin==='ankarsrum'
          ?L(`Sett deigrulle og skraper tilbake i bollen. Tilsett ${poolishSplit(r2).rest}g ${waterTempPhrase()}. Start trinn 1. Tilsett ${poolishSplit(r2).restMel}g mel gradvis i 3–4 omganger${r2.oil?` og ${r2.oil}g olje`:''}${r2.butter?` + ${r2.butter}g smeltet smør`:''}${r2.sugar?` + ${r2.sugar}g sukker`:''}. Øk til trinn 2–3. Tilsett ${r2.salt}g salt etter 5 min — ingen ekstra gjær trengs, poolishen har alt du trenger. Øk til trinn 3–4. Elt totalt 10–12 min.`,`Put the dough roller and scraper back in the bowl. Add ${poolishSplit(r2).rest}g ${waterTempPhrase()}. Start on speed 1. Add ${poolishSplit(r2).restMel}g flour gradually in 3–4 batches${r2.oil?` and ${r2.oil}g oil`:''}${r2.butter?` + ${r2.butter}g melted butter`:''}${r2.sugar?` + ${r2.sugar}g sugar`:''}. Increase to speed 2–3. Add ${r2.salt}g salt after 5 min — no extra yeast needed, the poolish has everything you need. Increase to speed 3–4. Knead 10–12 min total.`)
          :S.kjokkenmaskin==='manuell'
          ?L(`Tilsett ${poolishSplit(r2).rest}g ${waterTempPhrase()} i bollen med poolishen. Bland inn ${poolishSplit(r2).restMel}g mel gradvis${r2.oil?`, ${r2.oil}g olje`:''}${r2.butter?` + ${r2.butter}g smeltet smør`:''}${r2.sugar?` + ${r2.sugar}g sukker`:''}, ${r2.salt}g salt — ingen ekstra gjær trengs, poolishen har alt du trenger. Vend ut på benk og elt for hånd — ${S.hydro>68?'bruk fransk elting (slap-and-fold) siden deigen er våt: løft, dra ut, slå ned, gjenta i 10–15 min.':'press, brett, drei i 8–12 min til glatt og smidig.'}`,`Add ${poolishSplit(r2).rest}g ${waterTempPhrase()} to the bowl with the poolish. Mix in ${poolishSplit(r2).restMel}g flour gradually${r2.oil?`, ${r2.oil}g oil`:''}${r2.butter?` + ${r2.butter}g melted butter`:''}${r2.sugar?` + ${r2.sugar}g sugar`:''}, ${r2.salt}g salt — no extra yeast needed, the poolish has everything you need. Turn out onto the counter and knead by hand — ${S.hydro>68?'use French kneading (slap-and-fold) since the dough is wet: lift, stretch out, slap down, repeat for 10–15 min.':'press, fold, turn for 8–12 min until smooth and supple.'}`)
          :L(`Tilsett ${poolishSplit(r2).rest}g ${waterTempPhrase()} i bollen med poolishen. Kjør eltekroken på lav hastighet mens du tilsetter ${poolishSplit(r2).restMel}g mel gradvis${r2.oil?`, ${r2.oil}g olje`:''}${r2.butter?` + ${r2.butter}g smeltet smør`:''}${r2.sugar?` + ${r2.sugar}g sukker`:''}. Tilsett ${r2.salt}g salt etter 2–3 min — ingen ekstra gjær trengs, poolishen har alt du trenger. Øk til middels lav hastighet. Elt totalt 6–9 min.`,`Add ${poolishSplit(r2).rest}g ${waterTempPhrase()} to the bowl with the poolish. Run the dough hook on low speed while you add ${poolishSplit(r2).restMel}g flour gradually${r2.oil?`, ${r2.oil}g oil`:''}${r2.butter?` + ${r2.butter}g melted butter`:''}${r2.sugar?` + ${r2.sugar}g sugar`:''}. Add ${r2.salt}g salt after 2–3 min — no extra yeast needed, the poolish has everything you need. Increase to medium-low speed. Knead 6–9 min total.`))+mixWorkNote(),
        needs:[L(`💧 ${poolishSplit(r2).rest}g vann`,`💧 ${poolishSplit(r2).rest}g water`), L(`🌾 ${poolishSplit(r2).restMel}g mel`,`🌾 ${poolishSplit(r2).restMel}g flour`), `🧂 ${r2.salt}g salt`, ...(r2.oil?[L(`🫒 ${r2.oil}g olje`,`🫒 ${r2.oil}g oil`)]:[]), ...(r2.butter?[L(`🧈 ${r2.butter}g smør`,`🧈 ${r2.butter}g butter`)]:[]), ...(r2.sugar?[L(`🍯 ${r2.sugar}g sukker`,`🍯 ${r2.sugar}g sugar`)]:[])],
        substeps:[
          L(`Tilsett ${poolishSplit(r2).rest}g vann i bollen med poolishen`,`Add ${poolishSplit(r2).rest}g water to the bowl with the poolish`),
          L(`Bland inn ${poolishSplit(r2).restMel}g mel gradvis${r2.oil?`, ${r2.oil}g olje`:''}${r2.butter?` + ${r2.butter}g smeltet smør`:''}${r2.sugar?` + ${r2.sugar}g sukker`:''}`,`Mix in ${poolishSplit(r2).restMel}g flour gradually${r2.oil?`, ${r2.oil}g oil`:''}${r2.butter?` + ${r2.butter}g melted butter`:''}${r2.sugar?` + ${r2.sugar}g sugar`:''}`),
          L(`Tilsett ${r2.salt}g salt — ingen ekstra gjær trengs`,`Add ${r2.salt}g salt — no extra yeast needed`),
          L(`Elt til deigen er glatt og smidig`,`Knead until the dough is smooth and supple`)
        ],
        why:L('Poolishen har allerede fermentert halvparten av melet og bidrar med mye av smak- og aromautviklingen — resten inkorporeres effektivt uansett metode.',`The poolish has already fermented half the flour and contributes much of the flavor and aroma development — the rest is incorporated efficiently regardless of method.`),
        tip:L(`Deigen vil kjennes mer aktiv og lett klissete enn standard. Det er normalt — poolish gjør deigen mer ekstensibel (lettere å strekke) samtidig som den utvikler smak. ${deigTempSetning()}`,`The dough will feel more active and lightly sticky than standard. That's normal — poolish makes the dough more extensible (easier to stretch) while it develops flavor. ${deigTempSetning()}`)},
      {title:'Romtemperaturheving',loc:'rom',at:aM(mixAt,20),dur:rt,passive:true,desc:L(`La heve ca. ${rt} min ved ${S.temp}°C, dekket.`,`Let rise about ${rt} min at ${S.temp}°C, covered.`),substeps:[L(`Dekk til`,`Cover`),L(`La heve ca. ${rt} min ved ${S.temp}°C`,`Let rise about ${rt} min at ${S.temp}°C`)],why:rtW(rt),tip:TIP.roomRise},
      ...tailSteps(aM(mixAt,20+rt))
    ];
  }
  if(S.method==='biga'){
    const r3=R(),bm=Math.round(r3.flour*0.6),bv=Math.round(bm*0.44),rtB=Math.round(rt*1.5);
    // F19: samme mønster — bakover = trekk totalen fra ankeret, regn så fremover.
    const TOTAL_BG=S.bigaH*60+20+rtB+cM2;
    const ba2=ie?sM(a,TOTAL_BG):a;
    const rdy=aM(ba2,S.bigaH*60);
    return[
      {title:'Lag biga (for hånd)',loc:'benk',at:ba2,dur:15,
        desc:L(`Biga lages alltid for hånd, uansett kjøkkenmaskin — konsistensen er for tørr og klumpete for maskinelting. Bland ${bm}g mel, ${bv}g vann${PREF_VANN}og ${r3.yDry}g tørrgjær til klumpete, tørr konsistens — all gjæren for hele oppskriften skal inn her, ingenting tilsettes senere. Ikke bland for mye.${langpanneHintText()}`,`Biga is always made by hand, regardless of machine — the consistency is too dry and lumpy for machine kneading. Mix ${bm}g flour, ${bv}g water${PREF_VANN}and ${r3.yDry}g dry yeast to a lumpy, dry consistency — all the yeast for the whole recipe goes in here, nothing is added later. Don't mix too much.${langpanneHintText()}`),
        needs:[L(`🌾 ${bm}g mel`,`🌾 ${bm}g flour`), L(`💧 ${bv}g vann (18–21°C)`,`💧 ${bv}g water (18–21°C)`), L(`🫙 ${r3.yDry}g tørrgjær`,`🫙 ${r3.yDry}g dry yeast`)],
        substeps:[
          L(`Bland ${bm}g mel, ${bv}g vann${PREF_VANN}og ${r3.yDry}g tørrgjær for hånd`,`Mix ${bm}g flour, ${bv}g water${PREF_VANN}and ${r3.yDry}g dry yeast by hand`),
          L(`Bland kun til klumpete, tørr konsistens — ikke bland for mye`,`Mix only to a lumpy, dry consistency — don't mix too much`)
        ],
        why:WHY.bi,
        tip:L(`La stå ca. ${S.bigaH} timer ved romtemperatur. Klar når overflaten har hevet og fått sprekker — hevingen er samtidig kvitteringen på at gjæren lever.`,`Let sit about ${S.bigaH} hours at room temperature. Ready when the surface has risen and developed cracks — the rise doubles as your receipt that the yeast is alive.`)},
      {title:S.kjokkenmaskin==='ankarsrum'?'Ankarsrum — bland ferdig deig':S.kjokkenmaskin==='manuell'?'Bland og elt ferdig deig for hånd':'Kjøkkenmaskin — bland ferdig deig',loc:'benk',at:rdy,dur:20,
        sessionNote:L(`Sett av ca. ${fmtSessionDur(35+rtB)} sammenhengende — de neste tre stegene gjøres i ett strekk.`,`Set aside about ${fmtSessionDur(35+rtB)} of uninterrupted time — the next three steps are done in one go.`),
        desc:S.kjokkenmaskin==='ankarsrum'
          ?L(`Legg bigaen i Ankarsrum-bollen. Tilsett ${Math.round(r3.water-bv)}g ${waterTempPhrase()}. Start trinn 1–2. Tilsett ${Math.round(r3.flour*0.4)}g mel gradvis${r3.oil?` og ${r3.oil}g olje etter halvparten av melet`:''}${r3.butter?` + ${r3.butter}g smeltet smør`:''}${r3.sugar?` + ${r3.sugar}g sukker`:''}. Tilsett ${r3.salt}g salt etter 5 min. Øk til trinn 3–4. Elt totalt 12–15 min til deigen er smidig og slipper bollen.`,`Put the biga in the Ankarsrum bowl. Add ${Math.round(r3.water-bv)}g ${waterTempPhrase()}. Start on speed 1–2. Add ${Math.round(r3.flour*0.4)}g flour gradually${r3.oil?` and ${r3.oil}g oil after half the flour`:''}${r3.butter?` + ${r3.butter}g melted butter`:''}${r3.sugar?` + ${r3.sugar}g sugar`:''}. Add ${r3.salt}g salt after 5 min. Increase to speed 3–4. Knead 12–15 min total until the dough is supple and releases from the bowl.`)
          :S.kjokkenmaskin==='manuell'
          ?L(`Legg bigaen i en bolle. Tilsett ${Math.round(r3.water-bv)}g ${waterTempPhrase()} og bland inn ${Math.round(r3.flour*0.4)}g mel gradvis${r3.oil?`, ${r3.oil}g olje`:''}${r3.butter?` + ${r3.butter}g smeltet smør`:''}${r3.sugar?` + ${r3.sugar}g sukker`:''} og ${r3.salt}g salt. Vend ut på benk. Bigaen er stiv i starten — bruk «press, brett, drei»-teknikk og regn med at det tar litt lengre tid enn vanlig håndelting, 12–15 min, før den løsner og blir smidig.`,`Put the biga in a bowl. Add ${Math.round(r3.water-bv)}g ${waterTempPhrase()} and mix in ${Math.round(r3.flour*0.4)}g flour gradually${r3.oil?`, ${r3.oil}g oil`:''}${r3.butter?` + ${r3.butter}g melted butter`:''}${r3.sugar?` + ${r3.sugar}g sugar`:''} and ${r3.salt}g salt. Turn out onto the counter. The biga is stiff at first — use the "press, fold, turn" technique and expect it to take a little longer than regular hand kneading, 12–15 min, before it loosens and becomes supple.`)
          :L(`Legg bigaen i kjøkkenmaskinens bolle. Tilsett ${Math.round(r3.water-bv)}g ${waterTempPhrase()}. Kjør eltekroken på lav hastighet mens du tilsetter ${Math.round(r3.flour*0.4)}g mel gradvis${r3.oil?`, ${r3.oil}g olje`:''}${r3.butter?` + ${r3.butter}g smeltet smør`:''}${r3.sugar?` + ${r3.sugar}g sukker`:''}. Tilsett ${r3.salt}g salt etter 2–3 min. Øk til middels lav hastighet. Elt 8–10 min — bigaen er stiv og kan belaste maskinen, så gå ned i hastighet om den strever.`,`Put the biga in the stand mixer bowl. Add ${Math.round(r3.water-bv)}g ${waterTempPhrase()}. Run the dough hook on low speed while you add ${Math.round(r3.flour*0.4)}g flour gradually${r3.oil?`, ${r3.oil}g oil`:''}${r3.butter?` + ${r3.butter}g melted butter`:''}${r3.sugar?` + ${r3.sugar}g sugar`:''}. Add ${r3.salt}g salt after 2–3 min. Increase to medium-low speed. Knead 8–10 min — the biga is stiff and can strain the machine, so lower the speed if it struggles.`),
        needs:[L(`💧 ${Math.round(r3.water-bv)}g vann`,`💧 ${Math.round(r3.water-bv)}g water`), L(`🌾 ${Math.round(r3.flour*0.4)}g mel`,`🌾 ${Math.round(r3.flour*0.4)}g flour`), `🧂 ${r3.salt}g salt`, ...(r3.oil?[L(`🫒 ${r3.oil}g olje`,`🫒 ${r3.oil}g oil`)]:[]), ...(r3.butter?[L(`🧈 ${r3.butter}g smør`,`🧈 ${r3.butter}g butter`)]:[]), ...(r3.sugar?[L(`🍯 ${r3.sugar}g sukker`,`🍯 ${r3.sugar}g sugar`)]:[])],
        substeps:[
          L(`Legg bigaen i bollen, tilsett ${Math.round(r3.water-bv)}g vann`,`Put the biga in the bowl, add ${Math.round(r3.water-bv)}g water`),
          L(`Bland inn ${Math.round(r3.flour*0.4)}g mel gradvis${r3.oil?`, ${r3.oil}g olje`:''}${r3.butter?` + ${r3.butter}g smeltet smør`:''}${r3.sugar?` + ${r3.sugar}g sukker`:''}`,`Mix in ${Math.round(r3.flour*0.4)}g flour gradually${r3.oil?`, ${r3.oil}g oil`:''}${r3.butter?` + ${r3.butter}g melted butter`:''}${r3.sugar?` + ${r3.sugar}g sugar`:''}`),
          L(`Tilsett ${r3.salt}g salt`,`Add ${r3.salt}g salt`),
          L(`Elt til bigaen løsner og blir smidig`,`Knead until the biga loosens and becomes supple`)
        ],
        why:L('Bigaen er stiv — den løses opp gradvis uansett metode. Deigen kan virke tung i starten, det er normalt.',`The biga is stiff — it dissolves gradually regardless of method. The dough may seem heavy at first, that's normal.`),
        tip:L('Deigtemperatur etter elting: 22–24°C. Bruk termometer.',`Dough temperature after kneading: 22–24°C. Use a thermometer.`)},
      {title:'Romtemperaturheving',loc:'rom',at:aM(rdy,20),dur:rtB,passive:true,desc:L(`La heve ca. ${rtB} min ved ${S.temp}°C, dekket.`,`Let rise about ${rtB} min at ${S.temp}°C, covered.`),substeps:[L(`Dekk til`,`Cover`),L(`La heve ca. ${rtB} min ved ${S.temp}°C`,`Let rise about ${rtB} min at ${S.temp}°C`)],why:rtW(rtB),tip:TIP.roomRise},
      ...tailSteps(aM(rdy,20+rtB))
    ];
  }
  if(S.method==='mania'){
    const rm=maniaRecipe();
    const {POOLISH,CHILL,MIX:MIX_DUR,RISE1,ROOM1:ROOMTEMP1,COLDBULK,FINAL:FINAL_PROOF}=MANIA_T;
    // F19: ÉN retning. Bakover-modus trekker bare totalen fra ankeret; alle
    // veipunkter regnes deretter alltid FREMOVER fra poolishAt. Tidligere fantes
    // to håndskrevne speilkjeder (aM-kjede og sM-kjede) som måtte holdes i takt
    // manuelt — invariant-testen (v0.714) vokter at totalen matcher kjeden.
    const TOTAL=POOLISH+CHILL+MIX_DUR+RISE1+ROOMTEMP1+COLDBULK+FINAL_PROOF;
    const poolishAt=ie?sM(a,TOTAL):a;
    const chillAt=aM(poolishAt,POOLISH);
    const mixAt=aM(chillAt,CHILL);
    const shapeAt=aM(aM(mixAt,MIX_DUR),RISE1);
    const coldBulkStart=aM(shapeAt,ROOMTEMP1);
    const divideAt=aM(coldBulkStart,COLDBULK);
    const bakeAt=aM(divideAt,FINAL_PROOF);
    return[
      {title:'Bland poolish',loc:'benk',at:poolishAt,dur:MANIA_T.POOLISH_MIX,
        desc:L(`Rør ut ${rm.poolishYd}g tørrgjær i ${rm.poolishVann}g vann (18–21°C). Tilsett ${rm.poolishMel}g mel, rør til en tykk grøt. Dekk til med lokk eller plastfolie.`,`Stir ${rm.poolishYd}g dry yeast into ${rm.poolishVann}g water (18–21°C). Add ${rm.poolishMel}g flour, stir to a thick batter. Cover with a lid or plastic wrap.`),
        needs:[L(`🫙 ${rm.poolishYd}g tørrgjær`,`🫙 ${rm.poolishYd}g dry yeast`), L(`💧 ${rm.poolishVann}g vann`,`💧 ${rm.poolishVann}g water`), L(`🌾 ${rm.poolishMel}g mel`,`🌾 ${rm.poolishMel}g flour`)],
        substeps:[
          L(`Rør ut ${rm.poolishYd}g tørrgjær i ${rm.poolishVann}g vann (18–21°C)`,`Stir ${rm.poolishYd}g dry yeast into ${rm.poolishVann}g water (18–21°C)`),
          L(`Tilsett ${rm.poolishMel}g mel, rør til en tykk grøt`,`Add ${rm.poolishMel}g flour, stir to a thick batter`),
          L(`Dekk til med lokk eller plastfolie`,`Cover with a lid or plastic wrap`)
        ],
        why:L('Halvparten av oppskriftens mel og vann fermenterer for seg selv i mange timer før resten av deigen i det hele tatt blandes — poolishen bygger opp mesteparten av smaken.',`Half the recipe's flour and water ferment on their own for many hours before the rest of the dough is even mixed — the poolish builds up most of the flavor.`),
        tip:L('La stå ved 18–21°C.',`Let sit at 18–21°C.`)},
      {title:'Poolish gjærer',loc:'rom',at:aM(poolishAt,MANIA_T.POOLISH_MIX),dur:MANIA_T.POOLISH-MANIA_T.POOLISH_MIX,passive:true,desc:L('La stå urørt ved 18–21°C i ca. 12 timer.',`Let sit undisturbed at 18–21°C for about 12 hours.`),substeps:[L('La stå urørt ved 18–21°C i ca. 12 timer',`Let sit undisturbed at 18–21°C for about 12 hours`)],why:WHY.pl,tip:TIP.poolishFerment},
      {title:'Poolish kjøles ned',loc:'kjol',at:chillAt,dur:CHILL,passive:true,
        desc:L('Sett poolishen i kjøleskapet og la den stå kaldt i minst 2 timer.',`Put the poolish in the fridge and let it sit cold for at least 2 hours.`),
        substeps:[L('Sett poolishen i kjøleskapet, la stå kaldt i minst 2 timer',`Put the poolish in the fridge, let it sit cold for at least 2 hours`)],
        why:L('Nedkjølingen bremser poolishen så den ikke overmodner, og en kald poolish holder deigtemperaturen nede når den blandes inn i hoveddeigen med kaldt vann.','Cooling slows the poolish so it does not over-mature, and a cold poolish keeps the dough temperature down when it is mixed into the main dough with cold water.'),
        tip:L('Minst 2 timer er nok, men det gjør ikke noe om den står 3–4 timer om du ikke rekker neste steg med det samme — dette steget er fleksibelt.',`At least 2 hours is enough, but it doesn't matter if it stands 3–4 hours if you don't get to the next step right away — this step is flexible.`)},
      {title:'Bland hoveddeig',loc:'benk',at:mixAt,dur:MIX_DUR,
        sessionNote:L(`Sett av ca. ${fmtSessionDur(MIX_DUR+RISE1+15)} sammenhengende — de neste tre stegene gjøres i ett strekk.`,`Set aside about ${fmtSessionDur(MIX_DUR+RISE1+15)} of uninterrupted time — the next three steps are done in one go.`),
        desc:L(`Hell avkjølt poolish i bollen. Ha i ${rm.hovedMel}g mel, ${rm.hovedYd}g tørrgjær og ${rm.vann1}g kaldt vann (4–6°C) direkte i bollen — ingen forblanding av gjæren nødvendig. Kjør på lav hastighet til blandet. Tilsett så ${rm.vann2}g kaldt vann litt etter litt i dråper, og vent til hver skvett er absorbert før neste — men hold igjen den siste skvetten til saltet. Etter ca. 15 min: tilsett ${rm.salt}g salt sammen med den siste vannskvetten. Kjør videre 5 min til smidig deig.`,`Pour the cooled poolish into the bowl. Add ${rm.hovedMel}g flour, ${rm.hovedYd}g dry yeast and ${rm.vann1}g cold water (4–6°C) directly into the bowl — no pre-mixing of the yeast needed. Run on low speed until combined. Then add ${rm.vann2}g cold water bit by bit in drops, waiting until each splash is absorbed before the next — but hold back the last splash for the salt. After about 15 min: add ${rm.salt}g salt together with the last splash of water. Keep running 5 min until a supple dough.`),
        needs:[L(`🌾 ${rm.hovedMel}g mel`,`🌾 ${rm.hovedMel}g flour`), L(`🫙 ${rm.hovedYd}g tørrgjær`,`🫙 ${rm.hovedYd}g dry yeast`), L(`💧 ${rm.vann1+rm.vann2}g vann totalt`,`💧 ${rm.vann1+rm.vann2}g water total`), `🧂 ${rm.salt}g salt`],
        substeps:[
          L(`Hell avkjølt poolish i bollen`,`Pour the cooled poolish into the bowl`),
          L(`Ha i ${rm.hovedMel}g mel, ${rm.hovedYd}g tørrgjær og ${rm.vann1}g kaldt vann — kjør på lav hastighet til blandet`,`Add ${rm.hovedMel}g flour, ${rm.hovedYd}g dry yeast and ${rm.vann1}g cold water — run on low speed until combined`),
          L(`Tilsett ${rm.vann2}g kaldt vann i dråper, hold igjen siste skvett til saltet`,`Add ${rm.vann2}g cold water in drops, hold back the last splash for the salt`),
          L(`Etter ca. 15 min: tilsett ${rm.salt}g salt + siste vannskvett, elt videre 5 min til smidig`,`After about 15 min: add ${rm.salt}g salt + the last splash of water, keep kneading 5 min until supple`)
        ],
        why:L('To-trinns vanntilsetning gir kontroll over glutenutviklingen mens deigen absorberer alt vannet, uten å bli overarbeidet.',`Two-stage water addition gives control over the gluten development while the dough absorbs all the water, without being overworked.`),
        tip:L('Deigtemp bør ligge 20–24°C — gå ikke over 26°C, aldri over 28°C. Da blir gjæringen ukontrollert og deigen kan bli ødelagt.',`Dough temp should be 20–24°C — don't go above 26°C, never above 28°C. Then the fermentation becomes uncontrolled and the dough can be ruined.`)},
      {title:'Hvile i ro',loc:'benk',at:aM(mixAt,MIX_DUR),dur:RISE1,passive:true,
        desc:L('Smør et tynt lag olivenolje på kjøkkenbenken og over deigen. Dekk til (brødpose eller plastfolie) og la ligge urørt.',`Spread a thin layer of olive oil on the counter and over the dough. Cover (bread bag or plastic wrap) and let it lie undisturbed.`),
        substeps:[L('Smør et tynt lag olivenolje på benken og over deigen',`Spread a thin layer of olive oil on the counter and over the dough`),L('Dekk til og la ligge urørt',`Cover and let it lie undisturbed`)],
        why:L('En rolig benkhvile lar gluten slappe av etter eltingen og gir deigen en første, jevn heving før forming.','A calm rest on the counter lets the gluten relax after kneading and gives the dough a first, even rise before shaping.')},
      // v0.775: het «Form til bolle». «bolle» betyr blandebollen 30 andre steder
      // i appen — og i SAMME setning sto «lag en stram, rund bolle. Legg i
      // bakebolle». Samme ord om deigen og om kara den legges i, fire ord fra
      // hverandre. Deigen heter «emne» 75 steder; nå også her.
      {title:'Form til emne → romtemperatur',loc:'rom',at:shapeAt,dur:ROOMTEMP1,passive:false,
        desc:L('Brett deigen noen ganger og lag et stramt, rundt emne. Legg i bakebolle eller lignende, dekk med lokk eller plastfolie.',`Fold the dough a few times and make a tight, round ball. Place in a baking bowl or similar, cover with a lid or plastic wrap.`),
        substeps:[
          L('Brett deigen noen ganger, lag et stramt, rundt emne',`Fold the dough a few times, make a tight, round ball`),
          L('Legg i bakebolle eller lignende',`Place in a baking bowl or similar`),
          L('Dekk med lokk eller plastfolie',`Cover with a lid or plastic wrap`)
        ],
        why:L('Formingen bygger opp spenning i deigoverflaten, som gir bedre holdbarhet og struktur gjennom den lange kalde hevingen som følger.',`Shaping builds up tension in the dough surface, which gives better hold and structure through the long cold proof that follows.`),
        tip:L(`La stå i romtemperatur i ca. ${fmtHM(ROOMTEMP1)} før kjøleskapet.`,`Let sit at room temperature for about ${fmtHM(ROOMTEMP1)} before the fridge.`)},
      {title:'Kjøleskapsheving (udelt)',loc:'kjol',at:coldBulkStart,dur:COLDBULK,passive:true,
        desc:L('Hele deigen kjøleskapheves samlet, udelt — deles i emner først etterpå.',`The whole dough is cold-proofed together, undivided — divided into balls only afterward.`),
        substeps:[L('La hele deigen stå samlet, udelt, i kjøleskapet',`Let the whole dough sit together, undivided, in the fridge`)],
        why:L('Kald fermentering av hele deigen samlet (i stedet for delt i emner) er den strukturelle kjernen i denne metoden — gir jevn, kontrollert modning.',`Cold fermentation of the whole dough together (instead of divided into balls) is the structural core of this method — gives even, controlled maturation.`),
        tip:L('Sjekk gjennom lokket uten å åpne: deigen skal vokse til ca. 1,5–2× og få små bobler under overflaten. Henger den etter (nesten uendret, stiv) er kjøleskapet kaldere enn antatt — gi den lengre tid enn planen sier. For langt fram (stor og blank, med bobler som kollapser lett) — ta den ut litt tidligere. Ikke bruk fingertrykk-testen på kald deig; den er upålitelig når deigen er stiv av kulde.','Check through the lid without opening: the dough should grow to about 1.5–2× and get small bubbles under the surface. If it lags (almost unchanged, stiff), the fridge is colder than assumed — give it more time than the plan says. Too far along (large and shiny, with bubbles that collapse easily) — take it out a little earlier. Don\'t use the finger-poke test on cold dough; it is unreliable when the dough is stiff from the cold.')},
      {title:'Del i emner',loc:'benk',at:divideAt,dur:MANIA_T.DIVIDE,
        desc:L(N('Del i ett emne à ønsket vekt. Form det stramt og legg i oljet boks eller dyp skål, dekk med lokk eller plastfolie.','Del i emner à ønsket vekt (vei dem for lik størrelse). Form dem stramt og legg i hver sin oljede boks eller dype skål, dekk med lokk eller plastfolie.'),N('Divide into one ball of the desired weight. Shape it and place in an oiled container or deep bowl, cover with a lid or plastic wrap.',`Divide into balls of the desired weight (weigh them for equal size). Shape balls and place each in its own oiled container or deep bowl, cover with a lid or plastic wrap.`)),
        needs:[L(N('📦 boks/skål','📦 boks/skål per emne'),N(`📦 container/bowl`,`📦 container/bowl per ball`)), L('🫒 litt olje',`🫒 a little oil`)],
        substeps:[
          L(N('Del i ett emne à ønsket vekt','Del i emner à ønsket vekt (vei dem for lik størrelse)'),N('Divide into one ball of the desired weight','Divide into balls of the desired weight (weigh them for equal size)')),
          L('Form stramme emner',`Shape tight balls`),
          L('Legg i hver sin oljede boks eller dype skål, dekk til',`Place each in its own oiled container or deep bowl, cover`)
        ],
        why:L('Deigen deles først etter den lange, samlede kjølehevingen — da bærer hvert emne med seg modningen hele deigen har bygget opp.','The dough is divided only after the long, undivided cold proof — so each ball carries the maturation the whole dough has built up.'),
        tip:L('Emner som er formet stramt holder seg bedre gjennom neste, lange romtemperaturheving.',`Balls shaped tightly hold up better through the next, long room-temperature rise.`)},
      {title:'Romtemperaturheving (delt)',loc:'rom',at:aM(divideAt,15),dur:FINAL_PROOF-15,passive:true,
        desc:L(`${N('La emnet heve','La emnene heve')} i romtemperatur ved ${S.temp}°C.`,`${N('Let the ball rise','Let the balls rise')} at room temperature at ${S.temp}°C.`),
        substeps:[L(`${N('La emnet heve','La emnene heve')} i romtemperatur ved ${S.temp}°C`,`${N('Let the ball rise','Let the balls rise')} at room temperature at ${S.temp}°C`)],
        why:L(N('Emnet tar til seg romvarme og hever ferdig, så det blir luftig og strekkbart når du skal steke.','Emnene tar til seg romvarme og hever ferdig, så de blir luftige og strekkbare når du skal steke.'),N('The ball takes on room warmth and finishes rising, so it becomes airy and stretchable by the time you bake.',`The balls take on room warmth and finish rising, so they become airy and stretchable by the time you bake.`)),
        // v0.758: dette er det lengste romtemperatur-steget i hele appen — ti
        // timer ved 22°C på FERDIG FORMEDE emner, etter at deigen alt har stått
        // ti timer kaldt. Likevel sto det ingen modenhetstegn her, bare et
        // tilbud om fire timer ekstra som buffer. Alle andre hevesteg gir tre
        // tegn med hver sin handling — klar / henger etter / for langt fram — og
        // det er nettopp her de trengs mest: et emne som flyter ut, kommer ikke
        // tilbake, og bufferen var et tilbud uten et eneste forbehold.
        // Tallene i MANIA_T er urørt. Dette er hva planen tør si, ikke hva den
        // regner ut.
        tip:L(N('Klar når emnet har vokst tydelig, kjennes luftig og fortsatt holder kuppelformen. Er det lite endret og fast, gi det mer tid. Har det flytt utover og blitt flatt, med en kant som går i ett med bunnen, er det for langt fram — strekk og stek med en gang, det kommer ikke tilbake. Varmt kjøkken går fortere enn klokka antyder. Holder emnet fortsatt formen, tåler det opptil 4 timer ekstra som buffer hvis du ikke er klar.',
                'Klare når emnene har vokst tydelig, kjennes luftige og fortsatt holder kuppelformen. Er de lite endret og faste, gi dem mer tid. Har de flytt utover og blitt flate, med en kant som går i ett med bunnen, er de for langt fram — strekk og stek med en gang, de kommer ikke tilbake. Varmt kjøkken går fortere enn klokka antyder. Holder emnene fortsatt formen, tåler de opptil 4 timer ekstra som buffer hvis du ikke er klar.'),
              N('Ready when the ball has grown clearly, feels airy and still holds its domed shape. If it is barely changed and firm, give it more time. If it has spread out and gone flat, with an edge that merges into the base, it is too far gone — stretch and bake right away, it will not come back. A warm kitchen goes faster than the clock suggests. If the ball still holds its shape, it can take up to 4 hours extra as a buffer if you are not ready.',
                'Ready when the balls have grown clearly, feel airy and still hold their domed shape. If they are barely changed and firm, give them more time. If they have spread out and gone flat, with an edge that merges into the base, they are too far gone — stretch and bake right away, they will not come back. A warm kitchen goes faster than the clock suggests. If the balls still hold their shape, they can take up to 4 hours extra as a buffer if you are not ready.'))},
      // v0.739: Mania manglet forvarmingssteget helt — stekesteget krevde 45 min
      // (vanlig ovn med stein) mens tidsplanen gikk rett fra romhevingen til steking.
      ...preheatSteps(bakeAt, FINAL_PROOF-15, S.type),
      // v0.755: sto `desc:oN()+'.'` her — altså bare «Pizzaovn.». Mania var den
      // ENESTE metoden som ikke brukte oD(), og steketemperatur og steketid lå
      // derfor bare i understegene. De blir ikke med i «Kopier tidsplan», som
      // tar tittel, desc, why og tip — så en kopiert Mania-plan manglet
      // steketemperaturen helt, i alle fire typene og begge ovnstypene.
      // Understegene henter allerede fra bakeSubsteps(S.type); da skal
      // beskrivelsen hente fra oD(S.type), samme kilde som resten.
      {title:'Strekk og stek 🔥',loc:'ovn',at:bakeAt,dur:0,
        desc:oD(S.type),
        substeps:bakeSubsteps(S.type),
        why:WHY.st,tip:bakeTip(S.type)}
    ];
  }
  return[];
}

// Hurtigdeig-steg — delt mellom desktop (hurtigRes) og mobil (mobGen) slik at de aldri divergerer.
// Fremover og bakover bruker samme tf()-justerte varigheter.
function hurtigSteps(anchor){
  const o=HOPTS.find(x=>x.h===S.hurtigH)||HOPTS[3],r=R(),ie=S.mode==='end';
  const w=Math.round(S.mel*S.hydro/100),f=S.mel/500;
  // Kickstarten vekker gjæren i en LITEN, varm porsjon av vannet (wk); resten
  // (wr) tilsettes i eltesteget. wk+wr=w, så hydreringen er uendret, og vann
  // og gjær telles kun ÉN gang. v0.812: kommentaren her påsto tidligere at
  // 24°C-målet holdt «fordi bulken av vannet er DDT-temperert» — det stemte
  // ikke: kickstartens 60g på ~41°C løftet deigen ~2,5°C over målet. Nå står
  // kickstartvannet som eget ledd i deigKomponenter, og calcWaterTempC()
  // kompenserer med kaldere restvann. wk og temperatur leses fra samme kilde
  // som modellen (kickVannG/KICK_TEMP).
  const wk=kickVannG(),wr=w-wk;
  const ktxt=`${KICK_TEMP.mn}–${KICK_TEMP.mx}`;
  // v0.817 (F17-grepet): gjæren leses fra recipeFor() — samme kilde som
  // oppskriftsfanen. Var en lokal duplikat av HOPTS-utregningen; med gjærens
  // tilstand i bildet ville to utregninger vært to dommere som kunne sprike.
  const _r4y=recipeFor(),yd=_r4y.yDry,yf=_r4y.yFresh;
  const ya=S.gjaer==='torr'?L(`${yd}g tørrgjær`,`${yd}g dry yeast`):L(`${yf}g fersk gjær`,`${yf}g fresh yeast`);
  const tmp=S.oven==='pizza'?o.tp:o.tv;
  // v6.12 (BACKLOG #6): begge gjæringsfasene skaleres med tf(). Bulk (ba) var
  // temp-justert, men etterhevingen (afm) var det ikke — samme deigs to
  // gjæringsfaser reagerte da ulikt på temperatur (fysisk feil), og ved ≠22°C
  // summerte ikke bulk+etterheving lenger konsistent. Forming (0,25t) er et fast
  // manuelt steg og skal IKKE skaleres — derfor ligger den utenfor tf()-faktoren.
  const ba=Math.round(o.h*0.6*60*tf()),afm=Math.round((o.h-o.h*0.6-0.25)*60*tf()),p=pc();
  // v6.01: gjær-kickstart lagt til fra backloggen — rør gjæren i lunkent vann
  // med litt honning og la den boble noen minutter FØR mel tilsettes, i
  // stedet for at alt blandes i ett steg uten venting. Egen KICK_DUR lagt
  // til foran alle eksisterende offset-tall, resten av kjeden uendret bortsett
  // fra det.
  const t0=ie?sM(anchor,KICK_DUR+30+ba+afm):anchor;
  const mixAt=aM(t0,KICK_DUR);
  return{o,w,ya,tmp,ba,afm,p,steps:[
    kickstartStep(t0, wk, wr, ya),
    {title:S.kjokkenmaskin==='ankarsrum'?'Ankarsrum — bland deig raskt':S.kjokkenmaskin==='manuell'?'Bland og elt for hånd — raskt':'Kjøkkenmaskin — bland deig raskt',loc:'benk',at:mixAt,dur:15,
      desc:(()=>{const wt=calcWaterTempC();return S.kjokkenmaskin==='ankarsrum'
        ?L(`Hell gjærblandingen fra kickstarten + resten av vannet (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sukker`:''} i bollen. Start trinn 1. Tilsett ${S.mel}g mel gradvis${r.oil?` + ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Tilsett ${r.salt}g salt etter 3 min. Øk til trinn 3–4. Elt 10–12 min — mål gjerne sluttdeigtemperaturen, ca. 24°C er et godt mål uansett hvor lang tid det tar akkurat i din maskin.`,`Pour the yeast mixture from the kickstart + the rest of the water (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sugar`:''} into the bowl. Start on speed 1. Add ${S.mel}g flour gradually${r.oil?` + ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Add ${r.salt}g salt after 3 min. Increase to speed 3–4. Knead 10–12 min — measure the final dough temperature if you can, about 24°C is a good target no matter how long it takes in your particular machine.`)
        :S.kjokkenmaskin==='manuell'
        ?L(`Hell gjærblandingen fra kickstarten + resten av vannet (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sukker`:''} i en bolle. Bland inn ${S.mel}g mel gradvis${r.oil?`, ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''} og ${r.salt}g salt. Vend ut på benk og elt for hånd — ${S.hydro>68?'bruk fransk elting (slap-and-fold) i 10–12 min siden deigen er våt.':'press, brett, drei i 8–10 min til glatt.'} Mål gjerne sluttdeigtemperaturen om du har termometer — ca. 24°C er et godt mål. Hurtigdeig krever litt mer futt i eltingen siden du ikke har lang hevetid til å bygge gluten.`,`Pour the yeast mixture from the kickstart + the rest of the water (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sugar`:''} into a bowl. Mix in ${S.mel}g flour gradually${r.oil?`, ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''} and ${r.salt}g salt. Turn out onto the counter and knead by hand — ${S.hydro>68?'use French kneading (slap-and-fold) for 10–12 min since the dough is wet.':'press, fold, turn for 8–10 min until smooth.'} Measure the final dough temperature if you have a thermometer — about 24°C is a good target. Quick dough needs a bit more effort in the kneading since you don't have a long rise to build gluten.`)
        :L(`Hell gjærblandingen fra kickstarten + resten av vannet (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sukker`:''} i bollen. Kjør eltekroken på lav hastighet mens du tilsetter ${S.mel}g mel gradvis${r.oil?`, ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Tilsett ${r.salt}g salt etter 2 min. Øk til middels hastighet. Elt 6–8 min — mål gjerne sluttdeigtemperaturen, ca. 24°C er et godt mål.`,`Pour the yeast mixture from the kickstart + the rest of the water (${wr}g, ${wt}°C)${r.sugar?` + ${r.sugar}g sugar`:''} into the bowl. Run the dough hook on low speed while you add ${S.mel}g flour gradually${r.oil?`, ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Add ${r.salt}g salt after 2 min. Increase to medium speed. Knead 6–8 min — measure the final dough temperature if you can, about 24°C is a good target.`);})()+langpanneHintText(),
      needs:[L(`💧 ${wr}g vann (resten)`,`💧 ${wr}g water (the rest)`), L(`🌾 ${S.mel}g mel`,`🌾 ${S.mel}g flour`), L(`🧂 ${r.salt}g salt`,`🧂 ${r.salt}g salt`), ...(r.oil?[L(`🫒 ${r.oil}g olje`,`🫒 ${r.oil}g oil`)]:[]), ...(r.butter?[L(`🧈 ${r.butter}g smør`,`🧈 ${r.butter}g butter`)]:[]), ...(r.sugar?[L(`🍯 ${r.sugar}g sukker`,`🍯 ${r.sugar}g sugar`)]:[])],
      substeps:(()=>{const wt=calcWaterTempC();return[
        L(`Hell gjærblandingen fra kickstarten + ${wr}g vann (${wt}°C) i bollen`,`Pour the yeast mixture from the kickstart + ${wr}g water (${wt}°C) into the bowl`),
        L(`Start på laveste hastighet/trinn, tilsett ${S.mel}g mel gradvis`,`Start on the lowest speed/setting, add ${S.mel}g flour gradually`),
        L(`Tilsett ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}`,`Add ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}`),
        L(`Øk hastigheten, elt godt til deigen er glatt — sikt mot 24°C`,`Increase the speed, knead well until the dough is smooth — aim for 24°C`)
      ];})(),
      why:L('Vanntemperaturen er beregnet for å treffe ca. 24°C ferdig deig uansett hvor lenge den skal gjære — det er gjærmengden over, ikke vanntemperaturen, som gjør denne varianten rask.','The water temperature is calculated to land the finished dough at about 24°C no matter how long it will ferment — it\'s the amount of yeast above, not the water temperature, that makes this variant fast.'),
      tip:S.kjokkenmaskin==='ankarsrum'
        ?L('Hurtigdeig: gå opp til trinn 3–4 litt tidligere enn vanlig siden du ikke har tid til lang heving.','Quick dough: move up to speed 3–4 a bit sooner than usual, since you don\'t have time for a long rise.')
        :S.kjokkenmaskin==='manuell'
        ?L('Windowpane-testen er ekstra viktig her siden du ikke har lang hevetid til å kompensere for underelting.','The windowpane test is extra important here since you don\'t have a long rise to compensate for under-kneading.')
        :L('Elt litt lenger enn du ville gjort med lengre hevetid — hurtigdeig har mindre tid til at gluten utvikler seg av seg selv.','Knead a bit longer than you would with a longer rise — quick dough has less time for gluten to develop on its own.')},
    {title:`Bulk-heving (ca. ${Math.round(ba/60*10)/10}t)`,loc:'rom',at:aM(mixAt,15),dur:ba,passive:true,desc:L(`Dekk tett. Hev ved ${S.temp}°C i ca. ${fmtHM(ba)}.`,`Cover tightly. Rise at ${S.temp}°C for about ${fmtHM(ba)}.`),substeps:[L(`Dekk tett`,`Cover tightly`),L(`Hev ved ${S.temp}°C i ca. ${fmtHM(ba)}`,`Rise at ${S.temp}°C for about ${fmtHM(ba)}`)],why:rtW(ba),tip:TIP.roomRise},
    {title:'Form emner',loc:'benk',at:aM(mixAt,15+ba),dur:15,desc:L(`Del i ${p.count} emne${p.count>1?'r':''} à ${p.perPizza}g. Rund godt.`,`Divide into ${p.count} ball${p.count>1?'s':''} of ${p.perPizza}g${p.count>1?' each':''}. Round well.`),needs:[L(`📦 ${p.count} emne${p.count>1?'r':''}`,`📦 ${p.count} ball${p.count>1?'s':''}`)],substeps:[L(`Del i ${p.count} emne${p.count>1?'r':''} à ${p.perPizza}g`,`Divide into ${p.count} ball${p.count>1?'s':''} of ${p.perPizza}g${p.count>1?' each':''}`),L('Rund godt — ikke kjevle, strekk for hånd senere','Round well — don\'t roll out, stretch by hand later')],why:L('Runde, stramme emner holder formen gjennom den korte etterhevingen som følger, og gir jevn heving.','Round, tight balls hold their shape through the short final proof that follows, and rise evenly.'),tip:L('Ikke kjevle — strekk for hånd.','Don\'t roll out — stretch by hand.')},
    // v0.810: «Etterheving + forvarme» var ETT steg, og instruksen «varm ovnen»
    // sto ved stegstart. Ved 2t deig er etterhevingen 33 min og buntingen nesten
    // gratis — men den skalerer: ved 8t er den 2t 57min, ved 16t over 6 timer,
    // og å følge steget bokstavelig fyrte en 450-graders pizzaovn hele tiden.
    // Meldt inn fra en ekte plan. Alle andre metoder fikk eget forvarmingssteg i
    // v0.739 («det stemte kun for Hurtigdeig» — derfor ble den stående); nå
    // bygger også Hurtigdeig det fra preheatSteps, samme kilde som alle andre.
    // Rekkefølgen avgjøres av tidene: trenger ovnen lenger enn etterhevingen
    // (2t deig + vanlig ovn: 45 min ovn mot 33 min heving), skal den på FØR.
    ...(function(){
      const bakeAtH=aM(mixAt,30+ba+afm);
      const etterhev={title:`Etterheving (${afm} min)`,loc:'rom',at:aM(mixAt,30+ba),dur:afm,passive:true,
        desc:L(`Etterhev ${fmtHM(afm)}, tildekket.`,`Final proof ${fmtHM(afm)}, covered.`),
        substeps:[L(`Etterhev ${fmtHM(afm)}, tildekket`,`Final proof ${fmtHM(afm)}, covered`)],
        why:L('Gluten slapper av etter forming.','The gluten relaxes after shaping.')};
      const ovn=preheatSteps(bakeAtH, 30+ba+afm, S.type, tmp);
      return (ovn.length && new Date(ovn[0].at)<new Date(etterhev.at))
        ? [...ovn, etterhev] : [etterhev, ...ovn];
    })(),
    {title:'Strekk og stek 🔥',loc:'ovn',at:aM(mixAt,30+ba+afm),dur:0,desc:L(`${tmp} — ${S.type==='napoletana'?(S.oven==='pizza'?'90–120 sek':'6–9 min'):S.type==='langpanne'?(S.oven==='pizza'?'8–12 min':'12–16 min'):(S.oven==='pizza'?'20–25 min':'28–35 min')}.`,`${tmp} — ${S.type==='napoletana'?(S.oven==='pizza'?'90–120 sec':'6–9 min'):S.type==='langpanne'?(S.oven==='pizza'?'8–12 min':'12–16 min'):(S.oven==='pizza'?'20–25 min':'28–35 min')}.`),substeps:[L(`Strekk/press emnet ut etter pizzatypens teknikk`,`Stretch/press the ball out using the technique for your pizza type`),L(`Ha på saus, ost og topping`,`Add sauce, cheese and toppings`),L(`Stek på ${tmp} — ${S.type==='napoletana'?(S.oven==='pizza'?'90–120 sek':'6–9 min'):S.type==='langpanne'?(S.oven==='pizza'?'8–12 min':'12–16 min'):(S.oven==='pizza'?'20–25 min':'28–35 min')}`,`Bake at ${tmp} — ${S.type==='napoletana'?(S.oven==='pizza'?'90–120 sec':'6–9 min'):S.type==='langpanne'?(S.oven==='pizza'?'8–12 min':'12–16 min'):(S.oven==='pizza'?'20–25 min':'28–35 min')}`)],
      why:WHY.st,tip:(bakeTip(S.type)||'')+L(' Bruk semulegryn i stedet for vanlig mel til utbakingen — det tåler høy varme bedre og brenner seg sjeldnere enn løst mel på benken.',' Use semolina instead of regular flour for shaping — it handles high heat better and burns less easily than loose flour on the counter.')}
  ]};
}

function kveldSteps(anchor){
  const kh=S.kveldH, r=R(), ie=S.mode==='end';
  // F13/F17: gjæren leses fra recipeFor() (KCOLDMULT × fridgeYeastMult) i stedet
  // for en lokal duplikat-utregning — samme kilde som oppskriftsfanen og kopien.
  const ya=yLabelFor(recipeFor());
  // v0.829 (valgt av to skisserte alternativer): bulkhvile mellom elting og
  // forming, PÅ som standard. Meldt inn via ekstern gjennomgang: deigen gikk
  // fra eltekrok via runding rett i kulda, uten ett varmt minutt som samlet
  // deig — glutenet fikk ikke slappe av, og kaldhevingen startet fra null.
  // 40 min ved romtemperatur teller omtrent som 3–4 timer i kjøleskapet
  // (Q10). Bryteren er S.kveldHvile (i DEF → lagres med deigen); «rekker
  // ikke»-varselet i spis kl.-modus tilbyr å droppe hvilen med ett trykk.
  const HVILE_MIN=S.kveldHvile?40:0;
  const MIX_DUR=15, FORM_DUR=15, KVELD_MIN=kh*60, TEMPER_MIN=kh<=15?90:120;
  // v0.824: kickstarten foerst — doed gjaer skal oppdages i kveld, ikke i
  // morgen tidlig naar deigen ikke har hevet i kjoleskapet.
  const total=KICK_DUR+MIX_DUR+HVILE_MIN+FORM_DUR+KVELD_MIN+TEMPER_MIN;
  const t0=ie?sM(anchor,total):anchor;
  const yw=kickVannG(), mixAt=aM(t0,KICK_DUR);
  const hvileAt=aM(mixAt,MIX_DUR), formAt=aM(hvileAt,HVILE_MIN), coldAt=aM(formAt,FORM_DUR), temperAt=aM(coldAt,KVELD_MIN), bakeAt=aM(temperAt,TEMPER_MIN);
  const p=pc();
  const steps=[
    kickstartStep(t0, yw, r.water-yw, ya),
    {title:S.kjokkenmaskin==='ankarsrum'?'Ankarsrum — bland deig':S.kjokkenmaskin==='manuell'?'Bland og elt for hånd':'Kjøkkenmaskin — bland deig',loc:'benk',at:mixAt,dur:MIX_DUR,
      desc:(S.kjokkenmaskin==='ankarsrum'
        ?L(`Hell gjærblandingen fra kickstarten + ${r.water-yw}g kaldt vann${r.sugar?` + ${r.sugar}g sukker`:''} i bollen. Start trinn 1. Tilsett ${S.mel}g mel gradvis${r.oil?` + ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Tilsett ${r.salt}g salt etter 3 min. Øk til trinn 3–4. Elt 10–12 min — mål gjerne sluttdeigtemperaturen, ca. 20–22°C er et godt mål her (litt kaldere enn vanlig siden kjøleskapet snart overtar).`,`Pour the yeast mixture from the kickstart + ${r.water-yw}g cold water${r.sugar?` + ${r.sugar}g sugar`:''} into the bowl. Start on speed 1. Add ${S.mel}g flour gradually${r.oil?` + ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Add ${r.salt}g salt after 3 min. Increase to speed 3–4. Knead 10–12 min — measure the final dough temperature if you can, about 20–22°C is a good target here (a bit colder than usual since the fridge soon takes over).`)
        :S.kjokkenmaskin==='manuell'
        ?L(`Hell gjærblandingen fra kickstarten + ${r.water-yw}g kaldt vann${r.sugar?` + ${r.sugar}g sukker`:''} i en bolle. Bland inn ${S.mel}g mel gradvis${r.oil?`, ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''} og ${r.salt}g salt. Vend ut på benk og elt for hånd — ${S.hydro>68?'bruk fransk elting (slap-and-fold) i 10–12 min siden deigen er våt.':'press, brett, drei i 8–10 min til glatt.'} Mål gjerne sluttdeigtemperaturen om du har termometer — ca. 20–22°C er et godt mål her (litt kaldere enn vanlig siden kjøleskapet snart overtar).`,`Pour the yeast mixture from the kickstart + ${r.water-yw}g cold water${r.sugar?` + ${r.sugar}g sugar`:''} into a bowl. Mix in ${S.mel}g flour gradually${r.oil?`, ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''} and ${r.salt}g salt. Turn out onto the counter and knead by hand — ${S.hydro>68?'use French kneading (slap-and-fold) for 10–12 min since the dough is wet.':'press, fold, turn for 8–10 min until smooth.'} Measure the final dough temperature if you have a thermometer — about 20–22°C is a good target here (a bit colder than usual since the fridge soon takes over).`)
        :L(`Hell gjærblandingen fra kickstarten + ${r.water-yw}g kaldt vann${r.sugar?` + ${r.sugar}g sukker`:''} i bollen. Kjør eltekroken på lav hastighet mens du tilsetter ${S.mel}g mel gradvis${r.oil?`, ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}. Tilsett ${r.salt}g salt etter 2 min. Øk til middels hastighet. Elt 6–8 min — mål gjerne sluttdeigtemperaturen, ca. 20–22°C er et godt mål her (litt kaldere enn vanlig siden kjøleskapet snart overtar).`,`Pour the yeast mixture from the kickstart + ${r.water-yw}g cold water${r.sugar?` + ${r.sugar}g sugar`:''} into the bowl. Run the dough hook on low speed while you add ${S.mel}g flour gradually${r.oil?`, ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}. Add ${r.salt}g salt after 2 min. Increase to medium speed. Knead 6–8 min — measure the final dough temperature if you can, about 20–22°C is a good target here (a bit colder than usual since the fridge soon takes over).`))+langpanneHintText(),
      needs:[L(`💧 ${r.water-yw}g vann`,`💧 ${r.water-yw}g water`), L(`🌾 ${S.mel}g mel`,`🌾 ${S.mel}g flour`), L(`🧂 ${r.salt}g salt`,`🧂 ${r.salt}g salt`), ...(r.oil?[L(`🫒 ${r.oil}g olje`,`🫒 ${r.oil}g oil`)]:[]), ...(r.butter?[L(`🧈 ${r.butter}g smør`,`🧈 ${r.butter}g butter`)]:[]), ...(r.sugar?[L(`🍯 ${r.sugar}g sukker`,`🍯 ${r.sugar}g sugar`)]:[])],
      substeps:[
        L(`Hell gjærblandingen fra kickstarten + ${r.water-yw}g kaldt vann i bollen`,`Pour the yeast mixture from the kickstart + ${r.water-yw}g cold water into the bowl`),
        L(`Start på laveste hastighet/trinn, tilsett ${S.mel}g mel gradvis`,`Start on the lowest speed/setting, add ${S.mel}g flour gradually`),
        L(`Tilsett ${r.salt}g salt${r.oil?` og ${r.oil}g olje`:''}${r.butter?` + ${r.butter}g smeltet smør`:''}`,`Add ${r.salt}g salt${r.oil?` and ${r.oil}g oil`:''}${r.butter?` + ${r.butter}g melted butter`:''}`),
        L(`Øk hastigheten, elt til deigen er glatt — sikt mot 20–22°C`,`Increase the speed, knead until the dough is smooth — aim for 20–22°C`)
      ],
      why:L('Kaldt vann gjør det enklere å holde ønsket deigtemperatur og gir mer kontroll på gjæringen før kjøleskapet kjøler den ned.','Cold water makes it easier to hold the target dough temperature and gives more control over fermentation before the fridge cools it down.'),
      tip:L('Deigtemperatur etter elting bør ligge på 20–22°C — litt kaldere enn standardmetoden er helt greit her, siden kjøleskapet uansett overtar snart.','Dough temperature after kneading should be 20–22°C — a bit colder than the standard method is perfectly fine here, since the fridge takes over soon anyway.')},
    ...(S.kveldHvile?[{title:'Hvile i bollen',loc:'benk',at:hvileAt,dur:HVILE_MIN,passive:true,
      desc:L(`La deigen hvile tildekket i bollen i ca. ${HVILE_MIN} minutter før du ${N('former den til et emne','deler den i emner')}.`,`Let the dough rest covered in the bowl for about ${HVILE_MIN} minutes before you ${N('shape it into a ball','divide it into balls')}.`),
      substeps:[
        L('Dekk bollen med lokk eller plast','Cover the bowl with a lid or plastic wrap'),
        L(`La deigen stå på benken i ca. ${HVILE_MIN} minutter`,`Let the dough sit on the counter for about ${HVILE_MIN} minutes`)
      ],
      why:L(`Glutenet slapper av, så ${N('emnet','emnene')} blir lettere å runde med godt spenn — og gjæringen får en varm start før kjøleskapet bremser den. ${HVILE_MIN} minutter ved romtemperatur teller omtrent som 3–4 timer i kjøleskapet.`,`The gluten relaxes, so ${N('the ball is','the balls are')} easier to round with good tension — and fermentation gets a warm start before the fridge slows it down. ${HVILE_MIN} minutes at room temperature counts for roughly 3–4 hours in the fridge.`),
      tip:L('Trangt om tiden i kveld? Hvilen kan slås av under metodevalget — da går deigen rett fra elting til forming, slik Kveldsdeig gjorde før.','Short on time tonight? The rest can be turned off under the method choice — then the dough goes straight from kneading to shaping, the way Evening dough used to.')}]:[]),
    {title:'Form emner → kjøleskap',loc:'kjol',at:formAt,dur:FORM_DUR,
      desc:L(`Del i ${p.count} emne${p.count>1?'r':''} à ca. ${p.perPizza}g. Rund godt med begge hender. Legg i ${p.count>1?'oljede bokser':'oljet boks'} med tett lokk. Sett rett i kjøleskap.`,`Divide into ${p.count} ball${p.count>1?'s':''} of about ${p.perPizza}g${p.count>1?' each':''}. Round well with both hands. Place in ${p.count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}. Put straight into the fridge.`),
      needs:[L(`📦 ${p.count} boks${p.count>1?'er':''} m/lokk`,`📦 ${p.count} container${p.count>1?'s':''} w/lid${p.count>1?'s':''}`), L('🫒 litt olje','🫒 a little oil')],
      substeps:[
        L(`Del i ${p.count} emne${p.count>1?'r':''} à ca. ${p.perPizza}g`,`Divide into ${p.count} ball${p.count>1?'s':''} of about ${p.perPizza}g${p.count>1?' each':''}`),
        L('Rund godt med begge hender','Round well with both hands'),
        L(`Legg i ${p.count>1?'oljede bokser':'oljet boks'} med tett lokk`,`Place in ${p.count>1?'oiled containers with tight lids':'an oiled container with a tight lid'}`),
        L('Sett rett i kjøleskap','Put straight into the fridge')
      ],
      why:L('Forming før kjøling gjør at hvert emne får jevn temperatur og heving gjennom natten.','Shaping before chilling gives each ball even temperature and rise through the night.'),
      tip:TIP.intoFridge},
    {title:`Kjøleskapsheving (${kh}t)`,loc:'kjol',at:coldAt,dur:KVELD_MIN,passive:true,
      desc:L(`${N('La emnet stå urørt','La emnene stå urørt')} i kjøleskapet i ca. ${kh} timer. ${N('Ikke åpne boksen.','Ikke åpne boksene.')}`,`${N('Let the ball sit undisturbed','Let the balls sit undisturbed')} in the fridge for about ${kh} hours. ${N("Don't open the container.","Don't open the containers.")}`),
      substeps:[
        L(`${N('La emnet stå urørt','La emnene stå urørt')} i kjøleskapet i ca. ${kh} timer`,`${N('Let the ball sit undisturbed','Let the balls sit undisturbed')} in the fridge for about ${kh} hours`),
        L(N('Ikke åpne boksen','Ikke åpne boksene'),N('Don\'t open the container','Don\'t open the containers'))
      ],
      // v0.744: sto med «5–15 timer» hardkodet, mens KOPTS tilbyr opptil 24.
      // Velger du 18 eller 24 timer, motsa forklaringen sin egen overskrift
      // («Kjøleskapsheving (24t)»). Leser nå den valgte verdien.
      why:L(`Kald heving i ${kh} timer gir mer smak enn en ren romtemperatur-hurtigdeig, uten at du må planlegge flere dager frem som med standardmetoden.`,`Cold proofing for ${kh} hours gives more flavor than a pure room-temperature quick dough, without having to plan several days ahead like the standard method.`),
      tip:TIP.coldRise},
    {title:'Ta ut og temperer',loc:'rom',at:temperAt,dur:TEMPER_MIN,passive:true,
      desc:(()=>{const th=Math.round(TEMPER_MIN/60*10)/10;return L(`${N('Ta emnet','Ta emnene')} ut av kjøleskapet. La stå tildekket ved romtemperatur i ${th.toString().replace('.',',')} ${th===1?'time':'timer'} før du strekker og steker.`,`${N('Take the ball','Take the balls')} out of the fridge. Let ${N('it','them')} sit covered at room temperature for ${th.toString()} ${th===1?'hour':'hours'} before you stretch and bake.`);})(),
      substeps:(()=>{const th=Math.round(TEMPER_MIN/60*10)/10;return [
        L(N('Ta emnet ut av kjøleskapet','Ta emnene ut av kjøleskapet'),N('Take the ball out of the fridge','Take the balls out of the fridge')),
        L(`La stå tildekket ved romtemperatur i ${th.toString().replace('.',',')} ${th===1?'time':'timer'}`,`Let them sit covered at room temperature for ${th.toString()} ${th===1?'hour':'hours'}`),
        L(N('Ikke rør det før du skal strekke og steke','Ikke rør dem før du skal strekke og steke'),N('Don\'t touch it until you\'re ready to stretch and bake','Don\'t touch them until you\'re ready to stretch and bake'))
      ];})(),
      // v0.743: sto tidligere med «standardmetodens 4 timer» hardkodet. F14 (v0.720)
      // gjorde standardmetodens benketid temperaturavhengig — 6,4t ved 18°C, 2t ved
      // 28°C — og etterlot dette tallet som bare stemmer ved nøyaktig 22°C. Det
      // leses nå fra rtM(240), samme uttrykk standardmetoden selv bruker.
      // v0.760: sto «Kortere enn standardmetodens ca. 4 timer siden emnene ikke
      // har vært kalde like lenge». Den begrunnelsen holder ikke. Et emne på
      // 280g er gjennomkaldt etter to–tre timer i kjøleskapet; etter 18 timer
      // er det nøyaktig like kaldt som ett som har stått i 48. Hvor LENGE det
      // har vært kaldt sier ingenting om hvor kaldt det ER.
      // Appens egne tall motsier den også på to måter: Kveldsdeig 24t og
      // Langtidsdeig 48t har identisk gjærmengde (0,75g) men 120 mot 240 min
      // benketid, og INNAD i Kveldsdeig gir lengre kaldtid LENGRE temperering
      // (90 min under 15t, 120 min over) — motsatt vei av påstanden.
      // Den ekte grunnen er metodens form, ikke deigens temperatur: Kveldsdeig
      // er bygget rundt å bake dagen etter, og fire timer på benken ville
      // flyttet steketiden ut av kvelden. Det er ærligere å si det, og gi
      // leseren regelen som faktisk gjelder — gå etter emnet, ikke klokka.
      why:L(`Kald deig er stiv — benketida gjør den strekkbar igjen uten å rive. Kveldsdeig har kortere benketid enn standardmetodens ca. ${fmtDur(rtM(240))} fordi hele metoden er bygget rundt å bake dagen etter; fire timer på benken ville flyttet steketiden ut av kvelden. Et emne rett fra kjøleskapet er like kaldt uansett hvor lenge det har stått, så gå etter emnet og ikke klokka: er det fortsatt stivt og kaldt, gi det mer tid.`,`Cold dough is stiff — the bench rest makes it stretchable again without tearing. Evening dough has a shorter bench rest than the standard method's roughly ${durEn(fmtDur(rtM(240)))} because the whole method is built around baking the next day; four hours on the counter would push the bake out of the evening. A ball straight from the fridge is equally cold however long it has been in there, so go by the dough rather than the clock: if it is still stiff and cold, give it more time.`),
      tip:TIP.benchTemper},
    // v0.739: Kveldsdeig manglet forvarmingssteget. v0.737 antok at metoden alt
    // hadde et — det gjaldt kun Hurtigdeig, som bygger sitt inn i etterhevingen.
    ...preheatSteps(bakeAt, TEMPER_MIN, S.type),
    {title:'Strekk og stek 🔥',loc:'ovn',at:bakeAt,dur:0,desc:oD(S.type),substeps:bakeSubsteps(S.type),why:WHY.st,tip:bakeTip(S.type)}
  ];
  return {ya,steps};
}

// v0.750: alltid timer over en time — aldri døgn. «1,3 døgn» krever hoderegning
// for å bli nyttig, og verre: brukeren VELGER kjøleskapstida i timer (COLD_OPTS
// er «24 timer», «48 timer», «72 timer»), og planen leste den tilbake i en annen
// enhet. Samme størrelse, to enheter, i samme app. Nå ekko-er planen etiketten
// du trykket på.
// Desimaltimer beholdes bare for korte varigheter, der en halvtime betyr noe
// («2,5 timer»). Over seks timer er «31,8 timer» falsk presisjon på en gjæring
// som uansett styres av hvordan deigen ser ut.
function fmtDur(mins){
  if(mins>=360){ const h=Math.round(mins/60); return h+(h===1?' time':' timer'); }
  if(mins>=60){ const h=Math.round(mins/6)/10; return h.toString().replace('.',',')+(h===1?' time':' timer'); }
  return mins+' min';
}

// Deler steg-utregningen med wizardens statuslinje, så begge alltid viser
// nøyaktig samme oppstart/steketid uten å duplisere selve valg-logikken.
function stepsForAnchor(anchor){
  if(S.type!=='ingenelting' && S.method==='hurtig') return hurtigSteps(anchor).steps;
  if(S.type!=='ingenelting' && S.method==='kveld') return kveldSteps(anchor).steps;
  return rawSteps(anchor);
}
