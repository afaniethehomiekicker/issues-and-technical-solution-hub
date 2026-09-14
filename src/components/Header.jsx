 import React from "react";
import { 
  Plus, 
  Search, 
  LogOut, 
  LogIn, 
  Terminal, 
  ShieldCheck, 
  User 
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header({
  currentUser,
  onOpenNewIssue,
  onOpenUserSwitcher,
  onLogout,
  onSelectIssue,
  onNavigate,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                DevResolve
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Hub
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search error messages, GORM, React hooks..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900/90 border border-transparent dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Dropdown Toggle */}
          <ThemeToggle />

          {currentUser ? (
            <>
              {/* New Issue Button */}
              <button
                onClick={onOpenNewIssue}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">New Issue</span>
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              {/* User Profile Pill */}
              <button
                onClick={() => onNavigate("leaderboard")}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {currentUser.name || currentUser.username}
                </span>
                {currentUser.role === "Admin" && (
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                )}
              </button>

              {/* Log Out Button */}
              <button
                onClick={onLogout}
                title="Log Out"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </>
          ) : (
            /* Sign In Button (When logged out) */
            <button
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}