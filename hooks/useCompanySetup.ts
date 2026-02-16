import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companySetupSchema,
  type CompanySetupForm,
} from "@/lib/validations/company_setup";
import { createCompany } from "@/services/company";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-util";

const STEP_1_FIELDS = ["companyName", "companyIdentifier"] as const;
const STEP_2_FIELDS = [
  "fullName",
  "email",
  "password",
  "confirmPassword",
] as const;

export const useCompanySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<CompanySetupForm>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      companyName: "",
      companyIdentifier: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const { trigger, getValues, formState } = form;
  const errors = formState.errors;

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return trigger(STEP_1_FIELDS);
    }
    if (step === 2) {
      return trigger(STEP_2_FIELDS);
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    const isValid = await validateStep(2);
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const values = getValues();
      const response = await createCompany({
        companyName: values.companyName,
        companyIdentifier: values.companyIdentifier,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone_number: "",
        country: "",
        city: "",
        postal_code: "",
      });

      if (response.requiresVerification) {
        toast.info(
          "Please check your email for verification. After verifying, you can create your company."
        );
        setSubmitError(
          "Please verify your email address. Check your inbox for the verification link."
        );
      } else if (response.signupSuccess) {
        toast.success("Account created successfully!");
        setIsSuccess(true);
      } else {
        setSubmitError("Failed to create company. Please try again.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage =
          error.message || "Failed to create company. Please try again.";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepErrors: Record<string, string | undefined> = {
    companyName: errors.companyName?.message,
    companyIdentifier: errors.companyIdentifier?.message,
    fullName: errors.fullName?.message,
    email: errors.email?.message,
    password: errors.password?.message,
    confirmPassword: errors.confirmPassword?.message,
  };

  return {
    form,
    currentStep,
    nextStep,
    previousStep,
    submitForm,
    isSubmitting,
    submitError,
    isSuccess,
    validateStep,
    errors: stepErrors,
    getValues,
  };
};
