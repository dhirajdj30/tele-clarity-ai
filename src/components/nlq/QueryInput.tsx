import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { nlqApi, StreamEvent } from "@/lib/nlqApi";
import { useToast } from "@/hooks/use-toast";

interface QueryInputProps {
  database: string;
  model: string;
  apiBase: string;
  onEventReceived: (event: StreamEvent) => void;
  onQueryComplete: (question: string, sql: string | undefined, status: "success" | "error", executionTime?: number) => void;
  isQuerying: boolean;
  setIsQuerying: (value: boolean) => void;
}

export const QueryInput = ({
  database,
  model,
  apiBase,
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
      const stream = nlqApi.streamQuery(question, database, model, apiBase);
      
      for await (const event of stream) {
        onEventReceived(event);
        
        if (event.type === "sql" && event.data) {
          sql = event.data;
        }
        
        if (event.type === "complete") {
          executionTime = event.execution_time;
          onQueryComplete(question, sql, "success", executionTime);
          toast({
            title: "Query completed",
            description: `Executed in ${executionTime?.toFixed(2)}s`,
          });
        }
        
        if (event.type === "error") {
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
          placeholder="e.g., Show me the top 10 users by activity in the last 30 days..."
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
