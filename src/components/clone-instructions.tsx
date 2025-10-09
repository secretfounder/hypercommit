"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

type CloneInstructionsProps = {
  username: string;
  repo: string;
};

export function CloneInstructions({ username, repo }: CloneInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cloneUrl = `git clone ${appUrl}/${username}/${repo}.git`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cloneUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Clone this repository</h2>
      <div className="flex items-center gap-2">
        <Input value={cloneUrl} readOnly className="font-mono text-sm" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy clone URL"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-emerald-500" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
