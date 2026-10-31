import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Filter,
} from 'lucide-react';
import { getProfiles, type GameProfile } from '../../lib/storage';
import { SUPPORTED_GAMES } from '../../lib/gameData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  PlatformBadge,
  InputBadge,
  getGameTheme,
  AnimatedNumber,
} from '../../components/ui';

export const CompareProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('bo6');

  const [profileAId, setProfileAId] = useState('');
  const [profileBId, setProfileBId] = useState('');
  const [showDiffsOnly, setShowDiffsOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const gameProfiles = profiles.filter((p) => p.gameId === selectedGameId);

  useEffect(() => {
    setActiveCategory('all');
    if (gameProfiles.length >= 2) {
      setProfileAId(gameProfiles[0].id);
      setProfileBId(gameProfiles[1].id);
    } else if (gameProfiles.length === 1) {
      setProfileAId(gameProfiles[0].id);
      setProfileBId('');
    } else {
      setProfileAId('');
      setProfileBId('');
    }
  }, [selectedGameId, profiles]);

  const profileA = profiles.find((p) => p.id === profileAId);
  const profileB = profiles.find((p) => p.id === profileBId);
  const game = SUPPORTED_GAMES.find((g) => g.id === selectedGameId);

  const fields = (game?.fields || []).filter((field) => {
    if (!field.platformLimit) return true;
    let allowed = false;
    if (profileA && field.platformLimit.includes(profileA.platform)) allowed = true;
    if (profileB && field.platformLimit.includes(profileB.platform)) allowed = true;
    if (!profileA && !profileB) return true;
    return allowed;
  });

  const totalDifferences =
    profileA && profileB
      ? fields.filter((f) => profileA.settings[f.id] !== profileB.settings[f.id]).length
      : 0;

  const filteredFields = fields.filter((field) => {
    const matchesCategory = activeCategory === 'all' || field.category === activeCategory;
    if (!matchesCategory) return false;
    if (showDiffsOnly && profileA && profileB) {
      return profileA.settings[field.id] !== profileB.settings[field.id];
    }
    return true;
  });

  // Group filtered fields by category for structured readability
  const groupedCategories = (game?.categories || []).filter((cat) =>
    filteredFields.some((f) => f.category === cat)
  );

  // Numeric deltas for Recharts visualization
  const numericDeltas =
    profileA && profileB
      ? fields
          .filter((field) => {
            const valA = Number(profileA.settings[field.id]);
            const valB = Number(profileB.settings[field.id]);
            return !isNaN(valA) && !isNaN(valB) && valA !== valB && valA !== 0;
          })
          .map((field) => {
            const valA = Number(profileA.settings[field.id]);
            const valB = Number(profileB.settings[field.id]);
            const percentDiff = ((valB - valA) / valA) * 100;
            return {
              name: field.name,
              percentage: parseFloat(percentDiff.toFixed(1)),
              valueA: valA,
              valueB: valB,
            };
          })
      : [];

  const handleSwapProfiles = () => {
    const temp = profileAId;
    setProfileAId(profileBId);
    setProfileBId(temp);
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300 text-xs font-semibold mb-2.5">
            <GitCompare size={13} />
            <span>Side-by-Side Configuration Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
            Compare Profiles
          </h1>
          <p className="text-sm text-[#A6A2B5] mt-1">
            Inspect parameter discrepancies, percentage shifts, and setting differences across loadouts.
          </p>
        </div>

        {/* Game Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {SUPPORTED_GAMES.map((g) => {
            const gTheme = getGameTheme(g.id);
            const active = selectedGameId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGameId(g.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                    : 'bg-[#1D1B24] text-[#A6A2B5] hover:text-white border border-white/[0.06]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: active ? '#FFF' : gTheme.accentHex }}
                />
                {gTheme.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* PROFILE A vs PROFILE B SELECTOR CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Profile A Selector Card */}
        <div className="lg:col-span-5 gs-card p-5 space-y-3 border-sky-500/25">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/25">
              Baseline A
            </span>
            {profileA && (
              <div className="flex items-center gap-1.5">
                <PlatformBadge platform={profileA.platform} />
                <InputBadge inputType={profileA.inputType} />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="profile-a-select" className="sr-only">
              Choose Profile A
            </label>
            <select
              id="profile-a-select"
              value={profileAId}
              onChange={(e) => setProfileAId(e.target.value)}
              className="w-full px-4 py-3 gs-input text-sm font-semibold"
            >
              <option value="">-- Select Profile A --</option>
              {gameProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.userId === 'current_user' ? '' : `[${p.username}] `}
                  {p.name} ({p.platform.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Swap Button */}
        <div className="lg:col-span-1 flex justify-center">
          <button
            type="button"
            onClick={handleSwapProfiles}
            className="w-11 h-11 rounded-full bg-[#25232E] hover:bg-[#FF5E36] text-[#A6A2B5] hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-lg"
            title="Swap Profile A and Profile B"
            aria-label="Swap Profile A and Profile B"
          >
            <ArrowLeftRight size={17} />
          </button>
        </div>

        {/* Profile B Selector Card */}
        <div className="lg:col-span-5 gs-card p-5 space-y-3 border-[#FF5E36]/25">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5E36]/15 text-[#FF5E36] border border-[#FF5E36]/25">
              Comparison B
            </span>
            {profileB && (
              <div className="flex items-center gap-1.5">
                <PlatformBadge platform={profileB.platform} />
                <InputBadge inputType={profileB.inputType} />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="profile-b-select" className="sr-only">
              Choose Profile B
            </label>
            <select
              id="profile-b-select"
              value={profileBId}
              onChange={(e) => setProfileBId(e.target.value)}
              className="w-full px-4 py-3 gs-input text-sm font-semibold"
            >
              <option value="">-- Select Profile B --</option>
              {gameProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.userId === 'current_user' ? '' : `[${p.username}] `}
                  {p.name} ({p.platform.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* COMPARISON RESULTS */}
      {!profileA || !profileB ? (
        <div className="gs-card p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <h3 className="text-base font-bold text-[#F7F6F9]">Select Two Profiles to Compare</h3>
          <p className="text-xs text-[#A6A2B5] mt-1">
            Choose both a Baseline A and Comparison B profile above to inspect differences.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary & Filter Toolbar */}
          <div className="gs-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-[#16151C] border border-white/[0.06] text-xs font-semibold text-[#F7F6F9] tabular-nums">
                <AnimatedNumber value={fields.length} /> Total Settings
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-xs font-semibold text-amber-300 tabular-nums">
                <AnimatedNumber value={totalDifferences} /> {totalDifferences === 1 ? 'Difference' : 'Differences'}
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-xs font-semibold text-emerald-300 tabular-nums">
                <AnimatedNumber value={fields.length - totalDifferences} /> Identical
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-[#FF5E36]/15 border border-[#FF5E36]/25 text-xs font-bold text-[#FF5E36] tabular-nums">
                Parity:{' '}
                <AnimatedNumber
                  value={
                    fields.length > 0
                      ? Math.round(((fields.length - totalDifferences) / fields.length) * 100)
                      : 100
                  }
                  suffix="%"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDiffsOnly(!showDiffsOnly)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                  showDiffsOnly
                    ? 'bg-[#FF5E36] text-white border-[#FF5E36] shadow-md shadow-[#FF5E36]/25'
                    : 'bg-[#121117] text-[#A6A2B5] hover:text-white border-white/[0.08]'
                }`}
              >
                <Filter size={13} />
                {showDiffsOnly ? 'Showing Mismatches Only' : 'Highlight Only Mismatches'}
              </button>
            </div>
          </div>

          {/* Category Quick-Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#F7F6F9] text-[#0C0B0E]'
                  : 'bg-[#1D1B24] text-[#A6A2B5] hover:text-white border border-white/[0.06]'
              }`}
            >
              All Categories
            </button>
            {game?.categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#F7F6F9] text-[#0C0B0E]'
                      : 'bg-[#1D1B24] text-[#A6A2B5] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Numeric Delta Bar Chart */}
          {numericDeltas.length > 0 && (
            <div className="gs-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#F7F6F9]">
                    Numeric Parameter Shift (% Delta from A → B)
                  </h2>
                  <p className="text-xs text-[#6E6A7E]">
                    Relative percentage difference across numerical sensitivity, FOV, and audio sliders
                  </p>
                </div>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={numericDeltas}
                    margin={{ top: 12, right: 15, left: -15, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#6E6A7E"
                      tick={{ fill: '#A6A2B5', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6E6A7E"
                      tick={{ fill: '#A6A2B5', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      unit="%"
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{
                        backgroundColor: '#1D1B24',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        color: '#F7F6F9',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, _name: any, props: any) => {
                        const data = props.payload;
                        return [
                          `${value > 0 ? '+' : ''}${value}% (${data.valueA} → ${data.valueB})`,
                          'Shift',
                        ];
                      }}
                    />
                    <ReferenceLine y={0} stroke="#363244" strokeDasharray="3 3" />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                      {numericDeltas.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.percentage > 0 ? '#FF5E36' : '#38BDF8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Grouped Side-by-Side Comparison Matrix */}
          {groupedCategories.length === 0 ? (
            <div className="gs-card p-10 text-center">
              <Check size={28} className="text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#F7F6F9]">No differences found</h3>
              <p className="text-xs text-[#A6A2B5] mt-1">
                Both configurations have identical values in this view.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedCategories.map((category) => {
                const catFields = filteredFields.filter((f) => f.category === category);
                return (
                  <div key={category} className="gs-card overflow-hidden">
                    {/* Sticky Category & Column Header */}
                    <div className="grid grid-cols-12 bg-[#25232E] px-5 py-3.5 border-b border-white/[0.06] text-xs font-bold text-[#F7F6F9] items-center">
                      <div className="col-span-5 sm:col-span-4">{category}</div>
                      <div className="col-span-3 sm:col-span-4 text-center text-sky-300 truncate px-1">
                        {profileA.name}
                      </div>
                      <div className="col-span-4 sm:col-span-4 text-center text-[#FF5E36] truncate px-1">
                        {profileB.name}
                      </div>
                    </div>

                    <div className="divide-y divide-white/[0.05]">
                      {catFields.map((field) => {
                        const valA = profileA.settings[field.id];
                        const valB = profileB.settings[field.id];
                        const isDifferent = valA !== valB;

                        return (
                          <div
                            key={field.id}
                            className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors ${
                              isDifferent
                                ? 'bg-[#FF5E36]/[0.06] hover:bg-[#FF5E36]/[0.1]'
                                : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            {/* Setting Name */}
                            <div className="col-span-5 sm:col-span-4 pr-3">
                              <div className="flex items-center gap-2">
                                {isDifferent && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-[#FF5E36] shrink-0"
                                    title="Mismatch"
                                  />
                                )}
                                <span className="text-xs sm:text-sm font-semibold text-[#F7F6F9]">
                                  {field.name}
                                </span>
                              </div>
                            </div>

                            {/* Value A */}
                            <div className="col-span-3 sm:col-span-4 text-center">
                              <span
                                className={`inline-block text-xs tabular-nums px-3 py-1 rounded-xl border ${
                                  isDifferent
                                    ? 'bg-[#121117] text-sky-300 border-sky-500/30 font-bold'
                                    : 'bg-[#121117]/60 text-[#A6A2B5] border-white/[0.05]'
                                }`}
                              >
                                {valA !== undefined ? String(valA) : '—'}
                              </span>
                            </div>

                            {/* Value B */}
                            <div className="col-span-4 sm:col-span-4 text-center">
                              <span
                                className={`inline-block text-xs tabular-nums px-3 py-1 rounded-xl border ${
                                  isDifferent
                                    ? 'bg-[#121117] text-[#FF5E36] border-[#FF5E36]/35 font-bold'
                                    : 'bg-[#121117]/60 text-[#A6A2B5] border-white/[0.05]'
                                }`}
                              >
                                {valB !== undefined ? String(valB) : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
