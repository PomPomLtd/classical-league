import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/session-provider";
import { siteMetadata, viewportConfig } from "./metadata";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = siteMetadata;
export const viewport = viewportConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className="h-full">
      <body className="h-full font-syne antialiased bg-background text-foreground">
        <Providers>
          <div className="min-h-full flex flex-col">
            <Navigation />
            <main className="flex-grow pb-10">
              {children}
            </main>
            <Footer />
          </div>
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
