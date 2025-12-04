const BASE_URL = "http://localhost:8000";

export interface DashboardRequest {
  query: string;
  name?: string;
  description?: string;
  dashboardId?: number;
}

export interface DashboardResponse {
  message: string;
  dashboard_id: number;
  dashboard_url: string;
  card_id: number;
  dashboard: Record<string, unknown>;
  card: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  version?: string;
}

export const metabaseApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await fetch(`${BASE_URL}/healthz`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  generateDashboard: async (request: DashboardRequest): Promise<DashboardResponse> => {
    const response = await fetch(`${BASE_URL}/dashboards/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Failed to generate dashboard");
    }
    return response.json();
  },
};
