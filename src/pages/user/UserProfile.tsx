import React, { useState, useEffect } from 'react';
import { User as UserIcon, Save, LogOut, Sliders, Copy, Users, ShieldCheck } from 'lucide-react';
import { getCurrentUser, updateCurrentUser, getProfiles, type User } from '../../lib/storage';
import { useToast } from '../../components/ui';

export const UserProfile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilesCount, setProfilesCount] = useState(0);
  const [copiesCount, setCopiesCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setUsername(user.username);
    setBio(user.bio);

    const userProfiles = getProfiles().filter((p) => p.userId === 'current_user');
    setProfilesCount(userProfiles.length);
    setCopiesCount(userProfiles.reduce((sum, p) => sum + p.copiesCount, 0));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Callsign Required', 'Please enter a valid display name.', 'warning');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      username: username.trim(),
      bio: bio.trim(),
    };

    updateCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    showToast('Profile Updated', 'Your Operator callsign and bio have been saved.');
  };

  const handleSignOut = () => {
    showToast(
      'Local Session Active',
      'Your configurations remain safely encrypted in local storage.',
      'info'
    );
  };

  return (
      <div className="space-y-7 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25232E] border border-white/[0.06] text-xs font-medium text-[#A6A2B5] mb-2.5">
                <UserIcon size={12} className="text-[#FF5E36]" />
                <span>Operator Identity & Preferences</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F7F6F9]">
                Operator Profile
              </h1>
                <p className="text-sm text-[#A6A2B5] mt-1">
                  Manage your public display callsign, hardware bio, and ecosystem statistics.
                </p>
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left 4 Cols: Identity Card */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="gs-card p-6 text-center flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF5E36] to-amber-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-[#FF5E36]/25 border-2 border-white/15 mb-4">
                            {username.substring(0, 2).toUpperCase() || 'OP'}
                          </div>
                          <h2 className="font-bold text-xl text-[#F7F6F9]">{username}</h2>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 mt-1">
                            <ShieldCheck size={13} /> GearSync Operator
                          </span>

                              <div className="w-full border-t border-white/[0.06] my-5" />

                              <div className="w-full space-y-3 text-xs text-left">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#16151C]">
                                  <span className="text-[#A6A2B5] flex items-center gap-2">
                                    <Sliders size={13} className="text-[#FF5E36]" /> Personal Loadouts
                                  </span>
                                  <strong className="text-[#F7F6F9] tabular-nums">{profilesCount}</strong>
                                </div>
                                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#16151C]">
                                    <span className="text-[#A6A2B5] flex items-center gap-2">
                                      <Copy size={13} className="text-amber-400" /> Community Clones
                                    </span>
                                    <strong className="text-[#F7F6F9] tabular-nums">{copiesCount}</strong>
                                  </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#16151C]">
                                      <span className="text-[#A6A2B5] flex items-center gap-2">
                                        <Users size={13} className="text-sky-400" /> Creators Followed
                                      </span>
                                      <strong className="text-[#F7F6F9] tabular-nums">
                                        {currentUser.following.length}
                                      </strong>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleSignOut}
                                  className="w-full py-3 px-4 rounded-full bg-[#1D1B24] hover:bg-rose-500/15 border border-white/[0.07] hover:border-rose-500/30 text-[#A6A2B5] hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                                >
                                  <LogOut size={14} /> Disconnect Session
                                </button>
                              </div>

                                  {/* Right 8 Cols: Edit Form */}
                                  <div className="md:col-span-8">
                                    <form onSubmit={handleSave} className="gs-card p-6 sm:p-7 space-y-6">
                                      <div className="border-b border-white/[0.06] pb-3">
                                        <h2 className="text-base font-bold text-[#F7F6F9]">Identity Settings</h2>
                                        <p className="text-xs text-[#A6A2B5] mt-0.5">
                                          Your callsign is displayed on configurations you share to Signal Base.
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                          <label
                                            htmlFor="user-display"
                                            className="block text-xs font-semibold text-[#A6A2B5]"
                                          >
                                            Operator Callsign (Display Name)
                                          </label>
                                          <input
                                            id="user-display"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-3 gs-input text-sm font-semibold"
                                          />
                                      </div>

                                      <div className="space-y-2">
                                          <label htmlFor="user-bio" className="block text-xs font-semibold text-[#A6A2B5]">
                                            Hardware & Setup Bio
                                          </label>
                                          <textarea
                                            id="user-bio"
                                            rows={4}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full px-4 py-3 gs-input text-sm leading-relaxed"
                                            placeholder="Share your monitor refresh rate, mouse, controller, or preferred play style..."
                                          />
                                      </div>

                                        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                                          <button
                                            type="submit"
                                            className="gs-btn-primary px-6 py-3 text-xs sm:text-sm inline-flex items-center gap-2"
                                          >
                                            <Save size={15} /> Save Profile
                                          </button>
                                        </div>
                                    </form>
                                  </div>
                              </div>
                            </div>
                            );
};
