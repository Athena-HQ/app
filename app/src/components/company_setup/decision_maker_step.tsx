import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Field, type AnyFieldApi } from "@tanstack/react-form";
interface DecisionMakerStepProps {
  form: {
    Field: typeof Field;
  };
  errors: {
    [key: string]: string | undefined;
  };
  onBlur: (fieldName: string) => void;
}

export function DecisionMakerStep({
  form,
  errors,
  onBlur,
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
          <form.Field name="fullName">
            {(field: AnyFieldApi) => (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => onBlur("fullName")}
                  size="lg"
                />
                <AnimatePresence mode="wait">
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-destructive"
                    >
                      {errors.fullName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field: AnyFieldApi) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@acme.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => onBlur("email")}
                  size="lg"
                />
                <AnimatePresence mode="wait">
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-destructive"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="password">
          {(field: AnyFieldApi) => (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => onBlur("password")}
                size="lg"
              />
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-destructive"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field: AnyFieldApi) => (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => onBlur("confirmPassword")}
                size="lg"
              />
              <AnimatePresence mode="wait">
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-destructive"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}
