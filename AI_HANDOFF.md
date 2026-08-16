# Handoff a következő AI-nak — Luna Anime Tracker állapotváltozás és kezelési szabályok

Dátum: 2026-08-16 (v6.1.1 frissítés). Ez a dokumentum leírja, mi változott a projektben,
mit kell még megtenni, és hogy hogyan kell ezeket kezelni, hogy a szinkronizálási hiba
ne térjen vissza.

## Kiindulási állapot

- Repo: `h1mfzap3-beep/animeadmin` (privát), branch: `main`
- **A GitHubon lévő `main` a kanonikus forrás.** Mielőtt bármit szerkesztesz, szinkronizáld
  vele a munkapéldányodat (clone/pull), és ne régebbi állapotból indulj.

## AZONNALI TEENDŐK — amit a TULAJDONOSNAK kell megtennie (2026-08-16-ig meg nem történt)

A kód kész és GitHubon van, de a lenti két lépés nélkül **semmi nem fog működni**,
mert az élő Firestore szabály még mindig mindent letilt:

1. **Firestore szabály publikálása** (kb. 2 perc, csak a tulaj Google-fiókjával mehet):
   - Nyisd meg: `console.firebase.google.com` → projekt `gen-lang-client-0003317395`
   - **Firestore Database** → felül az adatbázis-választóban válaszd ki az
     `ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97` nevű adatbázist
     (fontos: NE az alapértelmezettet)
   - **Rules** fül → a repo gyökerében lévő `firestore.rules` (a megszigorított v6.1.1-es
     változat!) teljes tartalmát illeszd be → **Publish**
   - Ellenőrzés: a Rules fülön a közzétett szabályban szerepeljen a
     `hasOnly(syncManagedKeys())` és az `allow delete: if isSuperAdmin();`
2. **Userscript frissítése v6.1.1-re**: nyisd meg
   `https://raw.githubusercontent.com/h1mfzap3-beep/anime/main/Luna-Anime-Tracker.user.js`
   → Tampermonkey felajánlja a frissítést (6.0.0 → 6.1.1).
3. **Működés-ellenőrzés** (szabály publish után):
   - nyiss egy támogatott anime oldalt és indíts egy epizódot → a HUD-ban
     „✓ Felhőbe mentve" felirat jelenik meg,
   - a weboldal listája (bejelentkezve) másodperceken belül frissül — szerver NEM kell hozzá,
   - ha a HUD „⏳ N szinkron várakozik" állapotban ragad, a szabály nem publikálásra
     (a böngésző konzoljában `PERMISSION_DENIED` látszik).

## TEENDŐK A KÖVETKEZŐ AI-NAK — Firebase mint fő központ, Drive/Dropbox mint tükör

A cél: a Firestore `anime_tracks` kollekció legyen az **egyetlen igazságforrás** (ma már
minden UI nézet és a userscript is ide ír/olvas), a Google Drive és a Dropbox pedig NE
önálló adatútvonal, hanem a Firestore **automatikus tükre** legyen. Ma minden mentés
kézi gombnyomásos — ezt kell automatizálni.

### Jelenlegi állapot (amire épülj)

- `src/services/googleDriveService.ts`: Google OAuth a Drive-hoz
  (`signInWithGoogleDrive`, `getDriveAccessToken`/`setDriveAccessToken`,
  `uploadBackupToGoogleDrive`, `listGoogleDriveBackups`,
  `downloadBackupContentFromDrive`).
- `src/services/cloudSyncService.ts`: `generateBackupBundle(tracks, provider)`,
  `syncToGoogleDrive(tracks, token?)`, `syncToDropbox(tracks, token)`,
  `restoreFromDropbox(token)`, `getSavedDropboxToken`/`saveDropboxToken`,
  `downloadBackupFile`.
- `src/components/CloudSyncManager.tsx`: kézi Backup/Restore UI; a restore már a jó
  úton megy: `importAnimeTracks(bundle.tracks, 'merge' | 'replace')` → Firestore.
- `src/services/firestoreService.ts`: `subscribeToAnimeTracks` (élő lista),
  `importAnimeTracks` (merge/replace visszaírás Firestore-ba).
- `App.tsx` a `tracks` állapotot már a Firestore élő előfizetésből tartja — ez a
  backup forrása, tehát a mentés definíció szerint mindig a Firestore-állapotot tükrözi.

### Implementálandó: automata tükörzés (auto-backup)

Új fájl: `src/services/autoBackupService.ts`, bekötve az `App.tsx`-be (admin bejelentkezés
esetén):

1. **Trigger — időzítve**: 24 óránként ellenőrizze, hogy van-e mentett Drive token
   (`getDriveAccessToken()`) vagy Dropbox token (`getSavedDropboxToken()`); ha van,
   futtassa a mentést a **current `tracks`** (Firestore-live) állapotból.
2. **Trigger — változásra** (opcionális): X (pl. 10) nyomon követett változás után
   5 perces debounce-val szintén mentsen (ne minden epizódnál spam-eljen).
3. **Metadata**: `lastAutoBackupAt`, `lastAutoBackupProvider`, `lastAutoBackupCount` —
   tárolva Firestore `app_metadata/auto_backup` dokumentumban (a központ saját magát
   könyvelje; `setDoc(..., {merge:true})`), localStorage fallbackként.
