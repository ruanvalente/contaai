import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ContaAI - Descubra Autores e Suas Contribuições Literárias",
  description:
    "Plataforma de compartilhamento de contos, histórias e muito mais. De forma simples e gratuita.",
};

import { NotificationManager } from "@/features/notifications/widgets/notification-manager.widget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <NotificationManager />
      </body>
    </html>
  );
}
