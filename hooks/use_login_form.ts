"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-util";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Helper function to properly validate with Zod and return string errors
function validateWithZod(value: LoginFormData) {
  const result = loginSchema.safeParse(value);
  if (result.success) {
    return undefined;
  }

  // Extract the first error message for each field
  const fieldErrors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as string;
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  });

  return fieldErrors;
}

export function useLoginForm(initialEmail?: string) {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm({
    defaultValues: {
      email: initialEmail ?? "",
      password: "",
    } as LoginFormData,
    onSubmit: async ({ value }) => {
      try {
        await login({
          email: value.email,
          password: value.password,
        });
        toast.success("Login successful");
        router.push("/dashboard");
      } catch (error) {
        if (error instanceof ApiError) {
          const errorMessage =
            error.message || "Invalid email or password. Please try again.";
          toast.error(errorMessage);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
        throw error;
      }
    },
    validators: {
      onSubmit: ({ value }) => validateWithZod(value),
      onBlur: ({ value }) => validateWithZod(value),
    },
  });

  return form;
}
