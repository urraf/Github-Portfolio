"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  title: string
  level: number
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Parse markdown content to find ## and ###
    const lines = content.split('\n')
    const extracted: TOCItem[] = []
    
    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const title = match[2]
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        extracted.push({ id, title, level })
      }
    }
    setHeadings(extracted)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0% -80% 0%" }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-4 w-1 bg-[#a855f7]" />
        <h3 className="text-lg font-bold text-[#e2e8f0] font-mono">table_of_contents</h3>
      </div>
      <nav className="flex flex-col gap-2.5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
              setActiveId(h.id)
            }}
            className={cn(
              "text-sm transition-colors block leading-tight",
              h.level === 3 ? "pl-4" : "",
              activeId === h.id 
                ? "text-[#00d4ff] font-medium border-l-2 border-[#00d4ff] pl-3" 
                : "text-[#4a5568] hover:text-[#c9d1d9]"
            )}
          >
            {h.title}
          </a>
        ))}
      </nav>
    </div>
  )
}
