import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsViewProps {
  cluster: string;
  namespace: string;
  application: string;
}

export const AlertsView = ({ cluster, namespace, application }: AlertsViewProps) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ["correlatedAlerts", cluster, namespace, application],
    queryFn: () => api.getCorrelatedAlerts(cluster, namespace, application),
    enabled: false, // Don't auto-fetch
  });

  const toggleAlert = (index: number) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getSeverityClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "error":
        return "bg-severity-error border text-destructive";
      case "warning":
        return "bg-severity-warning border text-warning";
      case "info":
        return "bg-severity-info border text-info";
      default:
        return "bg-muted border-muted text-foreground";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Correlated Alerts</CardTitle>
          <Button onClick={() => refetch()} disabled={!cluster || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Fetch Correlated Alerts"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!alerts ? (
          <p className="text-center text-muted-foreground py-8">
            Click "Fetch Correlated Alerts" to load data
          </p>
        ) : alerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No correlated alerts found
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert: any, idx: number) => (
              <Collapsible
                key={idx}
                open={expandedAlerts.has(idx)}
                onOpenChange={() => toggleAlert(idx)}
              >
                <Card className={cn("border-2", getSeverityClass(alert.severity))}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {alert.severity?.toUpperCase()}
                          </Badge>
                          <span className="font-semibold text-left">
                            {alert.title || alert.name || "Alert"}
                          </span>
                        </div>
                        {expandedAlerts.has(idx) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-2 text-sm">
                      {alert.description && (
                        <p className="text-foreground">{alert.description}</p>
                      )}
                      {alert.timestamp && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Time:</span> {alert.timestamp}
                        </p>
                      )}
                      {alert.source && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Source:</span> {alert.source}
                        </p>
                      )}
                      {alert.details && (
                        <div className="bg-background rounded p-3 mt-2 font-mono text-xs">
                          <pre className="whitespace-pre-wrap">
                            {typeof alert.details === "string"
                              ? alert.details
                              : JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
