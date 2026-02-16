"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login as loginApi, logout as logoutApi, type LoginRequest, type UserResponse } from "@/services/auth";
import { setUnauthorizedHandler } from "@/lib/api/api-util";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "";
      const publicPrefixes = ["/login", "/join", "/onboarding", "/verify"];
      const isPublicRoute = publicPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
      queryClient.setQueryData(["auth", "user"], null);
      if (!isPublicRoute) {
        queryClient.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    });
  }, [queryClient]);

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
    },
  });

  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
    await refetch();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
