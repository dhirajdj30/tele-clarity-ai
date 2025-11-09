import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryHistory } from "@/lib/nlqApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

interface AnalyticsChartsProps {
  queryHistory: QueryHistory[];
}

export const AnalyticsCharts = ({ queryHistory }: AnalyticsChartsProps) => {
  if (queryHistory.length === 0) return null;

  const last10 = queryHistory.slice(0, 10).reverse();

  // Success rate data
  const successCount = last10.filter((q) => q.status === "success").length;
  const successRate = (successCount / last10.length) * 100;

  const successData = [
    { name: "Success", value: successCount, fill: "hsl(var(--success))" },
    { name: "Failed", value: last10.length - successCount, fill: "hsl(var(--destructive))" },
  ];

  // Response time data
  const responseTimeData = last10
    .filter((q) => q.execution_time !== undefined)
    .map((q, idx) => ({
      query: `Q${idx + 1}`,
      time: q.execution_time || 0,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Success Rate */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Success Rate (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-success">{successRate.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground">
              {successCount} of {last10.length} queries succeeded
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={successData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Response Time Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {responseTimeData.length > 0 ? (
            <>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-primary">
                  {(
                    responseTimeData.reduce((sum, d) => sum + d.time, 0) / responseTimeData.length
                  ).toFixed(2)}
                  s
                </p>
                <p className="text-sm text-muted-foreground">Average response time</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="query" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-16">No timing data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
