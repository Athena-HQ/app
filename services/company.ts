import { api, ApiError } from "@/lib/api/api-util";
import { signup } from "./auth";

export interface CreateCompanyRequest {
  companyName: string;
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

export interface CompanyResponse {
  id: number;
  name: string;
  identifier: string;
  company_size: string;
  phone_number: string;
  country: string;
  city: string;
  postal_code: string;
  domain?: string;
  company_manager?: AppUserResponse;
  created_at: string;
}

export interface AppUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  phone_number: string | null;
  company: number | null;
  profile?: { id: number; bio?: string; linkedin?: string; github?: string; twitter?: string; avatar_url?: string };
  created_at: string;
  updated_at: string;
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
      company_name: data.companyName,
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

export const createCompanyProfile = async (data: {
  name: string;
  company_size: string;
  phone_number: string;
  country: string;
  city: string;
  postal_code: string;
  domain?: string;
}): Promise<CompanyResponse> => {
  const response = await api.post<CompanyResponse>("/company/", data);
  return response;
};

export const getCompanies = async (): Promise<CompanyResponse[]> => {
  const response = await api.get<CompanyResponse[]>("/company/");
  return Array.isArray(response) ? response : [];
};

export const getCompany = async (companyId: number): Promise<CompanyResponse> => {
  const response = await api.get<CompanyResponse>(`/company/${companyId}/`);
  return response;
};

export const updateCompany = async (
  companyId: number,
  data: Partial<{
    name: string;
    company_size: string;
    phone_number: string;
    country: string;
    city: string;
    postal_code: string;
    domain: string;
  }>
): Promise<CompanyResponse> => {
  const response = await api.patch<CompanyResponse>(`/company/${companyId}/`, data);
  return response;
};

export const getEmployees = async (): Promise<AppUserResponse[]> => {
  const response = await api.get<AppUserResponse[]>("/company/employees/");
  return response;
};
