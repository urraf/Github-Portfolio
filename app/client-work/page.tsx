"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, HandCoins, Quote, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ClientWork {
  _id: string
  title: string
  clientName: string
  projectUrl: string
  description: string
  techStack: string[]
  cost?: string
  status: string
  testimonial: string
  imageUrl?: string
  createdAt: string
}

export default function ClientWorkPublicPage() {
  const [entries, setEntries] = useState<ClientWork[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/client-work")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.techStack.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Client Work</h1>
            <p className="text-[#8b949e]">Freelance projects and client collaborations.</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-[#161b22] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-12 text-center">
              <HandCoins className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
              <p className="text-[#7d8590]">{search ? "Try a different search term." : "Client projects will appear here."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filtered.map(entry => (
              <Card 
                key={entry._id} 
                className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]/40 transition-all duration-300 group overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#58a6ff]/5 relative"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#58a6ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row">
                  {/* Image Section - Only renders if imageUrl exists */}
                  {entry.imageUrl && (
                    <div className="w-full md:w-2/5 lg:w-1/3 relative border-b md:border-b-0 md:border-r border-[#30363d] overflow-hidden bg-[#0d1117]/50 min-h-[200px] md:min-h-full flex-shrink-0 group/img">
                      {entry.projectUrl ? (
                        <a href={entry.projectUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20 flex items-center justify-center bg-[#0d1117]/80 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                          <span className="flex items-center gap-2 text-white font-medium bg-[#1f6feb] hover:bg-[#388bfd] px-4 py-2 rounded-full transition-colors">
                            <ExternalLink className="h-4 w-4" /> Visit Site
                          </span>
                        </a>
                      ) : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={entry.imageUrl} 
                        alt={`${entry.title} preview`}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <CardContent className="p-6 sm:p-8 flex-1 flex flex-col justify-between z-10">
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#58a6ff] transition-colors">{entry.title}</h2>
                            {entry.cost && (
                              <Badge className="bg-[#2ea043]/10 text-[#3fb950] border-[#2ea043]/30 font-medium text-sm px-2.5 shadow-[0_0_10px_rgba(46,160,67,0.1)]">
                                {entry.cost}
                              </Badge>
                            )}
                            <Badge className={
                              entry.status === 'Completed'
                                ? "bg-[#238636]/10 text-[#3fb950] border-[#238636]/30 shadow-[0_0_10px_rgba(35,134,54,0.1)]"
                                : entry.status === 'In Progress'
                                  ? "bg-[#d29922]/10 text-[#d29922] border-[#d29922]/30 shadow-[0_0_10px_rgba(210,153,34,0.1)]"
                                  : "bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30 shadow-[0_0_10px_rgba(88,166,255,0.1)]"
                            }>
                              {entry.status}
                            </Badge>
                          </div>
                          {entry.clientName && (
                            <p className="text-[#8b949e] text-sm flex items-center gap-1.5">
                              For <span className="text-[#e6edf3] font-medium">{entry.clientName}</span>
                            </p>
                          )}
                        </div>
                        
                        {entry.projectUrl && (
                          <Link
                            href={entry.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[#58a6ff] bg-[#58a6ff]/10 hover:bg-[#58a6ff]/20 px-3 py-1.5 rounded-full transition-all font-medium border border-[#58a6ff]/20 flex-shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Visit Live
                          </Link>
                        )}
                      </div>

                      {/* Description */}
                      {entry.description && (
                        <p className="text-[#c9d1d9] leading-relaxed text-[15px]">{entry.description}</p>
                      )}

                      {/* Tech Stack */}
                      {entry.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {entry.techStack.map((tech, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-[#21262d]/50 backdrop-blur-sm text-[#79c0ff] border-[#30363d] text-xs hover:bg-[#30363d] transition-colors py-1 px-3"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Testimonial */}
                    {entry.testimonial && (
                      <div className="mt-6 pt-5 border-t border-[#30363d]/50 relative">
                        <div className="absolute -top-3 left-4 bg-[#161b22] px-2">
                          <Quote className="h-4 w-4 text-[#58a6ff]/50" />
                        </div>
                        <p className="text-[#8b949e] italic text-[15px] leading-relaxed pl-2">
                          &ldquo;{entry.testimonial}&rdquo;
                        </p>
                        {entry.clientName && (
                          <p className="text-[#58a6ff] text-xs mt-2.5 pl-2 font-medium tracking-wide uppercase">— {entry.clientName}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
