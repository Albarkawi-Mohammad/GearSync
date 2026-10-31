import React, { useState } from 'react';
import { Monitor, Gamepad2, Mouse, Tv, Cpu } from 'lucide-react';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import type { GameProfile } from '../../lib/storage';

export interface GameVisualTheme {
  id: string;
  name: string;
  shortName: string;
  studio: string;
  engine: string;
  accentHex: string;
  badgeClass: string;
  gradientClass: string;
  artworkUrl: string;
  exportFormat: string;
}

const GAME_THEMES: Record<string, GameVisualTheme> = {
  bo6: {
    id: 'bo6',
    name: 'Call of Duty: Black Ops 6',
    shortName: 'Black Ops 6',
    studio: 'Treyarch',
    engine: 'IW 9.0 Engine',
    accentHex: '#FF6B2B',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    gradientClass: 'from-[#3B1B10] via-[#221619] to-[#16151C]',
    artworkUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
    exportFormat: 'bo6_options.4.cod24.cst (.txt)',
  },
  apex: {
    id: 'apex',
    name: 'Apex Legends',
    shortName: 'Apex Legends',
    studio: 'Respawn',
    engine: 'Source Engine',
    accentHex: '#F43F5E',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    gradientClass: 'from-[#3D1520] via-[#231620] to-[#16151C]',
    artworkUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=900&auto=format&fit=crop',
    exportFormat: 'autoexec.cfg (Source)',
  },
  fortnite: {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'Fortnite',
    studio: 'Epic Games',
    engine: 'Unreal Engine 5',
    accentHex: '#818CF8',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    gradientClass: 'from-[#1E1E45] via-[#1C1B2E] to-[#16151C]',
    artworkUrl: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=900&auto=format&fit=crop',
    exportFormat: 'GameUserSettings.ini',
  },
  valorant: {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'Valorant',
    studio: 'Riot Games',
    engine: 'Unreal Engine 4',
    accentHex: '#FB7185',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    gradientClass: 'from-[#3F1624] via-[#241722] to-[#16151C]',
    artworkUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=900&auto=format&fit=crop',
    exportFormat: 'RiotUserSettings.cfg',
  },
  cs2: {
    id: 'cs2',
    name: 'Counter-Strike 2',
    shortName: 'Counter-Strike 2',
    studio: 'Valve',
    engine: 'Source 2',
    accentHex: '#F59E0B',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    gradientClass: 'from-[#3B2810] via-[#241E18] to-[#16151C]',
    artworkUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=900&auto=format&fit=crop',
    exportFormat: 'cs2_autoexec.cfg',
  },
};

export const getGameTheme = (gameId: string): GameVisualTheme => {
  if (GAME_THEMES[gameId]) return GAME_THEMES[gameId];
  const found = SUPPORTED_GAMES.find((g) => g.id === gameId);
  return {
    id: gameId,
    name: found?.name || gameId.toUpperCase(),
    shortName: found?.name || gameId.toUpperCase(),
    studio: 'Esports Title',
    engine: 'Custom Engine',
    accentHex: '#FF5E36',
    badgeClass: 'bg-[#FF5E36]/15 text-[#FF7452] border-[#FF5E36]/25',
    gradientClass: 'from-[#361B15] via-[#201A22] to-[#16151C]',
    artworkUrl: found?.logo || '',
    exportFormat: `${gameId}_config.cfg`,
  };
};

interface GameArtworkProps {
  gameId: string;
  className?: string;
  overlayIntensity?: 'light' | 'medium' | 'heavy';
  children?: React.ReactNode;
}

