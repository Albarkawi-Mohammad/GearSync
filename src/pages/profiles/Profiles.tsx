import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pin, Trash2, Sliders, Upload, Download, Terminal } from 'lucide-react';
import { getProfiles, deleteProfile, togglePinProfile, saveProfile, type GameProfile } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { parseGameConfig } from '../../lib/configCompiler';

export const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const loadProfiles = () => {
    // Only show user's personal profiles in their locker
    const all = getProfiles().filter(p => p.userId === 'current_user');
    setProfiles(all);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    togglePinProfile(id);
    loadProfiles();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this profile from your locker memory?')) {
      deleteProfile(id);
      loadProfiles();
    }
  };

  const handleExport = () => {
    try {
      const userProfiles = getProfiles().filter(p => p.userId === 'current_user');
      if (userProfiles.length === 0) {
        alert('Your locker is currently empty. Nothing to export.');
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfiles, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "gearsync_profiles_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to generate export file.');
      console.error(err);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const parsed = JSON.parse(fileContent);
        
        let importedCount = 0;
        const importProfile = (profileData: any) => {
          if (profileData && profileData.name && profileData.gameId && profileData.settings) {
            const profileToSave: GameProfile = {
              ...profileData,
              id: profileData.id || 'imported_' + Math.random().toString(36).substring(2, 9),
              userId: 'current_user',
              username: profileData.username || 'AvvA',
              lastUsed: new Date().toISOString()
            };
            saveProfile(profileToSave);
            importedCount++;
          }
        };

        if (Array.isArray(parsed)) {
          parsed.forEach(importProfile);
        } else {
          importProfile(parsed);
        }

        if (importedCount > 0) {
          alert(`Successfully imported ${importedCount} profile(s) into your settings locker!`);
          loadProfiles();
        } else {
          alert('Invalid backup structure: No valid settings configurations parsed.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file. Ensure the file integrity is correct.');
        console.error(err);
      }
      e.target.value = '';
    };
  };

  const handleImportGameConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileName = file.name.toLowerCase();
    
    // Attempt to auto-infer game
    let inferredGameId = '';
    if (fileName.includes('apex')) inferredGameId = 'apex';
    else if (fileName.includes('cs2') || fileName.includes('csgo') || fileName.includes('autoexec')) inferredGameId = 'cs2';
    else if (fileName.includes('bo6') || fileName.includes('cod')) inferredGameId = 'bo6';
    else if (fileName.includes('fortnite') || fileName.endsWith('.ini')) inferredGameId = 'fortnite';

    if (!inferredGameId) {
      const selection = prompt(
        "Could not automatically infer the game. Please type the game identifier:\n" +
        "Options: bo6, fortnite, apex, cs2, valorant"
      );
      if (!selection) {
        e.target.value = '';
        return;
      }
      const cleaned = selection.trim().toLowerCase();
      if (['bo6', 'fortnite', 'apex', 'cs2', 'valorant'].includes(cleaned)) {
        inferredGameId = cleaned;
      } else {
        alert("Invalid game ID. Import cancelled.");
        e.target.value = '';
        return;
      }
    }

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedSettings = parseGameConfig(text, inferredGameId);
        
        if (Object.keys(parsedSettings).length === 0) {
          alert("No recognized sensitivity or keybind parameters were parsed from this file.");
          e.target.value = '';
          return;
        }

        // Fetch defaults for target game to merge in
        const gameObj = SUPPORTED_GAMES.find(g => g.id === inferredGameId);
        const mergedSettings: Record<string, string | number | boolean> = {};
        if (gameObj) {
          gameObj.fields.forEach(f => {
            mergedSettings[f.id] = f.default;
          });
        }

        // Apply parsed overrides
        Object.assign(mergedSettings, parsedSettings);

        const newProfile: GameProfile = {
          id: 'parsed_' + Math.random().toString(36).substring(2, 9),
          name: `Imported ${file.name}`,
          gameId: inferredGameId,
          platform: 'pc',
          inputType: 'keyboard_mouse',
          tags: ['imported', 'cfg'],
          isPinned: false,
          isPublic: false,
          userId: 'current_user',
          username: 'AvvA',
          isPro: false,
          lastUsed: new Date().toISOString(),
          copiesCount: 0,
          settings: mergedSettings
        };

        saveProfile(newProfile);
        alert(`Successfully parsed & imported config! Added "${newProfile.name}" to your locker.`);
        loadProfiles();
      } catch (err) {
        alert("Failed to parse game configuration file.");
        console.error(err);
      }
      e.target.value = '';
    };
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesGame = selectedGame === 'all' || p.gameId === selectedGame;
    const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
    
    return matchesSearch && matchesGame && matchesPlatform;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white">
            SETTINGS LOCKER
          </h1>
          <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
            Browse, manage, and load your custom loadouts
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-start sm:justify-end items-center">
          <input
            type="file"
            id="import-locker-file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-locker-file')?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-gray-200 text-xs font-bold font-mono uppercase rounded-lg transition-all flex items-center gap-1.5"
            title="Import configuration JSON"
          >
            <Upload size={14} /> Import Locker
          </button>

          <input
            type="file"
            id="import-game-config-file"
            accept=".cfg,.ini,.txt"
            onChange={handleImportGameConfig}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-game-config-file')?.click()}
            className="px-4 py-2.5 bg-brand-primary/20 hover:bg-brand-primary/35 border border-brand-primary/60 text-brand-cyan text-xs font-bold font-mono uppercase rounded-lg transition-all flex items-center gap-1.5"
            title="Import raw game config file (.cfg / .ini)"
          >
            <Terminal size={14} /> Import Config (.cfg)
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-gray-200 text-xs font-bold font-mono uppercase rounded-lg transition-all flex items-center gap-1.5"
            title="Export configurations JSON"
          >
            <Download size={14} /> Export Locker
          </button>

          <Link
            to="/profiles/new"
            className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-cyan hover:brightness-110 text-white font-bold text-xs tracking-wider font-mono uppercase flex items-center gap-1.5 rounded-lg shadow-lg shadow-brand-primary/20"
          >
            <Plus size={14} /> Deploy New Profile
          </Link>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search loadouts or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#161F30]/50 border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none transition-colors"
          />
        </div>

        {/* Game filter */}
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full px-4 py-3 bg-[#161F30]/50 border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none transition-colors"
        >
          <option value="all">All Games</option>
          {SUPPORTED_GAMES.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        {/* Platform filter */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="w-full px-4 py-3 bg-[#161F30]/50 border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none transition-colors"
        >
          <option value="all">All Platforms</option>
          <option value="pc">PC</option>
          <option value="playstation">PlayStation</option>
          <option value="xbox">Xbox</option>
          <option value="switch">Nintendo Switch</option>
        </select>
      </div>

      {/* PROFILES GRID */}
      {filteredProfiles.length === 0 ? (
        <div className="cyber-panel p-12 text-center border-slate-800/80 bg-slate-900/10">
          <Sliders className="text-gray-600 mx-auto mb-4" size={40} />
          <h3 className="font-bold text-gray-400 font-mono text-sm">NO LOADOUTS ENCOUNTERED</h3>
          <p className="text-xs text-gray-500 mt-1">Try relaxing your filter parameters or deploy a fresh config.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const game = SUPPORTED_GAMES.find(g => g.id === profile.gameId);
            return (
              <Link
                key={profile.id}
                to={`/profiles/${profile.id}`}
                className="cyber-panel p-5 bg-[#161F30]/30 hover:bg-[#161F30]/55 border-slate-850 hover:border-brand-cyan/40 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="inline-block px-2 py-0.5 bg-[#0B0F19] text-brand-cyan text-[9px] font-mono border border-brand-cyan/20 rounded uppercase">
                      {game?.name || profile.gameId}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleTogglePin(profile.id, e)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          profile.isPinned 
                            ? 'bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan' 
                            : 'bg-[#0B0F19] border-slate-800 text-gray-500 hover:text-gray-300'
                        }`}
                        title={profile.isPinned ? "Unpin config" : "Pin config to top"}
                      >
                        <Pin size={12} className={profile.isPinned ? 'fill-brand-cyan' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(profile.id, e)}
                        className="p-1.5 bg-[#0B0F19] border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                        title="Delete config"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-gray-200 group-hover:text-brand-cyan transition-colors mb-2 truncate">
                    {profile.name}
                  </h3>

                  {profile.tags && profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {profile.tags.map(t => (
                        <span key={t} className="text-[9px] font-mono bg-slate-900/60 text-gray-400 border border-slate-850 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-850 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <div className="flex gap-2">
                    <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase">{profile.platform}</span>
                    <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase">
                      {profile.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                    </span>
                  </div>
                  <span>Sync {new Date(profile.lastUsed).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
