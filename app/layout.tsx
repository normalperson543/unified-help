import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";
import Header from "./ui/header";
import { Toast } from "@heroui/react";
import PlausibleProvider from "next-plausible";

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
      className={`${ibmPlexSans.className} h-full antialiased bg-gray-50 dark`}
    >
      <Toast.Provider placement="top" />
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PlausibleProvider
          src={process.env["NEXT_PUBLIC_PLAUSBLE_TRACKING_URL"]}
          enabled
        >
          <div className="flex flex-col h-screen">
            <Header />
            {children}
          </div>
        </PlausibleProvider>
      </body>
    </html>
  );
}
