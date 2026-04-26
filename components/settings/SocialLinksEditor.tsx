"use client";

import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolvePlatform } from "./platform-registry";

export interface SocialLink {
  id: string;
  platform: string;
  value: string;
  visible: boolean;
  preset: boolean;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

interface SocialRowProps {
  entry: SocialLink;
  onChange: (next: SocialLink) => void;
  onRemove: () => void;
}

function SocialRow({ entry, onChange, onRemove }: SocialRowProps) {
  const resolved = resolvePlatform(entry.platform);
  const Icon = resolved.Icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-colors">
      <div
        className={cn(
          "p-2 rounded-md bg-muted text-muted-foreground transition-colors shrink-0",
          resolved.accentClass
        )}
      >
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-[140px_1fr] gap-2">
        {entry.preset ? (
          <div className="flex items-center h-9 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {entry.platform}
          </div>
        ) : (
          <Input
            value={entry.platform}
            placeholder="Platform"
            onChange={(e) => onChange({ ...entry, platform: e.target.value })}
          />
        )}
        <Input
          value={entry.value}
          placeholder={
            resolved.label === "Website"
              ? "yourdomain.com"
              : `${resolved.label.toLowerCase()}.com/you`
          }
          onChange={(e) => onChange({ ...entry, value: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {entry.visible ? "Visible" : "Hidden"}
        </span>
        <Toggle
          checked={entry.visible}
          onChange={(v) => onChange({ ...entry, visible: v })}
        />
        {!entry.preset && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Remove link"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}

interface SocialLinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const updateAt = (idx: number, next: SocialLink) => {
    const updated = links.slice();
    updated[idx] = next;
    onChange(updated);
  };

  const removeAt = (idx: number) => onChange(links.filter((_, i) => i !== idx));

  const add = () =>
    onChange([
      ...links,
      { id: `s${Date.now()}`, platform: "", value: "", visible: true, preset: false },
    ]);

  return (
    <div className="flex flex-col gap-2.5">
      {links.map((entry, idx) => (
        <SocialRow
          key={entry.id}
          entry={entry}
          onChange={(next) => updateAt(idx, next)}
          onRemove={() => removeAt(idx)}
        />
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
      >
        <Plus size={14} />
        Add another link
      </button>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1">
        Tip: the icon updates live as you type. Known platforms: GitHub, LinkedIn, X,
        Dribbble, Instagram, Website.
      </p>
    </div>
  );
}
