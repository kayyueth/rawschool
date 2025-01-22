import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { GeistSans, GeistMono } from "geist/font";

const roboto = Roboto({
  weight: ["400", "700"], // 加载常规和粗体字重
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "raw-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>{children}</body>
    </html>
  );
}
