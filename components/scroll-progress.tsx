"use client"

import { useEffect, useState } from "react"

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      
      const scrollable = documentHeight - windowHeight
      
      if (scrollable > 0) {
        const scrolled = (scrollY / scrollable) * 100
        setProgress(Math.min(100, Math.max(0, scrolled)))
      } else {
        setProgress(0)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // Call once to set initial progress
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-transparent pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(0,212,255,0.7)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
