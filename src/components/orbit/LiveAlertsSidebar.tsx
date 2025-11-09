import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveAlertsSidebarProps {
  cluster?: string;
}

export const LiveAlertsSidebar = ({ cluster }: LiveAlertsSidebarProps) => {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ["streamingAlerts", cluster ?? "default"],
    queryFn: () => api.getStreamingAlerts(cluster),
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch, cluster]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "error":
        return "text-destructive";
      case "warning":
        return "text-warning";
      case "info":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const latestAlerts = Array.isArray(alerts) ? alerts.slice(0, 8) : [];

  return (
    <aside className="w-80 border-l border-border p-6 bg-card/50">
      <Card className="bg-card border-border sticky top-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary animate-pulse-slow" />
              Live Alerts Bulletin
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-refreshing every 30s
          </p>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : latestAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No recent alerts
            </p>
          ) : (
            latestAlerts.map((alert: any, idx: number) => (
              <Card
                key={idx}
                className={cn(
                  "border-l-4 transition-all hover:bg-muted/50",
                  alert.severity?.toLowerCase() === "critical" || alert.severity?.toLowerCase() === "error"
                    ? "border-l-destructive"
                    : alert.severity?.toLowerCase() === "warning"
                    ? "border-l-warning"
                    : "border-l-info"
                )}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getSeverityColor(alert.severity))}
                    >
                      {alert.severity?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp || "Now"}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">
                    {alert.title || alert.message || "Alert"}
                  </p>
                  {alert.source && (
                    <p className="text-xs text-muted-foreground">
                      {alert.source}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
};
