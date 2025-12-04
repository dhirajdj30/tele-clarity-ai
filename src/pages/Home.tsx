import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LogoWithGlow = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const containerClass = `${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"}`;

  return (
    <div className={`${containerClass} w-full h-full flex items-center justify-center transition-all duration-700 ease-out`}>
      {/* No glow applied; keep logo clean and centered. Add hover/focus effects (scale + ring) */}
      <img
        src="https://ik.imagekit.io/qualys/image/logo/qualys-shield.svg"
        alt="Qualys logo"
        className="w-full h-full object-contain transform transition-transform duration-300 ease-out hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary rounded"
      />
    </div>
  );
};

const TitleAnimated = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);
  const cls = `${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"} transition-all duration-800 ease-out`;
  return <h1 className={cls + " text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-center"}>{children}</h1>;
};

const SubtitleAnimated = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Slightly longer delay so subtitle appears after the title settles
    const t = setTimeout(() => setMounted(true), 420);
    return () => clearTimeout(t);
  }, []);
  // Longer duration with ease-in-out for a gentler slide/fade
  const cls = `${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-[1100ms] ease-in-out`;
  return <p className={cls + " text-xl md:text-2xl text-muted-foreground font-medium"}>{children}</p>;
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Activity, MessageSquare, Cloud, Server, LayoutDashboard } from "lucide-react";

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
      description: "AI-powered operational intelligence for monitoring application, logs, metrics and alerts.",
      status: "Active",
      borderColor: "border-primary",
      icon: Activity,
      route: "/orbit",
    },
    {
      id: "metabase",
      title: "Metabase AI",
      subtitle: "Dashboard Generator",
      description: "Generate Metabase dashboards instantly using natural language queries powered by AI.",
      status: "Active",
      borderColor: "border-cyan-500",
      icon: LayoutDashboard,
      route: "/metabase",
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
      subtitle: "Container Orchestration",
      description: "Smart orchestration assistant for automated, intelligent container management.",
      status: "Coming Soon",
      borderColor: "border-green-500",
      icon: Cloud,
      route: null,
    },
    {
      id: "k8s",
      title: "Kubevirt",
      subtitle: "Kubevirt Intelligence",
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
          {/* Qualys logo from public folder */}
          <div className="mx-auto mb-6 w-28 h-28 flex items-center justify-center transition-transform duration-700 ease-out">
            {/* Animated logo: entrance */}
            <LogoWithGlow />
          </div>

          <TitleAnimated>INTELLIGENT PLATFORM OPERATIONS HUB</TitleAnimated>
          <SubtitleAnimated>Centralised Automation, Insights and AI Driven Operations</SubtitleAnimated>
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
                    {/* {project.tagline && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {project.tagline}
                      </p>
                    )} */}
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
          <p>© 2025 Intelligent Platform Operations Hub.  Empowering DevOps with AI-driven automation, insights, and orchestration.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
