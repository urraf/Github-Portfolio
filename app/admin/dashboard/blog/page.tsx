"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BookOpen, Eye, EyeOff, Edit3, X, Save, CheckCircle, ImagePlus, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Link2, Code, Quote, Minus, Image, Upload, ExternalLink } from "lucide-react"
import MarkdownRenderer from "@/components/markdown-renderer"

interface Blog {
  id: string; title: string; slug: string; content: string; excerpt: string
  tags: string[]; publishedAt: string; updatedAt: string; published: boolean
  imageUrl?: string; likes?: number
}

export default function BlogManagerPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [editing, setEditing] = useState<Blog | null>(null)
  const [preview, setPreview] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url")
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)

  const loadBlogs = () => { 
    setLoading(true)
    fetch("/api/admin/blogs")
      .then(r => r.json())
      .then(b => { setBlogs(b); setLoading(false) })
      .catch(() => setLoading(false))
  }
  
  useEffect(() => {
    loadBlogs()
    const handlePopState = () => {
      if (window.location.hash !== '#edit') {
        setEditing(null)
        setPreview(false)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const openEditor = (blog: Blog) => {
    setEditing(blog)
    setPreview(false)
    window.history.pushState(null, '', window.location.pathname + '#edit')
  }

  const closeEditor = () => {
    if (window.location.hash === '#edit') {
      window.history.back()
    } else {
      setEditing(null)
      setPreview(false)
    }
  }

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const createBlog = async () => {
    const res = await fetch("/api/admin/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Untitled Post", content: "Start writing your blog post here...", excerpt: "", tags: [], published: false }) })
    if (res.ok) { 
      const blog = await res.json()
      openEditor(blog)
      loadBlogs() 
    }
  }

  const saveBlog = async () => {
    if (!editing) return; setSaving(true)
    const blogToSave = { ...editing }
    if (!blogToSave.slug || blogToSave.slug === 'untitled-post') {
      blogToSave.slug = generateSlug(blogToSave.title)
    }
    const res = await fetch(`/api/admin/blogs/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blogToSave) })
    if (res.ok) {
      const updated = await res.json()
      setEditing(updated)
      setSaved(true); setTimeout(() => setSaved(false), 3000); loadBlogs()
    }
    setSaving(false)
  }

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
    if (editing?.id === id) setEditing(null)
    loadBlogs()
  }

  const togglePublish = async (blog: Blog) => {
    await fetch(`/api/admin/blogs/${blog.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !blog.published }) })
    loadBlogs()
  }

  const addTag = () => {
    if (!editing || !newTag.trim()) return
    setEditing({ ...editing, tags: [...editing.tags, newTag.trim()] })
    setNewTag("")
  }

  const removeTag = (i: number) => {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((_, idx) => idx !== i) })
  }

  // Rich text toolbar actions
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
    const formData = new FormData(); formData.append("image", file)
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
    const formData = new FormData(); formData.append("image", file)
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

  const ic = "bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button type="button" onClick={closeEditor} variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d]"><X className="h-4 w-4 mr-1" />Back</Button>
            <h1 className="text-xl font-bold text-white">Edit Blog Post</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPreview(!preview)} variant="outline" className="border-[#30363d] text-[#e6edf3] bg-transparent hover:bg-[#21262d]">
              {preview ? <><Edit3 className="h-4 w-4 mr-2" />Edit</> : <><Eye className="h-4 w-4 mr-2" />Preview</>}
            </Button>
            <Button onClick={saveBlog} disabled={saving} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
              {saved ? <><CheckCircle className="h-4 w-4 mr-2" />Saved!</> : <><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              </>
            )}
          </div>
          <div className="space-y-4">
            {/* Post Settings */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader><CardTitle className="text-white text-sm">Post Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3]">Title</label>
                  <Input value={editing.title} onChange={e => {
                    const newTitle = e.target.value
                    const newSlug = generateSlug(newTitle)
                    setEditing({ ...editing, title: newTitle, slug: newSlug })
                  }} className={ic} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3]">Slug (URL)</label>
                  <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className={`${ic} font-mono text-xs`} />
                  <p className="text-[10px] text-[#484f58]">Auto-generated from title. /blog/{editing.slug}</p>
                </div>
                <div className="space-y-2"><label className="text-xs font-medium text-[#e6edf3]">Excerpt</label><Textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} className={`${ic} min-h-[80px]`} placeholder="Brief summary shown on blog listing..." /></div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#e6edf3]">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">{editing.tags.map((t, i) => (<Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs">{t}<button onClick={() => removeTag(i)} className="ml-1 hover:text-[#f85149]"><X className="h-2.5 w-2.5" /></button></Badge>))}</div>
                  <div className="flex gap-1"><Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Tag..." className={`${ic} text-xs`} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} /><Button onClick={addTag} size="sm" className="bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] h-9"><Plus className="h-3 w-3" /></Button></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
                  <span className="text-sm text-[#e6edf3]">Published</span>
                  <button onClick={() => setEditing({ ...editing, published: !editing.published })} className={`w-11 h-6 rounded-full transition-colors ${editing.published ? "bg-[#238636]" : "bg-[#30363d]"} relative`}>
                    <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${editing.published ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Image className="h-4 w-4 text-[#58a6ff]" />
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Cover Image Preview */}
                {editing.imageUrl ? (
                  <div className="relative group">
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-[#30363d]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={editing.imageUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <button 
                      onClick={() => setEditing({ ...editing, imageUrl: "" })} 
                      className="absolute top-2 right-2 bg-[#f85149] hover:bg-[#da3633] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remove cover image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center gap-2 text-[#484f58]">
                    <Image className="h-8 w-8" />
                    <span className="text-xs">No cover image</span>
                  </div>
                )}

                {/* Toggle between URL and Upload */}
                <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
                  <button 
                    onClick={() => setCoverMode("url")} 
                    className={`flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${coverMode === "url" ? "bg-[#21262d] text-white" : "bg-[#0d1117] text-[#7d8590] hover:text-white"}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    URL
                  </button>
                  <button 
                    onClick={() => setCoverMode("upload")} 
                    className={`flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition-colors ${coverMode === "upload" ? "bg-[#21262d] text-white" : "bg-[#0d1117] text-[#7d8590] hover:text-white"}`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                </div>

                {coverMode === "url" ? (
                  <Input 
                    value={editing.imageUrl || ""} 
                    onChange={e => setEditing({ ...editing, imageUrl: e.target.value })} 
                    className={`${ic} text-xs`} 
                    placeholder="https://images.unsplash.com/..."
                  />
                ) : (
                  <div>
                    <Button 
                      onClick={() => coverImageRef.current?.click()} 
                      disabled={coverUploading}
                      variant="outline" 
                      className="w-full border-[#30363d] text-[#e6edf3] bg-[#0d1117] hover:bg-[#21262d] text-xs"
                    >
                      {coverUploading ? (
                        <><div className="h-3 w-3 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin mr-2" />Uploading...</>
                      ) : (
                        <><Upload className="h-3 w-3 mr-2" />Choose Image</>
                      )}
                    </Button>
                    <input 
                      ref={coverImageRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverImageUpload(f) }} 
                    />
                  </div>
                )}
                <p className="text-[10px] text-[#484f58]">This image is shown as the blog card thumbnail and the hero image on the blog post page.</p>
              </CardContent>
            </Card>

            {/* Markdown Help */}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Blog</h1><p className="text-[#7d8590] mt-1">Manage your blog posts</p></div>
        <Button onClick={createBlog} className="bg-[#1f6feb] hover:bg-[#388bfd] text-white border-0"><Plus className="h-4 w-4 mr-2" />New Post</Button>
      </div>

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
            <Button onClick={createBlog} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0"><Plus className="h-4 w-4 mr-2" />Create Post</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blogs.map(blog => (
            <Card key={blog.id} className="bg-[#161b22] border-[#30363d] hover:border-[#484f58] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-[#30363d] bg-[#0d1117]">
                    {blog.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#30363d]">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{blog.title}</h3>
                      <Badge className={blog.published ? "bg-[#238636]/20 text-[#3fb950] border-[#238636]/30" : "bg-[#30363d] text-[#7d8590] border-[#484f58]"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-[#7d8590] text-sm truncate">{blog.excerpt || "No excerpt"}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#484f58] flex-wrap">
                      <span>{new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="font-mono text-[10px]">/blog/{blog.slug}</span>
                      {blog.tags.length > 0 && <div className="flex gap-1">{blog.tags.slice(0, 3).map((t, i) => (<Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-[10px] py-0">{t}</Badge>))}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => togglePublish(blog)} title={blog.published ? "Unpublish" : "Publish"}>{blog.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => openEditor(blog)} title="Edit"><Edit3 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-[#f85149] hover:bg-[#f85149]/10 h-8 w-8 p-0" onClick={() => deleteBlog(blog.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
