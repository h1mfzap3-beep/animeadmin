# Handoff a következő AI-nak — Luna Anime Tracker állapotváltozás és kezelési szabályok

Dátum: 2026-08-16. Ez a dokumentum leírja, mi változott a projektben a legutóbbi két
commitban, és hogy hogyan kell ezeket kezelni, hogy a szinkronizálási hiba ne térjen vissza.

## Kiindulási állapot

- Repo: `h1mfzap3-beep/animeadmin` (privát), branch: `main`
- Aktuális HEAD: `a826254` — Add Discover home: Kumo/Grok/Apple-style landing view wired to real data
- Előzmény commit: `98f709f` — Luna Sync v6.0.0: single-source userscript with reliable queue/retry/failover sync
- **A GitHubon lévő `main` a kanonikus forrás.** Mielőtt bármit szerkesztesz, szinkronizáld
  vele a munkapéldányodat (clone/pull), és ne régebbi állapotból indulj.

## 1. Szinkronizálási rebuild (commit 98f709f)

### Mit változtat

- `public/Luna-Anime-Tracker.user.js` → **v6.0.0** userscript:
  - minden epizód-frissítés előbb perzisztens várakozási sorba kerül (`sync_queue_v6`,
    GM_setValue/localStorage), és csak utána indul a küldés — sikertelen POST esetén
    az adat nem veszik el;
  - 20 mp-enkénti automata újrapróbálás, elemenkénti exponenciális backoff (15 s → max 5 perc),
    azonnali próba `online` eseményre és fül-visszaváltásra;
  - szerver-failover: custom URL + `DEFAULT_CLOUD_SERVERS` sorban próbálva, az aktív szerver
    `active_server_v6` kulcsban megjegyezve;
  - minden esemény `eventId` (uuid), `clientTimestamp`, `deviceId`, `syncVersion` mezőkkel megy.
- `src/data/tampermonkeyScriptRaw.ts` → a userscript beágyazott TS-másolata
  (`TAMPERMONKEY_USERSCRIPT_CODE_RAW`). **Automatikusan generált, kézzel NEM szerkesztendő.**
- `src/data/tampermonkeyScript.ts` → változatlanul re-exportálja a fenti konstansot.
- `public/luna.user.js` → **törölve** (régi, eltérő másolat).
- `src/services/customSitesService.ts` → a `generateTampermonkeyUserscript()` függvény
  (v4.0.0-s, felhőbe sosem szinkronizáló generátor) **törölve** — ez volt a szinkronhiba gyökere.
- `src/components/MonitoredSitesManager.tsx` → a letöltés/másolás a
  `TAMPERMONKEY_USERSCRIPT_CODE`-ot adja ki (ugyanaz az egy forrás).
- `src/components/InstallGuide.tsx` → a telepítési link `/Luna-Anime-Tracker.user.js`-ra javítva.
- `server.ts` → a `/api/sync` route felújítva:
  - `isDuplicateEvent()`: eventId alapú duplikáció-szűrés (memóriában + per-dokumentum
    `lastSyncEventId`), a válasz `action: "duplicate"`;
  - `isStaleEvent()`: last-write-wins — a `lastClientTimestamp`-nél 5 s-nél régebbi bejövő
    esemény nem írja felül az újabbat, a válasz `action: "skipped_stale"`;
  - a dokumentumokba új mezők kerülnek: `lastSyncEventId`, `lastClientTimestamp`,
    `syncDeviceId`, `syncVersion`.
- `firestore.rules` és `firebase-applet-config.json` → **érintetlenek, ne is nyúlj hozzájuk.**

### Kezelési szabályok (betartandók)

1. A userscript forráskódja a projektben **pontosan egy helyen** létezhet:
   `src/data/tampermonkeyScriptRaw.ts`. Semmilyen komponensben NE generálj újabb másolatot
   vagy „okosabb” verziót a scriptből — pont ez okozta korábban a szétcsúszást.
