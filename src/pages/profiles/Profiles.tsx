import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Sliders,
  Upload,
  Download,
  FileCode2,
  ArrowUpDown,
  X,
} from 'lucide-react';
import {
  getProfiles,
  deleteProfile,
  togglePinProfile,
  saveProfile,
  type GameProfile,
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { parseGameConfig } from '../../lib/configCompiler';
import { ProfileCard, getGameTheme, useToast } from '../../components/ui';

export const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'pinned' | 'name' | 'copies'>('pinned');

  // Pending raw config import modal state (when game cannot be inferred from filename)
  const [pendingConfigFile, setPendingConfigFile] = useState<{
    name: string;
    content: string;
  } | null>(null);

  const { showToast, requestConfirm } = useToast();

  const loadProfiles = () => {
    const all = getProfiles().filter((p) => p.userId === 'current_user');
    setProfiles(all);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    togglePinProfile(id);
    loadProfiles();
    showToast('Pin Updated', 'Loadout pin status saved to your locker.');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = profiles.find((p) => p.id === id);
    requestConfirm({
      title: `Delete "${target?.name || 'Loadout'}"?`,
      description:
        'This configuration will be permanently removed from your personal locker. This action cannot be undone.',
      confirmLabel: 'Delete Loadout',
      variant: 'danger',
      onConfirm: () => {
        deleteProfile(id);
        loadProfiles();
        showToast('Loadout Deleted', 'The profile has been removed from your locker.', 'info');
      },
    });
  };

  const handleExport = () => {
    try {
      const userProfiles = getProfiles().filter((p) => p.userId === 'current_user');
      if (userProfiles.length === 0) {
        showToast('Locker Empty', 'There are no saved profiles to export yet.', 'warning');
        return;
      }
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(userProfiles, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'gearsync_profiles_backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(
        'Backup Exported',
        `Exported ${userProfiles.length} loadout(s) to gearsync_profiles_backup.json.`
      );
    } catch (err) {
      showToast('Export Failed', 'Could not generate backup JSON file.', 'error');
      console.error(err);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], 'UTF-8');
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
              lastUsed: new Date().toISOString(),
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
          showToast(
            'Locker Imported',
            `Successfully imported ${importedCount} profile(s) into your locker.`
          );
          loadProfiles();
        } else {
          showToast(
            'Invalid File',
            'No valid GearSync configurations were found in that JSON file.',
            'warning'
          );
        }
      } catch (err) {
        showToast('Import Error', 'Failed to parse JSON backup file.', 'error');
        console.error(err);
      }
      e.target.value = '';
    };
  };

  const finalizeGameConfigImport = (
    fileName: string,
    text: string,
    targetGameId: string
  ) => {
    try {
      const parsedSettings = parseGameConfig(text, targetGameId);

      if (Object.keys(parsedSettings).length === 0) {
        showToast(
          'No Settings Recognized',
          'No supported sensitivity or keybind parameters were detected in that config file.',
          'warning'
        );
        return;
      }

      const gameObj = SUPPORTED_GAMES.find((g) => g.id === targetGameId);
      const mergedSettings: Record<string, string | number | boolean> = {};
      if (gameObj) {
        gameObj.fields.forEach((f) => {
          mergedSettings[f.id] = f.default;
        });
      }

      Object.assign(mergedSettings, parsedSettings);

      const newProfile: GameProfile = {
        id: 'parsed_' + Math.random().toString(36).substring(2, 9),
        name: `Imported ${fileName}`,
        gameId: targetGameId,
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
        settings: mergedSettings,
      };

      saveProfile(newProfile);
      showToast(
        'Config Parsed & Saved',
        `Added "${newProfile.name}" (${Object.keys(parsedSettings).length} settings) to your locker.`
      );
      loadProfiles();
    } catch (err) {
      showToast('Parse Error', 'Failed to parse game configuration file.', 'error');
      console.error(err);
    }
  };

  const handleImportGameConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;


    const file = files[0];
    const fileName = file.name.toLowerCase();

    let inferredGameId = '';
    if (fileName.includes('apex')) inferredGameId = 'apex';
    else if (fileName.includes('cs2') || fileName.includes('csgo') || fileName.includes('autoexec'))
      inferredGameId = 'cs2';
    else if (fileName.includes('bo6') || fileName.includes('cod')) inferredGameId = 'bo6';
    else if (fileName.includes('fortnite') || fileName.endsWith('.ini'))
      inferredGameId = 'fortnite';
    else if (fileName.includes('valorant')) inferredGameId = 'valorant';

    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        if (inferredGameId) {
          finalizeGameConfigImport(file.name, text, inferredGameId);
        } else {
          setPendingConfigFile({ name: file.name, content: text });
        }
        e.target.value = '';
      };
    };

    const filteredProfiles = profiles
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
        const matchesGame = selectedGame === 'all' || p.gameId === selectedGame;
        const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;

        return matchesSearch && matchesGame && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === 'pinned') {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        }
        if (sortBy === 'recent') {
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'copies') {
          return b.copiesCount - a.copiesCount;
        }
        return 0;
      });

    const platforms = [
      { id: 'all', label: 'All Platforms' },
      { id: 'pc', label: 'PC' },
      { id: 'playstation', label: 'PlayStation' },
      { id: 'xbox', label: 'Xbox' },
      { id: 'switch', label: 'Switch' },
    ];

    return (
          <div className="space-y-7 animate-fade-in">
            {/* HEADER & ACTION TOOLBAR */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25232E] border border-white/[0.06] text-xs font-medium text-[#A6A2B5] mb-2.5">
                    <Sliders size={12} className="text-[#FF5E36]" />
                    <span>{profiles.length} Total Configurations Saved</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
                    Configuration Locker
                  </h1>
                    <p className="text-sm text-[#A6A2B5] mt-1">
                      Organize, filter, import, and launch your personalized game settings across every platform.
                    </p>
                  </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        id="import-locker-file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('import-locker-file')?.click()}
                        className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
                        title="Import GearSync JSON backup"
                      >
                        <Upload size={14} /> Import JSON
                      </button>

                      <input
                        type="file"
                        id="import-game-config-file"
                        accept=".cfg,.ini,.txt"
                        onChange={handleImportGameConfig}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('import-game-config-file')?.click()}
                        className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
                        title="Import raw game config (.cfg / .ini / .txt)"
                      >
                        <FileCode2 size={14} className="text-[#FF5E36]" /> Import .cfg / .ini
                      </button>


                      <button
                        type="button"
                        onClick={handleExport}
                        className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
                        title="Export all profiles as JSON backup"
                      >
                        <Download size={14} /> Backup JSON
                      </button>

                      <Link
                        to="/profiles/new"
                        className="gs-btn-primary px-5 py-2.5 text-xs sm:text-sm inline-flex items-center gap-1.5"
                      >
                        <Plus size={15} /> New Profile
                      </Link>
                    </div>
                  </div>

                      {/* FILTER & SEARCH CONSOLE */}
                      <div className="gs-card p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                          {/* Rounded Search Input */}
                          <div className="relative flex-1">
                            <Search
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6A7E]"
                              size={16}
                            />
                            <input
                              type="text"
                              placeholder="Search by loadout name or #tag..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full pl-11 pr-9 py-2.5 rounded-full bg-[#121117] border border-white/[0.08] text-sm text-[#F7F6F9] placeholder-[#6E6A7E] focus:border-[#FF5E36] focus:outline-none transition-colors"
                            />
                            {search && (
                              <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6A7E] hover:text-white p-1"
                                aria-label="Clear search"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Platform Pills */}
                          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            {platforms.map((plat) => (
                              <button
                                key={plat.id}
                                type="button"
                                onClick={() => setSelectedPlatform(plat.id)}
                                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedPlatform === plat.id
                                    ? 'bg-[#F7F6F9] text-[#0C0B0E] shadow-sm'
                                    : 'bg-[#121117] text-[#A6A2B5] hover:text-white border border-white/[0.06]'
                                  }`}
                              >
                                {plat.label}
                              </button>
                            ))}
                          </div>

                          {/* Sort Dropdown */}
                          <div className="flex items-center gap-2 shrink-0">
                            <ArrowUpDown size={14} className="text-[#6E6A7E] hidden sm:inline" />
                            <select
                              aria-label="Sort profiles"
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as any)}
                              className="px-4 py-2.5 rounded-full bg-[#121117] border border-white/[0.08] text-xs font-semibold text-[#F7F6F9] focus:border-[#FF5E36] focus:outline-none cursor-pointer"
                            >
                              <option value="pinned">Sort: Pinned First</option>
                              <option value="recent">Sort: Recently Used</option>
                              <option value="name">Sort: Alphabetical</option>
                              <option value="copies">Sort: Most Cloned</option>
                            </select>
                          </div>
                        </div>

                        {/* Game Category Filter Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/[0.05]">
                          <button
                            type="button"
                            onClick={() => setSelectedGame('all')}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${selectedGame === 'all'
                                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                                : 'bg-[#16151C] text-[#A6A2B5] hover:text-white border border-white/[0.05]'
                              }`}
                          >
                            <span>All Games</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${selectedGame === 'all' ? 'bg-black/25 text-white' : 'bg-white/5 text-[#6E6A7E]'
                                }`}
                            >
                              {profiles.length}
                            </span>
                          </button>

                          {SUPPORTED_GAMES.map((g) => {
                            const count = profiles.filter((p) => p.gameId === g.id).length;
                            const theme = getGameTheme(g.id);
                            const active = selectedGame === g.id;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => setSelectedGame(g.id)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${active
                                    ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                                    : 'bg-[#16151C] text-[#A6A2B5] hover:text-white border border-white/[0.05]'
                                  }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: active ? '#FFF' : theme.accentHex }}
                                />
                                <span>{theme.shortName}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${active ? 'bg-black/25 text-white' : 'bg-white/5 text-[#6E6A7E]'
                                    }`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PROFILES GRID */}
                      {filteredProfiles.length === 0 ? (
                          <div className="gs-card p-12 text-center max-w-lg mx-auto my-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center mx-auto mb-4">
                              <Sliders size={26} />
                            </div>
                            <h3 className="text-lg font-bold text-[#F7F6F9]">No matching configurations</h3>
                            <p className="text-sm text-[#A6A2B5] mt-1">
                              {search || selectedGame !== 'all' || selectedPlatform !== 'all'
                                ? 'Try clearing your search filters or switching game categories.'
                                : 'Your locker is empty. Create a fresh loadout or import an existing config file.'}
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                              {(search || selectedGame !== 'all' || selectedPlatform !== 'all') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearch('');
                                    setSelectedGame('all');
                                    setSelectedPlatform('all');
                                  }}
                                  className="gs-btn-secondary px-5 py-2.5 text-xs"
                                >
                                  Reset All Filters
                                </button>
                              )}
                              <Link to="/profiles/new" className="gs-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-1.5">
                                <Plus size={14} /> Create New Profile
                              </Link>
                            </div>
                          </div>
                          ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                      {filteredProfiles.map((profile) => (
                                        <ProfileCard
                                          key={profile.id}
                                          profile={profile}
                                          onTogglePin={handleTogglePin}
                                          onDelete={handleDelete}
                                        />
                                      ))}
                                    </div>
      )}

                                    {/* MODAL FOR SELECTING GAME WHEN IMPORTING AMBIGUOUS .CFG FILE */}
                                    {pendingConfigFile && (
                                      <div
                                        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                                        onClick={() => setPendingConfigFile(null)}
                                      >
                                        <div
                                          className="w-full max-w-md rounded-[28px] bg-[#1D1B24] border border-white/10 p-6 shadow-2xl space-y-5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5E36]/15 text-[#FF5E36]">
                                              Config Importer
                                            </span>
                                            <h3 className="text-lg font-bold text-[#F7F6F9] mt-2">
                                              Select Target Game for "{pendingConfigFile.name}"
                                            </h3>
                                            <p className="text-xs text-[#A6A2B5] mt-1">
                                              Choose which game engine schema should parse this configuration file:
                                            </p>
                                          </div>

            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_GAMES.map((g) => {
                const theme = getGameTheme(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      const file = pendingConfigFile;
                      setPendingConfigFile(null);
                      finalizeGameConfigImport(file.name, file.content, g.id);
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] hover:border-[#FF5E36]/40 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.accentHex }}
                      />
                      <div>
                        <span className="block text-sm font-bold text-[#F7F6F9]">{g.name}</span>
                        <span className="block text-[11px] text-[#6E6A7E]">
                          {theme.exportFormat}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#FF5E36]">Parse →</span>
                  </button>
                );
              })}
            </div>

                                          <div className="flex justify-end pt-2">
                                            <button
                                              type="button"
                                              onClick={() => setPendingConfigFile(null)}
                                              className="gs-btn-secondary px-5 py-2 text-xs"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  );
};
