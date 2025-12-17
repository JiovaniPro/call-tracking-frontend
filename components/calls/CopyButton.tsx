 "use client";

import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "../layout/AppShell";

type CopyButtonProps = {
  value: string;
};

export const CopyButton: React.FC<CopyButtonProps> = ({ value }) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition ${
          isDark
            ? "bg-white/5 text-slate-200 hover:bg-white/10"
            : "bg-slate-50 text-slate-500 hover:bg-slate-200"
        }`}
        style={{ cursor: "pointer" }}
        aria-label={copied ? "Numéro copié" : "Copier le numéro"}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
      {copied && (
        <span className="ml-1 text-[10px] font-medium text-emerald-500">
          Copié
        </span>
      )}
    </div>
  );
};


