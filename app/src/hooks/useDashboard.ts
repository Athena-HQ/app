import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { dashboardService, simulateActivityUpdates, type Activity } from "@/services/dashboard";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
  });
};

export const useCompanyStock = () => {
  return useQuery({
    queryKey: ["dashboard", "company-stock"],
    queryFn: () => dashboardService.getCompanyStock(),
  });
};

export const useSquadDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "squad-distribution"],
    queryFn: () => dashboardService.getSquadDistribution(),
  });
};

export const useActivities = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => dashboardService.getActivities(),
  });

  useEffect(() => {
    const cleanup = simulateActivityUpdates((newActivity: Activity) => {
      queryClient.setQueryData(["dashboard", "activities"], (old: Activity[] = []) => {
        return [newActivity, ...old].slice(0, 10);
      });
    });

    return cleanup;
  }, [queryClient]);

  return query;
};

export const useTopPerformers = () => {
  return useQuery({
    queryKey: ["dashboard", "top-performers"],
    queryFn: () => dashboardService.getTopPerformers(),
  });
};
