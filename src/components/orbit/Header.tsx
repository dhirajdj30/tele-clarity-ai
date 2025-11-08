import { Orbit } from "lucide-react";

export const Header = () => {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <div className="flex items-center gap-3 mb-2">
        {/* <Orbit className="h-10 w-10 text-primary" /> */}
        <img src="/qualys_logo_1.svg" alt="Qualys" className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-[0.1em] bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          ORBIT
        </h1>
      </div>
      <p className="text-xl text-muted-foreground font-medium">
        Operational Risk-Based Intelligent Telemetry
      </p>
      <p className="text-sm text-muted-foreground italic mt-1">
        From Chaos to Clarity.
      </p>
    </header>
  );
};
