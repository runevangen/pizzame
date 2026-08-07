// Beregningsmotoren for Pizzaplanlegger — skilt ut fra index.html (F22, v0.719),
// samme mønster som changelog.js/guide.js. REN kjerne: ingrediens-sannheten
// (recipeFor + R/maniaRecipe), kalibreringskurvene (CALIBRATION + interpLin),
// metode-registeret (METHODS) og gjæringstid-avledningene. Ingen DOM-tilgang.
// Lastes FØR hovedscriptet; leser S/HOPTS/KCOLDMULT/BSALT-tabellene m.m. fra
// den delte globale konteksten ved KJØRETID (alle toppnivå-bindinger på tvers
// av script-filer deler globalt miljø), så lasterekkefølgen er kun viktig for
// at navnene her finnes når hovedscriptet kaller dem.

// F18: alle interpolerte gjærings-/gjærkurver samlet på ETT sted, tolket av én
// felles interpLin(). Punktene er UENDRET fra de tidligere spredte konstantene og
// funksjons-lokale arrayene — historikken/kildene i kommentarene gjelder fortsatt.
// Diskrete valgtabeller med UI-etiketter (HOPTS, KOPTS, KCOLDMULT, COLD_OPTS)
// er bevisst ikke flyttet hit — de er menyer, ikke kurver.
const CALIBRATION={
  // tf(): romtemperatur → tidsfaktor for romhevinger (22°C = 1,0-referanse)
  tempFactor:[[18,1.6],[20,1.3],[22,1.0],[24,0.8],[26,0.65],[28,0.5]],
  // Gjærmultiplikator for kjøleskapsheving i TIMER. Interpolerer mellom de samme
  // uttestede punktene som den gamle dags-tabellen COLDMULT {1:1.5 … 6:0.38}
  // (skalert ned ~25% fra AVPN-kilder, se historikk ved v0.659).
  coldMultHours:[[24,1.5],[48,1.05],[72,0.75],[96,0.59],[120,0.45],[144,0.38]],
  // Forspill-gjær, romtemperatur-poolish. v0.697 (funn 2): all gjæren ligger i
  // poolishen, så en lang romtemp-poolish (15–16t) topper og faller lett hvis
  // gjæren står for høyt — trukket ned i den lange enden (15t: 0,925→0,80,
  // 16t: 0,85→0,66). 14t er uendret 1,0×-referanse så standardvalget ikke endres.
  poolishRoom:[[12,1.2],[14,1.0],[15,0.80],[16,0.66]],
  // Forspill-gjær, kjøleskaps-poolish: mesteparten av tiden er ved kjøleskaps-
  // temperatur — gjæraktiviteten er langt roligere enn tilsvarende lang
  // romtemperatur-poolish (som uansett ikke er trygg utover ~16t).
  poolishCold:[[12,1.2],[16,1.0],[24,0.85],[36,0.65],[48,0.5]],
  // Forspill-gjær, biga (18t = 1,0-referanse).
  biga:[[16,1.15],[18,1.0],[20,0.92],[22,0.85],[24,0.8]],
  // F13: gjærkompensasjon for kjøleskapstemperatur. Referansen er et riktig
  // innstilt kjøleskap (Mattilsynet: 0–4°C) — sone 2–4°C ≈ 3°C = 1,0×, som er
  // det kurvene over alltid implisitt har antatt, så standardvalget endrer
  // ingen tall. Kaldere skap bremser gjæren → litt mer gjær for samme resultat
  // til samme tid (~+30% ved 0–2°C); varmere skap/dørhylle → mindre (~−20% ved
  // 4–6°C, ~−35% ved 6–8°C). Midtpunkter per sone; fornuftige antagelser i
  // samme ånd som KOPTS-kurven, ikke kilde-eksakte tall.
  fridgeMult:[[1,1.3],[3,1.0],[5,0.8],[7,0.65]]
};
// F13: leses av R() (standard/poolish/biga) og recipeFor sin kveld-gren.
// Mania er bevisst unntatt — det er en fast, publisert oppskrift fra kilden.
function fridgeYeastMult(){ return interpLin(CALIBRATION.fridgeMult,(S.fridgeC==null?3:S.fridgeC)); }
// v0.724: sukkeret i NY-stilen er der for å gi farge i vanlig ovn (6–9 min
// steketid). I pizzaovn på 400°C+ brenner det seg før skorpa er ferdig — da
// droppes det (klassisk NY-råd: «skip sugar if baking with open flame»).
// Per i dag er newyork eneste type med sukker, så dette er i praksis en
// NY+pizzaovn-regel — men den er skrevet generelt via BSUGAR-tabellen.
function effSugarPct(){ return S.oven==='pizza' ? 0 : (BSUGAR[S.type]||0); }
function prefermentYeastMult(){
  if(S.method==='poolish'){
    return interpLin(S.poolishCold?CALIBRATION.poolishCold:CALIBRATION.poolishRoom,S.poolishH);
  }
  if(S.method==='biga'){
    return interpLin(CALIBRATION.biga,S.bigaH);
  }
  return 1.0;
}
// F18: den ENE interpolatoren — coldMultForHours() og tf() hadde tidligere hver
// sin kopi av samme løkke. dec styrer avrundingen (tf brukte 2 desimaler, resten
// 3) så tallene er bit-identiske med før.
function interpLin(pts,x,dec=3){
  const f=Math.pow(10,dec);
  if(x<=pts[0][0]) return pts[0][1];
  if(x>=pts[pts.length-1][0]) return pts[pts.length-1][1];
  for(let i=0;i<pts.length-1;i++){
    const [x0,y0]=pts[i],[x1,y1]=pts[i+1];
    if(x>=x0&&x<=x1) return Math.round((y0+(y1-y0)*(x-x0)/(x1-x0))*f)/f;
  }
  return 1.0;
}

