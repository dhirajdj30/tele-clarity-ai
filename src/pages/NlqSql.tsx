import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { NlqHeader } from "@/components/nlq/NlqHeader";
import { DatabaseSelector } from "@/components/nlq/DatabaseSelector";
import { QueryInput } from "@/components/nlq/QueryInput";
import { ResultsDisplay } from "@/components/nlq/ResultsDisplay";
import { NlqSidebar } from "@/components/nlq/NlqSidebar";
import { AnalyticsCharts } from "@/components/nlq/AnalyticsCharts";
import { StreamEvent, QueryHistory } from "@/lib/nlqApi";

const NlqSql = () => {
  const navigate = useNavigate();
  const [database, setDatabase] = useState("p43");
  const [model, setModel] = useState("mistral12b");
  const [apiBase, setApiBase] = useState("http://localhost:8000");
  const [currentEvent, setCurrentEvent] = useState<StreamEvent | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQueryComplete = (
    question: string,
    sql: string | undefined,
    status: "success" | "error",
    executionTime?: number
  ) => {
    const historyItem: QueryHistory = {
      id: Date.now().toString(),
      question,
      sql,
      timestamp: new Date().toISOString(),
      status,
      execution_time: executionTime,
    };
    setQueryHistory((prev) => [historyItem, ...prev]);
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
    setCurrentEvent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4 gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Hub
          </Button>

          <NlqHeader />

          <DatabaseSelector
            database={database}
            model={model}
            apiBase={apiBase}
            onDatabaseChange={setDatabase}
            onModelChange={setModel}
            onApiBaseChange={setApiBase}
          />

          <QueryInput
            database={database}
            model={model}
            apiBase={apiBase}
            onEventReceived={setCurrentEvent}
            onQueryComplete={handleQueryComplete}
            isQuerying={isQuerying}
            setIsQuerying={setIsQuerying}
          />

          <ResultsDisplay currentEvent={currentEvent} isQuerying={isQuerying} />

          <AnalyticsCharts queryHistory={queryHistory} />

          <footer className="mt-8 text-center text-sm text-muted-foreground">
            Built with FastAPI + Streamlit-style frontend
          </footer>
        </div>

        {/* Right Sidebar */}
        <NlqSidebar
          queryHistory={queryHistory}
          onClearHistory={handleClearHistory}
        />
      </div>
    </div>
  );
};

export default NlqSql;
