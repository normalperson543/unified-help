import type { Metadata } from "next";
import "./globals.css";
import Header from "./ui/header";
import { Toast } from "@heroui/react";
import { HammerIcon } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | Unified Help",
    default: "Unified Help",
  },
  description: "All your Hack Club support tickets, under one roof",
  metadataBase: new URL(process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000"), // i should probably rename this env var
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      className={`h-full antialiased ${process.env["NODE_ENV"] === "development" ? "border-yellow-500 border-12" : ""}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const theme = localStorage.getItem("heroui-theme") || "dark";
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(theme);
                document.documentElement.dataset.theme = theme;
              } catch {}
            })();`,
          }}
        />
      </head>
      <Toast.Provider placement="top" />
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
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
      </body>
    </html>
  );
}
