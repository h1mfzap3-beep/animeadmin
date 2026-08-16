import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Play, Pencil, ChevronUp } from 'lucide-react';
import { AnimeTrack, WatchStatus } from '../types';
import { DashboardTab } from './DashboardSidebar';
import { incrementEpisode } from '../services/firestoreService';

/* ============================================================
 * Kumo / Grok / Apple inspirálta "Felfedezés" kezdőlap.
 * A teljes stílus a .luna-discover scope-ba van zárva, hogy ne
 * ütközzön a dashboard többi részének Tailwind stílusával.
 * ============================================================ */

const DISCOVER_CSS = `
.luna-discover {
  --bg: #070708;
  --bg-elev: #101012;
  --bg-soft: #161618;
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(255, 255, 255, 0.14);
  --text: #f5f5f7;
  --muted: #86868b;
  --faint: #636366;
  --accent: #ff375f;
  --accent-2: #bf5af2;
  --ok: #30d158;
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: 70vh;
  border-radius: 28px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif;
  letter-spacing: -0.011em;
  overflow: clip;
  position: relative;
}
.luna-discover[data-theme="light"] {
  --bg: #f5f5f7;
  --bg-elev: #ffffff;
  --bg-soft: #ececef;
  --line: rgba(0, 0, 0, 0.08);
  --line-strong: rgba(0, 0, 0, 0.12);
  --text: #1d1d1f;
  --muted: #6e6e73;
  --faint: #8e8e93;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.08);
}
.luna-discover * { box-sizing: border-box; }
.luna-discover button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
.luna-discover img { display: block; width: 100%; height: 100%; object-fit: cover; }
.luna-discover ::selection { background: rgba(255, 55, 95, 0.28); }

.ld-inner { padding: 22px 24px 40px; }

.ld-topbar {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 22px;
}
.ld-search-trigger {
  flex: 1;
  display: flex; align-items: center; gap: 10px;
  max-width: 520px;
  padding: 11px 14px;
  border-radius: 14px;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  color: var(--muted);
  text-align: left;
  font-size: 14px;
  transition: 0.25s var(--ease);
}
.ld-search-trigger:hover { border-color: var(--line-strong); }
.ld-kbd {
  margin-left: auto;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid var(--line);
  color: var(--faint);
}
.ld-top-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.ld-icon-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: grid; place-items: center;
  color: var(--muted);
  transition: 0.25s var(--ease);
}
.ld-icon-btn:hover { background: var(--bg-soft); color: var(--text); }
.ld-add-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--text);
  color: var(--bg);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex; align-items: center; gap: 7px;
}

.ld-hero {
  position: relative;
  height: min(52vh, 480px);
  min-height: 340px;
  border-radius: 22px;
  overflow: hidden;
  isolation: isolate;
  background: #111;
}
.ld-hero-media { position: absolute; inset: 0; }
.ld-hero-media img { transform: scale(1.04); filter: saturate(1.05); }
.ld-hero-media.ld-hero-empty {
  background: linear-gradient(145deg, #1c1c1e, #0a0a0b);
}
.ld-hero::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.1) 100%);
}
.luna-discover[data-theme="light"] .ld-hero::after {
  background: linear-gradient(90deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.24) 55%, rgba(0,0,0,0.08) 100%);
}
.ld-hero-copy {
  position: relative; z-index: 1;
  max-width: 560px;
  padding: 44px 40px;
  display: flex; flex-direction: column; justify-content: flex-end;
  height: 100%;
}
.ld-eyebrow {
  font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}
.ld-hero h2 {
  font-size: clamp(32px, 4.4vw, 52px);
  line-height: 0.98;
  letter-spacing: -0.05em;
  font-weight: 670;
  color: #fff;
  overflow-wrap: anywhere;
}
.ld-hero p {
  margin-top: 12px; max-width: 46ch;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px; line-height: 1.5;
}
.ld-hero-meta { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.ld-chip {
  font-size: 12px; padding: 5px 9px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  backdrop-filter: blur(10px);
}
.ld-hero-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.ld-btn {
  height: 42px; padding: 0 16px; border-radius: 999px;
  font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px;
}
.ld-btn-primary { background: #fff; color: #111; }
.ld-btn-ghost { background: rgba(255, 255, 255, 0.12); color: #fff; backdrop-filter: blur(12px); }

.ld-shelf { margin-top: 30px; }
.ld-shelf-head {
  display: flex; align-items: end; justify-content: space-between;
  margin-bottom: 13px; gap: 10px;
}
.ld-shelf h3 { font-size: 21px; letter-spacing: -0.04em; font-weight: 650; }
.ld-shelf-link { color: var(--muted); font-size: 13px; }

.ld-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 168px;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}
.ld-row.ld-wide { grid-auto-columns: 288px; }
.ld-row::-webkit-scrollbar { height: 8px; }
.ld-row::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 99px; }

.ld-card { scroll-snap-align: start; cursor: pointer; text-align: left; }
.ld-poster {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-soft);
  transition: transform 0.35s var(--ease);
}
.ld-card:hover .ld-poster, .ld-card:hover .ld-thumb { transform: scale(1.025); }
.ld-poster-fade {
  position: absolute; inset: auto 0 0; height: 42%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
}
.ld-score {
  position: absolute; top: 10px; right: 10px;
  font-size: 11px; font-weight: 700;
  padding: 4px 7px; border-radius: 8px;
  background: rgba(0, 0, 0, 0.55); color: #fff;
  backdrop-filter: blur(8px);
}
.ld-ep-badge {
  position: absolute; left: 10px; bottom: 10px;
  font-size: 11px; font-weight: 700;
  padding: 4px 8px; border-radius: 8px;
  background: rgba(0, 0, 0, 0.6); color: #fff;
  backdrop-filter: blur(8px);
}
.ld-card-title {
  margin-top: 9px;
  font-size: 13.5px; font-weight: 600; letter-spacing: -0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ld-card-sub { margin-top: 2px; font-size: 12px; color: var(--muted); }

.ld-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-soft);
  transition: transform 0.35s var(--ease);
}
.ld-progress {
  position: absolute; left: 12px; right: 12px; bottom: 12px;
  height: 4px; border-radius: 99px;
  background: rgba(255, 255, 255, 0.22);
}
.ld-progress > span { display: block; height: 100%; border-radius: inherit; background: #fff; }
.ld-thumb-overlay-btn {
  position: absolute; top: 10px; right: 10px;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(0, 0, 0, 0.55); color: #fff;
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: 0.25s var(--ease);
}
.ld-card:hover .ld-thumb-overlay-btn { opacity: 1; }
.ld-thumb-overlay-btn:hover { background: var(--accent); }

.ld-genres {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.ld-genre {
  padding: 18px 16px;
  border-radius: 18px;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  text-align: left;
  transition: 0.25s var(--ease);
}
.ld-genre:hover { transform: translateY(-2px); border-color: var(--line-strong); }
.ld-genre b { display: block; font-size: 14px; }
.ld-genre span { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; }

.ld-empty {
  margin-top: 30px;
  padding: 40px 32px;
  border-radius: 24px;
  border: 1px dashed var(--line-strong);
  text-align: center;
  color: var(--muted);
}
.ld-empty h3 { color: var(--text); font-size: 20px; letter-spacing: -0.03em; margin-bottom: 8px; }
.ld-empty .ld-btn { margin-top: 18px; background: var(--text); color: var(--bg); }

.ld-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
  display: none;
  place-items: center;
  z-index: 60;
  padding: 24px;
}
.ld-overlay.ld-open { display: grid; }
.ld-palette {
  width: min(640px, 100%);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 12px;
}
.ld-palette input {
  width: 100%; height: 48px;
  border: 0; background: transparent; outline: none;
  padding: 0 14px;
  font-size: 18px;
  color: var(--text);
}
.ld-results { max-height: 360px; overflow: auto; }
.ld-result {
  width: 100%;
  display: flex; gap: 12px; align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  text-align: left;
}
.ld-result:hover { background: var(--bg-soft); }
.ld-result-art {
  width: 36px; height: 48px;
  border-radius: 8px; overflow: hidden;
  background: var(--bg-soft);
  flex: 0 0 auto;
}
.ld-result-title { font-size: 14px; font-weight: 600; }
.ld-result-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }

.ld-toast {
  position: fixed;
  left: 50%; bottom: 24px;
  transform: translateX(-50%) translateY(20px);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  color: var(--text);
  padding: 12px 16px;
  border-radius: 14px;
  opacity: 0;
  pointer-events: none;
  transition: 0.35s var(--ease);
  z-index: 70;
  font-size: 13.5px;
  box-shadow: var(--shadow);
}
.ld-toast.ld-on { opacity: 1; transform: translateX(-50%) translateY(0); }

.ld-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px;
  border-radius: 14px;
  background: var(--bg-soft);
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 700px) {
  .ld-inner { padding: 14px 14px 32px; }
  .ld-hero-copy { padding: 26px 22px; }
  .ld-search-trigger span.ld-search-label { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .luna-discover * { transition: none !important; }
}
`;

