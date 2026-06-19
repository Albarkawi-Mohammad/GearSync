import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Bell, 
  Pin, 
  Clock, 
  Terminal, 
  Play, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getProfiles, 
  getTemplates, 
  getAnnouncements, 
  getCurrentUser, 
  type GameProfile, 
  togglePinProfile 
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';

export const Dashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [terminalText, setTerminalText] = useState('');
  const [terminalLoaded, setTerminalLoaded] = useState(false);

  // Terminal boot text simulation
  useEffect(() => {
    const lines = [
      'INITIALIZING LOCKER STORAGE DECRYPTOR...',
      'CONNECTING TO CENTRALIZED SETTINGS SHIFT DATABASE...',
      'DECRYPTING HARDWARE REGISTRY SHADERS...',
      'READY // IN-GAME SYNC PIPELINES OPEN.'
    ];
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let buffer = '';

    const typeChar = () => {
      if (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex];
        if (currentCharIndex < currentLine.length) {
          buffer += currentLine[currentCharIndex];
          setTerminalText(buffer + '█');
          currentCharIndex++;
          setTimeout(typeChar, 15);
        } else {
          buffer += '\n';
          currentLineIndex++;
          currentCharIndex = 0;
          setTimeout(typeChar, 200);
        }
      } else {
        setTerminalText(buffer);
        setTerminalLoaded(true);
      }
    };

    typeChar();
  }, []);

  const loadData = () => {
    const all = getProfiles();
    setProfiles(all);
    setTemplatesCount(getTemplates().length);
    setAnnouncements(getAnnouncements());
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const pinnedProfiles = profiles.filter(p => p.isPinned && p.userId === 'current_user');
  const recentProfiles = [...profiles]
    .filter(p => p.userId === 'current_user')
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 3);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    togglePinProfile(id);
    loadData();
  };

  // Chart data: Copies count per game
  const chartData = SUPPORTED_GAMES.map((game, index) => {
    const totalCopies = profiles
      .filter(p => p.gameId === game.id)
      .reduce((sum, p) => sum + p.copiesCount, 0);

    return {
      name: game.name,
      copies: totalCopies || (index === 0 ? 450 : index === 1 ? 720 : index === 2 ? 380 : 210), // mock seed if empty
    };
  });

  const COLORS = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];

  // Popular settings mock analytics data (Sensitivity distribution)
  const sensChartData = [
    { range: '0.1 - 0.5 (Low)', count: 24 },
    { range: '0.6 - 1.0 (Med)', count: 48 },
    { range: '1.1 - 1.5 (Med High)', count: 32 },
    { range: '1.6 - 2.5 (High)', count: 18 },
    { range: '2.6+ (Extreme)', count: 8 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION WITH USER LOG & TIMESTEP */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white">
            {currentUser.username}'S LOADOUT
          </h1>
          <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
            ESTABLISHED LOCKER SYNC STATION // ACTIVE
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-xl font-mono text-xs text-gray-400">
          <Clock size={14} className="text-brand-primary" />
          <span>SYSTEM TIME: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* TERMINAL HERO SCREEN */}
      <div className="cyber-panel p-6 border-brand-primary/20 bg-black/40 font-mono text-xs overflow-hidden relative">
        <div className="absolute top-2 right-4 flex items-center gap-1.5 text-gray-500">
          <Terminal size={12} className="text-brand-cyan" />
          <span>LOCKER_BOOT_SECURE</span>
        </div>
        <pre className="text-brand-cyan/80 whitespace-pre-wrap leading-relaxed">
          {terminalText}
        </pre>
        {terminalLoaded && (
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
            <Link 
              to="/profiles/new" 
              className="px-4 py-2 bg-brand-primary/25 hover:bg-brand-primary/45 border border-brand-primary text-brand-cyan font-bold uppercase tracking-wider text-[11px] rounded transition-all flex items-center gap-1.5"
            >
              <Play size={10} /> + INITIALIZE NEW PROFILE
            </Link>
            <Link 
              to="/compare" 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold uppercase tracking-wider text-[11px] rounded transition-all border border-slate-700"
            >
              COMPARE LOCKERS
            </Link>
          </div>
        )}
      </div>

      {/* HUD SYSTEM STAT BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-slate-800 divide-x divide-slate-850 bg-slate-950/20 py-5">
        <div className="px-6 py-2 text-center md:text-left">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">ACTIVE LOCKERS</span>
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {profiles.filter(p => p.userId === 'current_user').length}
          </span>
        </div>
        <div className="px-6 py-2 text-center md:text-left">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">TEMPLATES LOADED</span>
          <span className="text-3xl font-black font-mono tracking-tight text-white">{templatesCount}</span>
        </div>
        <div className="px-6 py-2 text-center md:text-left">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">COMMUNITY SHARED</span>
          <span className="text-3xl font-black font-mono tracking-tight text-brand-cyan">
            {profiles.filter(p => p.userId === 'current_user' && p.isPublic).length}
          </span>
        </div>
        <div className="px-6 py-2 text-center md:text-left">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">COMMUNITY COPIES</span>
          <span className="text-3xl font-black font-mono tracking-tight text-brand-secondary">
            {profiles.filter(p => p.userId === 'current_user').reduce((sum, p) => sum + p.copiesCount, 0)}
          </span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT TWO COLUMNS: Profiles & Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* PINNED LOADOUTS */}
          <div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Pin size={16} className="text-brand-cyan rotate-45" /> PINNED LOADOUTS
            </h2>
            {pinnedProfiles.length === 0 ? (
              <div className="cyber-panel p-6 border-slate-800/80 bg-slate-900/10 text-center py-10">
                <p className="text-gray-500 font-mono text-sm">NO PINNED LOADOUTS DETECTED</p>
                <Link to="/profiles" className="text-xs text-brand-cyan hover:underline mt-2 inline-block font-mono">
                  Browse profile lockers to pin one →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedProfiles.map((profile) => (
                  <Link 
                    key={profile.id} 
                    to={`/profiles/${profile.id}`}
                    className="cyber-panel p-5 border-brand-cyan/20 hover:border-brand-cyan/40 bg-[#161F30]/40 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="inline-block px-2 py-0.5 bg-[#0B0F19] text-brand-cyan text-[10px] font-mono border border-brand-cyan/20 rounded">
                          {SUPPORTED_GAMES.find(g => g.id === profile.gameId)?.name || profile.gameId}
                        </span>
                        <button 
                          onClick={(e) => handleTogglePin(profile.id, e)}
                          className="text-brand-cyan hover:text-gray-400 p-0.5 rounded transition-colors"
                          title="Unpin profile"
                        >
                          <Pin size={12} className="fill-brand-cyan" />
                        </button>
                      </div>
                      <h3 className="font-bold text-base text-gray-200 group-hover:text-brand-cyan transition-colors truncate">
                        {profile.name}
                      </h3>
                      <div className="flex gap-2 mt-4">
                        <span className="text-[10px] font-mono text-gray-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {profile.platform}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {profile.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                      <span>COPIED {profile.copiesCount}x</span>
                      <span>ACTIVE {new Date(profile.lastUsed).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* COMMUNITY INSIGHTS CHARTS */}
          <div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-4">
              COMMUNITY TRENDS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart 1: Copies */}
              <div className="cyber-panel p-5 bg-[#161F30]/30 border-slate-800">
                <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-4">
                  COPIED SETTINGS BY GAME THIS WEEK
                </span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0E1524', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      />
                      <Bar dataKey="copies" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Sensitivity Spread */}
              <div className="cyber-panel p-5 bg-[#161F30]/30 border-slate-800">
                <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-4">
                  COMMUNITY MOUSE SENSITIVITY RANGE (APEX BASE)
                </span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sensChartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                      <XAxis type="number" stroke="#64748B" fontSize={9} tickLine={false} />
                      <YAxis dataKey="range" type="category" stroke="#64748B" fontSize={8} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0E1524', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff', fontFamily: 'monospace' }}
                      />
                      <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Announcements & Locker Feed */}
        <div className="space-y-8">
          {/* GAME UPDATE ALERTS */}
          <div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Bell size={16} className="text-brand-secondary" /> ACTIVE PATCH ALERTS
            </h2>
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="cyber-panel p-5 border-slate-800/80 bg-slate-900/10 text-center text-xs text-gray-500 font-mono">
                  NO ACTIVE GAME BALANCING ALERTS
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="cyber-panel p-4 border-brand-secondary/35 bg-[#1E1B24]/40">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-1.5 py-0.5 bg-[#0B0F19] text-brand-secondary text-[9px] font-mono border border-brand-secondary/25 rounded uppercase">
                        {SUPPORTED_GAMES.find(g => g.id === ann.gameId)?.name || 'ALERT'}
                      </span>
                      <span className="text-[9px] font-mono text-gray-500">{ann.date}</span>
                    </div>
                    <h3 className="font-bold text-xs uppercase font-mono tracking-wide text-white mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-brand-secondary animate-pulse" />
                      {ann.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-mono text-[11px]">
                      {ann.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENTLY MODIFIED */}
          <div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-4">
              LOCKER ACTIVITY
            </h2>
            <div className="cyber-panel p-4 border-slate-800 bg-[#161F30]/35 divide-y divide-slate-800/70">
              {recentProfiles.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6 font-mono">NO SYNC HISTORY DETECTED</p>
              ) : (
                recentProfiles.map((p, idx) => (
                  <div key={p.id} className={`py-3 ${idx === 0 ? 'pt-0' : ''} ${idx === recentProfiles.length - 1 ? 'pb-0' : ''}`}>
                    <Link to={`/profiles/${p.id}`} className="hover:text-brand-cyan transition-colors">
                      <h4 className="font-bold text-sm text-gray-200">{p.name}</h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-mono">
                      <Clock size={10} />
                      <span>Used {new Date(p.lastUsed).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{p.platform.toUpperCase()} ({p.inputType === 'controller' ? 'Gamepad' : 'M&K'})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
