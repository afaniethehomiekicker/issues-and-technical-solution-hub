import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Layers,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react";
import { api } from "../api";

export const AdminPortalView = ({ currentUser, onSelectIssue }) => {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New category / tag inputs
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatColor, setNewCatColor] = useState("indigo");
  const [newTagName, setNewTagName] = useState("");

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, reportsData, catsData, tagsData, logsData] =
        await Promise.all([
          api.getAdminStats(),
          api.getUsers(),
          api.getReports(),
          api.getCategories(),
          api.getTags(),
          api.getAuditLogs(),
        ]);
      setStats(statsData);
      setUsers(usersData);
      setReports(reportsData);
      setCategories(catsData);
      setTags(tagsData);
      setAuditLogs(logsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    await api.updateUser(user.id, { status: nextStatus });
    loadAllAdminData();
  };

  const handleToggleUserRole = async (user) => {
    const nextRole = user.role === "admin" ? "developer" : "admin";
    await api.updateUser(user.id, { role: nextRole });
    loadAllAdminData();
  };

  const handleResolveReport = async (reportId, actionTaken) => {
    await api.updateReportStatus(reportId, "resolved", actionTaken);
    loadAllAdminData();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await api.createCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      color: newCatColor,
      icon: "folder",
    });
    setNewCatName("");
    setNewCatDesc("");
    loadAllAdminData();
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await api.createTag({
      name: newTagName.trim().toLowerCase().replace("#", ""),
      description: "System technology tag",
      color: "indigo",
    });
    setNewTagName("");
    loadAllAdminData();
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="py-24 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400">
          You need an Administrator role to access the internal control center.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/50 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>DevResolve Administration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Control & Moderation Center
            </h1>
            <p className="text-xs text-slate-300">
              Manage developer permissions, resolve flagged content, manage
              taxonomy, and audit operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/issues?format=csv"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
            <a
              href="/api/export/issues?format=json"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </a>
          </div>
        </div>

        {/* Quick Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Developers
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {stats.totalUsers}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Total Issues
              </span>
              <span className="text-lg font-bold text-indigo-300 font-mono">
                {stats.totalIssues}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Solved Issues
              </span>
              <span className="text-lg font-bold text-emerald-300 font-mono">
                {stats.solvedIssues}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Solutions
              </span>
              <span className="text-lg font-bold text-amber-300 font-mono">
                {stats.totalSolutions}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50">
              <span className="text-[10px] text-rose-400 uppercase tracking-wider block">
                Pending Reports
              </span>
              <span className="text-lg font-bold text-rose-300 font-mono">
                {stats.pendingReports}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 text-xs gap-4 overflow-x-auto pb-1">
        {[
          { id: "users", label: `Developers (${users.length})`, icon: Users },
          {
            id: "moderation",
            label: `Moderation Queue (${reports.filter((r) => r.status === "pending").length})`,
            icon: AlertTriangle,
          },
          { id: "taxonomy", label: "Categories & Tags", icon: Layers },
          {
            id: "audit",
            label: `Audit Log (${auditLogs.length})`,
            icon: Shield,
          },
          { id: "analytics", label: "Analytics & Insights", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold flex items-center gap-2 cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-amber-500 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Users Management */}
      {activeTab === "users" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-white">
              Registered Engineering Personnel
            </span>
            <span className="text-slate-400 font-mono">
              {users.length} total
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {u.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {u.role}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          u.status === "active"
                            ? "bg-emerald-950 text-emerald-300"
                            : "bg-rose-950 text-rose-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {u.email} • {u.department} •{" "}
                      <strong className="text-amber-400">
                        {u.reputation} rep
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleUserRole(u)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer text-xs"
                  >
                    Set {u.role === "admin" ? "Developer" : "Admin"}
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(u)}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer text-xs ${
                      u.status === "active"
                        ? "bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                        : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60"
                    }`}
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-white">
              Content Moderation & Reports
            </span>
            <span className="text-slate-400 font-mono">
              {reports.filter((r) => r.status === "pending").length} pending
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {reports.length === 0 ? (
              <p className="p-8 text-center text-slate-500">
                No reports submitted.
              </p>
            ) : (
              reports.map((rep) => (
                <div key={rep.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {rep.entityType}
                      </span>
                      <span className="font-semibold text-white">
                        {rep.entityTitle || `Item #${rep.entityId}`}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          rep.status === "pending"
                            ? "bg-amber-950 text-amber-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1">
                    <p>
                      <strong>Reason:</strong> {rep.reason}
                    </p>
                    {rep.details && (
                      <p>
                        <strong>Details:</strong> {rep.details}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Reported by {rep.reporterName || "Anonymous teammate"}
                    </p>
                  </div>

                  {rep.status === "pending" && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleResolveReport(rep.id, "dismiss")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer text-xs"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, "warn_user")}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer text-xs font-medium"
                      >
                        Warn Author
                      </button>
                      <button
                        onClick={() =>
                          handleResolveReport(rep.id, "hide_content")
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer text-xs font-medium"
                      >
                        Take Down Content
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Taxonomy (Categories & Tags) */}
      {activeTab === "taxonomy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Categories Management */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">
                Architecture Categories
              </span>
              <span className="font-mono text-slate-400">
                {categories.length}
              </span>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category Name..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200">
                      {c.name}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {c.description}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {c.issueCount || 0} issues
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Management */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">
                Technology Tags
              </span>
              <span className="font-mono text-slate-400">{tags.length}</span>
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                required
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New technology tag (e.g. rust, k8s)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono"
              />

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold cursor-pointer"
              >
                Add Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto pt-1">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center gap-2"
                >
                  <span>#{t.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {t.usageCount}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === "audit" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-white">
              System Security & Operation Audit Trail
            </span>
            <span className="text-slate-400 font-mono">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-300 font-mono">
                      {log.userName}
                    </span>
                    <span className="text-slate-400">{log.action}</span>
                    <span className="font-mono text-slate-300 text-[11px] bg-slate-800 px-1.5 py-0.2 rounded">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {log.details}
                  </p>
                </div>
                <span className="text-slate-500 font-mono text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics & Insights */}
      {activeTab === "analytics" && stats && (
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Status Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.statusDistribution || {}).map(
                  ([st, count]) => (
                    <div key={st} className="flex items-center justify-between">
                      <span className="capitalize text-slate-300">
                        {st.replace("_", " ")}
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {count}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Priority Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.priorityDistribution || {}).map(
                  ([pr, count]) => (
                    <div key={pr} className="flex items-center justify-between">
                      <span className="capitalize text-slate-300">{pr}</span>
                      <span className="font-mono font-bold text-slate-200">
                        {count}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Top Solution Contributors
              </h3>
              <div className="space-y-2">
                {users
                  .sort((a, b) => b.reputation - a.reputation)
                  .slice(0, 5)
                  .map((u, i) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">
                          #{i + 1}
                        </span>
                        <span className="text-slate-200">{u.name}</span>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">
                        {u.reputation} rep
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
