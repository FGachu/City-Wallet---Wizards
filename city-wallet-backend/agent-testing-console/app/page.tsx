import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-card/70 p-10 text-center shadow-glass backdrop-blur-md">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary">Internal tool</p>
        <h1 className="mb-3 text-4xl font-semibold">City Wallet Agent Testing Console</h1>
        <p className="mb-8 text-muted-foreground">
          Test and validate multi-agent workflows, prompts, latency, and shared memory while frontend work is in progress.
        </p>
        <Button asChild size="lg">
          <Link href="/agent-console">
            Open Agent Console
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
