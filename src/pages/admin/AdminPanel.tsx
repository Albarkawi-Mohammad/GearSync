import React, { useState, useEffect } from 'react';
import { Shield, Send, AlertTriangle, Bell, Lock, KeyRound } from 'lucide-react';
import { getAnnouncements, addAnnouncement, type GameAnnouncement } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { getGameTheme, useToast } from '../../components/ui';

export const AdminPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<GameAnnouncement[]>([]);
  const [title, setTitle] = useState('');
  const [gameId, setGameId] = useState('bo6');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gs_admin_auth') === 'true';
  });

  const { showToast } = useToast();

  const loadAnnouncements = () => {
    setAnnouncements(getAnnouncements());
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Fields Required', 'Please fill out both the alert title and details.', 'warning');
      return;
    }

    addAnnouncement({
      title: title.trim(),
      gameId,
      content: content.trim(),
    });

    setTitle('');
    setContent('');
    loadAnnouncements();
    showToast('Patch Alert Broadcasted', 'Notification dispatched to all affected game profiles.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin1337') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gs_admin_auth', 'true');
      showToast('Admin Console Unlocked', 'Authorized administrative session.');
    } else {
      showToast('Access Denied', 'Invalid administrative authorization key.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-14 animate-fade-in">
        <form onSubmit={handleLogin} className="gs-card p-7 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FF5E36]/15 text-[#FF5E36] border border-[#FF5E36]/25 flex items-center justify-center mx-auto">
              <Lock size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#F7F6F9]">Admin Console Access</h1>
            <p className="text-xs text-[#A6A2B5]">
              Enter the administrative passkey to broadcast system-wide patch alerts.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-pass" className="block text-xs font-semibold text-[#A6A2B5]">
              Authorization Passkey
            </label>
            <div className="relative">
              <KeyRound
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6A7E]"
              />
              <input
                id="admin-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 gs-input text-sm font-mono"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 gs-btn-primary text-sm">
            Unlock Console
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2.5">
            <Shield size={13} />
            <span>Administrative Broadcast Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
            Patch & Balance Console
          </h1>
          <p className="text-sm text-[#A6A2B5] mt-1">
            Publish game engine patch notes and trigger automatic notifications for affected loadouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Broadcast Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="gs-card p-6 sm:p-7 space-y-5">
            <div className="border-b border-white/[0.06] pb-3">
              <h2 className="text-base font-bold text-[#F7F6F9]">Compose Patch Alert</h2>
              <p className="text-xs text-[#A6A2B5] mt-0.5">
                Alerts appear on the Command Center and push to users with profiles for the selected game.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="ann-game-id" className="block text-xs font-semibold text-[#A6A2B5]">
                Target Game Engine
              </label>
              <select
                id="ann-game-id"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 gs-input text-sm font-semibold"
              >
                {SUPPORTED_GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="ann-title" className="block text-xs font-semibold text-[#A6A2B5]">
                Patch Headline
              </label>
              <input
                id="ann-title"
                type="text"
                placeholder="e.g. Fortnite v29.10 Controller Deadzone Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 gs-input text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ann-content" className="block text-xs font-semibold text-[#A6A2B5]">
                Configuration Impact Details
              </label>
              <textarea
                id="ann-content"
                rows={5}
                placeholder="Describe which sensitivity, graphics, or controller parameters changed in the patch..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 gs-input text-sm leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                type="submit"
                className="gs-btn-primary px-6 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
              >
                <Send size={15} /> Publish Patch Alert
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Broadcast History Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="gs-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <h2 className="text-base font-bold text-[#F7F6F9]">Published Broadcasts</h2>
              </div>
              <span className="text-xs text-[#6E6A7E] tabular-nums">
                {announcements.length} active
              </span>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-[#6E6A7E] py-8 text-center">
                No broadcasts recorded in the log.
              </p>
            ) : (
              <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                {announcements.map((ann) => {
                  const theme = getGameTheme(ann.gameId);
                  return (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.06] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badgeClass}`}
                        >
                          {theme.shortName}
                        </span>
                        <span className="text-[11px] text-[#6E6A7E]">{ann.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#F7F6F9] pt-1">{ann.title}</h4>
                      <p className="text-xs text-[#A6A2B5] leading-relaxed">{ann.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#1D1B24] border border-white/[0.06] flex items-start gap-3 text-xs text-[#A6A2B5] leading-relaxed">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              Broadcasting an alert automatically checks if the current operator has a profile for that game and dispatches an in-app notification to the top-bar bell drawer.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
