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
  Gamepad2,
  Search,
  Plus,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  clearNotifications,
  type Notification,
  getCurrentUser,
  getProfiles,
} from '../../lib/storage';
import { ToastProvider } from '../ui';

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
    const interval = setInterval(() => {
      setNotifications(getNotifications());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [location.pathname]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setProfiles(getProfiles());
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  const handleClear = () => {
    clearNotifications();
    setNotifications([]);
  };

  const primaryNavigation = [
    { name: 'Dashboard', path: '/', icon: Home, badge: 'Home' },
    { name: 'Locker', path: '/profiles', icon: Sliders, badge: 'Profiles' },
    { name: 'Baselines', path: '/templates', icon: Layers, badge: 'Templates' },
    { name: 'Compare', path: '/compare', icon: GitCompare, badge: 'Diff' },
    { name: 'Sensitivity', path: '/sensitivity', icon: Calculator, badge: 'Converter' },
    { name: 'Signal Base', path: '/community', icon: Users, badge: 'Community' },
  ];

  const secondaryNavigation = [
    { name: 'Operator Profile', path: '/profile', icon: UserIcon },
    { name: 'Admin Console', path: '/admin', icon: Shield },
  ];

  const allNavigation = [...primaryNavigation, ...secondaryNavigation];

  // Mobile bottom bar primary destinations
  const mobileBottomNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Locker', path: '/profiles', icon: Sliders },
    { name: 'Sensitivity', path: '/sensitivity', icon: Calculator },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Community', path: '/community', icon: Users },
  ];

  const isRouteActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const currentPageLabel = (() => {
    if (location.pathname === '/') return 'Command Center';
    if (location.pathname === '/profiles/new') return 'Create Loadout';
    if (location.pathname.includes('/edit')) return 'Tune Loadout';
    if (location.pathname.startsWith('/profiles/')) return 'Loadout Inspector';
    const match = allNavigation.find((n) => n.path === location.pathname);
    return match ? match.name : 'Workspace';
  })();

  const navItems = [
    { type: 'action', label: 'Create New Settings Profile', path: '/profiles/new', description: 'Deploy a new game configuration from scratch or pro preset' },
    { type: 'navigation', label: 'Command Center (Dashboard)', path: '/', description: 'Overview, featured loadout, and ecosystem insights' },
    { type: 'navigation', label: 'My Profiles Locker', path: '/profiles', description: 'Browse, filter, import, and manage your saved game profiles' },
    { type: 'navigation', label: 'Baseline Templates', path: '/templates', description: 'Manage reusable configuration foundations' },
    { type: 'navigation', label: 'Compare Profiles', path: '/compare', description: 'Inspect side-by-side settings differences and delta charts' },
    { type: 'navigation', label: 'Sensitivity Calculator', path: '/sensitivity', description: 'Convert DPI, eDPI, and cm/360° across game engines' },
    { type: 'navigation', label: 'Signal Base Community', path: '/community', description: 'Discover verified pro setups and community configurations' },
    { type: 'navigation', label: 'Operator Profile', path: '/profile', description: 'Update your display callsign, bio, and network preferences' },
    { type: 'navigation', label: 'Admin Console', path: '/admin', description: 'Broadcast game patch alerts and system notifications' },
  ];

  const profileItems = profiles.map((p) => ({
    type: 'profile',
    label: p.name,
    path: `/profiles/${p.id}`,
    description: `${p.gameId.toUpperCase()} • ${p.platform.toUpperCase()} • ${p.inputType === 'controller' ? 'Controller' : 'Key & Mouse'}`,
  }));

  const allPaletteItems = [...navItems, ...profileItems];

  const filteredPaletteItems = allPaletteItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
  };

  useEffect(() => {
    if (!commandPaletteOpen || filteredPaletteItems.length === 0) return;

    const handlePaletteKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredPaletteItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPaletteItems.length) % filteredPaletteItems.length);
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
    <ToastProvider>
      <div className="min-h-screen bg-[#0C0B0E] text-[#F7F6F9] flex flex-col md:flex-row md:p-3.5 lg:p-5 gap-3.5 lg:gap-5 relative selection:bg-[#FF5E36]/30">
        {/* Ambient warm background glow */}
        <div className="fixed -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF5E36]/[0.04] blur-[130px] pointer-events-none print:hidden" />
        <div className="fixed bottom-0 right-10 w-[420px] h-[420px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none print:hidden" />

        {/* Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:rounded-2xl focus:bg-[#FF5E36] focus:text-white"
        >
          Skip to main content
        </a>

        {/* DESKTOP COMPACT NAVIGATION RAIL */}
        <aside
          role="navigation"
          aria-label="Primary Sidebar"
          className="hidden md:flex flex-col items-center justify-between w-[76px] py-5 px-3 bg-[#16151C] rounded-[32px] border border-white/[0.06] shadow-shell shrink-0 sticky top-5 h-[calc(100vh-2.5rem)] z-30 print:hidden"
        >
          {/* Top Brand + Primary Icons */}
          <div className="flex flex-col items-center gap-6 w-full">
            <Link
              to="/"
              className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5E36] to-[#E03E1A] text-white shadow-accent-glow transition-transform duration-200 hover:scale-105"
              title="GearSync — Gaming Configuration Ecosystem"
            >
              <Gamepad2 size={24} />
            </Link>

            <div className="w-8 h-[1px] bg-white/[0.07]" />

            <nav className="flex flex-col items-center gap-2.5 w-full">
              {primaryNavigation.map((item) => {
                const isActive = isRouteActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FF5E36] text-white shadow-lg shadow-[#FF5E36]/35'
                        : 'text-[#A6A2B5] hover:bg-[#25232E] hover:text-[#F7F6F9]'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                    {/* Floating Capsule Tooltip */}
                    <span className="pointer-events-none absolute left-[66px] px-3 py-1.5 rounded-full bg-[#25232E] text-[#F7F6F9] text-xs font-semibold whitespace-nowrap border border-white/10 shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition-all duration-150 z-50">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Secondary Icons & User Avatar */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            {secondaryNavigation.map((item) => {
              const isActive = isRouteActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#25232E] text-[#FF5E36] border border-[#FF5E36]/40'
                      : 'text-[#6E6A7E] hover:bg-[#25232E] hover:text-[#F7F6F9]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="pointer-events-none absolute left-[66px] px-3 py-1.5 rounded-full bg-[#25232E] text-[#F7F6F9] text-xs font-semibold whitespace-nowrap border border-white/10 shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            <div className="w-8 h-[1px] bg-white/[0.07] my-1" />

            <Link
              to="/profile"
              className="group relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#25232E] to-[#343042] border border-white/15 flex items-center justify-center font-bold text-xs text-[#F7F6F9] hover:border-[#FF5E36] transition-colors"
              title={`Operator: ${currentUser.username}`}
            >
              {currentUser.username.substring(0, 2).toUpperCase()}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#16151C]" />
            </Link>
          </div>
        </aside>

        {/* MOBILE TOP HEADER */}
        <header
          role="banner"
          className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#16151C]/95 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30 print:hidden"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5E36] to-[#E03E1A] flex items-center justify-center text-white shadow-md shadow-[#FF5E36]/30">
              <Gamepad2 size={19} />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-base text-[#F7F6F9] block leading-none">
                GearSync
              </span>
              <span className="text-[10px] text-[#A6A2B5] font-medium block mt-0.5">
                {currentPageLabel}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-9 h-9 rounded-full bg-[#25232E] border border-white/[0.07] flex items-center justify-center text-[#A6A2B5] hover:text-white"
              aria-label="Open quick search"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-9 rounded-full bg-[#25232E] border border-white/[0.07] flex items-center justify-center text-[#A6A2B5] hover:text-white"
              aria-label="Toggle notifications menu"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5E36] rounded-full ring-2 ring-[#16151C]" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-[#25232E] border border-white/[0.07] flex items-center justify-center text-[#A6A2B5] hover:text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* UNIFIED MAIN WORKSPACE CONTAINER */}
        <div className="flex-1 flex flex-col bg-[#16151C] md:rounded-[36px] md:border md:border-white/[0.06] md:shadow-shell overflow-hidden min-h-[calc(100vh-2.5rem)] pb-24 md:pb-0">
          {/* DESKTOP INTEGRATED TOPBAR */}
          <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/[0.05] bg-[#16151C]/80 backdrop-blur-md sticky top-0 z-20 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#25232E] text-[#A6A2B5] border border-white/[0.06]">
                GearSync Platform
              </span>
              <span className="text-[#6E6A7E]">/</span>
              <span className="text-sm font-semibold text-[#F7F6F9]">{currentPageLabel}</span>
            </div>

            {/* Center / Right Controls */}
            <div className="flex items-center gap-3">
              {/* Pill Search Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center justify-between gap-6 pl-4 pr-3 py-2 rounded-full bg-[#121117] hover:bg-[#1D1B24] border border-white/[0.07] hover:border-white/15 text-xs text-[#A6A2B5] transition-all w-64 lg:w-72"
                title="Open Quick Search (Ctrl+K)"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search size={14} className="text-[#FF5E36] shrink-0" />
                  <span>Search profiles, games...</span>
                </span>
                <kbd className="px-2 py-0.5 rounded-full bg-[#25232E] text-[10px] font-semibold text-[#A6A2B5] border border-white/[0.06]">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Create CTA */}
              <Link
                to="/profiles/new"
                className="gs-btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>New Profile</span>
              </Link>

              {/* Notifications Bell */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-10 h-10 rounded-full bg-[#1D1B24] hover:bg-[#25232E] border border-white/[0.07] flex items-center justify-center text-[#A6A2B5] hover:text-[#F7F6F9] transition-colors"
                aria-label="Toggle notifications drawer"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF5E36] rounded-full ring-2 ring-[#1D1B24]" />
                )}
              </button>

              {/* User Operator Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-[#1D1B24] hover:bg-[#25232E] border border-white/[0.07] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5E36] to-amber-500 flex items-center justify-center text-[11px] font-bold text-white">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[#F7F6F9] max-w-[100px] truncate">
                  {currentUser.username}
                </span>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT */}
          <main
            id="main-content"
            className="flex-1 px-4 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8 focus:outline-none max-w-[1440px] w-full mx-auto"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {/* MOBILE FLOATING BOTTOM NAVIGATION BAR */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-3 inset-x-3 z-30 bg-[#1D1B24]/95 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-2xl flex items-center justify-around print:hidden"
        >
          {mobileBottomNav.map((item) => {
            const isActive = isRouteActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
                  isActive ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/30' : 'text-[#A6A2B5]'
                }`}
              >
                <Icon size={17} />
                <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* MOBILE FULL MENU SHEET */}
        <div
          className={`md:hidden fixed inset-0 z-40 bg-[#0C0B0E]/95 backdrop-blur-xl flex flex-col justify-between p-6 pt-20 pb-28 transition-all duration-250 ease-out print:hidden ${
            mobileMenuOpen
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold text-[#6E6A7E] px-3 mb-2">All Destinations</p>
            {allNavigation.map((item) => {
              const isActive = isRouteActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF5E36] text-white shadow-lg shadow-[#FF5E36]/25'
                      : 'text-[#A6A2B5] hover:bg-[#1D1B24] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <Icon size={20} />
                    {item.name}
                  </span>
                  <ArrowUpRight size={16} className="opacity-60" />
                </Link>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#1D1B24] border border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5E36] to-amber-500 flex items-center justify-center font-bold text-white">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="block font-bold text-sm text-[#F7F6F9]">{currentUser.username}</span>
                <span className="block text-xs text-[#A6A2B5]">GearSync Operator</span>
              </div>
            </div>
            <Link
              to="/profiles/new"
              onClick={() => setMobileMenuOpen(false)}
              className="gs-btn-primary px-4 py-2 text-xs"
            >
              + New Loadout
            </Link>
          </div>
        </div>

        {/* GLOBAL NOTIFICATIONS DRAWER */}
        {notificationsOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            onClick={() => setNotificationsOpen(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#1D1B24] border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between transition-all duration-300 ease-drawer print:hidden ${
            notificationsOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto'
              : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FF5E36]/15 text-[#FF5E36] flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F7F6F9]">Activity & Patch Alerts</h2>
                  <p className="text-xs text-[#A6A2B5]">{unreadCount} unread updates</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#25232E] hover:bg-[#2E2B39] flex items-center justify-center text-[#A6A2B5] hover:text-white transition-colors"
                aria-label="Close notifications drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3 overflow-y-auto max-h-[72vh] pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-14 px-4 rounded-2xl bg-[#16151C] border border-white/[0.04]">
                  <Sparkles size={24} className="text-[#6E6A7E] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#A6A2B5]">All caught up</p>
                  <p className="text-xs text-[#6E6A7E] mt-1">
                    Game patch alerts and profile sync events will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.read
                        ? 'bg-[#16151C]/70 border-white/[0.05] text-[#A6A2B5]'
                        : 'bg-[#25232E] border-[#FF5E36]/35 text-[#F7F6F9] shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-bold text-xs text-[#FF5E36]">{notif.title}</span>
                      {!notif.read && (
                        <button
                          onClick={() => handleRead(notif.id)}
                          className="text-emerald-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full transition-colors"
                        >
                          <Check size={11} /> Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#F7F6F9]/90 leading-relaxed">{notif.content}</p>
                    <span className="block text-[11px] text-[#6E6A7E] mt-2">{notif.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className="w-full py-3 px-4 bg-[#25232E] hover:bg-[#2E2B39] text-[#A6A2B5] hover:text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 border border-white/[0.07] transition-colors"
            >
              <Trash2 size={14} /> Clear All Notifications
            </button>
          )}
        </div>

        {/* INSTANT KEYBOARD COMMAND PALETTE (0ms open for keyboard speed) */}
        {commandPaletteOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-[14vh] px-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div
              className="w-full max-w-xl rounded-[28px] bg-[#1D1B24] border border-white/15 shadow-2xl flex flex-col max-h-[64vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] bg-[#16151C]">
                <Search className="text-[#FF5E36] shrink-0" size={18} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Jump to any loadout, game, or tool..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full bg-transparent text-sm text-[#F7F6F9] focus:outline-none placeholder-[#6E6A7E]"
                />
                <kbd className="text-[10px] font-semibold bg-[#25232E] border border-white/10 px-2 py-0.5 rounded-full text-[#A6A2B5] shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="flex-grow overflow-y-auto p-2.5 space-y-1">
                {filteredPaletteItems.length === 0 ? (
                  <div className="text-center py-12 text-[#6E6A7E] text-sm">
                    No matching profiles or destinations found.
                  </div>
                ) : (
                  filteredPaletteItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={`${item.path}-${idx}`}
                        onClick={() => handleItemSelect(item.path)}
                        className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#FF5E36] text-white shadow-md shadow-[#FF5E36]/25'
                            : 'bg-transparent text-[#A6A2B5] hover:bg-[#25232E] hover:text-[#F7F6F9]'
                        }`}
                      >
                        <div className="overflow-hidden pr-3">
                          <span className={`block text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#F7F6F9]'}`}>
                            {item.label}
                          </span>
                          <span className={`block text-xs truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#6E6A7E]'}`}>
                            {item.description}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            isSelected ? 'bg-black/25 text-white' : 'bg-[#16151C] text-[#6E6A7E]'
                          }`}
                        >
                          {item.type === 'profile' ? 'Loadout' : item.type === 'action' ? 'Action' : 'Go'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/[0.06] bg-[#16151C] flex items-center justify-between text-xs text-[#6E6A7E]">
                <div className="flex items-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Open</span>
                </div>
                <span>⌘K / Ctrl+K</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
};
