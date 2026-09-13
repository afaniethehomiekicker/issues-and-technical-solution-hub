import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";

export const TrendingView = ({
  onSelectIssue,
  onSelectTag,
  onSelectCategory,
}) => {
  const [issues, setIssues] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        const [data, bms] = await Promise.all([
          api.getTrendingIssues(),
          api.getBookmarks(),
        ]);
        setIssues(data);
        setBookmarks(bms);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/50 p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          <span>Trending Problem Analysis</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Active Engineering Bottlenecks & Hot Threads
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Issues ranked dynamically by recent developer reactions, active
          solution submissions, and discussion velocity.
        </p>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">
            Computing trending algorithm scores...
          </p>
        </div>
      ) : issues.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl">
          No trending issues right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isBookmarked={bookmarks.some((b) => b.issueId === issue.id)}
              onToggleBookmark={async (id) => {
                await api.toggleBookmark(id);
                const bms = await api.getBookmarks();
                setBookmarks(bms);
              }}
              onSelect={onSelectIssue}
              onSelectTag={onSelectTag}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};
