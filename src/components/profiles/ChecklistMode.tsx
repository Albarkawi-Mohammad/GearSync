import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, RotateCcw, X, Info } from 'lucide-react';
import type { GameProfile } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import confetti from 'canvas-confetti';

interface ChecklistModeProps {
  profile: GameProfile;
  onClose: () => void;
}

export const ChecklistMode: React.FC<ChecklistModeProps> = ({ profile, onClose }) => {
  const game = SUPPORTED_GAMES.find(g => g.id === profile.gameId);
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter fields based on profile platform
  const fields = (game?.fields || []).filter(field => {
    if (!field.platformLimit) return true;
    return field.platformLimit.includes(profile.platform);
  });

  const activeField = fields[activeIndex];

  const handleToggleComplete = (fieldId: string) => {
    const updated = {
      ...completedFields,
      [fieldId]: !completedFields[fieldId]
    };
    setCompletedFields(updated);

    // If marked done, advance automatically if possible
    if (updated[fieldId] && activeIndex < fields.length - 1) {
      setTimeout(() => {
        setActiveIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (activeIndex < fields.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const completedCount = Object.values(completedFields).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / fields.length) * 100) || 0;

  useEffect(() => {
    if (completedCount === fields.length && fields.length > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#06B6D4', '#10B981']
      });
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(200);
      }
    }
  }, [completedCount, fields.length]);

  const handleReset = () => {
    setCompletedFields({});
    setActiveIndex(0);
  };

  if (fields.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] z-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-400 font-mono mb-4">No settings configured for this platform.</p>
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 rounded-lg">Close</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#070A13] z-50 flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider">{profile.name}</h2>
          <p className="text-xs text-gray-400">Checklist Mode • Copying to {profile.platform.toUpperCase()}</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-gray-400 hover:text-white transition-colors"
          aria-label="Close Checklist Mode"
        >
          <X size={20} />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 relative">
        <div 
          className="h-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        <span className="absolute right-4 top-4 text-xs font-mono text-gray-400">
          {completedCount} / {fields.length} Done ({progressPercent}%)
        </span>
      </div>

      {/* Interactive Terminal View (Center Slider) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">
        {activeField && (
          <div className="w-full cyber-panel p-8 border-brand-primary/30 bg-[#161F30]/40 flex flex-col justify-between min-h-[350px] shadow-lg shadow-brand-primary/5">
            <div>
              {/* Category tag */}
              <span className="inline-block text-[10px] font-bold font-mono tracking-widest text-brand-primary uppercase border border-brand-primary/30 px-2 py-0.5 rounded mb-4">
                {activeField.category}
              </span>

              {/* Setting Name */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide mb-2 uppercase">
                {activeField.name}
              </h3>

              {/* Description/Instruction Tip */}
              <div className="flex items-start gap-2 text-xs text-gray-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-6 leading-relaxed">
                <Info size={14} className="text-brand-cyan shrink-0 mt-0.5" />
                <span>
                  Configure this setting under the game's <b>{activeField.category}</b> tab. 
                  {activeField.platformLimit && ` Applies strictly to: ${activeField.platformLimit.join(', ').toUpperCase()}.`}
                </span>
              </div>
            </div>

            {/* BIG HIGHLIGHTED VALUE */}
            <div className="text-center py-6 bg-black/45 border border-slate-800/60 rounded-xl mb-6 relative group">
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">SET VALUE TO</span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-cyan glow-text-cyan">
                {profile.settings[activeField.id] !== undefined ? String(profile.settings[activeField.id]) : 'N/A'}
              </span>
            </div>

            {/* Check/Confirm Button */}
            <button
              onClick={() => handleToggleComplete(activeField.id)}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-[background-color,border-color,color,transform,box-shadow,filter] duration-150 ease-out flex items-center justify-center gap-2 border active:scale-[0.97] ${
                completedFields[activeField.id]
                  ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                  : 'bg-gradient-to-r from-brand-primary to-brand-cyan text-white border-transparent hover:brightness-110 shadow-md shadow-brand-primary/20'
              }`}
            >
              <Check size={18} />
              {completedFields[activeField.id] ? 'Applied & Confirmed' : 'Mark as Applied'}
            </button>
          </div>
        )}

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-4 mt-6 w-full justify-between sm:px-4">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-gray-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Prev</span>
          </button>
          
          <button
            onClick={handleReset}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white rounded-xl transition-colors"
            title="Reset checklist progress"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleNext}
            disabled={activeIndex === fields.length - 1}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-gray-300 rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Horizontal Quick-Select List */}
      <footer className="px-6 py-4 bg-[#111827] border-t border-slate-800/80">
        <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">SETTINGS MAP</span>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth">
          {fields.map((field, idx) => {
            const isDone = completedFields[field.id];
            const isActive = idx === activeIndex;
            return (
              <button
                key={field.id}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-mono border transition-[background-color,border-color,color] duration-150 ease-out flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-primary/20 border-brand-cyan text-brand-cyan'
                    : isDone
                    ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
                    : 'bg-[#161F30]/45 border-slate-800 text-gray-400 hover:border-slate-700'
                }`}
              >
                {isDone && <Check size={12} />}
                <span>{idx + 1}. {field.name}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
