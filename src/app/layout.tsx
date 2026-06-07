import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ceneyra Catalog — Digital Flipbook View",
  description:
    "Product Catalog for Ceneyra Limited..",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster richColors theme="system" />
      </body>
    </html>
  );
}
