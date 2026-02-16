"use client";

import * as React from "react";
import Image from "next/image";

// import { SearchForm } from "@/components/search-form";
// import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiScanLine,
  RiMailLine,
  RiLogoutBoxLine,
  RiTaskLine,
  RiGroupLine,
  RiTeamLine,
  RiSunLine,
  RiMoonLine,
} from "@remixicon/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

// This is sample data.
const data = {
  teams: [
    {
      name: "InnovaCraft",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
    },
    {
      name: "Acme Corp.",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
    },
    {
      name: "Evil Corp.",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
    },
  ],
  navMain: [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiScanLine,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: RiTaskLine,
        },
        // {
        //   title: "Insights",
        //   url: "#",
        //   icon: RiBardLine,
        // },
        // {
        //   title: "Contacts",
        //   url: "#",
        //   icon: RiUserFollowLine,
        //   isActive: true,
        // },
        // {
        //   title: "Tools",
        //   url: "#",
        //   icon: RiCodeSSlashLine,
        // },
        // {
        //   title: "Integration",
        //   url: "#",
        //   icon: RiLoginCircleLine,
        // },
        // {
        //   title: "Layouts",
        //   url: "#",
        //   icon: RiLayoutLeftLine,
        // },
        // {
        //   title: "Reports",
        //   url: "#",
        //   icon: RiLeafLine,
        // },
      ],
    },
    {
      title: "Management",
      url: "#",
      items: [
        {
          title: "Invite Employees",
          url: "/invite",
          icon: RiMailLine,
        },
        {
          title: "Squads",
          url: "/squads",
          icon: RiGroupLine,
        },
        // {
        //   title: "Help Center",
        //   url: "#",
        //   icon: RiLeafLine,
        // },
      ],
    },
  ],
};

const managementItems = [
  { title: "Invite Employees", url: "/invite", icon: RiMailLine, inviteOnly: true },
  { title: "Squads", url: "/squads", icon: RiGroupLine, inviteOnly: false },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { canInviteEmployees, canSeeMySquad } = useCurrentUserRole();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") === "dark";
  const filteredManagementItems = managementItems.filter(
    (item) => !item.inviteOnly || canInviteEmployees
  );
  const mySquadItem = {
    title: "My Squad",
    url: "/my-squad",
    icon: RiTeamLine,
  };
  const sectionsItems = [
    ...data.navMain[0].items,
    ...(canSeeMySquad ? [mySquadItem] : []),
  ];
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center gap-2">
        <Image
          src="/athena.avif"
          alt="Logo"
          width={56}
          height={56}
          className="w-14 h-14 object-cover rounded-full"
          priority
        />
        <h1 className="text-2xl font-bold font-serif italic mt-2">Athena HQ</h1>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {(item.title === "Management"
                  ? filteredManagementItems
                  : item.title === "Sections"
                    ? sectionsItems
                    : item.items
                ).map((navItem) => (
                  <SidebarMenuItem key={navItem.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                      isActive={pathname === navItem.url}
                    >
                      <Link href={navItem.url}>
                        {navItem.icon && (
                          <navItem.icon
                            className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{navItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <RiSunLine
                  className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                  size={22}
                  aria-hidden="true"
                />
              ) : (
                <RiMoonLine
                  className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                  size={22}
                  aria-hidden="true"
                />
              )}
              <span>{isDark ? "Light" : "Dark"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
              onClick={() => {
                logout()
                  .then(() => router.push("/login"))
                  .catch(() => {});
              }}
            >
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
