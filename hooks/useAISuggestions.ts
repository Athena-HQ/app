"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api/api-util";

export interface AISuggestion {
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

export interface UseAISuggestionsInput {
  title: string;
  description: string;
  category: string;
  priority: string;
  parentAssigneeNames?: string[];
}

export interface UseAISuggestionsResult {
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
  trigger: () => void;
}

export function useAISuggestions(
  input: UseAISuggestionsInput,
): UseAISuggestionsResult {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Counter-based trigger — incrementing forces the effect to re-run
  const tick = useRef(0);
  const [, forceRun] = useState(0);

  const trigger = useCallback(() => {
    tick.current += 1;
    forceRun((n) => n + 1);
  }, []);

  useEffect(() => {
    if (tick.current === 0) return; // Don't auto-fire on mount

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSuggestions([]);

    const body: Record<string, unknown> = {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
    };
    if (input.parentAssigneeNames && input.parentAssigneeNames.length > 0) {
      body.parent_assignee_names = input.parentAssigneeNames;
    }

    api.post<{ suggestions: AISuggestion[] }>("api/ai/suggest-assignees/", body, {
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
