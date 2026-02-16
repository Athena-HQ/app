"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation } from "@/services/invitation";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key") ?? "";

  const acceptMutation = useMutation({
    mutationFn: (data: { first_name: string; last_name: string; password: string }) =>
      acceptInvitation(key, data),
    onSuccess: () => {
      toast.success("Account created. You can now log in.");
      router.push("/login");
    },
    onError: () => {
      toast.error("Failed to accept invitation. The link may be invalid or expired.");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await acceptMutation.mutateAsync(value);
    },
  });

  if (!key) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This invitation link is missing a key. Please use the link from your invitation email.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/login")}>
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
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="first_name">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>First name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
            )}
          </form.Field>
          <form.Field name="last_name">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Last name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Choose a password"
                  required
                  minLength={8}
                />
              </div>
            )}
          </form.Field>
          <Button type="submit" disabled={acceptMutation.isPending} className="w-full">
            {acceptMutation.isPending ? "Creating account..." : "Accept and create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
