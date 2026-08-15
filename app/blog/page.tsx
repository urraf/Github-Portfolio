"use client"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, ArrowLeft, Calendar, Clock, ArrowRight, Search, Heart, TrendingUp, Flame, Sparkles, ChevronRight, Eye } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"

interface Blog {
  id: string; title: string; slug: string; content: string; excerpt: string
  tags: string[]; publishedAt: string; published: boolean; imageUrl?: string; likes?: number
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/api/admin/blogs?public=true")
      .then(r => r.json())
      .then(b => { setBlogs(b); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Derived blog sections
  const featured = useMemo(() => filteredBlogs[0], [filteredBlogs])
  const trending = useMemo(() => [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5), [blogs])
  const editorPicks = useMemo(() => filteredBlogs.slice(1, 4), [filteredBlogs])
  const latestPosts = useMemo(() => searchQuery ? filteredBlogs : filteredBlogs.slice(4), [filteredBlogs, searchQuery])
  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {}
    blogs.forEach(b => b.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1 }))
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 15)
  }, [blogs])

  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes || 0), 0)

  // Blog card component
  const BlogCard = ({ blog, size = "normal" }: { blog: Blog; size?: "normal" | "small" | "horizontal" }) => {
    if (size === "horizontal") {
      return (
        <Link href={`/blog/${blog.slug}`} className="group">
          <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-[#161b22] transition-colors">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-[#30363d]">
              {blog.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#21262d] to-[#0d1117] flex items-center justify-center"><BookOpen className="h-5 w-5 text-[#30363d]" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors line-clamp-2 leading-snug">{blog.title}</h4>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[#484f58]">
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{estimateReadTime(blog.content)} min</span>
                <span className="flex items-center gap-1"><Heart className="h-2.5 w-2.5" />{blog.likes || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      )
    }

    return (
      <Link href={`/blog/${blog.slug}`} className="h-full group">
        <Card className="bg-[#161b22]/80 backdrop-blur-sm border-[#30363d] hover:border-[#58a6ff]/40 transition-all duration-500 cursor-pointer h-full flex flex-col overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#58a6ff]/5">
          <div className="w-full h-48 relative overflow-hidden bg-[#0d1117]">
            {blog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={blog.imageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#21262d] to-[#0d1117] flex items-center justify-center"><BookOpen className="h-12 w-12 text-[#30363d]" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-60" />
            {blog.tags[0] && (
              <Badge className="absolute top-3 left-3 bg-[#0d1117]/80 backdrop-blur-sm text-[#58a6ff] border-[#58a6ff]/20 text-[10px]">
                {blog.tags[0]}
              </Badge>
            )}
          </div>
          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-3 text-[11px] text-[#7d8590]">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{estimateReadTime(blog.content)} min</span>
              <span className="flex items-center gap-1 ml-auto"><Heart className="h-3 w-3" />{blog.likes || 0}</span>
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-[#58a6ff] transition-colors mb-2 leading-snug line-clamp-2">{blog.title}</h2>
            {blog.excerpt && <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2 flex-1">{blog.excerpt}</p>}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363d]/40">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-[#30363d]">
                  <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                  <AvatarFallback className="bg-[#21262d] text-white text-[8px]">F</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#7d8590]">Farhan</span>
              </div>
              <span className="text-[#58a6ff] text-xs font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">Read <ArrowRight className="h-3 w-3" /></span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3] relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#010409]/95 backdrop-blur-md px-4 py-3 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#7d8590] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px bg-[#30363d]" />
            <Link href="/blog" className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-[#30363d]">
                <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                <AvatarFallback className="bg-[#21262d] text-white text-xs">F</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-white font-semibold text-sm">Tech Blog</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#484f58]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] w-48 focus:w-72 transition-all"
              />
            </div>
            <Link href="/" className="text-xs text-[#7d8590] hover:text-white transition-colors hidden sm:block">Portfolio</Link>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 py-3 border-b border-[#21262d] bg-[#010409]/80 backdrop-blur-sm relative z-40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58]" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-all"
          />
        </div>
      </div>

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 sm:py-12 relative z-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-12 w-12 border-4 border-[#58a6ff]/20 border-t-[#58a6ff] rounded-full animate-spin" />
            <p className="text-[#484f58] text-sm animate-pulse">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d] shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-16 text-center">
              <BookOpen className="h-16 w-16 text-[#21262d] mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">{searchQuery ? "No matching articles" : "No posts yet"}</h3>
              <p className="text-[#7d8590] max-w-sm mx-auto">{searchQuery ? "Try a different search term." : "Stay tuned! Articles coming soon."}</p>
            </CardContent>
          </Card>
        ) : searchQuery ? (
          /* Search Results Mode */
          <div>
            <p className="text-[#7d8590] mb-6 text-sm">{filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>
          </div>
        ) : (
          /* Full Magazine Layout */
          <div className="space-y-16">

            {/* ====== HERO SECTION ====== */}
            {featured && (
              <section>
                <Link href={`/blog/${featured.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden border border-[#30363d] hover:border-[#58a6ff]/40 transition-all duration-500 shadow-2xl hover:shadow-[#58a6ff]/10">
                    <div className="relative h-[320px] sm:h-[420px] md:h-[480px]">
                      {featured.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featured.imageUrl} alt={featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] to-[#0d1117]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-14">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-[#da3633]/20 text-[#ff7b72] border-[#da3633]/30 text-xs px-3 py-1 shadow-lg backdrop-blur-sm">
                          <Flame className="h-3 w-3 mr-1.5" />Featured
                        </Badge>
                        <span className="text-xs text-[#8b949e]">{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white group-hover:text-[#58a6ff] transition-colors mb-4 leading-tight max-w-4xl">
                        {featured.title}
                      </h1>
                      {featured.excerpt && (
                        <p className="text-[#8b949e] text-sm sm:text-base leading-relaxed mb-6 max-w-2xl line-clamp-2">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border-2 border-[#30363d]">
                            <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                            <AvatarFallback>F</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-white text-sm font-medium">Farhan</span>
                            <p className="text-[#484f58] text-[10px]">Software Engineer</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#7d8590] flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{estimateReadTime(featured.content)} min read</span>
                        <span className="text-xs text-[#7d8590] flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{featured.likes || 0} likes</span>
                        <span className="ml-auto text-[#58a6ff] text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 hidden sm:flex">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* ====== EDITOR'S PICKS (3 cards in a row) ====== */}
            {editorPicks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2 text-[#f0883e]">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="text-xl font-bold text-white">Editor&apos;s Picks</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#30363d] to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {editorPicks.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                </div>
              </section>
            )}

            {/* ====== MAIN CONTENT + SIDEBAR ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Left: Latest Articles */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#58a6ff] rounded-full" />
                      <h2 className="text-xl font-bold text-white">Latest Articles</h2>
                      <Badge className="bg-[#161b22] text-[#7d8590] border-[#30363d] text-xs">{latestPosts.length}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {latestPosts.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                  </div>
                </section>
              </div>

              {/* Right: Sidebar */}
              <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">

                {/* About the Blog */}
                <Card className="bg-[#161b22]/80 backdrop-blur-sm border-[#30363d] overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-[#1f6feb] via-[#58a6ff] to-[#79c0ff] opacity-30" />
                  <CardContent className="p-5 -mt-10 text-center">
                    <Avatar className="h-16 w-16 mx-auto border-4 border-[#161b22] shadow-xl mb-3">
                      <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                      <AvatarFallback className="bg-[#21262d] text-white">F</AvatarFallback>
                    </Avatar>
                    <h3 className="text-white font-bold">Farhan&apos;s Tech Blog</h3>
                    <p className="text-[#7d8590] text-xs mt-1 leading-relaxed">Deep dives into software engineering, AI, system design, and career growth.</p>
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#30363d]">
                      <div className="text-center">
                        <p className="text-white font-bold text-lg">{blogs.length}</p>
                        <p className="text-[#484f58] text-[10px]">Articles</p>
                      </div>
                      <div className="w-px h-8 bg-[#30363d]" />
                      <div className="text-center">
                        <p className="text-white font-bold text-lg">{totalLikes}</p>
                        <p className="text-[#484f58] text-[10px]">Likes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Posts */}
                <Card className="bg-[#161b22]/80 backdrop-blur-sm border-[#30363d]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-[#3fb950]" />
                      <h3 className="text-white font-bold text-sm">Trending</h3>
                    </div>
                    <div className="space-y-1">
                      {trending.map((blog, i) => (
                        <Link key={blog.id} href={`/blog/${blog.slug}`} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#21262d] transition-colors">
                          <span className="text-2xl font-extrabold text-[#30363d] group-hover:text-[#58a6ff] transition-colors w-7 flex-shrink-0 leading-none mt-0.5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors line-clamp-2 leading-snug">{blog.title}</h4>
                            <span className="text-[10px] text-[#484f58] flex items-center gap-1 mt-1">
                              <Heart className="h-2.5 w-2.5" />{blog.likes || 0} likes
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Topics Cloud */}
                <Card className="bg-[#161b22]/80 backdrop-blur-sm border-[#30363d]">
                  <CardContent className="p-5">
                    <h3 className="text-white font-bold text-sm mb-4">Explore Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(([tag, count]) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0d1117] border border-[#30363d] text-[#8b949e] text-[11px] hover:border-[#58a6ff]/40 hover:text-[#58a6ff] transition-colors cursor-default">
                          {tag}
                          <span className="text-[#484f58] text-[9px]">({count})</span>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Reads */}
                <Card className="bg-[#161b22]/80 backdrop-blur-sm border-[#30363d]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4 text-[#a371f7]" />
                      <h3 className="text-white font-bold text-sm">Quick Reads</h3>
                    </div>
                    <div className="space-y-0.5">
                      {blogs.filter(b => estimateReadTime(b.content) <= 5).slice(0, 4).map(blog => (
                        <BlogCard key={blog.id} blog={blog} size="horizontal" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#21262d] bg-[#010409] px-4 py-10 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-[#30363d]">
                <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                <AvatarFallback>F</AvatarFallback>
              </Avatar>
              <span className="text-[#484f58] text-sm">Farhan&apos;s Tech Blog</span>
            </div>
            <p className="text-[#484f58] text-xs">Crafted with care • {new Date().getFullYear()}</p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-[#484f58] hover:text-white transition-colors">Portfolio</Link>
              <Link href="/blog" className="text-[#484f58] hover:text-white transition-colors">Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
