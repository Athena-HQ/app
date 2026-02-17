import { z } from "zod";

export const companyInfoSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
});

export const decisionMakerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const companySetupSchema = z.object({
  ...companyInfoSchema.shape,
  ...decisionMakerSchema.shape,
});

export type CompanyInfoForm = z.infer<typeof companyInfoSchema>;
export type DecisionMakerForm = z.infer<typeof decisionMakerSchema>;
export type CompanySetupForm = z.infer<typeof companySetupSchema>;
