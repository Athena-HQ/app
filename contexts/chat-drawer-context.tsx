"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatDrawerContextType {
  isOpen: boolean;
  openDrawer: (newDmUserId?: string) => void;
  closeDrawer: () => void;
  newDmUserId: string | null;
  clearNewDmUserId: () => void;
}

const ChatDrawerContext = createContext<ChatDrawerContextType | undefined>(undefined);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDmUserId, setNewDmUserId] = useState<string | null>(null);

  const openDrawer = (userId?: string) => {
    if (userId) {
      setNewDmUserId(userId);
    }
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const clearNewDmUserId = () => {
    setNewDmUserId(null);
  };

  return (
    <ChatDrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        newDmUserId,
        clearNewDmUserId,
      }}
    >
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer() {
  const context = useContext(ChatDrawerContext);
  if (context === undefined) {
    throw new Error("useChatDrawer must be used within a ChatDrawerProvider");
  }
  return context;
}
