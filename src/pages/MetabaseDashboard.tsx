import { useState } from "react";
import MetabaseHeader from "@/components/metabase/MetabaseHeader";
import DashboardForm from "@/components/metabase/DashboardForm";
import DashboardResult from "@/components/metabase/DashboardResult";
import HealthStatus from "@/components/metabase/HealthStatus";
import { metabaseApi, DashboardRequest, DashboardResponse } from "@/lib/metabaseApi";
import { toast } from "@/hooks/use-toast";

const MetabaseDashboard = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f0f0f] to-black text-foreground">
      <MetabaseHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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
      </main>

      <footer className="text-center text-sm text-muted-foreground py-8">
        <p>Built with FastAPI + React</p>
      </footer>
    </div>
  );
};

export default MetabaseDashboard;
