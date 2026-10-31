import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, Trash2, ArrowUpRight, Sparkles, Clock, Copy, Play, Sliders } from 'lucide-react';
import type { GameProfile } from '../../lib/storage';
import {
  GameArtwork,
  GamePill,
  PlatformBadge,
  InputBadge,
  getKeyMetricsForProfile,
  getGameTheme,
} from './GameArtwork';
import { AnimatedNumber } from './AnimatedNumber';

interface ProfileCardProps {
  profile: GameProfile;
  onTogglePin?: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  showCreator?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onTogglePin,
  onDelete,
  showCreator = false,
}) => {
  const metrics = getKeyMetricsForProfile(profile);
  const theme = getGameTheme(profile.gameId);

  return (
    <Link
      to={`/profiles/${profile.id}`}
      className="gs-card-interactive group flex flex-col justify-between overflow-hidden relative"
    >
      {/* Artwork Header */}
      <div>
        <GameArtwork gameId={profile.gameId} className="h-32 p-4" overlayIntensity="medium">
          <div className="flex items-start justify-between gap-2 h-full flex-col">
            <div className="flex items-center justify-between w-full gap-2">
              <GamePill gameId={profile.gameId} />
              <div className="flex items-center gap-1.5">
                {profile.isPublic && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    Shared
                  </span>
                )}
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={(e) => onTogglePin(profile.id, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                      profile.isPinned
                        ? 'bg-[#FF5E36] text-white border-[#FF5E36] shadow-md shadow-[#FF5E36]/30'
                        : 'bg-black/40 border-white/10 text-[#A6A2B5] hover:text-white hover:bg-black/60'
                    }`}
                    title={profile.isPinned ? 'Unpin loadout' : 'Pin loadout'}
                    aria-label={profile.isPinned ? 'Unpin loadout' : 'Pin loadout'}
                  >
                    <Pin size={13} className={profile.isPinned ? 'fill-white' : ''} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => onDelete(profile.id, e)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-[#A6A2B5] hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/15 backdrop-blur-md transition-all"
                    title="Delete loadout"
                    aria-label="Delete loadout"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <PlatformBadge platform={profile.platform} />
              <InputBadge inputType={profile.inputType} />
            </div>
          </div>
        </GameArtwork>

        {/* Card Body */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-[#F7F6F9] group-hover:text-[#FF5E36] transition-colors truncate tracking-tight">
                {profile.name}
              </h3>
              {showCreator && (
                <p className="text-xs text-[#A6A2B5] mt-0.5 flex items-center gap-1.5">
                  <span>by @{profile.username}</span>
                  {profile.isPro && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      Pro
                    </span>
                  )}
                </p>
              )}
            </div>
            <span className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-[#FF5E36]/15 border border-white/[0.06] group-hover:border-[#FF5E36]/30 flex items-center justify-center text-[#A6A2B5] group-hover:text-[#FF5E36] transition-all shrink-0">
              <ArrowUpRight size={15} />
            </span>
          </div>

          {/* Live Key Settings Telemetry Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-[#121117] border border-white/[0.05]">
            {metrics.map((m, i) => (
              <div key={i} className="px-1.5 text-left min-w-0">
                <span className="block text-[10px] text-[#6E6A7E] truncate">{m.label}</span>
                <span className="block text-xs font-semibold text-[#F7F6F9] tabular-nums truncate mt-0.5">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3.5">
              {profile.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-medium bg-white/[0.04] text-[#A6A2B5] px-2.5 py-0.5 rounded-full border border-white/[0.05]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#6E6A7E]">
        <span className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: theme.accentHex }} />
          {new Date(profile.lastUsed).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Copy size={11} />
          <AnimatedNumber value={profile.copiesCount} /> {profile.copiesCount === 1 ? 'clone' : 'clones'}
        </span>
      </div>
    </Link>
  );
};

interface FeaturedProfileCardProps {
  profile: GameProfile;
  badgeText?: string;
}

export const FeaturedProfileCard: React.FC<FeaturedProfileCardProps> = ({
  profile,
  badgeText = 'Active Loadout',
}) => {
  const metrics = getKeyMetricsForProfile(profile);
  const theme = getGameTheme(profile.gameId);

  return (
    <div className="rounded-[28px] overflow-hidden border border-white/10 shadow-card bg-[#1D1B24] relative group">
      <GameArtwork gameId={profile.gameId} className="min-h-[300px] sm:min-h-[320px] p-6 sm:p-8 flex flex-col justify-between" overlayIntensity="heavy">
        {/* Top Row Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF5E36] text-white shadow-lg shadow-[#FF5E36]/30">
              <Sparkles size={12} />
              {badgeText}
            </span>
            <GamePill gameId={profile.gameId} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <PlatformBadge platform={profile.platform} size="md" />
            <InputBadge inputType={profile.inputType} size="md" />
          </div>
        </div>

        {/* Center / Bottom Hero Info */}
        <div className="mt-8 space-y-5">
          <div>
            <p className="text-xs font-medium text-[#A6A2B5] mb-1">
              {theme.studio} • {theme.engine} •{' '}
              <AnimatedNumber value={Object.keys(profile.settings || {}).length} /> Calibrated Parameters
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F7F6F9] tracking-tight leading-tight">
              {profile.name}
            </h2>
          </div>

          {/* Live Telemetry Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            {metrics.map((m, idx) => {
              const strVal = String(m.value || '');
              const numMatch = strVal.match(/^-?\d+(\.\d+)?/);
              const numVal = numMatch ? parseFloat(numMatch[0]) : null;
              const suffix = strVal.endsWith('°') ? '°' : '';

              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#121117]/80 backdrop-blur-md border border-white/10"
                >
                  <span className="block text-[11px] text-[#A6A2B5]">{m.label}</span>
                  <span className="block text-sm sm:text-base font-bold text-[#F7F6F9] tabular-nums mt-0.5 truncate">
                    {numVal !== null && !isNaN(numVal) ? (
                      <AnimatedNumber value={numVal} suffix={suffix} delay={idx * 40} />
                    ) : (
                      m.value
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to={`/profiles/${profile.id}`}
              className="gs-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
            >
              <Play size={15} className="fill-current" />
              Open Loadout
            </Link>
            <Link
              to={`/profiles/${profile.id}/edit`}
              className="gs-btn-secondary px-5 py-3 text-sm inline-flex items-center gap-2"
            >
              <Sliders size={15} />
              Tune Settings
            </Link>
            <Link
              to="/profiles/new"
              className="px-4 py-3 rounded-full text-xs font-semibold text-[#A6A2B5] hover:text-white hover:bg-white/5 transition-colors"
            >
              + New Profile
            </Link>
          </div>
        </div>
      </GameArtwork>
    </div>
  );
};

