import { z } from "zod";

export const feedbackFormSchema = z.object({
  communication: z.number().min(1).max(5),
  quality_of_work: z.number().min(1).max(5),
  timeliness: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  initiative: z.number().min(1).max(5),
  comment: z.string().optional(),
  to_app_user: z.number().optional(),
  to_squad: z.number().optional(),
}).refine((data) => data.to_app_user || data.to_squad, {
  message: "Feedback must be directed to a user or a squad.",
  path: ["to_app_user"],
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
