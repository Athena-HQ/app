import { CheckCircle2 } from "lucide-react";
import type { CompanySetupForm } from "@/lib/validations/company_setup";

interface ConfirmationStepProps {
  formData: CompanySetupForm;
  isSuccess: boolean;
}

export function ConfirmationStep({
  formData,
  isSuccess,
}: ConfirmationStepProps) {
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Company Created!</h2>
          <p className="text-muted-foreground">
            Your workspace has been successfully set up.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h2 className="text-xl font-semibold">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before creating your workspace
        </p>
      </div>

      <div className="space-y-6 bg-muted/50 rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Company Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Company Name:</span>
                <span className="text-sm">{formData.companyName}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Your Account
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Full Name:</span>
                <span className="text-sm">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{formData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By creating a workspace, you agree to our Terms of Service and Privacy
        Policy
      </p>
    </div>
  );
}
