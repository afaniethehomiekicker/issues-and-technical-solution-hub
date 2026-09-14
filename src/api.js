// Storage keys
const ACTIVE_USER_KEY = "devresolve_active_user_id";
const DB_PREFIX = "devresolve_db_";

// Helper utilities for local persistence
function getStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(DB_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn("LocalStorage write failed", e);
  }
}

// Initial Mock Seed Data - Only single Admin account
const DEFAULT_USERS = [
  {
    id: "usr-admin",
    name: "System Admin",
    username: "admin",
    email: "admin",
    password: "admin",
    role: "Admin",
    bio: "DevResolve System Administrator",
    skills: ["Go", "React", "PostgreSQL", "System Architecture"],
    reputation: 100,
    issuesPosted: 0,
    solutionsProvided: 0,
    acceptedSolutions: 0,
    status: "active",
    joinedDate: new Date().toISOString().split("T")[0],
  }
];

const DEFAULT_CATEGORIES = [];
const DEFAULT_TAGS = [];
const DEFAULT_ISSUES = [];
const DEFAULT_SOLUTIONS = [];
const DEFAULT_COMMENTS = [];

// Seed storage if empty
if (!getStorage("users", null)) setStorage("users", DEFAULT_USERS);
if (!getStorage("categories", null)) setStorage("categories", DEFAULT_CATEGORIES);
if (!getStorage("tags", null)) setStorage("tags", DEFAULT_TAGS);
if (!getStorage("issues", null)) setStorage("issues", DEFAULT_ISSUES);
if (!getStorage("solutions", null)) setStorage("solutions", DEFAULT_SOLUTIONS);
if (!getStorage("comments", null)) setStorage("comments", DEFAULT_COMMENTS);
if (!getStorage("bookmarks", null)) setStorage("bookmarks", []);
if (!getStorage("notifications", null)) setStorage("notifications", []);
if (!getStorage("reports", null)) setStorage("reports", []);
if (!getStorage("activities", null)) setStorage("activities", []);
if (!getStorage("audit_logs", null)) setStorage("audit_logs", []);

// Auth helpers
export function getStoredUserId() {
  return localStorage.getItem(ACTIVE_USER_KEY) || null;
}

export function setStoredUserId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_USER_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

