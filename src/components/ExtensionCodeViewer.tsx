import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  Copy, 
  CheckCircle2, 
  Download, 
  FileJson, 
  FileType, 
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';
import { CHROME_EXTENSION_FILES } from '../data/extensionSource';
import { GITHUB_ZIP_URL } from '../firebase/config';

export const ExtensionCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = CHROME_EXTENSION_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (lang: string) => {
    if (lang === 'json') return <FileJson className="w-4 h-4 text-amber-400" />;
    if (lang === 'javascript') return <FileCode className="w-4 h-4 text-cyan-400" />;
    if (lang === 'html') return <FileType className="w-4 h-4 text-orange-400" />;
    return <FileText className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div id="code-viewer" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#090a14] border border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ÁTLÁTHATÓ & NYÍLT FORRÁSKÓD</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Chrome Bővítmény & Userscript Forráskód
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Tekintsd át a Manifest V3 konfigurációt, a Tampermonkey userscriptet és a DOM elemző szkripteket.
          </p>
        </div>
      </div>

      {/* Code Explorer Container */}
      <div className="rounded-3xl border border-white/10 bg-[#090a14] overflow-hidden shadow-2xl">
          
          {/* File Tab Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 bg-black/60 px-4 py-2 gap-3">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {CHROME_EXTENSION_FILES.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    selectedFileIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {getFileIcon(file.language)}
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {currentFile.name.endsWith('.user.js') && (
                <a
                  href="/Luna-Anime-Tracker.user.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono transition-colors shadow-md shadow-amber-400/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Auto-Telepítés (Tampermonkey)</span>
                </a>
              )}

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-colors"
                title="Kód másolása a vágólapra"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Másolva!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kód Másolása</span>
                  </>
                )}
              </button>

              <a
                href={GITHUB_ZIP_URL}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ZIP Letöltése</span>
              </a>
            </div>

          </div>

          {/* Description banner */}
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono text-cyan-400">{currentFile.path}</span>
            <span>{currentFile.description}</span>
          </div>

          {/* Code Window */}
          <div className="p-6 bg-[#06060c] overflow-x-auto max-h-[480px]">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              <code>{currentFile.content}</code>
            </pre>
          </div>

        </div>
      </div>
    );
};
