const API_BASE_URL = "http://kubenode01-cpu-vllm-oci.p31.eng.sjc01.qualys.com:8000";

export const api = {
  // Cluster endpoints
  async getAvailableClusters() {
    const response = await fetch(`${API_BASE_URL}/clusters/available`);
    if (!response.ok) throw new Error("Failed to fetch clusters");
    const data = await response.json();
    // Normalize to an array for UI consumption
    if (Array.isArray(data)) return data;
    if (data?.data) return data.data;
    if (data?.clusters) return data.clusters;
    if (data?.items) return data.items;
    return [];
  },

  async getNamespaces(cluster: string) {
    const response = await fetch(`${API_BASE_URL}/clusters/${cluster}/namespaces`);
    if (!response.ok) throw new Error("Failed to fetch namespaces");
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data?.data) return data.data;
    if (data?.namespaces) return data.namespaces;
    if (data?.items) return data.items;
    return [];
  },

  async getApplications(cluster: string) {
    const response = await fetch(`${API_BASE_URL}/clusters/${cluster}/applications`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data?.data) return data.data;
    if (data?.applications) return data.applications;
    if (data?.items) return data.items;
    return [];
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
    const data = await response.json();
    // Normalize to an object the UI expects
    if (!data) return {};
    if (typeof data === "object" && !Array.isArray(data)) {
      // If the API returns { metrics: { current: { ... }, units: { ... } } }
      // map current values into the shape the UI expects.
      if (data.metrics && typeof data.metrics === "object") {
        const current = data.metrics.current || data.metrics;
        if (current && typeof current === "object") {
          const cpu = current.cpu_usage ?? current.cpu ?? current.cpuPercentage ?? 0;
          const memory = current.memory_usage ?? current.memory ?? current.memoryPercentage ?? 0;
          const disk = current.disk_usage ?? current.disk ?? current.diskPercentage ?? 0;
          // Combine network in/out if present; convert KB/s to MB/s if units indicate KB/s
          const networkIn = current.network_in ?? 0;
          const networkOut = current.network_out ?? 0;
          const network = networkIn + networkOut;
          const response_time = current.response_time ?? current.latency ?? 0;
          const error_rate = current.error_rate ?? current.errorRate ?? 0;

          return {
            cpu,
            memory,
            disk,
            network,
            response_time,
            error_rate,
            // keep raw payload in case callers need it
            _raw: data,
          };
        }
      }

      if (data.data && typeof data.data === "object") return data.data;
      return data;
    }
    return {};
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
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch logs");
    }

    // Use logs array from response or normalize other formats
    const logs = Array.isArray(data.logs) ? data.logs : [];
    
    return logs.map((log: any) => ({
      timestamp: log.timestamp || log.raw?.["@timestamp"] || new Date().toISOString(),
      severity: log.level || log.raw?.loglevel || "INFO",
      message: log.message || "",
      source: log.source || log.raw?.applicationName || log.raw?.host || "",
      stackTrace: log.raw?.stackTrace || "",
      logger: log.raw?.logger || "",
      applicationName: log.raw?.applicationName || "",
      appVersion: log.raw?.appVersion || "",
      domainName: log.raw?.domainName || "",
      raw: log.raw || {} // keep full raw data
    }));
    // Normalize to an array for UI consumption
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.logs && Array.isArray(data.logs)) return data.logs;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.items && Array.isArray(data.items)) return data.items;
    return [];
  },

  // Alerts endpoints
  async getCorrelatedAlerts(cluster?: string, namespace?: string, application?: string) {
    const params = new URLSearchParams();
    if (cluster) params.append("cluster", cluster);
    if (namespace) params.append("namespace", namespace);
    if (application) params.append("application", application);
    
    const response = await fetch(`${API_BASE_URL}/alerts/correlated?${params}`);
    if (!response.ok) throw new Error("Failed to fetch correlated alerts");
    const data = await response.json();
    
    // Handle error response from the API
    if (data.success === false) {
      throw new Error(data.error || "Failed to fetch correlated alerts");
    }

    // Return correlated_alerts array or normalize other response shapes
    if (data.correlated_alerts) return data.correlated_alerts;
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.alerts && Array.isArray(data.alerts)) return data.alerts;
    return [];
  },

  async getStreamingAlerts() {
    const response = await fetch(`${API_BASE_URL}/streaming/alerts`);
    if (!response.ok) throw new Error("Failed to fetch streaming alerts");
    const data = await response.json();
    // Ensure an array is returned
    if (Array.isArray(data)) return data;
    if (data?.data) return data.data;
    if (data?.alerts) return data.alerts;
    if (data?.items) return data.items;
    return [];
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
