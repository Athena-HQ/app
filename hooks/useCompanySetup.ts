import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  companyInfoSchema,
  decisionMakerSchema,
  type CompanySetupForm,
} from "@/lib/validations/company_setup";
import { createCompany } from "@/services/company";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-util";

type ValidationErrors = {
  [key: string]: string | undefined;
};

export const useCompanySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const form = useForm({
    defaultValues: {
      companyName: "",
      companyIdentifier: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    } as CompanySetupForm,
  });

  const validateField = (fieldName: string) => {
    const values = form.state.values;

    if (currentStep === 1) {
      const result = companyInfoSchema.safeParse({
        companyName: values.companyName,
        companyIdentifier: values.companyIdentifier,
      });

      if (!result.success) {
        const fieldError = result.error.issues.find(
          (error) => error.path[0] === fieldName
        );

        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: fieldError.message,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }

    if (currentStep === 2) {
      const result = decisionMakerSchema.safeParse({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (!result.success) {
        const fieldError = result.error.issues.find(
          (error) => error.path[0] === fieldName
        );

        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: fieldError.message,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const values = form.state.values;

    if (step === 1) {
      const result = companyInfoSchema.safeParse({
        companyName: values.companyName,
        companyIdentifier: values.companyIdentifier,
      });

      if (!result.success) {
        const newErrors: ValidationErrors = {};
        result.error.issues.forEach((error) => {
          const path = error.path[0] as string;
          newErrors[path] = error.message;
        });
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    }

    if (step === 2) {
      const result = decisionMakerSchema.safeParse({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (!result.success) {
        const newErrors: ValidationErrors = {};
        result.error.issues.forEach((error) => {
          const path = error.path[0] as string;
          newErrors[path] = error.message;
        });
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const values = form.state.values;
      const response = await createCompany({
        companyName: values.companyName,
        companyIdentifier: values.companyIdentifier,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone_number: "",
        country: "",
        city: "",
        postal_code: ""
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
    validateField,
    errors,
  };
};
