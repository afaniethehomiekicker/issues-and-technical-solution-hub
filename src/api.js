// Storage key for active user ID
const ACTIVE_USER_KEY = "devresolve_active_user_id";

export function getStoredUserId() {
  return localStorage.getItem(ACTIVE_USER_KEY) || "usr-ahmed";
}

export function setStoredUserId(id) {
  localStorage.setItem(ACTIVE_USER_KEY, id);
}

function getHeaders() {
  const userId = getStoredUserId();
  return {
    "Content-Type": "application/json",
    "x-user-id": userId,
  };
}

// API Requests
export const api = {
  // Auth & Users
  async getUsers() {
    const res = await fetch("/api/auth/users");
    return res.json();
  },

  async login(identifier, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to login");
    }
    const data = await res.json();
    setStoredUserId(data.user.id);
    return data;
  },

  async register(userData) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to register");
    }
    const data = await res.json();
    setStoredUserId(data.user.id);
    return data;
  },

  async getMe() {
    const res = await fetch("/api/auth/me", { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  async getUserProfile(id) {
    const res = await fetch(`/api/users/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async updateUserStatus(id, status, role) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, role }),
    });
    return res.json();
  },

  async updateUser(id, updates) {
    return this.updateUserStatus(id, updates.status, updates.role);
  },

  async getReputationHistory(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.reputationHistory || [];
    } catch {
      return [];
    }
  },

  // Categories & Tags
  async getCategories() {
    const res = await fetch("/api/categories");
    return res.json();
  },

  async createCategory(data) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCategory(id, data) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getTags() {
    const res = await fetch("/api/tags");
    return res.json();
  },

  async createTag(data) {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTag(id, data) {
    const res = await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Issues
  async getIssues(params) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/issues?${query.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTrendingIssues() {
    const res = await fetch("/api/issues/trending", { headers: getHeaders() });
    return res.json();
  },

  async getIssue(id) {
    const res = await fetch(`/api/issues/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Issue not found");
    return res.json();
  },

  async getRelatedIssues(id) {
    const res = await fetch(`/api/issues/${id}/related`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createIssue(issueData) {
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(issueData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create issue");
    }
    return res.json();
  },

  async updateIssue(id, updates) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async updateIssueStatus(id, status) {
    const res = await fetch(`/api/issues/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async markDuplicate(id, duplicateOfId) {
    const res = await fetch(`/api/issues/${id}/duplicate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ duplicateOfId }),
    });
    return res.json();
  },

  async deleteIssue(id) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.ok;
  },

  // Solutions
  async getSolutions(issueId) {
    const res = await fetch(`/api/issues/${issueId}/solutions`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createSolution(issueId, solutionData) {
    const res = await fetch(`/api/issues/${issueId}/solutions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(solutionData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit solution");
    }
    return res.json();
  },

  async acceptSolution(solutionId) {
    const res = await fetch(`/api/solutions/${solutionId}/accept`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return res.json();
  },

  async deleteSolution(solutionId) {
    const res = await fetch(`/api/solutions/${solutionId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.ok;
  },

  // Comments
  async getComments(issueId) {
    const res = await fetch(`/api/issues/${issueId}/comments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createComment(issueId, content, parentCommentId) {
    const res = await fetch(`/api/issues/${issueId}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content, parentCommentId }),
    });
    return res.json();
  },

  async deleteComment(commentId) {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.ok;
  },

  // Reactions
  async toggleReaction(entityType, entityId, reactionType) {
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ entityType, entityId, reactionType }),
    });
    return res.json();
  },

  // Bookmarks
  async getBookmarks() {
    const res = await fetch("/api/bookmarks", { headers: getHeaders() });
    return res.json();
  },

  async toggleBookmark(issueId) {
    const res = await fetch("/api/bookmarks/toggle", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ issueId }),
    });
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch("/api/notifications", { headers: getHeaders() });
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return res.ok;
  },

  async markAllNotificationsRead() {
    const res = await fetch("/api/notifications/read-all", {
      method: "PUT",
      headers: getHeaders(),
    });
    return res.ok;
  },

  // Reports & Moderation
  async getReports(status) {
    const q = status ? `?status=${status}` : "";
    const res = await fetch(`/api/reports${q}`, { headers: getHeaders() });
    return res.json();
  },

  async createReport(reportData) {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(reportData),
    });
    return res.json();
  },

  async resolveReport(id, status, notes, hideContent = false) {
    const res = await fetch(`/api/reports/${id}/resolve`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, notes, hideContent }),
    });
    return res.json();
  },

  async updateReportStatus(id, status, actionTaken) {
    return this.resolveReport(
      id,
      status,
      actionTaken,
      actionTaken === "hide_content",
    );
  },

  // Activity & Audit Logs
  async getActivities() {
    const res = await fetch("/api/activities", { headers: getHeaders() });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch("/api/audit-logs", { headers: getHeaders() });
    return res.json();
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch("/api/admin/stats", { headers: getHeaders() });
    return res.json();
  },
};
