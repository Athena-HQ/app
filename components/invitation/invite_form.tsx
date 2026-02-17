import { motion } from "framer-motion";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/form_error";
import { useInvitationForm } from "@/hooks/useInvitation";
import { INVITATION_ROLES, type InvitationRole } from "@/services/invitation";
import type { InvitationFormValues } from "@/lib/validations/invitation";
import { FileUpIcon } from "lucide-react";
import { fadeInUpVariants } from "@/lib/animations-settings";
import { cn } from "@/lib/utils";

interface InviteFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function InviteForm({ onSuccess, className }: InviteFormProps) {
  const { form, onSubmit, isSubmitting } = useInvitationForm();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = async (data: InvitationFormValues) => {
    const isSuccess = await onSubmit(data);
    if (isSuccess) {
      onSuccess?.();
    }
  };

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.1 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full border-none bg-transparent p-6 shadow-none">
        {/* <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Invite New Team Member</h2>
          <p className="text-sm text-muted-foreground">
            Add a new person to your team by sending an invitation
          </p>
        </div> */}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex gap-3 *:flex-1 w-full">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., alex.doe@example.co"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              <FormError message={errors.email?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: string) =>
                      field.onChange(value as InvitationRole)
                    }
                  >
                    <SelectTrigger
                      id="role"
                      aria-invalid={Boolean(errors.role)}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a role">
                        {field.value || "Select a role"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {INVITATION_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="capitalize" >
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormError message={errors.role?.message} />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Invite..." : "Send Invite"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className=" px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full">
            <FileUpIcon />
            Bulk Invite (CSV)
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
