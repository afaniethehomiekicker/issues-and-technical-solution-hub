import React, { useState, useEffect } from "react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function BookmarksView({ onSelectIssue }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.getBookmarks();
      setBookmarks(data || []);
    } catch (err) {
      console.error("Failed to load bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Bookmark className="w-6 h-6 fill-amber-500/20" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                My Bookmarked Technical Solutions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fast access to tricky bugs, terminal commands, and verified solutions you've saved.
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
            {bookmarks.length} {bookmarks.length === 1 ? "Bookmark" : "Bookmarks"}
          </div>
        </div>
      </div>

      {/* Bookmarked Issues List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-mono">
          Loading saved bookmarks...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <BookmarkCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Bookmarked Issues Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any issue card to save technical solutions for quick reference later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookmarks.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onSelect={onSelectIssue}
            />
          ))}
        </div>
      )}
    </div>
  );
}