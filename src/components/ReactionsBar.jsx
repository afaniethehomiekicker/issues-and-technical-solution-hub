import React from "react";
import { api } from "../api";

const REACTION_CONFIG = {
  helpful: { label: "Helpful", emoji: "👍", hoverBg: "hover:bg-blue-500/20" },
  useful: { label: "Useful", emoji: "💡", hoverBg: "hover:bg-amber-500/20" },
  like: { label: "Like", emoji: "❤️", hoverBg: "hover:bg-rose-500/20" },
  agree: { label: "Agree", emoji: "🎯", hoverBg: "hover:bg-emerald-500/20" },
};

export const ReactionsBar = ({
  entityType,
  entityId,
  reactions = {},
  currentUserId,
  onReactionChange,
  size = "md",
}) => {
  const handleToggle = async (reactionType) => {
    try {
      const res = await api.toggleReaction(entityType, entityId, reactionType);
      if (res && res.reactions && onReactionChange) {
        onReactionChange(res.reactions);
      }
    } catch (err) {
      console.error("Failed to toggle reaction", err);
    }
  };

  const isSmall = size === "sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Object.entries(REACTION_CONFIG).map(([type, config]) => {
        const userList = reactions[type] || [];
        const count = userList.length;
        const hasReacted = userList.includes(currentUserId);

        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer select-none ${
              isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
            } ${
              hasReacted
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-sm"
                : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            } ${config.hoverBg}`}
            title={`${config.label} (${count})`}
          >
            <span className="text-sm leading-none">{config.emoji}</span>
            <span className="font-medium text-[11px]">{config.label}</span>
            {count > 0 && (
              <span
                className={`font-mono text-[10px] px-1 rounded ${
                  hasReacted
                    ? "bg-indigo-500/30 text-indigo-200"
                    : "bg-slate-700/60 text-slate-300"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
