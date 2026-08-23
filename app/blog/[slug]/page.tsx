import { Metadata } from 'next'
import { cache } from 'react'
import Link from "next/link"
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, BookOpen, ChevronRight, Terminal, Code2, Hash } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"
import MarkdownRenderer from "@/components/markdown-renderer"
import BlogComments from "@/components/blog-comments"
import BlogLikeButton from "@/components/blog-like-button"
import BlogViewTracker from "@/components/blog-view-tracker"
import TableOfContents from "@/components/table-of-contents"
import BlogAIChat from "@/components/blog-ai-chat"
import ScrollProgress from "@/components/scroll-progress"
import { getDb } from '@/lib/mongodb'

interface Blog {
  _id?: any;
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  published: boolean;
  imageUrl?: string;
  likes?: number;
  views?: number;
  metaTitle?: string;
  metaDescription?: string;
  category?: string;
}

// Tag color mapping
const COLOR_PALETTE = [
  { bg: "rgba(0, 212, 255, 0.1)", text: "#00d4ff", border: "rgba(0, 212, 255, 0.2)" },
  { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7", border: "rgba(168, 85, 247, 0.2)" },
  { bg: "rgba(0, 255, 136, 0.1)", text: "#00ff88", border: "rgba(0, 255, 136, 0.2)" },
  { bg: "rgba(255, 107, 53, 0.1)", text: "#ff6b35", border: "rgba(255, 107, 53, 0.2)" },
  { bg: "rgba(255, 82, 136, 0.1)", text: "#ff5288", border: "rgba(255, 82, 136, 0.2)" },
  { bg: "rgba(255, 214, 0, 0.1)", text: "#ffd600", border: "rgba(255, 214, 0, 0.2)" },
]
function getTagColor(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

// Accent stripe colors for recommended cards
const STRIPE_GRADIENTS = [
  "from-[#00d4ff] to-[#0088ff]",
  "from-[#a855f7] to-[#6d28d9]",
  "from-[#00ff88] to-[#00b35c]",
  "from-[#ff6b35] to-[#ff3d00]",
]

// Helper to fetch data
const getBlogData = cache(async (slug: string) => {
  const db = await getDb()
  const rawBlog = await db.collection('blogs').findOne({ slug, published: true })

  if (!rawBlog) return null

  const blog: Blog = {
    ...rawBlog as any,
    id: rawBlog._id.toString(),
    _id: undefined
  }

  // Get 4 random recommendations (lightweight, exclude content)
  const rawRecommendations = await db.collection('blogs')
    .find(
      { slug: { $ne: slug }, published: true },
      { projection: { content: 0 } }
    )
    .sort({ publishedAt: -1 })
    .limit(8)
    .toArray()

  // Shuffle and take 4
  const shuffled = rawRecommendations.sort(() => 0.5 - Math.random())
  const recommendedBlogs: Blog[] = shuffled.slice(0, 4).map(b => ({
    ...b as any,
    id: b._id.toString(),
    _id: undefined
  }))

  return { blog, recommendedBlogs }
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug)

  if (!data?.blog) {
    return { title: 'Post Not Found | Farhan' }
  }

  const blog = data.blog
  const blogUrl = `${SITE_URL}/blog/${blog.slug}`

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.tags,
    authors: [{ name: 'Farhan', url: SITE_URL }],
    alternates: {
      canonical: blogUrl,
    },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      url: blogUrl,
      siteName: "Farhan's Tech Blog",
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: ['Farhan'],
      images: blog.imageUrl ? [{ url: blog.imageUrl, width: 1200, height: 630, alt: blog.title }] : [],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.imageUrl ? [blog.imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug)

  if (!data?.blog) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-center p-4">
        <div>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#00d4ff]/5 rounded-full blur-3xl" />
            <BookOpen className="h-16 w-16 text-[#1a2235] mx-auto relative" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-mono">404 — post not found</h1>
          <p className="text-[#4a5568] mb-6">This blog post doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#00d4ff] hover:text-[#38bdf8] transition-colors font-mono text-sm">
            <ArrowLeft className="h-4 w-4" />cd ~/blog
          </Link>
        </div>
      </div>
    )
  }

  const { blog, recommendedBlogs } = data
  const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
  const wordCount = blog.content.split(/\s+/).length
  const readTime = estimateReadTime(blog.content)
  const blogUrl = `${SITE_URL}/blog/${blog.slug}`

  // JSON-LD Article structured data for Google rich results
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.imageUrl || undefined,
    datePublished: blog.publishedAt,
    dateModified: blog.publishedAt,
    author: {
      "@type": "Person",
      name: "Nahraf",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Nahraf",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
    url: blogUrl,
    wordCount: wordCount,
    keywords: blog.tags.join(", "),
    articleSection: blog.tags[0] || "Technology",
    inLanguage: "en",
  }

  // BreadcrumbList structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `${SITE_URL}/blog/${blog.slug}`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e2e8f0] relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <ScrollProgress />
      <AnimatedBackground />
      <BlogAIChat blogContext={{ title: blog.title, tags: blog.tags, content: blog.content }} />

      {/* ===== HEADER ===== */}
      <header className="border-b border-[#1a2235] bg-[#060a13]/95 backdrop-blur-xl px-4 py-3.5 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/blog" className="flex items-center gap-2 text-[#3d4a5c] hover:text-[#00d4ff] transition-colors flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px bg-[#1a2235] flex-shrink-0" />
            <Link href="/blog" className="flex items-center gap-2 flex-shrink-0">
              <Terminal className="h-4 w-4 text-[#00ff88]" />
              <span className="font-mono text-sm text-[#3d4a5c]">
                <span className="text-[#00ff88]">$ </span>blog
              </span>
            </Link>
            <span className="text-[#1a2235] flex-shrink-0">/</span>
            <span className="text-[#c9d1d9] font-mono text-sm truncate">{blog.title}</span>
          </div>
          <nav className="flex items-center gap-4 text-xs font-mono flex-shrink-0 ml-4">
            <Link href="/" className="text-[#3d4a5c] hover:text-[#00d4ff] transition-colors hidden sm:block">~/portfolio</Link>
            <Link href="/blog" className="text-[#3d4a5c] hover:text-[#00d4ff] transition-colors hidden sm:block">~/blog</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14 relative z-10 flex flex-col lg:flex-row gap-12">

        {/* Left Column - Main Content */}
        <div className="flex-1 lg:max-w-4xl w-full">
          <article>
            {/* Article Header */}
            <header className="mb-10">
              {(blog.tags.length > 0 || blog.category) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.category && (
                    <Badge className="text-xs font-mono px-3 py-1 border bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/20">
                      {blog.category}
                    </Badge>
                  )}
                  {blog.tags.map((tag, i) => {
                    const color = getTagColor(i)
                    return (
                      <Badge key={i} className="text-xs font-mono px-3 py-1 border" style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}>
                        <Hash className="h-3 w-3 mr-1" />{tag}
                      </Badge>
                    )
                  })}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-[1.15] tracking-tight">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#4a5568] pb-8 border-b border-[#1a2235] flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border-2 border-[#1e293b] ring-2 ring-[#0a0e17]">
                    <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                    <AvatarFallback className="bg-[#0f1729] text-white text-xs">F</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-[#e2e8f0] text-sm">Farhan</span>
                    <p className="text-[#3d4a5c] text-[10px] font-mono">@farhan</p>
                  </div>
                </div>
                <span className="text-[#1a2235]">|</span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#3d4a5c]" />
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="text-[#1a2235]">|</span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Clock className="h-3.5 w-3.5 text-[#3d4a5c]" />
                  {estimateReadTime(blog.content)} min read
                </span>
                <span className="text-[#1a2235]">|</span>
                <BlogLikeButton blogId={blog.id as string} initialLikes={blog.likes || 0} />
                <span className="text-[#1a2235]">|</span>
                <BlogViewTracker blogId={blog.id as string} initialViews={blog.views || 0} />
              </div>
            </header>

            {/* Hero Image */}
            {blog.imageUrl && (
              <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden rounded-2xl mb-12 shadow-2xl shadow-black/30 border border-[#1a2235] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17]/70 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Divider if no image */}
            {!blog.imageUrl && (
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] mb-10 rounded-full" />
            )}

            {/* Article Body */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-black/20 backdrop-blur-sm prose prose-invert max-w-none prose-pre:bg-[#070b14] prose-pre:border prose-pre:border-[#1a2235] prose-a:text-[#00d4ff] hover:prose-a:text-[#38bdf8] prose-img:rounded-xl">
              <MarkdownRenderer content={blog.content} />
            </div>

            {/* Comments Section */}
            <BlogComments blogId={blog.id as string} />
          </article>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <TableOfContents content={blog.content} />

            {/* Author Card */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="h-14 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/15 via-[#a855f7]/15 to-[#00ff88]/15" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '14px 14px' }} />
              </div>
              <div className="p-5 -mt-7">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-[#0c1120] ring-2 ring-[#1a2235] shadow-lg">
                    <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                    <AvatarFallback className="bg-[#0f1729] text-white">F</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-[#e2e8f0] text-sm">Farhan</h4>
                    <p className="text-[11px] text-[#3d4a5c] font-mono">Software Engineer</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#4a5568] leading-relaxed">
                  Building scalable distributed systems, crafting clean APIs, and exploring the intersection of engineering and design.
                </p>
                <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-[#00d4ff] hover:text-[#38bdf8] text-xs font-mono transition-colors">
                  ~/portfolio <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Recommended Posts */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-4 w-1 bg-[#00ff88] rounded-full" />
                <h3 className="text-sm font-semibold text-[#e2e8f0] font-mono">recommended<span className="text-[#3d4a5c]">()</span></h3>
              </div>
              <div className="space-y-4">
                {recommendedBlogs.slice(0, 3).map(rec => (
                  <Link href={`/blog/${rec.slug}`} key={rec.id} className="group flex gap-3 items-start">
                    <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#1a2235] relative">
                      {rec.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rec.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-[#0f1729] flex items-center justify-center">
                          <Code2 className="h-4 w-4 text-[#1a2235]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#c9d1d9] group-hover:text-[#00d4ff] transition-colors line-clamp-2 leading-snug">
                        {rec.title}
                      </h4>
                      <p className="text-[10px] text-[#2a3650] mt-1 font-mono">{new Date(rec.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ===== MORE ARTICLES SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 relative z-10 border-t border-[#1a2235]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-[#a855f7]" />
            <h2 className="text-lg font-semibold text-[#e2e8f0] font-mono">more_articles<span className="text-[#3d4a5c]">()</span></h2>
          </div>
          <Link href="/blog" className="text-[#00d4ff] hover:text-[#38bdf8] flex items-center gap-1 text-xs font-mono transition-colors">
            view_all() <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedBlogs.map((rec, i) => (
            <Link href={`/blog/${rec.slug}`} key={rec.id} className="group flex flex-col bg-[#0c1120]/60 border border-[#1a2235] rounded-2xl overflow-hidden hover:border-[#2a3a55] hover:-translate-y-1.5 transition-all duration-500 shadow-lg shadow-black/10">
              {/* Accent stripe */}
              <div className={`h-1 w-full bg-gradient-to-r ${STRIPE_GRADIENTS[i % STRIPE_GRADIENTS.length]} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="h-36 relative overflow-hidden bg-[#070b14]">
                {rec.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rec.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0f1729] to-[#0a0e17] flex items-center justify-center">
                    <Code2 className="h-8 w-8 text-[#1a2235]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1120] via-transparent to-transparent opacity-70" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {rec.tags.slice(0, 2).map((tag: string, j: number) => {
                    const color = getTagColor(j)
                    return (
                      <span key={tag} className="text-[9px] uppercase tracking-wider font-semibold font-mono px-2 py-0.5 rounded-md" style={{ color: color.text, backgroundColor: color.bg }}>
                        {tag}
                      </span>
                    )
                  })}
                </div>
                <h3 className="font-semibold text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors line-clamp-2 text-sm leading-snug mb-2 flex-1">
                  {rec.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1a2235] bg-[#060a13] px-4 py-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </footer>
    </div>
  )
}
