# Fitur Tema Warna Kustom (Theme Color Customization)

## Overview
Fitur ini memungkinkan pengguna untuk mengubah tema warna aplikasi sesuai dengan preferensi mereka. Sistem akan **secara otomatis menyesuaikan warna teks** agar tetap mudah dibaca terlepas dari warna background yang dipilih.

## Fitur Utama

### 1. **8 Tema Preset yang Menarik**
   - Pink Paradise (default)
   - Ocean Blue
   - Forest Green  
   - Sunset Orange
   - Purple Dream
   - Ruby Red
   - Teal Breeze
   - Golden Touch

### 2. **Custom Color Picker**
   - User dapat memilih warna kustom menggunakan color picker
   - Input manual dengan kode HEX (#rrggbb)
   - Tema akan di-generate otomatis dari warna primary yang dipilih

### 3. **Automatic Text Contrast**
   - Menggunakan algoritma WCAG 2.0 untuk menghitung kontras warna
   - Otomatis memilih warna teks (putih atau gelap) yang paling optimal
   - Memastikan rasio kontras minimal 4.5:1 untuk keterbacaan

### 4. **Persistent Storage**
   - Pilihan tema disimpan di localStorage
   - Tema akan tetap diterapkan setelah refresh atau login ulang

### 5. **Real-time Preview**
   - Perubahan warna langsung terlihat di seluruh aplikasi
   - Indikator warna aktif di tombol theme picker

## Cara Menggunakan

1. **Klik icon Palette** di header (sebelah icon Mode Toggle)
2. **Pilih Tema Preset** atau **Buat Warna Kustom**:
   - Untuk preset: Klik salah satu dari 8 tema yang tersedia
   - Untuk kustom: Gunakan color picker atau masukkan kode HEX, lalu klik "Terapkan"
3. Tema akan langsung diterapkan dan disimpan otomatis

## Implementasi Teknis

### File yang Dibuat/Diubah:

1. **`src/store/ui/types.ts`** - Redux types untuk manajemen tema
2. **`src/store/ui/action.ts`** - Action creator untuk set theme
3. **`src/store/ui/reducer.ts`** - Reducer dengan localStorage persistence
4. **`src/lib/theme-utils.ts`** - Utility functions untuk:
   - Perhitungan luminance dan kontras (WCAG 2.0)
   - Generate theme dari primary color
   - Apply theme ke CSS variables
5. **`src/components/common/theme-color-picker.tsx`** - UI component
6. **`src/hooks/useThemeEffect.ts`** - Hook untuk apply theme on mount
7. **`src/App.tsx`** - Integration point
8. **`src/components/layout/layout.tsx`** - Theme picker di header

### Teknologi yang Digunakan:
- **Redux** untuk state management
- **localStorage** untuk persistence
- **CSS Variables** untuk dynamic theming
- **WCAG 2.0 Algorithm** untuk contrast calculation

## Algoritma Kontras Warna

```typescript
// 1. Hitung luminance relatif (0-1)
luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B

// 2. Hitung contrast ratio
ratio = (lighterLuminance + 0.05) / (darkerLuminance + 0.05)

// 3. Pilih warna teks dengan kontras terbaik
textColor = whiteContrast > darkContrast ? "#ffffff" : "#2d1b4e"
```

Algoritma ini memastikan warna teks selalu mudah dibaca dengan rasio kontras minimal 4.5:1 (WCAG AA standard).

## Preview

### Tema Preset
Setiap tema preset memiliki kombinasi warna yang harmonis:
- **Primary**: Warna utama untuk buttons, links, highlights
- **Secondary**: Warna pendukung
- **Accent**: Warna aksen untuk variasi
- **Background**: Warna latar belakang halaman
- **Muted**: Warna untuk elemen subtle/muted

### Custom Theme Generator
Ketika user memilih warna kustom:
1. Primary = warna yang dipilih user
2. Secondary = Primary + 20% lighter
3. Accent = Primary + 40% lighter
4. Background = Primary + 90% lighter
5. Muted = Primary + 70% lighter
6. Text color = Calculated untuk optimal contrast

## Catatan
- Tema disimpan per-browser (localStorage)
- Jika user clear browser data, tema akan kembali ke default (Pink Paradise)
- Tema independent dari dark/light mode toggle
