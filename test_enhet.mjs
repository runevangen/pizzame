// Gruppe 0 (v0.832): enhetslaget for motoren. Kjøres i node på millisekunder,
// FØR nettleseren bootes — test_regression.py starter her og stopper porten
// hvis matematikken svikter, med funksjonsnavn i feilmeldingen i stedet for
// et scenario. Laget tester KUN engine.js sine rene funksjoner; alt som
// krever DOM eller stegkjeder testes videre i nettleserlaget. Kan også
// kjøres alene: `node test_enhet.mjs`.
//
// engine.js leser globalene sine ved KALL, ikke ved lasting — derfor holder
// det å stubbe window/L/S og de få tabellene funksjonene under faktisk rører.
import { readFileSync } from 'node:fs';

globalThis.window = { _lang: 'no' };
globalThis.L = (a, b) => (globalThis.window._lang === 'en' ? b : a);
globalThis.S = {};
globalThis.BSUGAR = { newyork: 2 };

const src = readFileSync(new URL('./engine.js', import.meta.url), 'utf8');
const eng = new Function(src + `;return { interpLin, coldMultForHours, tf, rtM,
  fridgeYeastMult, prefermentShareScale, gjaerStyrke, stepTempC,
  fermentLoadHours, poolishWindowHours, mN, mNVariant, totalFermentHours,
  effSugarPct, CALIBRATION, Q10, Q10_REF_C, Q10_K };`)();

let ok = 0; const feil = [];
function t(navn, sann) {
  if (sann) { ok++; } else { feil.push(navn); }
}
const naer = (a, b, eps = 0.01) => Math.abs(a - b) < eps;

// interpLin — den ENE interpolatoren (F18). Kurveverdiene er valgt ULIKE
// funksjonens nødutgang (return 1.0), ellers kunne en fjernet klamping
// passere fordi fasit og nødutgang tilfeldigvis var samme tall — nettopp
// det skjedde i første utkast av denne fila, fanget av mutasjonsrunden.
t('interpLin: klampes under laveste punkt', eng.interpLin([[10, 4], [20, 8]], 5) === 4);
t('interpLin: klampes over høyeste punkt', eng.interpLin([[10, 4], [20, 8]], 99) === 8);
t('interpLin: treffer eksakt punkt', eng.interpLin([[10, 4], [20, 8]], 20) === 8);
t('interpLin: midtpunkt', eng.interpLin([[10, 4], [20, 8]], 15) === 6);
t('interpLin: 3 desimaler som standard', eng.interpLin([[0, 0], [3, 1]], 1) === 0.333);
t('interpLin: dec=2 gir 2 desimaler', eng.interpLin([[0, 0], [3, 1]], 1, 2) === 0.33);

// Kalibreringskurvene, lest gjennom sine oppslagsfunksjoner
t('coldMult: 24t-referansen', eng.coldMultForHours(24) === 1.5);
t('coldMult: 48t-punktet', eng.coldMultForHours(48) === 1.05);
t('coldMult: interpolerer mellom punkter', eng.coldMultForHours(36) === 1.275);
t('coldMult: klampes ved 144t+', eng.coldMultForHours(200) === 0.38);
S.temp = 22; t('tf: 22°C er 1,0-referansen', eng.tf() === 1.0);
S.temp = 18; t('tf: 18°C gir 1,6', eng.tf() === 1.6);
S.temp = 27; t('tf: interpolerer (27°C)', eng.tf() === 0.57);
S.temp = 22; t('rtM: 60 min ved referansen er 60', eng.rtM(60) === 60);
S.temp = 18; t('rtM: skalerer og runder', eng.rtM(60) === 96);

// F13: kjøleskapstemperatur-kompensasjonen
S.fridgeC = 3; t('fridgeMult: 3°C er 1,0', eng.fridgeYeastMult() === 1.0);
S.fridgeC = 1; t('fridgeMult: kaldt skap gir mer gjær', eng.fridgeYeastMult() === 1.3);
S.fridgeC = 7; t('fridgeMult: varmt skap gir mindre', eng.fridgeYeastMult() === 0.65);
S.fridgeC = null; t('fridgeMult: null faller til 3°C', eng.fridgeYeastMult() === 1.0);

// v0.787: poolish-andelens skalering av kurveavviket
S.poolishAndel = 0.5; t('andel: 50% er identitet', eng.prefermentShareScale(1.2) === 1.2);
S.poolishAndel = 0.3; t('andel: 30% skalerer avviket ned', eng.prefermentShareScale(1.2) === 1.12);
t('andel: 30% løfter lave multiplikatorer', eng.prefermentShareScale(0.5) === 0.7);
S.poolishAndel = 0.5;

