import { notify } from "@/lib/toast";
import type {
  Notification,
  GetNotificationsParams,
} from "@/services/api/types/notifications.types";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/api/notifications";

export const ActionType = {
  GET_NOTIFICATIONS: "GET_NOTIFICATIONS",
  MARK_AS_READ: "MARK_AS_READ",
  MARK_ALL_AS_READ: "MARK_ALL_AS_READ",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

const getNotificationsActionCreator = (data: {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}) => {
  return {
    type: ActionType.GET_NOTIFICATIONS,
    payload: data,
  };
};

const markAsReadActionCreator = (id: number) => {
  return {
    type: ActionType.MARK_AS_READ,
    payload: id,
  };
};

const markAllAsReadActionCreator = () => {
  return {
    type: ActionType.MARK_ALL_AS_READ,
  };
};

const setLoadingActionCreator = (loading: boolean) => {
  return {
    type: ActionType.SET_LOADING,
    payload: loading,
  };
};

const setErrorActionCreator = (error: string | null) => {
  return {
    type: ActionType.SET_ERROR,
    payload: error,
  };
};

export const asyncGetNotificationsActionCreator = (
  params: GetNotificationsParams = {},
  options: { silent?: boolean } = {}
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getNotifications(params);
      dispatch(getNotificationsActionCreator(response));
    } catch (error: any) {
      // Silently fail on 401 (Unauthorized) or if silent mode
      const isUnauthorized = error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized');
      
      if (!isUnauthorized && !options.silent) {
        notify.error("Failed to get notifications");
      }
      
      dispatch(setErrorActionCreator(error.message));
    } finally {
      dispatch(setLoadingActionCreator(false));
    }
  };
};

export const asyncMarkAsReadActionCreator = (id: number) => {
  return async (dispatch: any) => {
    try {
      await markNotificationAsRead(id);
      dispatch(markAsReadActionCreator(id));
    } catch (error: any) {
      notify.error("Failed to mark notification as read");
    }
  };
};

export const asyncMarkAllAsReadActionCreator = () => {
  return async (dispatch: any) => {
    try {
      await markAllNotificationsAsRead();
      dispatch(markAllAsReadActionCreator());
      notify.success("All notifications marked as read");
    } catch (error: any) {
      notify.error("Failed to mark all notifications as read");
    }
  };
};
