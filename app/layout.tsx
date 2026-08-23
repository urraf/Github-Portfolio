import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nahraf — Software Engineer, Full-Stack Developer & Tech Blogger",
    template: "%s | Nahraf",
  },
  description:
    "Portfolio & tech blog by Nahraf — software engineer specializing in full-stack development, AI integrations, cloud architecture, and scalable backend systems. Read trending articles on AI, DevOps, system design, and modern web development.",
  keywords: [
    "Nahraf",
    "Farhan",
    "software engineer",
    "full-stack developer",
    "portfolio",
    "tech blog",
    "programming blog",
    "developer articles",
    "AI blog",
    "web development blog",
    "Next.js",
    "React",
    "Node.js",
    "system design",
    "backend engineering",
    "cloud computing",
    "DevOps",
    "software architecture",
    "nahraf.tech",
  ],
  authors: [{ name: "Nahraf", url: SITE_URL }],
  creator: "Nahraf",
  publisher: "Nahraf",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Nahraf — Software Engineer & Tech Blogger",
    title: "Nahraf — Software Engineer, Full-Stack Developer & Tech Blogger",
    description:
      "Portfolio & tech blog — deep dives into software engineering, AI, system design, cloud architecture, and modern web development.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nahraf — Software Engineer & Tech Blogger",
    description:
      "Portfolio & tech blog — software engineering, AI, system design, and modern web development.",
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
  verification: {
    google: "google8eab78d1bfe0c0e1",
  },
};

// JSON-LD Structured Data for Google Rich Results
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nahraf — Software Engineer & Tech Blogger",
  url: SITE_URL,
  description: "Portfolio & tech blog by Nahraf — software engineering, AI, system design, and modern web development.",
  author: {
    "@type": "Person",
    name: "Nahraf",
    url: SITE_URL,
    jobTitle: "Software Engineer",
    sameAs: [
      "https://github.com/urraf",
    ],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nahraf",
  url: SITE_URL,
  jobTitle: "Software Engineer",
  description: "Full-stack software engineer specializing in AI integrations, cloud architecture, and scalable backend systems.",
  sameAs: [
    "https://github.com/urraf",
  ],
  knowsAbout: [
    "Software Engineering",
    "Full-Stack Development",
    "Artificial Intelligence",
    "System Design",
    "Cloud Computing",
    "React",
    "Next.js",
    "Node.js",
    "MongoDB",
    "DevOps",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
