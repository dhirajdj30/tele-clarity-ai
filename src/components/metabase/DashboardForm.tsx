import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { DashboardRequest } from "@/lib/metabaseApi";

interface DashboardFormProps {
  onSubmit: (request: DashboardRequest) => void;
  isLoading: boolean;
}

const DashboardForm = ({ onSubmit, isLoading }: DashboardFormProps) => {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dashboardId, setDashboardId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (query.length < 3) {
      setError("Query must be at least 3 characters");
      return;
    }

    onSubmit({
      query,
      name: name || undefined,
      description: description || undefined,
      dashboardId: dashboardId ? parseInt(dashboardId) : undefined,
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Natural Language Query *</Label>
            <Textarea
              id="query"
              placeholder="e.g., Show me sales by region for the last quarter with a bar chart..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name (optional)</Label>
              <Input
                id="name"
                placeholder="My Sales Dashboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboardId">Existing Dashboard ID (optional)</Label>
              <Input
                id="dashboardId"
                type="number"
                placeholder="123"
                value={dashboardId}
                onChange={(e) => setDashboardId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="A dashboard showing regional sales performance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Dashboard
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardForm;
