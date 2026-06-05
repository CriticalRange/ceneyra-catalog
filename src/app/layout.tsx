import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ceneyra Catalog — Digital Flipbook Viewer",
  description:
    "Browse and view beautiful digital catalogs with smooth page-flip animations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
