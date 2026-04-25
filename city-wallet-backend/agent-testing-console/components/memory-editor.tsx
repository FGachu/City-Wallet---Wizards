"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type MemoryEditorProps = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
};

export function MemoryEditor({ title, value, onChange, helper }: MemoryEditorProps) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <Textarea className="min-h-[180px] font-mono text-xs" value={value} onChange={(e) => onChange(e.target.value)} />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
