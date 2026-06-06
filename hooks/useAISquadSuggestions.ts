"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api/api-util";

export interface AISquadSuggestion {
  squad_id: number;
  name: string;
  stack: string;
  description: string;
  member_count: number;
  aggregated_skills: string[];
  total_open_tasks: number;
  avg_feedback_rating: number | null;
  reason: string;
  confidence: "high" | "medium" | "low";
  is_overloaded: boolean;
}

export interface UseAISquadSuggestionsInput {
  title: string;
  description: string;
  category: string;
  priority: string;
  excludeSquadIds?: string[];
}

export interface UseAISquadSuggestionsResult {
  suggestions: AISquadSuggestion[];
  loading: boolean;
  error: string | null;
  trigger: () => void;
}

export function useAISquadSuggestions(
  input: UseAISquadSuggestionsInput,
): UseAISquadSuggestionsResult {
  const [suggestions, setSuggestions] = useState<AISquadSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tick = useRef(0);
  const [, forceRun] = useState(0);

  const trigger = useCallback(() => {
    tick.current += 1;
    forceRun((n) => n + 1);
  }, []);

  useEffect(() => {
    if (tick.current === 0) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSuggestions([]);

    const body = {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      exclude_squad_ids: (input.excludeSquadIds ?? []).map(Number),
    };

    api.post<{ suggestions: AISquadSuggestion[] }>("api/ai/suggest-squads/", body, {
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
  }, [tick.current]);

  return { suggestions, loading, error, trigger };
}
