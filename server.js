import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { User } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing and form encoding
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Helper to get active user from request header
  const getActor = (req: express.Request): User | undefined => {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (userId) {
      return db.getUserById(userId);
    }
    // Default to admin or first user if none provided
    return db.getUserById('usr-admin');
  };

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth & Users
  app.get('/api/auth/users', (req, res) => {
    const users = db.getUsers();
    res.json(users);
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Username or email is required' });
    }
    const user = db.getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is deactivated. Please contact an administrator.' });
    }
    // Update last login
    db.updateUser(user.id, { lastLogin: new Date().toISOString() });
    res.json({ user, token: 'mock-jwt-token-' + user.id });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, username, email, department, role, skills, technologies, bio } = req.body;
    if (!name || !username || !email) {
      return res.status(400).json({ error: 'Name, username, and email are required' });
    }
    const existing = db.getUserByEmailOrUsername(username) || db.getUserByEmailOrUsername(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this username or email already exists' });
    }

    const newUser: User = {
      id: 'usr-' + Date.now().toString().slice(-6),
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: bio || 'Software engineer passionate about building reliable software.',
      role: role === 'admin' ? 'admin' : 'developer',
      department: department || 'Engineering',
      skills: Array.isArray(skills) ? skills : ['Software Development', 'Problem Solving'],
      technologies: Array.isArray(technologies) ? technologies : ['JavaScript', 'TypeScript'],
      status: 'active',
      reputation: 10,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.createUser(newUser);
    db.addActivity({
      userId: newUser.id,
      userName: newUser.name,
      userAvatar: newUser.avatar,
      action: 'joined DevResolve',
      entityType: 'user',
      entityId: newUser.id,
      entityTitle: newUser.name,
    });

    res.status(201).json({ user: newUser, token: 'mock-jwt-token-' + newUser.id });
  });

  app.get('/api/auth/me', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(actor);
  });

  app.put('/api/auth/profile', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { name, bio, department, skills, technologies, avatar } = req.body;
    const updated = db.updateUser(actor.id, {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(department && { department }),
      ...(skills && { skills }),
      ...(technologies && { technologies }),
      ...(avatar && { avatar }),
    });

    res.json(updated);
  });

  app.put('/api/auth/password', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    // Log audit
    db.addAuditLog({
      adminId: actor.id,
      adminName: actor.name,
      action: 'PASSWORD_CHANGED',
      targetType: 'USER',
      targetId: actor.id,
      details: `User ${actor.username} changed account password.`,
      ipAddress: '127.0.0.1',
    });
    res.json({ success: true, message: 'Password updated successfully' });
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allIssues = db.getIssues({ includeHidden: false });
    const userIssues = allIssues.filter((i) => i.authorId === user.id);
    const userSolutions = db.getIssues().flatMap((i) => db.getSolutions(i.id)).filter((s) => s.authorId === user.id);
    const acceptedSolutions = userSolutions.filter((s) => s.isAccepted);
    const reputationHistory = db.getReputationHistory(user.id);
    const bookmarks = db.getBookmarks(user.id);

    res.json({
      user,
      stats: {
        issuesCount: userIssues.length,
        solutionsCount: userSolutions.length,
        acceptedCount: acceptedSolutions.length,
        commentsCount: 14,
        reactionsReceived: 45,
        bookmarksCount: bookmarks.length,
        reputation: user.reputation,
      },
      recentIssues: userIssues.slice(0, 5),
      recentSolutions: userSolutions.slice(0, 5),
      reputationHistory: reputationHistory.slice(0, 20),
    });
  });

  app.put('/api/admin/users/:id/status', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Administrative privileges required' });
    }

    const { status, role } = req.body;
    const targetUser = db.getUserById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const updated = db.updateUser(targetUser.id, {
      ...(status && { status }),
      ...(role && { role }),
    });

    db.addAuditLog({
      adminId: actor.id,
      adminName: actor.name,
      action: 'USER_MODERATED',
      targetType: 'USER',
      targetId: targetUser.id,
      details: `User ${targetUser.username} updated: status=${status || targetUser.status}, role=${role || targetUser.role}`,
      ipAddress: '127.0.0.1',
    });

    res.json(updated);
  });

  // Categories & Tags
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const cat = db.createCategory({
      id: 'cat-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      description: description || '',
      icon: icon || 'Folder',
      color: color || '#3B82F6',
      isActive: true,
    });

    db.addAuditLog({
      adminId: actor.id,
      adminName: actor.name,
      action: 'CATEGORY_CREATED',
      targetType: 'CATEGORY',
      targetId: cat.id,
      details: `Created category ${cat.name}`,
      ipAddress: '127.0.0.1',
    });

    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  });

  app.get('/api/tags', (req, res) => {
    res.json(db.getTags());
  });

  app.post('/api/tags', (req, res) => {
    const { name, color, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name is required' });

    const tag = db.createTag({
      id: 'tag-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      color: color || '#6366F1',
      description: description || '',
      isActive: true,
      usageCount: 0,
    });
    res.status(201).json(tag);
  });

  app.put('/api/tags/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const updated = db.updateTag(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Tag not found' });
    res.json(updated);
  });

  // Issues
  app.get('/api/issues', (req, res) => {
    const {
      search,
      category,
      tag,
      status,
      priority,
      authorId,
      solvedOnly,
      unsolvedOnly,
      sort,
    } = req.query;

    const issues = db.getIssues({
      search: search as string,
      category: category as string,
      tag: tag as string,
      status: status as string,
      priority: priority as string,
      authorId: authorId as string,
      solvedOnly: solvedOnly === 'true',
      unsolvedOnly: unsolvedOnly === 'true',
      sort: sort as string,
    });

    res.json(issues);
  });

  app.get('/api/issues/trending', (req, res) => {
    const trending = db.getTrendingIssues(6);
    res.json(trending);
  });

  app.get('/api/issues/:id', (req, res) => {
    const issue = db.getIssueById(req.params.id, true);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  });

  app.get('/api/issues/:id/related', (req, res) => {
    const related = db.getRelatedIssues(req.params.id);
    res.json(related);
  });

  app.post('/api/issues', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const {
      title,
      description,
      categoryId,
      tags,
      language,
      technology,
      environment,
      errorDetails,
      expectedBehavior,
      actualBehavior,
      stepsToReproduce,
      codeSnippets,
      attachments,
      priority,
      status,
      duplicateOfId,
      manualRelatedIds,
    } = req.body;

    if (!title || !description || !categoryId) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const newIssue = db.createIssue({
      title,
      description,
      categoryId,
      tags: Array.isArray(tags) ? tags : [],
      language: language || '',
      technology: technology || '',
      environment: environment || {},
      errorDetails: errorDetails || {},
      expectedBehavior: expectedBehavior || '',
      actualBehavior: actualBehavior || '',
      stepsToReproduce: stepsToReproduce || '',
      codeSnippets: Array.isArray(codeSnippets) ? codeSnippets : [],
      attachments: Array.isArray(attachments) ? attachments : [],
      priority: priority || 'normal',
      status: status || 'open',
      authorId: actor.id,
      duplicateOfId: duplicateOfId || undefined,
      manualRelatedIds: manualRelatedIds || [],
    });

    res.status(201).json(newIssue);
  });

  app.put('/api/issues/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.authorId !== actor.id && actor.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own issues' });
    }

    const updated = db.updateIssue(req.params.id, req.body);
    res.json(updated);
  });

  app.put('/api/issues/:id/status', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { status } = req.body;
    if (!['open', 'in_discussion', 'solved', 'closed', 'reopened'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Owner or admin can change status
    if (issue.authorId !== actor.id && actor.role !== 'admin') {
      return res.status(403).json({ error: 'Only the issue author or an admin can update the issue status' });
    }

    const updated = db.updateIssue(req.params.id, { status });
    res.json(updated);
  });

  app.post('/api/issues/:id/duplicate', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { duplicateOfId } = req.body;
    const target = db.getIssueById(duplicateOfId);
    if (!target) return res.status(400).json({ error: 'Target duplicate issue does not exist' });

    const updated = db.updateIssue(req.params.id, {
      duplicateOfId,
      status: 'closed',
    });

    db.addActivity({
      userId: actor.id,
      userName: actor.name,
      userAvatar: actor.avatar,
      action: 'marked as duplicate of #' + target.id,
      entityType: 'issue',
      entityId: issue.id,
      entityTitle: issue.title,
    });

    res.json(updated);
  });

  app.delete('/api/issues/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.authorId !== actor.id && actor.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.deleteIssue(req.params.id, actor.role === 'admin' ? actor.id : undefined);
    res.json({ success: true, message: 'Issue deleted successfully' });
  });

  // Solutions
  app.get('/api/issues/:id/solutions', (req, res) => {
    const solutions = db.getSolutions(req.params.id);
    res.json(solutions);
  });

  app.post('/api/issues/:id/solutions', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { explanation, codeSnippets, configCommands, links, attachments } = req.body;
    if (!explanation) {
      return res.status(400).json({ error: 'Solution explanation is required' });
    }

    const sol = db.createSolution({
      issueId: req.params.id,
      authorId: actor.id,
      explanation,
      codeSnippets: Array.isArray(codeSnippets) ? codeSnippets : [],
      configCommands: configCommands || '',
      links: Array.isArray(links) ? links : [],
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    res.status(201).json(sol);
  });

  app.put('/api/solutions/:id/accept', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const result = db.acceptSolution(req.params.id, actor.id);
    if (!result) return res.status(404).json({ error: 'Solution not found' });

    res.json(result);
  });

  app.delete('/api/solutions/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const success = db.deleteSolution(req.params.id);
    if (!success) return res.status(404).json({ error: 'Solution not found' });

    res.json({ success: true });
  });

  // Comments & Replies
  app.get('/api/issues/:id/comments', (req, res) => {
    const comments = db.getComments(req.params.id);
    res.json(comments);
  });

  app.post('/api/issues/:id/comments', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { content, parentCommentId, attachments } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const comment = db.createComment({
      issueId: req.params.id,
      authorId: actor.id,
      content,
      parentCommentId: parentCommentId || undefined,
      attachments: attachments || [],
    });

    res.status(201).json(comment);
  });

  app.delete('/api/comments/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    db.deleteComment(req.params.id);
    res.json({ success: true });
  });

  // Reactions
  app.post('/api/reactions', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { entityType, entityId, reactionType } = req.body;
    if (!entityType || !entityId || !reactionType) {
      return res.status(400).json({ error: 'entityType, entityId, and reactionType are required' });
    }

    const result = db.toggleReaction(entityType, entityId, reactionType, actor.id);
    if (!result) return res.status(404).json({ error: 'Entity not found' });

    res.json(result);
  });

  // Bookmarks
  app.get('/api/bookmarks', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const bookmarks = db.getBookmarks(actor.id);
    res.json(bookmarks);
  });

  app.post('/api/bookmarks/toggle', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { issueId } = req.body;
    if (!issueId) return res.status(400).json({ error: 'issueId required' });

    const result = db.toggleBookmark(actor.id, issueId);
    res.json(result);
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const notifs = db.getNotifications(actor.id);
    res.json(notifs);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    db.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    db.markAllNotificationsAsRead(actor.id);
    res.json({ success: true });
  });

  // Reports & Moderation
  app.get('/api/reports', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const reports = db.getReports(req.query.status as string);
    res.json(reports);
  });

  app.post('/api/reports', (req, res) => {
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { entityType, entityId, entityTitle, reason, details } = req.body;
    if (!entityType || !entityId || !reason) {
      return res.status(400).json({ error: 'entityType, entityId, and reason are required' });
    }

    const report = db.createReport({
      reporterId: actor.id,
      entityType,
      entityId,
      entityTitle,
      reason,
      details: details || '',
    });

    res.status(201).json(report);
  });

  app.put('/api/reports/:id/resolve', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { status, notes, hideContent } = req.body;
    const resolved = db.resolveReport(req.params.id, actor.id, status || 'resolved', notes, hideContent);
    if (!resolved) return res.status(404).json({ error: 'Report not found' });

    res.json(resolved);
  });

  // Activity & Audit Logs
  app.get('/api/activities', (req, res) => {
    res.json(db.getActivities(50));
  });

  app.get('/api/audit-logs', (req, res) => {
    const actor = getActor(req);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    res.json(db.getAuditLogs(60));
  });

  // Admin Analytics & Statistics
  app.get('/api/admin/stats', (req, res) => {
    const stats = db.getPlatformStats();
    res.json(stats);
  });

  // Export
  app.get('/api/export/issues', (req, res) => {
    const issues = db.getIssues();
    const format = req.query.format || 'json';

    if (format === 'csv') {
      const header = 'ID,Title,Category,Status,Priority,Author,Language,Views,CreatedAt\n';
      const rows = issues
        .map(
          (i) =>
            `"${i.id}","${i.title.replace(/"/g, '""')}","${i.categoryId}","${i.status}","${i.priority}","${i.author?.name || i.authorId}","${i.language || ''}",${i.views},"${i.createdAt}"`
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="devresolve-issues.csv"');
      return res.send(header + rows);
    }

    res.json(issues);
  });

  // File upload simulation (generates data url or mock url with meta validation)
  app.post('/api/upload', (req, res) => {
    const { name, size, type, dataUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'File name required' });

    // Validate size (max 10MB)
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    const attachment = {
      id: 'att-' + Date.now().toString().slice(-6),
      name,
      size: size || 1024,
      type: type || 'application/octet-stream',
      url: dataUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      uploadedAt: new Date().toISOString(),
    };

    res.json(attachment);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DevResolve Server running on http://localhost:${PORT}`);
  });
}

startServer();
