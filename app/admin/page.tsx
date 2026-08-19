"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Command, AlertCircle, Eye, EyeOff, ShieldCheck, TerminalSquare } from "lucide-react"

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const ops = ['+', '-', '×'] as const
  const op = ops[Math.floor(Math.random() * ops.length)]
  let answer: number
  switch (op) {
    case '+': answer = a + b; break
    case '-': answer = a - b; break
    case '×': answer = a * b; break
  }
  return { question: `${a} ${op} ${b} = ?`, answer }
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => { setCaptcha(generateCaptcha()) }, [])

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha())
    setCaptchaInput("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setError("Incorrect captcha answer. Please try again.")
      refreshCaptcha()
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/admin/dashboard")
      } else {
        const data = await res.json()
        setError(data.error || "Invalid password")
        refreshCaptcha()
      }
    } catch {
      setError("Connection error. Please try again.")
      refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic tech background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#8b5cf6]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(1,4,9,0)_40%,rgba(1,4,9,1)_100%)]" />
      </div>

      <Card className="w-full max-w-md bg-[#0d1117]/80 backdrop-blur-xl border-[#3b82f6]/20 relative z-10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <div className="absolute inset-x-0 -top-[1px] mx-auto h-[1px] w-1/2 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
        
        <CardHeader className="text-center pb-6 pt-10">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.4)] relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] blur-md opacity-50 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="h-full w-full rounded-[15px] bg-[#010409] flex items-center justify-center relative z-10">
              <Command className="h-8 w-8 text-[#a78bfa]" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e6edf3] to-[#8b5cf6] tracking-tight">NEXUS</CardTitle>
          <p className="text-[#3b82f6] text-[11px] font-mono tracking-[0.3em] mt-2">SYS.ADMIN_AUTH</p>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f85149]/10 border border-[#f85149]/30 text-[#ff7b72] text-xs font-mono">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#a78bfa] flex items-center gap-2 uppercase tracking-widest">
                <Lock className="h-3 w-3" />
                Auth_Key
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-[#010409]/50 border-[#3b82f6]/30 text-[#e6edf3] placeholder:text-[#484f58] focus-visible:ring-[#8b5cf6]/50 focus-visible:border-[#8b5cf6] pr-10 h-12 font-mono transition-all text-sm shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#e6edf3] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#a78bfa] flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Security_Protocol
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#010409]/50 border border-[#3b82f6]/30 rounded-lg px-4 py-3 select-none flex items-center justify-center shadow-inner">
                  <span className="text-[#60a5fa] font-mono text-lg font-bold tracking-widest">{captcha.question}</span>
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-3.5 rounded-lg bg-[#0d1117] border border-[#3b82f6]/30 text-[#7d8590] hover:text-[#e6edf3] hover:border-[#8b5cf6] hover:shadow-[0_0_10px_rgba(139,92,246,0.2)] transition-all"
                  title="Generate new challenge"
                >
                  ↻
                </button>
              </div>
              <Input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Response..."
                className="bg-[#010409]/50 border-[#3b82f6]/30 text-[#e6edf3] placeholder:text-[#484f58] focus-visible:ring-[#8b5cf6]/50 focus-visible:border-[#8b5cf6] h-12 font-mono text-center text-lg transition-all shadow-inner"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !password || !captchaInput}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white border-0 h-12 font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] mt-2 disabled:opacity-50 disabled:shadow-none text-xs"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 animate-pulse" />
                  INITIALIZING...
                </div>
              ) : (
                "ESTABLISH_CONNECTION"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
