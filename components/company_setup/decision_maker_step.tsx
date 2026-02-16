import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CompanySetupForm } from "@/lib/validations/company_setup";

export interface DecisionMakerStepProps {
  register: UseFormRegister<CompanySetupForm>;
  errors: FieldErrors<CompanySetupForm>;
}

export function DecisionMakerStep({
  register,
  errors,
}: DecisionMakerStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h2 className="text-xl font-semibold">Your Information</h2>
        <p className="text-sm text-muted-foreground">
          Create your account as the company decision maker
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="flex gap-2">
          <div className="space-y-2 flex-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              size="lg"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
            <AnimatePresence mode="wait">
              {errors.fullName?.message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-destructive"
                >
                  {errors.fullName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@acme.com"
              size="lg"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <AnimatePresence mode="wait">
              {errors.email?.message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-destructive"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            size="lg"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <AnimatePresence mode="wait">
            {errors.password?.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-destructive"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            size="lg"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <AnimatePresence mode="wait">
            {errors.confirmPassword?.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-destructive"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
