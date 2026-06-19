# GearSync (SyncConfig)

GearSync is a high-performance, responsive web application built with a dark cyberpunk aesthetic. It allows competitive gamers to manage, sync, translate, and copy settings configurations across different hardware platforms (PC, PlayStation, Xbox, Nintendo Switch) for games like *Call of Duty: Black Ops 6*, *Apex Legends*, *Fortnite*, *Valorant*, and *Counter-Strike 2*.

---

## 🚀 Key Features

*   **Locker Profiles Manager**: Pin, tag, edit, search, and delete your configurations.
*   **Settings Setup Wizard**: Multi-step configuration helper. Pre-fill from pro presets (such as **TenZ**, **Bugha**, **Scump**) or baseline templates.
*   **Checklist Mode**: Visual checklist wizard designed for mobile browsers, with a tap-to-complete indicator to physically copy settings onto consoles/PCs step-by-step.
*   **Version History Rollbacks**: Automatic backup snapshots captured before modification to allow immediate recovery logs.
*   **Sensitivity Conversion**: Converts DPI & sensitivities between game engines, rendering eDPI and physical rotation distance (cm/360°).
*   **Profile Compare Matrix**: Visual matrix showing differences side-by-side.
*   **Signal Base (Community Feed)**: Social network feed where players can search, follow players, and copy public setups into their lockers.
*   **Patch Alert & Admin Console**: Admin dashboard to broadcast mock patch adjustments and verify notifications.

---

## 🛠️ Technology Stack

*   **Frontend Library**: React 19 (TypeScript)
*   **Routing**: React Router DOM 7 (`HashRouter` for serverless static compatibility)
*   **Styling**: Tailwind CSS 3 & PostCSS
*   **Charts**: Recharts 3
*   **Icons**: Lucide React
*   **Visual Effects**: Canvas Confetti
*   **Database**: Client-side localStorage persistence

---

## 📂 Project Directory Structure

```text
GearSync/
├── src/
│   ├── assets/              # Icons and images
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx # Shell container (sidebar, navbar, notifications bell drawer)
│   │   ├── profiles/
│   │   │   └── ChecklistMode.tsx # Tap-to-complete mobile overlay stepper
│   │   └── ErrorBoundary.tsx # Catch-all crash handler
│   ├── lib/
│   │   ├── gameData.ts      # Settings schema parameters (BO6, Fortnite, Apex, Valorant, CS2)
│   │   └── storage.ts       # Database layers and mock configurations seeding
│   ├── pages/
│   │   ├── AdminPanel.tsx   # Patch update broadcaster
│   │   ├── Community.tsx    # Signal discover feed and following timelines
│   │   ├── CompareProfiles.tsx # Side-by-side parameters discrepancy highlights
│   │   ├── Dashboard.tsx    # Boot terminal, activity statistics, and patch alerts
│   │   ├── EditProfile.tsx  # Setup wizard (templates and pro loadouts)
│   │   ├── Profiles.tsx     # Locker manager dashboard
│   │   ├── ProfileView.tsx  # Settings breakdown card & rollback log
│   │   ├── SensitivityCalculator.tsx # Sensitivity DPI translator
│   │   ├── Templates.tsx    # Quick templates builder
│   │   └── UserProfile.tsx  # Operator callsign editor
│   ├── App.css              # Custom styling adjustments
│   ├── index.css            # Styling core, outfit font-family, and glassmorphism rules
│   ├── main.tsx             # Entry script
│   └── vite-env.d.ts
├── package.json             # NPM dependencies & task script commands
├── tsconfig.json            # TypeScript compile configurations
├── vite.config.ts           # Vite development and compile guidelines
└── tailwind.config.js       # Grid overlays, keyframes, and custom color mappings
```

---

## 💾 Storage Database Schema

The database stores user models, custom presets, template structures, and alerts using the `localStorage` API under six distinct keys:

1.  **`gs_user`**: Holds the current User callsign name, short bio, and following UID arrays.
2.  **`gs_profiles`**: Holds the `GameProfile` configurations array.
3.  **`gs_templates`**: Holds the `SettingsTemplate` list for creating base presets.
4.  **`gs_announcements`**: Stores game patch logs and balance notifications.
5.  **`gs_notifications`**: Stores real-time in-app alerts and notifications.
6.  **`gs_history`**: Captures snapshot entries (`ProfileHistory`) representing state logs before updates are written.

---

## 🏃 Run & Build Instructions

### Development Server
Run the local dev server at `http://localhost:5173/`:
```bash
npm run dev
```

### Build Production Bundle
Compile code to optimized static files under `/dist`:
```bash
npm run build
```
