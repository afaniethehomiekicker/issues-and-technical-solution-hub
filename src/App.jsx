import React, { useState, useEffect } from "react";
import { api, getStoredUserId } from "./api";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { NewIssueModal } from "./components/NewIssueModal";
import { UserSwitcherModal } from "./components/UserSwitcherModal";
import { DashboardView } from "./views/DashboardView";
import { IssuesListView } from "./views/IssuesListView";
import { IssueDetailView } from "./views/IssueDetailView";
import { CategoriesView } from "./views/CategoriesView";
import { TrendingView } from "./views/TrendingView";
import { BookmarksView } from "./views/BookmarksView";
import { ProfileView } from "./views/ProfileView";
import { AdminPortalView } from "./views/AdminPortalView";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Routing / View state
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  // Initial data load
  const loadInitialData = async () => {
    try {
      const [users, cats, tgs, bms] = await Promise.all([
        api.getUsers(),
        api.getCategories(),
        api.getTags(),
        api.getBookmarks(),
      ]);
      setAllUsers(users);
      setCategories(cats);
      setTags(tgs);
      setBookmarkCount(bms.length);

      const storedId = getStoredUserId();
      const matched =
        users.find((u) => u.id === storedId) ||
        users.find((u) => u.username === "ahmedk") ||
        users[0];
      setCurrentUser(matched || null);
    } catch (err) {
      console.error("Failed to load initial application state", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectIssue = (issueId) => {
    setSelectedIssueId(issueId);
    setCurrentView("issue_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setCurrentView("leaderboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (catId) => {
    setFilterCategory(catId);
    setFilterTag("all");
    setCurrentView("issues");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTag = (tagName) => {
    setFilterTag(tagName);
    setFilterCategory("all");
    setCurrentView("issues");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== "issues") {
      setFilterCategory("all");
      setFilterTag("all");
    }
    if (view === "leaderboard" && !selectedUserId && currentUser) {
      setSelectedUserId(currentUser.id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-[#000000] text-[#1e293b] dark:text-[#f8fafc] flex flex-col font-sans selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">
        {/* Fixed Sticky Header */}
        <Header
          currentUser={currentUser}
          onOpenNewIssue={() => setIsNewIssueOpen(true)}
          onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
          onSelectIssue={handleSelectIssue}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim().length > 0 && currentView !== "issues") {
              setCurrentView("issues");
            }
          }}
        />

        {/* Main Content Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
          {/* Left Nav Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            bookmarkCount={bookmarkCount}
          />

          {/* View Switcher / Page Surface */}
          <main className="flex-1 min-w-0">
            {currentView === "dashboard" && (
              <DashboardView
                currentUser={currentUser}
                onSelectIssue={handleSelectIssue}
                onNavigate={handleNavigate}
                onOpenNewIssue={() => setIsNewIssueOpen(true)}
                onSelectCategory={handleSelectCategory}
                onSelectTag={handleSelectTag}
              />
            )}

            {currentView === "issues" && (
              <IssuesListView
                onSelectIssue={handleSelectIssue}
                onOpenNewIssue={() => setIsNewIssueOpen(true)}
                categories={categories}
                tags={tags}
                initialCategory={filterCategory}
                initialTag={filterTag}
                searchQuery={searchQuery}
              />
            )}

            {currentView === "issue_detail" && selectedIssueId && (
              <IssueDetailView
                issueId={selectedIssueId}
                currentUser={currentUser}
                onBack={() => setCurrentView("issues")}
                onSelectIssue={handleSelectIssue}
                onSelectUser={handleSelectUser}
              />
            )}

            {currentView === "categories" && (
              <CategoriesView
                onSelectCategory={handleSelectCategory}
                onSelectTag={handleSelectTag}
                currentUser={currentUser}
              />
            )}

            {currentView === "trending" && (
              <TrendingView
                onSelectIssue={handleSelectIssue}
                onSelectTag={handleSelectTag}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {currentView === "bookmarks" && (
              <BookmarksView
                onSelectIssue={handleSelectIssue}
                onSelectTag={handleSelectTag}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {currentView === "leaderboard" && (
              <ProfileView
                userId={selectedUserId || currentUser?.id || "usr-ahmed"}
                onSelectIssue={handleSelectIssue}
                onSelectUser={handleSelectUser}
                currentUser={currentUser}
              />
            )}

            {currentView === "admin" && (
              <AdminPortalView
                currentUser={currentUser}
                onSelectIssue={handleSelectIssue}
              />
            )}
          </main>
        </div>

        {/* Global Modals */}
        <NewIssueModal
          isOpen={isNewIssueOpen}
          onClose={() => setIsNewIssueOpen(false)}
          onCreated={(issueId) => {
            handleSelectIssue(issueId);
            loadInitialData();
          }}
          categories={categories}
          tags={tags}
        />

        <UserSwitcherModal
          isOpen={isUserSwitcherOpen}
          onClose={() => setIsUserSwitcherOpen(false)}
          currentUser={currentUser}
          allUsers={allUsers}
          onUserChanged={(u) => {
            setCurrentUser(u);
            loadInitialData();
          }}
        />
      </div>
    </ThemeProvider>
  );
}
