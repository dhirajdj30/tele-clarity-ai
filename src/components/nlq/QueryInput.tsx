import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { nlqApi, StreamEvent } from "@/lib/nlqApi";
import { useToast } from "@/hooks/use-toast";

interface QueryInputProps {
  model: string;
  onEventReceived: (event: StreamEvent) => void;
  onQueryComplete: (question: string, sql: string | undefined, status: "success" | "error", executionTime?: number) => void;
  isQuerying: boolean;
  setIsQuerying: (value: boolean) => void;
}

export const QueryInput = ({
  model,
  onEventReceived,
  onQueryComplete,
  isQuerying,
  setIsQuerying,
}: QueryInputProps) => {
  const [question, setQuestion] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question.trim() || isQuerying) return;

    setIsQuerying(true);
    let sql: string | undefined;
    let executionTime: number | undefined;

    try {
  const stream = nlqApi.streamQuery(question, model);
      
      for await (const event of stream) {
        onEventReceived(event);

        const evType = (event as any).type || (event as any).event;

        if (evType === "sql" && event.data) {
          sql = event.data;
        }

        if (evType === "complete") {
          // execution time may be on event.execution_time or nested in event.data.execution_time_ms
          executionTime = event.execution_time ?? (event.data?.execution_time_ms ? event.data.execution_time_ms / 1000 : undefined);
          onQueryComplete(question, sql, "success", executionTime);
          toast({
            title: "Query completed",
            description: `Executed in ${executionTime ? executionTime.toFixed(2) + 's' : 'unknown time'}`,
          });
        }

        if (evType === "error") {
          onQueryComplete(question, sql, "error");
          toast({
            title: "Query failed",
            description: event.message || "An error occurred",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      onQueryComplete(question, sql, "error");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <Card className="mb-6 bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg">Ask a Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Show me the latest 10 log entries..."
          className="min-h-[100px] resize-none"
          disabled={isQuerying}
        />
        <Button
          onClick={handleSubmit}
          disabled={!question.trim() || isQuerying}
          className="w-full gap-2"
        >
          {isQuerying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Run Query
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
