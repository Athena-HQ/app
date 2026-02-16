import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { ChecklistPreview } from "@/services/onboarding";

type ChecklistBoardProps = {
  checklist: ChecklistPreview;
  onComplete?: (stepId: string) => void;
  isCompleting?: boolean;
};

export function ChecklistBoard({
  checklist,
  onComplete,
  isCompleting,
}: ChecklistBoardProps) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{checklist.title}</h2>
        <p className="text-sm text-muted-foreground">
          Work through these with your buddy over the first week.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {checklist.steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3 rounded-xl border p-4"
          >
            {step.status === "completed" ? (
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/70 text-primary-foreground">
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <span className="mt-1 h-3 w-3 rounded-full bg-primary/70" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
            {onComplete &&
              step.status !== "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isCompleting}
                  onClick={() => onComplete(step.id)}
                >
                  Mark complete
                </Button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
