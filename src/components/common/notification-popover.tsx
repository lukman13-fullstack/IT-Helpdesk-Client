import { Bell, FileCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  asyncGetNotificationsActionCreator,
  asyncMarkAsReadActionCreator,
} from "@/store/notifications/action";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "../ui/separator";
import { asyncGetApprovalRequestsActionCreator } from "@/store/approvals/action";
import { Badge } from "../ui/badge";
import { asyncMarkAllAsReadActionCreator } from "@/store/notifications/action";
import { useLanguage } from "@/context/LanguageContext";

export default function NotificationPopover() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notifications
  );
  const { approvalRequests } = useAppSelector((state) => state.approvals);
  const { user } = useAppSelector((state) => state.authUser);
  const { t } = useLanguage();

  console.log(notifications);
  console.log(user);

  // Calculate pending approvals count
  const pendingApprovalsCount = useMemo(() => {
    return approvalRequests.filter((req: any) => req.status === "pending")
      .length;
  }, [approvalRequests]);

  const handleMarkAllAsRead = () => {
    dispatch(asyncMarkAllAsReadActionCreator());
  };

  useEffect(() => {
    // Initial fetch
    dispatch(asyncGetNotificationsActionCreator({ limit: 20 }));
    dispatch(asyncGetApprovalRequestsActionCreator());

    // Background polling (silent mode to prevent error spam)
    const interval = setInterval(() => {
      dispatch(
        asyncGetNotificationsActionCreator({ limit: 20 }, { silent: true })
      );
      dispatch(asyncGetApprovalRequestsActionCreator({ silent: true }));
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) {
      dispatch(asyncMarkAsReadActionCreator(id));
    }
  };

  const navigateToDocument = (documentId: number | null, type?: string) => {
    if (type === "print_approved" || type === "print_rejected") {
      navigate(`/shared-documents/detail/${documentId}`);
    } else if (type === "print_request") {
      navigate("/approvals");
    } else if (type === "reference_check_pending") {
      navigate("/approvals");
    } else {
      navigate(`/documents/detail/${documentId}`);
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full rounded-full" style={{ overflow: 'visible' }}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '9999px',
                backgroundColor: '#ef4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                lineHeight: 1,
                border: '2px solid var(--background)',
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">{t("notifications.title")}</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("notifications.unread", { count: unreadCount })}
            </span>
          )}
          <Badge
            onClick={handleMarkAllAsRead}
            variant="destructive"
            className="cursor-pointer"
          >
            {t("notifications.markAllAsRead")}
          </Badge>
        </div>
        <ScrollArea className="h-[300px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">{t("notifications.loading")}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("notifications.noNotifications")}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50/50 dark:bg-blue-950/20"
                      : ""
                  }`}
                  onClick={() => {
                    handleNotificationClick(
                      notification.id,
                      notification.isRead
                    );
                    navigateToDocument(
                      notification.documentId,
                      notification.type
                    );
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.document && (
                        <p className="text-xs text-muted-foreground">
                          {t("notifications.document")}: {notification.document.documentCode} -{" "}
                          {notification.document.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        {user?.role?.permissions.some(
          (p) => p.permission.name === "APPROVE_DOCUMENT"
        ) && (
          <div className="p-4">
            <Link
              className="relative py-4 flex w-full shadow-md rounded-md bg-yellow-500 hover:bg-yellow-600 text-white flex-col items-center gap-2"
              to="/approvals"
            >
              <FileCheck className="w-5 h-5" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {pendingApprovalsCount > 99 ? "99+" : pendingApprovalsCount}
                </span>
              )}
              <span className="text-xs font-medium text-center">{t("notifications.approvals")}</span>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