2. Ha a userscript változik, a beágyazott másolatot generáld újra, ne kézzel írd át:
   a template-literál escape-sorrend: `\` → `\\`, majd `` ` `` → `` \` ``, majd `${` → `\${`.
   (Referencia generátor: a publikus `h1mfzap3-beep/anime` repo `sync-v6/build-raw-ts.js` fájlja.)
3. A `/api/sync` payload mezői visszafelé kompatzibilisek — a `title`, `episode`,
   `totalEpisodes`, `status`, `source`, `sourceUrl`, `origin`, `timestamp` mezőket NE nevezd át
   és NE vehesd el; az `eventId` / `clientTimestamp` / `deviceId` / `syncVersion` mezőket
   mindig küldje a kliens, különben megszakad az idempotencia és az ütközéskezelés.
4. A helyi valós idejű hírcsatorna-kontraktus változatlan: BroadcastChannel
   `luna_anime_realtime_channel`, localStorage `luna_realtime_anime_sync`,
   window.postMessage `LUNA_ANIME_PROGRESS` — a `cloudSyncService.ts`-hez ne nyúlj miatta.
5. A szerver új logikája csak deploy után él: a run.app környezeteken **redeploy kell**
   az új `server.ts`-tel. Addig a régi endpoint is működik (a payload kompatibilis),
   de duplikáció-szűrés és last-write-wins nélkül.

## 2. „Felfedezés” kezdőlap (commit a826254)

### Mit változtat

- `src/components/DiscoverHome.tsx` → **új** nézet, Grok/Apple-inspirált designnal:
  hero (legutóbb nézett cím), „Folytasd a nézést” sor valódi progress barral és +1 epizód
  gyorsgombbal, tervezett/befejezett sorok, műfajrács, Ctrl+K keresőpaletta, toast,
  nézetre korlátozott világos/sötét téma.
- `src/components/DashboardSidebar.tsx` → új `discover` tab (Compass ikon, „Felfedezés”)
  a navigáció elején; a `DashboardTab` típus kibővítve.
- `src/App.tsx` → alapértelmezett nézet `discover`; ehhez title/subtitle és render-ág.

Minden adat és akció a meglévő rétegeket használja: `subscribeToAnimeTracks` live-lista,
`incrementEpisode` a +1 gombhoz, `sourceUrl` megnyitás, `AnimeFormModal` szerkesztéshez.

### Kezelési szabályok

1. A `DiscoverHome` stílusa a `.luna-discover` scope-ba van zárva (osztályprefix: `ld-`).
   Új elemeket is ebben a scope-ban, `ld-` prefixszel adj hozzá — NE Tailwind utilities-szal
   keverd, és NE fogd meg a `--bg`, `--text` stb. változókat más komponensből.
2. A hitelesítés változatlan és zár: belépés előtt `AuthLoginScreen` (valódi
   `loginWithGoogle()` Firebase popup), kilépés a sidebarban. NE építs be külön email/jelszós
   beléptetést vagy mock authot ebbe a nézetbe.
3. Ha a „Felfedezés” ne legyen induláskor az alapértelmezett: `App.tsx`-ben a
   `useState<DashboardTab>('discover')` értékét lehet `'overview'`-re tenni — ennyi.

## Ellenőrzőlista bármilyen módosítás előtt/után

- `npx tsc --noEmit` → 0 hiba.
- `npx vite build` → hibátlan.
- Keresés a `src/`-ben: `generateTampermonkeyUserscript` → 0 találat; `luna.user.js` → 0 találat.
- `node --check public/Luna-Anime-Tracker.user.js` → érvényes JS.
- A `public/Luna-Anime-Tracker.user.js` és a `src/data/tampermonkeyScriptRaw.ts`-ből
  kiértékelt tartalom karakterre egyezik.

## Kapcsolódó publikus repo

A `h1mfzap3-beep/anime` (publikus) repo gyökerében szintén a v6.0.0 userscript áll
(`raw.githubusercontent.com/h1mfzap3-beep/anime/main/Luna-Anime-Tracker.user.js` él),
plusz egy `sync-v6/` mappa a generátorral és a régi integrációs prompttal. A két scriptnek
azonosnak kell maradnia — ha az egyik változik, a másikat is frissítsd.
