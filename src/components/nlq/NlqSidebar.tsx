import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueryHistory, ExampleQuery } from "@/lib/nlqApi";
import { Clock, Trash2, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { nlqApi } from "@/lib/nlqApi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface NlqSidebarProps {
  queryHistory: QueryHistory[];
  onClearHistory: () => void;
}

export const NlqSidebar = ({ queryHistory, onClearHistory }: NlqSidebarProps) => {
  const { data: examples } = useQuery<ExampleQuery[]>({
    queryKey: ["nlq-examples"],
    queryFn: nlqApi.getExamples,
    initialData: [
      {
        category: "Basic Queries",
        queries: [
          "Show top 10 users by activity",
          "What are the error rates today?",
          "List all active sessions",
        ],
      },
      {
        category: "Analytics",
        queries: [
          "Average response time by endpoint",
          "Count requests per hour",
          "Show slowest queries",
        ],
      },
    ],
  });

  return (
    <div className="w-96 border-l border-border p-6 space-y-6">
      {/* Example Queries */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Example Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {examples?.map((category, idx) => (
                <Collapsible key={idx}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    {category.category}
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {category.queries.map((query, qIdx) => (
                      <p
                        key={qIdx}
                        className="text-xs text-muted-foreground hover:text-primary cursor-pointer pl-2 py-1 border-l-2 border-border hover:border-primary transition-colors"
                      >
                        {query}
                      </p>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Query History */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Queries
            </CardTitle>
            {queryHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {queryHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No queries yet
              </p>
            ) : (
              <div className="space-y-3">
                {queryHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-md bg-secondary border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium line-clamp-2">{item.question}</p>
                      {item.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.execution_time && (
                        <Badge variant="outline" className="text-xs">
                          {item.execution_time.toFixed(2)}s
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
