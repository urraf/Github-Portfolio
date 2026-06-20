"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileCode, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HTMLProject {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function ProjectOverviewPage() {
  const [projects, setProjects] = useState<HTMLProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/html-projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Project Overview</h1>
            <p className="text-[#8b949e]">Explore interactive HTML projects and demonstrations.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
            <Input 
              placeholder="Search projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-[#161b22] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardContent className="p-12 text-center">
              <FileCode className="h-12 w-12 text-[#30363d] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
              <p className="text-[#7d8590]">{search ? "Try a different search term." : "Projects will appear here once uploaded."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Link key={project._id} href={`/project-overview/${project.slug}`}>
                <Card className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff] hover:bg-[#1f242c] transition-all h-full cursor-pointer group">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div>
                      <div className="bg-[#21262d] w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#58a6ff]/10 transition-colors">
                        <FileCode className="h-6 w-6 text-[#7d8590] group-hover:text-[#58a6ff] transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#30363d] flex items-center justify-between text-[#8b949e] text-xs">
                      <span>Uploaded {new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="text-[#58a6ff] font-medium group-hover:underline">View Project &rarr;</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
