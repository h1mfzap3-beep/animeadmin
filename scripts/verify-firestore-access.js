#!/usr/bin/env node
/**
 * Luna Anime Tracker — Firestore hozzáférés ellenőrző (Node 18+, függőség nélkül).
 *
 * A megszigorított firestore.rules publikálása UTÁN futtasd:
 *   node scripts/verify-firestore-access.js
 *
 * Pontosan azt az utat teszteli, amit a v6.1.1 userscript használ:
 *   1) LIST   — kollekció olvasása API-kulccsal (a cím->docId párosításhoz)
 *   2) PATCH  — teszt dokumentum upsert updateMask-kal (a szinkronírás)
 *   3) GET    — visszaolvasás
 *   4) DELETE — teszt dokumentum törlése (a szabály szerint csak admin
 *               tudja — ez a lépés ezért ELVÁRÁS a 403, ez bizonyítja,
 *               hogy a névtelen törlés tényleg zárva van)
 *
 * Kilépési kód 0, ha minden a várt módon alakult.
 */

const FIRESTORE_CONFIG = {
  projectId: 'gen-lang-client-0003317395',
  databaseId: 'ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97',
  apiKey: 'AIzaSyBT6F3vhAO_P-wb_PosgULeT-D-zwR0Mjo'
};

const ROOT = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_CONFIG.projectId}` +
  `/databases/${encodeURIComponent(FIRESTORE_CONFIG.databaseId)}/documents`;

const TEST_DOC_ID = 'luna_connection_test_' + Date.now();

function typed(v) {
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  return { stringValue: String(v) };
}

async function call(method, path, body) {
  const res = await fetch(ROOT + path + (path.includes('?') ? '&' : '?') + 'key=' + FIRESTORE_CONFIG.apiKey, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, ok: res.ok, data };
}

function report(name, pass, detail) {
  console.log((pass ? '  PASS' : '  FAIL') + '  ' + name + (detail ? ' — ' + detail : ''));
  return pass;
}

async function main() {
  let allOk = true;

  console.log('1) LIST — kollekció olvasása API-kulccsal:');
  const list = await call('GET', '/anime_tracks?pageSize=3');
  allOk = report('lista olvasása', list.ok, 'HTTP ' + list.status + (list.ok ? ', dok. szám (max 3): ' + ((list.data && list.data.documents) || []).length : ' — ' + (list.data && list.data.error && list.data.error.status))) && allOk;

  console.log('2) PATCH — teszt upsert (a userscript szinkronírása):');
  const fields = {
    id: TEST_DOC_ID,
    title: 'Luna Connection Test',
    episode: 1,
    status: 'watching',
    source: 'verify-script',
    updatedAt: new Date().toISOString(),
    syncedFromExtension: true,
    lastClientTimestamp: Date.now()
  };
  const mask = Object.keys(fields).map(n => '&updateMask.fieldPaths=' + encodeURIComponent(n)).join('');
  const patch = await call('PATCH', '/anime_tracks/' + encodeURIComponent(TEST_DOC_ID) + mask, { fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typed(v)])) });
  allOk = report('írás', patch.ok, 'HTTP ' + patch.status + (patch.ok ? '' : ' — ' + (patch.data && patch.data.error && patch.data.error.status))) && allOk;

  console.log('3) GET — visszaolvasás:');
  const got = await call('GET', '/anime_tracks/' + encodeURIComponent(TEST_DOC_ID));
  allOk = report('visszaolvasás', got.ok && got.data && got.data.fields && got.data.fields.title.stringValue === 'Luna Connection Test', 'HTTP ' + got.status) && allOk;

  console.log('4) DELETE — névtelen törlésnek ZÁRVA kell lennie:');
  const del = await call('DELETE', '/anime_tracks/' + encodeURIComponent(TEST_DOC_ID));
  allOk = report('névtelen törlés elutasítva', del.status === 403, 'HTTP ' + del.status + ' (várt: 403)') && allOk;

  if (del.status !== 403) {
    // ha mégis sikerült volna törölni, az szabály-hiba — de legalább takarítottunk
    console.log('     FIGYELEM: a törlés engedélyezett — a szabály NEM a v6.1.1-es!');
  }

  console.log(allOk ? '\n>>> RENDBEN: a direct-Firestore szinkronút működik.' : '\n>>> HIBA: valamelyi lépés nem a várt — ellenőrizd a szabály publikálását.');
  process.exit(allOk ? 0 : 1);
}

main().catch(e => { console.error('Váratlan hiba:', e.message); process.exit(1); });
