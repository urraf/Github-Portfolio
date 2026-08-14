"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, ArrowLeft, Calendar, Clock, ArrowRight, Search, Heart } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"
import BlogLikeButton from "@/components/blog-like-button"

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

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    return blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#010409]/95 backdrop-blur-md px-4 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#7d8590] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Avatar className="h-8 w-8 border border-[#30363d]">
              <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
              <AvatarFallback className="bg-[#21262d] text-white text-sm">F</AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold">Blog</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-[#7d8590] hover:text-white transition-colors">Portfolio</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:py-16 relative z-10">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161b22] border border-[#30363d] text-[#58a6ff] mb-6 shadow-lg shadow-[#58a6ff]/5">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Tech & Engineering Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Thoughts & Writings</h1>
          <p className="text-[#8b949e] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Deep dives into software engineering, system architecture, and building scalable systems for the future.
          </p>

          {/* Search & Filters */}
          <div className="mt-12 max-w-3xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7d8590]" />
              <input 
                type="text" 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161b22]/80 border border-[#30363d] rounded-full py-4 pl-12 pr-6 text-white placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 border-4 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d] shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-16 text-center">
              <BookOpen className="h-16 w-16 text-[#21262d] mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">No posts yet</h3>
              <p className="text-[#7d8590] max-w-sm mx-auto">Stay tuned! I&apos;ll be sharing articles about software engineering, system design, and more.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Magazine Layout */}
            
            {/* Top Featured Post - Full Width (Only show if no search active) */}
            {filteredBlogs.length > 0 && !searchQuery && (
              <Link href={`/blog/${filteredBlogs[0].slug}`}>
                <Card className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]/50 transition-all duration-500 group cursor-pointer overflow-hidden shadow-2xl hover:shadow-[#58a6ff]/10">
                  <div className="flex flex-col md:flex-row">
                    {/* Featured Image */}
                    {blogs[0].imageUrl ? (
                      <div className="w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto relative overflow-hidden bg-[#0d1117]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={filteredBlogs[0].imageUrl} 
                          alt={filteredBlogs[0].title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#161b22] hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent md:hidden" />
                      </div>
                    ) : (
                      <div className="w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto relative overflow-hidden bg-gradient-to-br from-[#21262d] to-[#0d1117] flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-[#30363d] opacity-50" />
                      </div>
                    )}
                    
                    {/* Featured Content */}
                    <CardContent className="p-8 sm:p-10 md:w-1/2 lg:w-2/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/20 text-xs px-2.5 py-0.5 shadow-[0_0_10px_rgba(88,166,255,0.1)]">Featured</Badge>
                        <span className="text-[#484f58] text-xs">•</span>
                        <span className="text-xs text-[#7d8590]">
                          {new Date(filteredBlogs[0].publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-[#58a6ff] transition-colors mb-4 leading-tight">
                        {filteredBlogs[0].title}
                      </h2>
                      {filteredBlogs[0].excerpt && (
                        <p className="text-[#8b949e] text-base leading-relaxed mb-6 line-clamp-3">{filteredBlogs[0].excerpt}</p>
                      )}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#30363d]/50">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-xs text-[#7d8590]">
                            <Clock className="h-3.5 w-3.5" />
                            {estimateReadTime(filteredBlogs[0].content)} min read
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#7d8590]">
                            <Heart className="h-3.5 w-3.5" />
                            {filteredBlogs[0].likes || 0}
                          </span>
                        </div>
                        <span className="text-[#58a6ff] text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )}

            {/* Grid Section for Remaining Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery ? filteredBlogs : filteredBlogs.slice(1)).map(blog => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="h-full">
                  <Card className="bg-[#161b22] border-[#30363d] hover:border-[#484f58] transition-all duration-300 group cursor-pointer h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl">
                    {/* Blog Image */}
                    {blog.imageUrl ? (
                      <div className="w-full h-48 relative overflow-hidden bg-[#0d1117] border-b border-[#30363d]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={blog.imageUrl} 
                          alt={blog.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-[#21262d] to-[#0d1117] border-b border-[#30363d] flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-[#30363d]" />
                      </div>
                    )}
                    
                    {/* Blog Content */}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#7d8590] flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7d8590] bg-[#21262d] px-2 py-0.5 rounded-full border border-[#30363d]">
                          <Clock className="h-2.5 w-2.5" />
                          {estimateReadTime(blog.content)} min
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7d8590] bg-[#21262d] px-2 py-0.5 rounded-full border border-[#30363d]">
                          <Heart className="h-2.5 w-2.5" />
                          {blog.likes || 0}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white group-hover:text-[#58a6ff] transition-colors mb-3 leading-snug line-clamp-2">
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p className="text-[#8b949e] text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                          {blog.excerpt}
                        </p>
                      )}
                      
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[#30363d]/50">
                          {blog.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} className="bg-[#0d1117] text-[#7d8590] border-[#30363d] text-[10px] font-normal hover:bg-[#21262d] transition-colors">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge className="bg-transparent text-[#7d8590] border-transparent text-[10px] font-normal pl-0">
                              +{blog.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#21262d] bg-[#010409] px-4 py-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[#484f58] text-sm">Crafted with care • 2025</p>
        </div>
      </footer>
    </div>
  )
}