// Client API Mock Engine
export const api = {
  // Auth & Users
  async getUsers() {
    return getStorage("users", []);
  },

  async login(identifier, password) {
    const users = getStorage("users", []);
    const user = users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password
    );
    if (!user) throw new Error("Invalid username/email or password");
    setStoredUserId(user.id);
    return { token: "client-mock-jwt-token", user };
  },

  async register(userData) {
    const users = getStorage("users", []);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name || userData.username,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: "Developer",
      bio: userData.bio || "",
      skills: userData.skills || [],
      reputation: 10,
      issuesPosted: 0,
      solutionsProvided: 0,
      acceptedSolutions: 0,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    setStorage("users", users);
    setStoredUserId(newUser.id);
    return { token: "client-mock-jwt-token", user: newUser };
  },

  async getMe() {
    const userId = getStoredUserId();
    if (!userId) return null;
    const users = getStorage("users", []);
    const user = users.find((u) => u.id === userId);
    return user || null;
  },

  async updateProfile(profileData) {
    const userId = getStoredUserId();
    const users = getStorage("users", []);
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...profileData };
      setStorage("users", users);
      return users[index];
    }
    return null;
  },

  async getUserProfile(id) {
    const users = getStorage("users", []);
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },

  async updateUserStatus(id, status, role) {
    const users = getStorage("users", []);
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], status, role };
      setStorage("users", users);
      return users[index];
    }
    return null;
  },

  async updateUser(id, updates) {
    return this.updateUserStatus(id, updates.status, updates.role);
  },

  async getReputationHistory(userId) {
    return [
      { id: "rep-1", action: "Account creation", score: +10, date: new Date().toISOString().split("T")[0] }
    ];
  },

  // Categories & Tags
  async getCategories() {
    return getStorage("categories", []);
  },

  async createCategory(data) {
    const categories = getStorage("categories", []);
    const newCat = { id: `cat-${Date.now()}`, ...data };
    categories.push(newCat);
    setStorage("categories", categories);
    return newCat;
  },

  async updateCategory(id, data) {
    const categories = getStorage("categories", []);
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...data };
      setStorage("categories", categories);
      return categories[index];
    }
    return null;
  },

  async getTags() {
    return getStorage("tags", []);
  },

  async createTag(data) {
    const tags = getStorage("tags", []);
    const newTag = { id: `tag-${Date.now()}`, ...data };
    tags.push(newTag);
    setStorage("tags", tags);
    return newTag;
  },

  async updateTag(id, data) {
    const tags = getStorage("tags", []);
    const index = tags.findIndex((t) => t.id === id);
    if (index !== -1) {
      tags[index] = { ...tags[index], ...data };
      setStorage("tags", tags);
      return tags[index];
    }
    return null;
  },

  // Issues
  async getIssues(params = {}) {
    let issues = getStorage("issues", []);
    if (params.search) {
      const q = params.search.toLowerCase();
      issues = issues.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (params.category) {
      issues = issues.filter((i) => i.category === params.category || i.categoryId === params.category);
    }
    if (params.status) {
      issues = issues.filter((i) => i.status === params.status);
    }
    return issues;
  },

  async getTrendingIssues() {
    const issues = getStorage("issues", []);
    return [...issues].sort((a, b) => b.views - a.views).slice(0, 5);
  },

  async getIssue(id) {
    const issues = getStorage("issues", []);
    const issue = issues.find((i) => i.id === id);
    if (!issue) throw new Error("Issue not found");
    issue.views = (issue.views || 0) + 1;
    setStorage("issues", issues);
    return issue;
  },

  async getRelatedIssues(id) {
    const issues = getStorage("issues", []);
    const current = issues.find((i) => i.id === id);
    if (!current) return [];
    return issues.filter(
      (i) => i.id !== id && (i.category === current.category || i.language === current.language)
    );
  },

  async createIssue(issueData) {
    const issues = getStorage("issues", []);
    const user = await this.getMe();
    const newIssue = {
      id: `issue-${Date.now()}`,
      ...issueData,
      authorId: user.id,
      author: { id: user.id, name: user.name, username: user.username },
      views: 1,
      likes: 0,
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    issues.unshift(newIssue);
    setStorage("issues", issues);
    return newIssue;
  },

  async updateIssue(id, updates) {
    const issues = getStorage("issues", []);
    const index = issues.findIndex((i) => i.id === id);
    if (index !== -1) {
      issues[index] = { ...issues[index], ...updates, updatedAt: new Date().toISOString() };
      setStorage("issues", issues);
      return issues[index];
    }
    return null;
  },

  async updateIssueStatus(id, status) {
    return this.updateIssue(id, { status });
  },

  async markDuplicate(id, duplicateOfId) {
    return this.updateIssue(id, { status: "Closed", duplicateOfId });
  },

  async deleteIssue(id) {
    const issues = getStorage("issues", []);
    const filtered = issues.filter((i) => i.id !== id);
    setStorage("issues", filtered);
    return true;
  },

  // Solutions
  async getSolutions(issueId) {
    const solutions = getStorage("solutions", []);
    return solutions.filter((s) => s.issueId === issueId);
  },

  async createSolution(issueId, solutionData) {
    const solutions = getStorage("solutions", []);
    const user = await this.getMe();
    const newSolution = {
      id: `sol-${Date.now()}`,
      issueId,
      authorId: user.id,
      author: { id: user.id, name: user.name, username: user.username },
      content: solutionData.content || solutionData,
      isAccepted: false,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    solutions.push(newSolution);
    setStorage("solutions", solutions);
    return newSolution;
  },

  async acceptSolution(solutionId) {
    const solutions = getStorage("solutions", []);
    const solution = solutions.find((s) => s.id === solutionId);
    if (!solution) throw new Error("Solution not found");

    solutions.forEach((s) => {
      if (s.issueId === solution.issueId) s.isAccepted = false;
    });
    solution.isAccepted = true;
    setStorage("solutions", solutions);

    await this.updateIssueStatus(solution.issueId, "Solved");
    return solution;
  },

  async deleteSolution(solutionId) {
    const solutions = getStorage("solutions", []);
    setStorage("solutions", solutions.filter((s) => s.id !== solutionId));
    return true;
  },

  // Comments
  async getComments(issueId) {
    const comments = getStorage("comments", []);
    return comments.filter((c) => c.issueId === issueId);
  },

  async createComment(issueId, content, parentCommentId = null) {
    const comments = getStorage("comments", []);
    const user = await this.getMe();
    const newComment = {
      id: `cmt-${Date.now()}`,
      issueId,
      authorId: user.id,
      author: { id: user.id, name: user.name, username: user.username },
      content,
      parentCommentId,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    setStorage("comments", comments);
    return newComment;
  },

  async deleteComment(commentId) {
    const comments = getStorage("comments", []);
    setStorage("comments", comments.filter((c) => c.id !== commentId));
    return true;
  },

  // Reactions
  async toggleReaction(entityType, entityId) {
    if (entityType === "issue") {
      const issues = getStorage("issues", []);
      const issue = issues.find((i) => i.id === entityId);
      if (issue) {
        issue.likes = (issue.likes || 0) + 1;
        setStorage("issues", issues);
        return { likes: issue.likes };
      }
    }
    return { success: true };
  },

  // Bookmarks
  async getBookmarks() {
    const bookmarkIds = getStorage("bookmarks", []);
    const issues = getStorage("issues", []);
    return issues.filter((i) => bookmarkIds.includes(i.id));
  },

  async toggleBookmark(issueId) {
    let bookmarkIds = getStorage("bookmarks", []);
    if (bookmarkIds.includes(issueId)) {
      bookmarkIds = bookmarkIds.filter((id) => id !== issueId);
    } else {
      bookmarkIds.push(issueId);
    }
    setStorage("bookmarks", bookmarkIds);
    return { bookmarked: bookmarkIds.includes(issueId) };
  },

  // Notifications
  async getNotifications() {
    return getStorage("notifications", []);
  },

  async markNotificationRead(id) {
    const notifications = getStorage("notifications", []);
    const notif = notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    setStorage("notifications", notifications);
    return true;
  },

  async markAllNotificationsRead() {
    const notifications = getStorage("notifications", []);
    notifications.forEach((n) => (n.read = true));
    setStorage("notifications", notifications);
    return true;
  },

  // Reports & Moderation
  async getReports() {
    return getStorage("reports", []);
  },

  async createReport(reportData) {
    const reports = getStorage("reports", []);
    const newReport = { id: `rep-${Date.now()}`, status: "pending", ...reportData };
    reports.push(newReport);
    setStorage("reports", reports);
    return newReport;
  },

  async resolveReport(id, status, notes) {
    const reports = getStorage("reports", []);
    const report = reports.find((r) => r.id === id);
    if (report) {
      report.status = status;
      report.notes = notes;
      setStorage("reports", reports);
    }
    return report;
  },

  async updateReportStatus(id, status, actionTaken) {
    return this.resolveReport(id, status, actionTaken);
  },

  // Activity & Audit Logs
  async getActivities() {
    return getStorage("activities", []);
  },

  async getAuditLogs() {
    return getStorage("audit_logs", []);
  },

  // Admin Stats
  async getAdminStats() {
    const users = getStorage("users", []);
    const issues = getStorage("issues", []);
    const solutions = getStorage("solutions", []);

    return {
      totalDevelopers: users.length,
      activeDevelopers: users.filter((u) => u.status === "active").length,
      totalIssues: issues.length,
      openIssues: issues.filter((i) => i.status === "Open").length,
      solvedIssues: issues.filter((i) => i.status === "Solved").length,
      totalSolutions: solutions.length,
      acceptedSolutions: solutions.filter((s) => s.isAccepted).length,
    };
  },
};