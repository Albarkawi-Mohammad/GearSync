# GearSync

GearSync is a high-performance gaming settings companion and configuration manager engineered for competitive players and esports enthusiasts. It allows players to manage, calibrate, translate, compare, and synchronize configurations across multiple hardware platforms (PC, PlayStation, Xbox, and Nintendo Switch) for titles including *Call of Duty: Black Ops 6*, *Apex Legends*, *Fortnite*, *Valorant*, and *Counter-Strike 2*.

---

## 🚀 Key Features

* **Command Center Dashboard**: Asymmetric bento grid featuring active loadouts, live telemetry pills, ecosystem clone statistics, and game patch announcements.
* **Locker Profiles Manager**: Organize, pin, search, tag, import, and export configurations with quick filters by platform and game engine.
* **Progressive Configuration Wizard**: 3-step setup helper with options to start from game defaults, reusable base templates, or verified pro setups (TenZ, Bugha, Scump, etc.).
* **Companion Checklist Mode**: Mobile-optimized stepper designed to prop up next to your monitor or TV for verifying and applying settings step-by-step.
* **Automated Version History**: Automatic snapshot backups captured prior to any modifications, with diff inspections and one-click rollback.
* **Cross-Engine Sensitivity & DPI Translator**: Converts sensitivity, calculates eDPI, and derives physical rotation distance (cm/360° and in/360°) across all supported game engines, including reverse distance-to-sens mode.
* **Animated Telemetry & Count-Up Engine**: Physics-based ease-out number count-up animations (`AnimatedNumber`) across stats matrices, sensitivity conversions, and locker metrics with zero layout shift.
* **Global Vault Sync & Telemetry Refresh**: Interactive topbar sync action with spinning feedback to recalibrate live metrics and trigger telemetry roll animations on demand.
* **Profile Comparison Matrix**: Side-by-side comparison engine highlighting parameter discrepancies and rendering percentage delta shift charts.
* **Signal Base Community Feed**: Discover, follow creators, preview settings, and clone public community or pro loadouts directly into your personal locker.
* **Guided Config Compiler**: Compiles profiles into native game configuration formats (`.cfg`, `.ini`, `autoexec`) with one-click download, clipboard copy, and printable PDF reference sheets.
* **Patch Alert & Admin Console**: Administrative broadcasting hub to dispatch game patch alerts and balance notifications.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 (TypeScript)
* **Build Tool**: Vite with Progressive Web App support (`vite-plugin-pwa`)
* **Routing**: React Router DOM 7 (`HashRouter` for zero-configuration static and offline hosting)
* **Styling & Design System**: Tailwind CSS 3, PostCSS, custom design tokens, and smooth tactile micro-interactions
* **Data Visualization**: Recharts 3
* **Icons**: Lucide React
* **Visual Effects**: Canvas Confetti
* **Data Layer**: Client-side encrypted `localStorage` persistence with snapshot versioning and Supabase integration

---

## 📂 Project Directory Structure

```text
GearSync/
├── public/                 # PWA icons, manifest, and offline fonts
├── src/
│   ├── assets/             # Brand graphics and media
│   ├── components/         # Reusable presentation components
│   │   ├── layout/         # Application shell (Desktop Rail, Header, Mobile Nav, Command Palette)
│   │   ├── profiles/       # ChecklistMode companion overlay stepper
│   │   ├── ui/             # Design system components (GameArtwork, ProfileCard, Toast, Badges)
│   │   ├── ErrorBoundary.tsx # Catch-all runtime error boundary
│   │   └── index.ts        # Clean components barrel export
│   ├── lib/                # Core business logic & storage
│   │   ├── configCompiler.ts # Raw engine config (.cfg / .ini / autoexec) parser & compiler
│   │   ├── crypto.ts       # WebCrypto AES-GCM data encryption
│   │   ├── gameData.ts     # Engine settings schemas (BO6, Apex, Fortnite, Valorant, CS2)
│   │   ├── sanitize.ts     # Input sanitization
│   │   ├── storage.ts      # Local database layers, version history snapshots, mock seeding
│   │   ├── supabase.ts     # Supabase backend client
│   │   └── index.ts        # Lib barrel export
│   ├── pages/              # Routed feature views
│   │   ├── admin/          # AdminPanel (broadcast patch alerts)
│   │   ├── calculators/    # SensitivityCalculator (DPI, eDPI, cm/360° conversion)
│   │   ├── community/      # Community Signal Base (discover & following feeds)
│   │   ├── compare/        # CompareProfiles (side-by-side delta matrix)
│   │   ├── dashboard/      # Command Center dashboard (featured loadout, bento stats)
│   │   ├── profiles/       # Profiles locker, EditProfile wizard, ProfileView, Templates
│   │   ├── user/           # UserProfile operator settings
│   │   └── index.ts        # Pages barrel export
│   ├── styles/             # Global CSS, design tokens, and typography
│   │   └── index.css
│   ├── types/              # Domain TypeScript interfaces & models
│   │   └── index.ts
│   ├── App.tsx             # Root router & layout integration
│   ├── main.tsx            # Bootstrap entry point
│   └── vite-env.d.ts
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 💾 Storage Database Schema

The client-side database stores user models, custom presets, template structures, and alerts using the `localStorage` API under six distinct keys:

1. **`gs_user`**: Holds the current Operator callsign name, bio, and following UID arrays.
2. **`gs_profiles`**: Holds the `GameProfile` configurations array.
3. **`gs_templates`**: Holds the `SettingsTemplate` list for creating base presets.
4. **`gs_announcements`**: Stores game patch logs and balance notifications.
5. **`gs_notifications`**: Stores real-time in-app alerts and notifications.
6. **`gs_history`**: Captures snapshot entries (`ProfileHistory`) representing state logs before updates are written.

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