// v0.817: gjærens tilstand
S.gjaerTilstand = 'fersk'; t('styrke: fersk er 1', eng.gjaerStyrke() === 1);
S.gjaerTilstand = 'nylig'; t('styrke: nylig åpnet 0,85', eng.gjaerStyrke() === 0.85);
S.gjaerTilstand = 'lenge'; t('styrke: lenge åpnet 0,7', eng.gjaerStyrke() === 0.7);
S.gjaerTilstand = 'egen'; S.gjaerStyrkePct = 60; t('styrke: egen måling 60%', eng.gjaerStyrke() === 0.6);
S.gjaerStyrkePct = 5; t('styrke: utenfor 10–100 ignoreres', eng.gjaerStyrke() === 1);
S.gjaerStyrkePct = 'abc'; t('styrke: søppel ignoreres', eng.gjaerStyrke() === 1);
S.gjaerTilstand = 'fersk';

// F23: Q10-integralet — konstantene er kalibrert mot uttestede referansepunkt
t('Q10: konstanten er 2,3', eng.Q10 === 2.3);
t('Q10: referansen er 22°C', eng.Q10_REF_C === 22);
t('Q10: K er 14,85', eng.Q10_K === 14.85);
S.temp = 22; S.fridgeC = 3;
t('stepTempC: rom leser romtemp', eng.stepTempC('rom') === 22);
t('stepTempC: kjol leser skapet', eng.stepTempC('kjol') === 3);
t('stepTempC: ovn teller ikke', eng.stepTempC('ovn') === null);
const t0 = new Date(2027, 0, 1, 12, 0);
const h = n => new Date(t0.getTime() + n * 3600000);
t('last: under to steg gir null', eng.fermentLoadHours([{ loc: 'rom', at: t0 }]) === null);
t('last: 10t rom ved 22° er 10 ekvivalenttimer',
  eng.fermentLoadHours([{ loc: 'rom', at: t0 }, { loc: 'ovn', at: h(10) }]) === 10);
t('last: 10t kjøleskap ved 3° er ~2,06',
  naer(eng.fermentLoadHours([{ loc: 'kjol', at: t0 }, { loc: 'ovn', at: h(10) }]), 2.055));
t('last: ovn-intervall hopper over, tellingen fortsetter etterpå',
  naer(eng.fermentLoadHours([{ loc: 'rom', at: t0 }, { loc: 'ovn', at: h(2) },
                             { loc: 'rom', at: h(3) }, { loc: 'ovn', at: h(4) }]), 3));

// v0.752: poolish-vinduet bruker samme Q10-faktor
S.method = 'standard'; t('vindu: taus utenfor poolish', eng.poolishWindowHours() === null);
S.method = 'poolish'; S.poolishCold = true; t('vindu: taus for kald poolish', eng.poolishWindowHours() === null);
S.poolishCold = false; S.poolishH = 14; S.temp = 22;
t('vindu: taus når planen alt stemmer', eng.poolishWindowHours() === null);
S.temp = 18;
{ const v = eng.poolishWindowHours();
  t('vindu: 18° gjør 14t reelt til 19,5t', !!v && v.ekte === 19.5 && v.raskere === false); }
S.temp = 26;
{ const v = eng.poolishWindowHours();
  t('vindu: 26° gjør 14t reelt til 10t', !!v && v.ekte === 10 && v.raskere === true); }
S.temp = 22;

// v0.823: navneregisteret er den ene dommeren
t('navn: mN leser registeret', eng.mN('standard') === 'Langtidsdeig');
window._lang = 'en'; t('navn: engelsk variant', eng.mN('kveld') === 'Evening dough'); window._lang = 'no';
S.kaldBulk = true; t('navn: varianten kald bulk', eng.mNVariant('standard') === 'Langtidsdeig (kald bulk)');
S.kaldBulk = false; t('navn: uten variant faller til mN', eng.mNVariant('standard') === 'Langtidsdeig');

// Gjæringstimer og sukkerregelen
S.type = 'napoletana'; S.method = 'hurtig'; S.hurtigH = 8; t('total: hurtig er valgt timetall', eng.totalFermentHours() === 8);
S.method = 'kveld'; S.kveldH = 18; t('total: kveld er kaldtimene', eng.totalFermentHours() === 18);
S.method = 'standard'; S.cold = 48; S.temp = 22; t('total: standard er kaldtid + overhead', eng.totalFermentHours() === 49);
S.type = 'newyork'; S.oven = 'pizza'; t('sukker: droppes i pizzaovn', eng.effSugarPct() === 0);
S.oven = 'vanlig'; t('sukker: beholdes i vanlig ovn', eng.effSugarPct() === 2);

if (feil.length) {
  console.log(`Enhetslag: ${ok} OK, ${feil.length} FEILET:`);
  feil.forEach(n => console.log(`  ❌ ${n}`));
  process.exit(1);
}
console.log(`Enhetslag: alle ${ok} tester OK (node, engine.js).`);
