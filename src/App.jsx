import React, { useState, useEffect } from "react";
import { api, setStoredUserId } from "./api";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { NewIssueModal } from "./components/NewIssueModal";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { IssuesListView } from "./views/IssuesListView";
import { IssueDetailView } from "./views/IssueDetailView";
import { CategoriesView } from "./views/CategoriesView";
import { TagsView } from "./views/TagsView";
import { TrendingView } from "./views/TrendingView";
import { BookmarksView } from "./views/BookmarksView";
import { ProfileView } from "./views/ProfileView";
import { AdminPortalView } from "./views/AdminPortalView";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
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

  // Initialize persistent theme preference on app mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("devresolve_theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [cats, tgs, bms] = await Promise.all([
        api.getCategories(),
        api.getTags(),
        api.getBookmarks(),
      ]);
      setCategories(cats || []);
      setTags(tgs || []);
      setBookmarkCount(Array.isArray(bms) ? bms.length : 0);

      const me = await api.getMe();
      setCurrentUser(me || null);
    } catch (err) {
      console.error("Failed to load initial application state", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleLogout = () => {
    setStoredUserId("");
    setCurrentUser(null);
  };

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

  if (!currentUser) {
    return (
      <ThemeProvider>
        <AuthView
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            loadInitialData();
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 overflow-x-hidden">
        <Header
          currentUser={currentUser}
          onOpenNewIssue={() => setIsNewIssueOpen(true)}
          onLogout={handleLogout}
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

        {/* Responsive layout container: Stacks vertically on mobile/tablet (flex-col), side-by-side on desktop (md:flex-row) */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row gap-6 md:gap-8 min-w-0">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            bookmarkCount={bookmarkCount}
          />

          <main className="flex-1 min-w-0 w-full">
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

            {currentView === "tags" && (
              <TagsView
                onSelectTag={handleSelectTag}
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
      </div>
    </ThemeProvider>
  );
}