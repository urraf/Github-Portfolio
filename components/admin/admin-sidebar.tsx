"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Code,
  Briefcase,
  Wrench,
  Trophy,
  GraduationCap,
  FileText,
  Upload,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  FileCode,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/profile", label: "Profile", icon: User },
  { href: "/admin/dashboard/projects", label: "Projects", icon: Code },
  { href: "/admin/dashboard/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/dashboard/skills", label: "Skills", icon: Wrench },
  { href: "/admin/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/dashboard/education", label: "Education", icon: GraduationCap },
  { href: "/admin/dashboard/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/dashboard/html-projects", label: "HTML Projects", icon: FileCode },
  { href: "/admin/dashboard/resume", label: "Resume", icon: Upload },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    window.location.href = "/admin"
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"
        } min-h-screen bg-[#010409] border-r border-[#21262d] flex flex-col transition-all duration-300 flex-shrink-0`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#21262d] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#238636] to-[#58a6ff] flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[#21262d] text-[#7d8590] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-[#21262d] text-[#58a6ff] border border-[#30363d]"
                  : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#161b22]"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#21262d] space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#161b22] transition-all ${collapsed ? "justify-center" : ""
            }`}
          title={collapsed ? "View Portfolio" : undefined}
          target="_blank"
        >
          <FileText className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>View Portfolio</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#f85149] hover:text-[#ff7b72] hover:bg-[#f85149]/10 transition-all w-full ${collapsed ? "justify-center" : ""
            }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
