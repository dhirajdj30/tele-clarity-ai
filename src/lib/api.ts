const API_BASE_URL = "http://localhost:8000";

export const api = {
  // Cluster endpoints
  async getAvailableClusters() {
    const response = await fetch(`${API_BASE_URL}/clusters/available`);
    if (!response.ok) throw new Error("Failed to fetch clusters");
    return response.json();
  },

  async getNamespaces(cluster: string) {
    const response = await fetch(`${API_BASE_URL}/clusters/${cluster}/namespaces`);
    if (!response.ok) throw new Error("Failed to fetch namespaces");
    return response.json();
  },

  async getApplications(cluster: string) {
    const response = await fetch(`${API_BASE_URL}/clusters/${cluster}/applications`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  },

  // Query endpoint
  async postQuery(data: {
    query: string;
    application: string;
    time_range: string;
    query_type: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/orbit/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to execute query");
    return response.json();
  },

  // Metrics endpoint
  async getMetrics(cluster?: string, namespace?: string, application?: string) {
    const params = new URLSearchParams();
    if (cluster) params.append("cluster", cluster);
    if (namespace) params.append("namespace", namespace);
    if (application) params.append("application", application);
    
    const response = await fetch(`${API_BASE_URL}/metrics?${params}`);
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  },

  // Logs endpoint
  async getLogs(
    cluster?: string,
    namespace?: string,
    application?: string,
    severity?: string
  ) {
    const params = new URLSearchParams();
    if (cluster) params.append("cluster", cluster);
    if (namespace) params.append("namespace", namespace);
    if (application) params.append("application", application);
    if (severity) params.append("severity", severity);
    
    const response = await fetch(`${API_BASE_URL}/logs?${params}`);
    if (!response.ok) throw new Error("Failed to fetch logs");
    return response.json();
  },

  // Alerts endpoints
  async getCorrelatedAlerts(cluster?: string, namespace?: string, application?: string) {
    const params = new URLSearchParams();
    if (cluster) params.append("cluster", cluster);
    if (namespace) params.append("namespace", namespace);
    if (application) params.append("application", application);
    
    const response = await fetch(`${API_BASE_URL}/alerts/correlated?${params}`);
    if (!response.ok) throw new Error("Failed to fetch correlated alerts");
    return response.json();
  },

  async getStreamingAlerts() {
    const response = await fetch(`${API_BASE_URL}/streaming/alerts`);
    if (!response.ok) throw new Error("Failed to fetch streaming alerts");
    return response.json();
  },

  // Health endpoints
  async ping() {
    const response = await fetch(`${API_BASE_URL}/ping`);
    if (!response.ok) throw new Error("Ping failed");
    return response.json();
  },

  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },
};
