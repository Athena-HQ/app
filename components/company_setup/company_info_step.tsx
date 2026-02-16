import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CompanySetupForm } from "@/lib/validations/company_setup";

export interface CompanyInfoStepProps {
  register: UseFormRegister<CompanySetupForm>;
  errors: FieldErrors<CompanySetupForm>;
}

export function CompanyInfoStep({ register, errors }: CompanyInfoStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h2 className="text-xl font-semibold">Company Information</h2>
        <p className="text-sm text-muted-foreground">
          Let&apos;s start by setting up your company workspace
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        <div className="flex flex-col gap-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="Acme Corporation"
            size="lg"
            aria-invalid={Boolean(errors.companyName)}
            {...register("companyName")}
          />
          <AnimatePresence mode="wait">
            {errors.companyName?.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-destructive"
              >
                {errors.companyName.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
