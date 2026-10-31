import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Bell,
  Pin,
  Clock,
  Plus,
  GitCompare,
  Calculator,
  Sparkles,
  ArrowUpRight,
  Sliders,
  Layers,
  Copy,
  Globe,
  CheckCircle2,
  Flame,
  RotateCw,
} from 'lucide-react';
import {
  getProfiles,
  getTemplates,
  getAnnouncements,
  getCurrentUser,
  type GameProfile,
  togglePinProfile,
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import {
  FeaturedProfileCard,
  ProfileCard,
  GameArtwork,
  PlatformBadge,
  InputBadge,
  getGameTheme,
  useToast,
  AnimatedNumber,
} from '../../components/ui';
import { useRefresh } from '../../context/RefreshContext';

export const Dashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const { showToast } = useToast();
  const { isRefreshing, triggerRefresh } = useRefresh();

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

  const userProfiles = profiles.filter((p) => p.userId === 'current_user');
  const pinnedProfiles = userProfiles.filter((p) => p.isPinned);
  const recentProfiles = [...userProfiles]
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 4);

  // Featured profile: prioritize most recently used pinned profile, or most recent user profile, or top pro profile
  const featuredProfile =
    pinnedProfiles[0] || recentProfiles[0] || profiles[0] || null;

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    togglePinProfile(id);
    loadData();
    showToast('Locker Updated', 'Pinned status updated on your dashboard.');
  };

  // Chart data: Copies count per game
  const chartData = SUPPORTED_GAMES.map((game, index) => {
    const totalCopies = profiles
      .filter((p) => p.gameId === game.id)
      .reduce((sum, p) => sum + p.copiesCount, 0);
    const theme = getGameTheme(game.id);

    return {
      name: theme.shortName,
      copies: totalCopies || (index === 0 ? 450 : index === 1 ? 720 : index === 2 ? 380 : 210),
      color: theme.accentHex,
    };
  });

  // Sensitivity distribution data
  const sensChartData = [
    { range: '0.1–0.5 (Low)', count: 24 },
    { range: '0.6–1.0 (Med)', count: 48 },
    { range: '1.1–1.5 (Med-High)', count: 32 },
    { range: '1.6–2.5 (High)', count: 18 },
    { range: '2.6+ (Fast)', count: 8 },
  ];

  const totalUserCopies = userProfiles.reduce((sum, p) => sum + p.copiesCount, 0);
  const publicProfilesCount = userProfiles.filter((p) => p.isPublic).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* WELCOME & QUICK COMMAND BAR */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <button
            type="button"
            onClick={() => {
              triggerRefresh();
              showToast('Vault Synchronized', 'Live telemetry and calculations refreshed.');
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-3 transition-all active:scale-95 group cursor-pointer"
            title="Click to refresh telemetry & calibrate metrics"
          >
            <RotateCw
              size={13}
              className={`text-emerald-400 transition-transform duration-700 ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span>{isRefreshing ? 'Syncing Pipeline...' : 'Sync Pipeline Online • Click to Refresh'}</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
            Welcome back, {currentUser.username}
          </h1>
          <p className="text-sm text-[#A6A2B5] mt-1">
            Manage your cross-platform configurations, translate sensitivities, and sync settings across every title.
          </p>
        </div>

        {/* Contextual Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profiles/new"
            className="gs-btn-primary px-5 py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            New Loadout
          </Link>
          <Link
            to="/sensitivity"
            className="gs-btn-secondary px-4 py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Calculator size={15} className="text-[#FF5E36]" />
            Sensitivity Converter
          </Link>
          <Link
            to="/compare"
            className="gs-btn-secondary px-4 py-2.5 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <GitCompare size={15} className="text-sky-400" />
            Compare Profiles
          </Link>
        </div>
      </div>

      {/* ASYMMETRIC HERO BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Featured / Active Loadout Card */}
        <div className="lg:col-span-7 flex flex-col">
          {featuredProfile ? (
            <FeaturedProfileCard
              profile={featuredProfile}
              badgeText={
                featuredProfile.isPinned
                  ? 'Pinned Primary Loadout'
                  : featuredProfile.userId === 'current_user'
                  ? 'Recently Active Loadout'
                  : 'Featured Pro Setup'
              }
            />
          ) : (
            <div className="gs-card p-8 flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#FF5E36]/15 text-[#FF5E36] text-xs font-semibold">
                  Get Started
                </span>
                <h2 className="text-2xl font-bold text-[#F7F6F9] mt-4">
                  Build your first game configuration
                </h2>
                <p className="text-sm text-[#A6A2B5] mt-2 max-w-md">
                  Start from game defaults, apply a saved template, or import verified esports pro settings in seconds.
                </p>
              </div>
              <div className="mt-6">
                <Link to="/profiles/new" className="gs-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                  <Plus size={16} /> Create First Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Stats Matrix + Favorite Games Strip */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* 2x2 Compact Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/profiles"
              className="gs-card-interactive p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#A6A2B5]">
                <span className="text-xs font-medium">Saved Loadouts</span>
                <div className="w-8 h-8 rounded-full bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center">
                  <Sliders size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={userProfiles.length} delay={0} />
                </span>
                <span className="text-xs text-[#6E6A7E]">In locker</span>
              </div>
            </Link>

            <Link
              to="/templates"
              className="gs-card-interactive p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#A6A2B5]">
                <span className="text-xs font-medium">Base Templates</span>
                <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Layers size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={templatesCount} delay={50} />
                </span>
                <span className="text-xs text-[#6E6A7E]">Presets</span>
              </div>
            </Link>

            <Link
              to="/community"
              className="gs-card-interactive p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#A6A2B5]">
                <span className="text-xs font-medium">Public Shared</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Globe size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={publicProfilesCount} delay={100} />
                </span>
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </Link>

            <Link
              to="/community"
              className="gs-card-interactive p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#A6A2B5]">
                <span className="text-xs font-medium">Community Clones</span>
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Copy size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={totalUserCopies} delay={150} />
                </span>
                <span className="text-xs text-amber-400">Total</span>
              </div>
            </Link>
          </div>

          {/* Supported Games Library Strip */}
          <div className="gs-card p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-[#F7F6F9]">Supported Game Engines</h2>
                <p className="text-xs text-[#6E6A7E]">Jump to game profiles or calibrate sensitivity</p>
              </div>
              <Link
                to="/profiles"
                className="text-xs font-semibold text-[#FF5E36] hover:underline flex items-center gap-1"
              >
                All Games <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {SUPPORTED_GAMES.map((game) => {
                const count = userProfiles.filter((p) => p.gameId === game.id).length;
                const theme = getGameTheme(game.id);
                return (
                  <Link
                    key={game.id}
                    to="/profiles"
                    className="group relative rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/20 transition-all aspect-[4/5] flex flex-col justify-end p-2.5"
                    title={`${game.name} (${count} profiles)`}
                  >
                    <GameArtwork
                      gameId={game.id}
                      className="absolute inset-0 w-full h-full"
                      overlayIntensity="heavy"
                    />
                    <div className="relative z-10">
                      <span
                        className="inline-block w-2 h-2 rounded-full mb-1"
                        style={{ backgroundColor: theme.accentHex }}
                      />
                      <span className="block text-[11px] font-bold text-[#F7F6F9] leading-tight truncate">
                        {theme.shortName}
                      </span>
                      <span className="block text-[10px] text-[#A6A2B5] tabular-nums">
                        {count} {count === 1 ? 'setup' : 'setups'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECOND ROW: PINNED LOADOUTS + RECENT ACTIVITY & PATCH ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Pinned Loadouts & Analytics */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pinned Loadouts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center">
                  <Pin size={15} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F7F6F9] tracking-tight">Pinned Loadouts</h2>
                  <p className="text-xs text-[#6E6A7E]">Your starred configurations for instant access</p>
                </div>
              </div>
              <Link
                to="/profiles"
                className="text-xs font-semibold text-[#A6A2B5] hover:text-[#F7F6F9] px-3 py-1.5 rounded-full bg-[#1D1B24] border border-white/[0.06] transition-colors"
              >
                Manage Locker →
              </Link>
            </div>

            {pinnedProfiles.length === 0 ? (
              <div className="gs-card p-8 text-center">
                <Pin size={28} className="text-[#6E6A7E] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#F7F6F9]">No pinned configurations yet</h3>
                <p className="text-xs text-[#A6A2B5] mt-1 max-w-md mx-auto">
                  Pin your favorite competitive setups in your Locker to keep them one click away on your Command Center.
                </p>
                <Link
                  to="/profiles"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5E36] hover:underline"
                >
                  Browse your profiles to pin one <ArrowUpRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pinnedProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ecosystem Trends & Telemetry Charts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Flame size={15} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F7F6F9] tracking-tight">Ecosystem Telemetry</h2>
                  <p className="text-xs text-[#6E6A7E]">Community configuration clones and sensitivity trends</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Chart 1: Clones by Game */}
              <div className="gs-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#A6A2B5]">
                    Cloned Configurations by Game
                  </span>
                  <span className="text-[11px] text-[#6E6A7E] px-2 py-0.5 rounded-full bg-[#121117]">
                    7-Day Activity
                  </span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -20, right: 10, top: 8 }}>
                      <XAxis
                        dataKey="name"
                        stroke="#6E6A7E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#6E6A7E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                          backgroundColor: '#1D1B24',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '14px',
                          color: '#F7F6F9',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="copies" radius={[8, 8, 4, 4]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Sensitivity Spread */}
              <div className="gs-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#A6A2B5]">
                    Sensitivity Distribution (Source/Apex Base)
                  </span>
                  <span className="text-[11px] text-[#6E6A7E] px-2 py-0.5 rounded-full bg-[#121117]">
                    800 DPI Norm
                  </span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sensChartData}
                      layout="vertical"
                      margin={{ left: 10, right: 12, top: 8 }}
                    >
                      <XAxis
                        type="number"
                        stroke="#6E6A7E"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="range"
                        type="category"
                        stroke="#A6A2B5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={85}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                          backgroundColor: '#1D1B24',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '14px',
                          color: '#F7F6F9',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#FF5E36" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Recently Edited Profiles & Game Patch Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recently Edited / Synced Profiles */}
          <div className="gs-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#FF5E36]" />
                <h2 className="text-base font-bold text-[#F7F6F9]">Recent Activity</h2>
              </div>
              <Link to="/profiles" className="text-xs text-[#A6A2B5] hover:text-white">
                View all
              </Link>
            </div>

            {recentProfiles.length === 0 ? (
              <p className="text-xs text-[#6E6A7E] text-center py-8">
                No recent profile modifications recorded.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentProfiles.map((p) => {
                  const theme = getGameTheme(p.gameId);
                  return (
                    <Link
                      key={p.id}
                      to={`/profiles/${p.id}`}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.04] hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accentHex}33, ${theme.accentHex}11)`,
                            border: `1px solid ${theme.accentHex}44`,
                            color: theme.accentHex,
                          }}
                        >
                          {theme.shortName.substring(0, 3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-[#F7F6F9] group-hover:text-[#FF5E36] transition-colors truncate">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <PlatformBadge platform={p.platform} />
                            <InputBadge inputType={p.inputType} />
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight
                        size={15}
                        className="text-[#6E6A7E] group-hover:text-[#F7F6F9] shrink-0 ml-2"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Game Patch & Balance Alerts */}
          <div className="gs-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <h2 className="text-base font-bold text-[#F7F6F9]">Game Patch Alerts</h2>
              </div>
              <Link to="/admin" className="text-xs text-[#6E6A7E] hover:text-[#A6A2B5]">
                Broadcast
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#16151C] text-center">
                <Sparkles size={20} className="text-[#6E6A7E] mx-auto mb-2" />
                <p className="text-xs text-[#A6A2B5]">No active engine balance alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => {
                  const theme = getGameTheme(ann.gameId);
                  return (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.06] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badgeClass}`}
                        >
                          {theme.shortName}
                        </span>
                        <span className="text-[11px] text-[#6E6A7E]">{ann.date}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#F7F6F9] leading-snug">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-[#A6A2B5] leading-relaxed">{ann.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
