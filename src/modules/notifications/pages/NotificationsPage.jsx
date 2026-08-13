import { useEffect, useState } from "react";

import {
  getNotificationVisual,
  timeAgo,
} from "../notifications.constants";
import { notificationsApi } from "../api/notificationsApi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll({
        category: "all",
        limit: 50,
      });
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })),
    );
    setUnreadCount(0);
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      await notificationsApi.markRead(notification._id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="px-1 pt-7 sm:px-3">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[29px] font-bold leading-tight text-slate-950">
            Notifications
          </h1>
          <p className="mt-2 text-[19px] font-medium leading-none text-slate-500">
            {unreadCount} unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!unreadCount}
          className="self-start text-[18px] font-bold text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300 sm:self-auto"
        >
          Mark all read
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {notifications.map((notification, index) => {
          const visual = getNotificationVisual(notification.type);
          const Icon = visual.icon;
          const isUnread = !notification.readAt;

          return (
            <button
              key={notification._id}
              type="button"
              onClick={() => openNotification(notification)}
              className={`grid min-h-[123px] w-full grid-cols-[13px_42px_1fr] items-start gap-5 px-5 py-6 text-left transition hover:bg-slate-50 sm:px-6 lg:px-7 ${
                isUnread ? "bg-blue-50/60" : "bg-white"
              } ${index ? "border-t border-slate-100" : ""}`}
            >
              <span
                className={`mt-3 h-2.5 w-2.5 rounded-full ${
                  isUnread ? "bg-blue-600" : "bg-transparent"
                }`}
                aria-hidden="true"
              />
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${visual.bg}`}>
                <Icon size={21} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-bold leading-tight text-slate-950">
                  {notification.title}
                </span>
                <span className="mt-2 block text-[19px] font-medium leading-snug text-slate-500">
                  {notification.body}
                </span>
                <span className="mt-3 block text-[16px] font-medium text-slate-400">
                  {timeAgo(notification.createdAt)}
                </span>
              </span>
            </button>
          );
        })}

        {!loading && notifications.length === 0 && (
          <p className="py-16 text-center text-sm font-semibold text-slate-400">
            No notifications yet
          </p>
        )}

        {loading && (
          <p className="py-16 text-center text-sm font-semibold text-slate-400">
            Loading notifications...
          </p>
        )}
      </div>
    </div>
  );
}
