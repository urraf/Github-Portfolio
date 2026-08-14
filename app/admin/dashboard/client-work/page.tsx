"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, HandCoins, Edit3, X, Save, CheckCircle, ExternalLink } from "lucide-react"

interface ClientWork {
  _id: string
  title: string
  clientName: string
  projectUrl: string
  description: string
  techStack: string[]
  cost: string
  status: string
  testimonial: string
  createdAt: string
}

const emptyEntry: Omit<ClientWork, '_id' | 'createdAt'> = {
  title: '', clientName: '', projectUrl: '', description: '',
  techStack: [], cost: '', status: 'Completed', testimonial: ''
}

export default function ClientWorkPage() {
  const [entries, setEntries] = useState<ClientWork[]>([])
  const [editing, setEditing] = useState<ClientWork | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newTag, setNewTag] = useState("")

  const loadEntries = () => {
    fetch("/api/admin/client-work").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEntries(data)
    }).catch(console.error)
  }

  useEffect(loadEntries, [])

  const startCreate = () => {
    setEditing({ _id: '', createdAt: '', ...emptyEntry })
    setIsNew(true)
  }

  const saveEntry = async () => {
    if (!editing) return
    setSaving(true)

    const payload = {
      title: editing.title,
      clientName: editing.clientName,
      projectUrl: editing.projectUrl,
      description: editing.description,
      techStack: editing.techStack,
      cost: editing.cost,
      status: editing.status,
      testimonial: editing.testimonial,
    }

    try {
      if (isNew) {
        const res = await fetch("/api/admin/client-work", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setSaved(true); setTimeout(() => setSaved(false), 3000)
          setEditing(null); setIsNew(false); loadEntries()
        }
      } else {
        const res = await fetch(`/api/admin/client-work/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setSaved(true); setTimeout(() => setSaved(false), 3000)
          setEditing(null); loadEntries()
        }
      }
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this client work entry?")) return
    await fetch(`/api/admin/client-work/${id}`, { method: "DELETE" })
    if (editing?._id === id) setEditing(null)
    loadEntries()
  }

  const addTag = () => {
    if (!editing || !newTag.trim()) return
    setEditing({ ...editing, techStack: [...editing.techStack, newTag.trim()] })
    setNewTag("")
  }

  const removeTag = (i: number) => {
    if (!editing) return
    setEditing({ ...editing, techStack: editing.techStack.filter((_, idx) => idx !== i) })
  }

  const ic = "bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button onClick={() => { setEditing(null); setIsNew(false) }} variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d]"><X className="h-4 w-4 mr-1" />Back</Button>
            <h1 className="text-xl font-bold text-white">{isNew ? "Add Client Work" : "Edit Client Work"}</h1>
          </div>
          <Button onClick={saveEntry} disabled={saving || !editing.title} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
            {saved ? <><CheckCircle className="h-4 w-4 mr-2" />Saved!</> : <><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}</>}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader><CardTitle className="text-white text-sm">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Project Title *</label>
                <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className={ic} placeholder="e.g. E-Commerce Platform" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Client Name</label>
                <Input value={editing.clientName} onChange={e => setEditing({ ...editing, clientName: e.target.value })} className={ic} placeholder="e.g. John Doe (or leave blank for anonymous)" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Project URL</label>
                <Input value={editing.projectUrl} onChange={e => setEditing({ ...editing, projectUrl: e.target.value })} className={ic} placeholder="https://example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Description</label>
                <Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className={`${ic} min-h-[120px]`} placeholder="What did you build? What problems did you solve?" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader><CardTitle className="text-white text-sm">Additional Info</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Tech Stack</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {editing.techStack.map((t, i) => (
                    <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs">
                      {t}<button onClick={() => removeTag(i)} className="ml-1 hover:text-[#f85149]"><X className="h-2.5 w-2.5" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tech..." className={`${ic} text-xs`} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
                  <Button onClick={addTag} size="sm" className="bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] h-9"><Plus className="h-3 w-3" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Cost / Charge (Admin Only)</label>
                <Input value={editing.cost} onChange={e => setEditing({ ...editing, cost: e.target.value })} className={ic} placeholder="e.g. ₹15,000 or $200" />
                <p className="text-[10px] text-[#484f58]">This is only visible in the admin panel, not publicly.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Status</label>
                <select
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value })}
                  className="w-full rounded-md bg-[#0d1117] border border-[#30363d] text-white px-3 py-2 text-sm focus:ring-[#58a6ff] focus:outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#e6edf3]">Client Testimonial (Optional)</label>
                <Textarea value={editing.testimonial} onChange={e => setEditing({ ...editing, testimonial: e.target.value })} className={`${ic} min-h-[80px]`} placeholder="What did the client say about your work?" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Work</h1>
          <p className="text-[#7d8590] mt-1">Manage your freelance & client projects</p>
        </div>
        <Button onClick={startCreate} className="bg-[#1f6feb] hover:bg-[#388bfd] text-white border-0">
          <Plus className="h-4 w-4 mr-2" />Add Project
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-12 text-center">
            <HandCoins className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No client work yet</h3>
            <p className="text-[#7d8590] mb-4">Add your first client project to showcase your freelance work.</p>
            <Button onClick={startCreate} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0"><Plus className="h-4 w-4 mr-2" />Add Project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <Card key={entry._id} className="bg-[#161b22] border-[#30363d] hover:border-[#484f58] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{entry.title}</h3>
                      <Badge className={entry.status === 'Completed' ? "bg-[#238636]/20 text-[#3fb950] border-[#238636]/30" : "bg-[#d29922]/20 text-[#d29922] border-[#d29922]/30"}>
                        {entry.status}
                      </Badge>
                    </div>
                    {entry.clientName && <p className="text-[#58a6ff] text-sm">{entry.clientName}</p>}
                    <p className="text-[#7d8590] text-sm mt-1 line-clamp-2">{entry.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#484f58] flex-wrap">
                      {entry.cost && <span className="text-[#3fb950] font-medium">{entry.cost}</span>}
                      {entry.projectUrl && (
                        <a href={entry.projectUrl} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />Visit
                        </a>
                      )}
                      {entry.techStack.length > 0 && (
                        <div className="flex gap-1">{entry.techStack.slice(0, 4).map((t, i) => (
                          <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-[10px] py-0">{t}</Badge>
                        ))}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-[#7d8590] hover:text-white hover:bg-[#21262d] h-8 w-8 p-0" onClick={() => { setEditing(entry); setIsNew(false) }} title="Edit"><Edit3 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-[#f85149] hover:bg-[#f85149]/10 h-8 w-8 p-0" onClick={() => deleteEntry(entry._id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
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
