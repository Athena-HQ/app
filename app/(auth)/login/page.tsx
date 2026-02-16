"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "@/components/field_info";
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
  const form = useLoginForm(emailParam ?? undefined);

  return (
    <div className=" flex items-center justify-center w-full">
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) =>
                  !value
                    ? "Email is required"
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? "Please enter a valid email address"
                      : undefined,
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="Enter your email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>

          <div className="flex flex-col gap-2">
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) =>
                  !value
                    ? "Password is required"
                    : value.length < 6
                      ? "Password must be at least 6 characters long"
                      : undefined,
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="Enter your password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </form.Subscribe>
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
