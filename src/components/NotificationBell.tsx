"use client";
import { useState } from "react";
import { Bell, CheckCircle, Eye, Star, Calendar } from "lucide-react";
import { Notification } from "@/types";
import { mockNotifications } from "@/lib/mockData";

const iconMap = {
  cv_viewed: <Eye className="w-4 h-4 text-blue-400" />,
  application_received: <CheckCircle className="w-4 h-4 text-green-400" />,
  shortlisted: <Star className="w-4 h-4 text-yellow-400" />,
  interview: <Calendar className="w-4 h-4 text-purple-400" />,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-3 p-3 cursor-pointer hover:bg-slate-800 transition-colors ${
                  !n.read ? "bg-slate-800/60" : ""
                }`}
              >
                <div className="mt-0.5">{iconMap[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(n.timestamp).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">
              No notifications yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
