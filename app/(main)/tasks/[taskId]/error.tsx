"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TaskDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="p-6 flex flex-col gap-4">
        <p className="text-destructive">
          Failed to load task details from backend.
        </p>
        <Button onClick={reset} className="w-fit">
          Retry
        </Button>
      </Card>
    </div>
  );
}
