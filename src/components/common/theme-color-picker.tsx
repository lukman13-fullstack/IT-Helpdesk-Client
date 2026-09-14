import { useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setThemeColorActionCreator } from "@/store/ui/action";
import { THEME_PRESETS, createCustomTheme, applyThemeToDocument } from "@/lib/theme-utils";
import type { ThemeColor } from "@/store/ui/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeColorPicker() {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.ui.themeColor);
  const [customColor, setCustomColor] = useState("#ff6b9d");
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: ThemeColor, closePopover = false) => {
    dispatch(setThemeColorActionCreator(theme) as any);
    applyThemeToDocument(theme);
    if (closePopover) {
      setIsOpen(false);
    }
  };

  const handlePresetClick = (theme: ThemeColor) => {
    // Update custom color input to match preset primary color
    setCustomColor(theme.primary);
    // Apply theme and close popover
    handleThemeChange(theme, true);
  };

  const handleCustomColorSubmit = () => {
    const customTheme = createCustomTheme("Custom", customColor);
    handleThemeChange(customTheme, true); // Close popover after applying
  };

  const isCurrentTheme = (theme: ThemeColor) => {
    return currentTheme?.primary === theme.primary;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-primary/10 transition-all"
          title="Ubah Tema Warna"
        >
          <Palette className="h-4 w-4" />
          <span
            className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background"
            style={{ backgroundColor: currentTheme?.primary || "#ff6b9d" }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold leading-none">Pilih Tema Warna</h4>
            <p className="text-sm text-muted-foreground">
              Personalisasi tampilan aplikasi sesuai selera Anda
            </p>
          </div>

          {/* Preset Themes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tema Preset</Label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handlePresetClick(theme)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all hover:scale-105",
                    isCurrentTheme(theme)
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-primary/20"
                  )}
                  style={{ backgroundColor: theme.muted }}
                >
                  <div className="flex gap-1">
                    <div
                      className="h-6 w-2 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div
                      className="h-6 w-2 rounded-full"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div
                      className="h-6 w-2 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-medium"
                      style={{
                        color: theme.primaryForeground === "#ffffff" 
                          ? theme.primary 
                          : theme.primaryForeground,
                      }}
                    >
                      {theme.name}
                    </p>
                  </div>
                  {isCurrentTheme(theme) && (
                    <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-xs text-muted-foreground">Warna Kustom</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-10 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#ff6b9d"
                className="flex-1"
                maxLength={7}
              />
              <Button
                onClick={handleCustomColorSubmit}
                size="sm"
                className="px-3"
              >
                Terapkan
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Warna teks akan otomatis disesuaikan untuk keterbacaan optimal
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
