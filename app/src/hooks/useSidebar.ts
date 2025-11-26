import { useState, useEffect } from "react";

const SIDEBAR_STORAGE_KEY = "athena-sidebar-collapsed";

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggle = () => setIsCollapsed((prev: boolean) => !prev);

  return { isCollapsed, toggle, setIsCollapsed };
};
