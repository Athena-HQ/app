import { api, getApiBaseUrl } from "@/lib/api/api-util";
import { getAccessToken } from "@/lib/auth/token-store";

export interface ReportListItem {
  id: number;
  title: string;
  period_type: "annual" | "semi_annual";
  period_start: string;
  period_end: string;
  employee_name: string;
  created_by_name: string;
  overall_rating: number;
  overall_grade: string;
  created_at: string;
}

export interface ReportDetail {
  id: number;
  title: string;
  period_type: "annual" | "semi_annual";
  period_start: string;
  period_end: string;
  company_name: string;
  employee: number;
  employee_name: string;
  employee_role: string;
  created_by: number;
  created_by_name: string;
  created_by_role: string;
  technical_skills: number;
  quality_of_work: number;
  productivity: number;
  communication: number;
  teamwork: number;
  initiative: number;
  time_management: number;
  leadership: number | null;
  overall_rating: number;
  overall_grade: string;
  key_achievements: string;
  strengths: string;
  areas_for_improvement: string;
  goals_next_period: string;
  additional_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportRequest {
  title: string;
  employee: number;
  period_type: "annual" | "semi_annual";
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

export const REPORT_RATING_FIELDS = [
  { key: "technical_skills" as const, label: "Technical Skills" },
  { key: "quality_of_work" as const, label: "Quality of Work" },
  { key: "productivity" as const, label: "Productivity" },
  { key: "communication" as const, label: "Communication" },
  { key: "teamwork" as const, label: "Teamwork" },
  { key: "initiative" as const, label: "Initiative" },
  { key: "time_management" as const, label: "Time Management" },
];

export const GRADE_COLORS: Record<string, string> = {
  "Exceptional": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Above Expectations": "text-blue-600 bg-blue-50 border-blue-200",
  "Meets Expectations": "text-yellow-600 bg-yellow-50 border-yellow-200",
  "Below Expectations": "text-orange-600 bg-orange-50 border-orange-200",
  "Unsatisfactory": "text-red-600 bg-red-50 border-red-200",
};

export async function listReports(params?: {
  employee?: number;
  period?: string;
  filter?: string;
}): Promise<ReportListItem[]> {
  const qs = new URLSearchParams();
  if (params?.employee) qs.set("employee", String(params.employee));
  if (params?.period) qs.set("period", params.period);
  if (params?.filter) qs.set("filter", params.filter);
  const query = qs.toString();
  const response = await api.get<ReportListItem[]>(
    `/reports/${query ? `?${query}` : ""}`
  );
  return Array.isArray(response) ? response : [];
}

export async function getReport(id: number): Promise<ReportDetail> {
  return api.get<ReportDetail>(`/reports/${id}/`);
}

export async function createReport(data: CreateReportRequest): Promise<ReportDetail> {
  return api.post<ReportDetail>("/reports/", data);
}

export async function updateReport(
  id: number,
  data: Partial<CreateReportRequest>
): Promise<ReportDetail> {
  return api.patch<ReportDetail>(`/reports/${id}/`, data);
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}/`);
}

export async function fetchReportPdfBlob(reportId: number): Promise<string> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const token = getAccessToken();
  const response = await fetch(`${base}/reports/${reportId}/pdf/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load PDF");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function getReportPdfDownloadUrl(reportId: number): string {
  return `${getApiBaseUrl().replace(/\/$/, "")}/reports/${reportId}/pdf/download/`;
}
