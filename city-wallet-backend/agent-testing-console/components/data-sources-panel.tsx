"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SOURCE_GROUPS = [
  {
    title: "Context and location",
    items: [
      {
        name: "OpenWeatherMap",
        detail: "Live and forecast weather by city — primary context trigger (precip, feels-like, wind)."
      },
      {
        name: "Eventbrite / local event APIs",
        detail: "Festivals, sports, concerts — demand spike scoring for wallet surfacing."
      },
      {
        name: "Google Maps Platform / OSM",
        detail: "POI proximity, footfall proxy, route density — relevance and reachability."
      }
    ]
  },
  {
    title: "Merchant and transactions",
    items: [
      {
        name: "Payone transaction feed (simulated here)",
        detail: "Tx density vs baseline per merchant window — quiet periods and dynamic offer triggers (DSV)."
      }
    ]
  },
  {
    title: "AI and generative UI",
    items: [
      {
        name: "On-device SLMs (Phi-3, Gemma, …)",
        detail: "Local personalization; only abstract intent + confidence is sent server-side."
      },
      {
        name: "React Native / Flutter GenUI",
        detail: "Streamed runtime widget trees — offers composed at runtime, not static templates."
      }
    ]
  }
] as const;

export function DataSourcesPanel() {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <p className="text-xs leading-relaxed text-foreground/90">
        Agent outputs are grounded on structured signals under Scenario Inputs (
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">grounding</code>). For production, hydrate this object
        from your APIs and keep secrets in <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.env.local</code>.
      </p>
      {SOURCE_GROUPS.map((group) => (
        <Card key={group.title} className="border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-foreground">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-0 pb-3">
            <ul className="list-inside list-disc space-y-2 pl-0.5">
              {group.items.map((item) => (
                <li key={item.name}>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="block pl-4 text-xs leading-relaxed">{item.detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
