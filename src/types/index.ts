/**
 * GearSync Domain Types & Data Models
 */

export type Platform = 'pc' | 'playstation' | 'xbox' | 'switch';
export type InputType = 'controller' | 'keyboard_mouse';

export interface GameProfile {
  id: string;
  name: string;
  gameId: string;
  platform: Platform;
  inputType: InputType;
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
  inputType: InputType;
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

export interface SettingField {
  id: string;
  name: string;
  type: 'slider' | 'toggle' | 'select' | 'text' | 'keybind';
  category: string;
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  platformLimit?: Platform[];
}

export interface GameSchema {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  fields: SettingField[];
}

export type ToastType = 'success' | 'warning' | 'info' | 'error';

