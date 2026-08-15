import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";
import Header from "./ui/header";
import { Toast } from "@heroui/react";
import PlausibleProvider from "next-plausible";
import { HammerIcon } from "lucide-react";

const ibmPlexSans = Google_Sans_Flex({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Unified Help",
    default: "Unified Help",
  },
  description: "All your Hack Club support tickets, under one roof",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.className} h-full antialiased bg-gray-50 dark ${process.env["NODE_ENV"] === "development" ? "border-yellow-500 border-12" : ""}`}
    >
      <Toast.Provider placement="top" />
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PlausibleProvider
          src={process.env["NEXT_PUBLIC_PLAUSBLE_TRACKING_URL"]}
          enabled
        >
          <div className="flex flex-col h-screen">
            {process.env["NODE_ENV"] === "development" && (
              <div className="bg-[repeating-linear-gradient(45deg,#FFD700,#FFD700_20px,#111_20px,#111_40px)] flex flex-row gap-2 items-center justify-center text-center font-bold">
                <div className="flex flex-row gap-2 items-center justify-center text-center bg-white text-red-500">
                  <HammerIcon width={12} />
                  Development Build
                </div>
              </div>
            )}
            <Header />
            {children}
          </div>
        </PlausibleProvider>
      </body>
    </html>
  );
}
