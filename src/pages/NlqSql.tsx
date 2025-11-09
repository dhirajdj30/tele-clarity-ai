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
import StreamResultsBox from "@/components/nlq/StreamResultsBox";
import { StreamEvent, QueryHistory, nlqApi } from "@/lib/nlqApi";

const NlqSql = () => {
  const navigate = useNavigate();
  const [database, setDatabase] = useState("p43_eng_sjc01");
  const [model, setModel] = useState("mistral12b");
  const [apiBase, setApiBase] = useState("");
  const [currentEvent, setCurrentEvent] = useState<StreamEvent | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [streamRows, setStreamRows] = useState<any[] | null>(null);
  const [streamReturnedRows, setStreamReturnedRows] = useState<number | undefined>(undefined);
  const [streamTotalRows, setStreamTotalRows] = useState<number | undefined>(undefined);
  // control the StreamResultsBox from parent (button under Ask Question should open this)
  const [streamBoxOpen, setStreamBoxOpen] = useState(false);
  const [streamBoxFull, setStreamBoxFull] = useState(false);

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

  const handleEventReceived = (event: StreamEvent) => {
    setCurrentEvent(event);

    const evType = (event as any).type || (event as any).event;

    if (evType === "sql") {
      // new query SQL arrived, clear previous stream rows
      setStreamRows(null);
      setStreamReturnedRows(undefined);
      setStreamTotalRows(undefined);
    }

    if (evType === "result") {
      let payload: any = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          // leave as string
        }
      }

      if (payload && typeof payload === "object") {
        // If the backend sends incremental pages, append to existing rows.
        const incomingRows = Array.isArray(payload) ? payload : Array.isArray(payload.rows) ? payload.rows : [];
        // const incomingReturned = payload.returned_rows ?? (Array.isArray(payload) ? payload.length : incomingRows.length);
        const incomingTotal = payload.total_rows ?? (Array.isArray(payload) ? payload.length : incomingRows.length);

        if (incomingRows.length > 0) {
          setStreamRows((prev) => {
            const newRows = prev ? [...prev, ...incomingRows] : incomingRows;
            // update returned count to reflect accumulated rows
            setStreamReturnedRows(newRows.length);
            // update total if provided by backend
            setStreamTotalRows(incomingTotal ?? streamTotalRows);
            return newRows;
          });
        }
      }
    }
  };

  // allow running an example query from the sidebar
  const runExampleQuery = async (question: string) => {
    if (isQuerying) return;
    setIsQuerying(true);
    let sql: string | undefined;
    let executionTime: number | undefined;

    try {
      const stream = nlqApi.streamQuery(question, model);
      for await (const event of stream) {
        handleEventReceived(event as StreamEvent);

        const evType = (event as any).type || (event as any).event;

        if (evType === "sql" && event.data) {
          sql = event.data;
        }

        if (evType === "complete") {
          executionTime = event.execution_time ?? (event.data?.execution_time_ms ? event.data.execution_time_ms / 1000 : undefined);
          handleQueryComplete(question, sql, "success", executionTime);
        }

        if (evType === "error") {
          handleQueryComplete(question, sql, "error");
        }
      }
    } catch (error) {
      handleQueryComplete(question, sql, "error");
    } finally {
      setIsQuerying(false);
    }
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
            onDatabaseChange={setDatabase}
            onModelChange={setModel}
            onApiBaseChange={setApiBase}
          />

          <QueryInput
            model={model}
            onEventReceived={handleEventReceived}
            onQueryComplete={handleQueryComplete}
            isQuerying={isQuerying}
            setIsQuerying={setIsQuerying}
          />

          {/* Button to open streaming results full-screen, placed directly under the Ask Question area */}
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStreamBoxOpen(true);
                setStreamBoxFull(true);
              }}
              disabled={!streamRows || streamRows.length === 0}
            >
              Open Streaming Results {streamRows && streamRows.length > 0 ? `(${streamRows.length})` : ""}
            </Button>
          </div>

          {/* Live streaming results box (updates as result events arrive) */}
          {/* renders only when streamRows is populated */}
          {streamRows && (
            <StreamResultsBox
              rows={streamRows}
              returnedRows={streamReturnedRows}
              totalRows={streamTotalRows}
              open={streamBoxOpen}
              openFull={streamBoxFull}
              onClose={() => {
                setStreamBoxOpen(false);
                setStreamBoxFull(false);
              }}
            />
          )}

          <ResultsDisplay currentEvent={currentEvent} isQuerying={isQuerying} />

          <AnalyticsCharts queryHistory={queryHistory} />

        </div>

        {/* Right Sidebar */}
        <NlqSidebar
          queryHistory={queryHistory}
          onClearHistory={handleClearHistory}
          onRunExample={runExampleQuery}
        />
      </div>
    </div>
  );
};

export default NlqSql;
