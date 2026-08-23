import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"

export const metadata: Metadata = {
  title: "HTML/JS Projects Showcase",
  description:
    "Explore Nahraf's showcase of raw HTML, CSS, and JavaScript projects. Highlighting foundational web development skills and creative UI designs.",
  keywords: ["HTML projects", "JavaScript projects", "UI design", "web development portfolio", "Nahraf"],
  alternates: {
    canonical: `${SITE_URL}/project-overview`,
  },
  openGraph: {
    title: "HTML/JS Projects | Nahraf",
    description: "Explore Nahraf's showcase of raw HTML, CSS, and JavaScript projects.",
    url: `${SITE_URL}/project-overview`,
    type: "website",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML/JS Projects | Nahraf",
    description: "Explore Nahraf's showcase of raw HTML, CSS, and JavaScript projects.",
    images: [{ url: `${SITE_URL}/profile2.jpeg`, width: 1200, height: 630, alt: "Nahraf Portfolio" }],
  }
}

export default function ProjectOverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
