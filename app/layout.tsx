import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Classical Chess League",
  description: "Management portal for classical chess league tournament",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-syne antialiased bg-background text-foreground">
        <div className="min-h-full">
          <Navigation />
          <main className="pb-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