function coldMultForHours(h){ return interpLin(CALIBRATION.coldMultHours,h); }

function tf(){ return interpLin(CALIBRATION.tempFactor,S.temp,2); }
function rtM(b){return Math.round(b*tf());}

// F23: gjærmultiplikatoren. Langtidsdeig bruker Q10-integralet over den ekte
// stegkjeden; øvrige metoder beholder sine egne, uttestede kurver (se F23-
// notatet nederst for hvorfor poolish/biga ikke er med i denne runden).
function yeastMultiplier(){
  if(S.method==='hurtig'||S.method==='kveld'||S.type==='ingenelting') return 1;
  // v0.741: Langtidsdeig bruker Q10 alltid (F23). Poolish og Biga gjør det bare
  // når gjærtesten er slått på — da er det nettopp Q10 som er utfordreren.
  // (Kveldsdeig går ikke via denne funksjonen; den overstyres i recipeFor.)
  if(S.method==='standard' || gjaertestActive()){
    const load=currentFermentLoad();
    if(load) return Q10_K/load;
    // Faller hit kun under selve integralberegningen (rekursjonsvakten) — da er
    // verdien uansett bare tekst i en kjede som kastes.
  }
  return coldMultForHours(S.cold)*prefermentYeastMult()*fridgeYeastMult();
}
function R(){
  const m=S.mel,w=Math.round(m*S.hydro/100),sa=Math.round(m*BSALT[S.type]/100*10)/10,oi=Math.round(m*BOIL[S.type]/100),bu=Math.round(m*(BBUTTER[S.type]||0)/100),su=Math.round(m*effSugarPct()/100*10)/10,yd=Math.round(m*BYEAST[S.type]/100*yeastMultiplier()*100)/100,yf=Math.round(yd*3*10)/10;
  const ns=window._lang==='en'
    ?{napoletana:'Neapolitan pizza',newyork:'New York pizza',langpanne:'Sheet-pan pizza',chicago:'Chicago deep dish',ingenelting:'No-knead pizza'}
    :{napoletana:'Napoletansk pizza',newyork:'New York-pizza',langpanne:'Langpannepizza',chicago:'Chicago deep dish',ingenelting:'Ingen elting-pizza'};
  return{name:ns[S.type],flour:m,water:w,salt:sa,oil:oi,butter:bu,sugar:su,yDry:yd,yFresh:yf};
}
// Mania-poolish (oppkalt etter Pizzamania, som la ut oppskriften): egne faste
// prosenter fra kilden, uavhengig av S.type sine BSALT/BYEAST-tabeller — boka
// spesifiserer sin egen, komplette oppskrift (64% hydrering, poolish = 50% av
// mel/vann i 1:1-forhold), ikke en variant av appens øvrige pizzatyper.
//
// KILDEN (v0.759, verifisert mot originalteksten): «Lørdagspizza med poolish
// tilpasset tidsklemma», René Munthe Eik, pizzamani.no, 5. januar 2020.
// Oppskriften har to kolonner — 4 og 6 pizza — og koeffisientene under er
// kalibrert på 6-PIZZA-kolonnen, som de gjengir eksakt på hvert eneste tall.
//
// Hvorfor bare den ene: kildens to kolonner er IKKE proporsjonale med
// hverandre. Hovedgjæren avviker 6,7 % (tørr) og 10,8 % (fersk) mellom dem, så
// ingen enkelt koeffisient kan treffe begge. 4-pizza-kolonnen gjengis derfor
// med 0,71g tørr mot kildens 0,76g, og 0,56g fersk mot 0,62g. Alt annet i den
// kolonnen — poolish-mel, -vann, -gjær, vann 1 og 2 — stemmer eksakt.
//
// MERK om fersk kontra tørr: i kildens POOLISH er fersk 2,2× tørr, som er den
// normale retningen. I kildens HOVEDDEIG er fersk 0,8× tørr — altså mindre
// fersk enn tørr, som er snudd. Regnet på totalen får den som bruker fersk
// gjær bare ~1,25× tørrvekten, der ~3× er det vanlige. Dette er kildens tall,
// og de står med vilje urørt: Mania er en AVSKRIFT, og appen sier selv at
// gjæren i den ikke skal justeres. Ikke «rett opp» dette uten å endre hva
// metoden lover å være.
// F19: Manias faste fasevarigheter (minutter) — ETT sted, lest av BÅDE
// stegbyggeren (rawSteps) og totalFermentHours(). Tidligere håndsummerte
// totalFermentHours de samme tallene som en frittstående formel («720/60 +
// 120/60 + …») som måtte huskes oppdatert hver gang et steg ble endret —
// en skygge-konstant som kunne lyve stille til Smart-plan og melvarslene.
const MANIA_T={POOLISH_MIX:8,POOLISH:720,CHILL:120,MIX:25,RISE1:30,ROOM1:75,COLDBULK:600,FINAL:600,DIVIDE:15};
function maniaRecipe(){
  const m=S.mel;
  const poolishMel=Math.round(m*0.5);
  const poolishVann=Math.round(m*0.5);
  const poolishYd=Math.round(m*0.000557*100)/100;
  const poolishYf=Math.round(m*0.001231*100)/100;
  const hovedMel=m-poolishMel;
  const vann1=Math.round(m*0.09957);
  const vann2=Math.round(m*0.04069);
  const salt=Math.round(m*0.03*10)/10;
  const hovedYd=Math.round(m*0.001146*100)/100;
  const hovedYf=Math.round(m*0.000899*100)/100;
  return {
    poolishMel,poolishVann,poolishYd,poolishYf,
    hovedMel,vann1,vann2,salt,hovedYd,hovedYf,
    totalMel:m, totalYd:Math.round((poolishYd+hovedYd)*100)/100, totalYf:Math.round((poolishYf+hovedYf)*100)/100
  };
}
function yA(r){return S.gjaer==='torr'?L(`${r.yDry}g tørrgjær`,`${r.yDry}g dry yeast`):L(`${r.yFresh}g fersk gjær`,`${r.yFresh}g fresh yeast`);}
// F17: ÉN kilde til ingredienssannheten, uansett metode. Gjæren bodde tidligere
// på fire steder (R() m/multiplikatorer, HOPTS.yp, KCOLDMULT, maniaRecipe), og
// hver visningsflate (steg, oppskriftsfane, kopier, kalender) måtte kjenne alle
// fire — glemte én flate ett tilfelle, spriket tallene (v0.713-Mania-feilen,
// currentYeastAmount-plasteret). Nå leser alle flater denne. Ingenelting-typen
// overstyrer metode (fast prosess), derfor type-vaktene på metodegrenene.
function recipeFor(){
  const r=R();
  const rec={name:r.name,flour:r.flour,water:r.water,salt:r.salt,oil:r.oil,butter:r.butter,sugar:r.sugar,hydro:S.hydro,yDry:r.yDry,yFresh:r.yFresh,preferment:null};
  if(S.type==='ingenelting') return rec;
  if(S.method==='hurtig'){
    const o=HOPTS.find(x=>x.h===S.hurtigH)||HOPTS[3], f=S.mel/500;
    rec.yDry=Math.round(o.yp*f*100)/100; rec.yFresh=Math.round(rec.yDry*3*10)/10;
  }else if(S.method==='kveld'){
    // v0.741: Kveldsdeig regner gjæren her, ikke via yeastMultiplier — så
    // gjærtesten må gripe inn på dette stedet for at den skal gjelde metoden.
    const q=gjaertestActive()?gjaertestMult():null;
    const mult=(q!==null)?q:(KCOLDMULT[S.kveldH]||2.0)*fridgeYeastMult(); // F13: kveld kaldhever også
    rec.yDry=Math.round(S.mel*BYEAST[S.type]/100*mult*100)/100; rec.yFresh=Math.round(rec.yDry*3*10)/10;
  }else if(S.method==='mania'){
    const rm=maniaRecipe();
    rec.water=rm.poolishVann+rm.vann1+rm.vann2;
    rec.salt=rm.salt; rec.oil=0; rec.butter=0; rec.sugar=0;
    rec.hydro=Math.round(rec.water/rec.flour*100);
    rec.yDry=rm.totalYd; rec.yFresh=rm.totalYf;
    rec.preferment=rm;
  }
  return rec;
}
function yLabelFor(rec){return S.gjaer==='torr'?L(`${rec.yDry}g tørrgjær`,`${rec.yDry}g dry yeast`):L(`${rec.yFresh}g fersk gjær`,`${rec.yFresh}g fresh yeast`);}
// v0.742: målvekten per emne — ETT sted. Den lå tidligere som en identisk
// kopi i både pc() og flourForCount(), og det var nettopp derfor de to kunne
// motsi hverandre: flourForCount(1) svarte 200g mel, som pc() så gjorde om til
// et emne på 336g — 24% over de 270g flourForCount selv regnet ut fra.
// Langpanne/IngenElting: 0,7g deig per cm² formflate (standard focaccia-
// tommelfingerregel), 30×40cm langpanne = 1200cm² => ca. 840g fyller én panne godt.
function targetBallWeight(type){
  const t=type||S.type;
  return t==='napoletana'?270:t==='newyork'?300:(t==='langpanne'||t==='ingenelting')?840:500;
}
function pc(){
  const eg=targetBallWeight();
  let td;
  if(S.method==='mania'){
    const rm=maniaRecipe();
    td=Math.round(rm.poolishMel+rm.poolishVann+rm.hovedMel+rm.vann1+rm.vann2+rm.salt+rm.poolishYd+rm.hovedYd);
  }else{
    // v0.744, to ting på én gang:
    // (a) Kilden. Sto tidligere `R()`, men Hurtigdeig og Kveldsdeig OVERSTYRER
    //     gjæren i recipeFor() (HOPTS / KCOLDMULT). pc() regnet altså deigvekta
    //     med en annen gjærmengde enn den alle visningsflater viser — pc() var
    //     en fjerde gjærkilde, nøyaktig klassen F17 fjernet. Nå leser den samme
    //     recipeFor() som resten.
    // (b) Gjæren telles med. Den sto utenfor for alle metoder unntatt Mania, så
    //     ingredienslista summerte ikke til emnevekten planen selv oppga:
    //     160g mel NY ga 160+101+3,2+3+0,32 = 267,52, mens appen skrev 267.
    //     Målt over ~1500 konfigurasjoner flytter det ANTALL emner i seks
    //     tilfeller, alle på en avrundingsgrense der tallet uansett var vilkårlig.
    const r=recipeFor();
    td=Math.round(r.flour+r.water+r.salt+r.oil+(r.butter||0)+(r.sugar||0)+(r.yDry||0));
  }
  const cnt=Math.max(1,Math.round(td/eg));
  return{count:cnt,perPizza:Math.round(td/cnt),totalDough:td,melPer:Math.round((S.method==='mania'?S.mel:R().flour)/cnt)};
}

