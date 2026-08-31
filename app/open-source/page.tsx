"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, GitPullRequest, GitMerge, Bug, Star, BookOpen, FileText, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Contribution {
  _id: string
  projectName: string
  repoUrl: string
  prUrl: string
  description: string
  contributionType: string
  status: string
  techStack: string[]
  stars: number
  createdAt: string
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'Pull Request': return <GitPullRequest className="h-3.5 w-3.5" />
    case 'Bug Fix': return <Bug className="h-3.5 w-3.5" />
    case 'Feature': return <Star className="h-3.5 w-3.5" />
    case 'Documentation': return <BookOpen className="h-3.5 w-3.5" />
    case 'Issue': return <FileText className="h-3.5 w-3.5" />
    default: return <GitPullRequest className="h-3.5 w-3.5" />
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'Merged': return {
      badge: 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/40',
      glow: 'shadow-[0_0_15px_rgba(46,160,67,0.15)]',
      icon: <GitMerge className="h-3.5 w-3.5" />,
    }
    case 'Open': return {
      badge: 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40',
      glow: 'shadow-[0_0_15px_rgba(210,153,34,0.15)]',
      icon: <GitPullRequest className="h-3.5 w-3.5" />,
    }
    case 'Closed': return {
      badge: 'bg-[#f85149]/15 text-[#f85149] border-[#f85149]/40',
      glow: 'shadow-[0_0_15px_rgba(248,81,73,0.15)]',
      icon: null,
    }
    default: return {
      badge: 'bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/40',
      glow: '',
      icon: null,
    }
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Pull Request': return 'bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30'
    case 'Bug Fix': return 'bg-[#f85149]/15 text-[#ff7b72] border-[#f85149]/30'
    case 'Feature': return 'bg-[#58a6ff]/15 text-[#79c0ff] border-[#58a6ff]/30'
    case 'Documentation': return 'bg-[#d29922]/15 text-[#e3b341] border-[#d29922]/30'
    case 'Issue': return 'bg-[#8b949e]/15 text-[#c9d1d9] border-[#8b949e]/30'
    default: return 'bg-[#21262d] text-[#e6edf3] border-[#30363d]'
  }
}

export default function OpenSourcePublicPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All")

  useEffect(() => {
    fetch("/api/open-source")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setContributions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = contributions.filter(c => {
    const matchesSearch = c.projectName.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.techStack.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesType = filterType === "All" || c.contributionType === filterType
    return matchesSearch && matchesType
  })

  const mergedCount = contributions.filter(c => c.status === 'Merged').length
  const uniqueRepos = new Set(contributions.map(c => c.projectName)).size
  const totalStars = contributions.reduce((sum, c) => sum + (c.stars || 0), 0)

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#238636]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Link href="/" className="inline-flex items-center text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Link>

          {/* Hero Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#238636] via-[#2ea043] to-[#3fb950] flex items-center justify-center shadow-lg shadow-[#238636]/20">
                <GitMerge className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Open Source
                  <span className="bg-gradient-to-r from-[#3fb950] to-[#58a6ff] bg-clip-text text-transparent"> Contributions</span>
                </h1>
                <p className="text-[#8b949e] mt-0.5">Pull requests, bug fixes, and features contributed to the community.</p>
              </div>
            </div>

            {/* Stats Bar */}
            {contributions.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5">
                  <GitPullRequest className="h-4 w-4 text-[#8b5cf6]" />
                  <span className="text-white font-bold">{contributions.length}</span>
                  <span className="text-[#7d8590] text-sm">Contributions</span>
                </div>
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5">
                  <GitMerge className="h-4 w-4 text-[#3fb950]" />
                  <span className="text-white font-bold">{mergedCount}</span>
                  <span className="text-[#7d8590] text-sm">Merged</span>
                </div>
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5">
                  <BookOpen className="h-4 w-4 text-[#58a6ff]" />
                  <span className="text-white font-bold">{uniqueRepos}</span>
                  <span className="text-[#7d8590] text-sm">Repos</span>
                </div>
                {totalStars > 0 && (
                  <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5">
                    <Star className="h-4 w-4 text-[#d29922] fill-[#d29922]" />
                    <span className="text-white font-bold">{totalStars >= 1000 ? `${(totalStars / 1000).toFixed(0)}k+` : totalStars}</span>
                    <span className="text-[#7d8590] text-sm">Combined Stars</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
              <Input
                placeholder="Search contributions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-[#161b22] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590] pointer-events-none z-10" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-md border border-[#30363d] bg-[#161b22] text-white text-sm focus:ring-1 focus:ring-[#58a6ff] outline-none appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="All">All Types</option>
                <option value="Pull Request">Pull Requests</option>
                <option value="Bug Fix">Bug Fixes</option>
                <option value="Feature">Features</option>
                <option value="Documentation">Documentation</option>
                <option value="Issue">Issues</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-2 border-[#3fb950]/30 border-t-[#3fb950] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardContent className="p-12 text-center">
                <GitMerge className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No contributions found</h3>
                <p className="text-[#7d8590]">{search || filterType !== "All" ? "Try a different search or filter." : "Open source contributions will appear here."}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((contribution) => {
                const statusStyles = getStatusStyles(contribution.status)
                return (
                  <Card
                    key={contribution._id}
                    className={`bg-[#161b22] border-[#30363d] hover:border-[#3fb950]/30 transition-all duration-300 group overflow-hidden hover:-translate-y-0.5 ${statusStyles.glow}`}
                  >
                    {/* Top accent line */}
                    <div className={`h-[2px] w-full ${
                      contribution.status === 'Merged' ? 'bg-gradient-to-r from-transparent via-[#3fb950]/60 to-transparent' :
                      contribution.status === 'Open' ? 'bg-gradient-to-r from-transparent via-[#d29922]/60 to-transparent' :
                      'bg-gradient-to-r from-transparent via-[#f85149]/60 to-transparent'
                    }`} />

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-white group-hover:text-[#3fb950] transition-colors">
                              {contribution.projectName}
                            </h2>
                            {contribution.stars > 0 && (
                              <span className="flex items-center gap-1 text-[#d29922] text-xs font-medium bg-[#d29922]/10 px-2 py-0.5 rounded-full border border-[#d29922]/20">
                                <Star className="h-3 w-3 fill-[#d29922]" />
                                {contribution.stars >= 1000 ? `${(contribution.stars / 1000).toFixed(1)}k` : contribution.stars}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusStyles.badge} text-xs gap-1`}>
                              {statusStyles.icon}
                              {contribution.status}
                            </Badge>
                            <Badge className={`${getTypeColor(contribution.contributionType)} text-xs gap-1`}>
                              {getTypeIcon(contribution.contributionType)}
                              {contribution.contributionType}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        {contribution.description && (
                          <p className="text-[#c9d1d9] leading-relaxed text-[15px]">{contribution.description}</p>
                        )}

                        {/* Tech Stack */}
                        {contribution.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {contribution.techStack.map((tech, i) => (
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

                        {/* Links */}
                        {(contribution.repoUrl || contribution.prUrl) && (
                          <div className="flex gap-4 pt-1">
                            {contribution.repoUrl && (
                              <a
                                href={contribution.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#58a6ff] hover:text-[#79c0ff] transition-colors group/link"
                              >
                                <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                View Repository
                              </a>
                            )}
                            {contribution.prUrl && (
                              <a
                                href={contribution.prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors group/link"
                              >
                                <GitPullRequest className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                View PR/Issue
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
