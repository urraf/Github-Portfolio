import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"

export const metadata: Metadata = {
  title: "Client Work & Freelance Projects",
  description:
    "Explore Nahraf's portfolio of successful freelance projects and client work, showcasing scalable web applications, robust backends, and AI integrations.",
  keywords: ["freelance developer", "client work", "portfolio", "web development projects", "software engineering", "Nahraf"],
  alternates: {
    canonical: `${SITE_URL}/client-work`,
  },
  openGraph: {
    title: "Client Work & Projects | Nahraf",
    description: "Explore Nahraf's portfolio of successful freelance projects and client work.",
    url: `${SITE_URL}/client-work`,
    type: "website",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Work & Projects | Nahraf",
    description: "Explore Nahraf's portfolio of successful freelance projects and client work.",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  }
}

export default function ClientWorkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