4. **Hibakezelés**: lejárt/hiányzó token → csak toast + státusz a CloudSyncManager
   UI-ban („Drive újracsatlakoztatása szükséges"), soha nem dobódjon a hiba a fő
   adatfolyamba; a következő ciklus újrapróbálja.
5. **Restore maradjon explicit** (gomb), és a meglévő `importAnimeTracks(..., 'merge')`
   útvonalon fusson. Ütközésnél a Firestore-ban lévő újabb állapot nyer
   (`lastClientTimestamp` / `updatedAt` alapján) — a restore soha ne írhassa felül
   frissebb Firestore-adatot régebbi mentéssel automatikusan.

### Tiltások (hogy a rendszer ne csússzon vissza több forrásra)

- NE legyen külön „felhő-only" adatútvonal: minden írás Firestore-ba megy,
  a Drive/Dropbox csak olvasható tükör mentési időpontig.
- NE duplikált tracks-állapot: egyetlen forrás (`tracks` a live-előfizetésből).
- NE tárolj hozzáférési tokent Firestore-ban — csak localStorage-ban, ahogy most is.

### Távoli jövő (csak ha kérik)

- Firebase **App Check** bekapcsolása a névtelen írás visszaélések ellen (a userscript-et
  is fel kell rá készíteni, ezért most kimaradt).


## 0. Luna Sync v6.1 — KÖZVETLEN FIRESTORE ÍRÁS (legfrissebb változás)

A userscript `@version 6.1.0`-ra frissült. Az új elsődleges szinkronútvonal:

1. A script a `firestore.googleapis.com` REST API-ra ír **közvetlenül** (GET kollekció →
   cím alapján docId-párosítás → PATCH upsert `updateMask`-kal), a
   `FIRESTORE_CONFIG`-ban megadott projektben (`gen-lang-client-0003317395`, database
   `ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97`).
2. A weboldalnak **nem kell hozzá semmi** — a `subscribeToAnimeTracks` onSnapshot
   előfizetés azonnal megkapja a REST írásokkal bekikerült állapotot.
3. A régi `/api/sync` Express szerverek csak **tartalékútvonalként** maradtak bent
   (`sendViaServers`): ha a Firestore írás nem ack, arra esik vissza.
4. A last-write-wins kliens oldalon is megvan: a script a meglévő dokumentum
   `lastClientTimestamp` mezőjével hasonlítja össze a bejövő eseményt (5 s tolerancia).

### KRITIKUS: a Firestore szabályokat telepíteni kell

Az élő Firestore rules jelenleg **minden hitelesítetlen hozzáférést letilt**
(PERMISSION_DENIED), ezért nem connectelt korábban semmi. A repo gyökerében lévő
`firestore.rules` tartalmazza a telepítendő szabályt. **Ezt deployolni kell** Firebase
Consoleban: Firestore Database → (adatbázis-választóban az `ai-studio-lunaanimetracker-…`
nevű DB) → Rules → a repobeli tartalom beillesztése → Publish. Alternatíva:
`firebase deploy --only firestore:rules`. Deploy után a v6.1+ script azonnal működik,
szerver nélkül.

### Biztonsági modell (a megszigorított szabály, v6.1.1 óta)

A web API-kulcs NEM titok (a Firebase web konfigból úgyis publikus — a védelmet a
rules adja, nem a kulcs elrejtése). A szabály a következőket garantálja:

- **Törlés**: kizárólag a tulaj (`h1mfzap3@gmail.com`, bejelentkezve, ellenőrzött
  email). A userscript sosem töröl — a „bárki letörölhet mindent" kockázat megszűnt.
- **Névtelen frissítés** (`anime_tracks`): csak a szinkron által kezelt mezőkre
  terjedhet ki (`diff().affectedKeys().hasOnly(syncManagedKeys())`) — a `userId`,
  `userEmail` és a többi belső mező csak adminnak módosítható.
- **Last-write-wins szabály-szinten is**: a bejövő `lastClientTimestamp` nem lehet
  5 s-nál régebbi a tároltnál — egy régi/rogue esemény nem írhatja vissza az állapotot.
- **Státusz-fehérlista** (`watching`/`completed`/`on_hold`/`plan_to_watch`/`planned`/
  `dropped`), mezőhossz- és epizódszám-limitek, URL-hossz limitek.
- `custom_sites`: névtelen írás teljesen tiltva (olvasás publikus maradt).
- Bejelentkezett tulaj (`isSuperAdmin()`) teljes jogkörrel ír — a weboldal összes
  meglévő funkciója (szerkesztés, törlés, import) változatlanul működik.
- A userscript v6.1.1 ezt kezeli: ha a szabály visszautasítja az írást, frissen
  leellenőrzi a tárolt időbélyeget, és a valóban elavult eseményt eldobja
  (`skipped_stale`) ahelyett, hogy végtelenül újraküldené.

Ismert maradó kitettség: publikus olvasás + névtelen, korlátozott írás azt jelenti,
hogy aki megtalálja a projektet, zaj-animeket vehet fel (mező-limiteken belül).
Erre a szabályok rétegén felüli megoldás a Firebase **App Check** — ha ez valaha
problémává válik, érdemes bekapcsolni (a userscript-et is fel kell akkor készíteni rá).

A `config.ts` / `server.ts` fallback API-kulcsa és a `firebase-applet-config.json`
kulcsa: `AIzaSyBT6F3vhAO_P-wb_PosgULeT-D-zwR0Mjo` (a `-D-` karakter a helyes — van
egy hosszú `-T-`-s elírt változat keringősen, az NEM érvényes az Identity Toolkithez).

Megjegyzés: a projektben az anonymous auth le van tiltva (ADMIN_ONLY_OPERATION),
ezért nem elégszer token nélkül írni — a nyitott `anime_tracks` szabály a megoldás,
pontosan úgy, ahogy a régi Express szerver is korlátlanul fogadta a POST-okat.

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
