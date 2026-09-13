import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export const CodeBlock = ({
  code,
  language = "plaintext",
  title,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 my-3 shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono font-medium text-slate-200">
            {title || `${language} snippet`}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] uppercase tracking-wider">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3 overflow-x-auto font-mono text-sm leading-relaxed text-slate-200">
        <pre className="flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-right text-slate-600 border-r border-slate-800/60 mr-4 font-mono text-xs">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <code className="block flex-1 overflow-x-auto text-slate-200">
            {lines.map((line, i) => (
              <div
                key={i}
                className="leading-6 hover:bg-slate-900/40 -mx-2 px-2 rounded"
              >
                {line || " "}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
