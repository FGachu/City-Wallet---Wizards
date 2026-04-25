"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type Props = {
  initial?: string | null;
  onChange?: (url: string | null) => void;
  className?: string;
};

export default function PhotoUpload({ initial = null, onChange, className }: Props) {
  const [preview, setPreview] = useState<string | null>(initial);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  if (preview) {
    return (
      <div
        className={
          "relative aspect-[4/3] rounded-xl overflow-hidden border border-ink-200 group " +
          (className ?? "")
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Product"
          className="size-full object-cover"
        />
        <button
          onClick={() => {
            setPreview(null);
            onChange?.(null);
          }}
          className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"
          aria-label="Remove photo"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className={
        "aspect-[4/3] w-full rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2 " +
        (dragging
          ? "border-brand-500 bg-brand-50/50 text-brand-700"
          : "border-ink-200 text-ink-500 hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-600 ") +
        (className ?? "")
      }
    >
      <Upload className="size-5" />
      <span className="text-sm font-medium">Drop photo or click to upload</span>
      <span className="text-[11px]">PNG, JPG · up to 5 MB</span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </button>
  );
}
