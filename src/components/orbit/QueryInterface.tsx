import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryInterfaceProps {
  application: string;
  timeRange: string;
}

export const QueryInterface = ({ application, timeRange }: QueryInterfaceProps) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: api.postQuery,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Query executed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a query",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      query: query.trim(),
      application: application || "all",
      time_range: timeRange,
      query_type: "auto",
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Ask a Question</CardTitle>
          <CardDescription>
            Ask ORBIT anything about your infrastructure, logs, or metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., What's causing high CPU usage in the auth service?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="resize-none bg-background"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !query.trim()}
            className="w-full md:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Query
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card border-primary/20 border-2">
          <CardHeader>
            <CardTitle className="text-lg">Query Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.summary && (
              <div>
                <h4 className="font-semibold mb-2 text-primary">Summary</h4>
                <p className="text-sm text-foreground">{result.summary}</p>
              </div>
            )}

            {result.agent_insights && result.agent_insights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-primary">Agent Insights</h4>
                <ul className="space-y-1">
                  {result.agent_insights.map((insight: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-warning">Recommendations</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-foreground">
                      ✓ {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.metadata && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Metadata</h4>
                <div className="flex flex-wrap gap-2">
                  {result.metadata.agents_used && (
                    <Badge variant="outline" className="text-xs">
                      Agents: {result.metadata.agents_used.join(", ")}
                    </Badge>
                  )}
                  {result.metadata.query_type && (
                    <Badge variant="outline" className="text-xs">
                      Type: {result.metadata.query_type}
                    </Badge>
                  )}
                  {result.metadata.response_time && (
                    <Badge variant="outline" className="text-xs">
                      Response: {result.metadata.response_time}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
