import React from "react";
import {
  Bookmark,
  FileQuestion,
  Flame,
  LayoutDashboard,
  Layers,
  Shield,
  Tag,
  Trophy,
} from "lucide-react";

export const Sidebar = ({
  currentView,
  onNavigate,
  currentUser,
  bookmarkCount = 0,
}) => {
  const isAdmin = currentUser?.role === "admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "issues", label: "All Issues", icon: FileQuestion },
    { id: "trending", label: "Trending", icon: Flame, badge: "Hot" },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "tags", label: "Technology Tags", icon: Tag },
    {
      id: "bookmarks",
      label: "My Bookmarks",
      icon: Bookmark,
      count: bookmarkCount,
    },
    { id: "leaderboard", label: "Developers & Rep", icon: Trophy },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-6">
        {/* Main Navigation */}
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-mono">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c1c1c]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-zinc-400"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-xs font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-indigo-700 text-white"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => onNavigate("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === "admin"
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/30"
                    : "text-amber-800 dark:text-amber-300/80 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Control Center</span>
              </button>
            </nav>
          </div>
        )}

        {/* Quick Reputation Card for Active User */}
        {currentUser && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
              <span>Your Developer Standing</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                Rank #2
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (currentUser.reputation / 1000) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-500">
              <span>{currentUser.reputation} Points</span>
              <span>Next tier: 1000</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
