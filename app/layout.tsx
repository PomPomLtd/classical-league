import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/session-provider";
import { siteMetadata, viewportConfig } from "./metadata";

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
