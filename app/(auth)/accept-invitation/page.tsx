"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/form_error";
import { acceptInvitation } from "@/services/invitation";
import {
  acceptInvitationSchema,
  type AcceptInvitationFormValues,
} from "@/lib/validations/accept-invitation";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key") ?? "";

  const acceptMutation = useMutation({
    mutationFn: (data: AcceptInvitationFormValues) =>
      acceptInvitation(key, {
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      }),
    onSuccess: () => {
      toast.success("Account created. You can now log in.");
      router.push("/login");
    },
    onError: () => {
      toast.error(
        "Failed to accept invitation. The link may be invalid or expired."
      );
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      password: "",
    },
  });

  const onSubmit = (data: AcceptInvitationFormValues) => {
    acceptMutation.mutateAsync(data);
  };

  if (!key) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This invitation link is missing a key. Please use the link from your
            invitation email.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push("/login")}
          >
            Go to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Accept invitation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account and join your team.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              placeholder="First name"
              aria-invalid={Boolean(errors.first_name)}
              {...register("first_name")}
            />
            <FormError message={errors.first_name?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              placeholder="Last name"
              aria-invalid={Boolean(errors.last_name)}
              {...register("last_name")}
            />
            <FormError message={errors.last_name?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FormError message={errors.password?.message} />
          </div>
          <Button
            type="submit"
            disabled={acceptMutation.isPending || isSubmitting}
            className="w-full"
          >
            {acceptMutation.isPending ? "Creating account..." : "Accept and create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
