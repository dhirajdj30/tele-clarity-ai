import { LayoutDashboard } from "lucide-react";

const MetabaseHeader = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutDashboard className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            METABASE AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Dashboard Generator
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Generate dashboards with natural language — Instantly.
      </p>
    </div>
  );
};

export default MetabaseHeader;