// F21: metode-registeret — navn og UI-flagg per metode på ETT sted. Tidligere lå
// dette spredt som hardkodede lister (mN sine to språkmaps, BETA_METHOD_DEFS,
// kald-slider-synlighet på TRE steder, Deiger-filterets metodeliste) som hver
// måtte finnes og utvides for hver ny metode — og de var alt i utakt: PC-sidens
// applyTypeUI manglet mania i kald-slider-lista, så PC viste justerbar kjøletid
// for en metode med fast struktur mens mobil skjulte den.
// coldSlider: metoden bruker den justerbare kjøleskapshevings-slideren (S.cold).
// smartPlan: metoden deltar i Smart-plan-kandidatlista og Deiger-filteret.
// yeastTest (F24/v0.741): metoden regner fortsatt gjæren med de multipliserte
// tabellene, og kan derfor utfordres av Q10-modellen. Hvem som står her er MÅLT,
// ikke antatt — se «Gjærtest» under. Langtidsdeig er ikke med fordi den allerede
// ER Q10 (F23, avviket er 0,0%); Mania fordi den er en publisert oppskrift fra en
// kilde og ikke noe appen regner ut; Hurtigdeig fordi gjæren kommer fra HOPTS,
// en annen modell enn tabellene — å sammenligne den med Q10 er epler mot pærer.
const METHODS={
  // fridgeTemp (F13): metoden kaldhever med app-beregnet gjær → kjøleskaps-
  // temperatur-valget vises og kompenserer gjæren. Mania: false med vilje —
  // fast, publisert oppskrift fra kilden, gjæren skal ikke justeres.
  standard:{no:'Langtidsdeig',en:'Long-ferment dough',noShort:'Langtidsdeig',enShort:'Long-ferment',coldSlider:true, smartPlan:true, fridgeTemp:true},
  poolish: {no:'Poolish',     en:'Poolish',           noShort:'Poolish',     enShort:'Poolish',     coldSlider:true, smartPlan:true, fridgeTemp:true, yeastTest:true},
  biga:    {no:'Biga',        en:'Biga',              noShort:'Biga',        enShort:'Biga',        coldSlider:true, smartPlan:true, fridgeTemp:true, yeastTest:true},
  mania:   {no:'Mania-poolish',en:'Mania poolish',    noShort:'Mania',       enShort:'Mania',       coldSlider:false,smartPlan:true, fridgeTemp:false},
  hurtig:  {no:'Hurtigdeig',  en:'Quick dough',       noShort:'Hurtigdeig',  enShort:'Quick',       coldSlider:false,smartPlan:true, fridgeTemp:false},
  kveld:   {no:'Kveldsdeig',  en:'Evening dough',     noShort:'Kveldsdeig',  enShort:'Evening',     coldSlider:false,smartPlan:true, fridgeTemp:true, yeastTest:true},
  ingenelting:{no:'Ingen elting',en:'No-knead',       noShort:'Ingen elting',enShort:'No-knead',    coldSlider:false,smartPlan:false,fridgeTemp:false}
};

