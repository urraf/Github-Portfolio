"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  
  // Manual Stats State
  const [statsOverride, setStatsOverride] = useState({
    manualGithubRepos: "",
    manualLeetcodeRating: "",
    manualCodeforcesRating: "",
    totalProblemsSolved: ""
  })
  const [savingExtra, setSavingExtra] = useState(false)
  const [extraStatus, setExtraStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Load portfolio settings
  useState(() => {
    fetch("/api/admin/portfolio")
      .then(r => r.json())
      .then(data => {
        setStatsOverride({
          manualGithubRepos: data.manualGithubRepos?.toString() || "",
          manualLeetcodeRating: data.manualLeetcodeRating?.toString() || "",
          manualCodeforcesRating: data.manualCodeforcesRating?.toString() || "",
          totalProblemsSolved: data.totalProblemsSolved?.toString() || (data.extraProblemsSolved?.toString() || "")
        })
      })
      .catch(() => {})
  })

  const handleSaveExtraProblems = async (e: React.FormEvent) => {
    e.preventDefault()
    setExtraStatus(null)
    setSavingExtra(true)
    
    try {
      const payload = {
        manualGithubRepos: statsOverride.manualGithubRepos ? statsOverride.manualGithubRepos : null,
        manualLeetcodeRating: statsOverride.manualLeetcodeRating ? statsOverride.manualLeetcodeRating : null,
        manualCodeforcesRating: statsOverride.manualCodeforcesRating ? statsOverride.manualCodeforcesRating : null,
        totalProblemsSolved: statsOverride.totalProblemsSolved ? statsOverride.totalProblemsSolved : null,
      };

      const res = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setExtraStatus({ type: "success", message: "Manual stats overrides updated!" })
      } else {
        setExtraStatus({ type: "error", message: "Failed to update" })
      }
    } catch {
      setExtraStatus({ type: "error", message: "Connection error" })
    }
    setSavingExtra(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords don't match" })
      return
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "New password must be at least 6 characters" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: "success", message: "Password changed successfully! You will stay logged in." })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setStatus({ type: "error", message: data.error || "Failed to change password" })
      }
    } catch {
      setStatus({ type: "error", message: "Connection error" })
    }
    setSaving(false)
  }

  const ic = "bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#58a6ff]"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#7d8590] mt-1">Manage your admin account settings</p>
      </div>

      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${status.type === "success" ? "bg-[#238636]/10 border border-[#238636]/20 text-[#3fb950]" : "bg-[#f85149]/10 border border-[#f85149]/20 text-[#f85149]"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{status.message}</span>
        </div>
      )}

      <Card className="bg-[#161b22] border-[#30363d]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-[#58a6ff]" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e6edf3]">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className={`${ic} pr-10`}
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-white">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e6edf3]">New Password</label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={`${ic} pr-10`}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-white">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e6edf3]">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={ic}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[#f85149] text-xs">Passwords don&apos;t match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="bg-[#238636] hover:bg-[#2ea043] text-white border-0"
            >
              {saving ? "Changing..." : <><Save className="h-4 w-4 mr-2" />Change Password</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#161b22] border-[#30363d]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-[#58a6ff]" />
            Manual Stats Overrides
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-[#8b949e] text-sm mb-4">
            Leave a field <strong>empty</strong> to automatically fetch and display live data from GitHub, LeetCode, and Codeforces. Fill in a number to force that stat to display exactly what you type here.
          </p>
          {extraStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${extraStatus.type === "success" ? "bg-[#238636]/10 border border-[#238636]/20 text-[#3fb950]" : "bg-[#f85149]/10 border border-[#f85149]/20 text-[#f85149]"}`}>
              {extraStatus.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{extraStatus.message}</span>
            </div>
          )}
          <form onSubmit={handleSaveExtraProblems} className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">GitHub Repos</label>
                <Input
                  type="text"
                  placeholder="e.g. 35+"
                  value={statsOverride.manualGithubRepos}
                  onChange={e => setStatsOverride({...statsOverride, manualGithubRepos: e.target.value})}
                  className={ic}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">LeetCode Rating</label>
                <Input
                  type="text"
                  placeholder="e.g. 1800"
                  value={statsOverride.manualLeetcodeRating}
                  onChange={e => setStatsOverride({...statsOverride, manualLeetcodeRating: e.target.value})}
                  className={ic}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Codeforces Rating</label>
                <Input
                  type="text"
                  placeholder="e.g. 1500+"
                  value={statsOverride.manualCodeforcesRating}
                  onChange={e => setStatsOverride({...statsOverride, manualCodeforcesRating: e.target.value})}
                  className={ic}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Total Problems Solved</label>
                <Input
                  type="text"
                  placeholder="e.g. 800+"
                  value={statsOverride.totalProblemsSolved}
                  onChange={e => setStatsOverride({...statsOverride, totalProblemsSolved: e.target.value})}
                  className={ic}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={savingExtra}
              className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 mt-4"
            >
              {savingExtra ? "Saving..." : <><Save className="h-4 w-4 mr-2" />Save Overrides</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
