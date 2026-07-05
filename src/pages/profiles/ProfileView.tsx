import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Play, 
  History, 
  Clock, 
  FileDown,
  Lock,
  Globe,
  Terminal
} from 'lucide-react';
import { 
  getProfiles, 
  saveProfile, 
  getHistory, 
  addHistoryEntry, 
  type GameProfile, 
  type ProfileHistory 
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { ChecklistMode } from '../../components/profiles';
import { compileGameConfig } from '../../lib/configCompiler';

export const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [history, setHistory] = useState<ProfileHistory[]>([]);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const loadData = () => {
    if (!id) return;
    const all = getProfiles();
    const found = all.find(p => p.id === id);
    if (found) {
      setProfile(found);
      const game = SUPPORTED_GAMES.find(g => g.id === found.gameId);
      if (game && game.categories.length > 0) {
        setActiveTab(game.categories[0]);
      }
      setHistory(getHistory(id));
    } else {
      navigate('/profiles');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!profile) {
    return (
      <div className="py-12 text-center text-gray-500 font-mono">
        SEARCHING ACCESS STORAGE MEMORY...
      </div>
    );
  }

  const game = SUPPORTED_GAMES.find(g => g.id === profile.gameId);

  // Toggle profile public/private
  const handleToggleShare = () => {
    if (!profile) return;
    const updated = { ...profile, isPublic: !profile.isPublic };
    saveProfile(updated);
    setProfile(updated);
    addHistoryEntry(profile.id, profile.settings, `Privacy toggled to ${updated.isPublic ? 'Public' : 'Private'}`);
    setHistory(getHistory(profile.id));
  };

  // Restore history snapshot
  const handleRestore = (historyEntry: ProfileHistory) => {
    if (!profile) return;
    if (confirm(`Do you want to restore the setting snapshot from ${new Date(historyEntry.timestamp).toLocaleString()}?`)) {
      const updated: GameProfile = {
        ...profile,
        settings: { ...historyEntry.settingsSnapshot },
        lastUsed: new Date().toISOString()
      };
      saveProfile(updated);
      setProfile(updated);
      addHistoryEntry(profile.id, historyEntry.settingsSnapshot, `Restored backup from ${new Date(historyEntry.timestamp).toLocaleString()}`);
      setHistory(getHistory(profile.id));
      alert('Config restored to locker successfully!');
    }
  };

  // Export PDF via window print
  const handlePrint = () => {
    window.print();
  };

  // Export game specific config file
  const handleDownloadConfig = () => {
    if (!profile) return;
    try {
      const { filename, content } = compileGameConfig(profile);
      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to generate local game config file.');
      console.error(err);
    }
  };

  // Filter settings fields based on active tab category and platform limits
  const visibleFields = (game?.fields || []).filter(field => {
    const matchesCategory = field.category === activeTab;
    const matchesPlatform = !field.platformLimit || field.platformLimit.includes(profile.platform);
    return matchesCategory && matchesPlatform;
  });

  return (
    <div className="space-y-8 animate-fade-in print:bg-white print:text-black print:p-0">
      {/* Hide on print */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 print:hidden">
        <Link to="/profiles" className="hover:text-brand-cyan transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Back to Locker
        </Link>
      </div>

      {/* Profile Header info */}
      <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6 print:border-none print:bg-transparent print:p-0 print:shadow-none">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="inline-block px-2.5 py-0.5 bg-[#0B0F19] text-brand-cyan text-[10px] font-mono border border-brand-cyan/20 rounded uppercase print:border-black print:text-black">
              {game?.name || profile.gameId}
            </span>
            <span className="text-[10px] font-mono text-gray-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-750 uppercase print:hidden">
              {profile.platform}
            </span>
            <span className="text-[10px] font-mono text-gray-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-750 uppercase print:hidden">
              {profile.inputType === 'controller' ? 'Gamepad' : 'M&K'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-wide print:text-black print:text-2xl">
            {profile.name}
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1.5 print:text-black print:mt-2">
            <Clock size={12} className="text-brand-primary print:hidden" />
            Operator: <span className="text-brand-cyan print:text-black">{profile.username}</span> • Last Updated {new Date(profile.lastUsed).toLocaleString()}
          </p>
        </div>

        {/* Action Controls - Hidden during print */}
        <div className="flex flex-wrap gap-2.5 print:hidden">
          {profile.userId === 'current_user' && (
            <>
              <button
                onClick={() => setChecklistOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-brand-primary/10"
              >
                <Play size={14} /> Checklist Mode
              </button>
              <Link
                to={`/profiles/${profile.id}/edit`}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-gray-200 text-xs font-bold font-mono uppercase rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit size={14} /> Adjust Form
              </Link>
              <button
                onClick={handleToggleShare}
                className={`px-4 py-2.5 border text-xs font-bold font-mono uppercase rounded-lg transition-colors flex items-center gap-1.5 ${
                  profile.isPublic
                    ? 'bg-brand-accent/10 border-brand-accent/40 text-brand-accent'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-gray-300'
                }`}
                title="Toggle community visibility"
              >
                {profile.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                {profile.isPublic ? 'Public Share' : 'Private'}
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-gray-200 text-xs font-bold font-mono uppercase rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileDown size={14} /> Export Config (PDF)
          </button>

          <button
            onClick={handleDownloadConfig}
            className="px-4 py-2.5 bg-brand-primary/20 hover:bg-brand-primary/35 border border-brand-primary/60 text-brand-cyan text-xs font-bold font-mono uppercase rounded-lg transition-all flex items-center gap-1.5"
            title="Download raw game config script"
          >
            <Terminal size={14} /> Download Config (.cfg)
          </button>

          {profile.userId === 'current_user' && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2.5 border rounded-lg transition-colors flex items-center justify-center ${
                showHistory 
                  ? 'bg-brand-primary/15 border-brand-primary text-brand-cyan' 
                  : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white'
              }`}
              title="Show Loadout Version History"
            >
              <History size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR TABS - CATEGORIES (Hidden on print, which lists all categories flatly) */}
        <div className="lg:col-span-1 space-y-2 print:hidden">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 mb-3">MENU TABS</span>
          {game?.categories.map((cat) => {
            // Check if category has any visible fields for this platform
            const hasFields = game.fields.some(f => f.category === cat && (!f.platformLimit || f.platformLimit.includes(profile.platform)));
            if (!hasFields) return null;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wide transition-all border ${
                  activeTab === cat
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-cyan/5 border-brand-cyan/40 text-brand-cyan shadow-sm shadow-brand-cyan/5'
                    : 'bg-[#161F30]/35 border-slate-850 text-gray-400 hover:bg-[#161F30]/65 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}

          {/* HISTORICAL VERSION LOG DRAWER ON SCREEN (when toggled) */}
          {showHistory && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-mono font-extrabold uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
                <Clock size={13} className="text-brand-cyan" /> LOGS HISTORY
              </h3>
              {history.length === 0 ? (
                <p className="text-[11px] font-mono text-gray-600 italic">No backup files recorded.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {history.map((h) => (
                    <div key={h.id} className="p-3 bg-black/40 border border-slate-850 rounded-lg text-[11px] font-mono">
                      <div className="flex justify-between items-center text-brand-cyan mb-1.5 font-bold">
                        <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                        <span>{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-gray-400 text-[10px] leading-relaxed mb-2.5">{h.notes}</p>
                      
                      {/* Expanded Diff Comparison */}
                      <div className="mb-2.5 p-2 bg-slate-900/40 border border-slate-850 rounded-lg space-y-1 text-[10px] text-gray-400">
                        <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                          SNAPSHOT SHIFTS
                        </span>
                        {(() => {
                          const currentSettings = profile.settings;
                          const snapshotSettings = h.settingsSnapshot;
                          const changedKeys = Object.keys(snapshotSettings).filter(key => {
                            const valSnap = snapshotSettings[key];
                            const valCurr = currentSettings[key];
                            return valSnap !== undefined && valCurr !== undefined && valSnap !== valCurr;
                          });

                          if (changedKeys.length === 0) {
                            return <span className="block text-gray-500 italic text-[9px]">No differences from current locker build.</span>;
                          }

                          return (
                            <div className="space-y-1">
                              {changedKeys.map(key => {
                                const fieldName = game?.fields.find(f => f.id === key)?.name || key;
                                const snapValue = String(snapshotSettings[key]);
                                const currValue = String(currentSettings[key]);
                                return (
                                  <div key={key} className="flex justify-between items-center text-[9px] bg-black/25 p-1 rounded">
                                    <span className="font-semibold truncate max-w-[80px]" title={fieldName}>
                                      {fieldName}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1 shrink-0 font-mono">
                                      <span className="text-red-400">{snapValue}</span>
                                      <span>➜</span>
                                      <span className="text-brand-cyan">{currValue}</span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => handleRestore(h)}
                        className="w-full py-1.5 bg-brand-primary/10 hover:bg-brand-primary/25 border border-brand-primary/20 text-brand-cyan rounded text-[10px] font-bold uppercase transition-all"
                      >
                        Restore Backup
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SETTINGS CARD GRID */}
        <div className="lg:col-span-3 space-y-6 print:col-span-4 print:space-y-8">
          {/* SCREEN LAYOUT */}
          <div className="cyber-panel p-6 bg-[#161F30]/25 border-slate-850 print:border-none print:bg-transparent print:p-0">
            {/* On screen, display categories selectively */}
            <h2 className="hidden print:block text-lg font-mono font-bold border-b border-black pb-2 mb-6">
              SETTINGS PROFILE SUMMARY: {profile.name}
            </h2>

            {/* Print Layout: Lists ALL categories flatly */}
            <div className="hidden print:block space-y-8">
              {game?.categories.map((cat) => {
                const catFields = game.fields.filter(f => f.category === cat && (!f.platformLimit || f.platformLimit.includes(profile.platform)));
                if (catFields.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-300 pb-1">{cat}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {catFields.map(field => (
                        <div key={field.id} className="border-b border-gray-100 py-2 flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">{field.name}</span>
                          <span className="font-mono font-bold text-black bg-gray-100 px-2 py-0.5 rounded">
                            {profile.settings[field.id] !== undefined ? String(profile.settings[field.id]) : 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Screen View: Lists active category fields only */}
            <div className="print:hidden space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <span className="text-sm font-bold font-mono uppercase text-brand-cyan tracking-wider">{activeTab}</span>
                <span className="text-[10px] font-mono text-gray-500">{visibleFields.length} Settings</span>
              </div>

              {visibleFields.length === 0 ? (
                <p className="text-sm text-gray-500 font-mono py-12 text-center">No configurations configured in this sector.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleFields.map((field) => (
                    <div 
                      key={field.id} 
                      className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl hover:border-slate-750 transition-colors flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="block text-xs font-bold text-gray-300 mb-0.5 uppercase tracking-wide">
                          {field.name}
                        </span>
                        {field.platformLimit && (
                          <span className="inline-block text-[9px] font-mono text-gray-500 uppercase">
                            Limits: {field.platformLimit.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm font-extrabold text-brand-cyan bg-[#0B0F19] border border-slate-850 px-3 py-1.5 rounded-lg shrink-0">
                        {profile.settings[field.id] !== undefined ? String(profile.settings[field.id]) : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Mobile Screen overlay */}
      {checklistOpen && (
        <ChecklistMode 
          profile={profile} 
          onClose={() => {
            setChecklistOpen(false);
            loadData(); // Reload to pick up any changes
          }} 
        />
      )}
    </div>
  );
};
