"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth")
        const data = await res.json()
        if (data.authenticated) {
          setAuthenticated(true)
        } else {
          router.push("/admin")
        }
      } catch {
        router.push("/admin")
      }
    }
    checkAuth()
  }, [router])

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
          <span className="text-[#7d8590] text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0d1117] flex overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
