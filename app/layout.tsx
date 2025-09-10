import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Schachklub Kreis 4 Classical League",
  description: "Management portal for Schachklub Kreis 4 classical chess league tournament",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-syne antialiased bg-background text-foreground">
        <Providers>
          <div className="min-h-full">
            <Navigation />
            <main className="pb-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
