import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"

export const metadata: Metadata = {
  title: "Open Source Contributions",
  description:
    "Explore Nahraf's open source contributions — pull requests, bug fixes, and features contributed to popular repositories and the developer community.",
  keywords: ["open source", "contributions", "pull requests", "github", "developer", "Nahraf", "community"],
  alternates: {
    canonical: `${SITE_URL}/open-source`,
  },
  openGraph: {
    title: "Open Source Contributions | Nahraf",
    description: "Explore Nahraf's open source contributions to popular repositories and the developer community.",
    url: `${SITE_URL}/open-source`,
    type: "website",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source Contributions | Nahraf",
    description: "Explore Nahraf's open source contributions to popular repositories and the developer community.",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  }
}

export default function OpenSourceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