// ===== GJÆRTEST (v0.741) — utfordrer gjærmengden med Q10 =====
// F24 spurte om Q10 også burde gjelde Poolish og Biga, og svarte selv at det
// ikke kan avgjøres ved tastaturet: en halvering av gjæren er den største
// enkeltendringen appen kan gjøre mot en eksisterende bruker, og den må BAKES.
// Gjærtesten gjør nettopp det mulig. Den bytter ikke modell for noen — den lar
// deg slå på en utfordrer, ser at du får se BEGGE tallene, og lagrer hvilket du
// bakte med, slik at terningkastene i Deiger-fanen (F9) avgjør spørsmålet.
//
// Målt avvik ved påslag (napoletana 500g, 22°C rom, 3°C skap):
//   Poolish    14t + 24t kaldt   1,13 g → 0,48 g   (−58 %)
//   Biga       18t + 24t kaldt   1,13 g → 0,40 g   (−65 %)
//   Kveldsdeig 10t               1,24 g → 2,89 g   (+133 %)
// Kveldsdeig peker MOTSATT vei og sto ikke i F24 i det hele tatt. Merk at den
// også er det svakest funderte tilfellet: Q10_K er kalibrert på Langtidsdeig,
// der belastningen er 9,9–19,7 ekvivalenttimer. Kveldsdeig ligger på 3,9 — godt
// utenfor. Det er ekstrapolering, og det er nøyaktig derfor den må bakes.
// Flagget bor i S (og dermed i DEF/SETUP_FIELDS), ikke i en egen localStorage-
// nøkkel. Det er ikke en detalj: `saveBake` lagrer `config:{...S}`, så valget
// havner i bakeloggen HELT AV SEG SELV, og å åpne en gammel deig gjenskaper den
// med samme gjærmodell den ble bakt med. Hadde flagget ligget ved siden av S,
// måtte begge deler vært husket manuelt — og et forsøk der du ikke vet hvilken
// gjærmengde deigen faktisk hadde, er ikke et forsøk.
function gjaertestOn(){ return S.gjaertest===true; }
function methodAllowsYeastTest(m){ const d=METHODS[m]; return !!(d&&d.yeastTest); }
// Vakten som lar oss regne ut «hva metoden ville gitt UTEN testen» ved å kalle
// samme kode én gang til med testen midlertidig av. Uten den måtte tabellveien
// vært duplisert, og da har vi to gjærkilder igjen — feilen F17 fjernet.
let _gjaertestAv=false;
function gjaertestActive(){
  if(_gjaertestAv) return false;
  if(S.type==='ingenelting') return false;   // fast prosess, overstyrer metode
  return gjaertestOn() && methodAllowsYeastTest(S.method);
}
// Q10-multiplikatoren, samme integral Langtidsdeig bruker. null når belastningen
// ikke kan regnes ut — det skjer under selve integralberegningen (rekursjons-
// vakten), og da faller kalleren tilbake på tabellene, akkurat som F23 gjør.
function gjaertestMult(){
  const load=currentFermentLoad();
  return load ? Q10_K/load : null;
}
// Oppskriften metoden ville gitt uten testen — grunnlaget for å vise begge tall.
// Returnerer null når testen ikke er på, så kallerne kan bruke den som vakt.
function recipeWithoutGjaertest(){
  if(!gjaertestActive()) return null;
  _gjaertestAv=true;
  try{ return recipeFor(); } finally{ _gjaertestAv=false; }
}
function methodShowsColdSlider(m){const d=METHODS[m];return !!(d&&d.coldSlider);}
function methodUsesFridge(m){const d=METHODS[m];return !!(d&&d.fridgeTemp);}
function mN(m){const d=METHODS[m];return d?(window._lang==='en'?d.en:d.no):m;}

