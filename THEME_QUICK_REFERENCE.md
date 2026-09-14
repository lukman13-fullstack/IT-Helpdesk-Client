# 📝 Quick Reference: Theme Customization

## File yang Dibuat/Diubah

### ✨ File Baru
```
src/store/ui/types.ts              - Type definitions untuk theme
src/store/ui/action.ts             - Redux action creators
src/store/ui/reducer.ts            - Redux reducer + localStorage
src/lib/theme-utils.ts             - Utility functions (WCAG, color calc)
src/hooks/useThemeEffect.ts        - Hook untuk auto-apply theme
src/components/common/theme-color-picker.tsx - UI component
```

### 🔧 File Dimodifikasi
```
src/store/index.ts                 - Added uiReducer
src/components/layout/layout.tsx   - Added <ThemeColorPicker />
src/App.tsx                        - Added useThemeEffect()
```

---

## Ringkasan Alur Sistem

### Saat App Start
```
1. reducer.ts → loadThemeFromStorage() dari localStorage
2. App.tsx → useThemeEffect() dipanggil
3. useThemeEffect → applyThemeToDocument()
4. CSS variables di-update
5. UI render dengan tema saved
```

### Saat User Pilih Preset
```
1. User klik preset (misal: Forest Green)
2. handlePresetClick(theme) dipanggil
3. setCustomColor(theme.primary) → sync input
4. dispatch(action) → Redux
5. reducer → save ke localStorage
6. applyThemeToDocument() → update CSS
7. setIsOpen(false) → close popover
8. UI re-render dengan warna baru
```

### Saat User Buat Custom Color
```
1. User pilih warna / ketik HEX
2. onChange → setCustomColor(value)
3. User klik "Terapkan"
4. createCustomTheme() → generate full theme
5. (Flow sama seperti preset dari step 4)
```

---

## Komponen Utama

### 1. Redux Store (`src/store/ui/`)

**types.ts**
```typescript
interface ThemeColor {
  name: string;
  primary: string;           // Warna utama
  primaryForeground: string; // Warna teks di primary
  secondary: string;         // Warna pendukung
  accent: string;           // Warna aksen
  background: string;       // Background halaman
  muted: string;           // Warna subtle
}
```

**reducer.ts**
- Load theme dari localStorage saat init
- Save theme ke localStorage saat SET_THEME_COLOR
- localStorage key: `"dms-theme-color"`

### 2. Theme Utils (`src/lib/theme-utils.ts`)

**Key Functions:**
```typescript
getLuminance(color)              // Hitung kecerahan warna (0-1)
getContrastRatio(c1, c2)        // Hitung ratio kontras
getContrastingTextColor(bg)     // Auto pilih white/dark
lightenColor(color, percent)    // Bikin warna lebih terang
createCustomTheme(name, color)  // Generate tema dari 1 warna
applyThemeToDocument(theme)     // Apply ke CSS variables
```

**THEME_PRESETS:**
- 8 preset themes siap pakai
- Manual color selection untuk optimal harmony

### 3. Theme Color Picker Component

**Event Handlers:**
```typescript
handlePresetClick(theme)
  → setCustomColor(theme.primary)  // Sync input
  → handleThemeChange(theme, true) // Apply & close

handleCustomColorSubmit()
  → createCustomTheme("Custom", customColor)
  → handleThemeChange(customTheme, true)

handleThemeChange(theme, closePopover)
  → dispatch(action)              // Redux
  → applyThemeToDocument(theme)   // CSS
  → if(closePopover) setIsOpen(false)
```

---

## Cara Menambah Preset Baru

**Lokasi:** `src/lib/theme-utils.ts`

```typescript
export const THEME_PRESETS: ThemeColor[] = [
  // Existing themes...
  {
    name: "Nama Tema Baru",
    primary: "#xxxxxx",        // Warna utama
    primaryForeground: "#ffffff", // atau "#2d1b4e"
    secondary: "#xxxxxx",       // Lighter variant
    accent: "#xxxxxx",          // Even lighter
    background: "#xxxxxx",      // Very light background
    muted: "#xxxxxx",          // Subtle tint
  },
];
```

**Tips:**
1. Pilih primary color dulu
2. Test di background: dark → white text, light → dark text
3. Generate variants: use `lightenColor()` atau manual
4. Test contrast: `getContrastRatio(primary, primaryForeground) >= 4.5`

---

## Troubleshooting Cepat

### Tema Tidak Tersimpan
```typescript
// Check localStorage
console.log(localStorage.getItem('dms-theme-color'));

// If null, check reducer:
localStorage.setItem()  // Pastikan dipanggil
```

### Teks Tidak Terbaca
```typescript
// Manual override primaryForeground
{
  primary: "#2d6a4f",
  primaryForeground: "#ffffff", // Force white
}
```

### Popover Tidak Close
```typescript
// Pastikan parameter true
handleThemeChange(theme, true); // ← harus true
```

---

## CSS Variables Reference

**Set by applyThemeToDocument():**
```css
--primary                      /* Main color */
--primary-foreground          /* Text on primary */
--secondary                   /* Secondary color */
--accent                      /* Accent color */
--background                  /* Page background */
--muted                       /* Muted color */
--border                      /* Border (primary + 15% opacity) */
--ring                        /* Focus ring */
--sidebar-primary             /* Sidebar colors */
--sidebar-primary-foreground
```

**Usage dalam Component:**
```tsx
<div className="bg-primary text-primary-foreground">
  Button
</div>
```

---

## Kode Penting untuk Dipahami

### 1. WCAG Contrast Calculation
```typescript
// Menghitung apakah teks readable
const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
const ratio = (lighter + 0.05) / (darker + 0.05);
// WCAG AA: ratio >= 4.5 untuk normal text
```

### 2. localStorage Persistence
```typescript
// Save
localStorage.setItem("dms-theme-color", JSON.stringify(theme));

// Load
const saved = localStorage.getItem("dms-theme-color");
const theme = saved ? JSON.parse(saved) : null;
```

### 3. CSS Variable Update
```typescript
document.documentElement.style.setProperty("--primary", "#2d6a4f");
// Semua element dengan var(--primary) langsung update!
```

---

## Best Practices

1. **Selalu validasi input warna:**
   ```typescript
   if (!/^#[0-9A-F]{6}$/i.test(color)) {
     return; // Invalid HEX
   }
   ```

2. **Gunakan memoization untuk performance:**
   ```typescript
   const theme = useMemo(() => 
     createCustomTheme("Custom", color), 
     [color]
   );
   ```

3. **Test contrast sebelum save preset:**
   ```typescript
   const ratio = getContrastRatio(primary, foreground);
   assert(ratio >= 4.5, "Contrast too low!");
   ```

---

## Cheat Sheet

### Tambah Preset
1. Edit `theme-utils.ts`
2. Tambah object di `THEME_PRESETS`
3. Save & refresh → preset muncul otomatis

### Ubah Default Color
1. Edit `index.css`
2. Ubah value di `:root { --primary: ... }`

### Export Current Theme
```typescript
// Get current theme
const theme = store.getState().ui.themeColor;
console.log(JSON.stringify(theme, null, 2));
// Copy JSON untuk reuse
```

### Debug Theme
```typescript
// See active theme
console.log(store.getState().ui.themeColor);

// See CSS variable
getComputedStyle(document.documentElement)
  .getPropertyValue('--primary');
```

---

**Quick Links:**
- Full Documentation: `THEME_DOCUMENTATION_TECHNICAL.md`
- User Guide: `THEME_CUSTOMIZATION.md`
