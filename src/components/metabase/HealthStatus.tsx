import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { metabaseApi } from "@/lib/metabaseApi";

const HealthStatus = () => {
  const [status, setStatus] = useState<"checking" | "healthy" | "error">("checking");
  const [version, setVersion] = useState<string | undefined>();

  const checkHealth = async () => {
    setStatus("checking");
    try {
      const health = await metabaseApi.checkHealth();
      setStatus(health.status === "ok" || health.status === "healthy" ? "healthy" : "error");
      setVersion(health.version);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className={`h-5 w-5 ${status === "healthy" ? "text-success" : status === "error" ? "text-destructive" : "text-muted-foreground animate-pulse"}`} />
            <div>
              <p className="text-sm font-medium">Backend Status</p>
              <p className="text-xs text-muted-foreground">
                {version ? `v${version}` : "Metabase API"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "healthy" ? "default" : status === "error" ? "destructive" : "secondary"}
              className={status === "healthy" ? "bg-success" : ""}
            >
              {status === "checking" ? "Checking..." : status === "healthy" ? "Healthy" : "Offline"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={checkHealth} className="h-8 w-8">
              <RefreshCw className={`h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthStatus;
