"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, RefreshCw, Send, ShieldCheck } from "lucide-react"

interface Comment {
  id: string
  name: string
  content: string
  createdAt: string
}

export default function BlogComments({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  
  // Math CAPTCHA state
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [error, setError] = useState("")

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setCaptchaAnswer("")
  }

  useEffect(() => {
    fetchComments()
    generateCaptcha()
  }, [blogId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?blogId=${blogId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (err) {
      console.error("Failed to fetch comments", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name.trim() || !content.trim()) {
      setError("Name and comment are required.")
      return
    }

    if (parseInt(captchaAnswer) !== num1 + num2) {
      setError("Incorrect CAPTCHA answer. Please try again.")
      generateCaptcha()
      return
    }

    setSubmitting(true)
    
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          name,
          content,
          captchaAnswer: parseInt(captchaAnswer),
          expectedCaptcha: num1 + num2
        })
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments([newComment, ...comments])
        setName("")
        setContent("")
        generateCaptcha()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to post comment.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16 bg-[#0c1120]/50 border border-[#1a2235] rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-6 w-6 text-[#a855f7]" />
        <h2 className="text-2xl font-bold text-[#e2e8f0] font-mono">discussion({comments.length})</h2>
      </div>

      {/* Comment List */}
      <div className="space-y-6 mb-12">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-[#3d4a5c]">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-[#0d1520] transition-colors border border-transparent hover:border-[#1a2235]">
              <Avatar className="h-10 w-10 border border-[#1a2235] flex-shrink-0">
                <AvatarFallback className="bg-[#0f1729] text-[#e2e8f0] font-medium">
                  {comment.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#e2e8f0]">{comment.name}</span>
                  <span className="text-xs text-[#3d4a5c] font-mono">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-[#6b7a8d] whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-[#070b14] p-6 rounded-xl border border-[#1a2235]">
        <h3 className="text-lg font-semibold text-white mb-4">Leave a comment</h3>
        <p className="text-sm text-[#3d4a5c] mb-6">No account required. Share your thoughts anonymously.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-[#ff5288]/10 border border-[#ff5288]/30 rounded-lg text-[#ff5288] text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] font-mono mb-1">Display Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe" 
              className="bg-[#0c1120] border-[#1a2235] text-white focus:border-[#00d4ff]" 
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] font-mono mb-1">Comment</label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="What are your thoughts?" 
              className="bg-[#0c1120] border-[#1a2235] text-white focus:border-[#00d4ff] min-h-[120px]" 
              maxLength={1000}
            />
          </div>

          <div className="bg-[#0c1120] border border-[#1a2235] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6b7a8d] font-mono">
              <ShieldCheck className="h-4 w-4 text-[#00ff88]" />
              <span>Anti-spam check: <strong>What is {num1} + {num2}?</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Answer"
                className="w-24 bg-[#0a0e17] border-[#1a2235] text-white text-center"
                type="number"
              />
              <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} className="bg-[#0f1729] border-[#1a2235] hover:bg-[#1e293b] text-white">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={submitting || !name || !content || !captchaAnswer} 
              className="bg-[#00d4ff]/90 hover:bg-[#00d4ff] text-[#0a0e17] font-semibold font-mono flex items-center gap-2"
            >
              {submitting ? "Posting..." : "Post Comment"} <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