interface DiscoverHomeProps {
  tracks: AnimeTrack[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (track: AnimeTrack) => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

const STATUS_LABELS: Record<string, string> = {
  watching: 'Nézés alatt',
  completed: 'Befejezve',
  on_hold: 'Szünetel',
  plan_to_watch: 'Tervezett',
  planned: 'Tervezett',
  dropped: 'Felhagyva',
};

function sortByUpdated(list: AnimeTrack[]): AnimeTrack[] {
  return [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export const DiscoverHome: React.FC<DiscoverHomeProps> = ({
  tracks,
  isLoading,
  onOpenAddModal,
  onOpenEditModal,
  onNavigateTab,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const toast = (message: string) => {
    setToastMsg(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2800);
  };

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const watching = useMemo(
    () => sortByUpdated(tracks.filter((t) => t.status === 'watching')),
    [tracks]
  );
  const completed = useMemo(
    () => sortByUpdated(tracks.filter((t) => t.status === 'completed')).slice(0, 12),
    [tracks]
  );
  const planned = useMemo(
    () => sortByUpdated(
      tracks.filter((t) => t.status === 'plan_to_watch' || t.status === 'planned' || t.status === 'on_hold')
    ).slice(0, 12),
    [tracks]
  );

  const genres = useMemo(() => {
    const counter = new Map<string, number>();
    for (const t of tracks) {
      for (const g of t.genres || []) {
        const clean = g.trim();
        if (clean) counter.set(clean, (counter.get(clean) || 0) + 1);
      }
    }
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [tracks]);

  const hero = watching[0] || sortByUpdated(tracks)[0] || null;

  const searchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tracks.slice(0, 8);
    return tracks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.genres || []).some((g) => g.toLowerCase().includes(q)) ||
          (t.source || '').toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [searchQuery, tracks]);

  const openSource = (track: AnimeTrack) => {
    if (track.sourceUrl) {
      window.open(track.sourceUrl, '_blank', 'noopener');
    } else {
      toast('Nincs mentett forrás URL — szerkesztéshez kattints a ceruzára.');
    }
  };

  const handlePlusOne = async (e: React.MouseEvent, track: AnimeTrack) => {
    e.stopPropagation();
    try {
      await incrementEpisode(track.id, track.episode, track.totalEpisodes);
      toast(`${track.title} — ${track.episode + 1}. rész rögzítve`);
    } catch (err) {
      console.warn('Discover +1 hiba:', err);
      toast('Nem sikerült a frissítés.');
    }
  };

  const progressOf = (t: AnimeTrack): number | null => {
    if (t.totalEpisodes && t.totalEpisodes > 0) {
      return Math.max(4, Math.min(100, Math.round((t.episode / t.totalEpisodes) * 100)));
    }
    return null;
  };

  const subOf = (t: AnimeTrack): string => {
    const parts: string[] = [];
    parts.push(t.source || 'Egyéb');
    if (t.totalEpisodes) parts.push(`${t.episode}/${t.totalEpisodes} ep`);
    else parts.push(`${t.episode} ep`);
    return parts.join(' · ');
  };

  const posterCard = (t: AnimeTrack) => (
    <button
      key={t.id}
      className="ld-card"
      onClick={() => (t.sourceUrl ? openSource(t) : onOpenEditModal(t))}
      title={t.title}
      type="button"
    >
      <div className="ld-poster">
        {t.coverImage ? (
          <img src={t.coverImage} alt={t.title} loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--faint)', fontSize: '26px' }}>
            🌙
          </div>
        )}
        <div className="ld-poster-fade" />
        {t.rating ? <span className="ld-score">{t.rating.toFixed(1)}</span> : null}
        {!t.totalEpisodes ? <span className="ld-ep-badge">E{t.episode}</span> : null}
      </div>
      <div className="ld-card-title">{t.title}</div>
      <div className="ld-card-sub">{subOf(t)}</div>
    </button>
  );

  const continueCard = (t: AnimeTrack) => {
    const p = progressOf(t);
    return (
      <button
        key={t.id}
        className="ld-card"
        onClick={() => (t.sourceUrl ? openSource(t) : onOpenEditModal(t))}
        title={t.title}
        type="button"
      >
        <div className="ld-thumb">
          {t.coverImage ? (
            <img src={t.coverImage} alt={t.title} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--faint)', fontSize: '26px' }}>
              🌙
            </div>
          )}
          {p !== null ? (
            <div className="ld-progress"><span style={{ width: `${p}%` }} /></div>
          ) : (
            <span className="ld-ep-badge">E{t.episode}</span>
          )}
          <span
            className="ld-thumb-overlay-btn"
            onClick={(e) => handlePlusOne(e, t)}
            title="+1 epizód rögzítése"
          >
            <ChevronUp size={16} />
          </span>
        </div>
        <div className="ld-card-title">{t.title}</div>
        <div className="ld-card-sub">{subOf(t)} · {STATUS_LABELS[t.status] || t.status}</div>
      </button>
    );
  };

  return (
    <div className="luna-discover" data-theme={theme}>
      <style>{DISCOVER_CSS}</style>

      <div className="ld-inner">
        <div className="ld-topbar">
          <button className="ld-search-trigger" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 40); }} type="button">
            <Search size={16} />
            <span className="ld-search-label">Keresés a saját listádban</span>
            <span className="ld-kbd">Ctrl K</span>
          </button>

