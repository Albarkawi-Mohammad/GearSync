import React, { useState, useEffect } from 'react';
import { GitCompare, AlertTriangle } from 'lucide-react';
import { getProfiles, type GameProfile } from '../lib/storage';
import { SUPPORTED_GAMES } from '../lib/gameData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Cell 
} from 'recharts';

export const CompareProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('bo6');
  
  // Selection ids
  const [profileAId, setProfileAId] = useState('');
  const [profileBId, setProfileBId] = useState('');

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  // Filter profiles by game ID
  const gameProfiles = profiles.filter(p => p.gameId === selectedGameId);

  // Set default profile selections when game ID changes
  useEffect(() => {
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

  const profileA = profiles.find(p => p.id === profileAId);
  const profileB = profiles.find(p => p.id === profileBId);
  const game = SUPPORTED_GAMES.find(g => g.id === selectedGameId);

  // Filter fields based on selected profile platforms (union of platform limitations)
  const fields = (game?.fields || []).filter(field => {
    if (!field.platformLimit) return true;
    let allowed = false;
    if (profileA && field.platformLimit.includes(profileA.platform)) allowed = true;
    if (profileB && field.platformLimit.includes(profileB.platform)) allowed = true;
    // Default to true if neither is selected to show complete list
    if (!profileA && !profileB) return true;
    return allowed;
  });

  // Calculate numeric deltas for the Recharts visualization
  const numericDeltas = (profileA && profileB)
    ? fields
        .filter(field => {
          const valA = Number(profileA.settings[field.id]);
          const valB = Number(profileB.settings[field.id]);
          return !isNaN(valA) && !isNaN(valB) && valA !== valB && valA !== 0;
        })
        .map(field => {
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
          <GitCompare className="text-brand-cyan" /> COMPARE LOCKERS
        </h1>
        <p className="text-xs text-brand-cyan font-mono tracking-widest uppercase">
          Evaluate two configurations side-by-side and highlight settings delta
        </p>
      </div>

      {/* SELECTORS BANNER */}
      <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/40 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Game selection */}
        <div className="space-y-2">
          <label htmlFor="game-select" className="block text-xs font-bold font-mono text-gray-400 uppercase">
            01. TARGET GAME ARCHITECTURE
          </label>
          <select
            id="game-select"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
          >
            {SUPPORTED_GAMES.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Profile A Select */}
        <div className="space-y-2">
          <label htmlFor="profile-a-select" className="block text-xs font-bold font-mono text-gray-400 uppercase">
            02. PROFILE CHASSIS ALPHA (A)
          </label>
          <select
            id="profile-a-select"
            value={profileAId}
            onChange={(e) => setProfileAId(e.target.value)}
            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
          >
            <option value="">-- Choose Profile A --</option>
            {gameProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.username === 'current_user' ? '' : `[${p.username}] `}{p.name} ({p.platform.toUpperCase()} • {p.inputType === 'controller' ? 'Gamepad' : 'M&K'})
              </option>
            ))}
          </select>
        </div>

        {/* Profile B Select */}
        <div className="space-y-2">
          <label htmlFor="profile-b-select" className="block text-xs font-bold font-mono text-gray-400 uppercase">
            03. PROFILE CHASSIS BETA (B)
          </label>
          <select
            id="profile-b-select"
            value={profileBId}
            onChange={(e) => setProfileBId(e.target.value)}
            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-sm text-white focus:border-brand-cyan focus:outline-none"
          >
            <option value="">-- Choose Profile B --</option>
            {gameProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.username === 'current_user' ? '' : `[${p.username}] `}{p.name} ({p.platform.toUpperCase()} • {p.inputType === 'controller' ? 'Gamepad' : 'M&K'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DELTA ENGINE SECTION */}
      {!profileA || !profileB ? (
        <div className="cyber-panel p-12 text-center border-slate-800/80 bg-slate-900/10">
          <AlertTriangle className="text-brand-secondary mx-auto mb-4" size={40} />
          <h3 className="font-bold text-gray-400 font-mono text-sm">DUAL SOURCE INPUT REQUIRED</h3>
          <p className="text-xs text-gray-500 mt-1">Please select two separate profiles above to initialize settings comparison.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visual delta chart */}
          {numericDeltas.length > 0 && (
            <div className="cyber-panel p-6 border-slate-800 bg-[#161F30]/20 space-y-4">
              <h2 className="text-xs font-mono text-brand-cyan uppercase tracking-wider border-b border-slate-850 pb-2">
                Visual Parameter Delta (% shift from Alpha ➜ Beta)
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={numericDeltas} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} 
                      tickLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} 
                      tickLine={{ stroke: '#334155' }}
                      unit="%" 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#1e293b', 
                        borderRadius: '8px', 
                        color: '#e2e8f0', 
                        fontFamily: 'monospace', 
                        fontSize: '11px' 
                      }}
                      formatter={(value: any, _name: any, props: any) => {
                        const data = props.payload;
                        return [
                          `${value > 0 ? '+' : ''}${value}% (Alpha: ${data.valueA} ➜ Beta: ${data.valueB})`,
                          'Difference'
                        ];
                      }}
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                    <Bar dataKey="percentage">
                      {numericDeltas.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.percentage > 0 ? '#D600FF' : '#00F0FF'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Compare Table */}
          <div className="cyber-panel overflow-hidden border-slate-800">
            {/* Table Header Details */}
            <div className="grid grid-cols-3 bg-[#161F30] p-4 border-b border-slate-800/80 text-xs font-mono font-bold tracking-wider text-gray-400">
              <div>CONFIGURATION PARAMETER</div>
              <div className="text-center text-brand-cyan">ALPHA: {profileA.name}</div>
              <div className="text-center text-brand-secondary">BETA: {profileB.name}</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800 bg-[#161F30]/15">
              {fields.map((field) => {
                const valA = profileA.settings[field.id];
                const valB = profileB.settings[field.id];
                const isDifferent = valA !== valB;

                return (
                  <div 
                    key={field.id} 
                    className={`grid grid-cols-3 p-4 items-center transition-colors ${
                      isDifferent 
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-y border-amber-500/20' 
                        : 'hover:bg-slate-800/20'
                    }`}
                  >
                    {/* Field Name */}
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-gray-300 uppercase tracking-wide">
                        {field.name}
                      </span>
                      <span className="inline-block text-[9px] font-mono text-gray-500 uppercase">
                        {field.category}
                      </span>
                    </div>

                    {/* Value A */}
                    <div className="text-center">
                      <span className={`inline-block font-mono text-xs px-2.5 py-1 rounded border ${
                        isDifferent 
                          ? 'bg-[#0B0F19] text-amber-400 border-amber-500/30' 
                          : 'bg-[#0B0F19]/40 text-gray-400 border-slate-800'
                      }`}>
                        {valA !== undefined ? String(valA) : '—'}
                      </span>
                    </div>

                    {/* Value B */}
                    <div className="text-center">
                      <span className={`inline-block font-mono text-xs px-2.5 py-1 rounded border ${
                        isDifferent 
                          ? 'bg-[#0B0F19] text-amber-400 border-amber-500/30 font-bold' 
                          : 'bg-[#0B0F19]/40 text-gray-400 border-slate-800'
                      }`}>
                        {valB !== undefined ? String(valB) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
