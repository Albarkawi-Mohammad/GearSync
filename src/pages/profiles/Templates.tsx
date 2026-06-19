import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle } from 'lucide-react';
import { getTemplates, saveTemplate, deleteTemplate, type SettingsTemplate } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<SettingsTemplate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Template state
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
    if (confirm('Are you sure you want to delete this baseline template?')) {
      deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a template name.');
      return;
    }

    // Set standard defaults for the chosen game/input
    const game = SUPPORTED_GAMES.find(g => g.id === gameId);
    const defaultSettings: Record<string, string | number | boolean> = {};
    if (game) {
      game.fields.forEach(field => {
        defaultSettings[field.id] = field.default;
      });
    }

    const tpl: SettingsTemplate = {
      id: 'tpl_' + Math.random().toString(36).substring(2, 9),
      name,
      gameId,
      inputType,
      settings: defaultSettings
    };

    saveTemplate(tpl);
    setName('');
    setShowAddForm(false);
    loadTemplates();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white">
            SETTINGS BASELINES
          </h1>
          <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
            Build custom reusable config presets to speed up profile deployment
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="cyber-button px-5 py-3 bg-gradient-to-r from-brand-primary to-brand-cyan hover:brightness-110 text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          <Plus size={16} /> Create Base Preset
        </button>
      </div>

      {/* ADD TEMPLATE FORM BOX */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="cyber-panel p-6 border-brand-cyan/20 bg-[#161F30]/40 space-y-6">
          <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
            Configure Baseline Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template name */}
            <div className="space-y-2">
              <label htmlFor="tpl-name" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                TEMPLATE DESIGNATION (NAME)
              </label>
              <input
                id="tpl-name"
                type="text"
                placeholder="e.g. Competitive M&K Base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              />
            </div>

            {/* Target game */}
            <div className="space-y-2">
              <label htmlFor="tpl-game" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                TARGET GAME
              </label>
              <select
                id="tpl-game"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              >
                {SUPPORTED_GAMES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Input Device selection */}
            <div className="space-y-2">
              <label htmlFor="tpl-input" className="block text-xs font-bold font-mono text-gray-300 uppercase">
                INPUT CHANNEL
              </label>
              <select
                id="tpl-input"
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none"
              >
                <option value="keyboard_mouse">Keyboard & Mouse (M&K)</option>
                <option value="controller">Gamepad (Controller)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-gray-300 font-mono text-xs uppercase rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-cyan text-white text-xs font-bold font-mono uppercase rounded-lg hover:brightness-110 flex items-center gap-1"
            >
              Confirm Preset
            </button>
          </div>
        </form>
      )}

      {/* TEMPLATES GRID */}
      {templates.length === 0 ? (
        <div className="cyber-panel p-12 text-center border-slate-800/80 bg-slate-900/10">
          <Layers className="text-gray-650 mx-auto mb-4" size={40} />
          <h3 className="font-bold text-gray-400 font-mono text-sm">NO TEMPLATE baselines SAVED</h3>
          <p className="text-xs text-gray-500 mt-1">Create one to enable fast loadout replication.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const game = SUPPORTED_GAMES.find(g => g.id === tpl.gameId);
            return (
              <div
                key={tpl.id}
                className="cyber-panel p-5 bg-[#161F30]/35 border-slate-850 hover:border-brand-cyan/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-2 py-0.5 bg-[#0B0F19] text-brand-cyan text-[9px] font-mono border border-brand-cyan/20 rounded uppercase">
                      {game?.name || tpl.gameId}
                    </span>
                    <button
                      onClick={(e) => handleDelete(tpl.id, e)}
                      className="p-1.5 bg-[#0B0F19] border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                      title="Delete template baseline"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-gray-200 tracking-wide mb-3">
                    {tpl.name}
                  </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-850 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase">
                    {tpl.inputType === 'controller' ? 'Gamepad' : 'M&K'}
                  </span>
                  <span className="flex items-center gap-1 text-brand-accent">
                    <CheckCircle size={10} /> Ready for deploy
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
