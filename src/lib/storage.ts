import { SUPPORTED_GAMES } from './gameData';
import { encryptData, decryptData } from './crypto';
import { sanitizeProfile } from './sanitize';

export interface GameProfile {
  id: string;
  name: string;
  gameId: string;
  platform: 'pc' | 'playstation' | 'xbox' | 'switch';
  inputType: 'controller' | 'keyboard_mouse';
  tags: string[];
  isPinned: boolean;
  isPublic: boolean;
  userId: string;
  username: string;
  isPro: boolean;
  proBio?: string;
  lastUsed: string;
  copiesCount: number;
  settings: Record<string, string | number | boolean>;
}

export interface ProfileHistory {
  id: string;
  profileId: string;
  timestamp: string;
  settingsSnapshot: Record<string, string | number | boolean>;
  notes: string;
}

export interface SettingsTemplate {
  id: string;
  name: string;
  gameId: string;
  inputType: 'controller' | 'keyboard_mouse';
  settings: Record<string, string | number | boolean>;
}

export interface GameAnnouncement {
  id: string;
  title: string;
  gameId: string;
  date: string;
  content: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
}

export interface User {
  id: string;
  username: string;
  bio: string;
  following: string[];
}

const DEFAULT_USER: User = {
  id: 'current_user',
  username: 'AvvA',
  bio: 'Competitive gamer | Syncing profiles across PC & PS5.',
  following: ['tenz_id', 'bugha_id']
};

