import { api, ApiError } from "@/lib/api/api-util";
import { setTokens, clearTokens } from "@/lib/auth/token-store";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    pk: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

export interface SignupResponse {
  message: string;
}

export interface UserResponse {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>(
      "/authentication/login/",
      data
    );
    setTokens(response.access, response.refresh);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Login failed", 0, "Unknown Error");
  }
};

export const signup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  try {
    const response = await api.post<SignupResponse>(
      "/authentication/signup/",
      data
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Signup failed", 0, "Unknown Error");
  }
};

export const logout = async (): Promise<void> => {
  clearTokens();
  try {
    await api.post("/authentication/logout/");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Logout failed", 0, "Unknown Error");
  }
};

export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    const response = await api.get<UserResponse>("/authentication/user/");
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return null;
      }
      throw error;
    }
    throw new ApiError("Failed to get user", 0, "Unknown Error");
  }
};

export const resendVerificationEmail = async (): Promise<void> => {
  try {
    await api.post("/authentication/resend-email/");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to resend verification email", 0, "Unknown Error");
  }
};
