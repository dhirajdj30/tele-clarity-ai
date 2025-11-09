import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Activity, MessageSquare, Cloud, Server } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: "sql",
      title: "NLQ → SQL",
      subtitle: "Natural Language Query",
      description: "Ask questions in plain English and get SQL results instantly from ClickHouse databases.",
      status: "Active",
      borderColor: "border-blue-500",
      icon: Database,
      route: "/nlq-sql",
    },
    {
      id: "orbit",
      title: "ORBIT",
      subtitle: "Risk-Based Telemetry",
      tagline: "From Chaos to Clarity",
      description: "AI-powered operational intelligence for monitoring clusters, logs, metrics and alerts.",
      status: "Active",
      borderColor: "border-primary",
      icon: Activity,
      route: "/orbit",
    },
    {
      id: "im",
      title: "IM",
      subtitle: "Incident Management",
      description: "Intelligent incident detection, correlation and automated response workflows.",
      status: "Coming Soon",
      borderColor: "border-orange-500",
      icon: MessageSquare,
      route: null,
    },
    {
      id: "co",
      title: "CO",
      subtitle: "Cloud Optimization",
      description: "Cost analysis and resource optimization recommendations powered by AI.",
      status: "Coming Soon",
      borderColor: "border-green-500",
      icon: Cloud,
      route: null,
    },
    {
      id: "k8s",
      title: "K8S",
      subtitle: "Kubernetes Intelligence",
      description: "Deep cluster insights, pod diagnostics and automated remediation suggestions.",
      status: "Coming Soon",
      borderColor: "border-purple-500",
      icon: Server,
      route: null,
    },
  ];

  const features = [
    {
      title: "AI-Powered Intelligence",
      points: [
        "Natural language query understanding",
        "Automated anomaly detection",
        "Predictive analytics and forecasting",
        "Intelligent alert correlation",
      ],
    },
    {
      title: "Seamless Integration",
      points: [
        "Multi-cluster Kubernetes monitoring",
        "ClickHouse database connectivity",
        "Prometheus and Grafana compatibility",
        "REST and GraphQL APIs",
      ],
    },
    {
      title: "Real-time Analytics",
      points: [
        "Live streaming metrics and logs",
        "Interactive dashboards",
        "Historical trend analysis",
        "Custom alert workflows",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f0f0f] to-black text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl opacity-20 -z-10" />
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            INTELLIGENT PLATFORM OPERATIONS HUB
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Centralised Automation, Insights and AI Driven Operations
          </p>
        </header>

        {/* Available AI Projects */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Available AI Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {projects.map((project) => {
              const Icon = project.icon;
              const isActive = project.status === "Active";
              
              return (
                <Card
                  key={project.id}
                  className={`bg-card/50 backdrop-blur-sm border-2 ${project.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${project.borderColor}/20`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={isActive ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="text-sm font-medium">
                      {project.subtitle}
                    </CardDescription>
                    {project.tagline && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {project.tagline}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <Button
                      onClick={() => project.route && navigate(project.route)}
                      disabled={!isActive}
                      className="w-full"
                      variant={isActive ? "default" : "secondary"}
                    >
                      {isActive ? `Open ${project.title}` : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-[#181818] border-border hover:scale-105 transition-transform duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.points.map((point, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Built with React + TypeScript + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
