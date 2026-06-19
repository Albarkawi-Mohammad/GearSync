import React, { useState, useEffect } from 'react';
import { Shield, Send, AlertTriangle, Bell } from 'lucide-react';
import { getAnnouncements, addAnnouncement, type GameAnnouncement } from '../lib/storage';
import { SUPPORTED_GAMES } from '../lib/gameData';

export const AdminPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<GameAnnouncement[]>([]);
  const [title, setTitle] = useState('');
  const [gameId, setGameId] = useState('bo6');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gs_admin_auth') === 'true';
  });

  const loadAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill out all transmission fields.');
      return;
    }

    addAnnouncement({
      title,
      gameId,
      content
    });

    setTitle('');
    setContent('');
    loadAnnouncements();
    alert('Balancing signal broadcast completed successfully!');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin1337') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gs_admin_auth', 'true');
    } else {
      alert('ACCESS DENIED: INVALID ADMINISTRATIVE AUTHORIZATION KEY.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 animate-fade-in">
        <form onSubmit={handleLogin} className="cyber-panel p-6 border-red-500/30 bg-black/45 space-y-6">
          <div className="text-center">
            <Shield className="text-red-500 mx-auto mb-3" size={32} />
            <h2 className="text-sm font-mono text-red-500 uppercase tracking-widest font-bold">
              ADMINISTRATIVE CONTROL ACCESS
            </h2>
            <p className="text-[10px] text-gray-500 uppercase font-mono mt-1">
              Unauthorized Decryption Prohibited
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-pass" className="block text-xs font-bold font-mono text-gray-400 uppercase">
              ENTER DECRYPTION KEY
            </label>
            <input
              id="admin-pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-center font-mono text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-red-650 to-brand-primary text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 transition-all shadow-md shadow-red-950/20"
          >
            Authorize Terminal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
          <Shield className="text-brand-secondary" /> ADMIN SIGNAL HUB
        </h1>
        <p className="text-xs text-brand-secondary font-mono tracking-widest uppercase">
          Broadcast game patch alerts and system synchronization parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* TRANSMIT SIGNAL FORM */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="cyber-panel p-6 border-slate-850 bg-[#161F30]/40 space-y-6">
            <h2 className="text-sm font-mono text-brand-secondary uppercase tracking-wider border-b border-slate-800 pb-2">
              Compose Balancing Alert Signal
            </h2>

            {/* Game target */}
            <div className="space-y-2">
              <label htmlFor="ann-game-id" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                TARGET GAME ENGINE
              </label>
              <select
                id="ann-game-id"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-lg text-sm text-white focus:border-brand-secondary focus:outline-none"
              >
                {SUPPORTED_GAMES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="ann-title" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                ALERT HEADER / TITLE
              </label>
              <input
                id="ann-title"
                type="text"
                placeholder="e.g. Fortnite v28.10 Controller Tuning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-lg text-sm text-white focus:border-brand-secondary focus:outline-none"
              />
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <label htmlFor="ann-content" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                TRANSMISSION DATA (CONTENT DETAILS)
              </label>
              <textarea
                id="ann-content"
                rows={5}
                placeholder="Detail exactly which sensitivity or graphics fields have changed in the recent game patch..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-lg text-sm text-white focus:border-brand-secondary focus:outline-none leading-relaxed font-sans"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md shadow-brand-secondary/20"
              >
                <Send size={14} /> Broadcast Signal
              </button>
            </div>
          </form>
        </div>

        {/* LOG OF PAST ANNOUNCEMENTS */}
        <div className="md:col-span-1 space-y-6">
          <div className="cyber-panel p-5 bg-[#161F30]/35 border-slate-800">
            <h2 className="text-xs font-mono font-extrabold uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Bell size={13} className="text-brand-secondary" /> BROADCAST LOG
            </h2>

            {announcements.length === 0 ? (
              <p className="text-[11px] font-mono text-gray-600 italic">No signals logged in memory.</p>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-black/40 border border-slate-850 rounded-lg text-[11px] font-mono space-y-1.5">
                    <div className="flex justify-between items-center text-brand-secondary font-bold">
                      <span>{SUPPORTED_GAMES.find(g => g.id === ann.gameId)?.name || 'ALERT'}</span>
                      <span>{ann.date}</span>
                    </div>
                    <h4 className="text-white font-bold">{ann.title}</h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl flex items-start gap-2 text-[10px] text-gray-500 font-mono leading-relaxed">
            <AlertTriangle size={14} className="text-brand-secondary shrink-0 mt-0.5" />
            <span>
              All posted announcements automatically push high-priority notifications to users with active profiles corresponding to the targeted game engine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
