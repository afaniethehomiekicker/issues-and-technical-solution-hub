import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { api } from "../api";
import { IssueCard } from "../components/IssueCard";

export const BookmarksView = ({
  onSelectIssue,
  onSelectTag,
  onSelectCategory,
}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.getBookmarks();
      setBookmarks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (issueId) => {
    await api.toggleBookmark(issueId);
    loadBookmarks();
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>My Bookmarked Technical Solutions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast access to tricky bugs, terminal commands, and verified
            solutions you've saved.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          {bookmarks.length} Bookmarks
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-mono">
          Loading saved issues...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            No bookmarked issues yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any issue card or detail view to save
            solutions to your personal technical library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookmarks.map((bm) =>
            bm.issue ? (
              <IssueCard
                key={bm.id}
                issue={bm.issue}
                isBookmarked={true}
                onToggleBookmark={() => handleRemove(bm.issueId)}
                onSelect={onSelectIssue}
                onSelectTag={onSelectTag}
                onSelectCategory={onSelectCategory}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};
