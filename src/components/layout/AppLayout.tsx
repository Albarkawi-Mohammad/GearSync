import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sliders, 
  Home, 
  Layers, 
  GitCompare, 
  Calculator, 
  Users, 
  User as UserIcon, 
  Shield, 
  Bell, 
  Menu, 
  X, 
  Check, 
  Trash2, 
  Gamepad2
} from 'lucide-react';
import { getNotifications, markNotificationRead, clearNotifications, type Notification, getCurrentUser, getProfiles } from '../../lib/storage';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Command Palette State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
    // Poll notifications every 5 seconds to keep it reactive (in-app alerts)
    const interval = setInterval(() => {
      setNotifications(getNotifications());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update user info when route changes (e.g. if they edit display name on profile page)
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [location.pathname]);

  // Fetch profiles when command palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setProfiles(getProfiles());
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Global keydown handler to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  const handleClear = () => {
    clearNotifications();
    setNotifications([]);
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'My Profiles', path: '/profiles', icon: Sliders },
    { name: 'Templates', path: '/templates', icon: Layers },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Sensitivity', path: '/sensitivity', icon: Calculator },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Profile Settings', path: '/profile', icon: UserIcon },
    { name: 'Admin Hub', path: '/admin', icon: Shield },
  ];

  // Compile all search items for Command Palette
  const navItems = [
    { type: 'navigation', label: 'Go to Dashboard', path: '/', description: 'Overview and quick access dashboard' },
    { type: 'navigation', label: 'Go to My Profiles Locker', path: '/profiles', description: 'Manage your personal game setting profiles' },
    { type: 'navigation', label: 'Go to Templates', path: '/templates', description: 'Explore community and game defaults library' },
    { type: 'navigation', label: 'Go to Compare Profiles', path: '/compare', description: 'Compare settings delta side-by-side' },
    { type: 'navigation', label: 'Go to Sensitivity Calculator', path: '/sensitivity', description: 'Calibrate DPI and reverse distance to sensitivity' },
    { type: 'navigation', label: 'Go to Community Locker', path: '/community', description: 'Browse and download shared player loadouts' },
    { type: 'navigation', label: 'Go to Profile Settings', path: '/profile', description: 'Modify your displaying player details' },
    { type: 'navigation', label: 'Go to Admin Hub', path: '/admin', description: 'Manage active system announcements' },
    { type: 'action', label: 'Create New Settings Profile', path: '/profiles/new', description: 'Deploy a new profile from scratch or preset' },
  ];

  const profileItems = profiles.map(p => ({
    type: 'profile',
    label: `Profile: ${p.name}`,
    path: `/profiles/${p.id}`,
    description: `Game: ${p.gameId.toUpperCase()} • Platform: ${p.platform.toUpperCase()} • Input: ${p.inputType === 'controller' ? 'Gamepad' : 'M&K'}`
  }));

  const allPaletteItems = [...navItems, ...profileItems];

  const filteredPaletteItems = allPaletteItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
  };

  // Keyboard navigation within the opened Command Palette
  useEffect(() => {
    if (!commandPaletteOpen || filteredPaletteItems.length === 0) return;

    const handlePaletteKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredPaletteItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredPaletteItems.length) % filteredPaletteItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredPaletteItems[selectedIndex]) {
          handleItemSelect(filteredPaletteItems[selectedIndex].path);
        }
      }
    };

    window.addEventListener('keydown', handlePaletteKeys);
    return () => window.removeEventListener('keydown', handlePaletteKeys);
  }, [commandPaletteOpen, filteredPaletteItems, selectedIndex]);



  return (
    <div className="min-h-screen bg-[#070A13] text-gray-100 flex flex-col md:flex-row">
      {/* Skip Navigation Link for ISO/WCAG compliance */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white"
      >
        Skip to main content
      </a>

      {/* MOBILE HEADER */}
      <header role="banner" className="md:hidden flex items-center justify-between px-6 py-4 bg-[#111827]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Gamepad2 className="text-brand-cyan animate-pulse" size={24} />
          <span className="font-bold tracking-wider font-mono text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-primary">
            GEARSYNC
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle notifications menu"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-secondary rounded-full ring-2 ring-[#111827] animate-ping" />
            )}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside role="navigation" className="hidden md:flex flex-col w-64 bg-[#0B0F19]/90 border-r border-slate-800/60 p-5 shrink-0 justify-between sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-4">
            <div className="p-2 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
              <Gamepad2 className="text-brand-cyan animate-pulse" size={28} />
            </div>
            <div>
              <span className="font-extrabold tracking-wider font-mono text-xl text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-primary">
                GEARSYNC
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-brand-secondary uppercase -mt-0.5">
                v1.2 // SECURE
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-cyan/5 text-brand-cyan border-l-2 border-brand-cyan font-bold shadow-md shadow-brand-cyan/5' 
                      : 'text-gray-400 hover:bg-slate-800/40 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-brand-cyan' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Command Palette Trigger Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="mx-2 py-2 px-3 bg-[#0E1524]/60 hover:bg-[#161F30]/50 border border-slate-850 hover:border-slate-800 rounded-lg flex items-center justify-between text-[10px] font-mono text-gray-400 transition-colors"
            title="Open Command Palette (Ctrl+K)"
          >
            <span className="flex items-center gap-1.5">
              <Gamepad2 size={12} className="text-brand-cyan" />
              Command Palette
            </span>
            <span className="bg-[#0B0F19] px-1 py-0.5 border border-slate-800 rounded text-[9px] text-gray-500">
              ⌘K
            </span>
          </button>
        </div>

        {/* User profile locker card */}
        <div className="cyber-panel p-4 border-slate-800 bg-[#161F30]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/10 border border-white/10">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-sm text-gray-200 truncate">{currentUser.username}</span>
              <span className="block text-[10px] text-gray-400 font-mono tracking-wide">LOCKER OPERATOR</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE NAV DRAWER (Persistent with slide and opacity transitions) */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-[#070A13]/95 flex flex-col justify-between p-6 pt-24 transition-all duration-300 ease-out ${
          mobileMenuOpen 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-semibold transition-all ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-cyan border-l-4 border-brand-cyan' 
                    : 'text-gray-300 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={22} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="cyber-panel p-4 border-slate-800 bg-[#161F30]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan flex items-center justify-center font-bold text-white">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="block font-bold text-sm text-gray-200">{currentUser.username}</span>
              <span className="block text-[10px] text-gray-400 font-mono">LOCKER OPERATOR</span>
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL NOTIFICATIONS DRAWER (Persistent with iOS drawer cubic-bezier slide transition) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0E1524] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between transition-all duration-300 ease-drawer ${
          notificationsOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto' 
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="text-brand-cyan" size={20} />
              <h2 className="text-lg font-bold font-mono tracking-wider text-white">ALERT TERMINAL</h2>
            </div>
            <button 
              onClick={() => setNotificationsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close notifications drawer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-mono text-sm">
                NO ACTIVE ALERTS
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notif.read 
                      ? 'bg-[#161F30]/25 border-slate-800 text-gray-400' 
                      : 'bg-[#1E293B]/60 border-brand-primary/30 text-white shadow-md shadow-brand-primary/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-xs uppercase font-mono tracking-wide text-brand-cyan">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <button 
                        onClick={() => handleRead(notif.id)}
                        className="text-brand-accent hover:text-white text-[10px] font-bold font-mono flex items-center gap-1 border border-brand-accent/20 px-1.5 py-0.5 rounded"
                      >
                        <Check size={10} /> READ
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{notif.content}</p>
                  <span className="block text-[9px] text-gray-500 font-mono mt-2">{notif.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClear}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-300 font-mono text-xs uppercase font-semibold tracking-wider rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Trash2 size={14} /> Clear Alert Memory
          </button>
        )}
      </div>

      {/* KEYBOARD-ACCESSIBLE INSTANT COMMAND PALETTE MODAL (0ms transition for speed) */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-xl cyber-panel bg-[#0E1524] border-brand-cyan/40 shadow-2xl flex flex-col max-h-[60vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Gamepad2 className="text-brand-cyan shrink-0 animate-pulse" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Search routes, actions, or locker profiles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500 font-mono"
              />
              <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-gray-500 shrink-0">
                ESC
              </span>
            </div>

            {/* Scrollable list items */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
              {filteredPaletteItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono text-xs">
                  NO SYNC COMMANDS MATCHING QUERY
                </div>
              ) : (
                filteredPaletteItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={`${item.path}-${idx}`}
                      onClick={() => handleItemSelect(item.path)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-mono flex items-center justify-between border ${
                        isSelected 
                          ? 'bg-gradient-to-r from-brand-primary/20 to-brand-cyan/5 border-brand-cyan/40 text-brand-cyan' 
                          : 'bg-transparent border-transparent text-gray-400 hover:bg-[#161F30]/40'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <span className={`block text-xs font-bold ${isSelected ? 'text-brand-cyan' : 'text-gray-250'}`}>
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-gray-500 truncate mt-0.5">
                          {item.description}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-1.5 py-0.5 rounded shrink-0">
                          ENTER
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Keyboard shortcuts helper footer */}
            <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-[9px] font-mono text-gray-500">
              <div className="flex items-center gap-3">
                <span>↑↓ to select</span>
                <span>↵ to execute</span>
              </div>
              <div>
                <span>Ctrl+K / ⌘K to toggle</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main 
        id="main-content" 
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 focus:outline-none"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
};
