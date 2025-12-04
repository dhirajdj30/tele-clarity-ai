import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import MetabaseHeader from "@/components/metabase/MetabaseHeader";
import DashboardForm from "@/components/metabase/DashboardForm";
import DashboardResult from "@/components/metabase/DashboardResult";
import HealthStatus from "@/components/metabase/HealthStatus";
import { metabaseApi, DashboardRequest, DashboardResponse } from "@/lib/metabaseApi";
import { toast } from "@/hooks/use-toast";

const MetabaseDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DashboardResponse | null>(null);

  const handleGenerate = async (request: DashboardRequest) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await metabaseApi.generateDashboard(request);
      setResult(response);
      toast({
        title: "Dashboard Generated!",
        description: `Dashboard ID: ${response.dashboard_id}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4 gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Hub
          </Button>

          <MetabaseHeader />
          
          <div className="max-w-4xl space-y-6">
            <HealthStatus />
            
            <DashboardForm onSubmit={handleGenerate} isLoading={isLoading} />
            
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground animate-pulse">Generating your dashboard...</p>
                </div>
              </div>
            )}
            
            {result && !isLoading && <DashboardResult result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetabaseDashboard;
