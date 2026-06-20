"use client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function HTMLProjectRenderPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  // The direct URL to the raw HTML content
  const htmlUrl = `/api/html-projects/${slug}`

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-[#30363d] bg-[#010409] flex items-center justify-between px-4 sm:px-6 shrink-0">
        <Link 
          href="/project-overview" 
          className="flex items-center text-[#8b949e] hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Link>

        <div className="flex items-center gap-4">
          <a 
            href={htmlUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Open in new tab
          </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 w-full bg-white">
        <iframe 
          src={htmlUrl} 
          className="w-full h-full border-0" 
          title={`HTML Project: ${slug}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
