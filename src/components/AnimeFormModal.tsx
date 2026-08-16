import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Tv, 
  Image as ImageIcon, 
  Star, 
  Link as LinkIcon, 
  Sparkles, 
  Layers,
  Plus
} from 'lucide-react';
import { AnimeTrack, AnimeSource, WatchStatus } from '../types';
import { addAnimeTrack, updateAnimeTrack, normalizeWatchStatus } from '../services/firestoreService';

interface AnimeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: AnimeTrack | null;
}

const PRESET_COVERS = [
  { label: 'Solo Leveling', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
  { label: 'Jujutsu Kaisen', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' },
  { label: 'Neon Tokyo', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dark Anime', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
];

export const AnimeFormModal: React.FC<AnimeFormModalProps> = ({
  isOpen,
  onClose,
  initialTrack,
}) => {
  const [title, setTitle] = useState('');
  const [episode, setEpisode] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState<number | ''>('');
  const [source, setSource] = useState<AnimeSource>('MagyarAnime');
  const [sourceUrl, setSourceUrl] = useState('');
  const [status, setStatus] = useState<WatchStatus>('watching');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [rating, setRating] = useState(9.0);
  const [notes, setNotes] = useState('');
  const [genresInput, setGenresInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTrack) {
      setTitle(initialTrack.title);
      setEpisode(initialTrack.episode || 1);
      setTotalEpisodes(initialTrack.totalEpisodes || '');
      setSource(initialTrack.source || 'MagyarAnime');
      setSourceUrl(initialTrack.sourceUrl || '');
      setStatus(normalizeWatchStatus(initialTrack.status));
      setCoverImage(initialTrack.coverImage || PRESET_COVERS[0].url);
      setRating(initialTrack.rating || 9.0);
      setNotes(initialTrack.notes || '');
      setGenresInput(initialTrack.genres ? initialTrack.genres.join(', ') : '');
    } else {
      setTitle('');
      setEpisode(1);
      setTotalEpisodes('');
      setSource('MagyarAnime');
      setSourceUrl('');
      setStatus('watching');
      setCoverImage(PRESET_COVERS[0].url);
      setRating(9.0);
      setNotes('');
      setGenresInput('Akció, Fantasy, Shounen');
    }
  }, [initialTrack, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Kérlek add meg az anime címét!');
      return;
    }

    const genres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    setIsSubmitting(true);
    try {
      if (initialTrack) {
        await updateAnimeTrack(initialTrack.id, {
          title,
          episode: Number(episode),
          totalEpisodes: totalEpisodes ? Number(totalEpisodes) : undefined,
          source,
          sourceUrl,
          status,
          coverImage,
          rating: Number(rating),
          notes,
          genres,
        });
      } else {
        await addAnimeTrack({
          title,
          episode: Number(episode),
          totalEpisodes: totalEpisodes ? Number(totalEpisodes) : undefined,
          source,
          sourceUrl,
          status,
          coverImage,
          rating: Number(rating),
          notes,
          genres,
          syncedFromExtension: false,
        });
      }
      onClose();
    } catch (err: any) {
      alert(`Hiba a mentés során: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-[#0b0c16] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {initialTrack ? 'Anime Bejegyzés Módosítása' : 'Új Anime Rögzítése'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Google Cloud Firestore valós idejű szinkronizáció
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 font-mono">
              ANIME CÍME *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Solo Leveling Season 2"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          {/* Episode & Total & Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-mono">
                AKTUÁLIS RÉSZ *
              </label>
              <input
                type="number"
                min={1}
                required
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-mono">
                ÖSSZES RÉSZ (OPCIONÁLIS)
              </label>
              <input
                type="number"
                min={1}
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(e.target.value ? Number(e.target.value) : '')}
                placeholder="pl. 24"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-mono">
                ÉRTÉKELÉS (1-10)
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono text-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-mono">
                FORRÁS OLDAL
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="MagyarAnime">MagyarAnime.hu</option>
                <option value="OniAnime">OniAnime.hu</option>
                <option value="AnimeGun">AnimeGun</option>
                <option value="Indavideo">Indavideo</option>
                <option value="Egyéb">Egyéb</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 font-mono">
                ÁLLAPOT
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="watching">Nézem (Folyamatban)</option>
                <option value="completed">Befejezve</option>
                <option value="plan_to_watch">Tervezett</option>
                <option value="on_hold">Szüneteltetve</option>
                <option value="dropped">Félbehagyva</option>
              </select>
            </div>
          </div>

          {/* Streaming Direct URL */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 font-mono">
              LEJÁTSZÁSI / EPISODE URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://magyaranime.hu/anime-cime-resz-1"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Cover Image & Presets */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 font-mono">
              BORÍTÓKÉP URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono mb-2"
            />
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-400 font-mono shrink-0">Gyors képek:</span>
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverImage(preset.url)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono shrink-0 border transition-all ${
                    coverImage === preset.url
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 font-mono">
              MŰFAJOK (VESSZŐVEL ELVÁLASZTVA)
            </label>
            <input
              type="text"
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="Akció, Fantasy, Shounen"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 font-mono">
              EGYÉNI JEGYZETEK
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Megjegyzések a cselekményhez, karakterekhez vagy a magyar fordításhoz..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors"
            >
              Mégse
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Mentés...' : initialTrack ? 'Módosítás Mentése' : 'Anime Létrehozása'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
