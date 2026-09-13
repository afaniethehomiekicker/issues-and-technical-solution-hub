import React, { useState, useEffect } from "react";
import { History, Medal, Shield, Sparkles, Trophy } from "lucide-react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";

export const ProfileView = ({
  userId,
  onSelectIssue,
  onSelectUser,
  currentUser,
}) => {
  const [profileUser, setProfileUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [repHistory, setRepHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const [users, issues] = await Promise.all([
          api.getUsers(),
          api.getIssues({ author: userId }),
        ]);
        setAllUsers(users);
        const target = users.find((u) => u.id === userId) || users[0];
        setProfileUser(target);
        setUserIssues(issues);

        if (target) {
          const history = await api.getReputationHistory(target.id);
          setRepHistory(history);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (loading || !profileUser) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 font-mono">
        Loading developer profile and reputation record...
      </div>
    );
  }

  // Calculate stats
  const rankIndex = [...allUsers]
    .sort((a, b) => b.reputation - a.reputation)
    .findIndex((u) => u.id === profileUser.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Leaderboard Switcher Bar */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-2 shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Team Reputation Leaderboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            {allUsers.map((u, i) => (
              <button
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer whitespace-nowrap ${
                  u.id === profileUser.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="font-mono font-bold text-[10px] opacity-80">
                  #{i + 1}
                </span>
                <span>{u.name.split(" ")[0]}</span>
                <span className="font-mono text-amber-400 font-bold text-[11px]">
                  {u.reputation}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-lg"
              />

              {profileUser.role === "admin" && (
                <span className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-500 text-slate-950 shadow-md">
                  <Shield className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profileUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {profileUser.role}
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-mono">
                @{profileUser.username}
              </p>
              <p className="text-xs text-slate-400">
                {profileUser.department} • Joined{" "}
                {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Standing & Rank Highlight */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 self-start sm:self-auto">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Standing
              </span>
              <span className="text-xl font-bold text-white font-mono">
                #{rankIndex + 1}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Reputation
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                {profileUser.reputation}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-2 border-t border-slate-800/80">
            {profileUser.bio}
          </p>
        )}

        {/* Skills Chips */}
        {profileUser.skills && profileUser.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 mr-1">Skills:</span>
            {profileUser.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-lg bg-indigo-950/40 text-indigo-300 text-xs font-mono border border-indigo-800/40"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Badges Earned Section */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Engineering Badges & Achievements
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(profileUser.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1.5 hover:border-amber-500/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-base">
                {badge.icon}
              </div>
              <h4 className="text-xs font-bold text-slate-200">{badge.name}</h4>
              <p className="text-[10px] text-slate-500 line-clamp-2">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Authored Issues vs Reputation Ledger */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 text-xs gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 font-semibold cursor-pointer transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Reported Issues ({userIssues.length})
          </button>
          <button
            onClick={() => setActiveTab("rep")}
            className={`pb-3 font-semibold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "rep"
                ? "border-amber-500 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Reputation Ledger ({repHistory.length})</span>
          </button>
        </div>

        {/* Tab Content: Issues */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {userIssues.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                This developer hasn't reported any issues yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {userIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onSelect={onSelectIssue}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Reputation History Ledger */}
        {activeTab === "rep" && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 grid grid-cols-12 gap-2">
              <span className="col-span-2">Points</span>
              <span className="col-span-7">Action / Contribution</span>
              <span className="col-span-3 text-right">Date & Time</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {repHistory.length === 0 ? (
                <p className="p-6 text-center text-slate-500">
                  No reputation entries recorded.
                </p>
              ) : (
                repHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-4 py-3 grid grid-cols-12 gap-2 items-center"
                  >
                    <span className="col-span-2 font-mono font-bold text-emerald-400">
                      +{entry.points} pts
                    </span>
                    <span className="col-span-7 text-slate-200">
                      {entry.reason}
                    </span>
                    <span className="col-span-3 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
