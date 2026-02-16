import { useQuery } from "@tanstack/react-query";
import { getMySquads, getSquad, type SquadResponse } from "@/services/squad";
import { listTasks, type TaskListResponse } from "@/services/task";

export function useMySquad() {
  const {
    data: mySquads = [],
    isLoading: isLoadingMySquads,
  } = useQuery({
    queryKey: ["squads", "my"],
    queryFn: getMySquads,
  });

  const primarySquadId = mySquads[0]?.id ?? null;

  const { data: squad = null, isLoading: isLoadingSquad } = useQuery({
    queryKey: ["squad", primarySquadId],
    queryFn: () => getSquad(primarySquadId as number),
    enabled: primarySquadId != null,
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", { squad: primarySquadId }],
    queryFn: () => listTasks({ squad: primarySquadId as number }),
    enabled: primarySquadId != null,
  });

  const isLoading =
    isLoadingMySquads || (primarySquadId != null && (isLoadingSquad || isLoadingTasks));
  const isEmpty = !isLoadingMySquads && mySquads.length === 0;

  return {
    squad: squad as SquadResponse | null,
    tasks: tasks as TaskListResponse[],
    mySquadsCount: mySquads.length,
    isLoading,
    isEmpty,
  };
}
