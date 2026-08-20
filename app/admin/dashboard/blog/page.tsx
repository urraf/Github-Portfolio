"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Trash2, BookOpen, Eye, EyeOff, Edit3, X, Save, CheckCircle,
  ImagePlus, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Link2, Code, Quote, Minus, Image, Upload, ExternalLink, Search,
  ArrowUpDown, Copy, Lock, Unlock, Heart, Clock, FileText, BarChart3,
  ChevronDown, CheckSquare, Square, AlertTriangle, Globe, Tag, Hash,
  Folder, Wand2
} from "lucide-react"
import MarkdownRenderer from "@/components/markdown-renderer"

// ── Types ──────────────────────────────────────────────────────────────
interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  published: boolean
  imageUrl?: string
  likes?: number
  views?: number
  metaTitle?: string
  metaDescription?: string
  category?: string
}

interface TagInfo {
  tag: string
  count: number
}

// ── Constants ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "", label: "No Category" },
  { value: "technology", label: "Technology" },
  { value: "tutorial", label: "Tutorial" },
  { value: "career", label: "Career" },
  { value: "project", label: "Project" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "views", label: "Most Viewed" },
  { value: "likes", label: "Most Liked" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
]

const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

// ── Helpers ────────────────────────────────────────────────────────────
const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0
const readTime = (text: string) => Math.max(1, Math.ceil(wordCount(text) / 200))

