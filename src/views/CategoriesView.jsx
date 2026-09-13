import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Cloud,
  Database,
  Layers,
  Layout,
  Plus,
  Server,
  Shield,
  Smartphone,
  Tag as TagIcon,
} from "lucide-react";
import { api } from "../api";

export const CategoriesView = ({
  onSelectCategory,
  onSelectTag,
  currentUser,
}) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick category creator state (if admin)
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatColor, setNewCatColor] = useState("indigo");

  const isAdmin = currentUser?.role === "admin";

  const loadData = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        api.getCategories(),
        api.getTags(),
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        color: newCatColor,
        icon: "folder",
      });
      setNewCatName("");
      setNewCatDesc("");
      setShowAddCat(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case "server":
        return <Server className="w-5 h-5" />;
      case "layout":
        return <Layout className="w-5 h-5" />;
      case "database":
        return <Database className="w-5 h-5" />;
      case "cloud":
        return <Cloud className="w-5 h-5" />;
      case "smartphone":
        return <Smartphone className="w-5 h-5" />;
      case "shield":
        return <Shield className="w-5 h-5" />;
      case "cpu":
        return <BrainCircuit className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Architecture & Domain Categories</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse engineering problems structured by systems architecture and
            tech stack layers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Admin Quick Category Creator */}
      {showAddCat && (
        <form
          onSubmit={handleCreateCategory}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 animate-in fade-in duration-100"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Create Architecture Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Data Science & ML"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Description
              </label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="PyTorch, model serving, pipelines..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Color theme
              </label>
              <select
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value="indigo">Indigo</option>
                <option value="cyan">Cyan</option>
                <option value="emerald">Emerald</option>
                <option value="amber">Amber</option>
                <option value="rose">Rose</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddCat(false)}
              className="px-3 py-1.5 text-xs text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer shadow-md hover:shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {cat.issueCount || 0} issues
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-indigo-400 group-hover:text-indigo-300 font-medium">
                Browse problems &rarr;
              </span>
              <span className="text-slate-600 font-mono text-[11px]">
                #{cat.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Technology Tags Cloud Section */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Technology & Framework Tags
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {tags.length} active tags
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Filter solutions and issues by specific programming languages,
          libraries, protocols, and toolchains.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.name)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-indigo-300 transition-all cursor-pointer group"
            >
              <span className="font-semibold">#{tag.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:bg-indigo-900 group-hover:text-indigo-200">
                {tag.usageCount}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
