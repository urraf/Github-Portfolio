"use client"
import { useEffect, useRef } from "react"
import { Eye } from "lucide-react"

export default function BlogViewTracker({ blogId, initialViews }: { blogId: string; initialViews: number }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    // Small delay to avoid counting bots/quick bounces
    const timer = setTimeout(() => {
      fetch("/api/blogs/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      }).catch(() => {})
    }, 2000)

    return () => clearTimeout(timer)
  }, [blogId])

  return (
    <span className="flex items-center gap-1.5 font-mono text-xs">
      <Eye className="h-3.5 w-3.5 text-[#3d4a5c]" />
      {initialViews} views
    </span>
  )
}
