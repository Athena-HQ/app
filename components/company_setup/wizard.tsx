"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CompanyInfoStep } from "./company_info_step";
import { DecisionMakerStep } from "./decision_maker_step";
import { ConfirmationStep } from "./confirmation_step";
import { useCompanySetup } from "@/hooks/useCompanySetup";

export function Wizard() {
  const {
    form,
    currentStep,
    nextStep,
    previousStep,
    submitForm,
    isSubmitting,
    submitError,
    isSuccess,
    validateStep,
    getValues,
  } = useCompanySetup();

  const router = useRouter();
  const { register, formState } = form;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (isSuccess) {
      timeoutId = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSuccess, router]);

  const handleNext = async () => {
    await nextStep();
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(2);
    if (isValid) {
      await submitForm();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompanyInfoStep
              register={register}
              errors={formState.errors}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DecisionMakerStep
              register={register}
              errors={formState.errors}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ConfirmationStep
              formData={getValues()}
              isSuccess={isSuccess}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                    step === currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : step < currentStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 w-12 transition-colors ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 ">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {!isSuccess && (
          <div className="flex justify-between pt-2 max-w-md mx-auto w-full">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
