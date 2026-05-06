"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { feedbackFormSchema, type FeedbackFormValues } from "@/lib/validations/feedback";
import { feedbackService, FEEDBACK_ATTRIBUTES, type FeedbackAttributeValue } from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Loader2, Star, Users, User, ArrowRight, CheckCircle2, Quote } from "lucide-react";
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
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.2)]" 
                : "text-white/5 group-hover:text-white/20"
            )}
          />
        </button>
      ))}
      <span className="ml-4 text-sm font-black text-white/20 w-4 tabular-nums">{value}</span>
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
      communication: 0,
      quality_of_work: 0,
      timeliness: 0,
      teamwork: 0,
      initiative: 0,
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
      setValue("to_squad", (target.data as { id: number }).id);
      setValue("to_app_user", undefined);
    }
    // Scroll to form on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
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
      
      const nextTarget = allTargets.find(t => t.id !== selectedTargetId);
      if (nextTarget) {
        setSelectedTargetId(null);
        reset({
          communication: 0,
          quality_of_work: 0,
          timeliness: 0,
          teamwork: 0,
          initiative: 0,
          comment: "",
        });
        router.refresh();
      } else {
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
      <div className="p-16 border border-white/5 rounded-[40px] bg-white/[0.02] backdrop-blur-xl text-center flex flex-col items-center gap-6 shadow-2xl">
        <div className="h-20 w-20 rounded-3xl bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tight">Mission Accomplished!</h3>
          <p className="text-sm text-white/40 max-w-xs mx-auto font-medium">
            Every team member and squad on this task has been reviewed.
          </p>
        </div>
        <Button variant="secondary" size="lg" onClick={() => router.push(`/tasks/${task.id}`)} className="mt-4 rounded-full px-10 bg-white/5 hover:bg-white/10 text-white border-white/5 font-bold">
          Return to Task
        </Button>
      </div>
    );
  }

  const currentTarget = allTargets.find(t => t.id === selectedTargetId);

  return (
    <div className="flex flex-col gap-12">
      {/* Target Selection Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
            <Users className="h-4 w-4" /> 
            Pending Reviews ({allTargets.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allTargets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => handleSelectTarget(target)}
              className={cn(
                "flex items-center gap-5 p-6 rounded-[32px] border transition-all text-left group relative overflow-hidden",
                selectedTargetId === target.id
                  ? "border-yellow-400/50 bg-yellow-400/5 shadow-[0_0_40px_rgba(250,204,21,0.1)] scale-[1.03]"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
              )}
            >
              <Avatar className={cn(
                "h-12 w-12 border shadow-2xl",
                selectedTargetId === target.id ? "border-yellow-400/30" : "border-white/5"
              )}>
                <AvatarFallback className={cn(
                  "font-black text-lg",
                  target.type === 'squad' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                )}>
                  {target.type === 'squad' ? <Users className="h-5 w-5" /> : target.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 z-10">
                <p className={cn(
                  "font-black truncate transition-colors text-base tracking-tight",
                  selectedTargetId === target.id ? "text-yellow-400" : "text-white/90"
                )}>
                  {target.name}
                </p>
                <p className="text-[9px] uppercase font-black tracking-widest text-white/20 mt-0.5">
                  {target.type === 'squad' ? 'Squad Unit' : 'Individual'}
                </p>
              </div>
              {selectedTargetId === target.id ? (
                <div className="h-8 w-8 rounded-2xl bg-yellow-400 flex items-center justify-center text-[#111111] shrink-0 shadow-lg">
                  <ArrowRight className="h-4 w-4 stroke-[3px]" />
                </div>
              ) : (
                <ArrowRight className="h-5 w-5 text-white/10 group-hover:text-white/30 shrink-0 transition-all group-hover:translate-x-1" />
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
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -30 }}
            className="bg-[#111111]/80 backdrop-blur-2xl rounded-[48px] border border-white/5 p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12 pb-10 border-b border-white/5 relative z-10">
              <div className={cn(
                "h-20 w-20 rounded-[32px] flex items-center justify-center shadow-2xl",
                currentTarget.type === 'squad' ? "bg-purple-500/10" : "bg-blue-500/10"
              )}>
                {currentTarget.type === 'squad' ? <Users className="h-10 w-10 text-purple-400" /> : <User className="h-10 w-10 text-blue-400" />}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-white tracking-tighter">Reviewing {currentTarget.name}</h3>
                <p className="text-sm text-white/30 font-bold mt-1 tracking-tight">How was their contribution to this task?</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 relative z-10">
              {error && (
                <div className="p-5 bg-red-500/10 text-red-400 rounded-3xl text-sm font-black border border-red-500/20 flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-10">
                {FEEDBACK_ATTRIBUTES.map((attr) => (
                  <div key={attr.key} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group/field">
                    <div className="space-y-1">
                      <Label className="text-base font-black text-white/80 group-hover/field:text-white transition-colors uppercase tracking-wider">
                        {attr.label}
                      </Label>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Performance Metric</p>
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

              <div className="space-y-4 pt-4">
                <Label className="text-sm font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  Written Feedback
                  <span className="text-white/10 text-[10px] font-black tracking-normal ml-auto">(Optional)</span>
                </Label>
                <div className="relative group">
                  <Quote className="absolute left-6 top-6 h-6 w-6 text-white/5 transition-colors group-focus-within:text-yellow-400/20" />
                  <Textarea
                    placeholder="Describe their work, speed, and attitude..."
                    className="min-h-[200px] pl-16 pr-8 py-6 rounded-[32px] border-white/5 bg-white/[0.02] focus:bg-white/[0.04] focus:border-white/10 focus:ring-0 transition-all text-base text-white/80 placeholder:text-white/10 font-medium leading-relaxed shadow-inner"
                    {...register("comment")}
                  />
                </div>
                <FormError message={errors.comment?.message} />
              </div>

              <div className="flex items-center justify-between gap-6 pt-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedTargetId(null)}
                  disabled={isSubmitting}
                  className="rounded-full px-8 font-black text-xs uppercase tracking-widest text-white/20 hover:text-white/50 hover:bg-white/5"
                >
                  Change Target
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-[220px] h-16 rounded-full font-black text-lg uppercase tracking-tight shadow-[0_20px_50px_rgba(250,204,21,0.15)] bg-yellow-400 text-[#111111] hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Review"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedTargetId && (
        <div className="text-center py-28 bg-white/[0.01] rounded-[60px] border border-dashed border-white/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-yellow-400/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="h-28 w-28 bg-[#111111] rounded-[40px] shadow-2xl border border-white/5 flex items-center justify-center mx-auto mb-8 relative z-10">
            <Star className="h-12 w-12 text-white/5 animate-pulse" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tighter relative z-10">Performance Hub</h3>
          <p className="text-white/20 max-w-sm mx-auto mb-10 font-bold text-sm leading-relaxed relative z-10">
            Select a team member or squad from the grid above to start the performance evaluation.
          </p>
          <div className="flex items-center justify-center gap-3 relative z-10">
            <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black text-white/20 tracking-widest uppercase py-1">Horizontal Stats</Badge>
            <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black text-white/20 tracking-widest uppercase py-1">Dark Interface</Badge>
            <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black text-white/20 tracking-widest uppercase py-1">Upwork-Style</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