// F17: gjæretiketten leses nå fra recipeFor() — samme kilde som alt annet.
// (Tidligere dupliserte denne HOPTS/KCOLDMULT-beregningene lokalt, og manglet
// attpåtil ingenelting-vakten, så ingen elting + hurtig valgt viste feil gjær.)
function currentYeastAmount(){ return yLabelFor(recipeFor()); }

function fixedFermOverheadHours(method){
  const m=method||S.method;
  const preferment=m==='poolish'?S.poolishH:m==='biga'?S.bigaH:0;
  // v0.665 (backlog #7): biga-romhevingen må rundes likt som tidsplanen
  // (rtB=Math.round(rt*1.5), rt=rtM(60)) — ellers regner overgjærings-varselet
  // et sub-minutt annerledes enn planen viser.
  const bulkRiseMin=m==='biga' ? Math.round(rtM(60)*1.5) : rtM(60);
  return preferment+bulkRiseMin/60;
}
function totalFermentHours(){
  if(S.type==='ingenelting') return 15;
  if(S.method==='hurtig') return S.hurtigH;
  if(S.method==='kveld') return S.kveldH;
  // F19: leser samme MANIA_T som stegbyggeren — kan ikke lenger drifte fra
  // tidsplanen. (Gjæringstimer = alle faser unntatt selve delingen på slutten.)
  if(S.method==='mania') return (MANIA_T.POOLISH+MANIA_T.CHILL+MANIA_T.MIX+MANIA_T.RISE1+MANIA_T.ROOM1+MANIA_T.COLDBULK+(MANIA_T.FINAL-MANIA_T.DIVIDE))/60;
  return fixedFermOverheadHours()+S.cold;
}

