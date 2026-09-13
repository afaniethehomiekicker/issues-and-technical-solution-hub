import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Code,
  FileCode,
  HelpCircle,
  Plus,
  Terminal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../api";

export const NewIssueModal = ({
  isOpen,
  onClose,
  onCreated,
  categories,
  tags: availableTags,
}) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id || "cat-backend",
  );
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [language, setLanguage] = useState("Go");
  const [technology, setTechnology] = useState("Go / Gin / GORM");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");

  // Structured environment
  const [os, setOs] = useState("Ubuntu 24.04 LTS");
  const [langVersion, setLangVersion] = useState("");
  const [frameworkVersion, setFrameworkVersion] = useState("");
  const [database, setDatabase] = useState("PostgreSQL 17");
  const [browser, setBrowser] = useState("");
  const [otherEnv, setOtherEnv] = useState("Docker / Nginx");

  // Error details
  const [errorMessage, setErrorMessage] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");

  // Behaviors
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");

  // Code snippets
  const [snippets, setSnippets] = useState([
    { id: "1", title: "Problematic Code", language: "go", code: "" },
  ]);

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Similar issues check
  const [similarIssues, setSimilarIssues] = useState([]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  // Debounced check for existing duplicate/similar issues
  useEffect(() => {
    if (title.length > 6) {
      const timer = setTimeout(async () => {
        try {
          const list = await api.getIssues({ search: title.slice(0, 20) });
          setSimilarIssues(list.slice(0, 3));
        } catch {
          // ignore
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSimilarIssues([]);
    }
  }, [title]);

  if (!isOpen) return null;

  const handleAddTag = (tName) => {
    const trimmed = tName.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tName) => {
    setSelectedTags(selectedTags.filter((t) => t !== tName));
  };

  const handleAddSnippet = () => {
    setSnippets([
      ...snippets,
      {
        id: String(Date.now()),
        title: `Snippet #${snippets.length + 1}`,
        language: language.toLowerCase() || "typescript",
        code: "",
      },
    ]);
  };

  const handleUpdateSnippet = (id, field, val) => {
    setSnippets(
      snippets.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  };

  const handleRemoveSnippet = (id) => {
    setSnippets(snippets.filter((s) => s.id !== id));
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const newAtt = {
        id: "att-" + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: event.target?.result || "",
        uploadedAt: new Date().toISOString(),
      };
      setAttachments([...attachments, newAtt]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide an issue title and description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        categoryId,
        tags: selectedTags,
        language,
        technology,
        priority,
        environment: {
          os,
          languageVersion: langVersion,
          frameworkVersion,
          database,
          browser,
          other: otherEnv,
        },
        errorDetails: {
          message: errorMessage,
          stackTrace,
          terminalOutput,
        },
        expectedBehavior,
        actualBehavior,
        stepsToReproduce,
        codeSnippets: snippets.filter((s) => s.code.trim().length > 0),
        attachments,
      };

      const newIssue = await api.createIssue(payload);
      onCreated(newIssue.id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Create Developer Technical Issue
              </h2>
              <p className="text-xs text-slate-400">
                Document technical problems, stack traces, reproduction steps,
                and environment specs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Similar Issues Warning (Duplicate prevention) */}
          {similarIssues.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200">
              <div className="font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
                <HelpCircle className="w-3.5 h-3.5" />
                Existing similar issues found — check before posting duplicates:
              </div>
              <ul className="space-y-1 mt-1.5">
                {similarIssues.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 text-slate-300"
                  >
                    <span className="font-mono text-amber-400">#{s.id}</span>
                    <span className="truncate">{s.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Issue Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GORM Preload not loading nested relationship in Go 1.25"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Meta Grid: Category, Priority, Tech, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Go, TypeScript, Python..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Framework / Stack
              </label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="Go / Gin / GORM, React 19..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Technology Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-700 min-h-[42px]">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none px-2"
              />
            </div>
            {/* Quick available tags suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {availableTags.slice(0, 10).map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleAddTag(t.name)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  +{t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the technical background, architecture, and what goes wrong..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* Structured Environment Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              Environment & Infrastructure Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Operating System
                </label>
                <input
                  type="text"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  placeholder="Ubuntu 24.04, macOS 15..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Language Version
                </label>
                <input
                  type="text"
                  value={langVersion}
                  onChange={(e) => setLangVersion(e.target.value)}
                  placeholder="Go 1.25, Node 22..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Database / Cache
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="PostgreSQL 17, Redis 7..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Framework Version
                </label>
                <input
                  type="text"
                  value={frameworkVersion}
                  onChange={(e) => setFrameworkVersion(e.target.value)}
                  placeholder="Gin v1.10, React 19.0.1..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Other Runtimes / Tools
                </label>
                <input
                  type="text"
                  value={otherEnv}
                  onChange={(e) => setOtherEnv(e.target.value)}
                  placeholder="Docker Swarm, Nginx, BuildKit..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Error & Stack Trace */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1.5">
                Error Message
              </label>
              <input
                type="text"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g. pq: remaining connection slots are reserved for non-replication superuser connections (FATAL 53300)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-900/40 text-xs text-rose-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Stack Trace / Console Output / Logs
              </label>
              <textarea
                rows={3}
                value={terminalOutput}
                onChange={(e) => setTerminalOutput(e.target.value)}
                placeholder="Paste raw terminal logs, panic stack trace, or compiler errors here..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Expected vs Actual & Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                Expected Behavior
              </label>
              <textarea
                rows={2}
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="What should have occurred..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                Actual Behavior
              </label>
              <textarea
                rows={2}
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
                placeholder="What actually occurred..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Steps to Reproduce
            </label>
            <textarea
              rows={3}
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Start database with docker compose up&#10;2. Execute query invoice with Preload&#10;3. Observe response..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 leading-relaxed"
            />
          </div>

          {/* Code Snippets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Code Snippets
              </span>
              <button
                type="button"
                onClick={handleAddSnippet}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Snippet
              </button>
            </div>

            {snippets.map((snippet, idx) => (
              <div
                key={snippet.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={snippet.title}
                    onChange={(e) =>
                      handleUpdateSnippet(snippet.id, "title", e.target.value)
                    }
                    placeholder="Snippet Title"
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                  />

                  <input
                    type="text"
                    value={snippet.language}
                    onChange={(e) =>
                      handleUpdateSnippet(
                        snippet.id,
                        "language",
                        e.target.value,
                      )
                    }
                    placeholder="Language (go, ts, sql...)"
                    className="w-32 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono uppercase"
                  />

                  {snippets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSnippet(snippet.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={snippet.code}
                  onChange={(e) =>
                    handleUpdateSnippet(snippet.id, "code", e.target.value)
                  }
                  placeholder="// Paste relevant code here..."
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Attachments / Screenshots */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Screenshots / Log Attachments (PNG, JPG, LOG, TXT)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors border border-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Attachment</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.txt,.log,.pdf"
                />
              </label>
              {attachments.map((att, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700"
                >
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments(attachments.filter((_, idx) => idx !== i))
                    }
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Publishing...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Publish Issue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
