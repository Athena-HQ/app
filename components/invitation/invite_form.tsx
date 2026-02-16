import { motion } from "framer-motion";
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
import { FieldInfo } from "@/components/field_info";
import { useInvitationForm } from "@/hooks/useInvitation";
import { INVITATION_ROLES, type InvitationRole } from "@/services/invitation";
import { FileUpIcon } from "lucide-react";
import { fadeInUpVariants } from "@/lib/animations-settings";

export function InviteForm() {
  const { form, isSubmitting } = useInvitationForm();

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.1 }}
      className="h-full "
    >
      <Card className="p-6 h-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Invite New Team Member</h2>
          <p className="text-sm text-muted-foreground">
            Add a new person to your team by sending an invitation
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
                  <Label htmlFor={field.name}>Email address</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="e.g., alex.doe@example.co"
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
              name="role"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Please select a role" : undefined,
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Role</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: string) => field.handleChange(value as InvitationRole)}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <SelectValue>
                        {field.state.value || "Select a role"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {INVITATION_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmittingForm]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting || isSubmittingForm}
              >
                {isSubmitting || isSubmittingForm
                  ? "Sending Invite..."
                  : "Send Invite"}
              </Button>
            )}
          </form.Subscribe>

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
