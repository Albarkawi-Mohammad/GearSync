import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Download,
  UserPlus,
  Check,
  Sliders,
  Eye,
  X,
  Copy,
  Award,
} from 'lucide-react';
import {
  getProfiles,
  getCurrentUser,
  updateCurrentUser,
  copyProfile,
  type GameProfile,
  type User,
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import {
  GameArtwork,
  GamePill,
  PlatformBadge,
  InputBadge,
  getGameTheme,
  getKeyMetricsForProfile,
  useToast,
} from '../../components/ui';

export const Community: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');

  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [previewProfile, setPreviewProfile] = useState<GameProfile | null>(null);

  const { showToast } = useToast();

  const loadData = () => {
    const publicProfiles = getProfiles().filter(
      (p) => p.isPublic && p.userId !== 'current_user'
    );
    setProfiles(publicProfiles);
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (profile: GameProfile) => {
    copyProfile(profile, currentUser.username);
    loadData();
    showToast(
      'Loadout Cloned to Locker',
      `"${profile.name}" by @${profile.username} has been saved to your personal locker.`
    );
  };

  const handleToggleFollow = (targetUserId: string, targetUsername: string) => {
    const alreadyFollowing = currentUser.following.includes(targetUserId);
    let updatedFollowing = [...currentUser.following];

    if (alreadyFollowing) {
      updatedFollowing = updatedFollowing.filter((id) => id !== targetUserId);
      showToast('Unfollowed Creator', `Removed @${targetUsername} from your Following feed.`, 'info');
    } else {
      updatedFollowing.push(targetUserId);
      showToast('Following Creator', `You are now following @${targetUsername}.`);
    }

    const updatedUser: User = {
      ...currentUser,
      following: updatedFollowing,
    };

    updateCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const isFollowing = (userId: string) => {
    return currentUser.following.includes(userId);
  };

  const discoverProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase());
    const matchesGame = selectedGame === 'all' || p.gameId === selectedGame;
    return matchesSearch && matchesGame;
  });

  const followingProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase());
    return (
      currentUser.following.includes(p.userId) &&
      (selectedGame === 'all' || p.gameId === selectedGame) &&
      matchesSearch
    );
  });

  const activeList = activeTab === 'discover' ? discoverProfiles : followingProfiles;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header & Feed Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E36]/15 border border-[#FF5E36]/25 text-[#FF5E36] text-xs font-semibold mb-2.5">
            <Users size={13} />
            <span>Signal Base • Verified & Community Loadouts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
            Community Discovery
          </h1>
          <p className="text-sm text-[#A6A2B5] mt-1">
            Explore public configurations, inspect pro player parameters, and clone setups directly into your locker.
          </p>
        </div>

        {/* Feed Mode Switcher */}
        <div className="inline-flex p-1.5 rounded-full bg-[#1D1B24] border border-white/[0.07] self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'discover'
                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30'
                : 'text-[#A6A2B5] hover:text-white'
            }`}
          >
            Discover All ({discoverProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'following'
                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30'
                : 'text-[#A6A2B5] hover:text-white'
            }`}
          >
            Following ({followingProfiles.length})
          </button>
        </div>
      </div>

      {/* SEARCH & GAME CATEGORY PILLS */}
      <div className="gs-card p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6A7E]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by player callsign or configuration title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-9 py-2.5 rounded-full bg-[#121117] border border-white/[0.08] text-sm text-[#F7F6F9] placeholder-[#6E6A7E] focus:border-[#FF5E36] focus:outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6A7E] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setSelectedGame('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGame === 'all'
                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                : 'bg-[#16151C] text-[#A6A2B5] hover:text-white border border-white/[0.05]'
            }`}
          >
            All Games
          </button>
          {SUPPORTED_GAMES.map((g) => {
            const theme = getGameTheme(g.id);
            const active = selectedGame === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGame(g.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                    : 'bg-[#16151C] text-[#A6A2B5] hover:text-white border border-white/[0.05]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: active ? '#FFF' : theme.accentHex }}
                />
                {theme.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* PROFILES FEED GRID */}
      {activeList.length === 0 ? (
        <div className="gs-card p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center mx-auto mb-4">
            <Sliders size={26} />
          </div>
          <h3 className="text-base font-bold text-[#F7F6F9]">
            {activeTab === 'following'
              ? 'No configurations from followed players'
              : 'No matching public configurations'}
          </h3>
          <p className="text-xs text-[#A6A2B5] mt-1">
            {activeTab === 'following'
              ? 'Follow creators in the Discover tab to see their shared setups here.'
              : 'Try adjusting your search or game category filter.'}
          </p>
          {activeTab === 'following' && (
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className="mt-5 gs-btn-primary px-5 py-2.5 text-xs"
            >
              Explore Discover Feed
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeList.map((profile) => {
            const metrics = getKeyMetricsForProfile(profile);
            const following = isFollowing(profile.userId);

            return (
              <div
                key={profile.id}
                className="gs-card-interactive overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Game Artwork Header */}
                  <GameArtwork
                    gameId={profile.gameId}
                    className="h-36 p-4"
                    overlayIntensity="medium"
                  >
                    <div className="flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between gap-2">
                        <GamePill gameId={profile.gameId} />
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleFollow(profile.userId, profile.username)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                            following
                              ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/35 hover:text-rose-300'
                              : 'bg-black/45 border-white/15 text-[#F7F6F9] hover:bg-white/15'
                          }`}
                        >
                          {following ? (
                            <>
                              <Check size={12} /> Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} /> Follow
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <PlatformBadge platform={profile.platform} />
                        <InputBadge inputType={profile.inputType} />
                      </div>
                    </div>
                  </GameArtwork>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#F7F6F9] tracking-tight">
                          {profile.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-[#A6A2B5]">
                            by @{profile.username}
                          </span>
                          {profile.isPro && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Award size={10} /> PRO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {profile.proBio && (
                      <p className="text-xs text-[#A6A2B5] leading-relaxed p-3 rounded-2xl bg-[#16151C] border border-white/[0.04]">
                        {profile.proBio}
                      </p>
                    )}

                    {/* Live Telemetry Preview */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#121117] border border-white/[0.05]">
                      {metrics.map((m, i) => (
                        <div key={i} className="px-1.5 min-w-0">
                          <span className="block text-[10px] text-[#6E6A7E] truncate">
                            {m.label}
                          </span>
                          <span className="block text-xs font-bold text-[#F7F6F9] tabular-nums truncate mt-0.5">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  <span className="text-xs text-[#6E6A7E] flex items-center gap-1 tabular-nums">
                    <Copy size={12} /> {profile.copiesCount} clones
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewProfile(profile)}
                      className="px-3.5 py-2 rounded-full bg-[#25232E] hover:bg-[#2E2B39] text-xs font-semibold text-[#A6A2B5] hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(profile)}
                      className="gs-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
                    >
                      <Download size={13} /> Clone Setup
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIGURATION PREVIEW MODAL */}
      {previewProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewProfile(null)}
        >
          <div
            className="w-full max-w-2xl rounded-[28px] bg-[#1D1B24] border border-white/15 overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <GameArtwork
              gameId={previewProfile.gameId}
              className="p-6 shrink-0"
              overlayIntensity="heavy"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GamePill gameId={previewProfile.gameId} />
                    <PlatformBadge platform={previewProfile.platform} />
                    <InputBadge inputType={previewProfile.inputType} />
                  </div>
                  <h3 className="text-xl font-bold text-[#F7F6F9]">{previewProfile.name}</h3>
                  <p className="text-xs text-[#A6A2B5] mt-0.5">
                    Created by @{previewProfile.username} • {previewProfile.copiesCount} clones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProfile(null)}
                  className="w-8 h-8 rounded-full bg-black/50 text-[#A6A2B5] hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </GameArtwork>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const gameObj = SUPPORTED_GAMES.find((g) => g.id === previewProfile.gameId);
                const entries = Object.entries(previewProfile.settings || {});
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {entries.map(([key, val]) => {
                      const fieldDef = gameObj?.fields.find((f) => f.id === key);
                      return (
                        <div
                          key={key}
                          className="p-3 rounded-2xl bg-[#16151C] border border-white/[0.05] flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-[#A6A2B5] truncate">
                            {fieldDef?.name || key}
                          </span>
                          <span className="text-xs font-bold text-[#F7F6F9] tabular-nums px-2.5 py-0.5 rounded-lg bg-[#121117]">
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 bg-[#16151C] border-t border-white/[0.06] flex items-center justify-between gap-3">
              <Link
                to={`/profiles/${previewProfile.id}`}
                onClick={() => setPreviewProfile(null)}
                className="text-xs font-semibold text-[#A6A2B5] hover:text-white"
              >
                Open Full Inspector →
              </Link>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewProfile(null)}
                  className="gs-btn-secondary px-4 py-2 text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = previewProfile;
                    setPreviewProfile(null);
                    handleCopy(target);
                  }}
                  className="gs-btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5"
                >
                  <Download size={13} /> Clone to My Locker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
