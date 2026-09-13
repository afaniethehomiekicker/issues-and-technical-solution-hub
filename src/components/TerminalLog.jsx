import React, { useState } from "react";
import { AlertCircle, Check, Copy, ScrollText } from "lucide-react";

export const TerminalLog = ({
  title = "Console / Terminal Output",
  content,
  type = "output",
}) => {
  const [copied, setCopied] = useState(false);

  if (!content || !content.trim()) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isError =
    type === "error" ||
    content.includes("FATAL") ||
    content.includes("Error:") ||
    content.includes("Exception");

  return (
    <div
      className={`rounded-xl overflow-hidden border my-3 shadow-md ${
        isError
          ? "border-rose-900/60 bg-rose-950/20"
          : "border-slate-800 bg-slate-950/80"
      }`}
    >
      <div
        className={`flex items-center justify-between px-3.5 py-2 border-b text-xs ${
          isError
            ? "bg-rose-950/40 border-rose-900/50 text-rose-300"
            : "bg-slate-900/90 border-slate-800 text-slate-400"
        }`}
      >
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <ScrollText className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="font-mono font-medium">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3.5 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-72 overflow-y-auto">
        <pre className="whitespace-pre-wrap break-all">{content}</pre>
      </div>
    </div>
  );
};
