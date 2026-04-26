"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SOURCE_GROUPS = [
  {
    title: "CONTEXT & LOCATION",
    items: [
      {
        name: "OpenWeatherMap / DWD",
        detail: "Real-time and forecast weather data by city/location — core context trigger signal."
      },
      {
        name: "Eventbrite / Local event APIs",
        detail: "Local event calendars — city festivals, sports events, concerts — for demand spike detection."
      },
      {
        name: "Google Maps Platform / OSM",
        detail: "POI data, footfall signals, route density — for proximity and relevance scoring."
      }
    ]
  },
  {
    title: "MERCHANT & TRANSACTION DATA",
    items: [
      {
        name: "Simulated Payone transaction feed",
        detail: "Simulate or stub Payone transaction density data per merchant — a core DSV asset for identifying quiet periods and triggering dynamic offers."
      }
    ]
  },
  {
    title: "AI & GENERATIVE UI",
    items: [
      {
        name: "On-device SLMs (Phi-3, Gemma, etc.)",
        detail: "Small language models running on-device for GDPR-compliant local personalisation — only an abstract 'intent' signal reaches the server."
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
        <Card key={group.title} className="border-border">
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
