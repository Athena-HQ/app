"use client";

import { Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "company" | "profile";

interface TabButtonProps {
  icon: React.ElementType;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon: Icon, label, sub, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md px-3 py-2.5 flex items-start gap-3 transition-colors bg-gradient-to-r",
        active
          ? "from-primary/20 to-primary/5"
          : "hover:from-sidebar-accent hover:to-sidebar-accent/40"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-md shrink-0 mt-0.5",
          active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/70"
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold leading-tight",
            active && "text-foreground"
          )}
        >
          {label}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{sub}</p>
      </div>
    </button>
  );
}

interface SettingsTabsProps {
  visibleTab: Tab;
}

export function SettingsTabs({ visibleTab }: SettingsTabsProps) {
  return (
    <nav className="flex flex-col gap-1 lg:sticky lg:top-6 lg:self-start">
      {visibleTab === "company" && (
        <TabButton
          icon={Building2}
          label="Company Info"
          sub="Identity, contact, location, manager"
          active
          onClick={() => {}}
        />
      )}
      {visibleTab === "profile" && (
        <TabButton
          icon={User}
          label="My Profile"
          sub="Bio, stats, badges, social"
          active
          onClick={() => {}}
        />
      )}

      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
          Coming soon
        </p>
        <ul className="text-xs text-muted-foreground flex flex-col gap-1">
          <li>· Notifications</li>
          <li>· Integrations</li>
          <li>· Security &amp; sessions</li>
          <li>· Billing</li>
        </ul>
      </div>
    </nav>
  );
}