function flourForCount(n){
  const eg=targetBallWeight();
  const frac=1+S.hydro/100+BSALT[S.type]/100+BOIL[S.type]/100+effSugarPct()/100;
  // v0.742: gulvet var 200g, og det var feil. Uttrykket regner allerede ut «nok
  // mel til n emner à målvekt» — det kan per konstruksjon ikke bli for lite. Det
  // eneste gulvet gjorde var å LØFTE svaret over målvekten når n=1: for
  // napoletansk ga 200g et emne på 336g (+24%), og for New York 200g mot 180g
  // som er riktig. Appen svarte altså på «hvor mye mel til én pizza» med en
  // mengde som ikke gir én pizza. Gulvet er nå satt så lavt at det aldri kan
  // binde for en ekte type (minste er New York på 180g) — det står bare igjen
  // som en vakt mot tullete n.
  return Math.max(100,Math.round(Math.max(1,n)*eg/frac/10)*10);
}
// v0.742: hvor langt emnet havner fra målvekten for typen. Antallet emner må
// rundes til et helt tall, og da kan vekten per emne ikke alltid treffe: med
// 240g mel blir det ett emne på 403g (+49%), med 260g to på 218g (−19%).
// Rundingen er riktig — det er å TIE om utslaget som er feil, for planen sier
// «Napoletansk pizza» og leverer noe som ikke veier som en.
// Returnerer null når emnet er innenfor, ellers avviket og melmengden som ville
// truffet. Terskelen på 12% er satt der ekte melmengder begynner å bomme
// merkbart (500g → +4% tier, 560g → +16% sier fra).
const BALL_DEV_PCT=12;
function ballWeightNote(){
  const p=pc(), eg=targetBallWeight();
  if(!p.count || !p.perPizza) return null;
  const pst=Math.round((p.perPizza/eg-1)*100);
  if(Math.abs(pst)<BALL_DEV_PCT) return null;
  return {pst, per:p.perPizza, mal:eg, count:p.count, forslag:flourForCount(p.count)};
}

