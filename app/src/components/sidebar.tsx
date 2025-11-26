import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutGridIcon,
  BuildingIcon,
  UsersIcon,
  MailIcon,
  LayersIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/useSidebar";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutGridIcon, href: "/dashboard" },
  { label: "Organization", icon: BuildingIcon, href: "/organization" },
  { label: "People", icon: UsersIcon, href: "/people" },
  { label: "Invite", icon: MailIcon, href: "/invite" },
  { label: "Squads", icon: LayersIcon, href: "/squads" },
];

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "240px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen bg-card border-r border-border sticky top-0"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src="/white-athena-hq.svg" 
              alt="Athena HQ" 
              className="w-8 h-8 shrink-0"
            />
            <motion.span
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto",
              }}
              transition={{ duration: 0.2 }}
              className="font-semibold text-lg whitespace-nowrap"
            >
              Athena HQ
            </motion.span>
          </div>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              className="shrink-0"
            >
              <XIcon />
            </Button>
          )}

          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              className="absolute top-4 right-4"
            >
              <MenuIcon />
            </Button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <TooltipProvider>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;

              const navButton = (
                <Link to={item.href} className="block">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full transition-all duration-300 h-10 px-3",
                      isCollapsed ? "justify-center" : "justify-start gap-3"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : "auto",
                      }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  </Button>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger className="w-full">{navButton}</TooltipTrigger>
                    <TooltipPopup side="right">{item.label}</TooltipPopup>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{navButton}</div>;
            })}
          </TooltipProvider>
        </nav>

        <div className="p-3 border-t border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full transition-all duration-300 h-10 px-3",
                    isCollapsed ? "justify-center" : "justify-start gap-3"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">LP</span>
                  </div>
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-sm whitespace-nowrap overflow-hidden"
                  >
                    L. Piterson
                  </motion.span>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipPopup side="right">L. Piterson</TooltipPopup>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.aside>
    </>
  );
}
