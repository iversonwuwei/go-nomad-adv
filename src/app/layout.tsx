import type { Metadata, Viewport } from "next";

import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_PATH,
  TWITTER_IMAGE_PATH,
} from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  category: "travel",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [TWITTER_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon-32.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12d6c4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
