import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

export const BackendHealth = () => {
  const { data: pingData, isError: pingError } = useQuery({
    queryKey: ["ping"],
    queryFn: api.ping,
    retry: 1,
  });

  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    enabled: !!pingData,
    retry: 1,
  });

  const isHealthy = !pingError && pingData?.status === "ok";

  return (
    <Card className="mb-6 bg-card border-border">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Backend Status</p>
              <p className="text-xs text-muted-foreground">http://localhost:8000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {healthData?.active_agents && (
              <Badge variant="outline" className="text-xs">
                {healthData.active_agents.length} Agents Active
              </Badge>
            )}
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success">Healthy</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Unavailable</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
