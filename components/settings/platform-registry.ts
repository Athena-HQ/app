import { Github, Linkedin, Twitter, Dribbble, Instagram, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PlatformDef = {
  match: string[];
  label: string;
  Icon: LucideIcon;
  accentClass: string;
};

export const PLATFORM_REGISTRY: PlatformDef[] = [
  {
    match: ["github", "gh"],
    label: "GitHub",
    Icon: Github,
    accentClass: "hover:text-[#333] dark:hover:text-[#ccc]",
  },
  {
    match: ["linkedin", "li"],
    label: "LinkedIn",
    Icon: Linkedin,
    accentClass: "hover:text-[#0077b5]",
  },
  {
    match: ["twitter", "x"],
    label: "X",
    Icon: Twitter,
    accentClass: "hover:text-[#1DA1F2]",
  },
  {
    match: ["dribbble"],
    label: "Dribbble",
    Icon: Dribbble,
    accentClass: "hover:text-[#ea4c89]",
  },
  {
    match: ["instagram", "ig", "insta"],
    label: "Instagram",
    Icon: Instagram,
    accentClass: "hover:text-[#e1306c]",
  },
  {
    match: ["website", "site", "web", "portfolio", "blog"],
    label: "Website",
    Icon: Globe,
    accentClass: "hover:text-foreground",
  },
];

export function resolvePlatform(name: string): PlatformDef {
  const key = (name ?? "").trim().toLowerCase().replace(/\s+/g, "");
  return (
    PLATFORM_REGISTRY.find((p) => p.match.includes(key)) ?? {
      match: [],
      label: name || "Link",
      Icon: Globe,
      accentClass: "hover:text-foreground",
    }
  );
}
