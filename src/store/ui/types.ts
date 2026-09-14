export enum ActionType {
  SET_GLOBAL_LOADING = "SET_GLOBAL_LOADING",
  SET_LOADING_PROGRESS = "SET_LOADING_PROGRESS",
  SET_THEME_COLOR = "SET_THEME_COLOR",
}

export interface ThemeColor {
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface UIState {
  globalLoading: boolean;
  loadingProgress: number | null;
  themeColor: ThemeColor | null;
}

export interface SetGlobalLoadingAction {
  type: ActionType.SET_GLOBAL_LOADING;
  payload: boolean;
}

export interface SetThemeColorAction {
  type: ActionType.SET_THEME_COLOR;
  payload: ThemeColor;
}

export interface SetLoadingProgressAction {
  type: ActionType.SET_LOADING_PROGRESS;
  payload: number | null;
}

export type UIAction = SetGlobalLoadingAction | SetThemeColorAction | SetLoadingProgressAction;
