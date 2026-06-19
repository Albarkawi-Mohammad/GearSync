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
  platformLimit?: ('pc' | 'console' | 'playstation' | 'xbox' | 'switch')[];
}

export interface GameSchema {
  id: string;
  name: string;
  logo: string;
  categories: string[];
  fields: SettingField[];
}

export const SUPPORTED_GAMES: GameSchema[] = [
  {
    id: 'bo6',
    name: 'Call of Duty: Black Ops 6',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop', // Fallback gaming theme
    categories: ['Graphics', 'Audio', 'Interface/HUD', 'Controller', 'Mouse & Keyboard', 'Keybinds'],
    fields: [
      // Graphics
      { id: 'dynamic_res', name: 'Dynamic Resolution', type: 'toggle', category: 'Graphics', default: false, platformLimit: ['pc'] },
      { id: 'upscaling', name: 'Upscaling / Sharpening', type: 'select', category: 'Graphics', default: 'NVIDIA DLSS', options: ['None', 'NVIDIA DLSS', 'AMD FSR', 'Intel XeSS', 'FidelityFX CAS'], platformLimit: ['pc'] },
      { id: 'dlss_frame_gen', name: 'NVIDIA DLSS Frame Generation', type: 'toggle', category: 'Graphics', default: false, platformLimit: ['pc'] },
      { id: 'vram_scale', name: 'VRAM Scale Target', type: 'slider', category: 'Graphics', default: 80, min: 50, max: 90, step: 5, platformLimit: ['pc'] },
      { id: 'variable_rate_shading', name: 'Variable Rate Shading', type: 'toggle', category: 'Graphics', default: false, platformLimit: ['pc'] },
      { id: 'texture_res', name: 'Texture Resolution', type: 'select', category: 'Graphics', default: 'High', options: ['Very Low', 'Low', 'Normal', 'High'] },
      { id: 'texture_filter', name: 'Texture Filter Anisotropic', type: 'select', category: 'Graphics', default: 'High', options: ['Low', 'Normal', 'High'] },
      { id: 'depth_of_field', name: 'Depth of Field', type: 'toggle', category: 'Graphics', default: false },
      { id: 'detail_quality', name: 'Detail Quality', type: 'select', category: 'Graphics', default: 'High', options: ['Low', 'Normal', 'High'] },
      { id: 'particle_res', name: 'Particle Resolution', type: 'select', category: 'Graphics', default: 'High', options: ['Very Low', 'Low', 'Normal', 'High'] },
      { id: 'bullet_impacts', name: 'Bullet Impacts', type: 'toggle', category: 'Graphics', default: true },
      { id: 'persistent_effects', name: 'Persistent Effects', type: 'toggle', category: 'Graphics', default: true },
      { id: 'shader_quality', name: 'Shader Quality', type: 'select', category: 'Graphics', default: 'High', options: ['Low', 'Medium', 'High'] },
      { id: 'texture_streaming', name: 'On-Demand Texture Streaming', type: 'select', category: 'Graphics', default: 'Standard', options: ['Off', 'Minimal', 'Standard', 'Optimized'] },
      { id: 'local_streaming_quality', name: 'Local Texture Streaming Quality', type: 'select', category: 'Graphics', default: 'Normal', options: ['Low', 'Normal'] },
      { id: 'shadow_quality', name: 'Shadow Quality', type: 'select', category: 'Graphics', default: 'Normal', options: ['Very Low', 'Low', 'Normal', 'High', 'Ultra'] },
      { id: 'screen_space_shadows', name: 'Screen Space Shadows', type: 'select', category: 'Graphics', default: 'High', options: ['Off', 'Low', 'High'] },
      { id: 'ambient_occlusion', name: 'Occlusion and Screen Space Lighting', type: 'select', category: 'Graphics', default: 'Both', options: ['Off', 'GTAO', 'MDAO', 'Both'] },
      { id: 'screen_space_reflections', name: 'Screen Space Reflections', type: 'select', category: 'Graphics', default: 'Normal', options: ['Off', 'Low', 'Normal', 'High'] },
      { id: 'static_reflections', name: 'Static Reflection Quality', type: 'select', category: 'Graphics', default: 'High', options: ['Low', 'Normal', 'High'] },
      { id: 'tessellation', name: 'Tessellation', type: 'select', category: 'Graphics', default: 'Near', options: ['Off', 'Near', 'All'] },
      { id: 'volumetric_quality', name: 'Volumetric Quality', type: 'select', category: 'Graphics', default: 'Medium', options: ['Low', 'Medium', 'High'] },
      { id: 'deferred_physics', name: 'Deferred Physics Quality', type: 'select', category: 'Graphics', default: 'Normal', options: ['Off', 'Low', 'Normal', 'High'] },
      { id: 'weather_grid', name: 'Weather Grid Volumes Quality', type: 'select', category: 'Graphics', default: 'Medium', options: ['Off', 'Low', 'Medium', 'High'] },
      { id: 'water_quality', name: 'Water Quality', type: 'select', category: 'Graphics', default: 'All', options: ['Off', 'Wave Wetness', 'All'] },
      { id: 'motion_reduction', name: 'Motion Reduction Preset', type: 'toggle', category: 'Graphics', default: false },
      { id: 'fov', name: 'Field of View (FOV)', type: 'slider', category: 'Graphics', default: 105, min: 60, max: 120, step: 1 },
      { id: 'ads_fov', name: 'ADS Field of View', type: 'select', category: 'Graphics', default: 'Affected', options: ['Independent', 'Affected'] },
      { id: 'weapon_fov', name: 'Weapon Field of View', type: 'select', category: 'Graphics', default: 'Wide', options: ['Narrow', 'Default', 'Wide'] },
      { id: 'fov_3rd', name: '3rd Person Field of View', type: 'slider', category: 'Graphics', default: 90, min: 70, max: 90, step: 1 },
      { id: 'vehicle_fov', name: 'Vehicle Field of View', type: 'select', category: 'Graphics', default: 'Default', options: ['Default', 'Wide'] },
      { id: 'world_motion_blur', name: 'World Motion Blur', type: 'toggle', category: 'Graphics', default: false },
      { id: 'weapon_motion_blur', name: 'Weapon Motion Blur', type: 'toggle', category: 'Graphics', default: false },
      { id: 'camera_mvmt_1st', name: '1st Person Camera Movement', type: 'slider', category: 'Graphics', default: 50, min: 50, max: 100, step: 1 },
      { id: 'camera_mvmt_3rd', name: '3rd Person Camera Movement', type: 'slider', category: 'Graphics', default: 50, min: 50, max: 100, step: 1 },
      { id: 'ads_transition_3rd', name: '3rd Person ADS Transition', type: 'select', category: 'Graphics', default: '3rd Person ADS', options: ['1st Person ADS', '3rd Person ADS'] },
      { id: 'inverted_flash', name: 'Inverted Flashbang', type: 'toggle', category: 'Graphics', default: true },

      // Audio
      { id: 'master_volume', name: 'Master Volume', type: 'slider', category: 'Audio', default: 80, min: 0, max: 100, step: 1 },
      { id: 'audio_device', name: 'Speaker/Headphones Game Sound Device', type: 'select', category: 'Audio', default: 'Default System Device', options: ['Default System Device', 'Headphones', 'Speakers'] },
      { id: 'enhanced_headphone', name: 'Enhanced Headphone Mode', type: 'toggle', category: 'Audio', default: true },
      { id: 'audio_mix', name: 'Audio Mix', type: 'select', category: 'Audio', default: 'Headphones', options: ['PC Speakers', 'Headphones', 'Home Theater', 'Soundbar', 'Cinema'] },
      { id: 'mono_audio', name: 'Mono Audio', type: 'toggle', category: 'Audio', default: false },
      { id: 'mute_minimized', name: 'Mute Game When Minimized', type: 'toggle', category: 'Audio', default: true, platformLimit: ['pc'] },
      { id: 'mute_licensed_music', name: 'Mute Licensed Music', type: 'toggle', category: 'Audio', default: false },
      { id: 'hearing_compensation', name: 'Asymmetrical Hearing Compensation', type: 'toggle', category: 'Audio', default: false },
      { id: 'reduce_tinnitus', name: 'Reduce Tinnitus Sound', type: 'toggle', category: 'Audio', default: true },
      { id: 'hitmarker_preset', name: 'Hitmarker Preset', type: 'select', category: 'Audio', default: 'Classic', options: ['None', 'Classic', 'MW', 'BO6'] },

      // Interface/HUD
      { id: 'hud_preset', name: 'HUD Layout Preset', type: 'select', category: 'Interface/HUD', default: 'Focused', options: ['Standard', 'Focused', 'Dot Hunter', 'Left-Aligned'] },
      { id: 'minimap_color', name: 'Minimap Color Option', type: 'select', category: 'Interface/HUD', default: 'Default', options: ['Default', 'Deuteranopia', 'Protanopia', 'Tritanopia'] },
      { id: 'color_customization', name: 'Color Customization Filter', type: 'select', category: 'Interface/HUD', default: 'Filter 2', options: ['None', 'Filter 1', 'Filter 2', 'Filter 3'] },
      { id: 'color_filter', name: 'Color Filter Target', type: 'select', category: 'Interface/HUD', default: 'Both', options: ['Interface', 'World', 'Both'] },
      { id: 'world_intensity', name: 'World Color Intensity', type: 'slider', category: 'Interface/HUD', default: 100, min: 0, max: 100, step: 5 },
      { id: 'interface_intensity', name: 'Interface Color Intensity', type: 'slider', category: 'Interface/HUD', default: 100, min: 0, max: 100, step: 5 },
      { id: 'minimap_shape', name: 'Minimap Shape', type: 'select', category: 'Interface/HUD', default: 'Square', options: ['Square', 'Round'] },
      { id: 'minimap_rotation', name: 'Minimap Rotation', type: 'toggle', category: 'Interface/HUD', default: true },
      { id: 'radar_compass_type', name: 'Radar and Compass Type', type: 'select', category: 'Interface/HUD', default: 'Full', options: ['None', 'Compass Only', 'Full'] },

      // Controller
      { id: 'button_layout', name: 'Button Layout', type: 'select', category: 'Controller', default: 'Tactical', options: ['Default', 'Tactical', 'Lefty', 'Bumper Jumper', 'Stick and Move'] },
      { id: 'stick_layout', name: 'Stick Layout', type: 'select', category: 'Controller', default: 'Default', options: ['Default', 'Southpaw', 'Legacy', 'Legacy Southpaw'] },
      { id: 'h_sensitivity', name: 'Horizontal Stick Sensitivity', type: 'slider', category: 'Controller', default: 6, min: 1, max: 20, step: 1 },
      { id: 'v_sensitivity', name: 'Vertical Stick Sensitivity', type: 'slider', category: 'Controller', default: 6, min: 1, max: 20, step: 1 },
      { id: 'l1_ping', name: 'L1 Button Ping', type: 'toggle', category: 'Controller', default: false },
      { id: 'swap_triggers', name: 'Swap L1/R1 with L2/R2', type: 'toggle', category: 'Controller', default: false },
      { id: 'vibration', name: 'Controller Vibration', type: 'toggle', category: 'Controller', default: false },
      { id: 'trigger_effect', name: 'Trigger Effect', type: 'toggle', category: 'Controller', default: false, platformLimit: ['playstation'] },
      { id: 'left_stick_min', name: 'Left Stick Min Deadzone', type: 'slider', category: 'Controller', default: 3, min: 0, max: 50, step: 1 },
      { id: 'left_stick_max', name: 'Left Stick Max Deadzone', type: 'slider', category: 'Controller', default: 99, min: 50, max: 99, step: 1 },
      { id: 'right_stick_min', name: 'Right Stick Min Deadzone', type: 'slider', category: 'Controller', default: 3, min: 0, max: 50, step: 1 },
      { id: 'right_stick_max', name: 'Right Stick Max Deadzone', type: 'slider', category: 'Controller', default: 99, min: 50, max: 99, step: 1 },
      { id: 'l2_deadzone', name: 'L2 Button Deadzone', type: 'slider', category: 'Controller', default: 0, min: 0, max: 50, step: 1 },
      { id: 'r2_deadzone', name: 'R2 Button Deadzone', type: 'slider', category: 'Controller', default: 0, min: 0, max: 50, step: 1 },
      { id: 'aim_response_curve', name: 'Aim Response Curve Type', type: 'select', category: 'Controller', default: 'Dynamic', options: ['Standard', 'Linear', 'Dynamic'] },
      { id: 'aim_assist', name: 'Aim Assist Strength', type: 'slider', category: 'Controller', default: 100, min: 0, max: 100, step: 5 },
      { id: 'sprint_assist', name: 'Sprint Assist', type: 'select', category: 'Controller', default: 'Tactical Sprint Assist', options: ['Off', 'Sprint Assist', 'Tactical Sprint Assist'] },
      { id: 'slide_dive_behavior', name: 'Slide/Dive Behavior', type: 'select', category: 'Controller', default: 'Tap to Slide', options: ['Tap to Slide', 'Tap to Dive', 'Invert'] },
      { id: 'c4_detonation', name: 'Quick C4 Detonation', type: 'toggle', category: 'Controller', default: true },

      // Mouse & Keyboard (PC focused)
      { id: 'mouse_sens', name: 'Mouse Sensitivity', type: 'slider', category: 'Mouse & Keyboard', default: 5.0, min: 0.1, max: 30.0, step: 0.05, platformLimit: ['pc'] },
      { id: 'ads_multiplier', name: 'ADS Sensitivity Multiplier', type: 'slider', category: 'Mouse & Keyboard', default: 1.0, min: 0.1, max: 3.0, step: 0.01, platformLimit: ['pc'] },
      { id: 'monitor_dist_coef', name: 'Monitor Distance Coefficient', type: 'slider', category: 'Mouse & Keyboard', default: 1.33, min: 0.0, max: 2.0, step: 0.01, platformLimit: ['pc'] },
      { id: 'mouse_acceleration', name: 'Mouse Acceleration', type: 'slider', category: 'Mouse & Keyboard', default: 0, min: 0, max: 100, step: 1, platformLimit: ['pc'] },
      { id: 'mouse_filtering', name: 'Mouse Filtering', type: 'slider', category: 'Mouse & Keyboard', default: 0, min: 0, max: 100, step: 1, platformLimit: ['pc'] },
      { id: 'mouse_smoothing', name: 'Mouse Smoothing', type: 'toggle', category: 'Mouse & Keyboard', default: false, platformLimit: ['pc'] },

      // Keybinds (PC focused)
      { id: 'key_forward', name: 'Move Forward', type: 'keybind', category: 'Keybinds', default: 'W', platformLimit: ['pc'] },
      { id: 'key_backward', name: 'Move Backward', type: 'keybind', category: 'Keybinds', default: 'S', platformLimit: ['pc'] },
      { id: 'key_left', name: 'Move Left', type: 'keybind', category: 'Keybinds', default: 'A', platformLimit: ['pc'] },
      { id: 'key_right', name: 'Move Right', type: 'keybind', category: 'Keybinds', default: 'D', platformLimit: ['pc'] },
      { id: 'key_jump', name: 'Jump/Stand/Mantle', type: 'keybind', category: 'Keybinds', default: 'Space', platformLimit: ['pc'] },
      { id: 'key_crouch', name: 'Crouch/Slide', type: 'keybind', category: 'Keybinds', default: 'C', platformLimit: ['pc'] },
      { id: 'key_prone', name: 'Prone/Dive', type: 'keybind', category: 'Keybinds', default: 'Ctrl', platformLimit: ['pc'] },
      { id: 'key_sprint', name: 'Sprint/Tactical Sprint/Focus', type: 'keybind', category: 'Keybinds', default: 'Shift', platformLimit: ['pc'] },
      { id: 'key_fire', name: 'Fire Weapon', type: 'keybind', category: 'Keybinds', default: 'LClick', platformLimit: ['pc'] },
      { id: 'key_ads', name: 'Aim Down Sight', type: 'keybind', category: 'Keybinds', default: 'RClick', platformLimit: ['pc'] },
      { id: 'key_reload', name: 'Reload', type: 'keybind', category: 'Keybinds', default: 'R', platformLimit: ['pc'] },
      { id: 'key_interact', name: 'Interact', type: 'keybind', category: 'Keybinds', default: 'F', platformLimit: ['pc'] },
      { id: 'key_melee', name: 'Melee/Finishing Move', type: 'keybind', category: 'Keybinds', default: 'V', platformLimit: ['pc'] },
      { id: 'key_lethal', name: 'Lethal Equipment', type: 'keybind', category: 'Keybinds', default: 'E', platformLimit: ['pc'] },
      { id: 'key_tactical', name: 'Tactical Equipment', type: 'keybind', category: 'Keybinds', default: 'Q', platformLimit: ['pc'] },
      { id: 'key_armor', name: 'Armor Plate/Drop Item', type: 'keybind', category: 'Keybinds', default: '4', platformLimit: ['pc'] },
    ]
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    logo: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=200&auto=format&fit=crop',
    categories: ['Graphics (PC)', 'Graphics (Console)', 'Audio', 'Gameplay', 'Controller', 'Keybinds'],
    fields: [
      // PC Graphics
      { id: 'fn_window', name: 'Window Mode', type: 'select', category: 'Graphics (PC)', default: 'Fullscreen', options: ['Fullscreen', 'Windowed Fullscreen', 'Windowed'], platformLimit: ['pc'] },
      { id: 'fn_res', name: 'Resolution', type: 'select', category: 'Graphics (PC)', default: '1920x1080', options: ['2560x1440', '1920x1080', '1600x900', '1280x720'], platformLimit: ['pc'] },
      { id: 'fn_vsync', name: 'V-Sync', type: 'toggle', category: 'Graphics (PC)', default: false, platformLimit: ['pc'] },
      { id: 'fn_framerate', name: 'Frame Rate Limit', type: 'select', category: 'Graphics (PC)', default: '144 FPS', options: ['60 FPS', '120 FPS', '144 FPS', '240 FPS', 'Unlimited'], platformLimit: ['pc'] },
      { id: 'fn_render_mode', name: 'Rendering Mode', type: 'select', category: 'Graphics (PC)', default: 'Performance', options: ['DirectX 11', 'DirectX 12', 'Performance (Beta)'], platformLimit: ['pc'] },
      { id: 'fn_brightness', name: 'Brightness', type: 'slider', category: 'Graphics (PC)', default: 100, min: 50, max: 150, step: 1 },
      { id: 'fn_contrast', name: 'User Interface Contrast', type: 'slider', category: 'Graphics (PC)', default: 1.0, min: 1.0, max: 1.5, step: 0.05 },
      { id: 'fn_colorblind', name: 'Color Blind Mode', type: 'select', category: 'Graphics (PC)', default: 'Off', options: ['Off', 'Deuteranope', 'Protanope', 'Tritanope'] },
      { id: 'fn_colorblind_str', name: 'Color Blind Strength', type: 'slider', category: 'Graphics (PC)', default: 5, min: 0, max: 10, step: 1 },
      { id: 'fn_motionblur', name: 'Motion Blur', type: 'toggle', category: 'Graphics (PC)', default: false },
      { id: 'fn_nanite', name: 'Nanite Virtualized Geometry', type: 'toggle', category: 'Graphics (PC)', default: false, platformLimit: ['pc'] },
      { id: 'fn_shadows', name: 'Shadows', type: 'select', category: 'Graphics (PC)', default: 'Off', options: ['Off', 'Medium', 'High', 'Epic'], platformLimit: ['pc'] },
      { id: 'fn_raytracing', name: 'Hardware Ray Tracing', type: 'toggle', category: 'Graphics (PC)', default: false, platformLimit: ['pc'] },
      { id: 'fn_nvidia_reflex', name: 'NVIDIA Reflex Low Latency', type: 'select', category: 'Graphics (PC)', default: 'On + Boost', options: ['Off', 'On', 'On + Boost'], platformLimit: ['pc'] },
      { id: 'fn_show_fps', name: 'Show FPS', type: 'toggle', category: 'Graphics (PC)', default: true },

      // Console Graphics
      { id: 'fn_console_120fps', name: '120 FPS Mode', type: 'toggle', category: 'Graphics (Console)', default: false, platformLimit: ['playstation', 'xbox'] },
      { id: 'fn_console_blur', name: 'Motion Blur (Console)', type: 'toggle', category: 'Graphics (Console)', default: false, platformLimit: ['playstation', 'xbox'] },
      { id: 'fn_console_fps', name: 'Show FPS (Console)', type: 'toggle', category: 'Graphics (Console)', default: true, platformLimit: ['playstation', 'xbox'] },

      // Audio
      { id: 'fn_volume_music', name: 'Music Volume', type: 'slider', category: 'Audio', default: 20, min: 0, max: 100, step: 1 },
      { id: 'fn_volume_sfx', name: 'Sound Effects Volume', type: 'slider', category: 'Audio', default: 80, min: 0, max: 100, step: 1 },
      { id: 'fn_volume_dialogue', name: 'Dialogue Volume', type: 'slider', category: 'Audio', default: 50, min: 0, max: 100, step: 1 },
      { id: 'fn_volume_voice', name: 'Voice Chat Volume', type: 'slider', category: 'Audio', default: 70, min: 0, max: 100, step: 1 },
      { id: 'fn_visualize_sfx', name: 'Visualize Sound Effects', type: 'toggle', category: 'Audio', default: true },
      { id: 'fn_headphones_3d', name: '3D Headphones', type: 'toggle', category: 'Audio', default: true },

      // Gameplay
      { id: 'fn_toggle_ads', name: 'Toggle Aim Down Sights', type: 'toggle', category: 'Gameplay', default: false },
      { id: 'fn_auto_open_doors', name: 'Auto-Open Doors', type: 'toggle', category: 'Gameplay', default: true },
      { id: 'fn_hold_swap', name: 'Hold to Swap Pickup', type: 'toggle', category: 'Gameplay', default: false },
      { id: 'fn_turbo_building', name: 'Turbo Building', type: 'toggle', category: 'Gameplay', default: true },
      { id: 'fn_auto_confirm_edits', name: 'Auto Confirm Edits', type: 'select', category: 'Gameplay', default: 'Both', options: ['None', 'Edit', 'Reset', 'Both'] },

      // Controller
      { id: 'fn_ctrl_deadzone_l', name: 'Left Stick Deadzone', type: 'slider', category: 'Controller', default: 8, min: 5, max: 30, step: 1 },
      { id: 'fn_ctrl_deadzone_r', name: 'Right Stick Deadzone', type: 'slider', category: 'Controller', default: 8, min: 5, max: 30, step: 1 },
      { id: 'fn_ctrl_look_h', name: 'Look Horizontal Speed', type: 'slider', category: 'Controller', default: 42, min: 1, max: 100, step: 1 },
      { id: 'fn_ctrl_look_v', name: 'Look Vertical Speed', type: 'slider', category: 'Controller', default: 42, min: 1, max: 100, step: 1 },
      { id: 'fn_ctrl_ads_h', name: 'ADS Look Horizontal Speed', type: 'slider', category: 'Controller', default: 8, min: 1, max: 50, step: 1 },
      { id: 'fn_ctrl_ads_v', name: 'ADS Look Vertical Speed', type: 'slider', category: 'Controller', default: 8, min: 1, max: 50, step: 1 },
      { id: 'fn_ctrl_aim_assist', name: 'Aim Assist Strength', type: 'slider', category: 'Controller', default: 100, min: 0, max: 100, step: 1 },
      { id: 'fn_ctrl_linear', name: 'Look Input Curve', type: 'select', category: 'Controller', default: 'Linear', options: ['Linear', 'Exponential'] },

      // Keybinds (PC)
      { id: 'fn_key_forward', name: 'Move Forward', type: 'keybind', category: 'Keybinds', default: 'W', platformLimit: ['pc'] },
      { id: 'fn_key_backward', name: 'Move Backward', type: 'keybind', category: 'Keybinds', default: 'S', platformLimit: ['pc'] },
      { id: 'fn_key_left', name: 'Move Left', type: 'keybind', category: 'Keybinds', default: 'A', platformLimit: ['pc'] },
      { id: 'fn_key_right', name: 'Move Right', type: 'keybind', category: 'Keybinds', default: 'D', platformLimit: ['pc'] },
      { id: 'fn_key_use', name: 'Use / Interact', type: 'keybind', category: 'Keybinds', default: 'E', platformLimit: ['pc'] },
      { id: 'fn_key_jump', name: 'Jump', type: 'keybind', category: 'Keybinds', default: 'Space', platformLimit: ['pc'] },
      { id: 'fn_key_crouch', name: 'Crouch', type: 'keybind', category: 'Keybinds', default: 'LCtrl', platformLimit: ['pc'] },
      { id: 'fn_key_wall', name: 'Building Wall', type: 'keybind', category: 'Keybinds', default: 'Q', platformLimit: ['pc'] },
      { id: 'fn_key_floor', name: 'Building Floor', type: 'keybind', category: 'Keybinds', default: 'X', platformLimit: ['pc'] },
      { id: 'fn_key_stairs', name: 'Building Stairs', type: 'keybind', category: 'Keybinds', default: 'C', platformLimit: ['pc'] },
      { id: 'fn_key_roof', name: 'Building Roof', type: 'keybind', category: 'Keybinds', default: 'V', platformLimit: ['pc'] },
      { id: 'fn_key_edit', name: 'Building Edit', type: 'keybind', category: 'Keybinds', default: 'F', platformLimit: ['pc'] },
    ]
  },
  {
    id: 'apex',
    name: 'Apex Legends',
    logo: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=200&auto=format&fit=crop',
    categories: ['Video', 'Audio', 'Gameplay/HUD', 'Mouse & Keyboard', 'Controller', 'Keybinds'],
    fields: [
      // Video
      { id: 'ap_display_mode', name: 'Display Mode', type: 'select', category: 'Video', default: 'Fullscreen', options: ['Fullscreen', 'Borderless Window', 'Windowed'], platformLimit: ['pc'] },
      { id: 'ap_aspect_ratio', name: 'Aspect Ratio', type: 'select', category: 'Video', default: '16:9', options: ['16:9', '16:10', '4:3', '21:9'], platformLimit: ['pc'] },
      { id: 'ap_res', name: 'Resolution', type: 'select', category: 'Video', default: '1920x1080', options: ['2560x1440', '1920x1080', '1280x720'], platformLimit: ['pc'] },
      { id: 'ap_fov', name: 'Field of View (FOV)', type: 'slider', category: 'Video', default: 104, min: 70, max: 110, step: 1 },
      { id: 'ap_fov_scaling', name: 'FOV Ability Scaling', type: 'toggle', category: 'Video', default: false },
      { id: 'ap_sprint_shake', name: 'Sprint View Shake', type: 'select', category: 'Video', default: 'Minimal', options: ['Normal', 'Minimal'] },
      { id: 'ap_vsync', name: 'V-Sync', type: 'select', category: 'Video', default: 'Disabled', options: ['Disabled', 'Double Buffered', 'Triple Buffered', 'Adaptive'] },
      { id: 'ap_reflex', name: 'Nvidia Reflex', type: 'select', category: 'Video', default: 'Enabled + Boost', options: ['Disabled', 'Enabled', 'Enabled + Boost'], platformLimit: ['pc'] },
      { id: 'ap_texture_budget', name: 'Texture Streaming Budget', type: 'select', category: 'Video', default: 'High (4GB VRAM)', options: ['None', 'Very Low (2GB)', 'Medium (3GB)', 'High (4GB)', 'Insane (8GB)'], platformLimit: ['pc'] },
      { id: 'ap_model_detail', name: 'Model Detail', type: 'select', category: 'Video', default: 'Low', options: ['Low', 'Medium', 'High'] },
      { id: 'ap_effects_detail', name: 'Effects Detail', type: 'select', category: 'Video', default: 'Low', options: ['Low', 'Medium', 'High'] },

      // Audio
      { id: 'ap_master', name: 'Master Volume', type: 'slider', category: 'Audio', default: 70, min: 0, max: 100, step: 1 },
      { id: 'ap_sfx', name: 'Sound Effects Volume', type: 'slider', category: 'Audio', default: 90, min: 0, max: 100, step: 1 },
      { id: 'ap_dialogue', name: 'Dialogue Volume', type: 'slider', category: 'Audio', default: 60, min: 0, max: 100, step: 1 },
      { id: 'ap_music', name: 'Music Volume', type: 'slider', category: 'Audio', default: 20, min: 0, max: 100, step: 1 },
      { id: 'ap_lobby_music', name: 'Lobby Music Volume', type: 'slider', category: 'Audio', default: 15, min: 0, max: 100, step: 1 },

      // Gameplay/HUD
      { id: 'ap_prompt_style', name: 'Interact Prompt Style', type: 'select', category: 'Gameplay/HUD', default: 'Compact', options: ['Default', 'Compact'] },
      { id: 'ap_damage_feedback', name: 'Crosshair Damage Feedback', type: 'select', category: 'Gameplay/HUD', default: 'X w/ Shield Icon', options: ['Off', 'X', 'X w/ Shield Icon'] },
      { id: 'ap_damage_numbers', name: 'Damage Numbers', type: 'select', category: 'Gameplay/HUD', default: 'Stacking', options: ['Off', '2D', '3D', 'Stacking', 'Both'] },
      { id: 'ap_ping_opacity', name: 'Ping Opacity', type: 'select', category: 'Gameplay/HUD', default: 'Faded', options: ['Default', 'Faded'] },
      { id: 'ap_streamer_mode', name: 'Streamer Mode', type: 'select', category: 'Gameplay/HUD', default: 'Off', options: ['Off', 'All', 'Killed By'] },

      // Mouse & Keyboard (PC)
      { id: 'ap_mouse_sens', name: 'Mouse Sensitivity', type: 'slider', category: 'Mouse & Keyboard', default: 1.5, min: 0.2, max: 10.0, step: 0.1, platformLimit: ['pc'] },
      { id: 'ap_ads_multiplier', name: 'ADS Mouse Sensitivity Multiplier', type: 'slider', category: 'Mouse & Keyboard', default: 1.0, min: 0.2, max: 3.0, step: 0.05, platformLimit: ['pc'] },
      { id: 'ap_mouse_acceleration', name: 'Mouse Acceleration', type: 'toggle', category: 'Mouse & Keyboard', default: false, platformLimit: ['pc'] },

      // Controller
      { id: 'ap_ctrl_sens', name: 'Look Sensitivity', type: 'select', category: 'Controller', default: '4', options: ['1 (Very Low)', '2 (Low)', '3 (Default)', '4 (High)', '5 (Very High)'] },
      { id: 'ap_ctrl_ads_sens', name: 'Look Sensitivity (ADS)', type: 'select', category: 'Controller', default: '3', options: ['1 (Very Low)', '2 (Low)', '3 (Default)', '4 (High)', '5 (Very High)'] },
      { id: 'ap_ctrl_curve', name: 'Response Curve', type: 'select', category: 'Controller', default: 'Classic', options: ['Classic', 'Linear', 'Steady', 'Fine Aim'] },
      { id: 'ap_ctrl_deadzone', name: 'Look Deadzone', type: 'select', category: 'Controller', default: 'Small', options: ['None', 'Small', 'Large'] },
      { id: 'ap_ctrl_alc', name: 'Advanced Look Controls (ALC)', type: 'toggle', category: 'Controller', default: false },

      // Keybinds (PC)
      { id: 'ap_key_forward', name: 'Move Forward', type: 'keybind', category: 'Keybinds', default: 'W', platformLimit: ['pc'] },
      { id: 'ap_key_backward', name: 'Move Backward', type: 'keybind', category: 'Keybinds', default: 'S', platformLimit: ['pc'] },
      { id: 'ap_key_left', name: 'Move Left', type: 'keybind', category: 'Keybinds', default: 'A', platformLimit: ['pc'] },
      { id: 'ap_key_right', name: 'Move Right', type: 'keybind', category: 'Keybinds', default: 'D', platformLimit: ['pc'] },
      { id: 'ap_key_tactical', name: 'Tactical Ability', type: 'keybind', category: 'Keybinds', default: 'Q', platformLimit: ['pc'] },
      { id: 'ap_key_ultimate', name: 'Ultimate Ability', type: 'keybind', category: 'Keybinds', default: 'Z', platformLimit: ['pc'] },
      { id: 'ap_key_interact', name: 'Interact / Pick Up', type: 'keybind', category: 'Keybinds', default: 'E', platformLimit: ['pc'] },
      { id: 'ap_key_melee', name: 'Melee', type: 'keybind', category: 'Keybinds', default: 'V', platformLimit: ['pc'] },
      { id: 'ap_key_ping', name: 'Ping', type: 'keybind', category: 'Keybinds', default: 'Middle Click', platformLimit: ['pc'] },
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    logo: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=200&auto=format&fit=crop',
    categories: ['Video', 'Audio', 'Map', 'Mouse', 'Keybinds'],
    fields: [
      // Mouse
      { id: 'val_sens', name: 'Mouse Sensitivity', type: 'slider', category: 'Mouse', default: 0.35, min: 0.05, max: 2.0, step: 0.005 },
      { id: 'val_scoped_sens', name: 'Scoped Sensitivity Multiplier', type: 'slider', category: 'Mouse', default: 1.0, min: 0.1, max: 2.0, step: 0.05 },
      { id: 'val_invert', name: 'Invert Mouse', type: 'toggle', category: 'Mouse', default: false },

      // Keybinds
      { id: 'val_key_forward', name: 'Move Forward', type: 'keybind', category: 'Keybinds', default: 'W' },
      { id: 'val_key_backward', name: 'Move Backward', type: 'keybind', category: 'Keybinds', default: 'S' },
      { id: 'val_key_left', name: 'Move Left', type: 'keybind', category: 'Keybinds', default: 'A' },
      { id: 'val_key_right', name: 'Move Right', type: 'keybind', category: 'Keybinds', default: 'D' },
      { id: 'val_key_jump', name: 'Jump', type: 'keybind', category: 'Keybinds', default: 'Space' },
      { id: 'val_key_crouch', name: 'Crouch', type: 'keybind', category: 'Keybinds', default: 'LCtrl' },
      { id: 'val_key_walk', name: 'Walk / Slow', type: 'keybind', category: 'Keybinds', default: 'LShift' },
      { id: 'val_key_fire', name: 'Fire Weapon', type: 'keybind', category: 'Keybinds', default: 'LClick' },
      { id: 'val_key_reload', name: 'Reload', type: 'keybind', category: 'Keybinds', default: 'R' },
      { id: 'val_key_primary', name: 'Equip Primary Weapon', type: 'keybind', category: 'Keybinds', default: '1' },
      { id: 'val_key_secondary', name: 'Equip Secondary Weapon', type: 'keybind', category: 'Keybinds', default: '2' },
      { id: 'val_key_melee', name: 'Equip Melee Weapon', type: 'keybind', category: 'Keybinds', default: '3' },
      { id: 'val_key_ability1', name: 'Ability 1', type: 'keybind', category: 'Keybinds', default: 'Q' },
      { id: 'val_key_ability2', name: 'Ability 2', type: 'keybind', category: 'Keybinds', default: 'E' },
      { id: 'val_key_ability3', name: 'Ability 3', type: 'keybind', category: 'Keybinds', default: 'C' },
      { id: 'val_key_ultimate', name: 'Ultimate Ability', type: 'keybind', category: 'Keybinds', default: 'X' },

      // Video
      { id: 'val_display', name: 'Display Mode', type: 'select', category: 'Video', default: 'Fullscreen', options: ['Fullscreen', 'Windowed Fullscreen', 'Windowed'] },
      { id: 'val_res', name: 'Resolution', type: 'select', category: 'Video', default: '1920x1080 16:9 (240Hz)', options: ['2560x1440 16:9 (144Hz)', '1920x1080 16:9 (240Hz)', '1920x1080 16:9 (144Hz)'] },
      { id: 'val_aspect', name: 'Aspect Ratio Method', type: 'select', category: 'Video', default: 'Fill', options: ['Letterbox', 'Fill'] },
      { id: 'val_vsync', name: 'V-Sync', type: 'toggle', category: 'Video', default: false },
      { id: 'val_material', name: 'Material Quality', type: 'select', category: 'Video', default: 'Low', options: ['Low', 'Medium', 'High'] },
      { id: 'val_texture', name: 'Texture Quality', type: 'select', category: 'Video', default: 'Low', options: ['Low', 'Medium', 'High'] },
      { id: 'val_detail', name: 'Detail Quality', type: 'select', category: 'Video', default: 'Low', options: ['Low', 'Medium', 'High'] },
      { id: 'val_clarity', name: 'Improve Clarity', type: 'toggle', category: 'Video', default: true },
      { id: 'val_bloom', name: 'Bloom', type: 'toggle', category: 'Video', default: false },

      // Audio
      { id: 'val_master_vol', name: 'Master Volume', type: 'slider', category: 'Audio', default: 80, min: 0, max: 100, step: 1 },
      { id: 'val_sfx_vol', name: 'SFX Volume', type: 'slider', category: 'Audio', default: 80, min: 0, max: 100, step: 1 },
      { id: 'val_music_vol', name: 'Music Volume', type: 'slider', category: 'Audio', default: 20, min: 0, max: 100, step: 1 },

      // Map
      { id: 'val_map_rotate', name: 'Rotate Minimap', type: 'toggle', category: 'Map', default: true },
      { id: 'val_map_center', name: 'Keep Player Centered', type: 'toggle', category: 'Map', default: false },
      { id: 'val_map_size', name: 'Minimap Size', type: 'slider', category: 'Map', default: 1.1, min: 0.8, max: 1.2, step: 0.05 },
      { id: 'val_map_zoom', name: 'Minimap Zoom', type: 'slider', category: 'Map', default: 0.9, min: 0.5, max: 1.0, step: 0.05 },
    ]
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    logo: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=200&auto=format&fit=crop',
    categories: ['Video', 'Audio', 'Mouse', 'Keyboard', 'Viewmodel'],
    fields: [
      // Mouse
      { id: 'cs_sens', name: 'Mouse Sensitivity', type: 'slider', category: 'Mouse', default: 1.6, min: 0.1, max: 5.0, step: 0.01 },
      { id: 'cs_zoom_sens', name: 'Zoom Sensitivity Multiplier', type: 'slider', category: 'Mouse', default: 1.0, min: 0.5, max: 1.5, step: 0.05 },
      { id: 'cs_invert', name: 'Invert Mouse', type: 'toggle', category: 'Mouse', default: false },

      // Video
      { id: 'cs_res', name: 'Resolution', type: 'select', category: 'Video', default: '1280x960', options: ['1920x1080', '1280x960', '1024x768', '1280x1024'] },
      { id: 'cs_aspect', name: 'Aspect Ratio', type: 'select', category: 'Video', default: '4:3', options: ['16:9', '16:10', '4:3'] },
      { id: 'cs_display_mode', name: 'Display Mode', type: 'select', category: 'Video', default: 'Fullscreen', options: ['Fullscreen', 'Windowed'] },
      { id: 'cs_shadow_quality', name: 'Global Shadow Quality', type: 'select', category: 'Video', default: 'High', options: ['Low', 'Medium', 'High', 'Very High'] },
      { id: 'cs_model_texture', name: 'Model / Texture Detail', type: 'select', category: 'Video', default: 'Medium', options: ['Low', 'Medium', 'High'] },
      { id: 'cs_multisampling', name: 'Multisampling Anti-Aliasing Mode', type: 'select', category: 'Video', default: '4x MSAA', options: ['None', '2x MSAA', '4x MSAA', '8x MSAA'] },
      { id: 'cs_fsr', name: 'FidelityFX Super Resolution', type: 'select', category: 'Video', default: 'Disabled (Highest Quality)', options: ['Disabled (Highest Quality)', 'Ultra Quality', 'Quality', 'Balanced', 'Performance'] },
      { id: 'cs_reflex', name: 'NVIDIA Reflex Low Latency', type: 'select', category: 'Video', default: 'Enabled', options: ['Disabled', 'Enabled', 'Enabled + Boost'] },

      // Audio
      { id: 'cs_master', name: 'Master Volume', type: 'slider', category: 'Audio', default: 50, min: 0, max: 100, step: 1 },
      { id: 'cs_music', name: 'Ten Second Warning Volume', type: 'slider', category: 'Audio', default: 20, min: 0, max: 100, step: 1 },

      // Keyboard
      { id: 'cs_key_forward', name: 'Move Forward', type: 'keybind', category: 'Keyboard', default: 'W' },
      { id: 'cs_key_backward', name: 'Move Backward', type: 'keybind', category: 'Keyboard', default: 'S' },
      { id: 'cs_key_left', name: 'Move Left', type: 'keybind', category: 'Keyboard', default: 'A' },
      { id: 'cs_key_right', name: 'Move Right', type: 'keybind', category: 'Keyboard', default: 'D' },
      { id: 'cs_key_jump', name: 'Jump', type: 'keybind', category: 'Keyboard', default: 'Space' },
      { id: 'cs_key_crouch', name: 'Duck / Crouch', type: 'keybind', category: 'Keyboard', default: 'LShift' },
      { id: 'cs_key_walk', name: 'Walk / Slow', type: 'keybind', category: 'Keyboard', default: 'LCtrl' },
      { id: 'cs_key_buy', name: 'Buy Menu', type: 'keybind', category: 'Keyboard', default: 'B' },
      { id: 'cs_key_console', name: 'Toggle Console', type: 'keybind', category: 'Keyboard', default: '`' },

      // Viewmodel
      { id: 'cs_viewmodel_fov', name: 'Viewmodel FOV', type: 'slider', category: 'Viewmodel', default: 68, min: 54, max: 68, step: 1 },
      { id: 'cs_viewmodel_x', name: 'Viewmodel Offset X', type: 'slider', category: 'Viewmodel', default: 2.5, min: -2.5, max: 2.5, step: 0.1 },
      { id: 'cs_viewmodel_y', name: 'Viewmodel Offset Y', type: 'slider', category: 'Viewmodel', default: 0, min: -2.0, max: 2.0, step: 0.1 },
      { id: 'cs_viewmodel_z', name: 'Viewmodel Offset Z', type: 'slider', category: 'Viewmodel', default: -1.5, min: -2.0, max: 2.0, step: 0.1 },
    ]
  }
];

export const SENSITIVITY_FACTORS: Record<string, number> = {
  apex: 1.0,
  bo6: 1.0, // BO6 mouse sensitivity translates 1:1 with standard Source/Apex engine
  cs2: 1.0, // CS2 is also Source engine based (1:1 with Apex)
  valorant: 3.181818, // Valorant sens * 3.18 = Apex/CS2 sens
  fortnite: 0.042, // fortnite mouse slider conversion approximate
};
