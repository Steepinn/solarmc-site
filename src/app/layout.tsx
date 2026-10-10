import type { Metadata, Viewport } from "next";
import { Nunito, Pixelify_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteSplash } from "@/components/site-splash";
import { CursorTrail } from "@/components/cursor-trail";
import { CookieConsent } from "@/components/cookie-consent";
import { siteConfig } from "@/config/site";
import "./globals.css";

const fontPixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const fontSans = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["SolarMC", "Minecraft", "1.21.1", "Season 3"],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${fontPixel.variable} ${fontSans.variable} bg-background font-sans text-foreground`}
      >
        <SiteSplash />
        <ThemeProvider>
          <CursorTrail />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
