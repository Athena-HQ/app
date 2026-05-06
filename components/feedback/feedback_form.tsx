"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { feedbackFormSchema, type FeedbackFormValues } from "@/lib/validations/feedback";
import { feedbackService, FEEDBACK_ATTRIBUTES, type FeedbackAttributeValue } from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Loader2, Star, MessageSquare } from "lucide-react";
import { FormError } from "@/components/form_error";

interface FeedbackFormProps {
  task: TaskResponse;
  existingFeedbacks?: { to_app_user: number | null; to_squad: number | null }[];
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackForm({ task, existingFeedbacks = [] }: FeedbackFormProps) {
  const router = useRouter();
  const { appUser } = useCurrentAppUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      communication: 5,
      quality_of_work: 5,
      timeliness: 5,
      teamwork: 5,
      initiative: 5,
      comment: "",
    },
  });

  const selectedUser = watch("to_app_user");
  const selectedSquad = watch("to_squad");
  const targetValue = selectedUser ? `user_${selectedUser}` : selectedSquad ? `squad_${selectedSquad}` : "";

  const handleTargetChange = (val: string) => {
    if (val.startsWith("user_")) {
      setValue("to_app_user", parseInt(val.replace("user_", ""), 10));
      setValue("to_squad", undefined);
    } else if (val.startsWith("squad_")) {
      setValue("to_squad", parseInt(val.replace("squad_", ""), 10));
      setValue("to_app_user", undefined);
    }
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await feedbackService.createFeedback({
        to_app_user: data.to_app_user,
        to_squad: data.to_squad,
        task: task.id,
        communication: data.communication as FeedbackAttributeValue,
        quality_of_work: data.quality_of_work as FeedbackAttributeValue,
        timeliness: data.timeliness as FeedbackAttributeValue,
        teamwork: data.teamwork as FeedbackAttributeValue,
        initiative: data.initiative as FeedbackAttributeValue,
        comment: data.comment,
      });
      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  const availableUsers = (task.assignees || []).filter(
    (a) => a.id !== appUser?.id && !existingFeedbacks.some((f) => f.to_app_user === a.id)
  );
  const availableSquads = (task.squads || []).filter(
    (s) => !existingFeedbacks.some((f) => f.to_squad === s.id)
  );

  if (availableUsers.length === 0 && availableSquads.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed rounded-xl bg-muted/20 text-center flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground max-xs">
          You have already provided feedback for all assignees and squads on this task.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Back to Task
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            Target
            <span className="text-destructive">*</span>
          </Label>
          <Select value={targetValue} onValueChange={handleTargetChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select who to review" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Individuals
                </div>
              )}
              {availableUsers.map((u) => (
                <SelectItem key={`user_${u.id}`} value={`user_${u.id}`}>
                  {u.first_name} {u.last_name}
                </SelectItem>
              ))}
              
              {availableSquads.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2 border-t pt-3">
                    Squads
                  </div>
                  {availableSquads.map((s) => (
                    <SelectItem key={`squad_${s.id}`} value={`squad_${s.id}`}>
                      {s.name} (Squad)
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <FormError message={errors.to_app_user?.message} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {FEEDBACK_ATTRIBUTES.map((attr) => (
            <div key={attr.key} className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {attr.label}
              </Label>
              <Controller
                name={attr.key}
                control={control}
                render={({ field }) => (
                  <StarRating
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  />
                )}
              />
              <FormError message={errors[attr.key]?.message} />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            Comments
            <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
          </Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              placeholder="What went well? What could be improved?"
              className="min-h-[120px] pl-10 resize-none"
              {...register("comment")}
            />
          </div>
          <FormError message={errors.comment?.message} />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !targetValue}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </div>
    </form>
  );
}
