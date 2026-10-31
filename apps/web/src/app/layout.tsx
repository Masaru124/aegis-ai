import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisAI — Autonomous Decision Intelligence & Adaptive Memory",
  description: "High-precision adaptive intelligence system with mathematical decision support, persistent vector memory, and multi-model neural orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased bg-void text-slate-100 overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
