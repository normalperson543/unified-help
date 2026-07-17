import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Header from "./ui/header";
import { Toast } from "@heroui/react";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unified Help",
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
        <div className="flex flex-col h-screen">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
