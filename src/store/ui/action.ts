import { ActionType, UIAction, ThemeColor } from "./types";

export const setGlobalLoadingActionCreator = (loading: boolean): UIAction => {
  return {
    type: ActionType.SET_GLOBAL_LOADING,
    payload: loading,
  };
};

export const setThemeColorActionCreator = (themeColor: ThemeColor): UIAction => {
  return {
    type: ActionType.SET_THEME_COLOR,
    payload: themeColor,
  };
};

export const setLoadingProgressActionCreator = (progress: number | null): UIAction => {
  return {
    type: ActionType.SET_LOADING_PROGRESS,
    payload: progress,
  };
};
