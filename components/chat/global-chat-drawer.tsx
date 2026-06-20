"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
  useChatContext,
} from "stream-chat-react";
import type { StreamChat, Event, OwnUserResponse } from "stream-chat";
import "stream-chat-react/dist/css/index.css";
import { useChatClient } from "@/hooks/useChatClient";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useChatDrawer } from "@/contexts/chat-drawer-context";
import { RiTeamLine, RiMessage3Line, RiAddLine, RiChat3Line, RiArrowLeftSLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getEmployees, type AppUserResponse } from "@/services/company";
import { getMySquads, getSquad, type SquadListResponse } from "@/services/squad";

// Inline "new message" panel — slides over the channel list inside the sheet
// itself (instead of an external dialog) so the chat context stays visible.
function InlineNewDm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { client, setActiveChannel } = useChatContext();
  const [creating, setCreating] = useState(false);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const teammates = useMemo(
    () => employees.filter((e) => e.user_id !== user?.pk),
    [employees, user?.pk],
  );

  const startDm = async (employee: AppUserResponse) => {
    if (!client || !user || creating) return;
    setCreating(true);
    try {
      // Create (or reuse) the 1-1 channel and open it. Selecting the channel
      // flips the sheet to the conversation view via ChannelSelectInterceptor.
      const channel = client.channel("messaging", {
        members: [String(user.pk), String(employee.user_id)],
      });
      await channel.watch();
      setActiveChannel(channel);
      onClose();
    } catch (e) {
      console.error("Failed to start DM", e);
      setCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-card animate-in fade-in slide-in-from-right-4 duration-200 ease-out">
      <div className="p-4 border-b shrink-0 flex items-center gap-2 pr-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 rounded-full"
          aria-label="Back to conversations"
        >
          <RiArrowLeftSLine size={24} />
        </Button>
        <div className="min-w-0">
          <h2 className="text-lg font-bold font-serif italic text-foreground leading-tight">
            New message
          </h2>
          <p className="text-xs text-muted-foreground">Pick a teammate to start chatting</p>
        </div>
      </div>
      <Command className="bg-transparent flex-1 min-h-0 px-2">
        <CommandInput placeholder="Search teammates by name or role…" />
        <CommandList className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              Loading teammates…
            </div>
          ) : (
            <>
              <CommandEmpty>No teammates found.</CommandEmpty>
              <CommandGroup heading="Teammates">
                {teammates.map((employee) => {
                  const name =
                    [employee.first_name, employee.last_name]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || employee.email;
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <CommandItem
                      key={employee.id}
                      value={`${name} ${employee.role ?? ""}`}
                      onSelect={() => startDm(employee)}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        {employee.profile?.avatar_url && (
                          <AvatarImage src={employee.profile.avatar_url} alt={name} />
                        )}
                        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{name}</span>
                        {employee.role && (
                          <span className="truncate text-xs capitalize text-muted-foreground">
                            {employee.role}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
}

function InlineNewSquadChat({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { client, setActiveChannel } = useChatContext();
  const [creating, setCreating] = useState(false);

  const { data: squads = [], isLoading } = useQuery({
    queryKey: ["my-squads"],
    queryFn: getMySquads,
  });

  const startSquadChat = async (squad: SquadListResponse) => {
    if (!client || !user || creating) return;
    setCreating(true);
    try {
      const fullSquad = await getSquad(squad.id);
      const memberIds = fullSquad.members
        .map((m) => String(m.app_user.user_id))
        .filter(Boolean);
      const channel = client.channel("team", `squad-${squad.id}`, {
        members: memberIds,
      });
      await channel.watch();
      setActiveChannel(channel);
      onClose();
    } catch (e) {
      console.error("Failed to start squad chat", e);
      setCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-card animate-in fade-in slide-in-from-right-4 duration-200 ease-out">
      <div className="p-4 border-b shrink-0 flex items-center gap-2 pr-12">
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-full" aria-label="Back">
          <RiArrowLeftSLine size={24} />
        </Button>
        <div className="min-w-0">
          <h2 className="text-lg font-bold font-serif italic text-foreground leading-tight">Squad Chat</h2>
          <p className="text-xs text-muted-foreground">Pick a squad to open its channel</p>
        </div>
      </div>
      <Command className="bg-transparent flex-1 min-h-0 px-2">
        <CommandInput placeholder="Search squads…" />
        <CommandList className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              Loading squads…
            </div>
          ) : (
            <>
              <CommandEmpty>No squads found.</CommandEmpty>
              <CommandGroup heading="Your squads">
                {squads.map((squad) => (
                  <CommandItem
                    key={squad.id}
                    value={squad.name}
                    onSelect={() => startSquadChat(squad)}
                    disabled={creating}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-xs font-semibold">
                      {squad.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{squad.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {squad.member_count} member{squad.member_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
}

function CustomListHeader({
  activeTab,
  setActiveTab,
  onNewDm,
  onNewSquad,
}: {
  activeTab: "team" | "messaging";
  setActiveTab: (tab: "team" | "messaging") => void;
  onNewDm: () => void;
  onNewSquad: () => void;
}) {
  return (
    <div className="p-4 border-b shrink-0">
      {/* pr-12 reserves room for the Sheet's absolute close (X) button so the
          "new message" action never sits underneath it. */}
      <div className="flex items-center justify-between mb-4 pr-12">
        <h1 className="text-xl font-bold font-serif italic text-foreground">Messages</h1>
        {activeTab === "messaging" && (
          <button
            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            title="Start new DM"
            aria-label="Start new direct message"
            onClick={onNewDm}
          >
            <RiAddLine size={18} />
          </button>
        )}
        {activeTab === "team" && (
          <button
            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            title="Open squad chat"
            aria-label="Open squad chat"
            onClick={onNewSquad}
          >
            <RiAddLine size={18} />
          </button>
        )}
      </div>
      <div className="flex gap-2 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => setActiveTab("team")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "team" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <RiTeamLine size={16} /> Squads
        </button>
        <button
          onClick={() => setActiveTab("messaging")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "messaging" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <RiMessage3Line size={16} /> DMs
        </button>
      </div>
    </div>
  );
}

function CustomChannelHeader({ onBack }: { onBack: () => void }) {
  const { setActiveChannel } = useChatContext();
  return (
    <div className="flex items-center gap-2 px-2 border-b shrink-0">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => {
          setActiveChannel(undefined);
          onBack();
        }} 
        className="shrink-0 rounded-full"
      >
        <RiArrowLeftSLine size={24} />
      </Button>
      <div className="flex-1 min-w-0">
        <ChannelHeader />
      </div>
    </div>
  );
}

function ChatContent({ client, error }: { client: StreamChat | null; error: string | null }) {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { newDmUserId, clearNewDmUserId } = useChatDrawer();
  
  const [activeTab, setActiveTab] = useState<"team" | "messaging">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("athena_chat_tab") as "team" | "messaging") || "team";
    }
    return "team";
  });
  
  const [channelViewActive, setChannelViewActive] = useState(false);
  const [newDmActive, setNewDmActive] = useState(false);
  const [newSquadActive, setNewSquadActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("athena_chat_tab", activeTab);
    }
  }, [activeTab]);

  const [prevNewDmUserId, setPrevNewDmUserId] = useState<string | null>(null);

  // Sync state cleanly during render instead of effect to avoid eslint warning
  if (newDmUserId !== prevNewDmUserId) {
    setPrevNewDmUserId(newDmUserId);
    if (newDmUserId) {
      setActiveTab("messaging");
    }
  }

  const filters = useMemo(() => ({ 
    type: activeTab, 
    members: { $in: [String(user?.pk)] } 
  }), [activeTab, user?.pk]);
  
  const sort = useMemo(() => ({ last_message_at: -1 } as const), []);

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!client || !user) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-4">
          <LoadingIndicator />
          <p className="text-muted-foreground animate-pulse">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <style>{`
        .str-chat__channel-list { width: 100% !important; max-width: 100% !important; }
        .str-chat { width: 100% !important; max-width: 100% !important; }
        .str-chat__main-panel { width: 100% !important; max-width: 100% !important; }
        .str-chat-channel { width: 100% !important; max-width: 100% !important; }
        .str-chat__container { width: 100% !important; max-width: 100% !important; }
      `}</style>
      <Chat 
        client={client} 
        theme={`str-chat__theme-${resolvedTheme === "light" ? "light" : "dark"}`}
      >
        <DmHandler newDmUserId={newDmUserId} clearNewDmUserId={clearNewDmUserId} setChannelViewActive={setChannelViewActive} />
        
        <div className="flex h-full w-full relative overflow-hidden">
          
          {/* Channel List View */}
          <div className={`absolute inset-0 flex flex-col bg-card transition-transform duration-300 ${channelViewActive ? '-translate-x-full' : 'translate-x-0'}`}>
            <CustomListHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onNewDm={() => setNewDmActive(true)}
              onNewSquad={() => setNewSquadActive(true)}
            />
            <div className="flex-1 overflow-y-auto">
              <ChannelList
                key={activeTab}
                filters={filters}
                sort={sort}
                options={{ state: true, watch: true, presence: true }}
                setActiveChannelOnMount={false}
              />
            </div>
            <ChannelSelectInterceptor setChannelViewActive={setChannelViewActive} />
            {/* Inline new-message search — lives inside the sheet, over the list */}
            {newDmActive && <InlineNewDm onClose={() => setNewDmActive(false)} />}
            {newSquadActive && <InlineNewSquadChat onClose={() => setNewSquadActive(false)} />}
          </div>

          {/* Active Channel View */}
          <div className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ${channelViewActive ? 'translate-x-0' : 'translate-x-full'}`}>
            <Channel>
              <Window>
                <CustomChannelHeader onBack={() => setChannelViewActive(false)} />
                <MessageList />
                <MessageComposer />
              </Window>
              <Thread />
            </Channel>
          </div>
          
        </div>
      </Chat>
    </div>
  );
}

// A tricky component to intercept Stream Chat's setActiveChannel calls
function ChannelSelectInterceptor({ setChannelViewActive }: { setChannelViewActive: (val: boolean) => void }) {
  const { channel } = useChatContext();
  
  useEffect(() => {
    if (channel) {
      setChannelViewActive(true);
    } else {
      setChannelViewActive(false);
    }
  }, [channel, setChannelViewActive]);
  
  return null;
}

function DmHandler({ newDmUserId, clearNewDmUserId, setChannelViewActive }: { newDmUserId: string | null; clearNewDmUserId: () => void; setChannelViewActive: (val: boolean) => void }) {
  const { client, setActiveChannel } = useChatContext();
  const { user } = useAuth();

  useEffect(() => {
    if (newDmUserId && client && user) {
      const initDm = async () => {
        try {
          const channel = client.channel("messaging", {
            members: [String(user.pk), newDmUserId],
          });
          await channel.watch();
          setActiveChannel(channel);
          setChannelViewActive(true);
          clearNewDmUserId();
        } catch (e) {
          console.error("Failed to start DM", e);
        }
      };
      initDm();
    }
  }, [newDmUserId, client, user, setActiveChannel, clearNewDmUserId, setChannelViewActive]);

  return null;
}

export function GlobalChatDrawer() {
  const { isOpen, closeDrawer, openDrawer } = useChatDrawer();
  const { user } = useAuth();
  const { client, error } = useChatClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!client || !client.user) return;

    const ownUser = client.user as OwnUserResponse;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnreadCount(ownUser.total_unread_count ?? 0);

    const handleEvent = (event: Event) => {
      if (event.total_unread_count !== undefined) {
        setUnreadCount(event.total_unread_count);
      } else {
        const currentUser = client.user as OwnUserResponse | undefined;
        if (currentUser?.total_unread_count !== undefined) {
          setUnreadCount(currentUser.total_unread_count);
        }
      }
    };

    client.on(handleEvent);

    return () => {
      client.off(handleEvent);
    };
  }, [client]);

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative" 
          onClick={() => openDrawer()}
        >
          <RiChat3Line size={26} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
          )}
        </Button>
      </div>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l shadow-2xl h-full z-[100]" side="right">
          <ChatContent client={client} error={error} />
        </SheetContent>
      </Sheet>
    </>
  );
}
