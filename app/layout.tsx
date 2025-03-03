import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Web3Provider } from "@/lib/web3Context";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Raw School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
