import React, { useState, useEffect, useRef } from "react";
import { Bell, Code2, Plus, Search, Shield, Sparkles, X } from "lucide-react";
import { api } from "../api";
import { ThemeToggle } from "./ThemeToggle";

export const Header = ({
  currentUser,
  onOpenNewIssue,
  onOpenUserSwitcher,
  onSelectIssue,
  onNavigate,
  searchQuery,
  setSearchQuery,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifications();
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await api.markNotificationRead(notif.id);
      fetchNotifications();
    }
    setShowNotifications(false);
    onSelectIssue(notif.issueId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  DevResolve
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  INTERNAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Issues & Technical Solutions Hub
              </p>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error messages, GORM, React, stack traces, tags..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-[#121212] transition-all"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Theme Toggle + New Issue + Notifications + Active User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Mode Toggle Button */}
          <ThemeToggle />

          {/* New Issue Button */}
          <button
            onClick={onOpenNewIssue}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Issue</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-[#181818]/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer flex gap-3 items-start ${
                          !n.isRead
                            ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-l-2 border-indigo-500"
                            : ""
                        }`}
                      >
                        <img
                          src={
                            n.actor?.avatar ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                          }
                          alt={n.actor?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-zinc-700"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 dark:text-zinc-200 leading-snug line-clamp-2">
                            {n.previewText}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                            <span className="truncate text-indigo-600 dark:text-indigo-400">
                              {n.issueTitle}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Switcher Pill */}
          <button
            onClick={onOpenUserSwitcher}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#121212] hover:bg-slate-200/80 dark:hover:bg-[#1c1c1c] border border-slate-200 dark:border-zinc-800 transition-all cursor-pointer group"
            title="Switch User / View Account"
          >
            <div className="relative">
              <img
                src={
                  currentUser?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                }
                alt={currentUser?.name || "User"}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50"
              />

              {currentUser?.role === "admin" && (
                <span
                  className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-slate-950"
                  title="Admin"
                >
                  <Shield className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            <div className="text-left hidden lg:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {currentUser?.name?.split(" ")[0] || "Ahmed"}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                    currentUser?.role === "admin"
                      ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40"
                      : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40"
                  }`}
                >
                  {currentUser?.role || "DEV"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{currentUser?.reputation || 0} rep</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
