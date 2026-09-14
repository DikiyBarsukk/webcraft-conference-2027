import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Register | WebCraft Conference 2027",
  description: "Register for WebCraft Conference 2027 in Helsinki or online.",
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
