"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit3, X, Save, CheckCircle, ExternalLink, GitPullRequest, GitMerge, Bug, FileText, BookOpen, Star, RefreshCw } from "lucide-react"

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

const emptyEntry: Omit<Contribution, '_id' | 'createdAt'> = {
  projectName: '', repoUrl: '', prUrl: '', description: '',
  contributionType: 'Pull Request', status: 'Merged', techStack: [], stars: 0
}

const contributionTypes = ['Pull Request', 'Package', 'Bug Fix', 'Feature', 'Documentation', 'Issue']
const statusOptions = ['Published', 'Merged', 'Open', 'Closed']

function getTypeIcon(type: string) {
  switch (type) {
    case 'Pull Request': return <GitPullRequest className="h-3.5 w-3.5" />
    case 'Bug Fix': return <Bug className="h-3.5 w-3.5" />
    case 'Feature': return <Star className="h-3.5 w-3.5" />
    case 'Documentation': return <BookOpen className="h-3.5 w-3.5" />
    case 'Issue': return <FileText className="h-3.5 w-3.5" />
    default: return <GitPullRequest className="h-3.5 w-3.5" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Merged': return 'bg-[#238636]/10 text-[#3fb950] border-[#238636]/30'
    case 'Open': return 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/30'
    case 'Closed': return 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30'
    default: return 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30'
  }
}

export default function OpenSourcePage() {
  const [entries, setEntries] = useState<Contribution[]>([])
  const [editing, setEditing] = useState<Contribution | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [syncMessage, setSyncMessage] = useState("")

  const loadEntries = () => {
    fetch("/api/admin/open-source").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEntries(data)
    }).catch(console.error)
  }

  useEffect(loadEntries, [])

  const startCreate = () => {
    setEditing({ _id: '', createdAt: '', ...emptyEntry })
    setIsNew(true)
  }

  const handleEdit = (entry: Contribution) => {
    setEditing(entry)
    setIsNew(false)
  }

  const saveEntry = async () => {
    if (!editing) return
    setSaving(true)

    const payload = {
      projectName: editing.projectName,
      repoUrl: editing.repoUrl,
      prUrl: editing.prUrl,
      description: editing.description,
      contributionType: editing.contributionType,
      status: editing.status,
      techStack: editing.techStack,
      stars: editing.stars,
    }

    try {
      if (isNew) {
        await fetch("/api/admin/open-source", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch(`/api/admin/open-source/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditing(null)
      setIsNew(false)
      loadEntries()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this contribution?")) return
    await fetch(`/api/admin/open-source/${id}`, { method: "DELETE" })
    loadEntries()
  }

  const addTag = () => {
    if (!newTag.trim() || !editing) return
    if (!editing.techStack.includes(newTag.trim())) {
      setEditing({ ...editing, techStack: [...editing.techStack, newTag.trim()] })
    }
    setNewTag("")
  }

  const removeTag = (tag: string) => {
    if (!editing) return
    setEditing({ ...editing, techStack: editing.techStack.filter(t => t !== tag) })
  }

  const syncGitHub = async () => {
    setSyncing(true)
    setSyncMessage("")
    try {
      const res = await fetch("/api/admin/open-source/sync", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setSyncMessage(`Successfully imported ${data.imported} new PRs!`)
        loadEntries()
      } else {
        setSyncMessage(data.error || "Failed to sync.")
      }
    } catch (err) {
      console.error(err)
      setSyncMessage("An error occurred during sync.")
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(""), 5000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#238636] to-[#2ea043] flex items-center justify-center">
              <GitMerge className="h-4 w-4 text-white" />
            </div>
            Open Source Contributions
          </h1>
          <p className="text-[#7d8590] mt-1">Manage your open source contributions and pull requests.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncGitHub} disabled={syncing} variant="outline" className="border-[#30363d] text-[#7d8590] hover:text-white bg-[#161b22]">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Fetching..." : "Fetch from GitHub"}
          </Button>
          <Button onClick={startCreate} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
            <Plus className="h-4 w-4 mr-2" /> Add Contribution
          </Button>
        </div>
      </div>

      {syncMessage && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${syncMessage.includes("error") || syncMessage.includes("Failed") ? 'text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/30' : 'text-[#58a6ff] bg-[#58a6ff]/10 border border-[#58a6ff]/30'}`}>
          <GitPullRequest className="h-4 w-4" /> {syncMessage}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-[#3fb950] bg-[#238636]/10 border border-[#238636]/30 px-4 py-2 rounded-lg text-sm">
          <CheckCircle className="h-4 w-4" /> Saved successfully!
        </div>
      )}

      {/* Edit/Create Form */}
      {editing && (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">{isNew ? "Add Contribution" : "Edit Contribution"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">Project Name *</label>
                <Input
                  placeholder="e.g. Next.js, React, TensorFlow"
                  value={editing.projectName}
                  onChange={e => setEditing({ ...editing, projectName: e.target.value })}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                />
              </div>
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">Stars (repo star count)</label>
                <Input
                  type="number"
                  placeholder="e.g. 125000"
                  value={editing.stars || ''}
                  onChange={e => setEditing({ ...editing, stars: parseInt(e.target.value) || 0 })}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">Repository URL</label>
                <Input
                  placeholder="https://github.com/vercel/next.js"
                  value={editing.repoUrl}
                  onChange={e => setEditing({ ...editing, repoUrl: e.target.value })}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                />
              </div>
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">PR / Issue URL</label>
                <Input
                  placeholder="https://github.com/vercel/next.js/pull/12345"
                  value={editing.prUrl}
                  onChange={e => setEditing({ ...editing, prUrl: e.target.value })}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">Contribution Type</label>
                <select
                  value={editing.contributionType}
                  onChange={e => setEditing({ ...editing, contributionType: e.target.value })}
                  className="w-full h-10 rounded-md border border-[#30363d] bg-[#0d1117] text-white px-3 text-sm focus:ring-1 focus:ring-[#58a6ff] outline-none"
                >
                  {contributionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#7d8590] text-xs mb-1 block">Status</label>
                <select
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value })}
                  className="w-full h-10 rounded-md border border-[#30363d] bg-[#0d1117] text-white px-3 text-sm focus:ring-1 focus:ring-[#58a6ff] outline-none"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#7d8590] text-xs mb-1 block">Description</label>
              <Textarea
                placeholder="Describe your contribution..."
                value={editing.description}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                className="bg-[#0d1117] border-[#30363d] text-white min-h-[100px]"
              />
            </div>

            {/* Tech Stack Tags */}
            <div>
              <label className="text-[#7d8590] text-xs mb-1 block">Tech Stack</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editing.techStack.map(tag => (
                  <Badge key={tag} className="bg-[#21262d] text-[#79c0ff] border-[#30363d] gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-[#f85149]">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology..."
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-[#0d1117] border-[#30363d] text-white flex-1"
                />
                <Button onClick={addTag} size="sm" variant="outline" className="border-[#30363d] text-[#7d8590] hover:text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveEntry} disabled={saving || !editing.projectName} className="bg-[#238636] hover:bg-[#2ea043] text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={() => { setEditing(null); setIsNew(false) }} variant="outline" className="border-[#30363d] text-[#7d8590] hover:text-white">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution List */}
      {entries.length === 0 ? (
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="p-12 text-center">
            <GitMerge className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No contributions yet</h3>
            <p className="text-[#7d8590]">Add your first open source contribution to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <Card key={entry._id} className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]/30 transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">{entry.projectName}</h3>
                      {entry.stars > 0 && (
                        <span className="flex items-center gap-1 text-[#d29922] text-xs font-medium">
                          <Star className="h-3 w-3 fill-[#d29922]" />
                          {entry.stars >= 1000 ? `${(entry.stars / 1000).toFixed(1)}k` : entry.stars}
                        </span>
                      )}
                      <Badge className={`${getStatusColor(entry.status)} text-xs`}>
                        {entry.status === 'Merged' && <GitMerge className="h-3 w-3 mr-1" />}
                        {entry.status}
                      </Badge>
                      <Badge className="bg-[#21262d] text-[#e6edf3] border-[#30363d] text-xs gap-1">
                        {getTypeIcon(entry.contributionType)}
                        {entry.contributionType}
                      </Badge>
                    </div>

                    {/* Description */}
                    {entry.description && (
                      <p className="text-[#8b949e] text-sm leading-relaxed">{entry.description}</p>
                    )}

                    {/* Tech Stack */}
                    {entry.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.techStack.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-[#21262d]/50 text-[#79c0ff] border-[#30363d] text-[10px] px-2 py-0.5">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-3">
                      {entry.repoUrl && (
                        <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Repository
                        </a>
                      )}
                      {entry.prUrl && (
                        <a href={entry.prUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1">
                          <GitPullRequest className="h-3 w-3" /> PR/Issue
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)} className="h-8 w-8 p-0 text-[#7d8590] hover:text-[#58a6ff] hover:bg-[#58a6ff]/10">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteEntry(entry._id)} className="h-8 w-8 p-0 text-[#7d8590] hover:text-[#f85149] hover:bg-[#f85149]/10">
                      <Trash2 className="h-3.5 w-3.5" />
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
