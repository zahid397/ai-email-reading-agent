import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Email Reading Agent",
  description: "Reads, classifies, and surfaces only the emails that matter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
