import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LogsViewProps {
  cluster: string;
  namespace: string;
  application: string;
}

const severityLevels = ["ALL", "INFO", "WARN", "ERROR"] as const;
type SeverityLevel = typeof severityLevels[number];

export const LogsView = ({ cluster, namespace, application }: LogsViewProps) => {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>("ALL");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs", cluster, namespace, application, selectedSeverity],
    queryFn: () =>
      api.getLogs(
        cluster,
        namespace,
        application,
        selectedSeverity === "ALL" ? undefined : selectedSeverity
      ),
    enabled: !!cluster,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!logs) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Select a cluster to view logs
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "INFO":
        return "text-severity-info";
      case "WARN":
      case "WARNING":
        return "text-severity-warning";
      case "ERROR":
        return "text-severity-error";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Application Logs</CardTitle>
          <div className="flex gap-2">
            {severityLevels.map((level) => (
              <Button
                key={level}
                variant={selectedSeverity === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background rounded-lg p-4 font-mono text-sm max-h-[600px] overflow-y-auto space-y-1">
          {logs && logs.length > 0 ? (
            logs.map((log: any, idx: number) => (
              <div key={idx} className="py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Timestamp */}
                  <span className="text-muted-foreground text-xs">
                    {log.timestamp}
                  </span>
                  {/* Severity badge */}
                  <span className={cn("font-semibold px-2 py-0.5 rounded-full text-xs", 
                    getSeverityColor(log.severity),
                    log.severity === "ERROR" ? "bg-destructive/10" :
                    log.severity === "WARN" ? "bg-warning/10" :
                    "bg-info/10"
                  )}>
                    {log.severity}
                  </span>
                  {/* Source/Application */}
                  {log.source && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {log.source}
                    </span>
                  )}
                  {/* Logger name if available */}
                  {log.logger && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.logger.split('.').pop()}
                    </span>
                  )}
                </div>
                
                {/* Message */}
                <div className="text-sm text-foreground">
                  {log.message}
                </div>

                {/* Stack trace for errors */}
                {log.severity === "ERROR" && log.stackTrace && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1">
                      <ChevronDown className="h-3 w-3" />
                      Stack Trace
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                        {log.stackTrace}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No logs available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
