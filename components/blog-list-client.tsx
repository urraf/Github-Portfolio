"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, ArrowLeft, Calendar, Clock, ArrowRight, Search, Heart, TrendingUp, Flame, Sparkles, Eye, Terminal, Command, Code2, Zap, Hash, ChevronRight, X } from "lucide-react"

interface BlogMeta {
  id: string; title: string; slug: string; excerpt: string
  tags: string[]; publishedAt: string; published: boolean; imageUrl?: string; likes?: number; views?: number; readTime: number
}

// Tag color mapping for consistent, vibrant tag colors
const TAG_COLORS: Record<string, { bg: string; text: string; glow: string; dot: string }> = {}
const COLOR_PALETTE = [
  { bg: "rgba(0, 212, 255, 0.1)", text: "#00d4ff", glow: "rgba(0, 212, 255, 0.2)", dot: "#00d4ff" },
  { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7", glow: "rgba(168, 85, 247, 0.2)", dot: "#a855f7" },
  { bg: "rgba(0, 255, 136, 0.1)", text: "#00ff88", glow: "rgba(0, 255, 136, 0.2)", dot: "#00ff88" },
  { bg: "rgba(255, 107, 53, 0.1)", text: "#ff6b35", glow: "rgba(255, 107, 53, 0.2)", dot: "#ff6b35" },
  { bg: "rgba(255, 214, 0, 0.1)", text: "#ffd600", glow: "rgba(255, 214, 0, 0.2)", dot: "#ffd600" },
  { bg: "rgba(255, 82, 136, 0.1)", text: "#ff5288", glow: "rgba(255, 82, 136, 0.2)", dot: "#ff5288" },
  { bg: "rgba(56, 189, 248, 0.1)", text: "#38bdf8", glow: "rgba(56, 189, 248, 0.2)", dot: "#38bdf8" },
  { bg: "rgba(192, 132, 252, 0.1)", text: "#c084fc", glow: "rgba(192, 132, 252, 0.2)", dot: "#c084fc" },
]
function getTagColor(tag: string) {
  if (!TAG_COLORS[tag]) {
    const idx = Object.keys(TAG_COLORS).length % COLOR_PALETTE.length
    TAG_COLORS[tag] = COLOR_PALETTE[idx]
  }
  return TAG_COLORS[tag]
}

// Accent stripe colors for cards
const STRIPE_GRADIENTS = [
  "from-[#00d4ff] to-[#0088ff]",
  "from-[#a855f7] to-[#6d28d9]",
  "from-[#00ff88] to-[#00b35c]",
  "from-[#ff6b35] to-[#ff3d00]",
  "from-[#ffd600] to-[#ffab00]",
  "from-[#ff5288] to-[#e91e63]",
]

export default function BlogListClient({ blogs }: { blogs: BlogMeta[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(prev => !prev)
        setTimeout(() => searchRef.current?.focus(), 100)
      }
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const filteredBlogs = useMemo(() => {
    let result = blogs
    if (selectedTag) result = result.filter(b => b.tags.includes(selectedTag))
    if (searchQuery) result = result.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    return result
  }, [blogs, searchQuery, selectedTag])

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchQuery) return;
    
    const resultsCount = Math.min(8, filteredBlogs.length)
    if (resultsCount === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % resultsCount)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + resultsCount) % resultsCount)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selectedBlog = filteredBlogs[selectedIndex]
      if (selectedBlog) {
        window.location.href = `/blog/${selectedBlog.slug}`
        setSearchOpen(false)
      }
    }
  }
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // Cycle through top 4 posts every 8 seconds
  useEffect(() => {
    if (filteredBlogs.length <= 1 || searchQuery || selectedTag) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % Math.min(4, filteredBlogs.length))
    }, 8000)
    return () => clearInterval(interval)
  }, [filteredBlogs.length, searchQuery, selectedTag])

  const featuredPool = useMemo(() => filteredBlogs.slice(0, 4), [filteredBlogs])
  const featured = useMemo(() => featuredPool[featuredIndex] || filteredBlogs[0], [featuredPool, featuredIndex, filteredBlogs])
  
  const trending = useMemo(() => [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5), [blogs])
  
  const editorPicks = useMemo(() => {
    if (searchQuery || selectedTag) return filteredBlogs.slice(1, 4);
    return featuredPool.filter((_, idx) => idx !== featuredIndex)
  }, [featuredPool, featuredIndex, searchQuery, selectedTag, filteredBlogs])
  
  const latestPosts = useMemo(() => (searchQuery || selectedTag) ? filteredBlogs : filteredBlogs.slice(0, 10), [filteredBlogs, searchQuery, selectedTag])
  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {}
    blogs.forEach(b => b.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1 }))
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 15)
  }, [blogs])
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes || 0), 0)
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0)

  // ======= BLOG CARD =======
  const BlogCard = ({ blog, index = 0, size = "normal" }: { blog: BlogMeta; index?: number; size?: "normal" | "horizontal" }) => {
    const stripeColor = STRIPE_GRADIENTS[index % STRIPE_GRADIENTS.length]

    if (size === "horizontal") {
      return (
        <Link href={`/blog/${blog.slug}`} className="group block">
          <div className="flex gap-3 items-center p-2.5 rounded-xl hover:bg-[#0d1520] border border-transparent hover:border-[#1e293b] transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#1e293b] relative">
              {blog.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={blog.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0f1729] to-[#0a0e17] flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-[#1e293b]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-[#c9d1d9] group-hover:text-[#00d4ff] transition-colors line-clamp-1 leading-snug">{blog.title}</h4>
              <span className="text-[10px] text-[#3d4a5c] mt-0.5 block">{blog.readTime} min · {blog.views || 0} views · {blog.likes || 0} ♥</span>
            </div>
          </div>
        </Link>
      )
    }

    return (
      <Link href={`/blog/${blog.slug}`} className="group block h-full">
        <div className={`h-full bg-[#0c1120]/80 backdrop-blur-sm border border-[#1a2235] rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#2a3a55] hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${index * 75}ms` }}>
          {/* Accent Stripe */}
          <div className={`h-1 w-full bg-gradient-to-r ${stripeColor} opacity-80 group-hover:opacity-100 transition-opacity`} />

          {/* Image */}
          <div className="w-full h-44 relative overflow-hidden bg-[#070b14]">
            {blog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={blog.imageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0f1729] via-[#0a0e17] to-[#0c1120] flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <Code2 className="h-10 w-10 text-[#1a2235]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1120] via-transparent to-transparent opacity-80" />
            {/* Tag dots */}
            <div className="absolute bottom-3 left-4 flex gap-1.5">
              {blog.tags.slice(0, 4).map(tag => (
                <div key={tag} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTagColor(tag).dot, boxShadow: `0 0 8px ${getTagColor(tag).glow}` }} title={tag} />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-3 text-[11px] text-[#3d4a5c]">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blog.readTime} min</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{blog.likes || 0}</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{blog.views || 0}</span>
            </div>
            <h2 className="text-[15px] font-semibold text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors mb-2 leading-snug line-clamp-2">{blog.title}</h2>
            {blog.excerpt && <p className="text-[#4a5568] text-xs leading-relaxed line-clamp-2 flex-1 mb-4">{blog.excerpt}</p>}
            <div className="flex items-center justify-between pt-3 border-t border-[#1a2235]/60">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-[#1e293b]">
                  <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                  <AvatarFallback className="bg-[#0f1729] text-white text-[8px]">F</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#3d4a5c] font-mono">farhan</span>
              </div>
              <span className="text-[#00d4ff] text-xs font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">Read <ArrowRight className="h-3 w-3" /></span>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${STRIPE_GRADIENTS[index % STRIPE_GRADIENTS.length].includes('00d4ff') ? 'rgba(0,212,255,0.03)' : 'rgba(168,85,247,0.03)'}` }} />
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* ===== SEARCH MODAL ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-[#000]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl mx-4 bg-[#0c1120] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2235]">
              <Search className="h-5 w-5 text-[#3d4a5c]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search articles, tags, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 bg-transparent text-[#e2e8f0] placeholder:text-[#2a3650] outline-none text-sm font-mono"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[#3d4a5c] hover:text-white transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            {searchQuery && (
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filteredBlogs.length === 0 ? (
                  <div className="p-8 text-center text-[#3d4a5c] text-sm">No results for &quot;{searchQuery}&quot;</div>
                ) : (
                  filteredBlogs.slice(0, 8).map((blog, index) => (
                    <Link key={blog.id} href={`/blog/${blog.slug}`} onClick={() => setSearchOpen(false)} className={`group flex items-center gap-3 p-3 rounded-xl transition-colors ${index === selectedIndex ? 'bg-[#111b2e]' : 'hover:bg-[#111b2e]'}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#1e293b]">
                        {blog.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={blog.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#0f1729] flex items-center justify-center"><Code2 className="h-4 w-4 text-[#1e293b]" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#c9d1d9] group-hover:text-[#00d4ff] transition-colors truncate">{blog.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {blog.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] font-mono" style={{ color: getTagColor(t).text }}>{t}</span>)}
                          <span className="text-[10px] text-[#3d4a5c]">· {blog.readTime} min</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#1e293b] group-hover:text-[#00d4ff] transition-colors flex-shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            )}
            {!searchQuery && (
              <div className="p-4 text-center text-[#2a3650] text-xs font-mono">
                Start typing to search...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="border-b border-[#1a2235] bg-[#060a13]/95 backdrop-blur-xl px-4 py-3.5 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#3d4a5c] hover:text-[#00d4ff] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px bg-[#1a2235]" />
            <Link href="/blog" className="flex items-center gap-2 group">
              <Terminal className="h-4 w-4 text-[#00ff88]" />
              <span className="font-mono text-sm text-[#c9d1d9] group-hover:text-white transition-colors">
                <span className="text-[#00ff88]">$ </span>farhan<span className="text-[#3d4a5c]">.</span><span className="text-[#00d4ff]">blog</span>
                <span className="text-[#00ff88] animate-pulse ml-0.5">▊</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100) }}
              className="hidden sm:flex items-center gap-3 bg-[#0c1120] border border-[#1a2235] rounded-xl py-2 pl-4 pr-3 text-sm text-[#3d4a5c] hover:border-[#2a3a55] hover:text-[#8892a4] transition-all group cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">Search...</span>
              <kbd className="ml-4 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#0a0e17] border border-[#1e293b] text-[10px] font-mono text-[#3d4a5c]">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <button onClick={() => { setSearchOpen(true) }} className="sm:hidden text-[#3d4a5c] hover:text-white transition-colors p-1">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/" className="text-xs text-[#3d4a5c] hover:text-[#00d4ff] transition-colors hidden sm:block font-mono">~/portfolio</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 sm:py-12 relative z-10">

        {/* Active filter indicator */}
        {(selectedTag || searchQuery) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[#3d4a5c] font-mono">Filtering by:</span>
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all" style={{ borderColor: getTagColor(selectedTag).text + '40', color: getTagColor(selectedTag).text, background: getTagColor(selectedTag).bg }}>
                <Hash className="h-3 w-3" />{selectedTag}
                <X className="h-3 w-3 ml-1 opacity-60" />
              </button>
            )}
            {searchQuery && !searchOpen && (
              <button onClick={() => setSearchQuery("")} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c1120] border border-[#1e293b] text-[#8892a4] text-xs font-mono">
                &quot;{searchQuery}&quot;
                <X className="h-3 w-3 ml-1 opacity-60" />
              </button>
            )}
            <span className="text-[10px] text-[#2a3650] font-mono ml-1">{filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00d4ff]/5 rounded-full blur-3xl" />
              <BookOpen className="h-16 w-16 text-[#1a2235] relative" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#c9d1d9] mb-2 font-mono">{searchQuery || selectedTag ? "No matches found" : "No posts yet"}</h3>
              <p className="text-[#3d4a5c] max-w-sm mx-auto text-sm">{searchQuery || selectedTag ? "Try a different search or tag." : "Stay tuned — articles are coming soon."}</p>
            </div>
          </div>
        ) : (searchQuery || selectedTag) && !searchOpen ? (
          /* Filtered Results Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, i) => <BlogCard key={blog.id} blog={blog} index={i} />)}
          </div>
        ) : (
          /* ===== FULL MAGAZINE LAYOUT ===== */
          <div className="space-y-16">

            {/* ====== HERO / FEATURED ====== */}
            {featured && (
              <section className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Link href={`/blog/${featured.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden border border-[#1a2235] hover:border-[#2a3a55] transition-all duration-700 shadow-2xl shadow-black/30">
                    {/* Background */}
                    <div className="relative h-[300px] sm:h-[380px] md:h-[440px]">
                      {featured.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featured.imageUrl} alt={featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1638] via-[#15103a] to-[#0a1628]">
                          {/* Mesh gradient effect */}
                          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
                          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #00d4ff, transparent 70%)' }} />
                          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/50 to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-14">
                      <div className="flex items-center gap-3 mb-5">
                        <Badge className="bg-[#ff5288]/10 text-[#ff5288] border-[#ff5288]/20 text-xs px-3 py-1.5 shadow-lg backdrop-blur-sm font-mono">
                          <Flame className="h-3 w-3 mr-1.5" />featured
                        </Badge>
                        {featured.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} className="backdrop-blur-sm text-xs px-2.5 py-1 font-mono border" style={{ backgroundColor: getTagColor(tag).bg, color: getTagColor(tag).text, borderColor: getTagColor(tag).text + '30' }}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white group-hover:text-[#00d4ff] transition-colors mb-4 leading-[1.15] max-w-4xl tracking-tight">
                        {featured.title}
                      </h1>
                      {featured.excerpt && (
                        <p className="text-[#7a8599] text-sm sm:text-base leading-relaxed mb-6 max-w-2xl line-clamp-2">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border-2 border-[#1e293b] ring-2 ring-[#0a0e17]">
                            <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                            <AvatarFallback className="bg-[#0f1729] text-white text-xs">F</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-white text-sm font-medium">Farhan</span>
                            <p className="text-[#3d4a5c] text-[10px] font-mono">@farhan</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#4a5568] flex items-center gap-1.5 font-mono"><Calendar className="h-3.5 w-3.5" />{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-xs text-[#4a5568] flex items-center gap-1.5 font-mono"><Clock className="h-3.5 w-3.5" />{featured.readTime} min</span>
                        <span className="text-xs text-[#4a5568] flex items-center gap-1.5 font-mono"><Heart className="h-3.5 w-3.5" />{featured.likes || 0}</span>
                        <span className="text-xs text-[#4a5568] flex items-center gap-1.5 font-mono"><Eye className="h-3.5 w-3.5" />{featured.views || 0}</span>
                        <span className="ml-auto text-[#00d4ff] text-sm font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 hidden sm:flex font-mono">
                          read() <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* ====== EDITOR'S PICKS ====== */}
            {editorPicks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#ffd600]" />
                    <h2 className="text-lg font-semibold text-[#e2e8f0] font-mono">
                      <span className="text-[#ffd600]">*</span> editor_picks
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#1a2235] to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {editorPicks.map((blog, i) => <BlogCard key={blog.id} blog={blog} index={i} />)}
                </div>
              </section>
            )}

            {/* ====== MAIN CONTENT + SIDEBAR ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">

              {/* Left: Latest Articles */}
              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#00d4ff]" />
                      <h2 className="text-lg font-semibold text-[#e2e8f0] font-mono">
                        latest<span className="text-[#3d4a5c]">()</span>
                      </h2>
                      <span className="font-mono text-xs text-[#3d4a5c] bg-[#0c1120] px-2 py-0.5 rounded-md border border-[#1a2235]">{latestPosts.length}</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1a2235] to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {latestPosts.map((blog, i) => <BlogCard key={blog.id} blog={blog} index={i + 3} />)}
                  </div>
                </section>
              </div>

              {/* Right: Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">

                {/* Author Card */}
                <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1a2235] rounded-2xl overflow-hidden">
                  <div className="h-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/20 via-[#a855f7]/20 to-[#00ff88]/20" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  </div>
                  <div className="px-5 pb-5 -mt-8 text-center">
                    <Avatar className="h-14 w-14 mx-auto border-4 border-[#0c1120] shadow-xl mb-3 ring-2 ring-[#1a2235]">
                      <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                      <AvatarFallback className="bg-[#0f1729] text-white">F</AvatarFallback>
                    </Avatar>
                    <h3 className="text-[#e2e8f0] font-bold text-sm">Farhan</h3>
                    <p className="text-[#3d4a5c] text-[11px] mt-0.5 font-mono">Software Engineer</p>
                    <p className="text-[#4a5568] text-[11px] mt-2 leading-relaxed">Deep dives into distributed systems, backend engineering, and building at scale.</p>
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#1a2235]">
                      <div className="text-center">
                        <p className="text-[#00d4ff] font-bold text-lg font-mono">{blogs.length}</p>
                        <p className="text-[#2a3650] text-[10px] font-mono">posts</p>
                      </div>
                      <div className="w-px h-8 bg-[#1a2235]" />
                      <div className="text-center">
                        <p className="text-[#ff5288] font-bold text-lg font-mono">{totalLikes}</p>
                        <p className="text-[#2a3650] text-[10px] font-mono">likes</p>
                      </div>
                      <div className="w-px h-8 bg-[#1a2235]" />
                      <div className="text-center">
                        <p className="text-[#ff6b35] font-bold text-lg font-mono">{totalViews}</p>
                        <p className="text-[#2a3650] text-[10px] font-mono">views</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending */}
                <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1a2235] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-[#00ff88]" />
                    <h3 className="text-[#e2e8f0] font-semibold text-sm font-mono">trending<span className="text-[#3d4a5c]">()</span></h3>
                  </div>
                  <div className="space-y-0.5">
                    {trending.map((blog, i) => (
                      <Link key={blog.id} href={`/blog/${blog.slug}`} className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#0d1520] transition-colors">
                        <span className="text-xl font-extrabold text-[#1a2235] group-hover:text-[#00ff88] transition-colors w-7 flex-shrink-0 leading-none mt-0.5 font-mono">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-[#c9d1d9] group-hover:text-[#00d4ff] transition-colors line-clamp-2 leading-snug">{blog.title}</h4>
                          <span className="text-[10px] text-[#2a3650] flex items-center gap-1 mt-1 font-mono">
                            <Heart className="h-2.5 w-2.5" />{blog.likes || 0}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1a2235] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="h-4 w-4 text-[#a855f7]" />
                    <h3 className="text-[#e2e8f0] font-semibold text-sm font-mono">topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(([tag, count]) => {
                      const color = getTagColor(tag)
                      const isActive = selectedTag === tag
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(isActive ? null : tag)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all duration-300 cursor-pointer ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                          style={{
                            backgroundColor: isActive ? color.bg : 'transparent',
                            borderColor: isActive ? color.text + '50' : '#1a2235',
                            color: isActive ? color.text : '#4a5568'
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                          {tag}
                          <span className="text-[9px] opacity-60">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Reads */}
                <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1a2235] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-[#ff6b35]" />
                    <h3 className="text-[#e2e8f0] font-semibold text-sm font-mono">quick_reads</h3>
                  </div>
                  <div className="space-y-0.5">
                    {blogs.filter(b => b.readTime <= 5).slice(0, 4).map(blog => (
                      <BlogCard key={blog.id} blog={blog} size="horizontal" />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1a2235] bg-[#060a13] px-4 py-10 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#00ff88]" />
              <span className="text-[#2a3650] text-sm font-mono">farhan.blog</span>
            </div>
            <p className="text-[#1e293b] text-xs font-mono">// crafted with care • {new Date().getFullYear()}</p>
            <div className="flex items-center gap-4 text-xs font-mono">
              <Link href="/" className="text-[#2a3650] hover:text-[#00d4ff] transition-colors">~/portfolio</Link>
              <Link href="/blog" className="text-[#2a3650] hover:text-[#00d4ff] transition-colors">~/blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
