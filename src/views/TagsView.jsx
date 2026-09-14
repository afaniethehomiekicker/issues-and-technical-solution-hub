import React, { useState, useEffect } from "react";
import { Tag, Hash, ArrowRight } from "lucide-react";
import { api } from "../api";

export function TagsView({ onSelectTag }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await api.getTags();
        setTags(data || []);
      } catch (err) {
        console.error("Failed to fetch technology tags", err);
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  const defaultTags = [
    { name: "Go", count: 12, description: "Golang backend services, concurrency, & routines" },
    { name: "Gin", count: 8, description: "High-performance HTTP web framework for Go" },
    { name: "GORM", count: 15, description: "ORMs, DB migrations, & SQL relationship preloading" },
    { name: "React", count: 24, description: "Frontend UI components, state hooks, & JSX rendering" },
    { name: "Tailwind CSS", count: 18, description: "Utility-first styling, responsive layouts, & dark mode" },
    { name: "PostgreSQL", count: 10, description: "Relational database queries, indexing, & connection pools" },
    { name: "Docker", count: 6, description: "Containerization, compose files, & deployment runtimes" },
    { name: "TypeScript", count: 14, description: "Static typing for frontend & Node.js application logic" },
  ];

  const displayTags = tags.length > 0 ? tags : defaultTags;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Technology & Framework Tags
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse engineering problems categorized by specific programming languages, tools, and libraries.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Technology Tags */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-mono">
          Loading technology tags...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTags.map((t) => (
            <div
              key={t.name || t.id}
              onClick={() => onSelectTag(t.name || t.id)}
              className="group p-5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                    <Hash className="w-3.5 h-3.5" />
                    {t.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {t.count || 0} issues
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.description || `Browse all issues tagged with #${t.name}`}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>View tagged issues</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}