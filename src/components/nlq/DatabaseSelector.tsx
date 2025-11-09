import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { nlqApi } from "@/lib/nlqApi";
import { Badge } from "@/components/ui/badge";
import { Database, Brain, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabaseSelectorProps {
  database: string;
  model: string;
  apiBase?: string;
  onDatabaseChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onApiBaseChange?: (value: string) => void;
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

  const { data: health, refetch: refetchHealth } = useQuery({
    queryKey: ["nlq-health"],
    queryFn: nlqApi.health,
    refetchInterval: 30000,
  });

  const handleDatabaseChange = async (value: string) => {
    try {
      await nlqApi.setDatabase(value);
      onDatabaseChange(value);
      // refresh health to reflect new host/database immediately
      try {
        await refetchHealth();
      } catch (e) {
        // ignore refetch errors here; UI will update on next poll
      }
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

  const handleModelChange = (value: string) => {
    onModelChange(value);
    if (value === "mistral12b") {
      onApiBaseChange && onApiBaseChange("https://kubeingress.p31.eng.sjc01.qualys.com/mistral12b/v1");
    } else if (value === "phi-4-mini-instruct") {
      onApiBaseChange && onApiBaseChange("https://kubeingress.p31.eng.sjc01.qualys.com/cpu/phi4mini/v1");
    } else {
      onApiBaseChange && onApiBaseChange("");
    }
    // refetch health to update LLM model indicator
    try {
      refetchHealth();
    } catch (e) {
      // ignore
    }
  };

  const getStatusBadge = (status?: string | boolean) => {
    if (status === undefined || status === null || status === "") {
      return <Badge variant="secondary">Unknown</Badge>;
    }
    // status might be boolean for some fields
    const s = typeof status === "boolean" ? (status ? "connected" : "disconnected") : String(status);
    if (s === "healthy" || s === "connected") {
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
                  <SelectItem value="p43_eng_sjc01">P43 ENG SJC01</SelectItem>
                  <SelectItem value="p05_eng_sjc01">P05 ENG SJC01</SelectItem>
                  <SelectItem value="p07_eng_sjc01">P07 ENG SJC01</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Model
              </Label>
              <Select value={model} onValueChange={handleModelChange}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mistral12b">Mistral 12B</SelectItem>
                  <SelectItem value="phi-4-mini-instruct">Phi-4 Mini Instruct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Indicators */}
          {health && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Backend</p>
                {getStatusBadge(health.status)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ClickHouse</p>
                {getStatusBadge(health.databases?.clickhouse)}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">LLM Model</p>
                {/* Prefer the user's selected model so the UI updates immediately on selection.
                    Show backend-reported model in parentheses when different. */}
                <span className="text-sm">
                  {model}
                  {/* {health.llm_model && health.llm_model !== model ? (
                    <span className="text-muted-foreground">{' '}(backend: {health.llm_model})</span>
                  ) : null} */}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current Host</p>
                <span className="text-sm truncate">{health.databases?.current_host}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};