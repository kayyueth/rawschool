import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { Web3Provider } from "@/lib/web3Context";
import { LanguageProvider } from "@/lib/languageContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Raw School",
  description:
    "A community-driven platform for learning and sharing knowledge about web3, blockchain, and decentralized technologies.",
  keywords: [
    "education",
    "web3",
    "blockchain",
    "bookclub",
    "wiki",
    "decentralized learning",
  ],
  authors: [{ name: "Raw School" }],
  creator: "Raw School",
  publisher: "Raw School",
  metadataBase: new URL("https://raw-visual.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Raw School",
    description:
      "A community-driven platform for learning and sharing knowledge about web3, blockchain, and decentralized technologies.",
    url: "https://raw-visual.vercel.app",
    siteName: "Raw School",
    images: [
      {
        url: "/Logo.svg",
        width: 1200,
        height: 630,
        alt: "Raw School Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raw School",
    description:
      "A community-driven platform for learning and sharing knowledge about web3, blockchain, and decentralized technologies.",
    images: ["/Logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd
          name="Raw School"
          url="https://raw-visual.vercel.app"
          logo="https://raw-visual.vercel.app/Logo.svg"
          description="A community-driven platform for learning and sharing knowledge about web3, blockchain, and decentralized technologies."
        />
        <WebsiteJsonLd
          name="Raw School"
          url="https://raw-visual.vercel.app"
          description="A community-driven platform for learning and sharing knowledge about web3, blockchain, and decentralized technologies."
        />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <Web3Provider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-center" />
            </ThemeProvider>
          </LanguageProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
