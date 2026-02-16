import { z } from "zod";
import { INVITATION_ROLES } from "@/services/invitation";

export const invitationFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(INVITATION_ROLES as [string, ...string[]]).refine((val) => val !== undefined, {
    message: "Please select a role",
  }),
});

export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
