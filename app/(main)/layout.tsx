"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

import { NotificationBell } from "@/components/layout/NotificationBell";

import { ChatDrawerProvider } from "@/contexts/chat-drawer-context";
import { GlobalChatDrawer } from "@/components/chat/global-chat-drawer";

const guardsDisabled =
  process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARDS === "true";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!guardsDisabled && !isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (!guardsDisabled && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!guardsDisabled && !user) {
    return null;
  }

  return (
    <ChatDrawerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger className="-ms-4" />
            </div>
            <div className="flex items-center gap-2 px-3">
              <NotificationBell />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 lg:gap-6 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </SidebarInset>
        <GlobalChatDrawer />
      </SidebarProvider>
    </ChatDrawerProvider>
  );
}
