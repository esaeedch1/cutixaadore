import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { FloatingWidgets } from "@/components/FloatingWidgets";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutiXa Adore | Love Your Skin",
  description: "Premium skin-care eCommerce experience. Love Your Skin with CutiXa Adore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <FloatingWidgets />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

