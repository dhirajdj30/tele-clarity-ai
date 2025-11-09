const NLQ_BASE_URL = "http://localhost:8004";

const DB_MAPPING = {
  "p43_eng_sjc01": "clickhouse01.p43.eng.sjc01.qualys.com",
  "p05_eng_sjc01": "clickhouse11.p05.eng.sjc01.qualys.com",
  "p07_eng_sjc01": "clickhouse105.p07.eng.sjc01.qualys.com"
} as const;

const LLM_MAPPING = {
  "phi-4-mini-instruct": "https://kubeingress.p31.eng.sjc01.qualys.com/cpu/phi4mini/v1",
  "mistral12b": "https://kubeingress.p31.eng.sjc01.qualys.com/mistral12b/v1",
} as const;

export interface HealthStatus {
  status: string;
  databases: {
    clickhouse: string;
    current_host: string;
  };
  llm_model: string;
  llm: boolean;
  real_time: boolean;
  message: string;
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

  // Removed getMetrics, not implemented in backend

  async setDatabase(pod: string): Promise<void> {
    const host = DB_MAPPING[pod as keyof typeof DB_MAPPING];
    if (!host) {
      throw new Error(`Invalid pod selected: ${pod}`);
    }

    const response = await fetch(`${NLQ_BASE_URL}/set_database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        database: pod,
        host: host 
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set database: ${error}`);
    }
  },

  async query(question: string, model: string, apiBase?: string) {
    const selected_llm_model = model;
    const selected_llm_api_base = apiBase || LLM_MAPPING[model as keyof typeof LLM_MAPPING];
    const response = await fetch(`${NLQ_BASE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        selected_llm_model,
        selected_llm_api_base
      }),
    });
    if (!response.ok) throw new Error("Query failed");
    return response.json();
  },

  async* streamQuery(
    question: string,
    model: string,
    apiBase?: string
  ): AsyncGenerator<StreamEvent> {
    const selected_llm_model = model;
    const selected_llm_api_base = apiBase || LLM_MAPPING[model as keyof typeof LLM_MAPPING];
    const response = await fetch(`${NLQ_BASE_URL}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        question,
        selected_llm_model,
        selected_llm_api_base
      }),
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
      let boundary = buffer.indexOf("\n\n");

      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");

        if (chunk.startsWith("data: ")) {
          const data = chunk.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            // normalize incoming event shape: backend may send { event: "status", data: ... }
            let event: StreamEvent;
            if (parsed.type) {
              event = parsed as StreamEvent;
            } else if (parsed.event) {
              // map event -> type and normalize execution time
              const execTimeFromData = parsed.data?.execution_time_ms ? parsed.data.execution_time_ms / 1000 : parsed.data?.execution_time;
              event = {
                type: parsed.event,
                data: parsed.data,
                message: parsed.message,
                execution_time: parsed.execution_time ?? execTimeFromData,
              } as StreamEvent;
            } else {
              // fallback: try to coerce keys
              event = parsed as StreamEvent;
            }
            yield event;
          } catch (e) {
            console.error("Failed to parse SSE event:", e, data);
          }
        }
      }
    }
  }
,

  // async getMetrics(): Promise<Metrics> {
  //   const response = await fetch(`${NLQ_BASE_URL}/metrics`);
  //   if (!response.ok) throw new Error("Failed to fetch metrics");
  //   return response.json();
  // },

  async getExamples(): Promise<ExampleQuery[]> {
    const response = await fetch(`${NLQ_BASE_URL}/examples`);
    if (!response.ok) throw new Error("Failed to fetch examples");
    return response.json();
  },
};


