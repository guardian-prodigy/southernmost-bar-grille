import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GuestExperience } from "./components/guest-experience";
import { SiteFooter, SiteHeader } from "./components/site-shell";
import { OrderProvider } from "./components/order-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://southernmost.life"),
  title: {
    default: "Southernmost Bar & Grille | West Palm Beach",
    template: "%s | Southernmost Bar & Grille",
  },
  description:
    "Coastal food, handcrafted cocktails, billiards and live music in West Palm Beach.",
  keywords: [
    "West Palm Beach restaurant",
    "Southernmost Bar and Grille",
    "live music West Palm Beach",
    "billiards West Palm Beach",
    "tropical cocktails",
    "coastal food",
  ],
  openGraph: {
    title: "Southernmost Bar & Grille",
    description:
      "Island flavors, cold drinks and live energy in West Palm Beach.",
    images: ["/og-southernmost.jpg"],
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "codex-preview": "development",
  },
};

export const viewport: Viewport = {
  themeColor: "#031d1a",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <OrderProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <GuestExperience />
        </OrderProvider>
      </body>
    </html>
  );
}