const PRO_PROFILES: GameProfile[] = [
  {
    id: 'tenz_profile',
    name: 'TenZ Valorant Setup',
    gameId: 'valorant',
    platform: 'pc',
    inputType: 'keyboard_mouse',
    tags: ['competitive', 'aim-heavy'],
    isPinned: false,
    isPublic: true,
    userId: 'tenz_id',
    username: 'TenZ',
    isPro: true,
    proBio: 'Professional Valorant Player. Sens legend.',
    lastUsed: new Date().toISOString(),
    copiesCount: 2480,
    settings: {
      val_sens: 0.3,
      val_scoped_sens: 1.0,
      val_invert: false,
      val_key_forward: 'W',
      val_key_backward: 'S',
      val_key_left: 'A',
      val_key_right: 'D',
      val_key_jump: 'Space',
      val_key_crouch: 'LCtrl',
      val_key_walk: 'LShift',
      val_key_fire: 'LClick',
      val_key_reload: 'R',
      val_key_primary: '1',
      val_key_secondary: '2',
      val_key_melee: '3',
      val_key_ability1: 'Q',
      val_key_ability2: 'E',
      val_key_ability3: 'C',
      val_key_ultimate: 'X',
      val_display: 'Fullscreen',
      val_res: '1920x1080 16:9 (240Hz)',
      val_aspect: 'Fill',
      val_vsync: false,
      val_material: 'Low',
      val_texture: 'Low',
      val_detail: 'Low',
      val_clarity: true,
      val_bloom: false,
      val_master_vol: 50,
      val_sfx_vol: 80,
      val_music_vol: 0,
      val_map_rotate: true,
      val_map_center: false,
      val_map_size: 1.1,
      val_map_zoom: 0.9,
    }
  },
  {
    id: 'bugha_profile',
    name: 'Bugha Fortnite World Cup Settings',
    gameId: 'fortnite',
    platform: 'pc',
    inputType: 'keyboard_mouse',
    tags: ['world-cup', 'pro'],
    isPinned: false,
    isPublic: true,
    userId: 'bugha_id',
    username: 'Bugha',
    isPro: true,
    proBio: 'Fortnite Solo World Cup Champion.',
    lastUsed: new Date().toISOString(),
    copiesCount: 4291,
    settings: {
      fn_window: 'Fullscreen',
      fn_res: '1920x1080',
      fn_vsync: false,
      fn_framerate: '240 FPS',
      fn_render_mode: 'Performance (Beta)',
      fn_brightness: 100,
      fn_contrast: 1.0,
      fn_colorblind: 'Off',
      fn_colorblind_str: 0,
      fn_motionblur: false,
      fn_nanite: false,
      fn_shadows: 'Off',
      fn_raytracing: false,
      fn_nvidia_reflex: 'On + Boost',
      fn_show_fps: true,
      fn_volume_music: 0,
      fn_volume_sfx: 70,
      fn_volume_dialogue: 20,
      fn_volume_voice: 60,
      fn_visualize_sfx: true,
      fn_headphones_3d: true,
      fn_toggle_ads: false,
      fn_auto_open_doors: true,
      fn_hold_swap: false,
      fn_turbo_building: true,
      fn_auto_confirm_edits: 'Both',
      fn_key_forward: 'W',
      fn_key_backward: 'S',
      fn_key_left: 'A',
      fn_key_right: 'D',
      fn_key_use: 'E',
      fn_key_jump: 'Space',
      fn_key_crouch: 'LCtrl',
      fn_key_wall: 'Q',
      fn_key_floor: 'X',
      fn_key_stairs: 'C',
      fn_key_roof: 'V',
      fn_key_edit: 'F',
    }
  },
  {
    id: 'scump_profile',
    name: 'Scump CDL Controller Loadout',
    gameId: 'bo6',
    platform: 'playstation',
    inputType: 'controller',
    tags: ['competitive', 'controller'],
    isPinned: false,
    isPublic: true,
    userId: 'scump_id',
    username: 'Scump',
    isPro: true,
    proBio: 'CoD World Champion. The King.',
    lastUsed: new Date().toISOString(),
    copiesCount: 3822,
    settings: {
      button_layout: 'Tactical',
      stick_layout: 'Default',
      h_sensitivity: 6,
      v_sensitivity: 6,
      l1_ping: false,
      swap_triggers: false,
      vibration: false,
      trigger_effect: false,
      left_stick_min: 3,
      left_stick_max: 99,
      right_stick_min: 3,
      right_stick_max: 99,
      l2_deadzone: 0,
      r2_deadzone: 0,
      aim_response_curve: 'Dynamic',
      aim_assist: 100,
      sprint_assist: 'Tactical Sprint Assist',
      slide_dive_behavior: 'Tap to Slide',
      c4_detonation: true,
      fov: 103,
      ads_fov: 'Affected',
      weapon_fov: 'Wide',
      fov_3rd: 90,
      vehicle_fov: 'Default',
      world_motion_blur: false,
      weapon_motion_blur: false,
      camera_mvmt_1st: 50,
      camera_mvmt_3rd: 50,
      ads_transition_3rd: '3rd Person ADS',
      inverted_flash: true,
      master_volume: 75,
      audio_device: 'Headphones',
      enhanced_headphone: true,
      audio_mix: 'Headphones',
      mono_audio: false,
      mute_licensed_music: true,
      hearing_compensation: false,
      reduce_tinnitus: true,
      hitmarker_preset: 'BO6',
      hud_preset: 'Focused',
      minimap_color: 'Default',
      color_customization: 'Filter 2',
      color_filter: 'Both',
      world_intensity: 100,
      interface_intensity: 100,
      minimap_shape: 'Square',
      minimap_rotation: true,
      radar_compass_type: 'Full'
    }
  }
];

