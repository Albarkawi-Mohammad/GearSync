import React, { useState, useEffect } from 'react';
import { User as UserIcon, Save, LogOut } from 'lucide-react';
import { getCurrentUser, updateCurrentUser, getProfiles, type User } from '../../lib/storage';

export const UserProfile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilesCount, setProfilesCount] = useState(0);
  const [copiesCount, setCopiesCount] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setUsername(user.username);
    setBio(user.bio);

    const userProfiles = getProfiles().filter(p => p.userId === 'current_user');
    setProfilesCount(userProfiles.length);
    setCopiesCount(userProfiles.reduce((sum, p) => sum + p.copiesCount, 0));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a display name.');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      username,
      bio
    };

    updateCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    alert('Locker Operator details committed successfully!');
  };

  const handleSignOut = () => {
    alert('Securely disconnected from Locker Sync Network.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
          <UserIcon className="text-brand-cyan" /> OPERATOR PROFILE
        </h1>
        <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
          Manage identity logs, credentials, and locker settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* STATS OVERVIEW PANEL */}
        <div className="md:col-span-1 space-y-6">
          <div className="cyber-panel p-6 bg-[#161F30]/40 border-slate-800 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-brand-primary/20 border border-white/10 mb-4">
              {username.substring(0, 2).toUpperCase() || 'OP'}
            </div>
            <h2 className="font-extrabold text-lg text-white">{username}</h2>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Locker Operator</span>
            
            {/* Divider */}
            <div className="w-full border-t border-slate-800/80 my-5" />

            {/* Micro stats */}
            <div className="w-full space-y-3 font-mono text-xs text-left">
              <div className="flex justify-between text-gray-400">
                <span>Personal Locker Count:</span>
                <b className="text-white">{profilesCount}</b>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Copies Generated:</span>
                <b className="text-brand-cyan">{copiesCount}</b>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Signals Followed:</span>
                <b className="text-brand-secondary">{currentUser.following.length}</b>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-red-500/10 hover:border-red-500/30 border border-slate-800 hover:text-red-400 text-gray-400 font-mono text-xs uppercase font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={14} /> Disconnect Network
          </button>
        </div>

        {/* PROFILE ADJUSTMENT FORM */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 space-y-6">
            <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
              Identity Modifications
            </h2>

            {/* Display name */}
            <div className="space-y-2">
              <label htmlFor="user-display" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                OPERATOR CALLSIGN (DISPLAY NAME)
              </label>
              <input
                id="user-display"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="user-bio" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                BIO TRANSMISSION LOGGER
              </label>
              <textarea
                id="user-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none leading-relaxed font-sans"
                placeholder="Write something about your setup or console setups..."
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md shadow-brand-primary/10"
              >
                <Save size={14} /> Commit Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
