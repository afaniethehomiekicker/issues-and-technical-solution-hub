import React, { useState, useEffect } from "react";
import { api } from "../api";
import { X, Pencil, Code, Server, AlertCircle, FileText } from "lucide-react";

export function EditIssueModal({ isOpen, onClose, issue, onIssueUpdated, categories = [], tags = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    priority: "Normal",
    technology: "",
    language: "",
    os: "",
    frameworkVersion: "",
    databaseVersion: "",
    description: "",
    expectedBehavior: "",
    actualBehavior: "",
    stepsToReproduce: "",
    errorLogs: "",
    codeSnippet: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || "",
        categoryId: issue.categoryId || issue.category?.id || "",
        priority: issue.priority || "Normal",
        technology: issue.technology || "",
        language: issue.language || "",
        os: issue.os || "",
        frameworkVersion: issue.frameworkVersion || "",
        databaseVersion: issue.databaseVersion || "",
        description: issue.description || "",
        expectedBehavior: issue.expectedBehavior || "",
        actualBehavior: issue.actualBehavior || "",
        stepsToReproduce: issue.stepsToReproduce || "",
        errorLogs: issue.errorLogs || "",
        codeSnippet: issue.codeSnippet || "",
      });
    }
  }, [issue]);

  if (!isOpen || !issue) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and Description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updated = await api.updateIssue(issue.id, formData);
      onIssueUpdated(updated || { ...issue, ...formData });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-indigo-500" />
            Edit Issue #{issue.id}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Issue Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. GORM Preload not loading nested relationship"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Language / Tech Stack
                </label>
                <input
                  type="text"
                  name="technology"
                  value={formData.technology}
                  onChange={handleChange}
                  placeholder="e.g. Go / Gin / GORM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Environment Specs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-500" /> Environment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                name="os"
                value={formData.os}
                onChange={handleChange}
                placeholder="OS (e.g. Ubuntu 24.04)"
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="frameworkVersion"
                value={formData.frameworkVersion}
                onChange={handleChange}
                placeholder="Framework (e.g. Go 1.25 / Gin)"
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="databaseVersion"
                value={formData.databaseVersion}
                onChange={handleChange}
                placeholder="Database (e.g. PostgreSQL 17)"
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Problem Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Expected Behavior
                </label>
                <textarea
                  name="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Actual Behavior
                </label>
                <textarea
                  name="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Steps to Reproduce
              </label>
              <textarea
                name="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={handleChange}
                rows="3"
                placeholder="1. Start database server&#10;2. Execute query with Preload..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Error & Code Block */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Error Message / Stack Trace
              </label>
              <textarea
                name="errorLogs"
                value={formData.errorLogs}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 bg-slate-900 text-red-400 font-mono text-xs border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-indigo-400" /> Code Snippet
              </label>
              <textarea
                name="codeSnippet"
                value={formData.codeSnippet}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Update Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 