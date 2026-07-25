import { useEffect, useState } from "react";
import { NOTIFICATION_ICONS, timeAgo } from "../notifications.constants";
import { notificationsApi } from "../api/notificationsApi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {notifications.map((n, idx) => {
          const config = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.lead;
          const Icon = config.icon;

          return (
            <div
              key={n._id}
              className={`flex items-start gap-4 px-6 py-4 ${
                idx !== notifications.length - 1 ? "border-b border-slate-100" : ""
              } ${!n.isRead ? "bg-blue-50/50" : ""}`}
            >
              {!n.isRead ? (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              ) : (
                <span className="mt-2 h-2 w-2 shrink-0" />
              )}

              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon size={16} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-500">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          );
        })}

        {!loading && notifications.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No notifications yet</p>
        )}
      </div>
    </div>
  );
}