const ic = "bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function BlogManagerPage() {
  // ── List State ─────────────────────────────────────────────────────
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "drafts">("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActioning, setBulkActioning] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // ── AI Generator State ─────────────────────────────────────────────
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiTopic, setAiTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // ── Editor State ───────────────────────────────────────────────────
  const [editing, setEditing] = useState<Blog | null>(null)
  const [preview, setPreview] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url")
  const [slugLocked, setSlugLocked] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [showSeoPanel, setShowSeoPanel] = useState(false)

  // ── Tag Suggestions ────────────────────────────────────────────────
  const [allTags, setAllTags] = useState<TagInfo[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  // ── Refs ───────────────────────────────────────────────────────────
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedDataRef = useRef<string>("")
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  // ── Data Loading ───────────────────────────────────────────────────
  const loadBlogs = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/blogs")
      .then(r => r.json())
      .then(b => { setBlogs(Array.isArray(b) ? b : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const loadTags = useCallback(() => {
    fetch("/api/admin/blogs/tags")
      .then(r => r.json())
      .then(t => { if (Array.isArray(t)) setAllTags(t) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadBlogs()
    loadTags()

    const handlePopState = () => {
      if (window.location.hash !== "#edit") {
        setEditing(null)
        setPreview(false)
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [loadBlogs, loadTags])

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Auto-Save ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!editing) return

    const currentData = JSON.stringify({
      title: editing.title, slug: editing.slug, content: editing.content,
      excerpt: editing.excerpt, tags: editing.tags, published: editing.published,
      imageUrl: editing.imageUrl, metaTitle: editing.metaTitle,
      metaDescription: editing.metaDescription, category: editing.category,
    })

    if (lastSavedDataRef.current && currentData !== lastSavedDataRef.current) {
      setHasUnsavedChanges(true)
    }

    // Reset auto-save timer
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      if (currentData !== lastSavedDataRef.current) {
        saveBlog(true) // silent auto-save
      }
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.title, editing?.slug, editing?.content, editing?.excerpt,
      editing?.tags, editing?.published, editing?.imageUrl,
      editing?.metaTitle, editing?.metaDescription, editing?.category])

  // ── Keyboard Shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && editing) {
        e.preventDefault()
        saveBlog()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  // ── Editor Navigation ──────────────────────────────────────────────
  const openEditor = (blog: Blog) => {
    setEditing(blog)
    setPreview(false)
    setSlugLocked(true) // Default to locked for existing posts
    setHasUnsavedChanges(false)
    lastSavedDataRef.current = JSON.stringify({
      title: blog.title, slug: blog.slug, content: blog.content,
      excerpt: blog.excerpt, tags: blog.tags, published: blog.published,
      imageUrl: blog.imageUrl, metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription, category: blog.category,
    })
    window.history.pushState(null, "", window.location.pathname + "#edit")
  }

  const closeEditor = () => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard them?")) return
    if (window.location.hash === "#edit") {
      window.history.back()
    } else {
      setEditing(null)
      setPreview(false)
    }
    setHasUnsavedChanges(false)
  }

  // ── AI Generation ──────────────────────────────────────────────────
  const generateAiBlog = async () => {
    if (!aiTopic) return
    setIsGenerating(true)
    try {
      const res = await fetch("/api/admin/blogs/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic })
      })
      if (res.ok) {
        const data = await res.json()
        setEditing(prev => {
          if (!prev) return prev
          return {
            ...prev,
            title: data.title || prev.title,
            excerpt: data.excerpt || prev.excerpt,
            content: data.content || prev.content,
            category: data.category || prev.category,
            tags: data.tags?.length ? data.tags : prev.tags,
            metaTitle: data.metaTitle || prev.metaTitle,
            metaDescription: data.metaDescription || prev.metaDescription,
          }
        })
        setShowAiModal(false)
        setAiTopic("")
        setHasUnsavedChanges(true)
      } else {
        const err = await res.json()
        alert(`Failed to generate: ${err.error}`)
      }
    } catch (e) {
      console.error(e)
      alert("Error generating blog")
    } finally {
      setIsGenerating(false)
    }
  }

  // ── CRUD Operations ────────────────────────────────────────────────
  const createBlog = async () => {
    const res = await fetch("/api/admin/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Post",
        content: "Start writing your blog post here...",
        excerpt: "",
        tags: [],
        published: false,
      }),
    })
    if (res.ok) {
      const blog = await res.json()
      setSlugLocked(false) // New posts: slug follows title
      openEditor(blog)
      setSlugLocked(false)
      loadBlogs()
    }
  }

  const saveBlog = async (silent = false) => {
    if (!editing || saving) return
    setSaving(true)

    const blogToSave = { ...editing }
    if (!blogToSave.slug || blogToSave.slug === "untitled-post") {
      blogToSave.slug = generateSlug(blogToSave.title)
    }

    const res = await fetch(`/api/admin/blogs/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blogToSave),
    })

    if (res.ok) {
      const updated = await res.json()
      setEditing(updated)
      setHasUnsavedChanges(false)
      setLastSavedAt(new Date().toLocaleTimeString())
      lastSavedDataRef.current = JSON.stringify({
        title: updated.title, slug: updated.slug, content: updated.content,
        excerpt: updated.excerpt, tags: updated.tags, published: updated.published,
        imageUrl: updated.imageUrl, metaTitle: updated.metaTitle,
        metaDescription: updated.metaDescription, category: updated.category,
      })
      if (!silent) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
      loadBlogs()
      loadTags()
    }
    setSaving(false)
  }

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post? This cannot be undone.")) return
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
    if (editing?.id === id) { setEditing(null); setHasUnsavedChanges(false) }
    loadBlogs()
  }

  const togglePublish = async (blog: Blog) => {
    await fetch(`/api/admin/blogs/${blog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !blog.published }),
    })
    loadBlogs()
  }

  const duplicateBlog = async (id: string) => {
    const res = await fetch("/api/admin/blogs/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      loadBlogs()
    }
  }

  // ── Bulk Operations ────────────────────────────────────────────────
  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedIds.size === 0) return
    if (action === "delete" && !confirm(`Delete ${selectedIds.size} post(s)? This cannot be undone.`)) return
    setBulkActioning(true)
    await fetch("/api/admin/blogs/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
    })
    setSelectedIds(new Set())
    setBulkActioning(false)
    loadBlogs()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBlogs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredBlogs.map(b => b.id)))
    }
  }

  // ── Tag Management ─────────────────────────────────────────────────
  const addTag = (tagText?: string) => {
    const tag = (tagText || newTag).trim().toLowerCase()
    if (!editing || !tag) return
    if (editing.tags.includes(tag)) { setNewTag(""); return }
    setEditing({ ...editing, tags: [...editing.tags, tag] })
    setNewTag("")
    setShowTagSuggestions(false)
  }

  const removeTag = (i: number) => {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((_, idx) => idx !== i) })
  }

  const handleTagInputChange = (value: string) => {
    setNewTag(value)
    if (value.trim()) {
      const suggestions = allTags
        .map(t => t.tag)
        .filter(t => t.toLowerCase().includes(value.toLowerCase()) && !editing?.tags.includes(t))
        .slice(0, 8)
      setTagSuggestions(suggestions)
      setShowTagSuggestions(suggestions.length > 0)
    } else {
      setShowTagSuggestions(false)
    }
  }

  // ── Markdown Toolbar ───────────────────────────────────────────────
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const ta = textareaRef.current
    if (!ta || !editing) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = editing.content.substring(start, end)
    const text = selected || placeholder
    const newContent = editing.content.substring(0, start) + before + text + after + editing.content.substring(end)
    setEditing({ ...editing, content: newContent })
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + text.length) }, 0)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        insertMarkdown(`![${file.name}](${data.url} =600)`, "", "")
      }
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  const handleCoverImageUpload = async (file: File) => {
    setCoverUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.url && editing) {
        setEditing({ ...editing, imageUrl: data.url })
      }
    } catch (e) { console.error(e) }
    setCoverUploading(false)
  }

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "bold text"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "italic text"), title: "Italic" },
    { icon: Heading1, action: () => insertMarkdown("\n# ", "\n", "Heading 1"), title: "Heading 1" },
    { icon: Heading2, action: () => insertMarkdown("\n## ", "\n", "Heading 2"), title: "Heading 2" },
    { icon: Heading3, action: () => insertMarkdown("\n### ", "\n", "Heading 3"), title: "Heading 3" },
    { icon: List, action: () => insertMarkdown("\n- ", "\n", "list item"), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertMarkdown("\n1. ", "\n", "list item"), title: "Numbered List" },
    { icon: Link2, action: () => insertMarkdown("[", "](url)", "link text"), title: "Link" },
    { icon: Code, action: () => insertMarkdown("`", "`", "code"), title: "Inline Code" },
    { icon: Quote, action: () => insertMarkdown("\n> ", "\n", "quote"), title: "Blockquote" },
    { icon: Minus, action: () => insertMarkdown("\n---\n", "", ""), title: "Divider" },
  ]

  // ── Filtering & Sorting ────────────────────────────────────────────
  const filteredBlogs = blogs
    .filter(blog => {
      // Status filter
      if (statusFilter === "published" && !blog.published) return false
      if (statusFilter === "drafts" && blog.published) return false
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          blog.title.toLowerCase().includes(q) ||
          blog.slug.toLowerCase().includes(q) ||
          blog.tags.some(t => t.toLowerCase().includes(q)) ||
          (blog.excerpt || "").toLowerCase().includes(q) ||
          (blog.category || "").toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case "views": return (b.views || 0) - (a.views || 0)
        case "likes": return (b.likes || 0) - (a.likes || 0)
        case "az": return a.title.localeCompare(b.title)
        case "za": return b.title.localeCompare(a.title)
        default: return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      }
    })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy])

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // ── Stats ──────────────────────────────────────────────────────────
  const totalPosts = blogs.length
  const publishedCount = blogs.filter(b => b.published).length
  const draftCount = blogs.filter(b => !b.published).length
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0)
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes || 0), 0)

  // ── Slug duplicate detection ───────────────────────────────────────
  const slugIsDuplicate = editing
    ? blogs.some(b => b.id !== editing.id && b.slug === editing.slug)
    : false

  // ════════════════════════════════════════════════════════════════════
  // EDITOR VIEW
  // ════════════════════════════════════════════════════════════════════
  if (editing) {
    return (
      <div className="space-y-4">
        {/* ── Editor Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button type="button" onClick={closeEditor} variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d]">
              <X className="h-4 w-4 mr-1" />Back
            </Button>
            <div className="h-6 w-[1px] bg-[#30363d] hidden sm:block" />
            <Button 
              onClick={() => setShowAiModal(true)}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white border-0 h-9 px-4 text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all"
            >
              <Wand2 className="h-3.5 w-3.5 mr-2" />
              NEXUS AI GENERATE
            </Button>
            <h1 className="text-xl font-bold text-white ml-2 hidden lg:block">Edit Blog Post</h1>
            {hasUnsavedChanges && (
              <span className="text-xs text-[#d29922] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d29922] animate-pulse" />
                Unsaved changes
              </span>
            )}
            {lastSavedAt && !hasUnsavedChanges && (
              <span className="text-xs text-[#484f58]">Last saved {lastSavedAt}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPreview(!preview)} variant="outline" className="border-[#30363d] text-[#e6edf3] bg-transparent hover:bg-[#21262d]">
              {preview ? <><Edit3 className="h-4 w-4 mr-2" />Edit</> : <><Eye className="h-4 w-4 mr-2" />Preview</>}
            </Button>
            <Button onClick={() => saveBlog()} disabled={saving} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
              {saved ? <><CheckCircle className="h-4 w-4 mr-2" />Saved!</> : <><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</>}
            </Button>
          </div>
        </div>

        {/* ── AI Generator Modal/Inline Panel ─────────────────────────── */}
        {showAiModal && (
          <div className="mb-4 p-5 sm:p-6 bg-[#0d1117] border border-[#8b5cf6]/30 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-[#3b82f6]/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#a78bfa]">
                  <Wand2 className="h-5 w-5" />
                  <h3 className="font-bold tracking-widest text-sm">NEXUS AI_WRITER</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} className="text-[#7d8590] hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-[#7d8590] font-mono">Enter a topic and the AI will generate a complete, formatted technical blog draft for you.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="e.g., 'The future of React Server Components'"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="flex-1 bg-[#010409]/50 border-[#3b82f6]/30 focus-visible:ring-[#8b5cf6]/50 font-mono text-sm text-[#e6edf3]"
                  disabled={isGenerating}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') generateAiBlog()
                  }}
                />
                <Button 
                  onClick={generateAiBlog}
                  disabled={!aiTopic || isGenerating}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white w-full sm:w-40 font-bold tracking-wider"
                >
                  {isGenerating ? "GENERATING..." : "GENERATE"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Main Content Area ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-2">
            {preview ? (
              <Card className="bg-[#161b22] border-[#30363d]">
                <CardContent className="p-8">
                  {editing.imageUrl && (
                    <div className="w-full h-64 rounded-lg overflow-hidden mb-6 border border-[#30363d]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editing.imageUrl} alt={editing.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-white mb-6">{editing.title}</h1>
                  <MarkdownRenderer
                    content={editing.content}
                    isEditable={true}
                    onContentChange={(newContent) => setEditing({ ...editing, content: newContent })}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Toolbar */}
                <div className="flex items-center gap-1 flex-wrap bg-[#161b22] border border-[#30363d] rounded-t-lg p-2">
                  {toolbarButtons.map((btn, i) => {
                    const Icon = btn.icon
                    return (
                      <button key={i} onClick={btn.action} title={btn.title} className="p-2 rounded hover:bg-[#21262d] text-[#7d8590] hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                  <div className="w-px h-6 bg-[#30363d] mx-1" />
                  <button onClick={() => imageRef.current?.click()} title="Insert Image" disabled={uploading} className="p-2 rounded hover:bg-[#21262d] text-[#7d8590] hover:text-white transition-colors">
                    <ImagePlus className="h-4 w-4" />
                  </button>
                  <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                  {uploading && <span className="text-xs text-[#58a6ff] ml-2">Uploading...</span>}
                </div>
                <Textarea
                  ref={textareaRef}
                  value={editing.content}
                  onChange={e => setEditing({ ...editing, content: e.target.value })}
                  className={`${ic} min-h-[500px] font-mono text-sm rounded-t-none border-t-0`}
                  placeholder="Write your blog post using Markdown..."
                />
                {/* Editor Footer — Word Count & Read Time */}
                <div className="flex items-center gap-4 text-xs text-[#484f58] px-1">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{wordCount(editing.content)} words</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(editing.content)} min read</span>
                  <span className="ml-auto text-[10px]">Ctrl+S to save</span>
                </div>
              </>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* ── Post Settings ────────────────────────────────────── */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader><CardTitle className="text-white text-sm">Post Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3]">Title</label>
                  <Input
                    value={editing.title}
                    onChange={e => {
                      const newTitle = e.target.value
                      if (!slugLocked) {
                        setEditing({ ...editing, title: newTitle, slug: generateSlug(newTitle) })
                      } else {
                        setEditing({ ...editing, title: newTitle })
                      }
                    }}
                    className={ic}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#e6edf3]">Slug (URL)</label>
                    <button
                      onClick={() => {
                        if (slugLocked) {
                          setSlugLocked(false)
                        } else {
                          setSlugLocked(true)
                          setEditing({ ...editing, slug: generateSlug(editing.title) })
                        }
                      }}
                      className="text-[#7d8590] hover:text-white transition-colors p-0.5"
                      title={slugLocked ? "Unlock slug (currently auto-sync disabled)" : "Lock slug (currently auto-syncing with title)"}
                    >
                      {slugLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </button>
                  </div>
                  <Input
                    value={editing.slug}
                    onChange={e => setEditing({ ...editing, slug: e.target.value })}
                    className={`${ic} font-mono text-xs ${slugIsDuplicate ? "border-[#f85149]" : ""}`}
                    readOnly={!slugLocked}
                  />
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-[#484f58] truncate flex-1">
                      <Globe className="h-2.5 w-2.5 inline mr-0.5" />
                      /blog/{editing.slug || "..."}
                    </p>
                    {slugIsDuplicate && (
                      <span className="text-[10px] text-[#f85149] flex items-center gap-0.5 flex-shrink-0">
                        <AlertTriangle className="h-2.5 w-2.5" />Slug already exists
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3] flex items-center gap-1.5">
                    <Folder className="h-3 w-3 text-[#7d8590]" />Category
                  </label>
                  <select
                    value={editing.category || ""}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className={`${ic} w-full rounded-md border px-3 py-2 text-sm`}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3]">Excerpt</label>
                  <Textarea
                    value={editing.excerpt}
                    onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                    className={`${ic} min-h-[80px]`}
                    placeholder="Brief summary shown on blog listing..."
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3] flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[#7d8590]" />Tags
                  </label>
                  {/* Current tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editing.tags.map((t, i) => (
                      <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs">
                        <Hash className="h-2.5 w-2.5 mr-0.5" />{t}
                        <button onClick={() => removeTag(i)} className="ml-1 hover:text-[#f85149]">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {/* Tag input with suggestions */}
                  <div className="relative">
                    <div className="flex gap-1">
                      <Input
                        ref={tagInputRef}
                        value={newTag}
                        onChange={e => handleTagInputChange(e.target.value)}
                        onFocus={() => {
                          if (newTag.trim()) handleTagInputChange(newTag)
                        }}
                        placeholder="Add tag..."
                        className={`${ic} text-xs`}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button onClick={() => addTag()} size="sm" className="bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] h-9">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {/* Suggestions dropdown */}
                    {showTagSuggestions && (
                      <div className="absolute z-10 top-full left-0 right-8 mt-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden">
                        {tagSuggestions.map(tag => (
                          <button
                            key={tag}
                            onClick={() => { addTag(tag); setShowTagSuggestions(false) }}
                            className="w-full text-left px-3 py-2 text-xs text-[#e6edf3] hover:bg-[#21262d] flex items-center justify-between"
                          >
                            <span><Hash className="h-2.5 w-2.5 inline mr-1 text-[#58a6ff]" />{tag}</span>
                            <span className="text-[10px] text-[#484f58]">
                              {allTags.find(t => t.tag === tag)?.count || 0} posts
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Popular tags */}
                  {allTags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#484f58]">Popular tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {allTags
                          .filter(t => !editing.tags.includes(t.tag))
                          .slice(0, 6)
                          .map(t => (
                            <button
                              key={t.tag}
                              onClick={() => addTag(t.tag)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#21262d] text-[#7d8590] hover:text-[#58a6ff] hover:border-[#58a6ff]/30 transition-colors"
                            >
                              +{t.tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Published Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
                  <span className="text-sm text-[#e6edf3]">Published</span>
                  <button
                    onClick={() => setEditing({ ...editing, published: !editing.published })}
                    className={`w-11 h-6 rounded-full transition-colors ${editing.published ? "bg-[#238636]" : "bg-[#30363d]"} relative`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${editing.published ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* ── Cover Image ──────────────────────────────────────── */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Image className="h-4 w-4 text-[#58a6ff]" />Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {editing.imageUrl ? (
                  <div className="relative group">
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-[#30363d]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editing.imageUrl} alt="Cover" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                    <button onClick={() => setEditing({ ...editing, imageUrl: "" })} className="absolute top-2 right-2 bg-[#f85149] hover:bg-[#da3633] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" title="Remove cover image">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center gap-2 text-[#484f58]">
                    <Image className="h-8 w-8" />
                    <span className="text-xs">No cover image</span>
                  </div>
                )}
                <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
                  <button onClick={() => setCoverMode("url")} className={`flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${coverMode === "url" ? "bg-[#21262d] text-white" : "bg-[#0d1117] text-[#7d8590] hover:text-white"}`}>
                    <ExternalLink className="h-3 w-3" />URL
                  </button>
                  <button onClick={() => setCoverMode("upload")} className={`flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${coverMode === "upload" ? "bg-[#21262d] text-white" : "bg-[#0d1117] text-[#7d8590] hover:text-white"}`}>
                    <Upload className="h-3 w-3" />Upload
                  </button>
                </div>
                {coverMode === "url" ? (
                  <Input value={editing.imageUrl || ""} onChange={e => setEditing({ ...editing, imageUrl: e.target.value })} className={`${ic} text-xs`} placeholder="https://images.unsplash.com/..." />
                ) : (
                  <div>
                    <Button onClick={() => coverImageRef.current?.click()} disabled={coverUploading} variant="outline" className="w-full border-[#30363d] text-[#e6edf3] bg-[#0d1117] hover:bg-[#21262d] text-xs">
                      {coverUploading ? <><div className="h-3 w-3 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin mr-2" />Uploading...</> : <><Upload className="h-3 w-3 mr-2" />Choose Image</>}
                    </Button>
                    <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverImageUpload(f) }} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── SEO Settings ─────────────────────────────────────── */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader>
                <button
                  onClick={() => setShowSeoPanel(!showSeoPanel)}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#3fb950]" />SEO Settings
                  </CardTitle>
                  <ChevronDown className={`h-4 w-4 text-[#7d8590] transition-transform ${showSeoPanel ? "rotate-180" : ""}`} />
                </button>
              </CardHeader>
              {showSeoPanel && (
                <CardContent className="space-y-4 pt-0">
                  {/* Meta Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#e6edf3]">Meta Title</label>
                      <span className={`text-[10px] ${(editing.metaTitle || editing.title).length > 60 ? "text-[#f85149]" : (editing.metaTitle || editing.title).length >= 50 ? "text-[#3fb950]" : "text-[#484f58]"}`}>
                        {(editing.metaTitle || editing.title).length}/60
                      </span>
                    </div>
                    <Input
                      value={editing.metaTitle || ""}
                      onChange={e => setEditing({ ...editing, metaTitle: e.target.value })}
                      className={`${ic} text-xs`}
                      placeholder={editing.title || "Override page title for search engines..."}
                    />
                    <div className="h-1 rounded-full bg-[#21262d] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${(editing.metaTitle || editing.title).length > 60 ? "bg-[#f85149]" : (editing.metaTitle || editing.title).length >= 50 ? "bg-[#3fb950]" : "bg-[#58a6ff]"}`}
                        style={{ width: `${Math.min(100, ((editing.metaTitle || editing.title).length / 60) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#e6edf3]">Meta Description</label>
                      <span className={`text-[10px] ${(editing.metaDescription || editing.excerpt).length > 160 ? "text-[#f85149]" : (editing.metaDescription || editing.excerpt).length >= 150 ? "text-[#3fb950]" : "text-[#484f58]"}`}>
                        {(editing.metaDescription || editing.excerpt).length}/160
                      </span>
                    </div>
                    <Textarea
                      value={editing.metaDescription || ""}
                      onChange={e => setEditing({ ...editing, metaDescription: e.target.value })}
                      className={`${ic} min-h-[60px] text-xs`}
                      placeholder={editing.excerpt || "Override description for search engines..."}
                    />
                    <div className="h-1 rounded-full bg-[#21262d] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${(editing.metaDescription || editing.excerpt).length > 160 ? "bg-[#f85149]" : (editing.metaDescription || editing.excerpt).length >= 150 ? "bg-[#3fb950]" : "bg-[#58a6ff]"}`}
                        style={{ width: `${Math.min(100, ((editing.metaDescription || editing.excerpt).length / 160) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Google Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#484f58] font-medium">Google Preview</span>
                    <div className="bg-[#0d1117] rounded-lg border border-[#21262d] p-3 space-y-1">
                      <p className="text-[#8b949e] text-[10px] font-mono truncate">yourdomain.com/blog/{editing.slug}</p>
                      <p className="text-[#58a6ff] text-sm font-medium truncate">{editing.metaTitle || editing.title || "Page Title"}</p>
                      <p className="text-[#7d8590] text-[11px] line-clamp-2">{editing.metaDescription || editing.excerpt || "Page description will appear here..."}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ── Markdown Tips ─────────────────────────────────────── */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader><CardTitle className="text-white text-xs">Markdown Tips</CardTitle></CardHeader>
              <CardContent className="pt-0 text-[10px] text-[#7d8590] space-y-1 font-mono">
                <p>**bold** → <strong className="text-white">bold</strong></p>
                <p>*italic* → <em className="text-white">italic</em></p>
                <p># Heading 1</p>
                <p>## Heading 2</p>
                <p>- bullet list</p>
                <p>[text](url) → link</p>
                <p>![alt](url) → image</p>
                <p>`code` → inline code</p>
                <p>--- → divider</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-[#7d8590] mt-1">Manage your blog posts</p>
        </div>
        <Button onClick={createBlog} className="bg-[#1f6feb] hover:bg-[#388bfd] text-white border-0">
          <Plus className="h-4 w-4 mr-2" />New Post
        </Button>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      {!loading && blogs.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
            <BookOpen className="h-3.5 w-3.5 text-[#58a6ff]" />
            <span className="text-[#e6edf3] font-medium">{totalPosts}</span>
            <span className="text-[#484f58]">Total</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
            <Eye className="h-3.5 w-3.5 text-[#3fb950]" />
            <span className="text-[#e6edf3] font-medium">{publishedCount}</span>
            <span className="text-[#484f58]">Published</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
            <EyeOff className="h-3.5 w-3.5 text-[#d29922]" />
            <span className="text-[#e6edf3] font-medium">{draftCount}</span>
            <span className="text-[#484f58]">Drafts</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
            <BarChart3 className="h-3.5 w-3.5 text-[#f778ba]" />
            <span className="text-[#e6edf3] font-medium">{totalViews.toLocaleString()}</span>
            <span className="text-[#484f58]">Views</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
            <Heart className="h-3.5 w-3.5 text-[#f85149]" />
            <span className="text-[#e6edf3] font-medium">{totalLikes}</span>
            <span className="text-[#484f58]">Likes</span>
          </div>
        </div>
      )}

      {/* ── Search & Filters Bar ───────────────────────────────────── */}
      {!loading && blogs.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58]" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, tag, slug..."
              className={`${ic} pl-9 text-sm`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
            {(["all", "published", "drafts"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-3 py-2 transition-colors capitalize ${statusFilter === status ? "bg-[#21262d] text-white" : "bg-[#0d1117] text-[#7d8590] hover:text-white"}`}
              >
                {status}
                <span className="ml-1 text-[10px] text-[#484f58]">
                  ({status === "all" ? totalPosts : status === "published" ? publishedCount : draftCount})
                </span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#7d8590] hover:text-white transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute z-20 top-full right-0 mt-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden w-44">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${sortBy === opt.value ? "bg-[#21262d] text-[#58a6ff]" : "text-[#e6edf3] hover:bg-[#21262d]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bulk Actions Bar ───────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
          <button onClick={toggleSelectAll} className="text-[#58a6ff]">
            {selectedIds.size === filteredBlogs.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </button>
          <span className="text-xs text-[#e6edf3]">{selectedIds.size} selected</span>
          <div className="w-px h-5 bg-[#30363d]" />
          <Button
            onClick={() => handleBulkAction("publish")}
            disabled={bulkActioning}
            size="sm"
            className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 text-xs h-7"
          >
            <Eye className="h-3 w-3 mr-1" />Publish
          </Button>
          <Button
            onClick={() => handleBulkAction("unpublish")}
            disabled={bulkActioning}
            size="sm"
            variant="outline"
            className="border-[#30363d] text-[#e6edf3] bg-transparent hover:bg-[#21262d] text-xs h-7"
          >
            <EyeOff className="h-3 w-3 mr-1" />Unpublish
          </Button>
          <Button
            onClick={() => handleBulkAction("delete")}
            disabled={bulkActioning}
            size="sm"
            className="bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30 text-xs h-7"
          >
            <Trash2 className="h-3 w-3 mr-1" />Delete
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-[#7d8590] hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No blog posts yet</h3>
            <p className="text-[#7d8590] mb-4">Create your first blog post to get started.</p>
            <Button onClick={createBlog} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
              <Plus className="h-4 w-4 mr-2" />Create Post
            </Button>
          </CardContent>
        </Card>
      ) : filteredBlogs.length === 0 ? (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-12 text-center">
            <Search className="h-10 w-10 text-[#30363d] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No posts found</h3>
            <p className="text-[#7d8590] mb-4">Try adjusting your search or filters.</p>
            <Button onClick={() => { setSearchQuery(""); setStatusFilter("all") }} variant="outline" className="border-[#30363d] text-[#e6edf3] bg-transparent hover:bg-[#21262d]">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedBlogs.map(blog => (
            <Card key={blog.id} className="bg-[#161b22] border-[#30363d] hover:border-[#484f58] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(blog.id)}
                    className="flex-shrink-0 mt-1 text-[#484f58] hover:text-[#58a6ff] transition-colors"
                  >
                    {selectedIds.has(blog.id)
                      ? <CheckSquare className="h-4 w-4 text-[#58a6ff]" />
                      : <Square className="h-4 w-4" />
                    }
                  </button>

                  {/* Thumbnail */}
                  <Link href={`/blog/${blog.slug}`} target="_blank" className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-[#30363d] bg-[#0d1117] block hover:opacity-80 transition-opacity">
                    {blog.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#30363d]">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/blog/${blog.slug}`} target="_blank" className="hover:underline text-white font-semibold truncate max-w-[300px] sm:max-w-md">
                        {blog.title}
                      </Link>
                      <Badge className={blog.published ? "bg-[#238636]/20 text-[#3fb950] border-[#238636]/30" : "bg-[#30363d] text-[#7d8590] border-[#484f58]"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                      {blog.category && (
                        <Badge className="bg-[#1f6feb]/15 text-[#58a6ff] border-[#1f6feb]/30 text-[10px]">
                          <Folder className="h-2.5 w-2.5 mr-0.5" />{blog.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#7d8590] text-sm truncate">{blog.excerpt || "No excerpt"}</p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#484f58] flex-wrap">
                      <span>{new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="font-mono text-[10px]">/blog/{blog.slug}</span>
                      {(blog.views || 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />{blog.views}
                        </span>
                      )}
                      {(blog.likes || 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" />{blog.likes}
                        </span>
                      )}
                      {blog.content && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />{readTime(blog.content)} min
                        </span>
                      )}
                      {blog.tags.length > 0 && (
                        <div className="flex gap-1">
                          {blog.tags.slice(0, 3).map((t, i) => (
                            <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-[10px] py-0">{t}</Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-[10px] text-[#484f58]">+{blog.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => togglePublish(blog)} title={blog.published ? "Unpublish" : "Publish"}>
                      {blog.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => openEditor(blog)} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => duplicateBlog(blog.id)} title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#f85149] hover:bg-[#f85149]/10 h-8 w-8 p-0" onClick={() => deleteBlog(blog.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 pb-10">
              <span className="text-xs text-[#7d8590]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} posts
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-[#30363d] text-[#e6edf3] bg-[#0d1117] hover:bg-[#21262d]"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-[#30363d] text-[#e6edf3] bg-[#0d1117] hover:bg-[#21262d]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
