import React, { useState, useEffect } from 'react';
import { Users, Search, Download, UserPlus, Check, Sliders } from 'lucide-react';
import { 
  getProfiles, 
  getCurrentUser, 
  updateCurrentUser, 
  copyProfile, 
  type GameProfile, 
  type User 
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';

export const Community: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');

  const loadData = () => {
    // Retrieve all public profiles (excluding the current user's own to browse others)
    const publicProfiles = getProfiles().filter(p => p.isPublic && p.userId !== 'current_user');
    setProfiles(publicProfiles);
    setCurrentUser(getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (profile: GameProfile) => {
    copyProfile(profile, currentUser.username);
    loadData(); // reload stats
    alert(`Successfully cloned "${profile.name}" into your locker locker!`);
  };

  const handleToggleFollow = (targetUserId: string, targetUsername: string) => {
    const isFollowing = currentUser.following.includes(targetUserId);
    let updatedFollowing = [...currentUser.following];
    
    if (isFollowing) {
      updatedFollowing = updatedFollowing.filter(id => id !== targetUserId);
      alert(`Unfollowed ${targetUsername}.`);
    } else {
      updatedFollowing.push(targetUserId);
      alert(`Following ${targetUsername}! You will now receive feed updates.`);
    }

    const updatedUser: User = {
      ...currentUser,
      following: updatedFollowing
    };
    
    updateCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const isFollowing = (userId: string) => {
    return currentUser.following.includes(userId);
  };

  // Filter profiles based on search and selected game
  const discoverProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.username.toLowerCase().includes(search.toLowerCase());
    const matchesGame = selectedGame === 'all' || p.gameId === selectedGame;
    return matchesSearch && matchesGame;
  });

  // Filter profiles to ONLY show users the current user follows
  const followingProfiles = profiles.filter(p => {
    return currentUser.following.includes(p.userId) && (selectedGame === 'all' || p.gameId === selectedGame);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
          <Users className="text-brand-cyan" /> SIGNAL BASE COMMUNITY
        </h1>
        <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
          Import verified pro settings, borrow profiles, and track following players
        </p>
      </div>

      {/* TABS FEED */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'discover'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Discover Players
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'following'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Following Feed
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search players or profile names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#161F30]/50 border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
          />
        </div>

        {/* Game Filter */}
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full px-4 py-3 bg-[#161F30]/50 border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
        >
          <option value="all">All Games</option>
          {SUPPORTED_GAMES.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* FEED RESULTS */}
      {activeTab === 'discover' ? (
        discoverProfiles.length === 0 ? (
          <div className="cyber-panel p-12 text-center border-slate-800/80 bg-slate-900/10">
            <Sliders className="text-gray-650 mx-auto mb-4" size={40} />
            <h3 className="font-bold text-gray-400 font-mono text-sm">NO PUBLIC LOCKERS FOUND</h3>
            <p className="text-xs text-gray-500 mt-1">Be the first to publish a profile setup to the grid!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverProfiles.map((profile) => (
              <div 
                key={profile.id}
                className="cyber-panel p-5 bg-[#161F30]/35 border-slate-850 hover:border-brand-primary/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-block px-2 py-0.5 bg-[#0B0F19] text-brand-cyan text-[9px] font-mono border border-brand-cyan/20 rounded uppercase">
                      {SUPPORTED_GAMES.find(g => g.id === profile.gameId)?.name || profile.gameId}
                    </span>
                    <button
                      onClick={() => handleToggleFollow(profile.userId, profile.username)}
                      className={`text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded border transition-colors flex items-center gap-1 ${
                        isFollowing(profile.userId)
                          ? 'bg-brand-primary/10 border-brand-cyan text-brand-cyan hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                          : 'bg-[#0B0F19] border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {isFollowing(profile.userId) ? (
                        <>
                          <Check size={10} /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={10} /> Follow
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-extrabold text-gray-200 text-base mb-1 tracking-wide">
                    {profile.name}
                  </h3>
                  
                  <span className="block text-[11px] font-mono text-brand-cyan/80 mb-4">
                    by @{profile.username} {profile.isPro && <span className="text-brand-secondary bg-brand-secondary/15 border border-brand-secondary/35 text-[9px] px-1 py-0.5 rounded ml-1 font-sans">PRO</span>}
                  </span>

                  {profile.proBio && (
                    <p className="text-xs text-gray-400 leading-relaxed font-mono text-[11px] bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/60 mb-4">
                      {profile.proBio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-gray-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-850 uppercase">
                      {profile.platform}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-850 uppercase">
                      {profile.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">COPIES: {profile.copiesCount}</span>
                  <button
                    onClick={() => handleCopy(profile)}
                    className="px-3.5 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-cyan hover:text-white text-[11px] font-bold font-mono uppercase rounded-lg border border-brand-primary/30 transition-colors flex items-center gap-1"
                  >
                    <Download size={12} /> Clone Setup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        followingProfiles.length === 0 ? (
          <div className="cyber-panel p-12 text-center border-slate-800/80 bg-slate-900/10">
            <Users className="text-gray-650 mx-auto mb-4" size={40} />
            <h3 className="font-bold text-gray-400 font-mono text-sm">FEED OFFLINE</h3>
            <p className="text-xs text-gray-500 mt-1">You are not following any players who have public settings posted.</p>
            <button 
              onClick={() => setActiveTab('discover')}
              className="text-xs text-brand-cyan hover:underline font-mono mt-3 uppercase tracking-wider block mx-auto"
            >
              Search Discover Grid →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followingProfiles.map((profile) => (
              <div 
                key={profile.id}
                className="cyber-panel p-5 bg-[#161F30]/35 border-slate-850 hover:border-brand-primary/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-block px-2 py-0.5 bg-[#0B0F19] text-brand-cyan text-[9px] font-mono border border-brand-cyan/20 rounded uppercase">
                      {SUPPORTED_GAMES.find(g => g.id === profile.gameId)?.name || profile.gameId}
                    </span>
                    <button
                      onClick={() => handleToggleFollow(profile.userId, profile.username)}
                      className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded border bg-brand-primary/10 border-brand-cyan text-brand-cyan hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center gap-1"
                    >
                      <Check size={10} /> Following
                    </button>
                  </div>

                  <h3 className="font-extrabold text-gray-200 text-base mb-1 tracking-wide">
                    {profile.name}
                  </h3>
                  
                  <span className="block text-[11px] font-mono text-brand-cyan/80 mb-4">
                    by @{profile.username} {profile.isPro && <span className="text-brand-secondary bg-brand-secondary/15 border border-brand-secondary/35 text-[9px] px-1 py-0.5 rounded ml-1 font-sans">PRO</span>}
                  </span>

                  {profile.proBio && (
                    <p className="text-xs text-gray-400 leading-relaxed font-mono text-[11px] bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/60 mb-4">
                      {profile.proBio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-gray-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-850 uppercase">
                      {profile.platform}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-850 uppercase">
                      {profile.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">COPIES: {profile.copiesCount}</span>
                  <button
                    onClick={() => handleCopy(profile)}
                    className="px-3.5 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-cyan hover:text-white text-[11px] font-bold font-mono uppercase rounded-lg border border-brand-primary/30 transition-colors flex items-center gap-1"
                  >
                    <Download size={12} /> Clone Setup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
