import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/orbit/Header";
import { FilterControls } from "@/components/orbit/FilterControls";
import { QueryInterface } from "@/components/orbit/QueryInterface";
import { MetricsView } from "@/components/orbit/MetricsView";
import { LogsView } from "@/components/orbit/LogsView";
import { AlertsView } from "@/components/orbit/AlertsView";
import { LiveAlertsSidebar } from "@/components/orbit/LiveAlertsSidebar";
import { BackendHealth } from "@/components/orbit/BackendHealth";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const Orbit = () => {
  const navigate = useNavigate();
  const [cluster, setCluster] = useState<string>("");
  const [namespace, setNamespace] = useState<string>("");
  const [application, setApplication] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const { toast } = useToast();

  const handleRefresh = () => {
    queryClient.clear();
    toast({
      title: "Cache cleared",
      description: "All data has been refreshed",
    });
  };

  const handleClear = () => {
    setCluster("");
    setNamespace("");
    setApplication("");
    setTimeRange("1h");
    queryClient.clear();
    toast({
      title: "Results cleared",
      description: "All selections and cache have been reset",
    });
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

          <Header />
          
          <BackendHealth />

          <FilterControls
            cluster={cluster}
            namespace={namespace}
            application={application}
            timeRange={timeRange}
            onClusterChange={setCluster}
            onNamespaceChange={setNamespace}
            onApplicationChange={setApplication}
            onTimeRangeChange={setTimeRange}
          />

          <QueryInterface
            application={application}
            timeRange={timeRange}
          />

          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Results
            </Button>
          </div>

          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="alerts">Correlated Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <MetricsView cluster={cluster} namespace={namespace} application={application} />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <LogsView cluster={cluster} namespace={namespace} application={application} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <AlertsView cluster={cluster} namespace={namespace} application={application} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <LiveAlertsSidebar cluster={cluster} />
    
      </div>
    </div>
  );
};

export default Orbit;
