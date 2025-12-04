import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, LayoutDashboard, CreditCard } from "lucide-react";
import { DashboardResponse } from "@/lib/metabaseApi";
import { toast } from "@/hooks/use-toast";

interface DashboardResultProps {
  result: DashboardResponse;
}

const DashboardResult = ({ result }: DashboardResultProps) => {
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-success/50 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-success">
            <Check className="h-5 w-5" />
            Dashboard Generated Successfully
          </CardTitle>
          <Badge variant="outline" className="border-success text-success">
            Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message */}
        <p className="text-muted-foreground">{result.message}</p>

        {/* IDs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Dashboard ID</p>
              <p className="font-mono font-bold text-lg">{result.dashboard_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Card ID</p>
              <p className="font-mono font-bold text-lg">{result.card_id}</p>
            </div>
          </div>
        </div>

        {/* Dashboard URL */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Dashboard URL</p>
              <a
                href={result.dashboard_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-sm truncate block"
              >
                {result.dashboard_url}
              </a>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.dashboard_url)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(result.dashboard_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
            </div>
          </div>
        </div>

        {/* JSON Response */}
        <Collapsible open={jsonExpanded} onOpenChange={setJsonExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>View Full JSON Response</span>
              {jsonExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-4 rounded-lg bg-background border border-border overflow-auto max-h-[400px]">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default DashboardResult;
