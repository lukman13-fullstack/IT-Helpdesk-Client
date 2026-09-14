import { ActionType, UIState } from "./types";

// Load theme from localStorage
const loadThemeFromStorage = () => {
  try {
    const savedTheme = localStorage.getItem("dms-theme-color");
    return savedTheme ? JSON.parse(savedTheme) : null;
  } catch {
    return null;
  }
};

const initialState: UIState = {
  globalLoading: false,
  loadingProgress: null,
  themeColor: loadThemeFromStorage(),
};

const uiReducer = (state = initialState, action: any): UIState => {
  switch (action.type) {
    case ActionType.SET_GLOBAL_LOADING:
      return {
        ...state,
        globalLoading: action.payload,
        loadingProgress: action.payload ? state.loadingProgress : null, // Reset progress when hiding loading
      };
    case ActionType.SET_LOADING_PROGRESS:
      return {
        ...state,
        loadingProgress: action.payload,
      };
    case ActionType.SET_THEME_COLOR:
      // Save to localStorage
      localStorage.setItem("dms-theme-color", JSON.stringify(action.payload));
      return {
        ...state,
        themeColor: action.payload,
      };
    default:
      return state;
  }
};

export default uiReducer;
