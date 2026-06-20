"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, FileCode, UploadCloud, X, CheckCircle } from "lucide-react"

interface HTMLProject {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function HTMLProjectsManagerPage() {
  const [projects, setProjects] = useState<HTMLProject[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProjects = () => {
    fetch("/api/admin/html-projects")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data)
        }
      })
      .catch(err => console.error(err))
  }
  
  useEffect(loadProjects, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !selectedFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("title", newTitle.trim())
    formData.append("htmlFile", selectedFile)

    try {
      const res = await fetch("/api/admin/html-projects", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        setUploadSuccess(true)
        setNewTitle("")
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        setTimeout(() => setUploadSuccess(false), 3000)
        loadProjects()
      } else {
        const text = await res.text()
        console.error("Server error response:", res.status, text)
        try {
          const data = JSON.parse(text)
          alert(data.error || `Server error: ${res.status}`)
        } catch (e) {
          alert(`Failed to upload: ${res.status} ${res.statusText}`)
        }
      }
    } catch (err: any) {
      console.error("Network/Parsing error:", err)
      alert(`Failed to upload: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this HTML project?")) return
    
    try {
      const res = await fetch(`/api/admin/html-projects/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadProjects()
      } else {
        alert("Failed to delete project")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to delete project")
    }
  }

  const ic = "bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HTML Projects</h1>
          <p className="text-[#7d8590] mt-1">Upload and manage raw HTML project files</p>
        </div>
      </div>

      <Card className="bg-[#161b22] border-[#30363d]">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#58a6ff]" />
            Upload New Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Project Title</label>
                <Input 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className={ic} 
                  placeholder="e.g. My Interactive Data Viz"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">HTML File</label>
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".html,text/html" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                  className={ic}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUploading || !newTitle || !selectedFile} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
                {uploadSuccess ? (
                  <><CheckCircle className="h-4 w-4 mr-2" />Uploaded!</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />{isUploading ? "Uploading..." : "Upload Project"}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {projects.length === 0 ? (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-12 text-center">
            <FileCode className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No HTML projects yet</h3>
            <p className="text-[#7d8590]">Upload your first HTML file above to showcase it.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <Card key={project._id} className="bg-[#161b22] border-[#30363d] hover:border-[#484f58] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate text-lg">{project.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#484f58] flex-wrap">
                      <span>{new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="font-mono text-[10px] bg-[#21262d] px-2 py-0.5 rounded text-[#7d8590]">/project-overview/{project.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-[#30363d] text-[#e6edf3] hover:bg-[#21262d] bg-transparent"
                      onClick={() => window.open(`/api/html-projects/${project.slug}`, '_blank')}
                      title="View Raw HTML"
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#f85149] hover:bg-[#f85149]/10 h-9 w-9 p-0" onClick={() => deleteProject(project._id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
