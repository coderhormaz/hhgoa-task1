import type { Metadata } from "next";
import { Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";

const display = Imbue({
  subsets: ["latin"],
  variable: "--font-imbue",
  display: "swap",
});

const mono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-victor",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Frame In Goa — HH Goa 2026",
  description: "Turn your face into an HH Goa 2026 collectible builder identity.",
  openGraph: {
    title: "Frame In Goa — HH Goa 2026",
    description: "Builder detected. Signal locked. Make your HH Goa frame.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
