import { type GameProfile } from './storage';

/**
 * Compiles a GameProfile's settings into a raw game configuration file format (.cfg / .ini / .txt).
 */
export const compileGameConfig = (profile: GameProfile): { filename: string; content: string } => {
  const { gameId, name, settings } = profile;
  let content = `// =============================================\n`;
  content += `// GEARSYNC CONFIGURATION EXPORT\n`;
  content += `// Profile: ${name}\n`;
  content += `// Game: ${gameId.toUpperCase()}\n`;
  content += `// Generated: ${new Date().toLocaleString()}\n`;
  content += `// =============================================\n\n`;

  let filename = `${gameId}_gearsync_config.cfg`;

  if (gameId === 'apex') {
    filename = `apex_autoexec_gearsync.cfg`;
    content += `// Sensitivity settings\n`;
    content += `mouse_sensitivity "${settings.ap_mouse_sens ?? 1.5}"\n`;
    content += `mouse_zoomsensitivity_multiplier_0 "${settings.ap_ads_multiplier ?? 1.0}"\n`;
    if (settings.ap_fov) {
      // Source fovScale factor (70 is baseline)
      const scale = parseFloat((Number(settings.ap_fov) / 70).toFixed(4));
      content += `cl_fovScale "${scale}" // FOV ${settings.ap_fov}\n`;
    }
    content += `mouse_acceleration "${settings.ap_mouse_acceleration ? 1 : 0}"\n\n`;

    content += `// Keyboard Keybinds\n`;
    if (settings.ap_key_forward) content += `bind "${String(settings.ap_key_forward).toLowerCase()}" "+forward"\n`;
    if (settings.ap_key_backward) content += `bind "${String(settings.ap_key_backward).toLowerCase()}" "+back"\n`;
    if (settings.ap_key_left) content += `bind "${String(settings.ap_key_left).toLowerCase()}" "+moveleft"\n`;
    if (settings.ap_key_right) content += `bind "${String(settings.ap_key_right).toLowerCase()}" "+moveright"\n`;
    if (settings.ap_key_tactical) content += `bind "${String(settings.ap_key_tactical).toLowerCase()}" "+tacticalability"\n`;
    if (settings.ap_key_ultimate) content += `bind "${String(settings.ap_key_ultimate).toLowerCase()}" "+ultimateability"\n`;
    if (settings.ap_key_interact) content += `bind "${String(settings.ap_key_interact).toLowerCase()}" "+use"\n`;
    if (settings.ap_key_melee) content += `bind "${String(settings.ap_key_melee).toLowerCase()}" "+melee"\n`;
  } 
  else if (gameId === 'cs2') {
    filename = `cs2_autoexec_gearsync.cfg`;
    content += `// Mouse & Sensitivity\n`;
    content += `sensitivity "${settings.cs_sens ?? 1.6}"\n`;
    content += `zoom_sensitivity_ratio "${settings.cs_zoom_sens ?? 1.0}"\n`;
    content += `m_pitch "${settings.cs_invert ? -0.022 : 0.022}"\n\n`;

    content += `// Video Overrides\n`;
    if (settings.cs_reflex) {
      content += `r_low_latency "${settings.cs_reflex === 'Disabled' ? 0 : 1}"\n`;
    }
    content += `\n// Keybinds\n`;
    if (settings.cs_key_forward) content += `bind "${String(settings.cs_key_forward).toLowerCase()}" "+forward"\n`;
    if (settings.cs_key_backward) content += `bind "${String(settings.cs_key_backward).toLowerCase()}" "+back"\n`;
    if (settings.cs_key_left) content += `bind "${String(settings.cs_key_left).toLowerCase()}" "+left"\n`;
    if (settings.cs_key_right) content += `bind "${String(settings.cs_key_right).toLowerCase()}" "+right"\n`;
    
    let jumpKey = String(settings.cs_key_jump).toLowerCase();
    if (jumpKey === 'space') jumpKey = 'space';
    if (settings.cs_key_jump) content += `bind "${jumpKey}" "+jump"\n`;
    
    let crouchKey = String(settings.cs_key_crouch).toLowerCase();
    if (crouchKey === 'lshift') crouchKey = 'shift';
    if (settings.cs_key_crouch) content += `bind "${crouchKey}" "+duck"\n`;
    
    let walkKey = String(settings.cs_key_walk).toLowerCase();
    if (walkKey === 'lctrl') walkKey = 'ctrl';
    if (settings.cs_key_walk) content += `bind "${walkKey}" "+sprint"\n`;
    
    if (settings.cs_key_buy) content += `bind "${String(settings.cs_key_buy).toLowerCase()}" "buymenu"\n`;
    if (settings.cs_key_console) content += `bind "${String(settings.cs_key_console).toLowerCase()}" "toggleconsole"\n`;
  } 
  else if (gameId === 'bo6') {
    filename = `bo6_config_gearsync.cfg`;
    content += `// Call of Duty: Black Ops 6 Client Overrides\n`;
    content += `setcl mouse_sensitivity "${settings.mouse_sens ?? 5.0}"\n`;
    content += `setcl ads_multiplier "${settings.ads_multiplier ?? 1.0}"\n`;
    content += `setcl monitor_dist_coef "${settings.monitor_dist_coef ?? 1.33}"\n`;
    content += `setcl fov "${settings.fov ?? 105}"\n`;
    content += `setcl world_motion_blur "${settings.world_motion_blur ? 1 : 0}"\n`;
    content += `setcl weapon_motion_blur "${settings.weapon_motion_blur ? 1 : 0}"\n`;
    content += `setcl enhanced_headphone "${settings.enhanced_headphone ? 1 : 0}"\n\n`;

    content += `// Console Binds\n`;
    if (settings.key_forward) content += `bind "${String(settings.key_forward).toUpperCase()}" "+forward"\n`;
    if (settings.key_backward) content += `bind "${String(settings.key_backward).toUpperCase()}" "+back"\n`;
    if (settings.key_left) content += `bind "${String(settings.key_left).toUpperCase()}" "+left"\n`;
    if (settings.key_right) content += `bind "${String(settings.key_right).toUpperCase()}" "+right"\n`;
    if (settings.key_crouch) content += `bind "${String(settings.key_crouch).toUpperCase()}" "+crouch"\n`;
    if (settings.key_prone) content += `bind "${String(settings.key_prone).toUpperCase()}" "+prone"\n`;
    if (settings.key_sprint) content += `bind "${String(settings.key_sprint).toUpperCase()}" "+sprint"\n`;
  } 
  else if (gameId === 'fortnite') {
    filename = `fortnite_settings_gearsync.ini`;
    content += `[FortniteGame.Settings]\n`;
    content += `fn_brightness=${settings.fn_brightness ?? 100}\n`;
    content += `fn_vsync=${settings.fn_vsync ? 'True' : 'False'}\n`;
    content += `fn_motionblur=${settings.fn_motionblur ? 'True' : 'False'}\n`;
    content += `fn_show_fps=${settings.fn_show_fps ? 'True' : 'False'}\n`;
    content += `fn_visualize_sfx=${settings.fn_visualize_sfx ? 'True' : 'False'}\n\n`;
    content += `[Keybinds]\n`;
    if (settings.fn_key_forward) content += `Forward=${settings.fn_key_forward}\n`;
    if (settings.fn_key_backward) content += `Backward=${settings.fn_key_backward}\n`;
    if (settings.fn_key_left) content += `Left=${settings.fn_key_left}\n`;
    if (settings.fn_key_right) content += `Right=${settings.fn_key_right}\n`;
    if (settings.fn_key_use) content += `Interact=${settings.fn_key_use}\n`;
    if (settings.fn_key_wall) content += `Wall=${settings.fn_key_wall}\n`;
    if (settings.fn_key_floor) content += `Floor=${settings.fn_key_floor}\n`;
    if (settings.fn_key_stairs) content += `Stairs=${settings.fn_key_stairs}\n`;
    if (settings.fn_key_roof) content += `Roof=${settings.fn_key_roof}\n`;
    if (settings.fn_key_edit) content += `Edit=${settings.fn_key_edit}\n`;
  } 
  else {
    // Fallback simple list
    filename = `${gameId}_settings.txt`;
    Object.entries(settings).forEach(([key, val]) => {
      content += `${key} = "${val}"\n`;
    });
  }

  return { filename, content };
};

