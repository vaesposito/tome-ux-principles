import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Sans_3, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace", "Courier New"],
});

export const metadata: Metadata = {
  title: "Tome — UX Principles & Personas",
  description:
    "Tome keeps a project's wiki current by synthesizing activity from GitHub, Webex, and Confluence into readable, human-verified prose. Explore the principles, personas, and wireframes behind it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sourceSans.variable} ${ibmPlex.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        data-font-family="inter"
      >
        {children}
      </body>
    </html>
  );
}
