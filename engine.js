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

function R(){
  const m=S.mel,w=Math.round(m*S.hydro/100),sa=Math.round(m*BSALT[S.type]/100*10)/10,oi=Math.round(m*BOIL[S.type]/100),bu=Math.round(m*(BBUTTER[S.type]||0)/100),su=Math.round(m*effSugarPct()/100*10)/10,yd=Math.round(m*BYEAST[S.type]/100*((S.method==='hurtig'||S.method==='kveld'||S.type==='ingenelting')?1:coldMultForHours(S.cold)*prefermentYeastMult()*fridgeYeastMult())*100)/100,yf=Math.round(yd*3*10)/10;
  const ns=window._lang==='en'
    ?{napoletana:'Neapolitan pizza',newyork:'New York pizza',langpanne:'Sheet-pan pizza',chicago:'Chicago deep dish',ingenelting:'No-knead pizza'}
    :{napoletana:'Napoletansk pizza',newyork:'New York-pizza',langpanne:'Langpannepizza',chicago:'Chicago deep dish',ingenelting:'Ingen elting-pizza'};
  return{name:ns[S.type],flour:m,water:w,salt:sa,oil:oi,butter:bu,sugar:su,yDry:yd,yFresh:yf};
}
// Mania-poolish (oppkalt etter Pizzamania, som la ut oppskriften): egne faste
// prosenter fra kilden, uavhengig av S.type sine BSALT/BYEAST-tabeller — boka
// spesifiserer sin egen, komplette oppskrift (64% hydrering, poolish = 50% av
// mel/vann i 1:1-forhold), ikke en variant av appens øvrige pizzatyper.
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
    const mult=(KCOLDMULT[S.kveldH]||2.0)*fridgeYeastMult(); // F13: kveld kaldhever også
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
function pc(){
  // Langpanne/IngenElting: 0,7g deig per cm² formflate (standard focaccia-tommelfingerregel),
  // 30×40cm langpanne = 1200cm² => ca. 840g fyller én panne godt.
  const eg=S.type==='napoletana'?270:S.type==='newyork'?300:(S.type==='langpanne'||S.type==='ingenelting')?840:500;
  let td;
  if(S.method==='mania'){
    const rm=maniaRecipe();
    td=Math.round(rm.poolishMel+rm.poolishVann+rm.hovedMel+rm.vann1+rm.vann2+rm.salt+rm.poolishYd+rm.hovedYd);
  }else{
    const r=R();
    td=Math.round(r.flour+r.water+r.salt+r.oil+(r.butter||0)+(r.sugar||0));
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
const METHODS={
  // fridgeTemp (F13): metoden kaldhever med app-beregnet gjær → kjøleskaps-
  // temperatur-valget vises og kompenserer gjæren. Mania: false med vilje —
  // fast, publisert oppskrift fra kilden, gjæren skal ikke justeres.
  standard:{no:'Langtidsdeig',en:'Long-ferment dough',noShort:'Langtidsdeig',enShort:'Long-ferment',coldSlider:true, smartPlan:true, fridgeTemp:true},
  poolish: {no:'Poolish',     en:'Poolish',           noShort:'Poolish',     enShort:'Poolish',     coldSlider:true, smartPlan:true, fridgeTemp:true},
  biga:    {no:'Biga',        en:'Biga',              noShort:'Biga',        enShort:'Biga',        coldSlider:true, smartPlan:true, fridgeTemp:true},
  mania:   {no:'Mania-poolish',en:'Mania poolish',    noShort:'Mania',       enShort:'Mania',       coldSlider:false,smartPlan:true, fridgeTemp:false},
  hurtig:  {no:'Hurtigdeig',  en:'Quick dough',       noShort:'Hurtigdeig',  enShort:'Quick',       coldSlider:false,smartPlan:true, fridgeTemp:false},
  kveld:   {no:'Kveldsdeig',  en:'Evening dough',     noShort:'Kveldsdeig',  enShort:'Evening',     coldSlider:false,smartPlan:true, fridgeTemp:true},
  ingenelting:{no:'Ingen elting',en:'No-knead',       noShort:'Ingen elting',enShort:'No-knead',    coldSlider:false,smartPlan:false,fridgeTemp:false}
};
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
  const eg=S.type==='napoletana'?270:S.type==='newyork'?300:(S.type==='langpanne'||S.type==='ingenelting')?840:500;
  const frac=1+S.hydro/100+BSALT[S.type]/100+BOIL[S.type]/100+effSugarPct()/100;
  return Math.max(200,Math.round(n*eg/frac/10)*10);
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
const WINDOW_METHODS=[
  {m:'hurtig',   key:'hurtigH', vals:()=>HOPTS.map(o=>o.h)},
  {m:'kveld',    key:'kveldH',  vals:()=>KOPTS.map(o=>o.h)},
  {m:'standard', key:'cold',    vals:()=>{const a=[];for(let h=24;h<=COLD_MAX;h+=6)a.push(h);return a;}}
];
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
      S.method=def.m;
      let best=null,minSpan=null;
      for(const v of def.vals()){
        S[def.key]=v;
        let span=null;
        try{ span=planSpanMin(bakeAt); }catch(e){ continue; }
        if(span==null) continue;
        if(minSpan==null||span<minSpan) minSpan=span;
        if(span<=windowMin && (!best||span>best.span)) best={val:v,span};
      }
      out.push({method:def.m,key:def.key,best,minSpan});
    }
  } finally {
    S.method=saved.method;S.hurtigH=saved.hurtigH;S.kveldH=saved.kveldH;S.cold=saved.cold;S.mode=saved.mode;
  }
  out.sort((a,b)=>{
    if(a.best&&b.best) return b.best.span-a.best.span;   // mest gjæring først
    if(a.best) return -1;
    if(b.best) return 1;
    return (a.minSpan||0)-(b.minSpan||0);                 // «passer ikke»: nærmest først
  });
  return out;
}
