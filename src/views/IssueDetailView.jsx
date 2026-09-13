import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  Code,
  ExternalLink,
  Eye,
  FileCode,
  GitFork,
  HelpCircle,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../api";
import { CodeBlock } from "../components/CodeBlock";
import { TerminalLog } from "../components/TerminalLog";
import { ReactionsBar } from "../components/ReactionsBar";
import { SubmitSolutionModal } from "../components/SubmitSolutionModal";
import { ReportModal } from "../components/ReportModal";

export const IssueDetailView = ({
  issueId,
  currentUser,
  onBack,
  onSelectIssue,
  onSelectUser,
}) => {
  const [issue, setIssue] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [comments, setComments] = useState([]);
  const [relatedIssues, setRelatedIssues] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals & UI states
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({
    type: "issue",
    id: "",
    title: "",
  });

  // Duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateTargetId, setDuplicateTargetId] = useState("");

  // Comment input state
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status changing state
  const [changingStatus, setChangingStatus] = useState(false);

  const canManageStatus =
    currentUser?.role === "admin" || currentUser?.id === issue?.authorId;

  const loadAllData = async () => {
    try {
      const [issueData, sols, comms, rels, bms] = await Promise.all([
        api.getIssue(issueId),
        api.getSolutions(issueId),
        api.getComments(issueId),
        api.getRelatedIssues(issueId),
        api.getBookmarks(),
      ]);
      setIssue(issueData);
      setSolutions(sols);
      setComments(comms);
      setRelatedIssues(rels);
      setIsBookmarked(bms.some((b) => b.issueId === issueId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [issueId]);

  const handleToggleBookmark = async () => {
    if (!issue) return;
    const res = await api.toggleBookmark(issue.id);
    setIsBookmarked(res.bookmarked);
  };

  const handleStatusChange = async (newStatus) => {
    if (!issue) return;
    setChangingStatus(true);
    try {
      const updated = await api.updateIssueStatus(issue.id, newStatus);
      setIssue(updated);
    } catch (e) {
      console.error("Failed to change status", e);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAcceptSolution = async (solId) => {
    try {
      const res = await api.acceptSolution(solId);
      if (res && res.issue) {
        setIssue(res.issue);
        // Reload solutions
        const sols = await api.getSolutions(issueId);
        setSolutions(sols);

        // Celebrate with confetti!
        if (res.solution.isAccepted) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10B981", "#6366F1", "#F59E0B"],
          });
        }
      }
    } catch (e) {
      console.error("Failed to accept solution", e);
    }
  };

  const handleDeleteSolution = async (solId) => {
    if (!confirm("Are you sure you want to delete this solution?")) return;
    await api.deleteSolution(solId);
    loadAllData();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    setSubmittingComment(true);
    try {
      await api.createComment(issueId, newCommentContent);
      setNewCommentContent("");
      const updatedComments = await api.getComments(issueId);
      setComments(updatedComments);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;
    try {
      await api.createComment(issueId, replyContent, parentCommentId);
      setReplyContent("");
      setReplyingToCommentId(null);
      const updatedComments = await api.getComments(issueId);
      setComments(updatedComments);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete comment?")) return;
    await api.deleteComment(commentId);
    const updated = await api.getComments(issueId);
    setComments(updated);
  };

  const handleMarkDuplicate = async () => {
    if (!duplicateTargetId.trim() || !issue) return;
    try {
      const updated = await api.markDuplicate(
        issue.id,
        duplicateTargetId.trim(),
      );
      setIssue(updated);
      setShowDuplicateModal(false);
    } catch (e) {
      alert("Could not link duplicate: check issue ID.");
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    if (
      !confirm("Permanently delete this issue? This action cannot be undone.")
    )
      return;
    await api.deleteIssue(issue.id);
    onBack();
  };

  if (loading || !issue) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">
          Loading issue details and discussion...
        </p>
      </div>
    );
  }

  const acceptedSolution = solutions.find((s) => s.isAccepted);
  const otherSolutions = solutions.filter((s) => !s.isAccepted);

  return (
    <div className="space-y-6 pb-16">
      {/* Back button & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Issues</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Change Dropdown */}
          {canManageStatus && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[11px] text-slate-400">Status:</span>
              <select
                disabled={changingStatus}
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in_discussion">In Discussion</option>
                <option value="solved">Solved</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-amber-400/15 border-amber-400/40 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400" : ""}`}
            />
            <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Mark as Duplicate */}
          {canManageStatus && (
            <button
              onClick={() => setShowDuplicateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Mark Duplicate</span>
            </button>
          )}

          {/* Report Button */}
          <button
            onClick={() => {
              setReportTarget({
                type: "issue",
                id: issue.id,
                title: issue.title,
              });
              setShowReportModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/60 text-xs text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          {/* Delete (if author or admin) */}
          {(currentUser?.id === issue.authorId ||
            currentUser?.role === "admin") && (
            <button
              onClick={handleDeleteIssue}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {issue.duplicateOfId && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 flex items-center justify-between gap-4 text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <GitFork className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">
                This issue has been marked as a duplicate of issue #
                {issue.duplicateOfId}
              </p>
              <p className="text-slate-300 mt-0.5">
                {issue.duplicateOfTitle ||
                  "Refer to the primary problem thread for verified solutions."}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectIssue(issue.duplicateOfId)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shrink-0 cursor-pointer transition-colors"
          >
            View Original Issue &rarr;
          </button>
        </div>
      )}

      {/* Main Issue Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Issue Header Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            {/* Meta Tags: Status, Priority, Category, ID */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-semibold">
                #{issue.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  issue.status === "solved"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                    : issue.status === "in_discussion"
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                      : "bg-blue-500/15 text-blue-300 border border-blue-500/40"
                }`}
              >
                {issue.status.replace("_", " ")}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Priority: {issue.priority}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                {issue.categoryId.replace("cat-", "")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {issue.title}
            </h1>

            {/* Author bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-800/80 text-xs text-slate-400">
              <div
                onClick={() => onSelectUser(issue.authorId)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={
                    issue.author?.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  }
                  alt={issue.author?.name || "Author"}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {issue.author?.name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      ★ {issue.author?.reputation || 0} rep
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {issue.author?.department} • Created{" "}
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{issue.views} views</span>
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{issue.commentCount || 0} comments</span>
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {issue.description}
            </div>

            {/* Technology & Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {issue.technology && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 text-xs font-mono font-medium border border-indigo-800/50">
                  {issue.technology}
                </span>
              )}
              {issue.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Reactions Bar on Issue */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <ReactionsBar
                entityType="issue"
                entityId={issue.id}
                reactions={issue.reactions}
                currentUserId={currentUser?.id || "usr-admin"}
                onReactionChange={(newReactions) => {
                  setIssue({ ...issue, reactions: newReactions });
                }}
              />
            </div>
          </div>

          {/* Environment Information Card */}
          {issue.environment && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Environment & Infrastructure Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {issue.environment.os && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Operating System
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.os}
                    </span>
                  </div>
                )}
                {issue.environment.languageVersion && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Language Version
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.languageVersion}
                    </span>
                  </div>
                )}
                {issue.environment.frameworkVersion && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Framework Version
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.frameworkVersion}
                    </span>
                  </div>
                )}
                {issue.environment.database && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Database / Cache
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.database}
                    </span>
                  </div>
                )}
                {issue.environment.browser && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Browser
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.browser}
                    </span>
                  </div>
                )}
                {issue.environment.other && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      Other Runtimes
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {issue.environment.other}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error & Stack Trace Section */}
          {issue.errorDetails &&
            (issue.errorDetails.message ||
              issue.errorDetails.terminalOutput ||
              issue.errorDetails.stackTrace) && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Error Diagnostics & Stack Logs
                </h3>

                {issue.errorDetails.message && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60 font-mono text-xs text-rose-200 leading-relaxed">
                    <span className="text-rose-400 font-bold mr-2">
                      [ERROR]
                    </span>
                    {issue.errorDetails.message}
                  </div>
                )}

                {issue.errorDetails.terminalOutput && (
                  <TerminalLog
                    title="Terminal / Console Output"
                    content={issue.errorDetails.terminalOutput}
                    type="output"
                  />
                )}

                {issue.errorDetails.stackTrace && (
                  <TerminalLog
                    title="Stack Trace"
                    content={issue.errorDetails.stackTrace}
                    type="trace"
                  />
                )}
              </div>
            )}

          {/* Expected vs Actual Behavior & Steps to Reproduce */}
          {(issue.expectedBehavior ||
            issue.actualBehavior ||
            issue.stepsToReproduce) && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reproduction & Behavior Analysis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {issue.expectedBehavior && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Expected Behavior
                    </span>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {issue.expectedBehavior}
                    </p>
                  </div>
                )}

                {issue.actualBehavior && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Actual Behavior
                    </span>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {issue.actualBehavior}
                    </p>
                  </div>
                )}
              </div>

              {issue.stepsToReproduce && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-300">
                    Steps to Reproduce:
                  </span>
                  <div className="text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                    {issue.stepsToReproduce}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Snippets Section */}
          {issue.codeSnippets && issue.codeSnippets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Problem Code Snippets
              </h3>
              {issue.codeSnippets.map((snippet) => (
                <CodeBlock
                  key={snippet.id}
                  title={snippet.title}
                  language={snippet.language}
                  code={snippet.code}
                />
              ))}
            </div>
          )}

          {/* Attachments Section */}
          {issue.attachments && issue.attachments.length > 0 && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attachments & Screenshots
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {issue.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    {att.type.startsWith("image/") ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <FileCode className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-200 truncate">
                        {att.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(att.size / 1024).toFixed(1)} KB
                      </p>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>View Attachment</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
               SOLUTIONS SECTION (Clearly distinct from general comments)
            ═══════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-6 pt-4 border-t-2 border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Technical Solutions ({solutions.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Peer-reviewed technical resolutions, code snippets, and
                  configuration fixes.
                </p>
              </div>

              <button
                onClick={() => setShowSolutionModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Provide Solution</span>
              </button>
            </div>

            {/* Accepted Solution Highlight Banner */}
            {acceptedSolution && (
              <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-xl bg-emerald-500 text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Accepted Solution
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Verified by{" "}
                        {acceptedSolution.acceptedByName || "Issue Owner"} on{" "}
                        {new Date(
                          acceptedSolution.acceptedAt ||
                            acceptedSolution.updatedAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      +25 Reputation
                    </span>
                    {canManageStatus && (
                      <button
                        onClick={() =>
                          handleAcceptSolution(acceptedSolution.id)
                        }
                        className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer px-2 py-1 rounded hover:bg-slate-800"
                        title="Unaccept solution"
                      >
                        Unmark
                      </button>
                    )}
                  </div>
                </div>

                {/* Solution Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      acceptedSolution.author?.avatar ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                    }
                    alt={acceptedSolution.author?.name || "Author"}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                  />

                  <div>
                    <span className="text-xs font-bold text-slate-100">
                      {acceptedSolution.author?.name}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {acceptedSolution.author?.department} •{" "}
                      {acceptedSolution.author?.reputation} rep
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {acceptedSolution.explanation}
                </div>

                {/* Solution Code Snippets */}
                {acceptedSolution.codeSnippets?.map((snip) => (
                  <CodeBlock
                    key={snip.id}
                    title={snip.title}
                    language={snip.language}
                    code={snip.code}
                  />
                ))}

                {/* Config Commands */}
                {acceptedSolution.configCommands && (
                  <TerminalLog
                    title="Configuration & Run Commands"
                    content={acceptedSolution.configCommands}
                    type="output"
                  />
                )}

                {/* Links */}
                {acceptedSolution.links &&
                  acceptedSolution.links.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 font-medium">
                        Reference Documentation:
                      </span>
                      <ul className="space-y-1 pl-1">
                        {acceptedSolution.links.map((link, idx) => (
                          <li key={idx}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline flex items-center gap-1.5 truncate"
                            >
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              <span>{link}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Reactions on Accepted Solution */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <ReactionsBar
                    entityType="solution"
                    entityId={acceptedSolution.id}
                    reactions={acceptedSolution.reactions}
                    currentUserId={currentUser?.id || "usr-admin"}
                    onReactionChange={(newReactions) => {
                      const updated = solutions.map((s) =>
                        s.id === acceptedSolution.id
                          ? { ...s, reactions: newReactions }
                          : s,
                      );
                      setSolutions(updated);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Other Solutions */}
            {otherSolutions.length === 0 && !acceptedSolution ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-900/30">
                <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  No solutions have been proposed yet. Know how to solve this?
                </p>
                <button
                  onClick={() => setShowSolutionModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Submit Solution (+10 Rep)
                </button>
              </div>
            ) : (
              otherSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          sol.author?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                        }
                        alt={sol.author?.name || "Author"}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />

                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {sol.author?.name}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {sol.author?.department} • Submitted{" "}
                          {new Date(sol.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageStatus && (
                        <button
                          onClick={() => handleAcceptSolution(sol.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Solution</span>
                        </button>
                      )}

                      {(currentUser?.id === sol.authorId ||
                        currentUser?.role === "admin") && (
                        <button
                          onClick={() => handleDeleteSolution(sol.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {sol.explanation}
                  </div>

                  {sol.codeSnippets?.map((snip) => (
                    <CodeBlock
                      key={snip.id}
                      title={snip.title}
                      language={snip.language}
                      code={snip.code}
                    />
                  ))}

                  {sol.configCommands && (
                    <TerminalLog
                      title="Configuration & Commands"
                      content={sol.configCommands}
                    />
                  )}

                  {/* Reactions on this Solution */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <ReactionsBar
                      entityType="solution"
                      entityId={sol.id}
                      reactions={sol.reactions}
                      currentUserId={currentUser?.id || "usr-admin"}
                      onReactionChange={(newReactions) => {
                        const updated = solutions.map((s) =>
                          s.id === sol.id
                            ? { ...s, reactions: newReactions }
                            : s,
                        );
                        setSolutions(updated);
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
               DISCUSSION & COMMENTS SECTION (Threaded with 1-level nested replies)
            ═══════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-5 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Developer Discussion ({comments.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Use @username to notify teammates
              </span>
            </div>

            {/* Post a New Comment Box */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-3 focus-within:border-indigo-500 transition-colors">
                <textarea
                  rows={3}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Join discussion, ask clarifying questions, or mention @ahmedk, @hassana, @sarahj..."
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
                  <span className="text-[11px] text-slate-500">
                    Supports code snippets with ```code```
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentContent.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-3 h-3" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Comments Thread List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          comment.author?.avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                        }
                        alt={comment.author?.name || "Commenter"}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />

                      <span className="font-semibold text-slate-200">
                        {comment.author?.name}
                      </span>
                      <span className="text-slate-500">
                        @{comment.author?.username}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setReplyingToCommentId(
                            replyingToCommentId === comment.id
                              ? null
                              : comment.id,
                          )
                        }
                        className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        Reply
                      </button>
                      {(currentUser?.id === comment.authorId ||
                        currentUser?.role === "admin") && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pl-1 font-sans">
                    {comment.content}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <ReactionsBar
                      entityType="comment"
                      entityId={comment.id}
                      reactions={comment.reactions}
                      currentUserId={currentUser?.id || "usr-admin"}
                      size="sm"
                    />
                  </div>

                  {/* Inline Reply Form */}
                  {replyingToCommentId === comment.id && (
                    <div className="pt-2 pl-4 border-l-2 border-indigo-500/50 space-y-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.author?.name}...`}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReply(comment.id);
                        }}
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingToCommentId(null)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies List (1-Level) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-4 border-l-2 border-slate-800 space-y-2 mt-2">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-2.5 rounded-xl bg-slate-950/60 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  reply.author?.avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                }
                                alt={reply.author?.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />

                              <span className="font-semibold text-slate-300">
                                {reply.author?.name}
                              </span>
                              <span className="text-slate-500">
                                {new Date(reply.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            {(currentUser?.id === reply.authorId ||
                              currentUser?.role === "admin") && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-200 leading-snug pl-1 font-sans">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Related Issues (Right 1 Column) */}
        <div className="space-y-6">
          {/* Author Profile Summary */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reported By Developer
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  issue.author?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                }
                alt={issue.author?.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-700"
              />

              <div>
                <h4 className="text-sm font-bold text-white">
                  {issue.author?.name}
                </h4>
                <p className="text-xs text-slate-400">
                  @{issue.author?.username}
                </p>
                <p className="text-[11px] text-indigo-400 font-mono mt-0.5">
                  {issue.author?.department}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 text-center">
                <span className="text-[10px] text-slate-500 block">
                  Reputation
                </span>
                <span className="font-bold text-amber-400 font-mono">
                  {issue.author?.reputation}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 text-center">
                <span className="text-[10px] text-slate-500 block">Role</span>
                <span className="font-bold text-slate-300 uppercase">
                  {issue.author?.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectUser(issue.authorId)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              View Developer Profile &rarr;
            </button>
          </div>

          {/* Related Issues (Automatically computed from tags/category) */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Related Engineering Issues
            </h4>
            <p className="text-[11px] text-slate-500">
              Matched by common technology tags and category.
            </p>

            {relatedIssues.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No related issues found.
              </p>
            ) : (
              <div className="space-y-2.5">
                {relatedIssues.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectIssue(rel.id)}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500">
                        #{rel.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          rel.status === "solved"
                            ? "text-emerald-400 bg-emerald-950/40"
                            : "text-amber-400 bg-amber-950/40"
                        }`}
                      >
                        {rel.status}
                      </span>
                    </div>
                    <h5 className="font-semibold text-slate-200 line-clamp-2 leading-snug">
                      {rel.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{rel.views} views</span>
                      <span>•</span>
                      <span>{rel.solutionCount} solutions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Solution Modal */}
      <SubmitSolutionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        issueId={issue.id}
        onSolutionSubmitted={() => loadAllData()}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityType={reportTarget.type}
        entityId={reportTarget.id}
        entityTitle={reportTarget.title}
      />

      {/* Mark Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="w-4 h-4 text-amber-400" />
                Mark Issue as Duplicate
              </h3>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the ID of the original issue that already contains the
              discussion or verified solution.
            </p>
            <input
              type="text"
              value={duplicateTargetId}
              onChange={(e) => setDuplicateTargetId(e.target.value)}
              placeholder="e.g. issue-1024"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDuplicate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer"
              >
                Link as Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
