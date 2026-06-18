import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "RaspaPrêmio - Raspadinhas Online com PIX",
  description: "Jogue raspadinhas online e ganhe prêmios via PIX na hora!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', sans-serif", margin: 0 }}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
