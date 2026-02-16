"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form_error";
import { useLoginForm } from "@/hooks/use_login_form";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  missing_key:
    "Verification link is incomplete. Please use the link from your email.",
  invalid_key:
    "This verification link is invalid. Please request a new verification email.",
  expired_or_invalid:
    "This link is invalid or has expired. Please request a new verification email.",
  confirmation_error:
    "Verification failed. Please try again or request a new verification email.",
};

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const message = searchParams.get("message");
  const status = searchParams.get("status");

  useEffect(() => {
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.");
    } else if (message === "already_verified") {
      toast.info("Email already verified. You can log in.");
    } else if (status === "error" && message && ERROR_MESSAGES[message]) {
      toast.error(ERROR_MESSAGES[message]);
    }
  }, [verified, message, status]);

  return null;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const { register, handleSubmit, formState, onSubmit } = useLoginForm(
    emailParam ?? undefined
  );
  const { errors, isSubmitting } = formState;

  return (
    <div className=" flex flex-col gap-6 w-full items-center justify-center">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <div className="w-full max-w-sm bg-transparent border-0 shadow-none flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-muted-foreground">
            Sign in to your Athena HQ account
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FormError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link
            href="/join"
            className="text-primary-foreground hover:underline font-medium"
          >
            Join now
          </Link>
        </div>
      </div>
    </div>
  );
}
