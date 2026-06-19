import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, Eye } from 'lucide-react';
import { SUPPORTED_GAMES, SENSITIVITY_FACTORS } from '../../lib/gameData';

export const SensitivityCalculator: React.FC = () => {
  const [calcMode, setCalcMode] = useState<'sens_to_sens' | 'distance_to_sens'>('sens_to_sens');
  const [sourceGame, setSourceGame] = useState('apex');
  const [targetGame, setTargetGame] = useState('valorant');
  const [sourceSens, setSourceSens] = useState(1.5);
  const [targetSens, setTargetSens] = useState(0.47);
  const [dpi, setDpi] = useState(800);

  // Reverse mode state
  const [targetDistance, setTargetDistance] = useState(34.6);
  const [targetDistGame, setTargetDistGame] = useState('apex');
  const [distResultSens, setDistResultSens] = useState(1.5);
  
  // Convert calculations (Sens-to-Sens)
  const calculateConversion = () => {
    const factorSrc = SENSITIVITY_FACTORS[sourceGame] || 1.0;
    const factorTarget = SENSITIVITY_FACTORS[targetGame] || 1.0;
    
    const normalizedSens = sourceSens / factorSrc;
    const converted = normalizedSens * factorTarget;
    
    setTargetSens(parseFloat(converted.toFixed(4)));
  };

  // Convert calculations (Distance-to-Sens)
  const calculateReverseConversion = () => {
    const factor = SENSITIVITY_FACTORS[targetDistGame] || 1.0;
    if (targetDistance <= 0 || dpi <= 0) {
      setDistResultSens(0);
      return;
    }
    // Sens = (41560 * factor) / (DPI * targetDistance)
    const computedSens = (41560 * factor) / (dpi * targetDistance);
    setDistResultSens(parseFloat(computedSens.toFixed(4)));
  };

  useEffect(() => {
    calculateConversion();
  }, [sourceGame, targetGame, sourceSens]);

  useEffect(() => {
    calculateReverseConversion();
  }, [targetDistGame, targetDistance, dpi]);

  const sourceEdpi = Math.round(sourceSens * dpi);
  const targetEdpi = Math.round(targetSens * dpi);

  const getCm360 = (gameId: string, sens: number) => {
    const factor = SENSITIVITY_FACTORS[gameId] || 1.0;
    const normalized = sens / factor;
    if (normalized === 0 || dpi === 0) return 0;
    return parseFloat((41560 / (dpi * normalized)).toFixed(2));
  };

  const cm360Src = getCm360(sourceGame, sourceSens);
  const cm360Target = getCm360(targetGame, targetSens);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
          <Calculator className="text-brand-cyan" /> SENSITIVITY TRANSLATOR
        </h1>
        <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
          Convert DPI and mouse sensitivity across multi-game engines
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setCalcMode('sens_to_sens')}
          className={`px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            calcMode === 'sens_to_sens'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Sens-to-Sens Translator
        </button>
        <button
          onClick={() => setCalcMode('distance_to_sens')}
          className={`px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            calcMode === 'distance_to_sens'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Distance-to-Sens (Reverse Mode)
        </button>
      </div>

      {calcMode === 'sens_to_sens' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INPUT FORM PANEL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 space-y-6">
              <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
                Parameters & Input Spec
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source game */}
                <div className="space-y-2">
                  <label htmlFor="source-game" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    SOURCE GAME
                  </label>
                  <select
                    id="source-game"
                    value={sourceGame}
                    onChange={(e) => setSourceGame(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
                  >
                    {SUPPORTED_GAMES.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Target game */}
                <div className="space-y-2">
                  <label htmlFor="target-game" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    TARGET GAME
                  </label>
                  <select
                    id="target-game"
                    value={targetGame}
                    onChange={(e) => setTargetGame(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
                  >
                    {SUPPORTED_GAMES.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Source sensitivity value */}
                <div className="space-y-2">
                  <label htmlFor="source-sens" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    SOURCE SENSITIVITY VALUE
                  </label>
                  <div className="flex gap-4">
                    <input
                      id="source-sens"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      value={sourceSens}
                      onChange={(e) => setSourceSens(parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-center font-mono text-white focus:border-brand-cyan focus:outline-none"
                    />
                    <input
                      type="range"
                      min="0.1"
                      max="15.0"
                      step="0.05"
                      value={sourceSens}
                      onChange={(e) => setSourceSens(parseFloat(e.target.value))}
                      className="flex-grow h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan self-center"
                    />
                  </div>
                </div>

                {/* DPI value */}
                <div className="space-y-2">
                  <label htmlFor="mouse-dpi" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    MOUSE DPI ARCHITECTURE
                  </label>
                  <select
                    id="mouse-dpi"
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value) || 800)}
                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="400">400 DPI</option>
                    <option value="800">800 DPI</option>
                    <option value="1200">1200 DPI</option>
                    <option value="1600">1600 DPI</option>
                    <option value="3200">3200 DPI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* OUTPUT CALCULATION ANALYTICS PANEL */}
          <div className="space-y-6">
            <div className="cyber-panel p-6 border-brand-cyan/20 bg-black/45 flex flex-col justify-between h-full shadow-lg shadow-brand-cyan/5">
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                  TRANSLATION ENGINE STATUS
                </span>

                {/* OUTPUT BOX */}
                <div className="text-center py-6 bg-[#161F30]/40 border border-slate-850 rounded-xl mb-6 relative group">
                  <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                    RECOMMENDED TARGET SENSITIVITY
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-primary glow-text-cyan">
                    {targetSens}
                  </span>
                </div>

                {/* METRIC SPECS */}
                <div className="space-y-4 font-mono text-xs">
                  {/* Source stats */}
                  <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg space-y-1">
                    <span className="block text-[10px] text-gray-500 uppercase">SOURCE: {SUPPORTED_GAMES.find(g => g.id === sourceGame)?.name}</span>
                    <div className="flex justify-between text-gray-300">
                      <span>eDPI: <b className="text-white">{sourceEdpi}</b></span>
                      <span>360° Rot: <b className="text-white">{cm360Src} cm</b></span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex justify-center text-brand-cyan">
                    <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
                  </div>

                  {/* Target stats */}
                  <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg space-y-1">
                    <span className="block text-[10px] text-gray-500 uppercase">TARGET: {SUPPORTED_GAMES.find(g => g.id === targetGame)?.name}</span>
                    <div className="flex justify-between text-gray-300">
                      <span>eDPI: <b className="text-white">{targetEdpi}</b></span>
                      <span>360° Rot: <b className="text-white">{cm360Target} cm</b></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-gray-500 font-mono leading-relaxed flex items-start gap-1.5">
                <Eye size={12} className="text-brand-cyan shrink-0 mt-0.5" />
                <span>
                  GearSync sensitivity ratios are calibrated based on mouse pitch/yaw angles and field of view adjustments. Actual physical rotation remains 100% equivalent.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* REVERSE INPUT FORM PANEL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 space-y-6">
              <h2 className="text-sm font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
                Distance Parameters & Input Spec
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Game */}
                <div className="space-y-2">
                  <label htmlFor="target-dist-game" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    TARGET GAME ENGINE
                  </label>
                  <select
                    id="target-dist-game"
                    value={targetDistGame}
                    onChange={(e) => setTargetDistGame(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
                  >
                    {SUPPORTED_GAMES.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* DPI value */}
                <div className="space-y-2">
                  <label htmlFor="mouse-dpi-reverse" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    MOUSE DPI ARCHITECTURE
                  </label>
                  <select
                    id="mouse-dpi-reverse"
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value) || 800)}
                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
                  >
                    <option value="400">400 DPI</option>
                    <option value="800">800 DPI</option>
                    <option value="1200">1200 DPI</option>
                    <option value="1600">1600 DPI</option>
                    <option value="3200">3200 DPI</option>
                  </select>
                </div>

                {/* Target Distance input */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="target-distance" className="block text-xs font-bold font-mono text-gray-400 uppercase">
                    TARGET 360° ROTATION DISTANCE (CM)
                  </label>
                  <div className="flex gap-4">
                    <input
                      id="target-distance"
                      type="number"
                      step="0.1"
                      min="5"
                      max="200"
                      value={targetDistance}
                      onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-center font-mono text-white focus:border-brand-cyan focus:outline-none"
                    />
                    <input
                      type="range"
                      min="10.0"
                      max="100.0"
                      step="0.5"
                      value={targetDistance}
                      onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
                      className="flex-grow h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan self-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REVERSE OUTPUT PANEL */}
          <div className="space-y-6">
            <div className="cyber-panel p-6 border-brand-cyan/20 bg-black/45 flex flex-col justify-between h-full shadow-lg shadow-brand-cyan/5">
              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                  REVERSE TRANSLATION ENGINE STATUS
                </span>

                <div className="text-center py-6 bg-[#161F30]/40 border border-slate-850 rounded-xl mb-6 relative group">
                  <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                    REQUIRED SENSITIVITY VALUE
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-primary glow-text-cyan">
                    {distResultSens}
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg space-y-1">
                    <span className="block text-[10px] text-gray-500 uppercase">SPECIFICATION MATRIX</span>
                    <div className="flex justify-between text-gray-300">
                      <span>DPI: <b className="text-white">{dpi}</b></span>
                      <span>Target Rot: <b className="text-white">{targetDistance} cm</b></span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg space-y-1">
                    <span className="block text-[10px] text-gray-500 uppercase">CALCULATED eDPI</span>
                    <div className="flex justify-between text-gray-300">
                      <span>eDPI: <b className="text-white">{Math.round(distResultSens * dpi)}</b></span>
                      <span>Game: <b className="text-white">{SUPPORTED_GAMES.find(g => g.id === targetDistGame)?.name}</b></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-gray-500 font-mono leading-relaxed flex items-start gap-1.5">
                <Eye size={12} className="text-brand-cyan shrink-0 mt-0.5" />
                <span>
                  Reverse formulas derive the raw settings ratio through target physical distance values (cm/360°). Ensure in-game raw input is active.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
