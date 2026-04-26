"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataSourcesPanel } from "@/components/data-sources-panel";
import { MemoryEditor } from "@/components/memory-editor";

type SidebarProps = {
  sharedMemoryText: string;
  scenarioInputText: string;
  configText: string;
  sessionStateText: string;
  setSharedMemoryText: (value: string) => void;
  setScenarioInputText: (value: string) => void;
  setConfigText: (value: string) => void;
  setSessionStateText: (value: string) => void;
};

export function Sidebar(props: SidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="memory" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memory">Shared Memory</TabsTrigger>
            <TabsTrigger value="scenario">Scenario Inputs</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>
          <TabsList className="mt-2 grid w-full grid-cols-2">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="session">Session State</TabsTrigger>
          </TabsList>
          <TabsContent value="memory">
            <MemoryEditor
              title="Editable shared state"
              value={props.sharedMemoryText}
              onChange={props.setSharedMemoryText}
              helper="Changes affect all next agent runs. The location field is used for live OpenWeatherMap lookups in the header."
            />
          </TabsContent>
          <TabsContent value="scenario">
            <MemoryEditor
              title="Scenario JSON"
              value={props.scenarioInputText}
              onChange={props.setScenarioInputText}
              helper="Include a top-level grounding object (weather, events, POI, Payone, onDeviceIntent, genUi) for realistic runs."
            />
          </TabsContent>
          <TabsContent value="sources">
            <DataSourcesPanel />
          </TabsContent>
          <TabsContent value="config">
            <MemoryEditor title="Model + API config" value={props.configText} onChange={props.setConfigText} />
          </TabsContent>
          <TabsContent value="session">
            <MemoryEditor title="Session metadata" value={props.sessionStateText} onChange={props.setSessionStateText} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
