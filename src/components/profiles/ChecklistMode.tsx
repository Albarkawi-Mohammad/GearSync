import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  X,
  Info,
  Sparkles,
} from 'lucide-react';
import type { GameProfile } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { GamePill, PlatformBadge, InputBadge } from '../ui';
import confetti from 'canvas-confetti';

interface ChecklistModeProps {
  profile: GameProfile;
  onClose: () => void;
}

export const ChecklistMode: React.FC<ChecklistModeProps> = ({ profile, onClose }) => {
  const game = SUPPORTED_GAMES.find((g) => g.id === profile.gameId);
  const [completedFields, setCompletedFields] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter fields based on profile platform
  const fields = (game?.fields || []).filter((field) => {
    if (!field.platformLimit) return true;
    return field.platformLimit.includes(profile.platform);
  });

  const activeField = fields[activeIndex];

  const handleToggleComplete = (fieldId: string) => {
    const updated = {
      ...completedFields,
      [fieldId]: !completedFields[fieldId],
    };
    setCompletedFields(updated);

    if (updated[fieldId] && activeIndex < fields.length - 1) {
      setTimeout(() => {
        setActiveIndex((prev) => prev + 1);
      }, 240);
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
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF5E36', '#F59E0B', '#10B981'],
      });
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(200);
      }
    }
  }, [completedCount, fields.length]);

  // Keyboard support for quick stepping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, fields.length]);

  const handleReset = () => {
    setCompletedFields({});
    setActiveIndex(0);
  };

  if (fields.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0C0B0E] z-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-[#A6A2B5] text-sm mb-4">
          No settings configured for this platform.
        </p>
        <button onClick={onClose} className="gs-btn-secondary px-6 py-2.5 text-xs">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0C0B0E] z-50 flex flex-col justify-between overflow-hidden animate-fade-in">
      {/* Top Companion Bar */}
      <header className="px-5 py-4 bg-[#16151C] border-b border-white/[0.06] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GamePill gameId={profile.gameId} />
            <PlatformBadge platform={profile.platform} />
            <InputBadge inputType={profile.inputType} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#F7F6F9] truncate">
            {profile.name} — Companion Checklist
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-[#F7F6F9] tabular-nums">
              {completedCount} of {fields.length} Applied
            </span>
            <span className="text-[11px] text-[#FF5E36] font-semibold tabular-nums">
              {progressPercent}% Complete
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#25232E] hover:bg-[#2E2B39] border border-white/10 text-[#A6A2B5] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close Checklist Mode"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Smooth Progress Bar */}
      <div className="w-full bg-[#1D1B24] h-2 relative">
        <div
          className="h-full bg-gradient-to-r from-[#FF5E36] to-amber-400 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Step Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto w-full overflow-y-auto">
        {activeField && (
          <div className="w-full gs-card p-6 sm:p-8 border-white/10 flex flex-col justify-between min-h-[340px] shadow-2xl">
            <div className="space-y-4">
              {/* Step & Category Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF5E36]/15 text-[#FF5E36] border border-[#FF5E36]/25">
                  {activeField.category}
                </span>
                <span className="text-xs font-semibold text-[#6E6A7E] tabular-nums">
                  Step {activeIndex + 1} of {fields.length}
                </span>
              </div>

              {/* Setting Title */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F9] tracking-tight">
                {activeField.name}
              </h3>

              {/* Guidance Box */}
              <div className="flex items-start gap-2.5 text-xs text-[#A6A2B5] bg-[#16151C] p-3.5 rounded-2xl border border-white/[0.05] leading-relaxed">
                <Info size={15} className="text-[#FF5E36] shrink-0 mt-0.5" />
                <span>
                  Navigate to your in-game <strong>{activeField.category}</strong> menu and set{' '}
                  <strong>{activeField.name}</strong> to the target value below.
                </span>
              </div>
            </div>

            {/* Huge Target Value Display */}
            <div className="my-6 py-7 px-4 rounded-3xl bg-[#121117] border border-white/[0.08] text-center">
              <span className="block text-[11px] font-semibold text-[#6E6A7E] uppercase tracking-wider mb-1.5">
                Set In-Game Value To
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold text-[#FF5E36] tabular-nums tracking-tight">
                {profile.settings[activeField.id] !== undefined
                  ? activeField.type === 'toggle'
                    ? profile.settings[activeField.id]
                      ? 'Enabled'
                      : 'Disabled'
                    : String(profile.settings[activeField.id])
                  : 'Default'}
              </span>
            </div>

            {/* Large Touch-Friendly Confirm Button */}
            <button
              type="button"
              onClick={() => handleToggleComplete(activeField.id)}
              className={`w-full py-4 rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 border min-h-[52px] ${
                completedFields[activeField.id]
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'gs-btn-primary border-transparent'
              }`}
            >
              {completedFields[activeField.id] ? (
                <>
                  <Check size={19} /> Applied & Verified
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Mark as Applied
                </>
              )}
            </button>
          </div>
        )}

        {/* Prev / Reset / Next Controls */}
        <div className="flex items-center gap-3 mt-5 w-full">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="flex-1 py-3.5 rounded-full bg-[#1D1B24] hover:bg-[#25232E] border border-white/[0.07] disabled:opacity-40 text-xs font-semibold text-[#F7F6F9] flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChevronLeft size={17} /> Previous
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-[#1D1B24] hover:bg-[#25232E] border border-white/[0.07] text-[#A6A2B5] hover:text-white flex items-center justify-center transition-colors"
            title="Reset checklist progress"
            aria-label="Reset checklist progress"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === fields.length - 1}
            className="flex-1 py-3.5 rounded-full bg-[#1D1B24] hover:bg-[#25232E] border border-white/[0.07] disabled:opacity-40 text-xs font-semibold text-[#F7F6F9] flex items-center justify-center gap-1.5 transition-colors"
          >
            Next <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Bottom Horizontal Step Map */}
      <footer className="px-5 py-3.5 bg-[#16151C] border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#6E6A7E]">
            Quick Jump Settings Map
          </span>
          <span className="text-[11px] text-[#A6A2B5] tabular-nums sm:hidden">
            {completedCount}/{fields.length} Done
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {fields.map((field, idx) => {
            const isDone = completedFields[field.id];
            const isActive = idx === activeIndex;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF5E36] border-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                    : isDone
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#1D1B24] border-white/[0.06] text-[#A6A2B5] hover:text-white'
                }`}
              >
                {isDone && <Check size={12} />}
                <span className="tabular-nums">{idx + 1}.</span>
                <span>{field.name}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