/**
 * Parses a raw configuration file contents and maps recognized keys back to setting fields.
 */
export const parseGameConfig = (content: string, gameId: string): Record<string, string | number | boolean> => {
  const settings: Record<string, string | number | boolean> = {};
  const lines = content.split('\n');

  // Simple keybind/sensitivity regex extractors
  // Match `bind "key" "command"`, `bind key command`
  const bindRegex = /bind\s+["']?([^"'\s]+)["']?\s+["']?([^"'\s]+)["']?/i;
  // Match `sensitivity "val"`, `sensitivity val`
  const sensRegex = /sensitivity\s+["']?([0-9.]+)/i;
  // Match `mouse_sensitivity "val"`, `mouse_sensitivity val`
  const apSensRegex = /mouse_sensitivity\s+["']?([0-9.]+)/i;
  // Match `mouse_zoomsensitivity_multiplier_0 "val"`
  const apAdsRegex = /mouse_zoomsensitivity_multiplier_0\s+["']?([0-9.]+)/i;
  // Match `cl_fovScale "val"`
  const apFovRegex = /cl_fovScale\s+["']?([0-9.]+)/i;
  // Match `zoom_sensitivity_ratio "val"`
  const csZoomRegex = /zoom_sensitivity_ratio\s+["']?([0-9.]+)/i;
  // Match `setcl key "value"`, `setcl key value`
  const setclRegex = /setcl\s+([A-Za-z0-9_]+)\s+["']?([^"'\r\n]+)["']?/i;
  // Match `key=value` or `key = value`
  const iniRegex = /^\s*([A-Za-z0-9_]+)\s*=\s*["']?([^"'\r\n]+)["']?/i;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith(';')) return;

    if (gameId === 'apex') {
      const sensMatch = trimmed.match(apSensRegex);
      if (sensMatch) {
        settings.ap_mouse_sens = parseFloat(sensMatch[1]);
      }
      const adsMatch = trimmed.match(apAdsRegex);
      if (adsMatch) {
        settings.ap_ads_multiplier = parseFloat(adsMatch[1]);
      }
      const fovMatch = trimmed.match(apFovRegex);
      if (fovMatch) {
        // Convert fovScale factor back to approximate degrees
        settings.ap_fov = Math.round(parseFloat(fovMatch[1]) * 70);
      }

      const bindMatch = trimmed.match(bindRegex);
      if (bindMatch) {
        const key = bindMatch[1].toUpperCase();
        const cmd = bindMatch[2].toLowerCase();

        if (cmd === '+forward') settings.ap_key_forward = key;
        if (cmd === '+back') settings.ap_key_backward = key;
        if (cmd === '+moveleft') settings.ap_key_left = key;
        if (cmd === '+moveright') settings.ap_key_right = key;
        if (cmd === '+tacticalability') settings.ap_key_tactical = key;
        if (cmd === '+ultimateability') settings.ap_key_ultimate = key;
        if (cmd === '+use') settings.ap_key_interact = key;
        if (cmd === '+melee') settings.ap_key_melee = key;
      }
    } 
    else if (gameId === 'cs2') {
      const sensMatch = trimmed.match(sensRegex);
      if (sensMatch) {
        settings.cs_sens = parseFloat(sensMatch[1]);
      }
      const zoomMatch = trimmed.match(csZoomRegex);
      if (zoomMatch) {
        settings.cs_zoom_sens = parseFloat(zoomMatch[1]);
      }

      const bindMatch = trimmed.match(bindRegex);
      if (bindMatch) {
        const key = bindMatch[1].toUpperCase();
        const cmd = bindMatch[2].toLowerCase();

        if (cmd === '+forward') settings.cs_key_forward = key;
        if (cmd === '+back') settings.cs_key_backward = key;
        if (cmd === '+left') settings.cs_key_left = key;
        if (cmd === '+right') settings.cs_key_right = key;
        if (cmd === '+jump') settings.cs_key_jump = key;
        if (cmd === '+duck') settings.cs_key_crouch = key === 'SHIFT' ? 'LShift' : key;
        if (cmd === '+sprint') settings.cs_key_walk = key === 'CTRL' ? 'LCtrl' : key;
        if (cmd === 'buymenu') settings.cs_key_buy = key;
        if (cmd === 'toggleconsole') settings.cs_key_console = key;
      }
    } 
    else if (gameId === 'bo6') {
      const setclMatch = trimmed.match(setclRegex);
      if (setclMatch) {
        const key = setclMatch[1];
        const val = setclMatch[2];

        if (key === 'mouse_sensitivity') settings.mouse_sens = parseFloat(val);
        if (key === 'ads_multiplier') settings.ads_multiplier = parseFloat(val);
        if (key === 'monitor_dist_coef') settings.monitor_dist_coef = parseFloat(val);
        if (key === 'fov') settings.fov = parseInt(val);
        if (key === 'world_motion_blur') settings.world_motion_blur = val === '1';
        if (key === 'weapon_motion_blur') settings.weapon_motion_blur = val === '1';
        if (key === 'enhanced_headphone') settings.enhanced_headphone = val === '1';
      }

      const bindMatch = trimmed.match(bindRegex);
      if (bindMatch) {
        const key = bindMatch[1].toUpperCase();
        const cmd = bindMatch[2].toLowerCase();

        if (cmd === '+forward') settings.key_forward = key;
        if (cmd === '+back') settings.key_backward = key;
        if (cmd === '+left') settings.key_left = key;
        if (cmd === '+right') settings.key_right = key;
        if (cmd === '+crouch') settings.key_crouch = key;
        if (cmd === '+prone') settings.key_prone = key;
        if (cmd === '+sprint') settings.key_sprint = key;
      }
    } 
    else if (gameId === 'fortnite') {
      const iniMatch = trimmed.match(iniRegex);
      if (iniMatch) {
        const key = iniMatch[1];
        const val = iniMatch[2];

        if (key === 'fn_brightness') settings.fn_brightness = parseInt(val);
        if (key === 'fn_vsync') settings.fn_vsync = val.toLowerCase() === 'true';
        if (key === 'fn_motionblur') settings.fn_motionblur = val.toLowerCase() === 'true';
        if (key === 'fn_show_fps') settings.fn_show_fps = val.toLowerCase() === 'true';
        if (key === 'fn_visualize_sfx') settings.fn_visualize_sfx = val.toLowerCase() === 'true';

        if (key === 'Forward') settings.fn_key_forward = val;
        if (key === 'Backward') settings.fn_key_backward = val;
        if (key === 'Left') settings.fn_key_left = val;
        if (key === 'Right') settings.fn_key_right = val;
        if (key === 'Interact') settings.fn_key_use = val;
        if (key === 'Wall') settings.fn_key_wall = val;
        if (key === 'Floor') settings.fn_key_floor = val;
        if (key === 'Stairs') settings.fn_key_stairs = val;
        if (key === 'Roof') settings.fn_key_roof = val;
        if (key === 'Edit') settings.fn_key_edit = val;
      }
    }
  });

  return settings;
};
