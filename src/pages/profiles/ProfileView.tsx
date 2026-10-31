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
  FileCode2,
    Copy,
    Check,
    Search,
    RotateCcw,
    ArrowRight,
    X,
    CheckCircle2,
    AlertCircle,
    Printer,
  } from 'lucide-react';
import {
    getProfiles,
    saveProfile,
    getHistory,
    addHistoryEntry,
    type GameProfile,
    type ProfileHistory,
  } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import { ChecklistMode } from '../../components/profiles';
import { compileGameConfig } from '../../lib/configCompiler';
import {
  GameArtwork,
  GamePill,
  PlatformBadge,
  InputBadge,
  getGameTheme,
  getKeyMetricsForProfile,
  useToast,
} from '../../components/ui';

export const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [history, setHistory] = useState<ProfileHistory[]>([]);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [settingSearch, setSettingSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const { showToast, requestConfirm } = useToast();

  const loadData = () => {
    if (!id) return;
    const all = getProfiles();
    const found = all.find((p) => p.id === id);
    if (found) {
      setProfile(found);
      const game = SUPPORTED_GAMES.find((g) => g.id === found.gameId);
      if (game && game.categories.length > 0) {
        const firstValidCategory =
          game.categories.find((cat) =>
            game.fields.some(
              (f) =>
                f.category === cat &&
                (!f.platformLimit || f.platformLimit.includes(found.platform))
            )
          ) || game.categories[0];
        setActiveTab(firstValidCategory);
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
        <div className="py-16 text-center text-[#A6A2B5] text-sm">
          Loading configuration from locker...
        </div>
        );
  }

  const game = SUPPORTED_GAMES.find((g) => g.id === profile.gameId);
        const theme = getGameTheme(profile.gameId);
        const keyMetrics = getKeyMetricsForProfile(profile);
        const compiledConfig = compileGameConfig(profile);

  // Toggle profile public/private
  const handleToggleShare = () => {
    if (!profile) return;
        const updated = {...profile, isPublic: !profile.isPublic };
        saveProfile(updated);
        setProfile(updated);
        addHistoryEntry(
        profile.id,
        profile.settings,
        `Visibility changed to ${updated.isPublic ? 'Public' : 'Private'}`
        );
        setHistory(getHistory(profile.id));
        showToast(
        updated.isPublic ? 'Profile Published' : 'Profile Set to Private',
        updated.isPublic
        ? 'Your loadout is now visible to the community in Signal Base.'
        : 'Your loadout is now private to your personal locker.'
        );
  };

  // Restore history snapshot
  const handleRestore = (historyEntry: ProfileHistory) => {
    if (!profile) return;
        const formattedDate = new Date(historyEntry.timestamp).toLocaleString();
        requestConfirm({
          title: 'Restore Previous Version?',
        description: `Restore settings snapshot from ${formattedDate}? Your current settings will be backed up automatically before restoring.`,
        confirmLabel: 'Restore Version',
      onConfirm: () => {
        const updated: GameProfile = {
          ...profile,
          settings: {...historyEntry.settingsSnapshot},
        lastUsed: new Date().toISOString(),
        };
        saveProfile(updated);
        setProfile(updated);
        addHistoryEntry(
        profile.id,
        historyEntry.settingsSnapshot,
        `Restored snapshot from ${formattedDate}`
        );
        setHistory(getHistory(profile.id));
        showToast('Version Restored', `Reverted settings to snapshot from ${formattedDate}.`);
      },
    });
  };

  const handlePrint = () => {
          window.print();
  };

  const handleDownloadConfig = () => {
    if (!profile) return;
        try {
        const {filename, content} = compiledConfig;
        const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Config File Downloaded', `Saved ${filename} to your device.`);
    } catch (err) {
        showToast('Export Error', 'Failed to generate local game config file.', 'error');
        console.error(err);
    }
  };

  const handleCopyConfigText = () => {
          navigator.clipboard.writeText(compiledConfig.content);
        setCopiedCode(true);
        showToast('Copied to Clipboard', `Copied raw ${compiledConfig.filename} script.`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter settings fields based on active tab (or search across all tabs) and platform limits
  const visibleFields = (game?.fields || []).filter((field) => {
    const matchesPlatform =
        !field.platformLimit || field.platformLimit.includes(profile.platform);
        if (!matchesPlatform) return false;

    if (settingSearch.trim().length > 0) {
      return (
        field.name.toLowerCase().includes(settingSearch.toLowerCase()) ||
        field.category.toLowerCase().includes(settingSearch.toLowerCase())
        );
    }
        return field.category === activeTab;
  });

        const isNativeFileSupported = profile.platform === 'pc';

        return (
              <div className="space-y-7 animate-fade-in print:bg-white print:text-black print:p-0">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center justify-between print:hidden">
                  <Link
                    to="/profiles"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6A2B5] hover:text-[#F7F6F9] px-3.5 py-2 rounded-full bg-[#1D1B24] border border-white/[0.06] transition-colors"
                  >
                    <ChevronLeft size={15} /> Back to Locker
                  </Link>

                      {profile.tags && profile.tags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5">
            {profile.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-medium px-3 py-1 rounded-full bg-[#1D1B24] text-[#A6A2B5] border border-white/[0.05]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
                  </div>

                        {/* HERO PROFILE BANNER */}
                        <div className="rounded-[28px] overflow-hidden border border-white/10 shadow-card bg-[#1D1B24] print:border-none print:bg-transparent print:shadow-none">
                          <GameArtwork
                            gameId={profile.gameId}
                            className="p-6 sm:p-8 print:hidden"
                            overlayIntensity="heavy"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <GamePill gameId={profile.gameId} size="md" />
                                  <PlatformBadge platform={profile.platform} size="md" />
                                  <InputBadge inputType={profile.inputType} size="md" />
                                  {profile.isPro && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      Verified Pro Preset
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F7F6F9] tracking-tight">
                                    {profile.name}
                                  </h1>
                                  <p className="text-xs sm:text-sm text-[#A6A2B5] mt-1.5 flex flex-wrap items-center gap-2">
                                    <span>
                                      Created by <strong className="text-[#F7F6F9]">@{profile.username}</strong>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={13} className="text-[#FF5E36]" />
                                      Updated {new Date(profile.lastUsed).toLocaleString()}
                                    </span>
                                  </p>
                                </div>

                                {/* Quick Telemetry Strip */}
                                <div className="flex flex-wrap gap-2.5 pt-1">
                                  {keyMetrics.map((m, i) => (
                                    <div
                                      key={i}
                                      className="px-3.5 py-2 rounded-2xl bg-[#121117]/80 backdrop-blur-md border border-white/10"
                                    >
                                      <span className="block text-[10px] text-[#A6A2B5]">{m.label}</span>
                                      <span className="block text-sm font-bold text-[#F7F6F9] tabular-nums">
                                        {m.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Action Toolbar */}
                              <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setChecklistOpen(true)}
                                  className="gs-btn-primary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
                                >
                                  <Play size={15} className="fill-current" />
                                  Checklist Mode
                                </button>

                                {profile.userId === 'current_user' && (
                                  <Link
                                    to={`/profiles/${profile.id}/edit`}
                                    className="gs-btn-secondary px-4 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
                                  >
                                    <Edit size={15} />
                                    Edit Settings
                                  </Link>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setShowExporter(true)}
                                  className="gs-btn-secondary px-4 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
                                >
                                  <FileCode2 size={15} className="text-[#FF5E36]" />
                                  Export Config
                                </button>

                              {profile.userId === 'current_user' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleToggleShare}
                                    className={`px-4 py-3 rounded-full text-xs sm:text-sm font-semibold border transition-all inline-flex items-center gap-1.5 ${profile.isPublic
                                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                                        : 'bg-[#25232E] border-white/[0.08] text-[#A6A2B5] hover:text-white'
                                      }`}
                                    title="Toggle community visibility"
                                  >
                                    {profile.isPublic ? <Globe size={15} /> : <Lock size={15} />}
                                    {profile.isPublic ? 'Public' : 'Private'}
                                  </button>

                              <button
                                type="button"
                                onClick={() => setShowHistory(!showHistory)}
                                className={`px-4 py-3 rounded-full text-xs sm:text-sm font-semibold border transition-all inline-flex items-center gap-1.5 ${showHistory
                                    ? 'bg-[#FF5E36] text-white border-[#FF5E36] shadow-md shadow-[#FF5E36]/25'
                                    : 'bg-[#25232E] border-white/[0.08] text-[#A6A2B5] hover:text-white'
                                  }`}
                                title="Inspect Version History"
                              >
                                <History size={15} />
                                <span>History</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[11px] tabular-nums">
                                  {history.length}
                                </span>
                              </button>
                            </>
              )}
                        </div>
                      </div>
                  </GameArtwork>
                </div>

                        {/* MAIN WORKSPACE: CATEGORY RAIL + SETTINGS CARDS + OPTIONAL VERSION HISTORY */ }
                        < div className = "grid grid-cols-1 lg:grid-cols-12 gap-6" >
                          {/* Left 3 Columns: Category Navigation & Search */ }
                          < div className = "lg:col-span-3 space-y-4 print:hidden" >
                            {/* Quick filter input */ }
                            < div className = "relative" >
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6A7E]"
            />
            <input
              type="text"
              placeholder="Filter settings..."
              value={settingSearch}
              onChange={(e) => setSettingSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-full bg-[#1D1B24] border border-white/[0.07] text-xs text-[#F7F6F9] placeholder-[#6E6A7E] focus:border-[#FF5E36] focus:outline-none"
            />
                      {
                        settingSearch && (
                          <button
                            type="button"
                            onClick={() => setSettingSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6A7E] hover:text-white"
                          >
                            <X size={13} />
                          </button>
            )}
                  </div>

                                  {/* Categories List */ }
                                  <div className="gs-card p-3 space-y-1">
                                    <p className="text-[11px] font-semibold text-[#6E6A7E] px-3 py-1.5">
                                      Setting Categories
                                    </p>
                                    {game?.categories.map((cat) => {
                                      const catFields = game.fields.filter(
                                        (f) =>
                                          f.category === cat &&
                                          (!f.platformLimit || f.platformLimit.includes(profile.platform))
                                      );
                                      if (catFields.length === 0) return null;
                                      const isActive = activeTab === cat && !settingSearch;

                                      return (
                                        <button
                                          key={cat}
                                          type="button"
                                          onClick={() => {
                                            setSettingSearch('');
                                            setActiveTab(cat);
                                          }}
                                          className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${isActive
                                              ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                                              : 'text-[#A6A2B5] hover:bg-[#25232E] hover:text-[#F7F6F9]'
                                            }`}
                                        >
                                          <span>{cat}</span>
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums ${isActive ? 'bg-black/25 text-white' : 'bg-[#16151C] text-[#6E6A7E]'
                                              }`}
                                          >
                                            {catFields.length}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>

                      {/* Quick Export Summary Card */}
                      <div className="gs-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#F7F6F9]">Export Formats</span>
                          <span className="text-[10px] text-[#6E6A7E]">{theme.shortName}</span>
                        </div>
                        <p className="text-xs text-[#A6A2B5] leading-relaxed">
                          Compile this configuration into a ready-to-use{' '}
                          <code className="text-[#F7F6F9] bg-[#121117] px-1.5 py-0.5 rounded">
                            {compiledConfig.filename}
                          </code>{' '}
                          script or print a reference sheet.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleDownloadConfig}
                            className="flex-1 py-2 px-3 rounded-full bg-[#25232E] hover:bg-[#2E2B39] text-xs font-semibold text-[#F7F6F9] border border-white/[0.07] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <FileCode2 size={13} className="text-[#FF5E36]" /> Download .cfg
                          </button>
                          <button
                            type="button"
                            onClick={handlePrint}
                            className="py-2 px-3 rounded-full bg-[#25232E] hover:bg-[#2E2B39] text-xs font-semibold text-[#A6A2B5] hover:text-white border border-white/[0.07] transition-colors"
                            title="Print / Save PDF"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                      {/* Center/Right Columns: Settings Grid + Chronological Version History */}
                      <div
                        className={`${showHistory ? 'lg:col-span-5' : 'lg:col-span-9'
                          } space-y-6 print:col-span-12`}
                      >
                        <div className="gs-card p-6 print:border-none print:bg-transparent print:p-0 print:shadow-none">
                          {/* Print-only Summary Header */}
                          <div className="hidden print:block border-b border-black pb-4 mb-6">
                            <h2 className="text-2xl font-bold">
                              {profile.name} — {game?.name}
                            </h2>
                            <p className="text-xs text-gray-600 mt-1">
                              Platform: {profile.platform.toUpperCase()} • Input:{' '}
                              {profile.inputType === 'controller' ? 'Controller' : 'Keyboard & Mouse'} • Operator:{' '}
                              {profile.username}
                            </p>
                          </div>

                          {/* Print Layout: All categories flatly */}
                          <div className="hidden print:block space-y-8">
                            {game?.categories.map((cat) => {
                              const catFields = game.fields.filter(
                                (f) =>
                                  f.category === cat &&
                                  (!f.platformLimit || f.platformLimit.includes(profile.platform))
                              );
                              if (catFields.length === 0) return null;
                              return (
                                <div key={cat}>
                                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1">
                                          {cat}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                          {catFields.map((field) => (
                                            <div
                                              key={field.id}
                                              className="border-b border-gray-100 py-1.5 flex justify-between items-center text-xs"
                                            >
                                              <span className="font-medium text-gray-700">{field.name}</span>
                                              <span className="font-mono font-bold text-black bg-gray-100 px-2 py-0.5 rounded">
                                                {profile.settings[field.id] !== undefined
                                                  ? String(profile.settings[field.id])
                                                  : 'N/A'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
              })}
                                  </div>

                                      {/* Screen View: Active Category or Search Results */}
                                      <div className="print:hidden space-y-5">
                                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                                          <div>
                                            <h2 className="text-lg font-bold text-[#F7F6F9]">
                                              {settingSearch
                                                ? `Search Results for "${settingSearch}"`
                                                : activeTab}
                                            </h2>
                                            <p className="text-xs text-[#6E6A7E]">
                                              {visibleFields.length} calibrated{' '}
                                              {visibleFields.length === 1 ? 'parameter' : 'parameters'} for{' '}
                                              {profile.platform.toUpperCase()}
                                            </p>
                                          </div>

                                          {profile.userId === 'current_user' && (
                                            <Link
                                              to={`/profiles/${profile.id}/edit`}
                                              className="text-xs font-semibold text-[#FF5E36] hover:underline flex items-center gap-1"
                                            >
                                              <Edit size={13} /> Edit Values
                                            </Link>
                                          )}
                                        </div>

                                        {visibleFields.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#6E6A7E]">
                  No settings match your current filter in this category.
                </div>
                                        ) : (
                <div
                  className={`grid grid-cols-1 ${
                    showHistory ? 'md:grid-cols-1' : 'md:grid-cols-2'
                  } gap-3.5`}
                >
                  {visibleFields.map((field) => {
                    const rawVal = profile.settings[field.id];
                    const displayVal = rawVal !== undefined ? String(rawVal) : 'Default';

                    // Calculate slider fill percentage if numeric slider
                    let sliderPercent: number | null = null;
                    if (
                      field.type === 'slider' &&
                      field.min !== undefined &&
                      field.max !== undefined &&
                      rawVal !== undefined
                    ) {
                      sliderPercent = Math.min(
                        100,
                        Math.max(
                          0,
                          ((Number(rawVal) - field.min) / (field.max - field.min)) * 100
                        )
                      );
                    }

                    return (
                      <div
                        key={field.id}
                        className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.05] hover:border-white/10 transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[#F7F6F9] leading-snug">
                              {field.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {settingSearch && (
                                <span className="text-[10px] text-[#6E6A7E]">{field.category}</span>
                              )}
                              {field.platformLimit && (
                                <span className="text-[10px] text-[#6E6A7E]">
                                  {field.platformLimit.map((p) => p.toUpperCase()).join(', ')} only
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Formatted Value Pill */}
                          {field.type === 'toggle' ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 border ${
                                Boolean(rawVal)
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-white/[0.04] text-[#6E6A7E] border-white/[0.06]'
                              }`}
                            >
                              {Boolean(rawVal) ? 'Enabled' : 'Disabled'}
                            </span>
                          ) : field.type === 'keybind' ? (
                            <kbd className="px-3 py-1 rounded-xl bg-[#25232E] border border-white/15 text-xs font-mono font-bold text-[#F7F6F9] shadow-inner shrink-0">
                              {displayVal}
                            </kbd>
                          ) : (
                            <span className="px-3 py-1 rounded-xl bg-[#121117] border border-white/[0.07] text-sm font-bold text-[#FF5E36] tabular-nums shrink-0">
                              {displayVal}
                            </span>
                          )}
                        </div>

                        {sliderPercent !== null && (
                          <div className="w-full h-1.5 rounded-full bg-[#25232E] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FF5E36] to-amber-400"
                              style={{ width: `${sliderPercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
                                              </div>

        {/* Right 4 Columns (When History Open): Chronological Version History Panel */ }
        { showHistory && (
                                                <div className="lg:col-span-4 print:hidden animate-fade-in">
                                                  <div className="gs-card p-5 space-y-4 sticky top-24">
                                                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center">
                                                          <History size={15} />
                                                        </div>
                                                        <div>
                                                          <h3 className="text-sm font-bold text-[#F7F6F9]">Version History</h3>
                                                          <p className="text-[11px] text-[#6E6A7E]">
                                                            Automatic snapshots before modifications
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={() => setShowHistory(false)}
                                                        className="p-1.5 rounded-full text-[#6E6A7E] hover:text-white hover:bg-white/5"
                                                        aria-label="Close version history"
                                                      >
                                                        <X size={15} />
                                                      </button>
                                                    </div>

                                                    {history.length === 0 ? (
                                                      <div className="py-10 text-center px-4">
                                                        <Clock size={24} className="text-[#6E6A7E] mx-auto mb-2" />
                                                        <p className="text-xs font-semibold text-[#A6A2B5]">No snapshots recorded yet</p>
                                                        <p className="text-[11px] text-[#6E6A7E] mt-1">
                                                          Snapshots are automatically saved whenever you edit or toggle this profile.
                                                        </p>
                                                      </div>
                                                    ) : (
                                                      <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
                                                        {history.map((h, index) => {
                                                          const currentSettings = profile.settings;
                                                          const snapshotSettings = h.settingsSnapshot;
                                                          const changedKeys = Object.keys(snapshotSettings).filter((key) => {
                                                            const valSnap = snapshotSettings[key];
                                                            const valCurr = currentSettings[key];
                                                            return (
                                                              valSnap !== undefined &&
                                                              valCurr !== undefined &&
                                                              valSnap !== valCurr
                                                            );
                                                          });

                                                          return (
                                                            <div
                                                              key={h.id}
                                                              className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.06] space-y-3"
                                                            >
                                                              <div className="flex items-center justify-between text-xs">
                                                                <span className="font-bold text-[#F7F6F9] flex items-center gap-1.5">
                                                                  <span className="w-2 h-2 rounded-full bg-[#FF5E36]" />
                                                                  Snapshot #{history.length - index}
                                                                </span>
                                                                <span className="text-[11px] text-[#6E6A7E] tabular-nums">
                                                                  {new Date(h.timestamp).toLocaleDateString()}{' '}
                                                                  {new Date(h.timestamp).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                  })}
                                                                </span>
                                                              </div>

                                                              <p className="text-xs text-[#A6A2B5] leading-relaxed">{h.notes}</p>

                                                              {/* Diff Preview */}
                                                              <div className="p-2.5 rounded-xl bg-[#121117] border border-white/[0.04] space-y-1.5">
                                                                <span className="block text-[10px] font-semibold text-[#6E6A7E]">
                                                                  {changedKeys.length === 0
                                                                    ? 'Matches current active values'
                                                                    : `${changedKeys.length} parameter difference(s) vs. current`}
                                                                </span>
                                                                {changedKeys.slice(0, 5).map((key) => {
                                                                  const fieldName =
                                                                    game?.fields.find((f) => f.id === key)?.name || key;
                                                                  const snapValue = String(snapshotSettings[key]);
                                                                  const currValue = String(currentSettings[key]);
                                                                  return (
                                                                    <div
                                                                      key={key}
                                                                      className="flex items-center justify-between text-[11px] py-1 border-t border-white/[0.04]"
                                                                    >
                                                                      <span
                                                                        className="text-[#A6A2B5] truncate max-w-[130px]"
                                                                        title={fieldName}
                                                                      >
                                                                        {fieldName}
                                                                      </span>
                                                                      <span className="flex items-center gap-1.5 font-mono tabular-nums shrink-0">
                                                                        <span className="text-amber-400">{snapValue}</span>
                                                                        <ArrowRight size={10} className="text-[#6E6A7E]" />
                                                                        <span className="text-emerald-400">{currValue}</span>
                                                                      </span>
                                                                    </div>
                                                                  );
                                                                })}
                                                                {changedKeys.length > 5 && (
                                                                  <span className="block text-[10px] text-[#6E6A7E] pt-1">
                                                                    + {changedKeys.length - 5} more changes
                                                                  </span>
                                                                )}
                                                              </div>

                                                              <button
                                                                type="button"
                                                                onClick={() => handleRestore(h)}
                                                                className="w-full py-2 px-3 rounded-full bg-[#25232E] hover:bg-[#FF5E36] text-xs font-semibold text-[#F7F6F9] hover:text-white border border-white/[0.07] transition-all flex items-center justify-center gap-1.5"
                                                              >
                                                                <RotateCcw size={12} /> Restore This Version
                                                              </button>
                                                            </div>
                                                    );
                  })}
                                                  </div>
              )}
                                                </div>
          </div>
        )}
                                    </div>

                                    {/* GUIDED CONFIG EXPORTER MODAL */}
                                    {showExporter && (
                                      <div
                                        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in print:hidden"
                                        onClick={() => setShowExporter(false)}
                                      >
                                        <div
                                          className="w-full max-w-2xl rounded-[28px] bg-[#1D1B24] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-in"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="flex items-start justify-between gap-4">
                                            <div>
                                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF5E36]/15 text-[#FF5E36]">
                                                Guided Config Compiler
                                              </span>
                                              <h3 className="text-xl font-bold text-[#F7F6F9] mt-2">
                                                Export "{profile.name}"
                                              </h3>
                                              <p className="text-xs text-[#A6A2B5] mt-0.5">
                                                Review target compatibility and download or copy your compiled configuration script.
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => setShowExporter(false)}
                                              className="w-8 h-8 rounded-full bg-[#25232E] text-[#A6A2B5] hover:text-white flex items-center justify-center"
                                            >
                                              <X size={16} />
                                            </button>
                                          </div>

                                          {/* Compatibility & Metadata Grid */}
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="p-3.5 rounded-2xl bg-[#16151C] border border-white/[0.06]">
                                              <span className="block text-[10px] text-[#6E6A7E]">Selected Game</span>
                                              <span className="block text-xs font-bold text-[#F7F6F9] mt-0.5">
                                                {theme.name}
                                              </span>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-[#16151C] border border-white/[0.06]">
                                              <span className="block text-[10px] text-[#6E6A7E]">Target Platform</span>
                                              <span className="block text-xs font-bold text-[#F7F6F9] mt-0.5 uppercase">
                                                {profile.platform} ({profile.inputType === 'controller' ? 'Controller' : 'M&K'})
                                              </span>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-[#16151C] border border-white/[0.06]">
                                              <span className="block text-[10px] text-[#6E6A7E]">Output Format</span>
                                              <span className="block text-xs font-bold text-[#FF5E36] mt-0.5 truncate">
                                                {compiledConfig.filename}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Compatibility Status Notice */}
                                          <div
                                            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${isNativeFileSupported
                                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                                                : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                                              }`}
                                          >
                                            {isNativeFileSupported ? (
                                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                            ) : (
                                              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                              <span className="font-bold block">
                                                {isNativeFileSupported
                                                  ? 'Direct PC Config Script Compatible'
                                                  : 'Console Reference & Checklist Recommended'}
                                              </span>
                                              <span className="text-[#A6A2B5] block mt-0.5">
                                                {isNativeFileSupported
                                                  ? `Drop ${compiledConfig.filename} into your ${theme.shortName} configuration folder, or export a PDF sheet.`
                                                  : `Console platforms (${profile.platform.toUpperCase()}) do not allow direct .cfg file injection. Use Checklist Mode or Print PDF for step-by-step console setup, or download the reference script below.`}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Generated Output Code Preview */}
                                          <div className="rounded-2xl bg-[#121117] border border-white/[0.08] overflow-hidden">
                                            <div className="px-4 py-2.5 bg-[#16151C] border-b border-white/[0.06] flex items-center justify-between">
                                              <span className="text-xs font-mono text-[#A6A2B5]">
                                                {compiledConfig.filename}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={handleCopyConfigText}
                                                className="text-xs font-semibold text-[#FF5E36] hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25232E]"
                                              >
                                                {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                                                {copiedCode ? 'Copied' : 'Copy Script'}
                                              </button>
                                            </div>
                                            <pre className="p-4 text-xs font-mono text-[#F7F6F9]/90 overflow-x-auto max-h-56 leading-relaxed">
                                              {compiledConfig.content}
                                            </pre>
                                          </div>

                                          {/* Footer Actions */}
                                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setShowExporter(false);
                                                handlePrint();
                                              }}
                                              className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
                                            >
                                              <FileDown size={14} /> Export PDF / Print Sheet
                                            </button>

                                            <div className="flex items-center gap-2.5">
                                              <button
                                                type="button"
                                                onClick={() => setShowExporter(false)}
                                                className="gs-btn-secondary px-4 py-2.5 text-xs"
                                              >
                                                Close
                                              </button>
                                              <button
                                                type="button"
                                                onClick={handleDownloadConfig}
                                                className="gs-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-1.5"
                                              >
                                                <FileCode2 size={14} /> Download {compiledConfig.filename}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Checklist Mobile / Companion Overlay */}
                                    {checklistOpen && (
        <ChecklistMode
          profile={profile}
          onClose={() => {
            setChecklistOpen(false);
            loadData();
          }}
        />
      )}
                                  </div>
                                  );
};
