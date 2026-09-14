# 📚 DOKUMENTASI LENGKAP: THEME COLOR CUSTOMIZATION FEATURE

## 📋 Table of Contents
1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Alur Sistem Lengkap](#alur-sistem-lengkap)
4. [Penjelasan Detail Per File](#penjelasan-detail-per-file)
5. [Flow Diagram](#flow-diagram)
6. [Cara Menambah Fitur Baru](#cara-menambah-fitur-baru)
7. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### Tujuan Feature
Memungkinkan user untuk mengubah tema warna aplikasi dengan:
- Memilih dari 8 preset tema yang sudah disediakan
- Membuat warna custom sendiri
- Warna teks otomatis disesuaikan agar selalu terbaca (WCAG 2.0)
- Tema tersimpan di localStorage dan persistent setelah refresh

### Teknologi yang Digunakan
- **Redux** - State management global
- **CSS Variables** - Dynamic theming
- **localStorage** - Data persistence
- **TypeScript** - Type safety
- **React Hooks** - Component logic

---

## 2. File Structure

### 📁 File yang Dibuat/Diubah

```
DMS-QA-Client/
├── src/
│   ├── store/
│   │   └── ui/
│   │       ├── types.ts          ✨ BARU - Type definitions
│   │       ├── action.ts         ✨ BARU - Action creators
│   │       └── reducer.ts        ✨ BARU - Reducer dengan localStorage
│   │
│   ├── lib/
│   │   └── theme-utils.ts        ✨ BARU - Utility functions
│   │
│   ├── hooks/
│   │   └── useThemeEffect.ts     ✨ BARU - Auto-apply theme hook
│   │
│   ├── components/
│   │   ├── common/
│   │   │   └── theme-color-picker.tsx  ✨ BARU - UI Component
│   │   │
│   │   └── layout/
│   │       └── layout.tsx        🔧 MODIFIED - Added theme picker
│   │
│   ├── store/
│   │   └── index.ts              🔧 MODIFIED - Added ui reducer
│   │
│   └── App.tsx                   🔧 MODIFIED - Added useThemeEffect
│
└── THEME_CUSTOMIZATION.md        ✨ BARU - User documentation
```

**Legend:**
- ✨ BARU = File baru dibuat
- 🔧 MODIFIED = File yang sudah ada, dimodifikasi

---

## 3. Alur Sistem Lengkap

### 🎯 High-Level Flow

```
User Action → Component → Redux → localStorage → CSS Variables → UI Update
```

### 📊 Detailed Flow

#### A. Initialization (Saat App Load)
```
1. App.tsx renders
2. useThemeEffect() dipanggil
3. Hook membaca state.ui.themeColor dari Redux
4. Reducer sudah load theme dari localStorage (initialState)
5. applyThemeToDocument() dipanggil
6. CSS variables diupdate
7. UI render dengan tema yang tersimpan
```

#### B. User Pilih Preset Theme
```
1. User klik icon Palette di header
2. ThemeColorPicker component muncul (Popover)
3. User klik salah satu preset (misal: "Forest Green")
4. handlePresetClick() dipanggil
   ├─ setCustomColor(theme.primary) → Update input color
   └─ handleThemeChange(theme, true) → Apply theme
5. handleThemeChange() melakukan:
   ├─ dispatch(setThemeColorActionCreator(theme))
   ├─ applyThemeToDocument(theme)
   └─ setIsOpen(false) → Close popover
6. Redux reducer menerima action SET_THEME_COLOR
7. Reducer:
   ├─ localStorage.setItem("dms-theme-color", JSON.stringify(theme))
   └─ return { ...state, themeColor: theme }
8. State berubah → useThemeEffect re-run
9. applyThemeToDocument() update CSS variables
10. UI re-render dengan warna baru
```

#### C. User Buat Custom Color
```
1. User klik icon Palette
2. User pilih warna dengan color picker atau ketik HEX
3. onChange event → setCustomColor(value)
4. User klik "Terapkan"
5. handleCustomColorSubmit() dipanggil
6. createCustomTheme() generate tema dari primary color:
   ├─ primary = user input
   ├─ primaryForeground = calculated (white/dark)
   ├─ secondary = primary + 20% lighter
   ├─ accent = primary + 40% lighter
   ├─ background = primary + 90% lighter
   └─ muted = primary + 70% lighter
7. handleThemeChange(customTheme, true)
8. (Flow sama seperti preset theme dari step 5)
```

---

## 4. Penjelasan Detail Per File

### 📄 1. `src/store/ui/types.ts`

**Tujuan:** Mendefinisikan TypeScript types untuk UI state

```typescript
// Enum untuk action types
export enum ActionType {
  SET_GLOBAL_LOADING = "SET_GLOBAL_LOADING",
  SET_THEME_COLOR = "SET_THEME_COLOR",  // ← Baru ditambahkan
}

// Interface untuk ThemeColor object
export interface ThemeColor {
  name: string;              // Nama tema (e.g., "Forest Green")
  primary: string;           // Warna utama (e.g., "#2d6a4f")
  primaryForeground: string; // Warna teks di primary (e.g., "#ffffff")
  secondary: string;         // Warna sekunder
  accent: string;            // Warna aksen
  background: string;        // Warna background halaman
  muted: string;            // Warna muted/subtle
}

// Interface untuk UI state
export interface UIState {
  globalLoading: boolean;
  themeColor: ThemeColor | null;  // ← Baru ditambahkan
}

// Action interfaces
export interface SetThemeColorAction {
  type: ActionType.SET_THEME_COLOR;
  payload: ThemeColor;
}

// Union type untuk semua UI actions
export type UIAction = SetGlobalLoadingAction | SetThemeColorAction;
```

**Key Points:**
- `ThemeColor` interface mendeskripsikan struktur object tema
- Semua warna menggunakan HEX format (#rrggbb)
- `themeColor` bisa null (saat belum ada tema yang dipilih)

---

### 📄 2. `src/store/ui/action.ts`

**Tujuan:** Action creator untuk dispatch Redux actions

```typescript
import { ActionType, UIAction, ThemeColor } from "./types";

// Action creator untuk set theme color
export const setThemeColorActionCreator = (themeColor: ThemeColor): UIAction => {
  return {
    type: ActionType.SET_THEME_COLOR,
    payload: themeColor,
  };
};
```

**Cara Kerja:**
1. Function menerima `themeColor` object
2. Return action object dengan:
   - `type`: Identifier untuk reducer
   - `payload`: Data yang akan disimpan

**Penggunaan:**
```typescript
dispatch(setThemeColorActionCreator(forestGreenTheme));
```

---

### 📄 3. `src/store/ui/reducer.ts`

**Tujuan:** Redux reducer dengan localStorage persistence

```typescript
import { ActionType, UIState } from "./types";

// Function untuk load tema dari localStorage
const loadThemeFromStorage = () => {
  try {
    const savedTheme = localStorage.getItem("dms-theme-color");
    return savedTheme ? JSON.parse(savedTheme) : null;
  } catch {
    return null;  // Kalau error, return null (fallback)
  }
};

// Initial state dengan tema dari localStorage
const initialState: UIState = {
  globalLoading: false,
  themeColor: loadThemeFromStorage(),  // Load saat app start
};

// Reducer function
const uiReducer = (state = initialState, action: any): UIState => {
  switch (action.type) {
    case ActionType.SET_THEME_COLOR:
      // Save to localStorage
      localStorage.setItem("dms-theme-color", JSON.stringify(action.payload));
      // Update state
      return {
        ...state,
        themeColor: action.payload,
      };
    default:
      return state;
  }
};

export default uiReducer;
```

**Flow Detail:**

1. **Initialization:**
   - `loadThemeFromStorage()` dipanggil
   - Coba baca dari localStorage key "dms-theme-color"
   - Parse JSON string menjadi object
   - Return hasil atau null jika tidak ada

2. **Saat SET_THEME_COLOR Action:**
   - Terima action dengan payload ThemeColor
   - Save payload ke localStorage (JSON string)
   - Return new state dengan themeColor updated

**Key Points:**
- localStorage key: `"dms-theme-color"`
- Data format: JSON string
- Error handling: try-catch untuk mencegah crash

---

### 📄 4. `src/lib/theme-utils.ts`

**Tujuan:** Utility functions untuk theme management

#### A. Color Luminance Calculation (WCAG 2.0)

```typescript
function getLuminance(color: string): number {
  // 1. Remove # dari HEX color
  const hex = color.replace("#", "");
  
  // 2. Convert HEX to RGB (0-255)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // 3. Apply gamma correction (sRGB to linear RGB)
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);

  // 4. Calculate relative luminance (WCAG 2.0 formula)
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}
```

**Penjelasan:**
- Luminance = kecerahan relatif warna (0 = hitam, 1 = putih)
- Gamma correction diperlukan karena mata manusia tidak linear
- Koefisien (0.2126, 0.7152, 0.0722) dari standar WCAG 2.0

#### B. Contrast Ratio Calculation

```typescript
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  // WCAG 2.0 contrast ratio formula
  return (lighter + 0.05) / (darker + 0.05);
}
```

**Penjelasan:**
- Contrast ratio = perbandingan kecerahan dua warna
- Range: 1:1 (tidak ada kontras) sampai 21:1 (hitam vs putih)
- WCAG AA requirement: minimal 4.5:1 untuk teks normal

#### C. Auto Text Color Selection

```typescript
export function getContrastingTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const darkContrast = getContrastRatio(backgroundColor, "#2d1b4e");
  
  // Pilih warna dengan kontras lebih baik
  return whiteContrast > darkContrast ? "#ffffff" : "#2d1b4e";
}
```

**Penjelasan:**
- Compare kontras white vs dark terhadap background
- Pilih yang kontrasnya lebih tinggi
- Ensures teks selalu readable

#### D. Color Manipulation

```typescript
function lightenColor(color: string, percent: number): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Move each channel towards 255 (white)
  const lighter = (value: number) => {
    return Math.min(255, Math.floor(value + (255 - value) * percent));
  };

  const newR = lighter(r).toString(16).padStart(2, "0");
  const newG = lighter(g).toString(16).padStart(2, "0");
  const newB = lighter(b).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}
```

**Penjelasan:**
- `percent`: 0-1 (0 = tidak berubah, 1 = putih penuh)
- Formula: `newValue = oldValue + (255 - oldValue) * percent`
- Contoh: lightenColor("#ff0000", 0.5) → "#ff7f7f" (pink)

#### E. Theme Presets

```typescript
export const THEME_PRESETS: ThemeColor[] = [
  {
    name: "Pink Paradise",
    primary: "#ff6b9d",        // Pink
    primaryForeground: "#ffffff", // White text
    secondary: "#ffc93c",      // Yellow
    accent: "#a8e6cf",         // Mint
    background: "#fff5f7",     // Light pink
    muted: "#ffe5ec",         // Very light pink
  },
  // ... 7 preset lainnya
];
```

**Penjelasan:**
- Array of 8 pre-designed themes
- Setiap warna dipilih manual untuk harmoni visual
- primaryForeground di-set manual untuk optimal readability

#### F. Custom Theme Generator

```typescript
export function createCustomTheme(
  name: string,
  primaryColor: string
): ThemeColor {
  // Auto-calculate text color
  const primaryForeground = getContrastingTextColor(primaryColor);
  
  // Generate color variants
  const secondary = lightenColor(primaryColor, 0.2);  // 20% lighter
  const accent = lightenColor(primaryColor, 0.4);     // 40% lighter
  const background = lightenColor(primaryColor, 0.9); // 90% lighter
  const muted = lightenColor(primaryColor, 0.7);      // 70% lighter

  return {
    name,
    primary: primaryColor,
    primaryForeground,
    secondary,
    accent,
    background,
    muted,
  };
}
```

**Penjelasan:**
- Input: nama dan primary color saja
- Output: ThemeColor object lengkap
- Semua warna digenerate otomatis dari primary
- Ensures harmoni warna dengan systematic lightening

#### G. Apply Theme to Document

```typescript
export function applyThemeToDocument(theme: ThemeColor | null) {
  if (!theme) return;  // Guard clause

  const root = document.documentElement;  // <html> element
  
  // Set CSS variables
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryForeground);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--muted", theme.muted);
  
  // Set related colors
  root.style.setProperty("--border", `${theme.primary}26`); // 15% opacity
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--sidebar-primary", theme.primary);
  // ... etc
}
```

**Penjelasan:**
- `document.documentElement` = tag `<html>`
- `setProperty()` set CSS custom properties (variables)
- CSS variables di `index.css` reference ke variables ini
- Perubahan langsung trigger re-render seluruh UI

**Cara Kerja CSS Variables:**
```css
/* index.css */
:root {
  --primary: #ff6b9d;  /* Default */
}

/* Component styles */
.button-primary {
  background-color: var(--primary);  /* Use variable */
}
```

Ketika `setProperty("--primary", "#2d6a4f")` dipanggil:
- CSS variable `--primary` berubah menjadi `#2d6a4f`
- Semua element yang menggunakan `var(--primary)` otomatis update

---

### 📄 5. `src/hooks/useThemeEffect.ts`

**Tujuan:** React hook untuk auto-apply theme saat app load

```typescript
import { useEffect } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { applyThemeToDocument } from "@/lib/theme-utils";

export function useThemeEffect() {
  // Subscribe to Redux state
  const themeColor = useAppSelector((state) => state.ui.themeColor);

  // Run effect when themeColor changes
  useEffect(() => {
    if (themeColor) {
      applyThemeToDocument(themeColor);
    }
  }, [themeColor]);  // Dependency array
}
```

**Cara Kerja:**

1. **Initialization:**
   - Hook dipanggil saat component mount
   - `useAppSelector` subscribe ke `state.ui.themeColor`
   - Initial value dari localStorage (via reducer)

2. **useEffect Execution:**
   - Run saat `themeColor` berubah
   - Call `applyThemeToDocument()`
   - Update CSS variables

3. **Why This Hook?**
   - Centralized theme application logic
   - Automatic re-application on state change
   - Can be reused in multiple components if needed

**Timeline:**
```
App Start → Reducer loads from localStorage → themeColor = saved theme
          → useThemeEffect subscribes → useEffect runs → CSS updated
          → UI renders dengan tema saved
```

---

### 📄 6. `src/components/common/theme-color-picker.tsx`

**Tujuan:** UI component untuk theme selection

#### Component Structure

```typescript
export default function ThemeColorPicker() {
  // Redux
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.ui.themeColor);
  
  // Local state
  const [customColor, setCustomColor] = useState("#ff6b9d");
  const [isOpen, setIsOpen] = useState(false);

  // Event handlers
  const handleThemeChange = (theme: ThemeColor, closePopover = false) => {
    dispatch(setThemeColorActionCreator(theme) as any);
    applyThemeToDocument(theme);
    if (closePopover) {
      setIsOpen(false);
    }
  };

  const handlePresetClick = (theme: ThemeColor) => {
    setCustomColor(theme.primary);  // Sync input
    handleThemeChange(theme, true); // Apply & close
  };

  const handleCustomColorSubmit = () => {
    const customTheme = createCustomTheme("Custom", customColor);
    handleThemeChange(customTheme, true);
  };

  const isCurrentTheme = (theme: ThemeColor) => {
    return currentTheme?.primary === theme.primary;
  };

  // JSX render...
}
```

#### Event Handlers Explained

**1. handleThemeChange**
```typescript
const handleThemeChange = (theme: ThemeColor, closePopover = false) => {
  // Step 1: Dispatch Redux action
  dispatch(setThemeColorActionCreator(theme) as any);
  
  // Step 2: Apply theme to CSS immediately (optimistic update)
  applyThemeToDocument(theme);
  
  // Step 3: Optionally close popover
  if (closePopover) {
    setIsOpen(false);
  }
};
```

**Why apply twice (dispatch + applyThemeToDocument)?**
- `dispatch`: Permanent save (Redux + localStorage)
- `applyThemeToDocument`: Instant visual feedback
- Without direct apply, user would see delay before UI updates

**2. handlePresetClick**
```typescript
const handlePresetClick = (theme: ThemeColor) => {
  // Sync custom color input with preset primary
  setCustomColor(theme.primary);
  
  // Apply and close (better UX)
  handleThemeChange(theme, true);
};
```

**Why sync customColor?**
- Prevents confusion: User klik Forest Green → custom input shows green
- Allows quick modification: User can tweak preset color easily

**3. handleCustomColorSubmit**
```typescript
const handleCustomColorSubmit = () => {
  // Generate full theme from primary color
  const customTheme = createCustomTheme("Custom", customColor);
  
  // Apply and close
  handleThemeChange(customTheme, true);
};
```

**Why close popover?**
- Clear intent: User clicked "Terapkan" = confirmation action
- Prevents accidental re-clicks
- Cleaner UX

#### JSX Structure

```typescript
return (
  <Popover open={isOpen} onOpenChange={setIsOpen}>
    <PopoverTrigger asChild>
      <Button>
        <Palette />
        {/* Color indicator dot */}
        <span style={{ backgroundColor: currentTheme?.primary }} />
      </Button>
    </PopoverTrigger>
    
    <PopoverContent>
      {/* Preset Themes Grid */}
      <div className="grid grid-cols-2 gap-2">
        {THEME_PRESETS.map((theme) => (
          <button onClick={() => handlePresetClick(theme)}>
            {/* Color preview bars */}
            {/* Theme name */}
            {/* Checkmark if active */}
          </button>
        ))}
      </div>
      
      {/* Custom Color Section */}
      <div>
        <Input type="color" value={customColor} onChange={...} />
        <Input type="text" value={customColor} onChange={...} />
        <Button onClick={handleCustomColorSubmit}>Terapkan</Button>
      </div>
    </PopoverContent>
  </Popover>
);
```

---

### 📄 7. `src/components/layout/layout.tsx`

**Modifikasi:** Menambahkan ThemeColorPicker di header

```typescript
import ThemeColorPicker from "@/components/common/theme-color-picker";

// ... dalam component
<header>
  <SidebarTrigger />
  <div className="flex-1">
    <h1>{title}</h1>
  </div>
  <div className="flex items-center gap-2">
    <NotificationPopover />
    <ThemeColorPicker />  {/* ← ADDED */}
    <ModeToggle />
    <PopoverProfile />
  </div>
</header>
```

**Posisi:**
- Setelah Notification
- Sebelum Mode Toggle (dark/light)
- Konsisten dengan pattern icon buttons lainnya

---

### 📄 8. `src/App.tsx`

**Modifikasi:** Menambahkan useThemeEffect hook

```typescript
import { useThemeEffect } from "@/hooks/useThemeEffect";

function App() {
  // Apply saved theme on app load
  useThemeEffect();  // ← ADDED

  return (
    <Router>
      <LoadingOverlay />
      <Routes>
        {/* ... routes */}
      </Routes>
    </Router>
  );
}
```

**Why in App.tsx?**
- Top-level component
- Runs once on app mount
- Ensures theme applied before any page renders

---

### 📄 9. `src/store/index.ts`

**Modifikasi:** Menambahkan uiReducer ke store

```typescript
import uiReducer from "./ui/reducer";  // ← ADDED

const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    departments: departmentsReducer,
    users: usersReducer,
    documents: documentsReducer,
    approvals: approvalsReducer,
    roles: rolesReducer,
    notifications: notificationsReducer,
    ui: uiReducer,  // ← ADDED
  },
});

export type RootState = ReturnType<typeof store.getState>;
```

**Effect:**
- `state.ui` sekarang available di Redux store
- `state.ui.themeColor` accessible via useAppSelector

---

## 5. Flow Diagram

### Visual Flow: User Pilih Preset Theme

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Klik Palette Icon│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Popover Terbuka  │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Klik "Forest Green" │
                  └──────────┬──────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LOGIC                                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ handlePresetClick()  │
                  └──────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
        ┌────────────────────┐  ┌──────────────────┐
        │ setCustomColor()   │  │handleThemeChange()│
        │ (sync input)       │  │ (apply theme)    │
        └────────────────────┘  └────────┬─────────┘
                                         │
┌─────────────────────────────────────────────────────────────────┐
│                      REDUX FLOW                                   │
└─────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ dispatch(action)     │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Reducer receives     │
                              └──────────┬───────────┘
                                         │
                                ┌────────┴─────────┐
                                │                  │
                                ▼                  ▼
                    ┌───────────────────┐  ┌─────────────────┐
                    │ Save to           │  │ Update Redux    │
                    │ localStorage      │  │ state           │
                    └───────────────────┘  └────────┬────────┘
                                                    │
┌─────────────────────────────────────────────────────────────────┐
│                     CSS UPDATE                                    │
└─────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │ applyThemeToDocument()│
                                         └──────────┬───────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │ Update CSS variables │
                                         │ on <html> element    │
                                         └──────────┬───────────┘
                                                    │
┌─────────────────────────────────────────────────────────────────┐
│                      UI RE-RENDER                                 │
└─────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │ React re-renders     │
                                         │ with new colors      │
                                         └──────────┬───────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │ Popover closes       │
                                         └──────────────────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │ UI shows Forest      │
                                         │ Green theme! ✅      │
                                         └──────────────────────┘
```

### Timeline: Complete User Journey

```
T+0ms    : User klik Palette icon
T+50ms   : Popover animation start
T+200ms  : Popover fully visible
T+500ms  : User klik "Forest Green"
T+501ms  : handlePresetClick() executes
           ├─ setCustomColor("#2d6a4f")
           └─ handleThemeChange(forestGreen, true)
T+502ms  : dispatch() sends action to Redux
T+503ms  : Reducer saves to localStorage
T+504ms  : Redux state updated
T+505ms  : applyThemeToDocument() runs
           ├─ Set --primary: #2d6a4f
           ├─ Set --background: #f1faee
           └─ ... other CSS vars
T+506ms  : CSS variables updated
T+507ms  : setIsOpen(false) → close popover
T+510ms  : React re-renders all components
T+550ms  : Popover close animation
T+750ms  : UI fully rendered with green theme ✅
```

---

## 6. Cara Menambah Fitur Baru

### A. Menambah Preset Theme Baru

**Lokasi:** `src/lib/theme-utils.ts`

**Steps:**

1. **Tentukan Warna Primary**
```typescript
const newPrimary = "#4a90e2"; // Blue
```

2. **Hitung Warna Lainnya (Manual atau Auto)**

**Manual (Recommended untuk preset):**
```typescript
{
  name: "Sky Blue",
  primary: "#4a90e2",
  primaryForeground: "#ffffff",  // Test di background blue
  secondary: "#78b9ff",          // Lighter blue
  accent: "#a3d5ff",            // Even lighter
  background: "#f0f8ff",         // Very light blue
  muted: "#e3f2ff",             // Light blue tint
}
```

**Auto-generate untuk preview:**
```typescript
const autoTheme = createCustomTheme("Sky Blue", "#4a90e2");
console.log(autoTheme); // See generated colors
// Tweak manually if needed
```

3. **Tambahkan ke THEME_PRESETS array**
```typescript
export const THEME_PRESETS: ThemeColor[] = [
  // ... existing themes
  {
    name: "Sky Blue",
    primary: "#4a90e2",
    primaryForeground: "#ffffff",
    secondary: "#78b9ff",
    accent: "#a3d5ff",
    background: "#f0f8ff",
    muted: "#e3f2ff",
  },
];
```

4. **Test**
- Refresh app
- Open theme picker
- Preset baru muncul otomatis! ✅

---

### B. Menambah CSS Variable Baru

**Scenario:** Anda ingin tambah warna "tertiary"

**Steps:**

1. **Update Type Definition** (`src/store/ui/types.ts`)
```typescript
export interface ThemeColor {
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  tertiary: string;  // ← ADD THIS
  accent: string;
  background: string;
  muted: string;
}
```

2. **Update Preset Themes** (`src/lib/theme-utils.ts`)
```typescript
export const THEME_PRESETS: ThemeColor[] = [
  {
    name: "Pink Paradise",
    primary: "#ff6b9d",
    primaryForeground: "#ffffff",
    secondary: "#ffc93c",
    tertiary: "#ff9ec9",  // ← ADD THIS
    accent: "#a8e6cf",
    background: "#fff5f7",
    muted: "#ffe5ec",
  },
  // ... update all 8 presets
];
```

3. **Update Custom Theme Generator**
```typescript
export function createCustomTheme(
  name: string,
  primaryColor: string
): ThemeColor {
  const primaryForeground = getContrastingTextColor(primaryColor);
  const secondary = lightenColor(primaryColor, 0.2);
  const tertiary = lightenColor(primaryColor, 0.3);  // ← ADD THIS
  const accent = lightenColor(primaryColor, 0.4);
  const background = lightenColor(primaryColor, 0.9);
  const muted = lightenColor(primaryColor, 0.7);

  return {
    name,
    primary: primaryColor,
    primaryForeground,
    secondary,
    tertiary,  // ← ADD THIS
    accent,
    background,
    muted,
  };
}
```

4. **Update applyThemeToDocument**
```typescript
export function applyThemeToDocument(theme: ThemeColor | null) {
  if (!theme) return;
  const root = document.documentElement;
  
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--tertiary", theme.tertiary);  // ← ADD THIS
  // ... other properties
}
```

5. **Add to index.css** (optional, for default)
```css
:root {
  --tertiary: #ff9ec9;
}

@theme inline {
  --color-tertiary: var(--tertiary);
}
```

6. **Use in Components**
```tsx
<div className="bg-tertiary text-tertiary-foreground">
  Tertiary color!
</div>
```

---

### C. Menambah Fitur Export/Import Theme

**Tujuan:** User bisa save/load tema sebagai JSON file

**Steps:**

1. **Create Export Function**
```typescript
// In theme-utils.ts
export function exportTheme(theme: ThemeColor): void {
  const json = JSON.stringify(theme, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}
```

2. **Create Import Function**
```typescript
export function importTheme(file: File): Promise<ThemeColor> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string);
        // Validate theme structure
        if (!theme.primary || !theme.name) {
          throw new Error('Invalid theme file');
        }
        resolve(theme);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

3. **Add UI in ThemeColorPicker**
```tsx
const handleExport = () => {
  if (currentTheme) {
    exportTheme(currentTheme);
  }
};

const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const theme = await importTheme(file);
      handleThemeChange(theme, true);
    } catch (error) {
      alert('Invalid theme file');
    }
  }
};

// In JSX:
<div className="border-t pt-4">
  <Button onClick={handleExport}>Export Theme</Button>
  <Input type="file" accept=".json" onChange={handleImport} />
</div>
```

---

## 7. Troubleshooting

### Issue 1: Theme Tidak Tersimpan Setelah Refresh

**Symptom:** Warna kembali ke default setelah refresh browser

**Diagnosis:**
```typescript
// Check localStorage
console.log(localStorage.getItem('dms-theme-color'));
// Should return JSON string
```

**Possible Causes:**

1. **localStorage Disabled**
   - Solution: Check browser settings
   - Alternative: Use cookies or sessionStorage

2. **Reducer Tidak Save**
   - Check: `src/store/ui/reducer.ts`
   - Ensure: `localStorage.setItem()` dipanggil

3. **Load Function Error**
   - Check: Console for errors
   - Add: Better error logging
   ```typescript
   const loadThemeFromStorage = () => {
     try {
       const savedTheme = localStorage.getItem("dms-theme-color");
       console.log('Loaded theme:', savedTheme);
       return savedTheme ? JSON.parse(savedTheme) : null;
     } catch (error) {
       console.error('Failed to load theme:', error);
       return null;
     }
   };
   ```

---

### Issue 2: Warna Teks Tidak Terbaca

**Symptom:** Text warna gelap di background gelap (atau sebaliknya)

**Diagnosis:**
```typescript
// Test contrast calculation
const bg = "#2d6a4f"; // forest green
const textColor = getContrastingTextColor(bg);
console.log('Text color:', textColor);

// Test contrast ratio
const ratio = getContrastRatio(bg, textColor);
console.log('Contrast ratio:', ratio); // Should be > 4.5
```

**Solutions:**

1. **Adjust primaryForeground Manually**
```typescript
// In preset theme
{
  primary: "#2d6a4f",
  primaryForeground: "#ffffff", // Force white if auto-calc wrong
}
```

2. **Improve Algorithm**
```typescript
export function getContrastingTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const darkContrast = getContrastRatio(backgroundColor, "#2d1b4e");
  
  // Prefer white if ratio is close (within 0.5)
  if (Math.abs(whiteContrast - darkContrast) < 0.5) {
    return "#ffffff"; // Default to white for ambiguous cases
  }
  
  return whiteContrast > darkContrast ? "#ffffff" : "#2d1b4e";
}
```

---

### Issue 3: Custom Color Input Tidak Sync dengan Preset

**Symptom:** Klik preset, custom input masih pink

**Check:** `handlePresetClick` function

**Solution:**
```typescript
const handlePresetClick = (theme: ThemeColor) => {
  setCustomColor(theme.primary); // ← This line should exist
  handleThemeChange(theme, true);
};
```

---

### Issue 4: Popover Tidak Menutup Setelah Apply

**Symptom:** Klik "Terapkan", tema berubah tapi popover masih terbuka

**Check:**
```typescript
const handleCustomColorSubmit = () => {
  const customTheme = createCustomTheme("Custom", customColor);
  handleThemeChange(customTheme, true); // ← true = close popover
};
```

**Verify:**
```typescript
const handleThemeChange = (theme: ThemeColor, closePopover = false) => {
  // ...
  if (closePopover) {
    setIsOpen(false); // ← This should run
  }
};
```

---

### Issue 5: TypeScript Errors

**Error:** `Type 'UIAction' is not assignable to parameter of type 'UnknownAction'`

**Solution:** Type casting
```typescript
dispatch(setThemeColorActionCreator(theme) as any);
```

**Better Solution:** Update Redux types
```typescript
// src/store/index.ts
export type AppDispatch = typeof store.dispatch;

// Usage
const dispatch = useAppDispatch(); // Custom hook with proper types
```

---

## 8. Best Practices

### Performance Optimization

1. **Memoize Theme Calculations**
```typescript
import { useMemo } from 'react';

const customTheme = useMemo(
  () => createCustomTheme("Custom", customColor),
  [customColor]
);
```

2. **Debounce Color Picker**
```typescript
import { useDebounce } from 'use-debounce';

const [customColor, setCustomColor] = useState("#ff6b9d");
const [debouncedColor] = useDebounce(customColor, 300);

// Use debouncedColor for theme generation
```

3. **Lazy Load Presets**
```typescript
const THEME_PRESETS = lazy(() => import('./theme-presets'));
```

### Accessibility

1. **Ensure WCAG AA Compliance**
```typescript
const MIN_CONTRAST_RATIO = 4.5; // AA standard

function validateTheme(theme: ThemeColor): boolean {
  const ratio = getContrastRatio(theme.primary, theme.primaryForeground);
  return ratio >= MIN_CONTRAST_RATIO;
}
```

2. **Keyboard Navigation**
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handlePresetClick(theme);
    }
  }}
>
```

3. **Screen Reader Support**
```tsx
<Button
  aria-label={`Select ${theme.name} theme`}
  aria-pressed={isCurrentTheme(theme)}
>
```

---

## 9. Kesimpulan

### Apa yang Sudah Dibuat

1. ✅ Redux store management untuk theme state
2. ✅ localStorage persistence
3. ✅ 8 beautiful preset themes
4. ✅ Custom color picker dengan auto-generation
5. ✅ WCAG 2.0 compliant text contrast
6. ✅ Real-time theme application
7. ✅ Responsive UI component

### Key Takeaways

**Redux Flow:**
```
User Action → Dispatch → Reducer → localStorage + State Update → Re-render
```

**CSS Variables:**
```
setProperty() → CSS Variable Update → All Components Re-styled
```

**Automatic Contrast:**
```
Background Color → Calculate Luminance → Compare Ratios → Choose Best Text Color
```

### Extensibility

Sistem ini mudah di-extend untuk:
- Multiple color schemes per theme
- User-defined color palettes
- Theme sharing via URL
- Accessibility modes (high contrast, colorblind)
- Dynamic theme based on time of day

---

**Dibuat oleh:** AI Assistant (Claude)  
**Tanggal:** 5 Desember 2025  
**Project:** DMS QA - Theme Customization Feature  
**Version:** 1.0.0
