import { MessageSquare } from "lucide-react";

export const NlqHeader = () => {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <div className="flex items-center gap-3 mb-2">
        {/* <MessageSquare className="h-10 w-10 text-primary" /> */}
        <img src="/qualys-shield.svg" alt="Qualys" className="h-11 w-11 text-primary" />
        <h1 className="text-4xl font-bold tracking-[0.1em] bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          NLQ → SQL
        </h1>
      </div>
      <p className="text-xl text-muted-foreground font-medium">
        Ask. Don't Query!
      </p>
      <p className="text-sm text-muted-foreground italic mt-1">
        From Question to Query — Instantly.
      </p>
    </header>
  );
};
