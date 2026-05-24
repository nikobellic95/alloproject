import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Inventory Reservation System",
  description: "Temporary inventory reservation platform for retail and D2C brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, "dark")}>
      <body className="antialiased">
        {/* RGB Halo Background */}
        <div className="halo-container">
          <div className="halo halo-1"></div>
          <div className="halo halo-2"></div>
          <div className="halo halo-3"></div>
        </div>
        
        <Header />
        <main className="container mx-auto py-8 px-4 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
