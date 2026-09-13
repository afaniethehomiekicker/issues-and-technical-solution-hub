import React, { useState } from "react";
import {
  Check,
  Code,
  Link as LinkIcon,
  Plus,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../api";

export const SubmitSolutionModal = ({
  isOpen,
  onClose,
  issueId,
  onSolutionSubmitted,
}) => {
  const [explanation, setExplanation] = useState("");
  const [codeSnippets, setCodeSnippets] = useState([
    { id: "1", title: "Solution Code", language: "go", code: "" },
  ]);
  const [configCommands, setConfigCommands] = useState("");
  const [linksText, setLinksText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddSnippet = () => {
    setCodeSnippets([
      ...codeSnippets,
      {
        id: String(Date.now()),
        title: `Code Snippet #${codeSnippets.length + 1}`,
        language: "typescript",
        code: "",
      },
    ]);
  };

  const handleUpdateSnippet = (id, field, val) => {
    setCodeSnippets(
      codeSnippets.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  };

  const handleRemoveSnippet = (id) => {
    setCodeSnippets(codeSnippets.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setError("Please provide a technical explanation for the solution.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const links = linksText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      await api.createSolution(issueId, {
        explanation,
        codeSnippets: codeSnippets.filter((s) => s.code.trim().length > 0),
        configCommands,
        links,
        attachments: [],
      });

      onSolutionSubmitted();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-white">
              Provide Technical Solution
            </h2>
            <p className="text-xs text-slate-400">
              Submit an actionable fix with code examples, configuration
              commands, or root cause analysis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Solution Explanation{" "}
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the issue occurs and how this solution resolves it..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* Code Snippets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Solution Code Examples
              </span>
              <button
                type="button"
                onClick={handleAddSnippet}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Code Snippet
              </button>
            </div>

            {codeSnippets.map((snippet) => (
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
                    placeholder="Snippet Title (e.g. Corrected Query)"
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
                    placeholder="Language"
                    className="w-28 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono uppercase"
                  />

                  {codeSnippets.length > 1 && (
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
                  placeholder="// Paste fixed code snippet..."
                  className="w-full p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Configuration & Terminal Commands */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              Configuration / Terminal Commands (Optional)
            </label>
            <textarea
              rows={3}
              value={configCommands}
              onChange={(e) => setConfigCommands(e.target.value)}
              placeholder="e.g. npm install -D @types/react&#10;docker run -p 5432:5432 postgres:17"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono"
            />
          </div>

          {/* Reference Links */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              Documentation & Reference Links (One per line)
            </label>
            <textarea
              rows={2}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="https://gorm.io/docs/preload.html&#10;https://pkg.go.dev/github.com/lib/pq"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
            />
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting ? "Posting..." : "Submit Solution (+10 Rep)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