const DEFAULT_PROFILES: GameProfile[] = [
  {
    id: 'my_bo6_pc',
    name: 'My BO6 Ranked Config',
    gameId: 'bo6',
    platform: 'pc',
    inputType: 'keyboard_mouse',
    tags: ['ranked', 'main'],
    isPinned: true,
    isPublic: false,
    userId: 'current_user',
    username: 'AvvA',
    isPro: false,
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    copiesCount: 0,
    settings: {
      mouse_sens: 4.2,
      ads_multiplier: 0.9,
      monitor_dist_coef: 1.33,
      mouse_acceleration: 0,
      mouse_filtering: 0,
      mouse_smoothing: false,
      key_forward: 'W',
      key_backward: 'S',
      key_left: 'A',
      key_right: 'D',
      key_jump: 'Space',
      key_crouch: 'C',
      key_prone: 'LCtrl',
      key_sprint: 'LShift',
      key_fire: 'LClick',
      key_ads: 'RClick',
      key_reload: 'R',
      key_interact: 'F',
      key_melee: 'V',
      key_lethal: 'G',
      key_tactical: 'Q',
      key_armor: '4',
      fov: 105,
      ads_fov: 'Affected',
      weapon_fov: 'Wide',
      world_motion_blur: false,
      weapon_motion_blur: false,
      inverted_flash: true,
      master_volume: 80,
      enhanced_headphone: true,
      reduce_tinnitus: true,
      hud_preset: 'Focused',
      minimap_shape: 'Square'
    }
  },
  {
    id: 'my_apex_ps5',
    name: 'PS5 Apex Controller Build',
    gameId: 'apex',
    platform: 'playstation',
    inputType: 'controller',
    tags: ['casual', 'controller'],
    isPinned: false,
    isPublic: true,
    userId: 'current_user',
    username: 'AvvA',
    isPro: false,
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    copiesCount: 12,
    settings: {
      ap_ctrl_sens: '4 (High)',
      ap_ctrl_ads_sens: '3 (Default)',
      ap_ctrl_curve: 'Classic',
      ap_ctrl_deadzone: 'Small',
      ap_ctrl_alc: false,
      ap_fov: 104,
      ap_fov_scaling: false,
      ap_sprint_shake: 'Minimal',
      ap_vsync: 'Disabled',
      ap_prompt_style: 'Compact',
      ap_damage_feedback: 'X w/ Shield Icon',
      ap_damage_numbers: 'Stacking',
      ap_ping_opacity: 'Faded',
      ap_streamer_mode: 'Off',
      ap_master: 80,
      ap_sfx: 90,
      ap_dialogue: 50,
      ap_music: 10,
      ap_lobby_music: 10
    }
  },
  ...PRO_PROFILES
];

const DEFAULT_TEMPLATES: SettingsTemplate[] = [
  {
    id: 'comp_mk_base',
    name: 'Competitive Keyboard/Mouse Base',
    gameId: 'bo6',
    inputType: 'keyboard_mouse',
    settings: {
      mouse_sens: 5.0,
      ads_multiplier: 1.0,
      monitor_dist_coef: 1.33,
      fov: 105,
      ads_fov: 'Affected',
      world_motion_blur: false,
      weapon_motion_blur: false,
      inverted_flash: true,
      enhanced_headphone: true,
      reduce_tinnitus: true,
      hud_preset: 'Focused',
      minimap_shape: 'Square'
    }
  },
  {
    id: 'standard_controller_base',
    name: 'Comfort Controller Base',
    gameId: 'bo6',
    inputType: 'controller',
    settings: {
      button_layout: 'Tactical',
      h_sensitivity: 6,
      v_sensitivity: 6,
      vibration: false,
      aim_response_curve: 'Dynamic',
      aim_assist: 100,
      sprint_assist: 'Tactical Sprint Assist',
      slide_dive_behavior: 'Tap to Slide',
      fov: 100,
      world_motion_blur: false,
      weapon_motion_blur: false,
      reduced_tinnitus: true
    }
  }
];

const DEFAULT_ANNOUNCEMENTS: GameAnnouncement[] = [
  {
    id: 'ann_bo6_s1',
    title: 'Black Ops 6 Season 1 Balancing Update',
    gameId: 'bo6',
    date: new Date(Date.now() - 172800000).toLocaleDateString(),
    content: 'Season 1 balancing has adjusted omnimovement latency and sprint-to-fire variables. Check your controller deadzones and sprint assist behavior as default values might feel slightly different.'
  },
  {
    id: 'ann_fn_og',
    title: 'Fortnite Update: Motion Blur & Shadows reset',
    gameId: 'fortnite',
    date: new Date(Date.now() - 345600000).toLocaleDateString(),
    content: 'The recent game patch has reset graphic preset overrides for rendering performance on both PC and Consoles. Please ensure you turn off Motion Blur and verify your rendering API selection.'
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    title: 'Settings Alert: Black Ops 6',
    content: 'A new update for Black Ops 6 may have affected your controller sensitivity settings. Click to review.',
    date: new Date(Date.now() - 172800000).toLocaleString(),
    read: false
  },
  {
    id: 'notif_2',
    title: 'New Config Copy!',
    content: 'A player copied your profile "PS5 Apex Controller Build" to their library.',
    date: new Date(Date.now() - 259200000).toLocaleString(),
    read: true
  }
];

// Memory cache state for decrypted configs
let memoryCache: Record<string, any> = {};

