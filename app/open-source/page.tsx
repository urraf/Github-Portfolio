"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, GitPullRequest, GitMerge, Bug, Star, BookOpen, FileText, Search, Filter, Activity, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GitHubCalendar } from 'react-github-calendar'

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
    case 'Package': return <Package className="h-3.5 w-3.5" />
    case 'Bug Fix': return <Bug className="h-3.5 w-3.5" />
    case 'Feature': return <Star className="h-3.5 w-3.5" />
    case 'Documentation': return <BookOpen className="h-3.5 w-3.5" />
    case 'Issue': return <FileText className="h-3.5 w-3.5" />
    default: return <GitPullRequest className="h-3.5 w-3.5" />
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'Published': return {
      badge: 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/40', // Cyan color
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
      icon: <Package className="h-3.5 w-3.5" />,
      timelineDot: 'border-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.8)]'
    }
    case 'Merged': return {
      badge: 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/40',
      glow: 'shadow-[0_0_20px_rgba(46,160,67,0.15)] hover:shadow-[0_0_30px_rgba(46,160,67,0.3)]',
      icon: <GitMerge className="h-3.5 w-3.5" />,
      timelineDot: 'border-[#3fb950] shadow-[0_0_10px_rgba(46,160,67,0.8)]'
    }
    case 'Open': return {
      badge: 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40',
      glow: 'shadow-[0_0_20px_rgba(210,153,34,0.15)] hover:shadow-[0_0_30px_rgba(210,153,34,0.3)]',
      icon: <GitPullRequest className="h-3.5 w-3.5" />,
      timelineDot: 'border-[#d29922] shadow-[0_0_10px_rgba(210,153,34,0.8)]'
    }
    case 'Closed': return {
      badge: 'bg-[#f85149]/15 text-[#f85149] border-[#f85149]/40',
      glow: 'shadow-[0_0_20px_rgba(248,81,73,0.15)] hover:shadow-[0_0_30px_rgba(248,81,73,0.3)]',
      icon: null,
      timelineDot: 'border-[#f85149] shadow-[0_0_10px_rgba(248,81,73,0.8)]'
    }
    default: return {
      badge: 'bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/40',
      glow: '',
      icon: null,
      timelineDot: 'border-[#58a6ff]'
    }
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Pull Request': return 'bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30'
    case 'Package': return 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/30'
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
  const [githubUsername, setGithubUsername] = useState("urraf") // Default

  useEffect(() => {
    // Fetch stats to get correct github username if needed, but we'll stick to urraf or fetch from portfolio
    fetch("/api/live-stats")
      .then(res => res.json())
      .then(data => {
         // Assuming live-stats might expose it, but we can just use "urraf" for now.
         // Let's rely on urraf directly, or check if it's available.
      })
      .catch(console.error)

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

  // Group contributions by year
  const groupedContributions = filtered.reduce((acc, c) => {
    const year = new Date(c.createdAt).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(c)
    return acc
  }, {} as Record<string, Contribution[]>)

  const years = Object.keys(groupedContributions).sort((a, b) => parseInt(b) - parseInt(a))

  const mergedCount = contributions.filter(c => c.status === 'Merged').length
  const uniqueRepos = new Set(contributions.map(c => c.projectName)).size
  const totalStars = contributions.reduce((sum, c) => sum + (c.stars || 0), 0)

  // Custom theme for GitHub Calendar to match the portfolio greens
  const customTheme = {
    light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#238636]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <Link href="/" className="inline-flex items-center text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Link>

          {/* Hero Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#238636] via-[#2ea043] to-[#3fb950] flex items-center justify-center shadow-[0_0_20px_rgba(46,160,67,0.3)] border border-[#3fb950]/50">
                <GitMerge className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Open Source
                  <span className="bg-gradient-to-r from-[#3fb950] to-[#58a6ff] bg-clip-text text-transparent"> Contributions</span>
                </h1>
                <p className="text-[#8b949e] mt-1.5 text-lg">Pull requests, bug fixes, and features contributed to the community.</p>
              </div>
            </div>

            {/* Stats Bar */}
            {contributions.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 shadow-lg shadow-black/20">
                  <GitPullRequest className="h-4 w-4 text-[#8b5cf6]" />
                  <span className="text-white font-bold">{contributions.length}</span>
                  <span className="text-[#7d8590] text-sm">Contributions</span>
                </div>
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 shadow-lg shadow-black/20">
                  <GitMerge className="h-4 w-4 text-[#3fb950]" />
                  <span className="text-white font-bold">{mergedCount}</span>
                  <span className="text-[#7d8590] text-sm">Merged</span>
                </div>
                <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 shadow-lg shadow-black/20">
                  <BookOpen className="h-4 w-4 text-[#58a6ff]" />
                  <span className="text-white font-bold">{uniqueRepos}</span>
                  <span className="text-[#7d8590] text-sm">Repos</span>
                </div>
                {totalStars > 0 && (
                  <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 shadow-lg shadow-black/20">
                    <Star className="h-4 w-4 text-[#d29922] fill-[#d29922]" />
                    <span className="text-white font-bold">{totalStars >= 1000 ? `${(totalStars / 1000).toFixed(0)}k+` : totalStars}</span>
                    <span className="text-[#7d8590] text-sm">Combined Stars</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GitHub Activity Graph Section */}
          <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-2xl p-6 md:p-8 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-[#3fb950]" />
              <h2 className="text-xl font-bold text-white">GitHub Activity</h2>
            </div>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="min-w-[800px]">
                <GitHubCalendar 
                  username={githubUsername} 
                  theme={customTheme}
                  colorScheme="dark"
                  blockSize={14}
                  blockMargin={4}
                  fontSize={14}
                />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590] group-focus-within:text-[#58a6ff] transition-colors" />
              <Input
                placeholder="Search contributions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 h-12 bg-[#161b22] border-[#30363d] text-white focus-visible:ring-1 focus-visible:ring-[#58a6ff] rounded-xl text-base shadow-inner shadow-black/20"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590] pointer-events-none z-10" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="h-12 pl-11 pr-8 rounded-xl border border-[#30363d] bg-[#161b22] text-white text-base focus:ring-1 focus:ring-[#58a6ff] outline-none appearance-none cursor-pointer min-w-[200px] shadow-inner shadow-black/20"
              >
                <option value="All">All Types</option>
                <option value="Pull Request">Pull Requests</option>
                <option value="Package">Packages</option>
                <option value="Bug Fix">Bug Fixes</option>
                <option value="Feature">Features</option>
                <option value="Documentation">Documentation</option>
                <option value="Issue">Issues</option>
              </select>
            </div>
          </div>

          {/* Timeline Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-2 border-[#3fb950]/30 border-t-[#3fb950] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-[#161b22] border-[#30363d] shadow-2xl shadow-black/20">
              <CardContent className="p-16 text-center">
                <GitMerge className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No contributions found</h3>
                <p className="text-[#7d8590]">{search || filterType !== "All" ? "Try a different search or filter." : "Open source contributions will appear here."}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative pt-8 pb-12">
              {/* Vertical Glowing Line */}
              <div className="absolute left-[23px] sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#30363d] via-[#30363d]/50 to-transparent sm:-translate-x-1/2 z-0" />

              <div className="space-y-16 relative z-10">
                {years.map(year => (
                  <div key={year} className="relative">
                    {/* Year Badge */}
                    <div className="flex justify-start sm:justify-center mb-10 sticky top-24 z-20 pointer-events-none">
                      <div className="bg-[#161b22] border border-[#30363d] text-white font-bold px-6 py-2 rounded-full shadow-xl shadow-black/40 shadow-[0_0_15px_rgba(88,166,255,0.1)] text-lg pointer-events-auto">
                        {year}
                      </div>
                    </div>

                    <div className="space-y-8">
                      {groupedContributions[year].map((contribution, index) => {
                        const statusStyles = getStatusStyles(contribution.status)
                        const isEven = index % 2 === 0
                        
                        return (
                          <div key={contribution._id} className={`relative flex flex-col sm:flex-row items-start ${isEven ? 'sm:flex-row-reverse' : ''} gap-8 group`}>
                            
                            {/* Glowing Timeline Node */}
                            <div className="absolute left-[19px] sm:left-1/2 w-3 h-3 bg-[#0d1117] border-2 rounded-full z-10 sm:-translate-x-1/2 mt-6 transition-all duration-300 group-hover:scale-150 group-hover:bg-white" 
                                 style={{ borderColor: contribution.status === 'Published' ? '#06b6d4' : contribution.status === 'Merged' ? '#3fb950' : contribution.status === 'Open' ? '#d29922' : '#f85149' }} />
                            
                            {/* Invisible spacer for the other side */}
                            <div className="hidden sm:block sm:w-1/2" />
                            
                            {/* Content Card */}
                            <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${isEven ? 'sm:pr-10' : 'sm:pl-10'}`}>
                              <Card
                                className={`bg-[#161b22]/90 backdrop-blur-md border-[#30363d] transition-all duration-500 overflow-hidden ${statusStyles.glow} hover:-translate-y-2 hover:bg-[#161b22] relative`}
                              >
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-[2px] w-full ${
                                  contribution.status === 'Published' ? 'bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-70' :
                                  contribution.status === 'Merged' ? 'bg-gradient-to-r from-transparent via-[#3fb950] to-transparent opacity-70' :
                                  contribution.status === 'Open' ? 'bg-gradient-to-r from-transparent via-[#d29922] to-transparent opacity-70' :
                                  'bg-gradient-to-r from-transparent via-[#f85149] to-transparent opacity-70'
                                }`} />

                                <CardContent className="p-6 sm:p-7">
                                  <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-3">
                                          <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#3fb950] transition-colors">
                                            {contribution.projectName}
                                          </h2>
                                          {contribution.stars > 0 && (
                                            <span className="flex items-center gap-1 text-[#d29922] text-xs font-medium bg-[#d29922]/10 px-2 py-0.5 rounded-full border border-[#d29922]/20">
                                              <Star className="h-3 w-3 fill-[#d29922]" />
                                              {contribution.stars >= 1000 ? `${(contribution.stars / 1000).toFixed(1)}k` : contribution.stars}
                                            </span>
                                          )}
                                        </div>
                                        <Badge className={`${statusStyles.badge} text-[11px] uppercase tracking-wider font-bold gap-1`}>
                                          {statusStyles.icon}
                                          {contribution.status}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Badge className={`${getTypeColor(contribution.contributionType)} text-xs gap-1`}>
                                          {getTypeIcon(contribution.contributionType)}
                                          {contribution.contributionType}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    {contribution.description && (
                                      <p className="text-[#c9d1d9] leading-relaxed text-[15px] sm:text-base">{contribution.description}</p>
                                    )}

                                    {/* Tech Stack */}
                                    {contribution.techStack.length > 0 && (
                                      <div className="flex flex-wrap gap-2 pt-2">
                                        {contribution.techStack.map((tech, i) => (
                                          <Badge
                                            key={i}
                                            variant="secondary"
                                            className="bg-[#21262d]/80 text-[#79c0ff] border-[#30363d] text-xs hover:bg-[#30363d] transition-colors py-1 px-3 shadow-sm shadow-black/20"
                                          >
                                            {tech}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Links */}
                                    {(contribution.repoUrl || contribution.prUrl) && (
                                      <div className="flex flex-wrap gap-4 pt-4 border-t border-[#30363d]/50 mt-2">
                                        {contribution.repoUrl && (
                                          <a
                                            href={contribution.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-[#58a6ff] hover:text-[#79c0ff] transition-colors group/link font-medium"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            Repository
                                          </a>
                                        )}
                                        {contribution.prUrl && (
                                          <a
                                            href={contribution.prUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors group/link font-medium"
                                          >
                                            <GitPullRequest className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            PR / Issue
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Global styles for custom scrollbar in calendar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(48, 54, 61, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(88, 166, 255, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 166, 255, 0.7);
        }
      `}} />
    </div>
  )
}
