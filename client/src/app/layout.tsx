import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "material-icons/iconfont/material-icons.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LED Pixel Studio",
  description: "Program your LED pixels in style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
