import { ApiError } from "@/lib/api/api-util";
import { signup } from "./auth";

export interface CreateCompanyRequest {
  companyName: string;
  companyIdentifier: string;
  fullName: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
  city: string;
  postal_code: string;
  domain?: string;
  company_size?: string;
}

export interface CreateCompanyResponse {
  id: number;
  name: string;
  identifier: string;
  phone_number: string;
  country: string;
  city: string;
  postal_code: string;
  domain?: string;
  company_size?: string;
  created_at: string;
}

export interface SignupAndCreateCompanyResponse {
  signupSuccess: boolean;
  company?: CreateCompanyResponse;
  requiresVerification: boolean;
  message: string;
}

export const createCompany = async (
  data: CreateCompanyRequest
): Promise<SignupAndCreateCompanyResponse> => {
  const [firstName, ...lastNameParts] = data.fullName.trim().split(" ");
  const lastName = lastNameParts.join(" ") || firstName;

  try {
    await signup({
      email: data.email,
      password: data.password,
      first_name: firstName,
      last_name: lastName,
    });

    return {
      signupSuccess: true,
      requiresVerification: false,
      message: "Account created successfully",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        const errorData = error as { message?: string };
        if (errorData.message?.includes("email") || errorData.message?.includes("Email")) {
          return {
            signupSuccess: false,
            requiresVerification: true,
            message: "Please check your email for verification. After verifying, you can create your company.",
          };
        }
        throw new ApiError(
          errorData.message || "Failed to create company",
          error.status,
          error.statusText
        );
      }
      throw error;
    }
    throw new ApiError("Failed to create company", 0, "Unknown Error");
  }
};