export const GameArtwork: React.FC<GameArtworkProps> = ({
  gameId,
  className = 'h-40',
  overlayIntensity = 'medium',
  children,
}) => {
  const theme = getGameTheme(gameId);
  const [imgError, setImgError] = useState(false);

  const overlayGradient =
    overlayIntensity === 'heavy'
      ? 'bg-gradient-to-t from-[#1D1B24] via-[#1D1B24]/85 to-[#1D1B24]/30'
      : overlayIntensity === 'light'
      ? 'bg-gradient-to-t from-[#1D1B24] via-[#1D1B24]/55 to-transparent'
      : 'bg-gradient-to-t from-[#1D1B24] via-[#1D1B24]/75 to-[#1D1B24]/20';

  return (
    <div className={`relative overflow-hidden select-none bg-gradient-to-br ${theme.gradientClass} ${className}`}>
      {/* Subtle geometric vector pattern for rich fallback & depth */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 400 200"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="340" cy="40" r="110" stroke={theme.accentHex} strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="340" cy="40" r="70" stroke={theme.accentHex} strokeWidth="1" opacity="0.6" />
        <path d="M-20 180 L140 20 L240 180 Z" fill={theme.accentHex} fillOpacity="0.08" />
        <path d="M200 220 L320 60 L440 220 Z" fill={theme.accentHex} fillOpacity="0.12" />
      </svg>

      {!imgError && theme.artworkUrl && (
        <img
          src={theme.artworkUrl}
          alt={theme.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-45 transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}

      {/* Warm radial glow accent */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: theme.accentHex }}
      />

      {/* Vignette overlay */}
      <div className={`absolute inset-0 ${overlayGradient}`} />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
};

export const PlatformBadge: React.FC<{ platform: string; size?: 'sm' | 'md' }> = ({
  platform,
  size = 'sm',
}) => {
  const labels: Record<string, string> = {
    pc: 'PC',
    playstation: 'PS5',
    xbox: 'Xbox',
    switch: 'Switch',
  };
  const isPc = platform === 'pc';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border border-white/10 bg-white/[0.05] text-[#F7F6F9] ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {isPc ? <Monitor size={size === 'sm' ? 11 : 13} className="text-sky-400" /> : <Tv size={size === 'sm' ? 11 : 13} className="text-indigo-400" />}
      {labels[platform] || platform.toUpperCase()}
    </span>
  );
};

export const InputBadge: React.FC<{ inputType: 'controller' | 'keyboard_mouse'; size?: 'sm' | 'md' }> = ({
  inputType,
  size = 'sm',
}) => {
  const isCtrl = inputType === 'controller';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border border-white/10 bg-white/[0.05] text-[#A6A2B5] ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {isCtrl ? (
        <Gamepad2 size={size === 'sm' ? 11 : 13} className="text-amber-400" />
      ) : (
        <Mouse size={size === 'sm' ? 11 : 13} className="text-emerald-400" />
      )}
      {isCtrl ? 'Controller' : 'Key & Mouse'}
    </span>
  );
};

export const GamePill: React.FC<{ gameId: string; size?: 'sm' | 'md' }> = ({ gameId, size = 'sm' }) => {
  const theme = getGameTheme(gameId);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border backdrop-blur-md ${theme.badgeClass} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <Cpu size={size === 'sm' ? 11 : 13} />
      {theme.shortName}
    </span>
  );
};

export interface ProfileKeyMetric {
  label: string;
  value: string;
}

export const getKeyMetricsForProfile = (profile: GameProfile): ProfileKeyMetric[] => {
  const s = profile.settings || {};
  const gameId = profile.gameId;

  if (gameId === 'bo6') {
    const sens = profile.inputType === 'controller' ? `${s.h_sensitivity ?? 6} / ${s.v_sensitivity ?? 6}` : String(s.mouse_sens ?? 5.0);
    return [
      { label: profile.inputType === 'controller' ? 'Stick Sens' : 'Mouse Sens', value: sens },
      { label: 'FOV', value: `${s.fov ?? 105}°` },
      { label: 'Upscaling', value: String(s.upscaling ?? s.aim_response_curve ?? 'Dynamic') },
    ];
  }
  if (gameId === 'apex') {
    const sens = profile.inputType === 'controller' ? `${s.ap_ctrl_sens ?? 4} / ${s.ap_ctrl_ads_sens ?? 3}` : String(s.ap_mouse_sens ?? 1.5);
    return [
      { label: 'Sensitivity', value: sens },
      { label: 'FOV', value: `${s.ap_fov ?? 104}°` },
      { label: 'Curve / Reflex', value: String(profile.inputType === 'controller' ? (s.ap_ctrl_curve ?? 'Linear') : (s.ap_reflex ?? 'Boost')) },
    ];
  }
  if (gameId === 'fortnite') {
    const sens = profile.inputType === 'controller' ? `${s.fn_ctrl_look_h ?? 42}%` : String(s.fn_render_mode ?? 'Performance');
    return [
      { label: profile.inputType === 'controller' ? 'Look Speed' : 'Render Mode', value: sens },
      { label: 'FPS Cap', value: String(s.fn_framerate ?? '240 FPS') },
      { label: 'Edit Confirm', value: String(s.fn_auto_confirm_edits ?? 'Both') },
    ];
  }
  if (gameId === 'valorant') {
    return [
      { label: 'Mouse Sens', value: String(s.val_sens ?? 0.35) },
      { label: 'Scoped Mult', value: `${s.val_scoped_sens ?? 1.0}x` },
      { label: 'Display', value: String(s.val_res ?? '1080p 240Hz').split(' ')[0] },
    ];
  }
  if (gameId === 'cs2') {
    return [
      { label: 'Sensitivity', value: String(s.cs_sens ?? 1.6) },
      { label: 'Resolution', value: String(s.cs_res ?? '1280x960') },
      { label: 'Aspect', value: String(s.cs_aspect ?? '4:3') },
    ];
  }

  const keys = Object.keys(s).slice(0, 3);
  return keys.map((k) => ({
    label: k.replace(/_/g, ' ').slice(0, 12),
    value: String(s[k]),
  }));
};

