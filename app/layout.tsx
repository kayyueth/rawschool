import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Web3Provider } from "@/lib/web3Context";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
