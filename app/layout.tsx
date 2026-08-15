import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://github-portfolio-kghg.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Farhan | Software Engineer & Full-Stack Developer",
    template: "%s | Farhan",
  },
  description:
    "Portfolio & tech blog by Farhan — software engineer specializing in full-stack development, distributed systems, AI integrations, and scalable backend architectures.",
  keywords: [
    "Farhan",
    "software engineer",
    "full-stack developer",
    "portfolio",
    "tech blog",
    "Next.js",
    "React",
    "Node.js",
    "distributed systems",
    "backend engineering",
    "AI",
  ],
  authors: [{ name: "Farhan", url: SITE_URL }],
  creator: "Farhan",
  publisher: "Farhan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Farhan — Software Engineer",
    title: "Farhan | Software Engineer & Full-Stack Developer",
    description:
      "Portfolio & tech blog by Farhan — software engineer specializing in full-stack development, distributed systems, and AI integrations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farhan | Software Engineer",
    description:
      "Portfolio & tech blog — full-stack development, distributed systems, and AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className="__variable_5cfdac __variable_9a8899 antialiased vsc-initialized"
      >
        {children}
      </body>
    </html>
  );
}