// ===== «FRA–TIL»: MAKS GJÆRING I ET KJENT VINDU (v0.725) =====
// Du vet når du TIDLIGST kan starte, og når du VIL steke. Steketiden er den
// harde betingelsen (planen regnes fortsatt bakover fra den, S.mode='end');
// oppstarten er en nedre grense. Oppgaven blir da: finn det alternativet med
// mest gjæring der planens totale lengde får plass i vinduet — altså den som
// starter senest mulig, men fortsatt etter at du er tilgjengelig.
//
// Bevisst kun de enkle metodene i førsteutgaven: Poolish og Biga har lengre,
// sammensatte vinduer (forspill + pause + kald hale) og ville gjort lista lang
// og vanskelig å lese. Mania har fast struktur og kan uansett ikke justeres.
// v0.730: Poolish og Biga er nå med. De ble holdt utenfor i v0.725 fordi lista
// ville blitt lang og uleselig — men metodefilteret (samme som Smart-plan
// bruker) lar brukeren nå styre lengden selv, så innvendingen faller bort.
// For forspill-metodene varieres den KALDE halen; selve forspill-lengden
// (poolishH/bigaH) er et smaksvalg brukeren har tatt og skal ikke overstyres.
const COLD_VALS=()=>{const a=[];for(let h=24;h<=COLD_MAX;h+=6)a.push(h);return a;};
const WINDOW_METHODS=[
  {m:'hurtig',   key:'hurtigH', vals:()=>HOPTS.map(o=>o.h)},
  {m:'kveld',    key:'kveldH',  vals:()=>KOPTS.map(o=>o.h)},
  {m:'standard', key:'cold',    vals:COLD_VALS},
  {m:'poolish',  key:'cold',    vals:COLD_VALS},
  {m:'biga',     key:'cold',    vals:COLD_VALS}
];
// Favoritten løftes med samme milde vekt som nattestarter straffes med: den
// vinner når den er innenfor 3 timers gjæring av det beste alternativet, men
// aldri i det stille — kortet oppgir alltid hva valget koster deg.
const WINDOW_FAV_BONUS=180;
// Faktisk lengde på en plan (første steg → steking) i minutter. Måles på den
// EKTE stegkjeden i stedet for en parallell formel, så den aldri kan drifte fra
// tidsplanen slik den håndsummerte Mania-konstanten gjorde før F19.
function planSpanMin(anchor){
  const st=stepsForAnchor(anchor);
  if(!st||!st.length) return null;
  const a=st[0].at, b=st[st.length-1].at;
  if(!(a instanceof Date)||!(b instanceof Date)) return null;
  const n=Math.round((b.getTime()-a.getTime())/60000);
  return isNaN(n)?null:n;
}
// Rangerte kandidater for vinduet. Rangering = lengst plan som får plass, som
// er nøyaktig «mest gjæring» — og samtidig «fyller vinduet best».
// Returnerer også minSpan per metode, så metoder som IKKE får plass kan vise
// ærlig hvor mye tid de mangler i stedet for bare å forsvinne.
function windowCandidates(bakeAt, windowMin){
  if(S.type==='ingenelting') return [];
  const saved={method:S.method,hurtigH:S.hurtigH,kveldH:S.kveldH,cold:S.cold,mode:S.mode};
  const out=[];
  try{
    S.mode='end';
    for(const def of WINDOW_METHODS){
      // C: samme av/på-filter som Smart-plan. Skrur du av en metode du aldri
      // lager, skal den heller ikke ta plass her.
      if(typeof betaMethodAllowed==='function' && !betaMethodAllowed(def.m)) continue;
      S.method=def.m;
      let best=null,minSpan=null,minVal=null;
      for(const v of def.vals()){
        S[def.key]=v;
        let span=null;
        try{ span=planSpanMin(bakeAt); }catch(e){ continue; }
        if(span==null) continue;
        if(minSpan==null||span<minSpan){ minSpan=span; minVal=v; }
        if(span<=windowMin && (!best||span>best.span)) best={val:v,span};
      }
      out.push({method:def.m,key:def.key,best,minSpan,minVal,fav:S.favMethod===def.m});
    }
  } finally {
    S.method=saved.method;S.hurtigH=saved.hurtigH;S.kveldH=saved.kveldH;S.cold=saved.cold;S.mode=saved.mode;
  }
  const NIGHT_PENALTY=180;
  out.forEach(c=>{
    if(!c.best){ c.night=false; return; }
    const st=new Date(bakeAt.getTime()-c.best.span*60000);
    c.startAt=st;
    c.night=isNightHour(st.getHours());
  });
  const score=c=>c.best.span+(c.fav?WINDOW_FAV_BONUS:0)-(c.night?NIGHT_PENALTY:0);
  out.sort((a,b)=>{
    if(a.best&&b.best){
      const d=score(b)-score(a);
      if(d) return d;
      return b.best.span-a.best.span;
    }
    if(a.best) return -1;
    if(b.best) return 1;
    // Blant dem som IKKE passer: favoritten først. Det er nettopp den du vil
    // vite hvordan du kan få til — resten sorteres etter hvor nær de er.
    if(a.fav!==b.fav) return a.fav?-1:1;
    return (a.minSpan||0)-(b.minSpan||0);
  });
  // Prislappen: vant favoritten over noe med mer gjæringstid, skal det stå.
  const fits=out.filter(c=>c.best);
  if(fits.length>1 && fits[0].fav){
    const longest=fits.slice(1).reduce((m,c)=>(!m||c.best.span>m.best.span)?c:m,null);
    if(longest && longest.best.span>fits[0].best.span){
      fits[0].costMin=longest.best.span-fits[0].best.span;
      fits[0].costVs=longest.method;
    }
  }
  return out;
}
// Natt = 23:00–05:59. Brukt til å merke oppstarter man neppe vil ha, både i
// Fra–til-lista og som grunnlag for «start heller kl. …»-utveien.
function isNightHour(h){ return h>=23 || h<6; }

