import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-10 text-center shadow-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Internal tool</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">City Wallet Agent Testing Console</h1>
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
