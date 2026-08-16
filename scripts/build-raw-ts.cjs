// Generálja a tampermonkeyScriptRaw.ts fájlt a userscriptből,
// és visszafejtéssel (round-trip) ellenőrzi, hogy a beágyazott
// másolat karakterre pontosan megegyezik az eredetivel.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const SRC = path.join(__dirname, '..', 'public', 'Luna-Anime-Tracker.user.js');
const OUT = path.join(__dirname, '..', 'src', 'data', 'tampermonkeyScriptRaw.ts');

const original = fs.readFileSync(SRC, 'utf8');

// Template literal escape sorrendje: 1) backslash, 2) backtick, 3) ${
const escaped = original
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const ts =
  '// AUTO-GENERATED from public/Luna-Anime-Tracker.user.js (v6.0.0) — NE SZERKESZD KÉZZEL!\n' +
  '// Ha a userscript változik, a build lépés generálja újra ezt a fájlt.\n' +
  'export const TAMPERMONKEY_USERSCRIPT_CODE_RAW = `' + escaped + '`;\n';

fs.writeFileSync(OUT, ts, 'utf8');

// Round-trip ellenőrzés: a TS template literal kiértékelése után visszakapjuk-e az eredetit
const m = ts.match(/^[\s\S]*?TAMPERMONKEY_USERSCRIPT_CODE_RAW = `([\s\S]*)`;\s*$/);
if (!m) throw new Error('Nem sikerült a template literal kivonása!');

const roundtrip = eval('`' + m[1] + '`');
if (roundtrip !== original) {
  const i = [...roundtrip].findIndex((c, idx) => c !== original[idx]);
  throw new Error('ROUND-TRIP ELTÉRÉS az első eltérő karakternél: ' + i);
}

const tmp = path.join(os.tmpdir(), 'luna-roundtrip-check.js');
fs.writeFileSync(tmp, roundtrip, 'utf8');
execFileSync(process.execPath, ['--check', tmp], { stdio: 'inherit' });
fs.unlinkSync(tmp);

console.log('OK: tampermonkeyScriptRaw.ts legenerálva (' + ts.length + ' karakter)');
console.log('OK: round-trip azonos az eredetivel (' + original.length + ' karakter)');
console.log('OK: kivont kód szintaktikailag érvényes JS');
