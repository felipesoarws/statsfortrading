import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

// We'll use a font that looks like Google Sans since Google Sans is proprietary.
// "Product Sans" or similar. Actually, we can use a CDN for a clean look.
// For now, let's use a widely available "Outfit" or "Public Sans" or just a sans-serif stack.
// Actually, I'll just remove the Inter font logic and use a global font-family in globals.css.

export const metadata: Metadata = {
  title: "Analisador de Futebol | Dashboard",
  description: "Análise avançada de futebol baseada em dados reais e tendências do mercado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased flex h-screen bg-background`}>
        <div className="flex-none">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto" style={{ paddingLeft: 'var(--sidebar-width)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
