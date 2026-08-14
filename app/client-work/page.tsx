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
  status: string
  testimonial: string
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
              <Card key={entry._id} className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]/40 transition-all group">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{entry.title}</h2>
                        <Badge className={
                          entry.status === 'Completed'
                            ? "bg-[#238636]/20 text-[#3fb950] border-[#238636]/30"
                            : entry.status === 'In Progress'
                              ? "bg-[#d29922]/20 text-[#d29922] border-[#d29922]/30"
                              : "bg-[#58a6ff]/20 text-[#58a6ff] border-[#58a6ff]/30"
                        }>
                          {entry.status}
                        </Badge>
                      </div>
                      {entry.projectUrl && (
                        <Link
                          href={entry.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Project
                        </Link>
                      )}
                    </div>

                    {/* Client */}
                    {entry.clientName && (
                      <p className="text-[#8b949e] text-sm">
                        Client: <span className="text-[#e6edf3] font-medium">{entry.clientName}</span>
                      </p>
                    )}

                    {/* Description */}
                    {entry.description && (
                      <p className="text-[#e6edf3] leading-relaxed">{entry.description}</p>
                    )}

                    {/* Tech Stack */}
                    {entry.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.techStack.map((tech, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs hover:bg-[#30363d] transition-colors py-1 px-2.5"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Testimonial */}
                    {entry.testimonial && (
                      <div className="border-l-2 border-[#30363d] pl-4 mt-4">
                        <div className="flex items-start gap-2">
                          <Quote className="h-4 w-4 text-[#7d8590] mt-0.5 flex-shrink-0" />
                          <p className="text-[#8b949e] italic text-sm leading-relaxed">
                            &ldquo;{entry.testimonial}&rdquo;
                          </p>
                        </div>
                        {entry.clientName && (
                          <p className="text-[#58a6ff] text-xs mt-2 ml-6">— {entry.clientName}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
