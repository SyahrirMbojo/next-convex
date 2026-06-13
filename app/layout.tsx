import { Geist_Mono, Source_Sans_3 } from "next/font/google";

import "./globals.css";
import MainLayout from "@/components/main-layout";
import { cn } from "@/lib/utils";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        sourceSans3.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
