import { api, ApiError } from "@/lib/api/api-util";

export interface StreamTokenResponse {
  token: string;
}

export const getStreamToken = async (): Promise<string> => {
  try {
    const response = await api.get<StreamTokenResponse>("/authentication/stream-token/");
    return response.token;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch stream token", 0, "Unknown Error");
  }
};
