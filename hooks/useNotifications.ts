import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/services/notification";
import { useAuth } from "@/contexts/auth-context";

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000, // 30s polling
    staleTime: 10000,
  });
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
