import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

interface FilterControlsProps {
  cluster: string;
  namespace: string;
  application: string;
  timeRange: string;
  onClusterChange: (value: string) => void;
  onNamespaceChange: (value: string) => void;
  onApplicationChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
}

export const FilterControls = ({
  cluster,
  namespace,
  application,
  timeRange,
  onClusterChange,
  onNamespaceChange,
  onApplicationChange,
  onTimeRangeChange,
}: FilterControlsProps) => {
  const { data: clusters } = useQuery({
    queryKey: ["clusters"],
    queryFn: api.getAvailableClusters,
  });

  const { data: namespaces } = useQuery({
    queryKey: ["namespaces", cluster],
    queryFn: () => api.getNamespaces(cluster),
    enabled: !!cluster,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications", cluster],
    queryFn: () => api.getApplications(cluster),
    enabled: !!cluster,
  });

  // Clear namespace and application when cluster changes
  useEffect(() => {
    if (cluster) {
      onNamespaceChange("");
      onApplicationChange("");
      queryClient.invalidateQueries({ queryKey: ["namespaces"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    }
  }, [cluster]);

  // Clear application when namespace changes
  useEffect(() => {
    if (namespace) {
      onApplicationChange("");
    }
  }, [namespace]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="cluster">Cluster</Label>
        <Select value={cluster} onValueChange={onClusterChange}>
          <SelectTrigger id="cluster">
            <SelectValue placeholder="Select cluster" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(clusters)
              ? clusters.map((c: string) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="namespace">Namespace</Label>
        <Select
          value={namespace}
          onValueChange={onNamespaceChange}
          disabled={!cluster}
        >
          <SelectTrigger id="namespace">
            <SelectValue placeholder="Select namespace" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(namespaces)
              ? namespaces.map((ns: string) => (
                  <SelectItem key={ns} value={ns}>
                    {ns}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="application">Application</Label>
        <Select
          value={application}
          onValueChange={onApplicationChange}
          disabled={!cluster}
        >
          <SelectTrigger id="application">
            <SelectValue placeholder="Select application" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(applications)
              ? applications.map((app: string) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeRange">Time Range</Label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger id="timeRange">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15m">Last 15 minutes</SelectItem>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
