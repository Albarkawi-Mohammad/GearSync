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
  Check 
} from 'lucide-react';
import { 
  getProfiles, 
  saveProfile, 
  getTemplates, 
  getCurrentUser, 
  type GameProfile, 
  type SettingsTemplate 
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';

export const EditProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [currentUser] = useState(getCurrentUser());
  const [templates, setTemplates] = useState<SettingsTemplate[]>([]);

  // Step 1: Base details
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('bo6');
  const [platform, setPlatform] = useState<'pc' | 'playstation' | 'xbox' | 'switch'>('pc');
  const [inputType, setInputType] = useState<'controller' | 'keyboard_mouse'>('keyboard_mouse');
  const [tagsText, setTagsText] = useState('');
  
  // Step 2: Settings Map
  const [settings, setSettings] = useState<Record<string, string | number | boolean>>({});

  // UI state
  const [activeCategory, setActiveCategory] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showProPicker, setShowProPicker] = useState(false);

  useEffect(() => {
    setTemplates(getTemplates());
    
    if (isEditing && id) {
      const all = getProfiles();
      const profile = all.find(p => p.id === id);
      if (profile) {
        setName(profile.name);
        setGameId(profile.gameId);
        setPlatform(profile.platform);
        setInputType(profile.inputType);
        setTagsText((profile.tags || []).join(', '));
        setSettings(profile.settings);
        // Skip straight to step 3 when editing
        setStep(3);
      } else {
        navigate('/profiles');
      }
    }
  }, [id, isEditing]);

  const activeGame = SUPPORTED_GAMES.find(g => g.id === gameId);

  // Set the first category as active when step changes to 3 or gameId changes
  useEffect(() => {
    if (activeGame && activeGame.categories.length > 0) {
      setActiveCategory(activeGame.categories[0]);
    }
  }, [gameId, step]);

  // Load defaults for the active game
  const initializeDefaultSettings = () => {
    if (!activeGame) return;
    const defaults: Record<string, string | number | boolean> = {};
    activeGame.fields.forEach(field => {
      defaults[field.id] = field.default;
    });
    setSettings(defaults);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        alert('Please enter a loadout name.');
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

  // Import settings from a saved template
  const handleApplyTemplate = (tpl: SettingsTemplate) => {
    setSettings(prev => ({
      ...prev,
      ...tpl.settings
    }));
    setShowTemplatePicker(false);
    alert(`Applied template "${tpl.name}" as configuration base!`);
  };

  // Import settings from a Pro Player profile
  const handleApplyProConfig = (proProfile: GameProfile) => {
    setSettings(prev => ({
      ...prev,
      ...proProfile.settings
    }));
    setShowProPicker(false);
    alert(`Imported ${proProfile.username}'s configurations into the editor!`);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please fill out the loadout name.');
      return;
    }

    const tags = tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const profileData: GameProfile = {
      id: isEditing && id ? id : 'prof_' + Math.random().toString(36).substring(2, 9),
      name,
      gameId,
      platform,
      inputType,
      tags,
      isPinned: isEditing && id ? getProfiles().find(p => p.id === id)?.isPinned || false : false,
      isPublic: isEditing && id ? getProfiles().find(p => p.id === id)?.isPublic || false : false,
      userId: 'current_user',
      username: currentUser.username,
      isPro: false,
      copiesCount: isEditing && id ? getProfiles().find(p => p.id === id)?.copiesCount || 0 : 0,
      lastUsed: new Date().toISOString(),
      settings
    };

    saveProfile(profileData);
    navigate(`/profiles/${profileData.id}`);
  };

  // Filter game fields by category and platform restrictions
  const currentFields = (activeGame?.fields || []).filter(field => {
    const matchesCategory = field.category === activeCategory;
    const matchesPlatform = !field.platformLimit || field.platformLimit.includes(platform);
    return matchesCategory && matchesPlatform;
  });

  const handleFieldChange = (fieldId: string, val: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      ...settings, // fallback safety
      [fieldId]: val
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
        <Link to="/profiles" className="hover:text-brand-cyan transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Cancel
        </Link>
      </div>

      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white">
          {isEditing ? 'ADJUST PROFILE LOADOUT' : 'DEPLOY SETTINGS PROFILE'}
        </h1>
        <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
          {isEditing ? `Modifying profile: ${name}` : 'Setup, seed, and calibrate a fresh game config'}
        </p>
      </div>

      {/* STEP INDICATORS */}
      {!isEditing && (
        <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs border ${
                  step === num
                    ? 'bg-brand-cyan text-[#070A13] border-brand-cyan shadow-md shadow-brand-cyan/20'
                    : step > num
                    ? 'bg-brand-primary/20 border-brand-primary text-brand-cyan'
                    : 'bg-[#161F30] border-slate-800 text-gray-500'
                }`}
              >
                {step > num ? <Check size={12} /> : num}
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${
                step === num ? 'text-brand-cyan font-bold' : 'text-gray-500'
              }`}>
                {num === 1 ? 'Details' : num === 2 ? 'Foundation' : 'Calibrate'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: LOADOUT CORE DETAILS */}
      {step === 1 && (
        <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 space-y-6">
          <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
            Sector 01: Profile Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loadout Name */}
            <div className="space-y-2">
              <label htmlFor="loadout-name" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                LOADOUT DESIGNATION (NAME)
              </label>
              <input
                id="loadout-name"
                type="text"
                placeholder="e.g. ranked-beast-mk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              />
            </div>

            {/* Game selection */}
            <div className="space-y-2">
              <label htmlFor="game-id" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                TARGET GAME
              </label>
              <select
                id="game-id"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              >
                {SUPPORTED_GAMES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Platform selection */}
            <div className="space-y-2">
              <span className="block text-xs font-bold font-mono text-gray-300 uppercase mb-2">
                PLATFORM ARCHITECTURE
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['pc', 'playstation', 'xbox', 'switch'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatform(plat)}
                    className={`py-3.5 border rounded-lg font-mono text-xs uppercase font-bold flex flex-col items-center gap-1.5 transition-[background-color,border-color,color] duration-150 ease-out ${
                      platform === plat
                        ? 'bg-brand-primary/10 border-brand-cyan text-brand-cyan'
                        : 'bg-[#0B0F19] border-slate-800 text-gray-400 hover:border-slate-750'
                    }`}
                  >
                    <Tv size={14} />
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Selection */}
            <div className="space-y-2">
              <span className="block text-xs font-bold font-mono text-gray-300 uppercase mb-2">
                INPUT CHANNEL
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInputType('keyboard_mouse')}
                  className={`py-3.5 border rounded-lg font-mono text-xs uppercase font-bold flex flex-col items-center gap-1.5 transition-[background-color,border-color,color] duration-150 ease-out ${
                    inputType === 'keyboard_mouse'
                      ? 'bg-brand-primary/10 border-brand-cyan text-brand-cyan'
                      : 'bg-[#0B0F19] border-slate-800 text-gray-400 hover:border-slate-750'
                  }`}
                >
                  <Gamepad2 size={14} /> Key & Mouse
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('controller')}
                  className={`py-3.5 border rounded-lg font-mono text-xs uppercase font-bold flex flex-col items-center gap-1.5 transition-[background-color,border-color,color] duration-150 ease-out ${
                    inputType === 'controller'
                      ? 'bg-brand-primary/10 border-brand-cyan text-brand-cyan'
                      : 'bg-[#0B0F19] border-slate-800 text-gray-400 hover:border-slate-750'
                  }`}
                >
                  <Gamepad2 size={14} /> Gamepad
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="loadout-tags" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                LOADOUT CHIPS / TAGS (COMMA SEPARATED)
              </label>
              <input
                id="loadout-tags"
                type="text"
                placeholder="e.g. ranked, competitive, custom, hyper"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1 shadow-md shadow-brand-primary/20"
            >
              Step 02: Foundation <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOAD SEED FOUNDATIONS */}
      {step === 2 && (
        <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 space-y-6">
          <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
            Sector 02: Seed Initial Configurations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blank start */}
            <button
              onClick={handleNextStep}
              className="p-6 bg-[#0B0F19] border border-slate-800 hover:border-brand-cyan/40 rounded-xl text-center group flex flex-col items-center justify-center gap-3 transition-colors"
            >
              <span className="p-3 rounded-full bg-slate-900 text-gray-400 group-hover:text-brand-cyan">
                <Gamepad2 size={24} />
              </span>
              <span className="block font-bold text-sm text-gray-200">System Defaults</span>
              <span className="block text-[10px] font-mono text-gray-500">Seed with basic stock settings</span>
            </button>

            {/* Template select */}
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="p-6 bg-[#0B0F19] border border-slate-800 hover:border-brand-cyan/40 rounded-xl text-center group flex flex-col items-center justify-center gap-3 transition-colors"
            >
              <span className="p-3 rounded-full bg-slate-900 text-gray-400 group-hover:text-brand-cyan">
                <Layers size={24} />
              </span>
              <span className="block font-bold text-sm text-gray-200">Load Template</span>
              <span className="block text-[10px] font-mono text-gray-500">Apply a pre-saved base config</span>
            </button>

            {/* Pro Player Select */}
            <button
              onClick={() => setShowProPicker(true)}
              className="p-6 bg-[#0B0F19] border border-slate-800 hover:border-brand-cyan/40 rounded-xl text-center group flex flex-col items-center justify-center gap-3 transition-colors"
            >
              <span className="p-3 rounded-full bg-slate-900 text-gray-400 group-hover:text-brand-cyan">
                <Users size={24} />
              </span>
              <span className="block font-bold text-sm text-gray-200">Start from a Pro</span>
              <span className="block text-[10px] font-mono text-gray-500">Seed configuration from active pros</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-gray-300 font-mono text-xs uppercase font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1 transition-[filter,transform] duration-120 ease-out"
            >
              Step 03: Calibrate <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILED VALUE CALIBRATION */}
      {step === 3 && activeGame && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Categories tabs */}
          <div className="lg:col-span-1 space-y-2">
            <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 mb-3">TABS SECTORS</span>
            {activeGame.categories.map((cat) => {
              // Ensure category has fields for active platform selection
              const hasFields = activeGame.fields.some(f => f.category === cat && (!f.platformLimit || f.platformLimit.includes(platform)));
              if (!hasFields) return null;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wide transition-[background-color,border-color,color] duration-150 ease-out border ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-cyan/5 border-brand-cyan/40 text-brand-cyan'
                      : 'bg-[#161F30]/35 border-slate-850 text-gray-400 hover:bg-[#161F30]/65 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              );
            })}

            {/* Quick adjust tools */}
            <div className="mt-8 p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3">
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">UTILITIES</span>
              <button 
                type="button"
                onClick={() => setShowTemplatePicker(true)}
                className="w-full py-2 bg-[#161F30]/40 hover:bg-[#161F30]/80 border border-slate-800 text-xs font-mono text-gray-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Layers size={12} /> Apply Template
              </button>
              <button 
                type="button"
                onClick={() => setShowProPicker(true)}
                className="w-full py-2 bg-[#161F30]/40 hover:bg-[#161F30]/80 border border-slate-800 text-xs font-mono text-gray-300 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Users size={12} /> Import Pro Preset
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM BUILDER */}
          <div className="lg:col-span-3 space-y-6">
            <div className="cyber-panel p-6 bg-[#161F30]/25 border-slate-850">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
                <span className="text-sm font-bold font-mono uppercase text-brand-cyan tracking-wider">{activeCategory}</span>
                <span className="text-[10px] font-mono text-gray-500">{currentFields.length} Configs</span>
              </div>

              {currentFields.length === 0 ? (
                <p className="text-sm text-gray-500 font-mono py-12 text-center">No configs available in this sector.</p>
              ) : (
                <div className="space-y-6">
                  {currentFields.map((field) => {
                    const val = settings[field.id] !== undefined ? settings[field.id] : field.default;

                    return (
                      <div key={field.id} className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <label htmlFor={`field-${field.id}`} className="block text-xs font-bold text-gray-200 uppercase tracking-wide">
                            {field.name}
                          </label>
                          <span className="text-xs font-mono font-bold text-brand-cyan bg-[#0B0F19] border border-slate-800 px-2 py-0.5 rounded">
                            {String(val)}
                          </span>
                        </div>

                        {/* SLIDER INPUT */}
                        {field.type === 'slider' && (
                          <div className="flex items-center gap-4">
                            <input
                              id={`field-${field.id}`}
                              type="range"
                              min={field.min ?? 0}
                              max={field.max ?? 100}
                              step={field.step ?? 1}
                              value={Number(val)}
                              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
                              className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                            />
                            <span className="text-[10px] font-mono text-gray-500 w-12 text-right">
                              [{field.min}..{field.max}]
                            </span>
                          </div>
                        )}

                        {/* TOGGLE INPUT */}
                        {field.type === 'toggle' && (
                          <div className="flex items-center">
                            <button
                              id={`field-${field.id}`}
                              type="button"
                              onClick={() => handleFieldChange(field.id, !val)}
                              className={`relative w-12 h-6 rounded-full p-1 transition-[background-color,border-color] duration-200 border focus:outline-none ${
                                val
                                  ? 'bg-brand-primary/20 border-brand-cyan'
                                  : 'bg-[#0B0F19] border-slate-850'
                              }`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200 ease-out ${
                                val ? 'bg-brand-cyan translate-x-6' : 'bg-slate-500 translate-x-0'
                              }`} />
                            </button>
                            <span className="text-[10px] font-mono text-gray-400 ml-3 uppercase">
                              {val ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        )}

                        {/* SELECT INPUT */}
                        {field.type === 'select' && (
                          <select
                            id={`field-${field.id}`}
                            value={String(val)}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800/80 rounded-lg text-xs text-white focus:border-brand-cyan focus:outline-none"
                          >
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {/* KEYBIND / INPUT */}
                        {field.type === 'keybind' && (
                          <input
                            id={`field-${field.id}`}
                            type="text"
                            maxLength={12}
                            placeholder="Type keybind (e.g. F)"
                            value={String(val)}
                            onChange={(e) => handleFieldChange(field.id, e.target.value.toUpperCase())}
                            className="w-full max-w-xs px-3 py-2 bg-[#0B0F19] border border-slate-800/80 rounded-lg text-xs font-mono text-center text-white focus:border-brand-cyan focus:outline-none"
                          />
                        )}

                        {/* TEXT / OTHER */}
                        {field.type === 'text' && (
                          <input
                            id={`field-${field.id}`}
                            type="text"
                            value={String(val)}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800/80 rounded-lg text-xs text-white focus:border-brand-cyan focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submissions */}
            <div className="flex justify-between items-center bg-slate-900/30 p-4 border border-slate-850 rounded-xl">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-gray-300 text-xs font-bold font-mono uppercase rounded-lg transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5 transition-[filter,transform] duration-120 ease-out shadow-lg shadow-brand-primary/20"
                >
                  <Save size={14} /> Commit to Locker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full cyber-panel p-6 bg-[#0E1524] border-brand-cyan/30 shadow-2xl">
            <h3 className="text-base font-bold font-mono tracking-wider text-white mb-4 uppercase pb-2 border-b border-slate-800">
              Apply Settings Base Template
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {templates.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono text-center py-6">No custom templates saved yet.</p>
              ) : (
                templates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full text-left p-4 bg-[#161F30]/50 hover:bg-[#161F30]/90 border border-slate-800 hover:border-brand-cyan/20 rounded-xl transition-[background-color,border-color] duration-150 ease-out flex justify-between items-center"
                  >
                    <div>
                      <span className="block font-bold text-xs text-gray-200">{tpl.name}</span>
                      <span className="block text-[10px] font-mono text-gray-500 uppercase mt-0.5">
                        Game: {SUPPORTED_GAMES.find(g => g.id === tpl.gameId)?.name || tpl.gameId} • Input: {tpl.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                      </span>
                    </div>
                    <Layers size={14} className="text-brand-cyan" />
                  </button>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-mono text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRO PLAYER SELECT MODAL */}
      {showProPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full cyber-panel p-6 bg-[#0E1524] border-brand-primary/30 shadow-2xl">
            <h3 className="text-base font-bold font-mono tracking-wider text-white mb-4 uppercase pb-2 border-b border-slate-800">
              Start from a Pro Preset
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {getProfiles()
                .filter(p => p.isPro && p.gameId === gameId)
                .map(pro => (
                  <button
                    key={pro.id}
                    onClick={() => handleApplyProConfig(pro)}
                    className="w-full text-left p-4 bg-[#161F30]/50 hover:bg-[#161F30]/90 border border-slate-800 hover:border-brand-primary/20 rounded-xl transition-[background-color,border-color] duration-150 ease-out flex justify-between items-center"
                  >
                    <div>
                      <span className="block font-bold text-xs text-brand-cyan">{pro.username} Config</span>
                      <p className="text-[10px] text-gray-400 mt-1">{pro.proBio || 'Professional configuration.'}</p>
                    </div>
                    <Users size={14} className="text-brand-primary" />
                  </button>
                ))}
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowProPicker(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-mono text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
