import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";
import { applyThemeToDocument } from "@/lib/theme-utils";

export function useThemeEffect() {
  const themeColor = useAppSelector((state) => state.ui.themeColor);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login") {
      return;
    }

    if (themeColor) {
      applyThemeToDocument(themeColor);
    }
  }, [themeColor, location.pathname]);
}
