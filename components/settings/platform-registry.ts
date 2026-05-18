import { Github, Linkedin, Twitter, Dribbble, Instagram, Globe, Youtube, Facebook } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PlatformDef = {
  match: string[];
  urlPatterns: string[];
  label: string;
  Icon: LucideIcon;
  accentClass: string;
};

export const PLATFORM_REGISTRY: PlatformDef[] = [
  {
    match: ["github", "gh"],
    urlPatterns: ["github.com"],
    label: "GitHub",
    Icon: Github,
    accentClass: "hover:text-[#333] dark:hover:text-[#ccc]",
  },
  {
    match: ["linkedin", "li"],
    urlPatterns: ["linkedin.com"],
    label: "LinkedIn",
    Icon: Linkedin,
    accentClass: "hover:text-[#0077b5]",
  },
  {
    match: ["twitter", "x"],
    urlPatterns: ["twitter.com", "x.com"],
    label: "X",
    Icon: Twitter,
    accentClass: "hover:text-[#1DA1F2]",
  },
  {
    match: ["dribbble"],
    urlPatterns: ["dribbble.com"],
    label: "Dribbble",
    Icon: Dribbble,
    accentClass: "hover:text-[#ea4c89]",
  },
  {
    match: ["instagram", "ig", "insta"],
    urlPatterns: ["instagram.com"],
    label: "Instagram",
    Icon: Instagram,
    accentClass: "hover:text-[#e1306c]",
  },
  {
    match: ["youtube", "yt"],
    urlPatterns: ["youtube.com", "youtu.be"],
    label: "YouTube",
    Icon: Youtube,
    accentClass: "hover:text-[#FF0000]",
  },
  {
    match: ["facebook", "fb"],
    urlPatterns: ["facebook.com", "fb.com"],
    label: "Facebook",
    Icon: Facebook,
    accentClass: "hover:text-[#1877F2]",
  },
  {
    match: ["website", "site", "web", "portfolio", "blog"],
    urlPatterns: [],
    label: "Website",
    Icon: Globe,
    accentClass: "hover:text-foreground",
  },
];

const FALLBACK_PLATFORM: PlatformDef = {
  match: [],
  urlPatterns: [],
  label: "Link",
  Icon: Globe,
  accentClass: "hover:text-foreground",
};

export function resolvePlatform(name: string): PlatformDef {
  const key = (name ?? "").trim().toLowerCase().replace(/\s+/g, "");
  return PLATFORM_REGISTRY.find((p) => p.match.includes(key)) ?? { ...FALLBACK_PLATFORM, label: name || "Link" };
}

export function resolvePlatformFromUrl(url: string): PlatformDef {
  const lower = (url ?? "").toLowerCase();
  return PLATFORM_REGISTRY.find((p) => p.urlPatterns.some((pattern) => lower.includes(pattern))) ?? FALLBACK_PLATFORM;
}

export function resolvePlatformSmart(platform: string, url: string): PlatformDef {
  const byName = PLATFORM_REGISTRY.find((p) => p.match.includes((platform ?? "").trim().toLowerCase().replace(/\s+/g, "")));
  if (byName) return byName;
  return resolvePlatformFromUrl(url);
}

