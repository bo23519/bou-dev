import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";
import { NavBar } from "@/components/navigation/NavBar";
import { LoadingTriggersProvider } from "@/contexts/LoadingTriggersContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My personal portfolio",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <LoadingTriggersProvider>
            <NavBar />
            <div className="pt-20">{children}</div>
          </LoadingTriggersProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
