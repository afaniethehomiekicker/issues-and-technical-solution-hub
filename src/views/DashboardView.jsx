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
  const [solutionsCount, setSolutionsCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "admin";

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
        setIssues(issuesData || []);
        setTrendingIssues(trendingData || []);
        setActivities(actsData || []);
        setBookmarks(bmData || []);

        // Calculate solutions provided by current user
        let totalSolutions = 0;
        let totalAccepted = 0;
        for (const issue of issuesData || []) {
          const sols = await api.getSolutions(issue.id);
          const userSols = sols.filter((s) => s.authorId === currentUser?.id);
          totalSolutions += userSols.length;
          totalAccepted += userSols.filter((s) => s.isAccepted).length;
        }
        setSolutionsCount(totalSolutions);
        setAcceptedCount(totalAccepted);
      } catch (e) {
        console.error("Error loading dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  // Compute developer stats for active user
  const myIssues = issues.filter((i) => i.authorId === currentUser?.id);
  const myOpenIssues = myIssues.filter((i) => i.status === "open" || i.status === "Open");
  const myInDiscussion = myIssues.filter((i) => i.status === "in_discussion" || i.status === "In Discussion");
  const mySolvedIssues = myIssues.filter((i) => i.status === "solved" || i.status === "Solved");
  const myClosedIssues = myIssues.filter((i) => i.status === "closed" || i.status === "Closed");

  const solvedRecently = issues
    .filter((i) => i.status === "solved" || i.status === "Solved")
    .slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full min-w-0">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 p-5 sm:p-8 shadow-xs dark:shadow-none">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Developer Engineering Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
              Report bugs, share root-cause solutions, unblock teammates, and
              build searchable technical memory for our engineering team.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenNewIssue}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => onNavigate("trending")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-sm font-medium border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-xs"
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
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block truncate">
            My Issues
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
            {myIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Created by you
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
            Open
          </span>
          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {myOpenIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Needs attention
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
            In Discussion
          </span>
          <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {myInDiscussion.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Active threads
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
            Solved
          </span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {mySolvedIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Accepted answer
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block truncate">
            Closed
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-700 dark:text-zinc-400 font-mono">
            {myClosedIssues.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Resolved / Dup
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
            Solutions
          </span>
          <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {solutionsCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Provided
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
            Accepted
          </span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {acceptedCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 block truncate">
            Chosen answers
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-zinc-950 border border-amber-200 dark:border-amber-500/30 space-y-1 shadow-xs dark:shadow-none">
          <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            Reputation
          </span>
          <div className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400 font-mono">
            {currentUser?.reputation || 100}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400/80 block truncate">
            Level: Senior
          </span>
        </div>
      </div>

      {/* Main Grid: Trending & Solved Issues + Sidebar Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Hot / Trending Issues and Recently Solved */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
          {/* Trending Issues Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
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
              {trendingIssues.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                  No trending problems at the moment.
                </p>
              ) : (
                trendingIssues.slice(0, 3).map((issue) => (
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
                ))
              )}
            </div>
          </div>

          {/* Recently Solved Knowledge Base */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
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
              {solvedRecently.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 col-span-2 text-center">
                  No solved issues recorded yet.
                </p>
              ) : (
                solvedRecently.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue.id)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition-all cursor-pointer space-y-2.5 group shadow-xs dark:shadow-none"
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
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {issue.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {issue.technology || "Core"}
                      </span>
                      <span>•</span>
                      <span>{issue.views} views</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team Activity Stream & Quick Bookmarks */}
        <div className="space-y-6">
          {/* Real-time Activity History */}
          <div className="rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 space-y-4 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                          if (act.entityType === "issue" || act.entityType === "solution") {
                            onSelectIssue(act.entityId);
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
          <div className="rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 space-y-3 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
                    key={b.id || b.issueId}
                    onClick={() => onSelectIssue(b.issueId)}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer text-xs"
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