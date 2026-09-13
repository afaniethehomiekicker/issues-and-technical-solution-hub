import React, { useState } from "react";
import { Check, Shield, Users, X } from "lucide-react";
import { api, setStoredUserId } from "../api";

export const UserSwitcherModal = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUserChanged,
}) => {
  const [tab, setTab] = useState("switch");

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDept, setRegDept] = useState("Backend Core");
  const [regRole, setRegRole] = useState("developer");

  // Edit profile state
  const [profileBio, setProfileBio] = useState(currentUser?.bio || "");
  const [profileDept, setProfileDept] = useState(currentUser?.department || "");
  const [profileSkills, setProfileSkills] = useState(
    currentUser?.skills?.join(", ") || "",
  );

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectUser = (user) => {
    setStoredUserId(user.id);
    onUserChanged(user);
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.login(loginIdentifier, loginPassword);
      onUserChanged(res.user);
      onClose();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.register({
        name: regName,
        username: regUsername,
        email: regEmail,
        department: regDept,
        role: regRole,
        skills: ["TypeScript", "Go", "Docker"],
      });
      onUserChanged(res.user);
      onClose();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile({
        bio: profileBio,
        department: profileDept,
        skills: profileSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      onUserChanged(updated);
      setMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMsg({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Accounts & Developer Roles
              </h2>
              <p className="text-[11px] text-slate-400">
                Switch active team persona or manage authentication.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => {
              setTab("switch");
              setMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors cursor-pointer border-b-2 ${
              tab === "switch"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Quick Switch
          </button>
          <button
            onClick={() => {
              setTab("profile");
              setMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors cursor-pointer border-b-2 ${
              tab === "profile"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => {
              setTab("login");
              setMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors cursor-pointer border-b-2 ${
              tab === "login"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setTab("register");
              setMsg(null);
            }}
            className={`flex-1 py-2.5 text-center font-medium transition-colors cursor-pointer border-b-2 ${
              tab === "register"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {msg && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-800 text-emerald-300"
                  : "bg-rose-950/40 border border-rose-800 text-rose-300"
              }`}
            >
              <span>{msg.text}</span>
            </div>
          )}

          {/* Quick Switch Tab */}
          {tab === "switch" && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs text-slate-400 mb-3">
                Click any team member below to immediately assume their role and
                permissions:
              </p>
              {allUsers.map((user) => {
                const isActive = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-950/40 border-indigo-500 text-white"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />

                        {user.role === "admin" && (
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-slate-950">
                            <Shield className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {user.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                              user.role === "admin"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {user.department} •{" "}
                          <span className="text-amber-400">
                            {user.reputation} rep
                          </span>
                        </p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-xs text-indigo-400 font-semibold">
                        <Check className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-slate-300">
                        Switch &rarr;
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Profile Tab */}
          {tab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Technical Focus
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Team
                </label>
                <input
                  type="text"
                  value={profileDept}
                  onChange={(e) => setProfileDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skills & Core Competencies (comma separated)
                </label>
                <input
                  type="text"
                  value={profileSkills}
                  onChange={(e) => setProfileSkills(e.target.value)}
                  placeholder="Go, PostgreSQL, Docker, React..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          )}

          {/* Login Tab */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="ahmed@devhub.internal or ahmedk"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register Tab */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="tariqm"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tariq@devhub.internal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  placeholder="Backend Core, Mobile, DevOps..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
