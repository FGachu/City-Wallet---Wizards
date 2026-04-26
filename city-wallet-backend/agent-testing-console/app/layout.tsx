import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Wallet Agent Testing Console",
  description: "Internal sandbox for City Wallet multi-agent testing."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