// Helper to get string representation from memory cache
const getCacheItem = (key: string): string | null => {
  const val = memoryCache[key];
  return val ? JSON.stringify(val) : null;
};

// Helper to update memory cache and trigger background encryption to localStorage
const setCacheItem = (key: string, value: string): void => {
  try {
    memoryCache[key] = JSON.parse(value);
    encryptData(value).then(encrypted => {
      localStorage.setItem(key, encrypted);
    }).catch(err => {
      console.error(`Encryption write failed for key ${key}:`, err);
      localStorage.setItem(key, value); // Fallback
    });
  } catch (err) {
    console.error('Failed to parse cache write value:', err);
  }
};

export const initStorageCrypto = async (): Promise<void> => {
  const keys = ['gs_user', 'gs_profiles', 'gs_templates', 'gs_announcements', 'gs_notifications', 'gs_history'];
  for (const key of keys) {
    const rawVal = localStorage.getItem(key);
    if (rawVal) {
      try {
        const decrypted = await decryptData(rawVal);
        memoryCache[key] = JSON.parse(decrypted);
      } catch (err) {
        try {
          // Check if valid plain JSON (migration support)
          const parsed = JSON.parse(rawVal);
          memoryCache[key] = parsed;
          const encrypted = await encryptData(rawVal);
          localStorage.setItem(key, encrypted);
        } catch {
          console.warn(`Could not recover or decrypt storage item: ${key}`);
        }
      }
    }
  }
  initStorage();
};

