import React from "react";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  GitFork,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

export const IssueCard = ({
  issue,
  isBookmarked = false,
  onToggleBookmark,
  onSelect,
  onSelectTag,
  onSelectCategory,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "solved":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Solved
          </span>
        );
      case "in_discussion":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
            In Discussion
          </span>
        );
      case "reopened":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Clock className="w-3.5 h-3.5" />
            Reopened
          </span>
        );
      case "closed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            Closed
          </span>
        );
      case "open":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
            Open
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 animate-pulse">
            Critical
          </span>
        );
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-500/40">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40">
            High
          </span>
        );
      case "normal":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
            Normal
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            Low
          </span>
        );
    }
  };

  const reactionValues = Object.values(issue.reactions || {});
  const totalReactions = reactionValues.reduce(
    (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
    0,
  );

  return (
    <div 
      onClick={() => onSelect(issue.id)}
      className="group relative rounded-2xl bg-white dark:bg-[#121212] hover:bg-slate-50/90 dark:hover:bg-[#181818] border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 p-5 transition-all shadow-xs hover:shadow-md dark:shadow-none cursor-pointer"
    >
      {/* Top row: Status, Priority, Category, Bookmark */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge(issue.status)}
          {getPriorityBadge(issue.priority)}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory?.(issue.categoryId);
            }}
            className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700/60"
          >
            {issue.categoryId.replace("cat-", "")}
          </span>
          {issue.duplicateOfId && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              <GitFork className="w-3 h-3" />
              Duplicate of #{issue.duplicateOfId}
            </span>
          )}
        </div>

        {/* Bookmark action */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(issue.id);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 hover:bg-amber-100 dark:hover:bg-amber-400/20"
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Issue"}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2 line-clamp-2">
        {issue.title}
      </h3>

      {/* Snippet / Description Preview */}
      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
        {issue.description}
      </p>

      {/* Environment & Tech Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {issue.technology && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
            {issue.technology}
          </span>
        )}
        {issue.environment?.database && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            {issue.environment.database}
          </span>
        )}
        {issue.tags?.map((tag) => (
          <span
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag?.(tag);
            }}
            className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer: Author info & Engagement metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400">
        {/* Author */}
        <div className="flex items-center gap-2">
          <img
            src={
              issue.author?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
            }
            alt={issue.author?.name || "Author"}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />

          <span className="text-slate-700 dark:text-zinc-300 font-medium">
            {issue.author?.name || "Developer"}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-500 dark:text-zinc-400">
            {new Date(issue.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3.5">
          <span
            className="flex items-center gap-1 text-slate-500 dark:text-zinc-400"
            title="Views"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{issue.views}</span>
          </span>

          <span
            className={`flex items-center gap-1 font-medium ${
              issue.status === "solved"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-zinc-400"
            }`}
            title="Solutions"
          >
            {issue.status === "solved" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5" />
            )}
            <span className="font-mono text-[11px]">
              {issue.solutionCount || 0}
            </span>
          </span>

          <span
            className="flex items-center gap-1 text-slate-500 dark:text-zinc-400"
            title="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">
              {issue.commentCount || 0}
            </span>
          </span>

          {totalReactions > 0 && (
            <span
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300"
              title="Reactions"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">{totalReactions}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};