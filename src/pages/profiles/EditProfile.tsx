import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Layers,
  Users,
  Gamepad2,
  Tv,
  Check,
  Monitor,
  Mouse,
  Search,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getProfiles,
  saveProfile,
  getTemplates,
  getCurrentUser,
  type GameProfile,
  type SettingsTemplate,
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import {
  GameArtwork,
  GamePill,
  PlatformBadge,
  InputBadge,
  getGameTheme,
  useToast,
} from '../../components/ui';

export const EditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [currentUser] = useState(getCurrentUser());
  const [templates, setTemplates] = useState<SettingsTemplate[]>([]);

  // Base details
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('bo6');
  const [platform, setPlatform] = useState<'pc' | 'playstation' | 'xbox' | 'switch'>('pc');
  const [inputType, setInputType] = useState<'controller' | 'keyboard_mouse'>('keyboard_mouse');
  const [tagsText, setTagsText] = useState('');

  // Settings Map
  const [settings, setSettings] = useState<Record<string, string | number | boolean>>({});

  // UI State
  const [activeCategory, setActiveCategory] = useState('');
  const [settingSearch, setSettingSearch] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showProPicker, setShowProPicker] = useState(false);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setTemplates(getTemplates());

    if (isEditing && id) {
      const all = getProfiles();
      const profile = all.find((p) => p.id === id);
      if (profile) {
        setName(profile.name);
        setGameId(profile.gameId);
        setPlatform(profile.platform);
        setInputType(profile.inputType);
        setTagsText((profile.tags || []).join(', '));
        setSettings(profile.settings);
        setStep(3);
      } else {
        navigate('/profiles');
      }
    }
  }, [id, isEditing]);

  const activeGame = SUPPORTED_GAMES.find((g) => g.id === gameId);
  const theme = getGameTheme(gameId);

  useEffect(() => {
    if (activeGame && activeGame.categories.length > 0) {
      const firstValid =
        activeGame.categories.find((cat) =>
          activeGame.fields.some(
            (f) =>
              f.category === cat && (!f.platformLimit || f.platformLimit.includes(platform))
          )
        ) || activeGame.categories[0];
      setActiveCategory(firstValid);
    }
  }, [gameId, platform, step]);

  const initializeDefaultSettings = () => {
    if (!activeGame) return;
    const defaults: Record<string, string | number | boolean> = {};
    activeGame.fields.forEach((field) => {
      defaults[field.id] = field.default;
    });
    setSettings(defaults);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        showToast('Name Required', 'Please enter a name for your loadout.', 'warning');
        return;
      }
      initializeDefaultSettings();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleApplyTemplate = (tpl: SettingsTemplate) => {
    setSettings((prev) => ({
      ...prev,
      ...tpl.settings,
    }));
    setShowTemplatePicker(false);
    if (step === 2) setStep(3);
    showToast('Template Applied', `Loaded "${tpl.name}" as your configuration base.`);
  };

  const handleApplyProConfig = (proProfile: GameProfile) => {
    setSettings((prev) => ({
      ...prev,
      ...proProfile.settings,
    }));
    setShowProPicker(false);
    if (step === 2) setStep(3);
    showToast(
      'Pro Setup Imported',
      `Applied ${proProfile.username}'s verified configuration.`
    );
  };

  const handleResetCategoryDefaults = () => {
    if (!activeGame) return;
    const updated = { ...settings };
    activeGame.fields
      .filter((f) => f.category === activeCategory)
      .forEach((f) => {
        updated[f.id] = f.default;
      });
    setSettings(updated);
    showToast('Category Reset', `Restored ${activeCategory} settings to game defaults.`, 'info');
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Name Required', 'Please provide a loadout name before saving.', 'warning');
      return;
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const existing = isEditing && id ? getProfiles().find((p) => p.id === id) : undefined;

    const profileData: GameProfile = {
      id: isEditing && id ? id : 'prof_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      gameId,
      platform,
      inputType,
      tags,
      isPinned: existing?.isPinned || false,
      isPublic: existing?.isPublic || false,
      userId: 'current_user',
      username: currentUser.username,
      isPro: false,
      copiesCount: existing?.copiesCount || 0,
      lastUsed: new Date().toISOString(),
      settings,
    };

    saveProfile(profileData);
    showToast(
      isEditing ? 'Changes Saved' : 'Loadout Created',
      `"${profileData.name}" has been committed to your locker.`
    );
    navigate(`/profiles/${profileData.id}`);
  };

  const currentFields = (activeGame?.fields || []).filter((field) => {
    const matchesPlatform =
      !field.platformLimit || field.platformLimit.includes(platform);
    if (!matchesPlatform) return false;
    if (settingSearch.trim().length > 0) {
      return (
        field.name.toLowerCase().includes(settingSearch.toLowerCase()) ||
        field.category.toLowerCase().includes(settingSearch.toLowerCase())
      );
    }
    return field.category === activeCategory;
  });

  const handleFieldChange = (fieldId: string, val: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const stepLabels = [
    { num: 1, title: 'Identity & Hardware', subtitle: 'Game, platform & input' },
    { num: 2, title: 'Starting Foundation', subtitle: 'Defaults, templates or pros' },
    { num: 3, title: 'Calibrate Settings', subtitle: 'Fine-tune parameters' },
  ];

  return (
    <div className="space-y-7 max-w-6xl mx-auto animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={isEditing && id ? `/profiles/${id}` : '/profiles'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A6A2B5] hover:text-[#F7F6F9] px-3.5 py-2 rounded-full bg-[#1D1B24] border border-white/[0.06] transition-colors"
        >
          <ChevronLeft size={15} /> {isEditing ? 'Back to Profile' : 'Back to Locker'}
        </Link>

        {isEditing && (
          <button
            type="button"
            onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
            className="gs-btn-secondary px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            Edit Name / Hardware
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="rounded-[28px] overflow-hidden border border-white/10 bg-[#1D1B24] shadow-card">
        <GameArtwork gameId={gameId} className="p-6 sm:p-7" overlayIntensity="heavy">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <GamePill gameId={gameId} />
                <PlatformBadge platform={platform} />
                <InputBadge inputType={inputType} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F9] tracking-tight">
                {isEditing ? `Tune: ${name || 'Loadout'}` : name || 'Create New Loadout'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A6A2B5] mt-1">
                {isEditing
                  ? 'All edits automatically create a backup snapshot in Version History.'
                  : 'Configure your hardware platform, choose a foundation, and calibrate every setting.'}
              </p>
            </div>

            {step === 3 && (
              <button
                type="button"
                onClick={handleSave}
                className="gs-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 self-start sm:self-center shrink-0"
              >
                <Save size={16} />
                {isEditing ? 'Save Changes' : 'Save Loadout'}
              </button>
            )}
          </div>
        </GameArtwork>
      </div>

      {/* Inline Metadata Editor Drawer when editing an existing profile */}
      {isEditing && showMetadataDrawer && (
        <div className="gs-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-sm font-bold text-[#F7F6F9]">Profile Identity & Hardware</h2>
            <button
              type="button"
              onClick={() => setShowMetadataDrawer(false)}
              className="text-xs text-[#A6A2B5] hover:text-white"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A6A2B5]">Loadout Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 gs-input text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A6A2B5]">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-2.5 gs-input text-sm"
              >
                <option value="pc">PC</option>
                <option value="playstation">PlayStation</option>
                <option value="xbox">Xbox</option>
                <option value="switch">Nintendo Switch</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A6A2B5]">Input Device</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-full px-4 py-2.5 gs-input text-sm"
              >
                <option value="keyboard_mouse">Keyboard & Mouse</option>
                <option value="controller">Controller / Gamepad</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <label className="block text-xs font-semibold text-[#A6A2B5]">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="ranked, competitive, low-sens"
                className="w-full px-4 py-2.5 gs-input text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* PROGRESSIVE STEPPER (WHEN CREATING NEW LOADOUT) */}
      {!isEditing && (
        <div className="grid grid-cols-3 gap-3">
          {stepLabels.map((item) => {
            const active = step === item.num;
            const completed = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  if (item.num < step) setStep(item.num);
                }}
                disabled={item.num > step}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                  active
                    ? 'bg-[#25232E] border-[#FF5E36]/50 shadow-lg'
                    : completed
                    ? 'bg-[#1D1B24] border-emerald-500/30 cursor-pointer hover:bg-[#25232E]'
                    : 'bg-[#16151C] border-white/[0.05] opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    active
                      ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30'
                      : completed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#25232E] text-[#6E6A7E]'
                  }`}
                >
                  {completed ? <Check size={14} /> : item.num}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#F7F6F9] truncate">
                    {item.title}
                  </span>
                  <span className="hidden sm:block text-[11px] text-[#6E6A7E] truncate">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 1: IDENTITY & HARDWARE */}
      {step === 1 && (
        <div className="gs-card p-6 sm:p-8 space-y-7">
          <div>
            <h2 className="text-lg font-bold text-[#F7F6F9]">1. Loadout Identity & Target Game</h2>
            <p className="text-xs text-[#A6A2B5] mt-0.5">
              Choose the game engine and hardware environment for this configuration.
            </p>
          </div>

          {/* Visual Game Selector Cards */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#A6A2B5]">
              Select Game Title
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SUPPORTED_GAMES.map((g) => {
                const gTheme = getGameTheme(g.id);
                const selected = gameId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGameId(g.id)}
                    className={`group relative rounded-2xl overflow-hidden border text-left p-3.5 h-28 flex flex-col justify-between transition-all ${
                      selected
                        ? 'border-[#FF5E36] ring-2 ring-[#FF5E36]/30 scale-[1.01]'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <GameArtwork
                      gameId={g.id}
                      className="absolute inset-0 w-full h-full"
                      overlayIntensity="heavy"
                    />
                    <div className="relative z-10 flex justify-between items-center w-full">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: gTheme.accentHex }}
                      />
                      {selected && (
                        <span className="w-5 h-5 rounded-full bg-[#FF5E36] text-white flex items-center justify-center">
                          <Check size={11} />
                        </span>
                      )}
                    </div>
                    <div className="relative z-10">
                      <span className="block text-xs font-bold text-[#F7F6F9] leading-tight">
                        {gTheme.shortName}
                      </span>
                      <span className="block text-[10px] text-[#A6A2B5] mt-0.5">
                        {gTheme.engine}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loadout Name */}
            <div className="space-y-2">
              <label htmlFor="loadout-name" className="block text-xs font-semibold text-[#A6A2B5]">
                Loadout Name
              </label>
              <input
                id="loadout-name"
                type="text"
                placeholder="e.g. Ranked Tournament 240Hz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 gs-input text-sm"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="loadout-tags" className="block text-xs font-semibold text-[#A6A2B5]">
                Tags (comma separated)
              </label>
              <input
                id="loadout-tags"
                type="text"
                placeholder="e.g. competitive, linear, low-latency"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-4 py-3 gs-input text-sm"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#A6A2B5]">
                Hardware Platform
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { id: 'pc', label: 'PC', icon: Monitor },
                    { id: 'playstation', label: 'PlayStation', icon: Tv },
                    { id: 'xbox', label: 'Xbox', icon: Tv },
                    { id: 'switch', label: 'Switch', icon: Tv },
                  ] as const
                ).map((plat) => {
                  const Icon = plat.icon;
                  const active = platform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setPlatform(plat.id)}
                      className={`py-3 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        active
                          ? 'bg-[#FF5E36]/15 border-[#FF5E36] text-[#F7F6F9]'
                          : 'bg-[#121117] border-white/[0.07] text-[#A6A2B5] hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-[#FF5E36]' : ''} />
                      {plat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Device Selection */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#A6A2B5]">
                Primary Input Method
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInputType('keyboard_mouse')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    inputType === 'keyboard_mouse'
                      ? 'bg-[#FF5E36]/15 border-[#FF5E36] text-[#F7F6F9]'
                      : 'bg-[#121117] border-white/[0.07] text-[#A6A2B5] hover:text-white'
                  }`}
                >
                  <Mouse
                    size={16}
                    className={inputType === 'keyboard_mouse' ? 'text-[#FF5E36]' : ''}
                  />
                  Keyboard & Mouse
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('controller')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    inputType === 'controller'
                      ? 'bg-[#FF5E36]/15 border-[#FF5E36] text-[#F7F6F9]'
                      : 'bg-[#121117] border-white/[0.07] text-[#A6A2B5] hover:text-white'
                  }`}
                >
                  <Gamepad2
                    size={16}
                    className={inputType === 'controller' ? 'text-[#FF5E36]' : ''}
                  />
                  Controller / Gamepad
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              className="gs-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
            >
              Continue to Foundation <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STARTING FOUNDATION */}
      {step === 2 && (
        <div className="gs-card p-6 sm:p-8 space-y-7">
          <div>
            <h2 className="text-lg font-bold text-[#F7F6F9]">
              2. Choose Your Starting Foundation
            </h2>
            <p className="text-xs text-[#A6A2B5] mt-0.5">
              Pre-populate your {theme.name} settings from stock defaults, a reusable baseline, or a verified esports pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Option 1: Game Defaults */}
            <button
              type="button"
              onClick={handleNextStep}
              className="gs-card-interactive p-6 text-left flex flex-col justify-between group bg-[#16151C]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center mb-4">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-base font-bold text-[#F7F6F9] group-hover:text-[#FF5E36] transition-colors">
                  Recommended Defaults
                </h3>
                <p className="text-xs text-[#A6A2B5] mt-1.5 leading-relaxed">
                  Start with balanced stock {theme.shortName} parameters ready for manual calibration.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-[#FF5E36] inline-flex items-center gap-1">
                Start with Defaults <ChevronRight size={14} />
              </span>
            </button>

            {/* Option 2: Load Saved Template */}
            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              className="gs-card-interactive p-6 text-left flex flex-col justify-between group bg-[#16151C]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
                  <Layers size={22} />
                </div>
                <h3 className="text-base font-bold text-[#F7F6F9] group-hover:text-indigo-300 transition-colors">
                  Apply Base Template
                </h3>
                <p className="text-xs text-[#A6A2B5] mt-1.5 leading-relaxed">
                  Seed settings from one of your saved baseline presets ({templates.length} available).
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-indigo-400 inline-flex items-center gap-1">
                Browse Templates <ChevronRight size={14} />
              </span>
            </button>

            {/* Option 3: Pro Player Preset */}
            <button
              type="button"
              onClick={() => setShowProPicker(true)}
              className="gs-card-interactive p-6 text-left flex flex-col justify-between group bg-[#16151C]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                  <Users size={22} />
                </div>
                <h3 className="text-base font-bold text-[#F7F6F9] group-hover:text-amber-300 transition-colors">
                  Verified Pro Loadout
                </h3>
                <p className="text-xs text-[#A6A2B5] mt-1.5 leading-relaxed">
                  Import tournament-tested settings from professional players and customize from there.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
                Select Pro Setup <ChevronRight size={14} />
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="gs-btn-secondary px-5 py-2.5 text-xs inline-flex items-center gap-1.5"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="gs-btn-primary px-6 py-2.5 text-xs sm:text-sm inline-flex items-center gap-1.5"
            >
              Skip to Calibration <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CALIBRATE SETTINGS */}
      {step === 3 && activeGame && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 3 Columns: Category Navigation & Quick Utilities */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search across all settings */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6A7E]"
              />
              <input
                type="text"
                placeholder="Search any setting..."
                value={settingSearch}
                onChange={(e) => setSettingSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-full bg-[#1D1B24] border border-white/[0.07] text-xs text-[#F7F6F9] placeholder-[#6E6A7E] focus:border-[#FF5E36] focus:outline-none"
              />
              {settingSearch && (
                <button
                  type="button"
                  onClick={() => setSettingSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6A7E] hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="gs-card p-3 space-y-1">
              <p className="text-[11px] font-semibold text-[#6E6A7E] px-3 py-1.5">
                Configuration Groups
              </p>
              {activeGame.categories.map((cat) => {
                const catFields = activeGame.fields.filter(
                  (f) =>
                    f.category === cat &&
                    (!f.platformLimit || f.platformLimit.includes(platform))
                );
                if (catFields.length === 0) return null;
                const active = activeCategory === cat && !settingSearch;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSettingSearch('');
                      setActiveCategory(cat);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                      active
                        ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                        : 'text-[#A6A2B5] hover:bg-[#25232E] hover:text-[#F7F6F9]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums ${
                        active ? 'bg-black/25 text-white' : 'bg-[#16151C] text-[#6E6A7E]'
                      }`}
                    >
                      {catFields.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preset Utilities */}
            <div className="gs-card p-4 space-y-2.5">
              <span className="block text-xs font-bold text-[#F7F6F9] mb-1">
                Quick Seed Presets
              </span>
              <button
                type="button"
                onClick={() => setShowTemplatePicker(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] text-xs font-semibold text-[#A6A2B5] hover:text-white transition-colors flex items-center gap-2"
              >
                <Layers size={14} className="text-indigo-400" /> Apply Saved Template
              </button>
              <button
                type="button"
                onClick={() => setShowProPicker(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] text-xs font-semibold text-[#A6A2B5] hover:text-white transition-colors flex items-center gap-2"
              >
                <Users size={14} className="text-amber-400" /> Import Pro Setup
              </button>
              <button
                type="button"
                onClick={handleResetCategoryDefaults}
                className="w-full py-2.5 px-3 rounded-xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] text-xs font-semibold text-[#A6A2B5] hover:text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} className="text-[#FF5E36]" /> Reset {activeCategory}
              </button>
            </div>
          </div>

          {/* Right 9 Columns: Setting Controls */}
          <div className="lg:col-span-9 space-y-6">
            <div className="gs-card p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#F7F6F9]">
                    {settingSearch
                      ? `Matching Settings for "${settingSearch}"`
                      : activeCategory}
                  </h2>
                  <p className="text-xs text-[#6E6A7E]">
                    {currentFields.length} adjustable parameters for {platform.toUpperCase()}
                  </p>
                </div>
              </div>

              {currentFields.length === 0 ? (
                <p className="text-sm text-[#6E6A7E] py-12 text-center">
                  No settings found matching this filter.
                </p>
              ) : (
                <div className="space-y-4">
                  {currentFields.map((field) => {
                    const val =
                      settings[field.id] !== undefined ? settings[field.id] : field.default;

                    return (
                      <div
                        key={field.id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#16151C] border border-white/[0.05] hover:border-white/10 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <label
                              htmlFor={`field-${field.id}`}
                              className="block text-sm font-semibold text-[#F7F6F9]"
                            >
                              {field.name}
                            </label>
                            <div className="flex items-center gap-2 mt-0.5">
                              {settingSearch && (
                                <span className="text-[11px] text-[#6E6A7E]">{field.category}</span>
                              )}
                              {field.platformLimit && (
                                <span className="text-[10px] text-[#6E6A7E]">
                                  {field.platformLimit.map((p) => p.toUpperCase()).join(', ')} only
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Current value badge */}
                          <span className="px-3 py-1 rounded-xl bg-[#121117] border border-white/[0.07] text-xs font-bold text-[#FF5E36] tabular-nums">
                            {field.type === 'toggle'
                              ? val
                                ? 'Enabled'
                                : 'Disabled'
                              : String(val)}
                          </span>
                        </div>

                        {/* SLIDER CONTROL */}
                        {field.type === 'slider' && (
                          <div className="flex items-center gap-4 pt-1">
                            <input
                              id={`field-${field.id}`}
                              type="range"
                              min={field.min ?? 0}
                              max={field.max ?? 100}
                              step={field.step ?? 1}
                              value={Number(val)}
                              onChange={(e) =>
                                handleFieldChange(field.id, parseFloat(e.target.value))
                              }
                              className="flex-grow"
                            />
                            <input
                              type="number"
                              aria-label={`${field.name} numeric input`}
                              min={field.min ?? 0}
                              max={field.max ?? 100}
                              step={field.step ?? 1}
                              value={Number(val)}
                              onChange={(e) =>
                                handleFieldChange(
                                  field.id,
                                  parseFloat(e.target.value) || (field.min ?? 0)
                                )
                              }
                              className="w-20 px-2.5 py-1.5 rounded-xl bg-[#121117] border border-white/10 text-xs font-bold text-center text-[#F7F6F9] tabular-nums focus:border-[#FF5E36] focus:outline-none"
                            />
                          </div>
                        )}

                        {/* TOGGLE CONTROL */}
                        {field.type === 'toggle' && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-[#A6A2B5]">
                              Toggle parameter state
                            </span>
                            <button
                              id={`field-${field.id}`}
                              type="button"
                              onClick={() => handleFieldChange(field.id, !val)}
                              className={`relative w-12 h-7 rounded-full transition-colors duration-200 border ${
                                val
                                  ? 'bg-[#FF5E36] border-[#FF5E36]'
                                  : 'bg-[#121117] border-white/10'
                              }`}
                            >
                              <span
                                className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                  val ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* SELECT CONTROL: Segmented Pills if <= 4 options, Dropdown if > 4 */}
                        {field.type === 'select' && field.options && (
                          <div>
                            {field.options.length <= 4 ? (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {field.options.map((opt) => {
                                  const selected = String(val) === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleFieldChange(field.id, opt)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                        selected
                                          ? 'bg-[#FF5E36] text-white border-[#FF5E36] shadow-sm'
                                          : 'bg-[#121117] text-[#A6A2B5] hover:text-white border-white/[0.06]'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <select
                                id={`field-${field.id}`}
                                value={String(val)}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                className="w-full px-4 py-2.5 gs-input text-xs font-medium"
                              >
                                {field.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {/* KEYBIND CONTROL */}
                        {field.type === 'keybind' && (
                          <div className="flex items-center gap-3 pt-1">
                            <input
                              id={`field-${field.id}`}
                              type="text"
                              maxLength={14}
                              placeholder="Press or type key (e.g. F)"
                              value={String(val)}
                              onChange={(e) =>
                                handleFieldChange(field.id, e.target.value.toUpperCase())
                              }
                              className="w-44 px-3.5 py-2 rounded-xl bg-[#121117] border border-white/15 text-xs font-mono font-bold text-center text-[#F7F6F9] focus:border-[#FF5E36] focus:outline-none"
                            />
                            <span className="text-xs text-[#6E6A7E]">Keybinding</span>
                          </div>
                        )}

                        {/* TEXT CONTROL */}
                        {field.type === 'text' && (
                          <input
                            id={`field-${field.id}`}
                            type="text"
                            value={String(val)}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full px-4 py-2.5 gs-input text-xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="gs-card p-4 sm:p-5 flex items-center justify-between">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="gs-btn-secondary px-5 py-2.5 text-xs inline-flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} /> Previous Step
                </button>
              ) : (
                <span className="text-xs text-[#A6A2B5]">
                  Ready to save changes to "{name}"
                </span>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="gs-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
              >
                <Save size={15} />
                {isEditing ? 'Commit Changes' : 'Save Loadout to Locker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL */}
      {showTemplatePicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowTemplatePicker(false)}
        >
          <div
            className="max-w-lg w-full rounded-[28px] bg-[#1D1B24] border border-white/15 p-6 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F7F6F9]">
                  Apply Settings Base Template
                </h3>
                <p className="text-xs text-[#A6A2B5]">
                  Select a saved preset to populate your settings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatePicker(false)}
                className="w-8 h-8 rounded-full bg-[#25232E] text-[#A6A2B5] hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {templates.length === 0 ? (
                <p className="text-xs text-[#6E6A7E] text-center py-8">
                  No baseline templates saved yet.
                </p>
              ) : (
                templates.map((tpl) => {
                  const gTheme = getGameTheme(tpl.gameId);
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full text-left p-4 rounded-2xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] hover:border-[#FF5E36]/40 transition-all flex justify-between items-center"
                    >
                      <div>
                        <span className="block font-bold text-sm text-[#F7F6F9]">
                          {tpl.name}
                        </span>
                        <span className="block text-xs text-[#A6A2B5] mt-0.5">
                          {gTheme.name} •{' '}
                          {tpl.inputType === 'controller' ? 'Controller' : 'Key & Mouse'}
                        </span>
                      </div>
                      <Layers size={16} className="text-[#FF5E36]" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRO PLAYER PRESET MODAL */}
      {showProPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowProPicker(false)}
        >
          <div
            className="max-w-lg w-full rounded-[28px] bg-[#1D1B24] border border-white/15 p-6 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F7F6F9]">
                  Import Verified Pro Preset
                </h3>
                <p className="text-xs text-[#A6A2B5]">
                  Showing pro configurations for {theme.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProPicker(false)}
                className="w-8 h-8 rounded-full bg-[#25232E] text-[#A6A2B5] hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {(() => {
                const proList = getProfiles().filter(
                  (p) => p.isPro && (p.gameId === gameId || true)
                );
                const matchingGamePros = proList.filter((p) => p.gameId === gameId);
                const listToShow = matchingGamePros.length > 0 ? matchingGamePros : proList;

                return listToShow.map((pro) => (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => handleApplyProConfig(pro)}
                    className="w-full text-left p-4 rounded-2xl bg-[#16151C] hover:bg-[#25232E] border border-white/[0.06] hover:border-amber-500/40 transition-all flex justify-between items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F7F6F9]">
                          {pro.username} — {pro.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          Pro
                        </span>
                      </div>
                      <p className="text-xs text-[#A6A2B5] mt-1">
                        {pro.proBio || 'Tournament-verified esports configuration.'}
                      </p>
                    </div>
                    <Users size={16} className="text-amber-400 shrink-0" />
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
