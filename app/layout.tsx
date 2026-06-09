import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NadaProvider } from "@/components/providers/NadaProvider";
import { CartProvider } from "@/components/providers/CartProvider";

export const metadata: Metadata = {
  title: "nada — you spent nada. nice work.",
  description: "Get the dopamine of the impulse buy. Keep the money.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NadaProvider>
            <CartProvider>{children}</CartProvider>
          </NadaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
