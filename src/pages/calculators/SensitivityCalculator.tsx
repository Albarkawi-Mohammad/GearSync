import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowLeftRight,
  Copy,
  Check,
  Ruler,
  Mouse,
  Info,
} from 'lucide-react';
import { SUPPORTED_GAMES, SENSITIVITY_FACTORS } from '../../lib/gameData';
import { GameArtwork, GamePill, getGameTheme, useToast, AnimatedNumber } from '../../components/ui';
import { useRefresh } from '../../context/RefreshContext';

export const SensitivityCalculator: React.FC = () => {
  const [calcMode, setCalcMode] = useState<'sens_to_sens' | 'distance_to_sens'>('sens_to_sens');
  const [sourceGame, setSourceGame] = useState('apex');
  const [targetGame, setTargetGame] = useState('valorant');
  const [sourceSens, setSourceSens] = useState(1.5);
  const [targetSens, setTargetSens] = useState(0.4714);
  const [dpi, setDpi] = useState(800);
  const [copiedValue, setCopiedValue] = useState(false);

  // Reverse mode state
  const [targetDistance, setTargetDistance] = useState(34.6);
  const [targetDistGame, setTargetDistGame] = useState('apex');
  const [distResultSens, setDistResultSens] = useState(1.5014);

  const { showToast } = useToast();

  // Convert calculations (Sens-to-Sens) — preserved exact formula
  const calculateConversion = () => {
    const factorSrc = SENSITIVITY_FACTORS[sourceGame] || 1.0;
    const factorTarget = SENSITIVITY_FACTORS[targetGame] || 1.0;

    const normalizedSens = sourceSens / factorSrc;
    const converted = normalizedSens * factorTarget;

    setTargetSens(parseFloat(converted.toFixed(4)));
  };

  // Convert calculations (Distance-to-Sens) — preserved exact formula
  const calculateReverseConversion = () => {
    const factor = SENSITIVITY_FACTORS[targetDistGame] || 1.0;
    if (targetDistance <= 0 || dpi <= 0) {
      setDistResultSens(0);
      return;
    }
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
  const in360Src = parseFloat((cm360Src / 2.54).toFixed(2));

  const handleSwapGames = () => {
    const prevSource = sourceGame;
    const prevTarget = targetGame;
    const prevTargetSens = targetSens;
    setSourceGame(prevTarget);
    setTargetGame(prevSource);
    setSourceSens(prevTargetSens);
  };

  const handleCopy = (val: number, gameId: string) => {
    navigator.clipboard.writeText(String(val));
    setCopiedValue(true);
    const theme = getGameTheme(gameId);
    showToast('Sensitivity Copied', `Copied ${val} (${theme.shortName}) to clipboard.`);
    setTimeout(() => setCopiedValue(false), 1800);
  };

  const dpiPresets = [400, 800, 1200, 1600, 3200];

  // Universal cross-engine matrix based on current active normalized sensitivity
  const universalMatrix = SUPPORTED_GAMES.map((g) => {
    const baseFactor =
      calcMode === 'sens_to_sens'
        ? SENSITIVITY_FACTORS[sourceGame] || 1.0
        : SENSITIVITY_FACTORS[targetDistGame] || 1.0;
    const activeSens = calcMode === 'sens_to_sens' ? sourceSens : distResultSens;
    const normalized = activeSens / baseFactor;
    const factorG = SENSITIVITY_FACTORS[g.id] || 1.0;
    const conv = parseFloat((normalized * factorG).toFixed(4));
    return {
      game: g,
      theme: getGameTheme(g.id),
      sens: conv,
      edpi: Math.round(conv * dpi),
      cm360: getCm360(g.id, conv),
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER & MODE SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E36]/15 border border-[#FF5E36]/25 text-[#FF5E36] text-xs font-semibold mb-2.5">
            <Calculator size={13} />
            <span>Precision Engine Yaw/Pitch Translator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
            Sensitivity Calculator
          </h1>
          <p className="text-sm text-[#A6A2B5] mt-1">
            Translate mouse sensitivity, DPI, eDPI, and exact physical cm/360° turn distance across engines.
          </p>
        </div>

        {/* Pill Mode Selector */}
        <div className="inline-flex p-1.5 rounded-full bg-[#1D1B24] border border-white/[0.07] self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setCalcMode('sens_to_sens')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              calcMode === 'sens_to_sens'
                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30'
                : 'text-[#A6A2B5] hover:text-white'
            }`}
          >
            Game-to-Game Converter
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('distance_to_sens')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              calcMode === 'distance_to_sens'
                ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30'
                : 'text-[#A6A2B5] hover:text-white'
            }`}
          >
            cm/360° Reverse Calculator
          </button>
        </div>
      </div>

      {/* SHARED DPI HARDWARE BAR */}
      <div className="gs-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Mouse size={19} />
          </div>
          <div>
            <label htmlFor="mouse-dpi" className="text-sm font-bold text-[#F7F6F9] block">
              Mouse Sensor DPI
            </label>
            <span className="text-xs text-[#6E6A7E]">
              Hardware dots-per-inch used to compute eDPI and physical cm/360° rotation
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dpiPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDpi(preset)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold tabular-nums transition-all border ${
                dpi === preset
                  ? 'bg-[#F7F6F9] text-[#0C0B0E] border-white shadow-sm'
                  : 'bg-[#121117] text-[#A6A2B5] hover:text-white border-white/[0.06]'
              }`}
            >
              {preset} DPI
            </button>
          ))}
          <select
            id="mouse-dpi"
            aria-label="Select Mouse DPI"
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value) || 800)}
            className="px-3.5 py-2 rounded-full bg-[#121117] border border-white/10 text-xs font-semibold text-[#F7F6F9] tabular-nums focus:border-[#FF5E36] focus:outline-none"
          >
            {dpiPresets.map((p) => (
              <option key={p} value={p}>
                {p} DPI
              </option>
            ))}
          </select>
        </div>
      </div>

      {calcMode === 'sens_to_sens' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* SOURCE GAME INPUT CARD (5 Cols) */}
          <div className="lg:col-span-5 gs-card overflow-hidden flex flex-col justify-between">
            <div>
              <GameArtwork gameId={sourceGame} className="h-28 p-5" overlayIntensity="heavy">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/50 text-[#A6A2B5] border border-white/10">
                    Source Engine
                  </span>
                  <GamePill gameId={sourceGame} />
                </div>
              </GameArtwork>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="source-game"
                    className="block text-xs font-semibold text-[#A6A2B5]"
                  >
                    Convert From Game
                  </label>
                  <select
                    id="source-game"
                    value={sourceGame}
                    onChange={(e) => setSourceGame(e.target.value)}
                    className="w-full px-4 py-3 gs-input text-sm font-semibold"
                  >
                    {SUPPORTED_GAMES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="source-sens"
                      className="block text-xs font-semibold text-[#A6A2B5]"
                    >
                      Source Sensitivity
                    </label>
                    <span className="text-xs text-[#6E6A7E] tabular-nums">
                      eDPI: <strong className="text-[#F7F6F9]"><AnimatedNumber value={sourceEdpi} decimals={0} /></strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      id="source-sens"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      value={sourceSens}
                      onChange={(e) => setSourceSens(parseFloat(e.target.value) || 0)}
                      className="w-28 px-4 py-3 gs-input text-lg font-extrabold text-center tabular-nums text-[#F7F6F9]"
                    />
                    <input
                      type="range"
                      aria-label="Source Sensitivity Slider"
                      min="0.05"
                      max="10.0"
                      step="0.05"
                      value={Math.min(10, sourceSens)}
                      onChange={(e) => setSourceSens(parseFloat(e.target.value))}
                      className="flex-grow"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#16151C] border-t border-white/[0.05] grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[11px] text-[#6E6A7E]">Source eDPI</span>
                <span className="text-base font-bold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={sourceEdpi} decimals={0} />
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#6E6A7E]">360° Distance</span>
                <span className="text-base font-bold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={cm360Src} decimals={2} suffix=" cm" />{' '}
                  <span className="text-xs text-[#6E6A7E]">(<AnimatedNumber value={in360Src} decimals={2} suffix='"' />)</span>
                </span>
              </div>
            </div>
          </div>

          {/* CENTER SWAP & CONVERSION BRIDGE (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={handleSwapGames}
              className="w-14 h-14 rounded-full bg-[#25232E] hover:bg-[#FF5E36] text-[#F7F6F9] hover:text-white border border-white/10 shadow-xl flex items-center justify-center transition-all group"
              title="Swap Source and Target Games"
              aria-label="Swap Source and Target Games"
            >
              <ArrowLeftRight
                size={20}
                className="transition-transform duration-200 group-hover:rotate-180"
              />
            </button>
            <div className="text-center">
              <span className="block text-[11px] font-semibold text-[#A6A2B5]">1:1 Physical</span>
              <span className="block text-xs font-bold text-[#FF5E36] tabular-nums">
                <AnimatedNumber value={cm360Src} decimals={2} suffix=" cm / 360°" />
              </span>
            </div>
          </div>

          {/* TARGET GAME OUTPUT CARD (5 Cols) */}
          <div className="lg:col-span-5 gs-card overflow-hidden border-[#FF5E36]/30 flex flex-col justify-between">
            <div>
              <GameArtwork gameId={targetGame} className="h-28 p-5" overlayIntensity="heavy">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30">
                    Converted Output
                  </span>
                  <GamePill gameId={targetGame} />
                </div>
              </GameArtwork>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="target-game"
                    className="block text-xs font-semibold text-[#A6A2B5]"
                  >
                    Convert To Game
                  </label>
                  <select
                    id="target-game"
                    value={targetGame}
                    onChange={(e) => setTargetGame(e.target.value)}
                    className="w-full px-4 py-3 gs-input text-sm font-semibold"
                  >
                    {SUPPORTED_GAMES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Big Converted Result Display */}
                <div className="p-5 rounded-2xl bg-[#121117] border border-[#FF5E36]/30 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs font-medium text-[#A6A2B5]">
                      Recommended In-Game Sensitivity
                    </span>
                    <span className="block text-4xl sm:text-5xl font-extrabold text-[#FF5E36] tabular-nums tracking-tight mt-1">
                      <AnimatedNumber value={targetSens} decimals={4} />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(targetSens, targetGame)}
                    className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5 shrink-0"
                  >
                    {copiedValue ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedValue ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#16151C] border-t border-white/[0.05] grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[11px] text-[#6E6A7E]">Target eDPI</span>
                <span className="text-base font-bold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={targetEdpi} decimals={0} />
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#6E6A7E]">Matched 360° Turn</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  <AnimatedNumber value={cm360Target} decimals={2} suffix=" cm" />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REVERSE MODE: DISTANCE TO SENSITIVITY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 gs-card p-6 sm:p-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#F7F6F9]">
                Physical Turn Distance Parameters
              </h2>
              <p className="text-xs text-[#A6A2B5] mt-0.5">
                Enter your desired physical mouse movement for a full 360° in-game turn.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="target-dist-game"
                  className="block text-xs font-semibold text-[#A6A2B5]"
                >
                  Target Game Engine
                </label>
                <select
                  id="target-dist-game"
                  value={targetDistGame}
                  onChange={(e) => setTargetDistGame(e.target.value)}
                  className="w-full px-4 py-3 gs-input text-sm font-semibold"
                >
                  {SUPPORTED_GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="target-distance"
                    className="block text-xs font-semibold text-[#A6A2B5]"
                  >
                    Target 360° Rotation Distance (cm)
                  </label>
                  <span className="text-xs text-[#6E6A7E] tabular-nums">
                    {(targetDistance / 2.54).toFixed(1)} inches
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    id="target-distance"
                    type="number"
                    step="0.5"
                    min="5"
                    max="200"
                    value={targetDistance}
                    onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)}
                    className="w-28 px-4 py-3 gs-input text-lg font-extrabold text-center tabular-nums text-[#F7F6F9]"
                  />
                  <input
                    type="range"
                    aria-label="Target 360 distance slider"
                    min="10.0"
                    max="100.0"
                    step="0.5"
                    value={Math.min(100, targetDistance)}
                    onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
                    className="flex-grow"
                  />
                </div>
              </div>

              {/* Visual Mousepad Ruler Indicator */}
              <div className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A6A2B5] flex items-center gap-1.5">
                    <Ruler size={13} className="text-[#FF5E36]" /> Standard 45cm Esports Mousepad Span
                  </span>
                  <span className="font-semibold text-[#F7F6F9] tabular-nums">
                    {Math.min(100, Math.round((targetDistance / 45) * 100))}% of pad width
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#121117] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#FF5E36] to-amber-400 transition-all duration-200"
                    style={{ width: `${Math.min(100, (targetDistance / 45) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 gs-card p-6 sm:p-7 border-[#FF5E36]/30 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A6A2B5]">
                  Required Sensitivity Value
                </span>
                <GamePill gameId={targetDistGame} />
              </div>

              <div className="p-6 rounded-2xl bg-[#121117] border border-[#FF5E36]/30 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-[#6E6A7E]">Set In-Game Sensitivity To</span>
                  <span className="block text-4xl sm:text-5xl font-extrabold text-[#FF5E36] tabular-nums mt-1">
                    <AnimatedNumber value={distResultSens} decimals={4} />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(distResultSens, targetDistGame)}
                  className="gs-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-1.5"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#16151C] border border-white/[0.05]">
                  <span className="block text-[11px] text-[#6E6A7E]">Calculated eDPI</span>
                  <span className="block text-base font-bold text-[#F7F6F9] tabular-nums mt-0.5">
                    <AnimatedNumber value={Math.round(distResultSens * dpi)} decimals={0} />
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#16151C] border border-white/[0.05]">
                  <span className="block text-[11px] text-[#6E6A7E]">Physical Distance</span>
                  <span className="block text-base font-bold text-emerald-400 tabular-nums mt-0.5">
                    <AnimatedNumber value={targetDistance} decimals={1} suffix=" cm / 360°" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-start gap-2 text-xs text-[#6E6A7E]">
              <Info size={14} className="text-[#FF5E36] shrink-0 mt-0.5" />
              <span>
                Ensure Raw Mouse Input is enabled and Mouse Acceleration is disabled in-game for exact physical distance parity.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-ENGINE EQUIVALENCY MATRIX */}
      <div className="gs-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#F7F6F9]">
              All-Engine Sensitivity Reference Matrix
            </h2>
            <p className="text-xs text-[#A6A2B5]">
              Instant equivalent sensitivity values across every supported title at {dpi} DPI
            </p>
          </div>
          <span className="text-xs font-semibold text-[#FF5E36] tabular-nums">
            Locked at {calcMode === 'sens_to_sens' ? cm360Src : targetDistance} cm / 360°
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {universalMatrix.map(({ game, theme, sens, edpi }) => (
            <div
              key={game.id}
              className="p-4 rounded-2xl bg-[#16151C] border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-[#F7F6F9]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accentHex }}
                  />
                  {theme.shortName}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(sens, game.id)}
                  className="text-[#6E6A7E] hover:text-white p-1"
                  title={`Copy ${theme.shortName} sensitivity`}
                >
                  <Copy size={12} />
                </button>
              </div>

              <div>
                <span className="block text-2xl font-extrabold text-[#F7F6F9] tabular-nums">
                  <AnimatedNumber value={sens} decimals={4} />
                </span>
                <span className="block text-[11px] text-[#6E6A7E] tabular-nums mt-0.5">
                  eDPI: <AnimatedNumber value={edpi} decimals={0} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
