import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Trash2, CheckCircle2, Rocket, X } from 'lucide-react';
import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  saveProfile,
  getCurrentUser,
  type SettingsTemplate,
  type GameProfile,
} from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import {
  GameArtwork,
  GamePill,
  InputBadge,
  getGameTheme,
  useToast,
} from '../../components/ui';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<SettingsTemplate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { showToast, requestConfirm } = useToast();

  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('bo6');
  const [inputType, setInputType] = useState<'keyboard_mouse' | 'controller'>('keyboard_mouse');

  const loadTemplates = () => {
    setTemplates(getTemplates());
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = templates.find((t) => t.id === id);
    requestConfirm({
      title: `Delete "${target?.name || 'Template'}"?`,
      description:
        'Removing this baseline preset will not affect existing profiles already created from it.',
      confirmLabel: 'Delete Preset',
      variant: 'danger',
      onConfirm: () => {
        deleteTemplate(id);
        loadTemplates();
        showToast('Preset Deleted', 'Baseline template removed.', 'info');
      },
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name Required', 'Please enter a name for your baseline template.', 'warning');
      return;
    }

    const game = SUPPORTED_GAMES.find((g) => g.id === gameId);
    const defaultSettings: Record<string, string | number | boolean> = {};
    if (game) {
        game.fields.forEach((field) => {
          defaultSettings[field.id] = field.default;
        });
      }

    const tpl: SettingsTemplate = {
        id: 'tpl_' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        gameId,
        inputType,
      settings: defaultSettings,
      };

      saveTemplate(tpl);
      setName('');
      setShowAddForm(false);
      loadTemplates();
      showToast('Baseline Created', `"${tpl.name}" is now available when deploying new profiles.`);
    };

    const handleQuickDeploy = (tpl: SettingsTemplate) => {
      const user = getCurrentUser();
      const newProfile: GameProfile = {
        id: 'prof_' + Math.random().toString(36).substring(2, 9),
        name: `${tpl.name} Loadout`,
        gameId: tpl.gameId,
        platform: 'pc',
        inputType: tpl.inputType,
        tags: ['baseline', tpl.gameId],
        isPinned: false,
        isPublic: false,
        userId: 'current_user',
        username: user.username,
        isPro: false,
        lastUsed: new Date().toISOString(),
        copiesCount: 0,
        settings: { ...tpl.settings },
      };

      saveProfile(newProfile);
      showToast('Profile Deployed', `Created "${newProfile.name}" from baseline template.`);
      navigate(`/profiles/${newProfile.id}`);
    };

    return (
        <div className="space-y-7 animate-fade-in">
          {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-2.5">
                    <Layers size={13} />
                    <span>{templates.length} Reusable Foundations</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
                    Baseline Templates
                  </h1>
                    <p className="text-sm text-[#A6A2B5] mt-1">
                      Build reusable configuration foundations to accelerate setting up new competitive profiles.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="gs-btn-primary px-5 py-3 text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
                  >
                    {showAddForm ? <X size={15} /> : <Plus size={15} />}
                    {showAddForm ? 'Close Builder' : 'New Base Preset'}
                  </button>
              </div>

              {/* ADD TEMPLATE BUILDER */}
              {showAddForm && (
                    <form onSubmit={handleCreate} className="gs-card p-6 sm:p-7 space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div>
                          <h2 className="text-base font-bold text-[#F7F6F9]">
                            Create Baseline Configuration Preset
                          </h2>
                          <p className="text-xs text-[#A6A2B5]">
                            Seeds standard defaults for the chosen game and input method
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <label htmlFor="tpl-name" className="block text-xs font-semibold text-[#A6A2B5]">
                              Template Name
                            </label>
                            <input
                              id="tpl-name"
                              type="text"
                              placeholder="e.g. Competitive High-FPS Base"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-4 py-3 gs-input text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tpl-game" className="block text-xs font-semibold text-[#A6A2B5]">
                              Target Game
                            </label>
                            <select
                              id="tpl-game"
                              value={gameId}
                              onChange={(e) => setGameId(e.target.value)}
                              className="w-full px-4 py-3 gs-input text-sm"
                            >
                {
                                  SUPPORTED_GAMES.map((g) => (
                                    <option key={g.id} value={g.id}>
                                      {g.name}
                                    </option>
                                  ))
                                }
              </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tpl-input" className="block text-xs font-semibold text-[#A6A2B5]">
                              Input Device
                            </label>
                            <select
                              id="tpl-input"
                              value={inputType}
                              onChange={(e) => setInputType(e.target.value as any)}
                              className="w-full px-4 py-3 gs-input text-sm"
                            >
                              <option value="keyboard_mouse">Keyboard & Mouse (M&K)</option>
                              <option value="controller">Controller / Gamepad</option>
                            </select>
                        </div>
                      </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="gs-btn-secondary px-5 py-2.5 text-xs"
                          >
                            Cancel
                          </button>
                            <button type="submit" className="gs-btn-primary px-6 py-2.5 text-xs sm:text-sm">
                              Save Preset
                            </button>
                        </div>
                    </form>
      )}

                    {/* TEMPLATES GRID */}
                    {templates.length === 0 ? (
                        <div className="gs-card p-12 text-center max-w-md mx-auto">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                            <Layers size={26} />
                          </div>
                          <h3 className="text-base font-bold text-[#F7F6F9]">No baseline templates saved</h3>
                          <p className="text-xs text-[#A6A2B5] mt-1">
                            Create a base preset to quickly spin up new competitive loadouts.
                          </p>
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {templates.map((tpl) => {
                            const theme = getGameTheme(tpl.gameId);
                            const paramCount = Object.keys(tpl.settings || {}).length;
                            return (
                              <div
                                key={tpl.id}
                                className="gs-card-interactive overflow-hidden flex flex-col justify-between group"
                              >
                                <div>
                                    <GameArtwork gameId={tpl.gameId} className="h-28 p-4" overlayIntensity="medium">
                                      <div className="flex items-start justify-between h-full flex-col">
                                        <div className="flex items-center justify-between w-full">
                                          <GamePill gameId={tpl.gameId} />
                                          <button
                                            type="button"
                                            onClick={(e) => handleDelete(tpl.id, e)}
                                            className="w-8 h-8 rounded-full bg-black/40 border border-white/10 text-[#A6A2B5] hover:text-rose-400 hover:border-rose-500/30 flex items-center justify-center transition-colors"
                                            title="Delete baseline preset"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                        <InputBadge inputType={tpl.inputType} />
                                      </div>
                                    </GameArtwork>

                                    <div className="p-5">
                                      <h3 className="text-lg font-bold text-[#F7F6F9] tracking-tight">
                                        {tpl.name}
                                      </h3>
                                      <p className="text-xs text-[#A6A2B5] mt-1">
                                        {theme.engine} • {paramCount} pre-configured values
                                      </p>
                                    </div>
                                  </div>

                                      <div className="px-5 py-3.5 border-t border-white/[0.05] flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                          <CheckCircle2 size={13} /> Ready
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickDeploy(tpl)}
                                          className="px-4 py-1.5 rounded-full bg-[#25232E] hover:bg-[#FF5E36] text-xs font-semibold text-[#F7F6F9] hover:text-white border border-white/[0.07] transition-all inline-flex items-center gap-1.5"
                                        >
                                          <Rocket size={12} /> Deploy Loadout
                                        </button>
                                      </div>
                                  </div>
                                  );
          })}
                                </div>
      )}
                              </div>
                            );
                          };
