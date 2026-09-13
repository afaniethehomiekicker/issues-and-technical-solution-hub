import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Sparkles,
} from "lucide-react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";

export const DashboardView = ({
  currentUser,
  onSelectIssue,
  onNavigate,
  onOpenNewIssue,
  onSelectCategory,
  onSelectTag,
}) => {
  const [issues, setIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [issuesData, trendingData, actsData, bmData] = await Promise.all([
          api.getIssues(),
          api.getTrendingIssues(),
          api.getActivities(),
          api.getBookmarks(),
        ]);
        setIssues(issuesData);
        setTrendingIssues(trendingData);
        setActivities(actsData);
        setBookmarks(bmData);

        if (isAdmin) {
          const stats = await api.getAdminStats();
          setAdminStats(stats);
        }
      } catch (e) {
        console.error("Error loading dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, isAdmin]);

  // Compute developer stats for active user
  const myIssues = issues.filter((i) => i.authorId === currentUser?.id);
  const myOpenIssues = myIssues.filter((i) => i.status === "open");
  const myInDiscussion = myIssues.filter((i) => i.status === "in_discussion");
  const mySolvedIssues = myIssues.filter((i) => i.status === "solved");
  const myClosedIssues = myIssues.filter((i) => i.status === "closed");

  const solvedRecently = issues
    .filter((i) => i.status === "solved")
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white dark:from-zinc-950 dark:via-indigo-950/40 dark:to-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {currentUser?.department || "Engineering"}
              </span>
              <span className="text-xs text-slate-600 dark:text-zinc-400">
                Logged in as{" "}
                <strong className="text-slate-900 dark:text-zinc-200">
                  {currentUser?.name}
                </strong>{" "}
                (@{currentUser?.username})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Developer Engineering Workspace
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
              Report bugs, share root-cause solutions, unblock teammates, and
              build searchable technical memory for our engineering team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewIssue}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/25 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => onNavigate("trending")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-sm font-medium border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Trending</span>
            </button>
          </div>
        </div>

        {/* Subtle grid accent background */}
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Developer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            My Issues
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {myIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Created by you
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Open
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-300 font-mono">
            {myOpenIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Needs attention
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            In Discussion
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-300 font-mono">
            {myInDiscussion.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Active threads
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Solved
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-300 font-mono">
            {mySolvedIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Accepted answer
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Closed
          </span>
          <div className="text-xl font-bold text-slate-700 dark:text-zinc-400 font-mono">
            {myClosedIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Resolved / Dup
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Solutions
          </span>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-300 font-mono">
            12
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Provided
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Accepted
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-300 font-mono">
            4
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500">
            Chosen answers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-500/30 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Reputation
          </span>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300 font-mono">
            {currentUser?.reputation || 485}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400/80">
            Level: Senior
          </span>
        </div>
      </div>

      {/* Main Grid: Trending & Solved Issues + Sidebar Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Hot / Trending Issues and Recently Solved */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trending Issues Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Trending Technical Problems
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  Active
                </span>
              </div>
              <button
                onClick={() => onNavigate("trending")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {trendingIssues.slice(0, 3).map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  isBookmarked={bookmarks.some((b) => b.issueId === issue.id)}
                  onToggleBookmark={async (id) => {
                    await api.toggleBookmark(id);
                    const updated = await api.getBookmarks();
                    setBookmarks(updated);
                  }}
                  onSelect={onSelectIssue}
                  onSelectTag={onSelectTag}
                  onSelectCategory={onSelectCategory}
                />
              ))}
            </div>
          </div>

          {/* Recently Solved Knowledge Base */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Recently Solved & Accepted Solutions
                </h2>
              </div>
              <button
                onClick={() => onNavigate("issues")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                Browse all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solvedRecently.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-300 dark:hover:border-emerald-500/60 transition-all cursor-pointer space-y-2.5 group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Accepted Fix
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">
                      #{issue.id}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {issue.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="font-mono text-indigo-600 dark:text-indigo-300">
                      {issue.technology || "Core"}
                    </span>
                    <span>•</span>
                    <span>{issue.views} views</span>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {issue.solutionCount} solutions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team Activity Stream & Quick Bookmarks */}
        <div className="space-y-6">
          {/* Real-time Activity History */}
          <div className="rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Team Activity
                </h3>
              </div>
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"
                title="Live updates"
              />
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-4">
                  No recent activity
                </p>
              ) : (
                activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <img
                      src={
                        act.userAvatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                      }
                      alt={act.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-zinc-700"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-zinc-300 leading-snug">
                        <strong className="text-slate-900 dark:text-zinc-100 font-medium">
                          {act.userName}
                        </strong>{" "}
                        <span className="text-slate-500 dark:text-zinc-400">
                          {act.action}
                        </span>
                      </p>
                      <button
                        onClick={() => {
                          if (
                            act.entityType === "issue" ||
                            act.entityType === "solution"
                          ) {
                            onSelectIssue(
                              act.entityId.startsWith("issue-")
                                ? act.entityId
                                : "issue-1024",
                            );
                          }
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 truncate block text-left font-medium cursor-pointer"
                      >
                        {act.entityTitle}
                      </button>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Bookmarks Card */}
          <div className="rounded-2xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 p-5 space-y-3 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  My Saved Issues
                </h3>
              </div>
              <button
                onClick={() => onNavigate("bookmarks")}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              >
                View all ({bookmarks.length})
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
                Bookmark useful issues to quickly find their solutions later.
              </p>
            ) : (
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectIssue(b.issueId)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#222222] border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer text-xs"
                  >
                    <p className="text-slate-800 dark:text-zinc-200 font-medium truncate">
                      {b.issue?.title || `Issue #${b.issueId}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-zinc-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {b.issue?.status}
                      </span>
                      <span>•</span>
                      <span>#{b.issue?.categoryId?.replace("cat-", "")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
