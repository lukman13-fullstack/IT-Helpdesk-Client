import { ActionType } from "./action";
import type { NotificationsState, NotificationsAction } from "./types";

const initialState: NotificationsState = {
  notifications: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  unreadCount: 0,
  loading: false,
  error: null,
};

export default function notificationsReducer(
  state: NotificationsState = initialState,
  action: NotificationsAction
): NotificationsState {
  switch (action.type) {
    case ActionType.GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        unreadCount: action.payload.unreadCount,
        loading: false,
        error: null,
      };
    case ActionType.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case ActionType.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}
