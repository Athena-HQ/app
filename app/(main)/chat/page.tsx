"use client";

import React, { useState, useEffect } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useChatClient } from "@/hooks/useChatClient";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { RiTeamLine, RiMessage3Line, RiAddLine } from "@remixicon/react";

export default function ChatPage() {
  const { client, error } = useChatClient();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"team" | "messaging">("team");
  
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!client || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <div className="flex flex-col items-center gap-4">
          <LoadingIndicator size={40} />
          <p className="text-muted-foreground animate-pulse">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  const filters = { type: activeTab, members: { $in: [String(user.pk)] } };
  const sort = { last_message_at: -1 } as const;

  const CustomListHeader = () => (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold font-serif italic text-foreground">Messages</h1>
        {activeTab === "messaging" && (
          <button 
            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            title="Start new DM"
            onClick={() => {
              // Usually handled by a Channel create modal (which you can implement later)
              alert("Starting new 1-1 chat will open user search modal.");
            }}
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

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] border rounded-xl overflow-hidden bg-background shadow-sm">
      <Chat 
        client={client} 
        theme={`str-chat__theme-${resolvedTheme === "light" ? "light" : "dark"}`}
      >
        <div className="flex h-full w-full">
          {/* Sidebar / Channel List */}
          <div className="w-full md:w-80 border-r flex flex-col bg-card">
            <ChannelList
              filters={filters}
              sort={sort}
              options={{ state: true, watch: true, presence: true }}
              ListHeader={CustomListHeader}
            />
          </div>

          {/* Active Channel View */}
          <div className="flex-1 flex flex-col min-w-0">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </Chat>
    </div>
  );
}
