"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { feedbackFormSchema, type FeedbackFormValues } from "@/lib/validations/feedback";
import { feedbackService, FEEDBACK_ATTRIBUTES, type FeedbackAttributeValue } from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Star, Send, Loader2, Users, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  task: TaskResponse;
  targetUser?: { id: number; first_name: string; last_name: string };
  targetSquad?: { id: number; name: string };
  onSuccess?: () => void;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = React.useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0 transition-transform duration-100 hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackForm({ task, targetUser, targetSquad, onSuccess }: FeedbackFormProps) {
  const router = useRouter();
  const { appUser } = useCurrentAppUser();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      communication: 0,
      quality_of_work: 0,
      timeliness: 0,
      teamwork: 0,
      initiative: 0,
      comment: "",
      to_app_user: targetUser?.id,
      to_squad: targetSquad?.id,
    },
  });

  const ratings = watch();
  const totalRating = (ratings.communication || 0) + 
                      (ratings.quality_of_work || 0) + 
                      (ratings.timeliness || 0) + 
                      (ratings.teamwork || 0) + 
                      (ratings.initiative || 0);

  const targetName = targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : targetSquad?.name;

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      await feedbackService.createFeedback({
        ...data,
        communication: data.communication as FeedbackAttributeValue,
        quality_of_work: data.quality_of_work as FeedbackAttributeValue,
        timeliness: data.timeliness as FeedbackAttributeValue,
        teamwork: data.teamwork as FeedbackAttributeValue,
        initiative: data.initiative as FeedbackAttributeValue,
        task: task.id,
      });
      toast.success(`Feedback submitted for ${targetName}`);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              {targetUser ? <User className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-primary" />}
            </div>
            <h4 className="text-sm font-bold tracking-tight">
              Rate {targetName}
            </h4>
            <Badge variant="outline" className="text-[10px] bg-background/50 border-primary/20 text-primary h-5">
              {totalRating}/25 stars
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 mb-5">
            {FEEDBACK_ATTRIBUTES.map((attr) => (
              <div key={attr.key} className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                  {attr.label}
                </span>
                <Controller
                  name={attr.key}
                  control={control}
                  render={({ field }) => (
                    <StarRating
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <Textarea
              {...register("comment")}
              placeholder={`Add a comment for ${targetName} (optional)...`}
              rows={2}
              className="w-full bg-background/40 border-primary/10 focus:border-primary/30 transition-colors resize-none text-sm rounded-xl placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-full px-5 h-9 font-bold shadow-lg shadow-primary/20">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
