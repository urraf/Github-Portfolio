"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, ExternalLink } from "lucide-react"

interface ResumeEntry {
  _id: string
  label: string
  url: string
  createdAt: string
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeEntry[]>([])
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [label, setLabel] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadResumes = () => {
    fetch("/api/admin/resumes").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setResumes(data)
    }).catch(() => {})
  }

  useEffect(loadResumes, [])

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus({ type: "error", message: "Only PDF files are allowed" }); return
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: "error", message: "File too large (max 10MB)" }); return
    }
    if (!label.trim()) {
      setStatus({ type: "error", message: "Please enter a label for this resume (e.g. 'SDE Resume')" }); return
    }

    setUploading(true); setStatus(null)
    const formData = new FormData()
    formData.append("resume", file)
    formData.append("label", label.trim())

    try {
      const res = await fetch("/api/admin/resumes", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: "success", message: `"${label.trim()}" uploaded successfully!` })
        setLabel("")
        setSelectedFile(null)
        if (fileRef.current) fileRef.current.value = ""
        loadResumes()
      } else {
        setStatus({ type: "error", message: data.error || "Upload failed" })
      }
    } catch {
      setStatus({ type: "error", message: "Connection error" })
    }
    setUploading(false)
  }

  const deleteResume = async (id: string, resumeLabel: string) => {
    if (!confirm(`Delete "${resumeLabel}"?`)) return
    try {
      const res = await fetch(`/api/admin/resumes/${id}`, { method: "DELETE" })
      if (res.ok) loadResumes()
      else alert("Failed to delete")
    } catch {
      alert("Connection error")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      if (label.trim()) uploadFile(file)
      else setStatus({ type: "error", message: "Please enter a label first, then drop the file." })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleUploadClick = () => {
    if (selectedFile) uploadFile(selectedFile)
    else fileRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resumes</h1>
        <p className="text-[#7d8590] mt-1">Upload and manage multiple resumes for different roles</p>
      </div>

      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${status.type === "success" ? "bg-[#238636]/10 border border-[#238636]/20 text-[#3fb950]" : "bg-[#f85149]/10 border border-[#f85149]/20 text-[#f85149]"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{status.message}</span>
        </div>
      )}

      <Card className="bg-[#161b22] border-[#30363d]">
        <CardHeader><CardTitle className="text-white flex items-center gap-2 text-base"><Upload className="h-4 w-4 text-[#58a6ff]" />Upload New Resume</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#e6edf3]">Resume Label *</label>
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"
              placeholder="e.g. SDE Resume, Data Science Resume, Frontend Resume"
            />
            <p className="text-[10px] text-[#484f58]">This label appears on the dropdown button in your portfolio.</p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-[#58a6ff] bg-[#58a6ff]/5" : "border-[#30363d] hover:border-[#484f58]"}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
            <Upload className={`h-10 w-10 mx-auto mb-3 ${dragOver ? "text-[#58a6ff]" : "text-[#30363d]"}`} />
            <h3 className="text-white font-medium mb-1">
              {selectedFile ? selectedFile.name : uploading ? "Uploading..." : "Drop your PDF here"}
            </h3>
            <p className="text-[#7d8590] text-sm">or click to browse. PDF only, max 10MB</p>
            {uploading && <div className="mt-3 mx-auto w-48 h-1.5 bg-[#21262d] rounded-full overflow-hidden"><div className="h-full bg-[#58a6ff] rounded-full animate-pulse w-3/4" /></div>}
          </div>

          {selectedFile && !uploading && (
            <div className="flex justify-end">
              <Button onClick={handleUploadClick} disabled={!label.trim()} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
                <Upload className="h-4 w-4 mr-2" />Upload "{label || '...'}"
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#161b22] border-[#30363d]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-[#58a6ff]" />
            Uploaded Resumes ({resumes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {resumes.length === 0 ? (
            <p className="text-[#7d8590] text-sm text-center py-8">No resumes uploaded yet. Upload your first one above!</p>
          ) : (
            resumes.map(resume => (
              <div key={resume._id} className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-lg border border-[#30363d] hover:border-[#484f58] transition-colors">
                <FileText className="h-8 w-8 text-[#58a6ff] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{resume.label}</p>
                  <p className="text-[#7d8590] text-xs mt-0.5">
                    Uploaded {new Date(resume.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button asChild size="sm" variant="outline" className="border-[#30363d] text-[#e6edf3] bg-transparent hover:bg-[#21262d] h-8">
                    <a href={resume.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1.5" />View
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-[#f85149] hover:bg-[#f85149]/10 h-8 w-8 p-0" onClick={() => deleteResume(resume._id, resume.label)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
