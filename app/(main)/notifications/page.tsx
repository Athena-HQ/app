"use client";

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  MessageSquare,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { NotificationResponse } from "@/services/notification";

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  task_assigned: ClipboardList,
  task_status_changed: ArrowRight,
  feedback_received: Star,
  feedback_requested: MessageSquare,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  task_assigned: "bg-blue-500/15 text-blue-500",
  task_status_changed: "bg-amber-500/15 text-amber-500",
  feedback_received: "bg-emerald-500/15 text-emerald-500",
  feedback_requested: "bg-purple-500/15 text-purple-500",
};

function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationResponse;
  onRead: (id: number) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.notification_type] || Bell;
  const colorClass = NOTIFICATION_COLORS[notification.notification_type] || "bg-muted text-muted-foreground";
  const href = notification.related_task
    ? `/tasks/${notification.related_task}`
    : "#";

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all",
        !notification.is_read && "border-primary/20 shadow-sm"
      )}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-xl shrink-0", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  "text-sm",
                  !notification.is_read ? "font-semibold" : "font-medium text-foreground/80"
                )}
              >
                {notification.title}
              </h4>
              {!notification.is_read && (
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notification.message}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(notification.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {notification.related_task && (
                <Link
                  href={href}
                  onClick={handleClick}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View task →
                </Link>
              )}
              {!notification.is_read && !notification.related_task && (
                <button
                  onClick={() => onRead(notification.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground animate-pulse">
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground mb-1">
            All caught up!
          </h3>
          <p className="text-sm text-muted-foreground">
            You have no notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
