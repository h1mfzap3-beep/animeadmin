import { ExtensionFile } from '../types';
import { TAMPERMONKEY_USERSCRIPT_CODE } from './tampermonkeyScript';

export const CHROME_EXTENSION_FILES: ExtensionFile[] = [
  {
    name: 'Luna-Tracker.user.js',
    path: 'Luna-Tracker.user.js',
    language: 'javascript',
    description: '1-kattintásos Tampermonkey / Violentmonkey Userscript lebegő cyberpunk kezelőfelülettel.',
    content: TAMPERMONKEY_USERSCRIPT_CODE
  },
  {
    name: 'manifest.json',
    path: 'manifest.json',
    language: 'json',
    description: 'Chrome Manifest V3 definíció, jogosultságok és tartalom scriptek.',
    content: `{
  "manifest_version": 3,
  "name": "Luna - Anime Tracker",
  "version": "1.0.0",
  "description": "Automatikus anime epizódkövetés és felhőszinkronizáció MagyarAnime és OniAnime oldalakhoz.",
  "permissions": [
    "storage",
    "activeTab",
    "notifications"
  ],
  "host_permissions": [
    "*://*.magyaranime.hu/*",
    "*://*.onianime.hu/*",
    "*://*.indavideo.hu/*",
    "*://*.videa.hu/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.magyaranime.hu/*",
        "*://*.onianime.hu/*"
      ],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`
  },
  {
    name: 'content.js',
    path: 'content.js',
    language: 'javascript',
    description: 'DOM elemző és videó lejátszó figyelő szkript a MagyarAnime és OniAnime oldalakon.',
    content: `/**
 * Luna Anime Tracker - Content Script
 * Automatikus epizód és cím detektálás MagyarAnime & OniAnime oldalakon
 */

(function () {
  console.log("%c[Luna Anime Tracker]%c Figyelő modul betöltve!", "color: #06b6d4; font-weight: bold;", "color: inherit;");

  function parseAnimeDetails() {
    const host = window.location.hostname;
    let title = "";
    let episode = 1;
    let source = "Egyéb";

    if (host.includes("magyaranime.hu")) {
      source = "MagyarAnime";
      // MagyarAnime cím és epizód kinyerése
      const titleElem = document.querySelector(".anime-title, h1.entry-title, .breadcrumb-item.active, h1");
      if (titleElem) {
        title = titleElem.innerText.replace(/\\s+/g, " ").trim();
      }

      // Epizód sorszám felismerése az URL-ből vagy a címből
      const epMatch = window.location.pathname.match(/(\\d+)-resz|resz-(\\d+)|ep-(\\d+)/i) || 
                      title.match(/(\\d+)\\.\\s*rész/i);
      if (epMatch) {
        episode = parseInt(epMatch[1] || epMatch[2] || epMatch[3], 10);
      }
    } else if (host.includes("onianime.hu")) {
      source = "OniAnime";
      const h1Elem = document.querySelector("h1, .video-title, .anime-header-title");
      if (h1Elem) {
        title = h1Elem.innerText.replace(/\\s+/g, " ").trim();
      }

      const epMatch = window.location.href.match(/ep=(\\d+)|resz=(\\d+)|\\/(\\d+)\\.resz/i) || 
                      title.match(/(\\d+)\\.\\s*epizód/i);
      if (epMatch) {
        episode = parseInt(epMatch[1] || epMatch[2] || epMatch[3], 10);
      }
    }

    // Tisztított cím
    title = title.replace(/(\\d+)\\.\\s*(rész|epizód).*$/i, "").trim();

    return {
      title: title || document.title.split("-")[0].trim(),
      episode: isNaN(episode) ? 1 : episode,
      source: source,
      sourceUrl: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  // Videó indítás érzékelése
  function monitorVideoPlayer() {
    const video = document.querySelector("video");
    const iframes = document.querySelectorAll("iframe");

    const trackCurrentView = () => {
      const data = parseAnimeDetails();
      if (data.title) {
        chrome.runtime.sendMessage({
          action: "SYNC_EPISODE",
          payload: data
        });
        console.log("[Luna] Sikeresen szinkronizálva:", data);
      }
    };

    if (video) {
      video.addEventListener("play", trackCurrentView, { once: true });
    }

    // Automatikus futtatás oldal betöltéskor
    setTimeout(trackCurrentView, 2500);
  }

  window.addEventListener("load", monitorVideoPlayer);
})();`
  },
  {
    name: 'background.js',
    path: 'background.js',
    language: 'javascript',
    description: 'Background Service Worker: Helyi tárolás és Firebase API szinkronizáció.',
    content: `/**
 * Luna Anime Tracker - Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Luna Anime Tracker telepítve és készen áll!");
});

// Üzenetek fogadása a tartalom szkriptből
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SYNC_EPISODE") {
    const anime = request.payload;

    // Helyi mentés Chrome Storage-ba
    chrome.storage.local.get(["trackedAnimes"], (result) => {
      let list = result.trackedAnimes || [];
      const index = list.findIndex(item => item.title.toLowerCase() === anime.title.toLowerCase());

      if (index !== -1) {
        list[index].episode = Math.max(list[index].episode, anime.episode);
        list[index].updatedAt = anime.timestamp;
        list[index].sourceUrl = anime.sourceUrl;
      } else {
        list.unshift({
          ...anime,
          status: "watching",
          updatedAt: anime.timestamp
        });
      }

      chrome.storage.local.set({ trackedAnimes: list }, () => {
        console.log("Luna: Helyi mentés frissítve.");
      });
    });

    // Badge értesítés beállítása
    chrome.action.setBadgeText({ text: anime.episode.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#06b6d4" });

    sendResponse({ status: "OK", received: anime.title });
  }
  return true;
});`
  },
  {
    name: 'popup.html',
    path: 'popup.html',
    language: 'html',
    description: 'A bővítmény felugró (Popup) felhasználói felületének HTML kódja.',
    content: `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <title>Luna - Anime Tracker</title>
</head>
<body>
  <div class="header">
    <div class="logo">
      <span class="icon">🌙</span>
      <span class="title">Luna</span>
    </div>
    <span class="badge">v1.0.0</span>
  </div>

  <div class="active-card" id="activeCard">
    <div class="pulse-indicator">
      <span class="dot"></span>
      <span id="sourceLabel">MagyarAnime detektálva</span>
    </div>
    <h3 id="currentTitle">Solo Leveling S2</h3>
    <div class="ep-control">
      <span>Epizód: <b id="currentEp">18</b></span>
      <button id="quickPlusBtn">+1 Rész</button>
    </div>
  </div>

  <div class="list-section">
    <h4>Legutóbb Követett Animék</h4>
    <div class="anime-list" id="animeList">
      <!-- Dinamikusan betöltött elemek -->
    </div>
  </div>

  <div class="footer">
    <a href="#" id="openDashboardBtn" class="primary-btn">Web Irányítópult Megnyitása ↗</a>
  </div>

  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    name: 'styles.css',
    path: 'styles.css',
    language: 'css',
    description: 'A popup ablak cyberpunk témájú CSS stíluslapja.',
    content: `body {
  width: 320px;
  margin: 0;
  padding: 14px;
  background-color: #07070d;
  color: #f1f5f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 16px;
  color: #06b6d4;
}

.badge {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 2px 6px;
  border-radius: 9999px;
  font-size: 10px;
}

.active-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
}

.pulse-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #a855f7;
  margin-bottom: 6px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #06b6d4;
  border-radius: 50%;
  box-shadow: 0 0 8px #06b6d4;
}

.ep-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.ep-control button {
  background: #06b6d4;
  color: #07070d;
  border: none;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.primary-btn {
  display: block;
  text-align: center;
  background: linear-gradient(135deg, #06b6d4, #a855f7);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
  padding: 8px;
  border-radius: 8px;
}`
  }
];
