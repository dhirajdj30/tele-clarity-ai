import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { nlqApi } from "@/lib/nlqApi";
import { Badge } from "@/components/ui/badge";
import { Database, Brain, Server, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabaseSelectorProps {
  database: string;
  model: string;
  apiBase: string;
  onDatabaseChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onApiBaseChange: (value: string) => void;
}

export const DatabaseSelector = ({
  database,
  model,
  apiBase,
  onDatabaseChange,
  onModelChange,
  onApiBaseChange,
}: DatabaseSelectorProps) => {
  const { toast } = useToast();

  const { data: health } = useQuery({
    queryKey: ["nlq-health"],
    queryFn: nlqApi.health,
    refetchInterval: 30000,
  });

  const { data: metrics } = useQuery({
    queryKey: ["nlq-metrics"],
    queryFn: nlqApi.getMetrics,
    refetchInterval: 10000,
  });

  const handleDatabaseChange = async (value: string) => {
    try {
      await nlqApi.setDatabase(value);
      onDatabaseChange(value);
      toast({
        title: "Database changed",
        description: `Switched to ${value}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change database",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    if (status === "healthy" || status === "connected") {
      return <Badge className="bg-success text-success-foreground">Healthy</Badge>;
    }
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <div className="space-y-4 mb-6">
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Configuration & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Selection */}
            <div className="space-y-2">
              <Label htmlFor="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </Label>
              <Select value={database} onValueChange={handleDatabaseChange}>
                <SelectTrigger id="database">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p43">P43</SelectItem>
                  <SelectItem value="p05">P05</SelectItem>
                  <SelectItem value="p07">P07</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Model
              </Label>
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mistral12b">Mistral 12B</SelectItem>
                  <SelectItem value="phi-4-mini-instruct">Phi-4 Mini Instruct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Base */}
            <div className="space-y-2">
              <Label htmlFor="apiBase" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                API Base
              </Label>
              <Input
                id="apiBase"
                value={apiBase}
                onChange={(e) => onApiBaseChange(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
          </div>

          {/* Status Indicators */}
          {health && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Backend</p>
                {getStatusBadge(health.backend)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ClickHouse</p>
                {getStatusBadge(health.clickhouse)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">LLM</p>
                {getStatusBadge(health.llm)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Overall</p>
                {getStatusBadge(health.status)}
              </div>
            </div>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-semibold text-success">
                  {(metrics.success_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Queries</p>
                <p className="text-lg font-semibold">{metrics.total_queries}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-lg font-semibold text-destructive">{metrics.failed_queries}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-lg font-semibold">{metrics.avg_response_time.toFixed(2)}s</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
