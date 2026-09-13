import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Download,
  Filter,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";

export const IssuesListView = ({
  onSelectIssue,
  onOpenNewIssue,
  categories,
  tags: availableTags,
  initialCategory,
  initialTag,
  searchQuery = "",
}) => {
  const [issues, setIssues] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(
    initialCategory || "all",
  );
  const [tagFilter, setTagFilter] = useState(initialTag || "all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [solvedOnly, setSolvedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim(),
        sort: sortBy,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (tagFilter !== "all") params.tag = tagFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (solvedOnly) params.solvedOnly = true;

      const [data, bms] = await Promise.all([
        api.getIssues(params),
        api.getBookmarks(),
      ]);
      setIssues(data);
      setBookmarks(bms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [
    statusFilter,
    categoryFilter,
    tagFilter,
    priorityFilter,
    solvedOnly,
    sortBy,
    search,
  ]);

  useEffect(() => {
    if (initialCategory) setCategoryFilter(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialTag) setTagFilter(initialTag);
  }, [initialTag]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setTagFilter("all");
    setPriorityFilter("all");
    setSolvedOnly(false);
    setSortBy("newest");
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    tagFilter !== "all" ||
    priorityFilter !== "all" ||
    solvedOnly;

  const handleExportCSV = () => {
    window.location.href = "/api/export/issues?format=csv";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Engineering Issues & Problem Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium border border-indigo-500/30">
              {issues.length} Issues
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search bugs, trace errors, and review accepted solutions across all
            languages and frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewIssue}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All Issues" },
              { id: "open", label: "Open" },
              { id: "in_discussion", label: "In Discussion" },
              { id: "solved", label: "Solved" },
              { id: "reopened", label: "Reopened" },
              { id: "closed", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={solvedOnly}
              onChange={(e) => setSolvedOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved Only
            </span>
          </label>
        </div>

        {/* Dropdowns Row: Category, Tag, Priority, Sort, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword..."
              className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.issueCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Tag Dropdown */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Technology Tags</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.name}>
                  #{t.name} ({t.usageCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="views">Sort: Most Viewed</option>
              <option value="discussed">Sort: Most Discussed</option>
              <option value="liked">Sort: Most Liked</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="recently_solved">Sort: Recently Solved</option>
            </select>
          </div>
        </div>

        {/* Reset active filters pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filters applied</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Issues Listing Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">
            Loading issue repository...
          </p>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              No matching technical issues found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria, clearing tag filters, or
              report a new technical problem.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenNewIssue}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold cursor-pointer"
            >
              Post This Issue
            </button>
          </div>
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
                const updated = await api.getBookmarks();
                setBookmarks(updated);
              }}
              onSelect={onSelectIssue}
              onSelectTag={(t) => setTagFilter(t)}
              onSelectCategory={(c) => setCategoryFilter(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
