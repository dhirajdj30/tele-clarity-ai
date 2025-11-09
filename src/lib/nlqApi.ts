const NLQ_BASE_URL = "http://localhost:8004";

export interface HealthStatus {
  status: string;
  backend: string;
  clickhouse: string;
  llm: string;
}

export interface Metrics {
  success_rate: number;
  total_queries: number;
  failed_queries: number;
  avg_response_time: number;
}

export interface StreamEvent {
  type: "status" | "sql" | "result" | "complete" | "error";
  data?: any;
  message?: string;
  execution_time?: number;
}

export interface QueryHistory {
  id: string;
  question: string;
  sql?: string;
  timestamp: string;
  status: "success" | "error";
  execution_time?: number;
}

export interface ExampleQuery {
  category: string;
  queries: string[];
}

export const nlqApi = {
  async health(): Promise<HealthStatus> {
    const response = await fetch(`${NLQ_BASE_URL}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  async setDatabase(database: string): Promise<void> {
    const response = await fetch(`${NLQ_BASE_URL}/set_database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ database }),
    });
    if (!response.ok) throw new Error("Failed to set database");
  },

  async* streamQuery(
    question: string,
    database: string,
    model: string,
    apiBase: string
  ): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${NLQ_BASE_URL}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, database, model, api_base: apiBase }),
    });

    if (!response.ok) throw new Error("Query failed");
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          
          try {
            const event = JSON.parse(data);
            yield event;
          } catch (e) {
            console.error("Failed to parse event:", e);
          }
        }
      }
    }
  },

  async getMetrics(): Promise<Metrics> {
    const response = await fetch(`${NLQ_BASE_URL}/metrics`);
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  },

  async getExamples(): Promise<ExampleQuery[]> {
    const response = await fetch(`${NLQ_BASE_URL}/examples`);
    if (!response.ok) throw new Error("Failed to fetch examples");
    return response.json();
  },
};
