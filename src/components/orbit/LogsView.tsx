import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
              <div key={idx} className="py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground mr-2">
                  {log.timestamp || new Date().toISOString()}
                </span>
                <span className={cn("font-semibold mr-2", getSeverityColor(log.severity))}>
                  [{log.severity}]
                </span>
                <span className="text-foreground">{log.message}</span>
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
