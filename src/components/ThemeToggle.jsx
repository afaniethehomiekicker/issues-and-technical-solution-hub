import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-zinc-800 p-0.5 shadow-sm">
        {/* Quick 1-click Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
          title={`Currently in ${resolvedTheme === "dark" ? "Dark" : "Light"} mode (Click to toggle)`}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-[#262626] transition-all cursor-pointer flex items-center justify-center"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20 rotate-0 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 rotate-0 transition-transform" />
          )}
        </button>

        {/* Dropdown caret to choose explicitly: Light / Dark / System */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Theme options menu"
          className="px-1 py-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-[#262626] rounded-r-md transition-colors cursor-pointer"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Explicit selector menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50 py-1 text-xs">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
              theme === "light"
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#262626]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === "light" && (
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
              theme === "dark"
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#262626]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </div>
            {theme === "dark" && (
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer border-t border-slate-100 dark:border-zinc-800/80 ${
              theme === "system"
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#262626]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>System</span>
            </div>
            {theme === "system" && (
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
