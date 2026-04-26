"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveBarProps {
  isDirty: boolean;
  isSubmitting?: boolean;
  onDiscard: () => void;
}

export function SaveBar({ isDirty, isSubmitting, onDiscard }: SaveBarProps) {
  if (!isDirty) return null;

  return (
    <div className="sticky bottom-4 z-10 self-end flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border shadow-md rounded-full pl-4 pr-2 py-1.5">
      <p className="text-xs text-muted-foreground mr-1">Unsaved changes</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDiscard}
        disabled={isSubmitting}
      >
        Discard
      </Button>
      <Button size="sm" type="submit" disabled={isSubmitting}>
        <Check size={14} />
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
