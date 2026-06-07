"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/api-util";

export interface AISquadMemberSuggestion {
  employee_id: number;
  name: string;
  role: string;
  xp_level: string;
  total_xp: number;
  avg_feedback_rating: number | null;
  open_task_count: number;
  skills: string[];
  reason: string;
  confidence: "high" | "medium" | "low";
  is_busy: boolean;
}

export interface UseAISquadMemberSuggestionsInput {
  roleName: string;
  stack: string;
  description: string;
  excludeEmployeeIds?: string[];
}

export interface UseAISquadMemberSuggestionsResult {
  suggestions: AISquadMemberSuggestion[];
  loading: boolean;
  error: string | null;
  trigger: () => void;
}

export function useAISquadMemberSuggestions(
  input: UseAISquadMemberSuggestionsInput,
): UseAISquadMemberSuggestionsResult {
  const [suggestions, setSuggestions] = useState<AISquadMemberSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [run, forceRun] = useState(0);

  const trigger = useCallback(() => {
    forceRun((n) => n + 1);
  }, []);

  useEffect(() => {
    if (run === 0) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSuggestions([]);

    const body = {
      role_name: input.roleName,
      stack: input.stack,
      description: input.description,
      exclude_employee_ids: (input.excludeEmployeeIds ?? []).map(Number),
    };

    api.post<{ suggestions: AISquadMemberSuggestion[] }>("api/ai/suggest-squad-members/", body, {
      signal: controller.signal,
    })
      .then((data) => {
        setSuggestions(data.suggestions ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 408) return;
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Unknown error.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { suggestions, loading, error, trigger };
}
