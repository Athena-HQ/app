import { api, getApiBaseUrl } from "@/lib/api/api-util";
import { getAccessToken } from "@/lib/auth/token-store";

export type ReportPeriodType = "annual" | "semi_annual";

export interface ReportListResponse {
  id: number;
  title: string;
  period_type: ReportPeriodType;
  period_start: string;
  period_end: string;
  employee_name: string;
  created_by_name: string;
  overall_rating: number;
  overall_grade: string;
  created_at: string;
}

export interface ReportDetailResponse extends ReportListResponse {
  employee: number;
  employee_role: string | null;
  created_by: number;
  created_by_role: string | null;
  company_name: string;
  technical_skills: number;
  quality_of_work: number;
  productivity: number;
  communication: number;
  teamwork: number;
  initiative: number;
  time_management: number;
  leadership: number | null;
  key_achievements: string;
  strengths: string;
  areas_for_improvement: string;
  goals_next_period: string;
  additional_notes: string;
  updated_at: string;
}

export interface CreateReportRequest {
  title: string;
  employee: number;
  period_type: ReportPeriodType;
  period_start: string;
  period_end: string;
  technical_skills: number;
  quality_of_work: number;
  productivity: number;
  communication: number;
  teamwork: number;
  initiative: number;
  time_management: number;
  leadership?: number | null;
  key_achievements?: string;
  strengths?: string;
  areas_for_improvement?: string;
  goals_next_period?: string;
  additional_notes?: string;
}

export interface ReportFilters {
  filter?: "by_me";
  employee?: number;
  period?: ReportPeriodType;
}

function buildQueryString(filters: ReportFilters): string {
  const params = new URLSearchParams();
  if (filters.filter) params.set("filter", filters.filter);
  if (filters.employee) params.set("employee", String(filters.employee));
  if (filters.period) params.set("period", filters.period);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listReports(filters: ReportFilters = {}): Promise<ReportListResponse[]> {
  const response = await api.get<ReportListResponse[]>(`/reports/${buildQueryString(filters)}`);
  return Array.isArray(response) ? response : [];
}

export async function getReport(id: number): Promise<ReportDetailResponse> {
  return api.get<ReportDetailResponse>(`/reports/${id}/`);
}

export async function createReport(data: CreateReportRequest): Promise<ReportDetailResponse> {
  return api.post<ReportDetailResponse>("/reports/", data);
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}/`);
}

export async function fetchReportPdfBlob(reportId: number): Promise<Blob> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const token = getAccessToken();
  const response = await fetch(`${baseUrl}/reports/${reportId}/pdf/`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load PDF");
  return response.blob();
}

export async function getReportPdfDownloadUrl(reportId: number): Promise<string> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/reports/${reportId}/pdf/download/`;
}