// ===== F23 (v0.729): Q10-GJÆRINGSMODELL =====
// Gjærmengden ble tidligere regnet ut ved å gange sammen flere håndtunede
// tabeller (coldMultHours × prefermentMult × fridgeMult). Q10 er én fysisk lov
// i stedet: gjæringsraten halveres for hver 10°C temperaturen faller. Vi regner
// hver fase om til «ekvivalente timer ved 22°C», summerer over HELE planen, og
// deler gjæren på summen.
//
// Den viktigste praktiske gevinsten: romhevingen og benketida teller nå faktisk
// med. Før bidro kun kaldtiden til gjærberegningen — en reell unøyaktighet som
// ble større med F14, der benketida varierer fra 2,6t til 6,4t med romtemperaturen.
//
// Belastningen måles på den EKTE stegkjeden (samme kilde planSpanMin bruker),
// ikke på en parallell formel — det var nettopp skygge-konstant-feilen F19 fjernet.
// Hvert steg har allerede en `loc` som gir temperaturen: kjol → S.fridgeC,
// rom/benk → S.temp, ovn → steking (teller ikke).
const Q10_REF_C=22;
// Q10=2,3 er valgt slik at kurven treffer dagens uttestede ytterpunkter for
// Langtidsdeig eksakt (24t og 72t); 48t lander 0,04g lavere — under det en
// hjemmevekt kan lese. Litteraturverdien for gjær ligger i området 2–3.
const Q10=2.3;
// Kalibreringskonstanten: gjær = mel × BYEAST% × Q10_K / gjæringsbelastning.
// Satt slik at Langtidsdeigens uttestede referansepunkter treffer dagens tall.
// Målt avvik mot den gamle tabellen over hele kald-spennet (napoletana 500g,
// 22°C rom, 3°C skap): 24t og 72t eksakt, 48t −0,04g, 96t +0,01g, 120t +0,04g.
// Alle avvik er under oppløsningen på en hjemmevekt (0,1g).
// v0.752: hvor bredt er poolish-vinduet, og hvor ligger det ved DIN romtemperatur?
//
// Gjærmengden i poolishen endrer seg ikke med romtemperaturen — 0,79g enten
// kjøkkenet holder 18 eller 26 grader — og timeplanen setter av like mange
// timer uansett. Men appens egen Q10-modell sier at samme gjæring tar 19,5
// timer ved 18°C og 10 timer ved 26°C. På et varmt kjøkken står poolishen
// altså 4 timer for lenge etter planen, topper og faller sammen. Det er
// nettopp det som gjør deigen «nesten for slapp» — og det er temperaturen som
// gjør det, ikke hvor stor andel av melet som ligger i poolishen.
//
// Her endres ikke ett gram. Poenget er å si fra HVOR i tida du bør begynne å
// se etter, slik at deigen får bestemme og ikke klokka. Samme Q10-faktor som
// fermentLoadHours() bruker — én modell, ikke to som kan sprike.
//
// Returnerer null når den ikke har noe å tilføye: kald poolish (kjøleskapet
// gjør vinduet så bredt at en time fra eller til ikke betyr noe) og ved
// romtemperaturer der planen allerede stemmer.
function poolishWindowHours(){
  if(S.method!=='poolish' || S.poolishCold) return null;
  const f=Math.pow(Q10,((S.temp==null?22:S.temp)-Q10_REF_C)/10);
  const planlagt=S.poolishH;
  const ekte=planlagt/f;
  // Under en halvtimes forskjell er ikke verdt en setning.
  if(Math.abs(ekte-planlagt)<0.5) return null;
  return {planlagt, ekte:Math.round(ekte*2)/2, temp:S.temp, raskere:ekte<planlagt};
}
const Q10_K=14.85;
function stepTempC(loc){
  if(loc==='kjol') return (S.fridgeC==null?3:S.fridgeC);
  if(loc==='ovn') return null;   // steking er ikke gjæring
  return S.temp;                  // rom + benk
}
// Summerer over INTERVALLENE mellom steg, ikke over s.dur — flere steg har
// dur:0 og bærer tiden sin som avstand til neste steg (typisk «Ta ut av
// kjøleskap», der hele benketida ligger mellom det steget og stekingen).
function fermentLoadHours(steps){
  if(!steps||steps.length<2) return null;
  let load=0;
  for(let i=0;i<steps.length-1;i++){
    const T=stepTempC(steps[i].loc);
    if(T==null) continue;
    const a=steps[i].at,b=steps[i+1].at;
    if(!(a instanceof Date)||!(b instanceof Date)) continue;
    const h=(b.getTime()-a.getTime())/3600000;
    if(h<=0) continue;
    load+=h*Math.pow(Q10,(T-Q10_REF_C)/10);
  }
  return load>0?load:null;
}
// R() trenger belastningen, som trengs fra stegkjeden, som bygges med R() —
// derfor en vakt: under selve beregningen faller R() tilbake på den gamle
// tabellveien. Det er trygt fordi TIMINGEN i kjeden ikke avhenger av
// gjærmengden i det hele tatt; kun teksten gjør det, og den kastes her.
// Memoisert fordi R() kalles mange ganger per rendring (én gang per steg-tekst).
let _q10Busy=false,_q10Memo={k:null,v:null};
function currentFermentLoad(){
  if(_q10Busy) return null;
  const key=[S.method,S.type,S.cold,S.temp,S.fridgeC,S.poolishH,S.poolishPauseH,
             S.poolishCold,S.bigaH,S.kveldH,S.hurtigH,S.mode].join('|');
  if(_q10Memo.k===key) return _q10Memo.v;
  _q10Busy=true;
  let v=null;
  try{ v=fermentLoadHours(stepsForAnchor(new Date(2020,0,1,12,0))); }catch(e){ v=null; }
  finally{ _q10Busy=false; }
  _q10Memo={k:key,v:v};
  return v;
}
