"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { feedbackFormSchema, type FeedbackFormValues } from "@/lib/validations/feedback";
import { feedbackService, FEEDBACK_ATTRIBUTES, type FeedbackAttributeValue } from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Loader2, Star, MessageSquare, Users, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormError } from "@/components/form_error";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackFormProps {
  task: TaskResponse;
  existingFeedbacks?: { to_app_user: number | null; to_squad: number | null }[];
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all hover:scale-125 active:scale-95 group"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-slate-200 group-hover:text-slate-300"
            )}
          />
        </button>
      ))}
      <span className="ml-3 text-base font-bold text-slate-400 w-6">{value}</span>
    </div>
  );
}

export function FeedbackForm({ task, existingFeedbacks = [] }: FeedbackFormProps) {
  const router = useRouter();
  const { appUser } = useCurrentAppUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track which target is currently being reviewed
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
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

  const availableUsers = (task.assignees || []).filter(
    (a) => a.id !== appUser?.id && !existingFeedbacks.some((f) => f.to_app_user === a.id)
  );
  const availableSquads = (task.squads || []).filter(
    (s) => !existingFeedbacks.some((f) => f.to_squad === s.id)
  );

  const allTargets = [
    ...availableUsers.map(u => ({ id: `user_${u.id}`, name: `${u.first_name} ${u.last_name}`, type: 'user', data: u })),
    ...availableSquads.map(s => ({ id: `squad_${s.id}`, name: s.name, type: 'squad', data: s }))
  ];

  const handleSelectTarget = (target: typeof allTargets[0]) => {
    setSelectedTargetId(target.id);
    if (target.type === 'user') {
      setValue("to_app_user", target.data.id);
      setValue("to_squad", undefined);
    } else {
      setValue("to_squad", (target.data as any).id);
      setValue("to_app_user", undefined);
    }
    // Scroll to form on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById("review-form-anchor")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
      
      // If we finished one, clear it and show success or move to next
      const nextTarget = allTargets.find(t => t.id !== selectedTargetId);
      if (nextTarget) {
        // More reviews pending
        setSelectedTargetId(null);
        reset({
          communication: 5,
          quality_of_work: 5,
          timeliness: 5,
          teamwork: 5,
          initiative: 5,
          comment: "",
        });
        router.refresh();
      } else {
        // All done
        router.push(`/tasks/${task.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback. Please try again.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (allTargets.length === 0) {
    return (
      <div className="p-12 border-2 border-dashed rounded-3xl bg-slate-50 text-center flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            You have already provided feedback for everyone on this task.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}`)} className="mt-2 rounded-full px-8">
          Back to Task
        </Button>
      </div>
    );
  }

  const currentTarget = allTargets.find(t => t.id === selectedTargetId);

  return (
    <div className="flex flex-col gap-10">
      {/* Target Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4" /> 
            Select who to review ({allTargets.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTargets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => handleSelectTarget(target)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                selectedTargetId === target.id
                  ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                  : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <Avatar className={cn(
                "h-10 w-10 border shadow-sm",
                selectedTargetId === target.id ? "border-primary/20" : "border-slate-100"
              )}>
                <AvatarFallback className={cn(
                  "font-bold",
                  target.type === 'squad' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                )}>
                  {target.type === 'squad' ? <Users className="h-4 w-4" /> : target.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold truncate transition-colors",
                  selectedTargetId === target.id ? "text-primary" : "text-slate-900"
                )}>
                  {target.name}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {target.type === 'squad' ? 'Squad' : 'Team Member'}
                </p>
              </div>
              {selectedTargetId === target.id ? (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <ArrowRight className="h-3 w-3" />
                </div>
              ) : (
                <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 shrink-0 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div id="review-form-anchor" />

      {/* Review Form Section */}
      <AnimatePresence mode="wait">
        {selectedTargetId && currentTarget && (
          <motion.div
            key={selectedTargetId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/50"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center",
                currentTarget.type === 'squad' ? "bg-purple-100" : "bg-blue-100"
              )}>
                {currentTarget.type === 'squad' ? <Users className="h-6 w-6 text-purple-600" /> : <User className="h-6 w-6 text-blue-600" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Reviewing {currentTarget.name}</h3>
                <p className="text-sm text-slate-400 font-medium">Please provide a fair and honest rating based on task performance.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-10">
                {FEEDBACK_ATTRIBUTES.map((attr) => (
                  <div key={attr.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-lg font-bold text-slate-800">
                        {attr.label}
                      </Label>
                      <p className="text-xs text-slate-400 font-medium">Rate from 1 to 5 stars</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Comment
                  <span className="text-slate-300 text-sm font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Quote className="absolute left-4 top-4 h-5 w-5 text-slate-200" />
                  <Textarea
                    placeholder="Share your experience working with them on this task..."
                    className="min-h-[160px] pl-12 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-0 transition-all text-base bg-slate-50/30"
                    {...register("comment")}
                  />
                </div>
                <FormError message={errors.comment?.message} />
              </div>

              <div className="flex items-center justify-between gap-4 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedTargetId(null)}
                  disabled={isSubmitting}
                  className="rounded-full px-6 font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-[180px] h-12 rounded-full font-black text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedTargetId && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="h-20 w-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <Star className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to rate?</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Select a team member or squad from the list above to provide your performance feedback.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-400">Horizontal Stars</Badge>
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-400">Yellow Icons</Badge>
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-400">Slate Aesthetic</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