          <div className="ld-top-actions">
            <button
              className="ld-icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Világos / sötét téma"
              type="button"
            >
              ◐
            </button>
            <button className="ld-add-btn" onClick={onOpenAddModal} type="button">
              <Plus size={15} />
              Új anime
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="ld-loading" style={{ marginBottom: 18 }}>
            <span className="ld-spinner" style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--line-strong)', borderTopColor: 'var(--accent)', display: 'inline-block', animation: 'ld-spin 0.8s linear infinite' }} />
            Firestore adatok betöltése…
          </div>
        )}
        <style>{`@keyframes ld-spin { to { transform: rotate(360deg); } }`}</style>

        {hero && (
          <section className="ld-hero">
            <div className={`ld-hero-media${hero.coverImage ? '' : ' ld-hero-empty'}`}>
              {hero.coverImage && <img src={hero.coverImage} alt={hero.title} referrerPolicy="no-referrer" />}
            </div>
            <div className="ld-hero-copy">
              <div className="ld-eyebrow">{hero.source || 'Követett'} · {STATUS_LABELS[hero.status] || 'Folyamatban'}</div>
              <h2>{hero.title}</h2>
              {hero.notes && <p>{hero.notes}</p>}
              <div className="ld-hero-meta">
                {hero.rating ? <span className="ld-chip">⭐ {hero.rating.toFixed(1)}</span> : null}
                <span className="ld-chip">
                  {hero.totalEpisodes ? `${hero.episode}/${hero.totalEpisodes}` : `${hero.episode}`} epizód
                </span>
                {(hero.genres || []).slice(0, 2).map((g) => (
                  <span key={g} className="ld-chip">{g}</span>
                ))}
              </div>
              <div className="ld-hero-actions">
                <button className="ld-btn ld-btn-primary" onClick={() => openSource(hero)} type="button">
                  <Play size={15} />
                  Nézd most
                </button>
                <button className="ld-btn ld-btn-ghost" onClick={() => onOpenEditModal(hero)} type="button">
                  <Pencil size={14} />
                  Szerkesztés
                </button>
              </div>
            </div>
          </section>
        )}

        {!isLoading && tracks.length === 0 && (
          <div className="ld-empty">
            <h3>A listád még üres</h3>
            Add hozzá az első animédet kézzel, vagy nézz egyet bármelyik támogatott oldalon —
            a Luna userscript automatikusan szinkronizálja ide.
            <div>
              <button className="ld-btn" onClick={onOpenAddModal} type="button">
                <Plus size={15} />
                Első anime hozzáadása
              </button>
            </div>
          </div>
        )}

        {watching.length > 0 && (
          <section className="ld-shelf">
            <div className="ld-shelf-head">
              <h3>Folytasd a nézést</h3>
              <button className="ld-shelf-link" onClick={() => onNavigateTab('library')} type="button">
                Teljes könyvtár →
              </button>
            </div>
            <div className="ld-row ld-wide">{watching.slice(0, 12).map(continueCard)}</div>
          </section>
        )}

        {planned.length > 0 && (
          <section className="ld-shelf">
            <div className="ld-shelf-head">
              <h3>Tervben & szüneteltetve</h3>
            </div>
            <div className="ld-row">{planned.map(posterCard)}</div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="ld-shelf">
            <div className="ld-shelf-head">
              <h3>Befejezett kalandok</h3>
            </div>
            <div className="ld-row">{completed.map(posterCard)}</div>
          </section>
        )}

        {genres.length > 0 && (
          <section className="ld-shelf">
            <div className="ld-shelf-head">
              <h3>Műfajaid</h3>
              <span className="ld-shelf-link">A saját listádból számolva</span>
            </div>
            <div className="ld-genres">
              {genres.map((g) => (
                <button
                  key={g.name}
                  className="ld-genre"
                  onClick={() => onNavigateTab('analytics')}
                  type="button"
                >
                  <b>{g.name}</b>
                  <span>{g.count} cím a listádon</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Kereső paletta (Ctrl+K) */}
      <div
        className={`ld-overlay${searchOpen ? ' ld-open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
      >
        <div className="ld-palette">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Mire keresel? (cím, műfaj, forrás)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="ld-results">
            {searchHits.length === 0 && (
              <div style={{ padding: '18px 14px', color: 'var(--muted)', fontSize: 13 }}>
                Nincs találat a listádban.
              </div>
            )}
            {searchHits.map((t) => (
              <button
                key={t.id}
                className="ld-result"
                onClick={() => { setSearchOpen(false); t.sourceUrl ? openSource(t) : onOpenEditModal(t); }}
                type="button"
              >
                <div className="ld-result-art">
                  {t.coverImage
                    ? <img src={t.coverImage} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--faint)' }}>🌙</div>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="ld-result-title">{t.title}</div>
                  <div className="ld-result-sub">{subOf(t)} · {STATUS_LABELS[t.status as WatchStatus] || t.status}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`ld-toast${toastMsg ? ' ld-on' : ''}`}>{toastMsg}</div>
    </div>
  );
};

export default DiscoverHome;
