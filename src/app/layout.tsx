import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const hudSans = Space_Grotesk({
  variable: "--font-hud-sans",
  subsets: ["latin"],
});

const hudDisplay = Fraunces({
  variable: "--font-hud-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Choices: Oda",
  description: "WASD, Shift, Ctrl ve Space ile gezilebilen boş 3D oda prototipi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} ${hudSans.variable} ${hudDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