export const initStorage = () => {
  if (!getCacheItem('gs_user')) {
    setCacheItem('gs_user', JSON.stringify(DEFAULT_USER));
  }
  if (!getCacheItem('gs_profiles')) {
    const sanitizedProfiles = DEFAULT_PROFILES.map(p => sanitizeProfile(p));
    setCacheItem('gs_profiles', JSON.stringify(sanitizedProfiles));
  }
  if (!getCacheItem('gs_templates')) {
    setCacheItem('gs_templates', JSON.stringify(DEFAULT_TEMPLATES));
  }
  if (!getCacheItem('gs_announcements')) {
    setCacheItem('gs_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  }
  if (!getCacheItem('gs_notifications')) {
    setCacheItem('gs_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!getCacheItem('gs_history')) {
    setCacheItem('gs_history', JSON.stringify([]));
  }
};

// Profiles API
export const getProfiles = (): GameProfile[] => {
  initStorage();
  const profiles: GameProfile[] = JSON.parse(getCacheItem('gs_profiles') || '[]');
  return profiles.map(p => sanitizeProfile(p));
};

export const saveProfile = (profile: GameProfile): void => {
  const profiles = getProfiles();
  const sanitized = sanitizeProfile(profile);
  const index = profiles.findIndex(p => p.id === sanitized.id);
  
  if (index >= 0) {
    const prev = profiles[index];
    const diff = Object.keys(sanitized.settings).some(k => prev.settings[k] !== sanitized.settings[k]);
    if (diff) {
      addHistoryEntry(sanitized.id, prev.settings, 'Manual setting modification');
    }
    profiles[index] = { ...sanitized, lastUsed: new Date().toISOString() };
  } else {
    profiles.push(sanitized);
  }
  
  setCacheItem('gs_profiles', JSON.stringify(profiles));
};

export const deleteProfile = (id: string): void => {
  const profiles = getProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  setCacheItem('gs_profiles', JSON.stringify(filtered));
};

export const copyProfile = (profile: GameProfile, newOwnerName: string): GameProfile => {
  const profiles = getProfiles();
  const sanitizedOriginal = sanitizeProfile(profile);
  
  const origIndex = profiles.findIndex(p => p.id === sanitizedOriginal.id);
  if (origIndex >= 0) {
    profiles[origIndex].copiesCount += 1;
  }
  
  const copy: GameProfile = {
    ...sanitizedOriginal,
    id: 'copy_' + Math.random().toString(36).substring(2, 9),
    name: `${sanitizedOriginal.name} (Copy)`,
    userId: 'current_user',
    username: newOwnerName,
    isPinned: false,
    isPro: false,
    copiesCount: 0,
    lastUsed: new Date().toISOString(),
    tags: [...sanitizedOriginal.tags, 'copied']
  };
  
  const sanitizedCopy = sanitizeProfile(copy);
  profiles.push(sanitizedCopy);
  setCacheItem('gs_profiles', JSON.stringify(profiles));
  
  addNotification(
    'Config Imported Successfully',
    `You copied ${sanitizedOriginal.username}'s "${sanitizedOriginal.name}" into your settings locker.`
  );
  
  return sanitizedCopy;
};

export const togglePinProfile = (id: string): void => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index >= 0) {
    profiles[index].isPinned = !profiles[index].isPinned;
    setCacheItem('gs_profiles', JSON.stringify(profiles));
  }
};

// History API
export const getHistory = (profileId: string): ProfileHistory[] => {
  initStorage();
  const allHistory: ProfileHistory[] = JSON.parse(getCacheItem('gs_history') || '[]');
  return allHistory
    .filter(h => h.profileId === profileId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addHistoryEntry = (
  profileId: string,
  settings: Record<string, string | number | boolean>,
  notes: string
): void => {
  const allHistory: ProfileHistory[] = JSON.parse(getCacheItem('gs_history') || '[]');
  const entry: ProfileHistory = {
    id: 'hist_' + Math.random().toString(36).substring(2, 9),
    profileId,
    timestamp: new Date().toISOString(),
    settingsSnapshot: settings,
    notes: sanitizeString(notes)
  };
  allHistory.push(entry);
  setCacheItem('gs_history', JSON.stringify(allHistory));
};

// Helper for sanitizeString used here
const sanitizeString = (val: string): string => {
  return val.replace(/<[^>]*>?/gm, '');
};

// Templates API
export const getTemplates = (): SettingsTemplate[] => {
  initStorage();
  return JSON.parse(getCacheItem('gs_templates') || '[]');
};

export const saveTemplate = (template: SettingsTemplate): void => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  setCacheItem('gs_templates', JSON.stringify(templates));
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  setCacheItem('gs_templates', JSON.stringify(filtered));
};

// Notifications API
export const getNotifications = (): Notification[] => {
  initStorage();
  return JSON.parse(getCacheItem('gs_notifications') || '[]');
};

export const addNotification = (title: string, content: string): void => {
  const notifications = getNotifications();
  notifications.unshift({
    id: 'notif_' + Math.random().toString(36).substring(2, 9),
    title: sanitizeString(title),
    content: sanitizeString(content),
    date: new Date().toLocaleString(),
    read: false
  });
  setCacheItem('gs_notifications', JSON.stringify(notifications));
};

export const markNotificationRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index >= 0) {
    notifications[index].read = true;
    setCacheItem('gs_notifications', JSON.stringify(notifications));
  }
};

export const clearNotifications = (): void => {
  setCacheItem('gs_notifications', JSON.stringify([]));
};

// User API
export const getCurrentUser = (): User => {
  initStorage();
  return JSON.parse(getCacheItem('gs_user') || JSON.stringify(DEFAULT_USER));
};

export const updateCurrentUser = (user: User): void => {
  const sanitizedUser: User = {
    ...user,
    username: sanitizeString(user.username),
    bio: sanitizeString(user.bio)
  };
  setCacheItem('gs_user', JSON.stringify(sanitizedUser));
};

export const getAnnouncements = (): GameAnnouncement[] => {
  initStorage();
  return JSON.parse(getCacheItem('gs_announcements') || '[]');
};

export const addAnnouncement = (ann: Omit<GameAnnouncement, 'id' | 'date'>): void => {
  const announcements = getAnnouncements();
  const fullAnn: GameAnnouncement = {
    ...ann,
    title: sanitizeString(ann.title),
    content: sanitizeString(ann.content),
    id: 'ann_' + Math.random().toString(36).substring(2, 9),
    date: new Date().toLocaleDateString()
  };
  announcements.unshift(fullAnn);
  setCacheItem('gs_announcements', JSON.stringify(announcements));
  
  addNotification(
    `Game Update: ${SUPPORTED_GAMES.find(g => g.id === ann.gameId)?.name || 'GearSync'}`,
    `A new update has been posted: "${fullAnn.title}". Some setting values might be affected.`
  );
};
