import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface MetricsViewProps {
  cluster: string;
  namespace: string;
  application: string;
}

export const MetricsView = ({ cluster, namespace, application }: MetricsViewProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics", cluster, namespace, application],
    queryFn: () => api.getMetrics(cluster, namespace, application),
    enabled: !!cluster,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Select a cluster to view metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricCards = [
    { title: "CPU Usage", value: metrics.cpu, unit: "%", key: "cpu" },
    { title: "Memory Usage", value: metrics.memory, unit: "%", key: "memory" },
    { title: "Disk Usage", value: metrics.disk, unit: "%", key: "disk" },
    { title: "Network I/O", value: metrics.network, unit: "MB/s", key: "network" },
    { title: "Response Time", value: metrics.response_time, unit: "ms", key: "response_time" },
    { title: "Error Rate", value: metrics.error_rate, unit: "%", key: "error_rate" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricCards.map((metric) => {
        const value = parseFloat(metric.value) || 0;
        const isHigh = value > 80;
        const isWarning = value > 60 && value <= 80;
        
        return (
          <Card key={metric.key} className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-bold ${
                  isHigh ? "text-destructive" : isWarning ? "text-warning" : "text-success"
                }`}>
                  {value.toFixed(1)}
                  <span className="text-sm ml-1 text-muted-foreground">{metric.unit}</span>
                </span>
                {isHigh ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-success" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
