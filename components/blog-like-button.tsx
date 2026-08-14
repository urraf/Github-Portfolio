"use client"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlogLikeButtonProps {
  blogId: string
  initialLikes: number
  className?: string
}

export default function BlogLikeButton({ blogId, initialLikes, className }: BlogLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes || 0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    // Check if user already liked this blog in this session/browser
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]')
    if (likedBlogs.includes(blogId)) {
      setHasLiked(true)
    }
  }, [blogId])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigation if placed inside a Link
    
    if (hasLiked || isLiking) return

    setIsLiking(true)
    
    // Optimistic UI update
    setLikes(prev => prev + 1)
    setHasLiked(true)
    
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]')
    localStorage.setItem('likedBlogs', JSON.stringify([...likedBlogs, blogId]))

    try {
      const res = await fetch('/api/blogs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId })
      })

      if (!res.ok) {
        // Revert on failure
        setLikes(prev => prev - 1)
        setHasLiked(false)
        localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs.filter((id: string) => id !== blogId)))
      } else {
        const data = await res.json()
        if (typeof data.likes === 'number') {
           setLikes(data.likes)
        }
      }
    } catch (err) {
      console.error("Failed to like blog:", err)
      // Revert on failure
      setLikes(prev => prev - 1)
      setHasLiked(false)
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs.filter((id: string) => id !== blogId)))
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <button 
      onClick={handleLike}
      disabled={hasLiked || isLiking}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-300 rounded-full px-3 py-1",
        hasLiked 
          ? "bg-red-500/10 text-red-500 cursor-default" 
          : "hover:bg-red-500/10 text-[#7d8590] hover:text-red-400 cursor-pointer",
        className
      )}
      aria-label="Like this blog"
    >
      <Heart className={cn("h-4 w-4 transition-transform", hasLiked && "fill-current scale-110")} />
      <span className="font-medium text-sm">{likes}</span>
    </button>
  )
}
