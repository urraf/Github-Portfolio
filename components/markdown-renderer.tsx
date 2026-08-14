"use client"

import React, { useEffect, useRef } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
  isEditable?: boolean
  onContentChange?: (newContent: string) => void
}

export default function MarkdownRenderer({ content, className = "", isEditable = false, onContentChange }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditable || !onContentChange || !containerRef.current) return

    const container = containerRef.current
    const images = container.querySelectorAll<HTMLImageElement>('.resizable-image')

    const cleanupFns: Array<() => void> = []

    images.forEach(img => {
      const figure = img.parentElement
      if (!figure) return

      // Prevent duplicate handles
      if (figure.querySelector('.resize-handle')) return

      const handle = document.createElement('div')
      handle.className = 'resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-[#58a6ff] rounded-tl-lg rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity z-10'
      handle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v6h-6"/><path d="M21 21l-7-7"/></svg>'
      
      figure.appendChild(handle)

      let startX: number, startWidth: number

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(100, startWidth + (e.clientX - startX))
        img.style.width = `${newWidth}px`
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        
        // Save new width
        const finalWidth = Math.round(parseFloat(img.style.width))
        const url = img.getAttribute('data-url')
        if (url) {
          // Find the exact markdown string for this image and replace the width parameter
          // E.g. ![alt](url) -> ![alt](url =WIDTH)
          const newContent = content.replace(
            new RegExp(`(!\\[[^\\]]*\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:\\s+=\\d+)?(\\))`, 'g'),
            `$1 =${finalWidth}$2`
          )
          if (newContent !== content) {
            onContentChange(newContent)
          }
        }
      }

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        startX = e.clientX
        startWidth = img.getBoundingClientRect().width
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }

      handle.addEventListener('mousedown', onMouseDown)
      cleanupFns.push(() => handle.removeEventListener('mousedown', onMouseDown))
    })

    return () => cleanupFns.forEach(fn => fn())
  }, [content, isEditable, onContentChange])

  const renderMarkdown = (text: string): string => {
    let html = text

    // Code blocks first (before HTML escaping)
    const codeBlocks: string[] = []
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = codeBlocks.length
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      codeBlocks.push(
        `<pre class="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 my-6 overflow-x-auto"><div class="flex items-center gap-2 mb-3 text-[#484f58] text-xs font-mono">${lang ? `<span class="bg-[#21262d] px-2 py-0.5 rounded text-[#7d8590]">${lang}</span>` : ''}</div><code class="text-[#e6edf3] text-sm font-mono leading-relaxed">${escaped}</code></pre>`
      )
      return `%%CODEBLOCK_${idx}%%`
    })

    // Inline code (before escaping)
    const inlineCodes: string[] = []
    html = html.replace(/`([^`]+)`/g, (_, code) => {
      const idx = inlineCodes.length
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      inlineCodes.push(`<code class="bg-[#21262d] text-[#ff7b72] px-1.5 py-0.5 rounded text-sm font-mono border border-[#30363d]">${escaped}</code>`)
      return `%%INLINECODE_${idx}%%`
    })

    // Escape HTML
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // Images - !(alt)[url] or !(alt)[url =WIDTH]
    html = html.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+=(\d+))?\)/g,
      (_, alt, url, width) => {
        const widthStyle = width ? `width: ${width}px;` : 'width: 100%; max-width: 42rem;';
        return `<figure class="my-6 relative group inline-block max-w-full"><img src="${url}" data-url="${url}" alt="${alt}" class="rounded-xl border border-[#30363d] shadow-lg resizable-image" style="${widthStyle}" /><figcaption class="text-center text-[#7d8590] text-sm mt-2 italic">${alt}</figcaption></figure>`
      }
    )

    // Headers with generated IDs for TOC
    html = html.replace(/^### (.*$)/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h3 id="${id}" class="text-lg font-semibold text-white mt-8 mb-3 flex items-center gap-2 scroll-mt-24"><span class="w-1 h-5 bg-[#58a6ff] rounded-full inline-block"></span>${title}</h3>`
    })
    html = html.replace(/^## (.*$)/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h2 id="${id}" class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-[#21262d] scroll-mt-24">${title}</h2>`
    })
    html = html.replace(/^# (.*$)/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h1 id="${id}" class="text-2xl sm:text-3xl font-bold text-white mt-10 mb-6 scroll-mt-24">${title}</h1>`
    })

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em class="text-white">$1</em></strong>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em class="text-[#8b949e]">$1</em>')

    // Blockquotes
    html = html.replace(
      /^&gt; (.*$)/gm,
      '<blockquote class="border-l-4 border-[#58a6ff] bg-[#161b22]/50 pl-5 pr-4 py-3 my-5 text-[#8b949e] italic rounded-r-lg">$1</blockquote>'
    )

    // Unordered lists
    html = html.replace(
      /^- (.*$)/gm,
      '<li class="text-[#e6edf3] ml-5 list-disc leading-relaxed py-0.5">$1</li>'
    )

    // Ordered lists
    html = html.replace(
      /^\d+\. (.*$)/gm,
      '<li class="text-[#e6edf3] ml-5 list-decimal leading-relaxed py-0.5">$1</li>'
    )

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[#58a6ff] hover:text-[#79c0ff] underline decoration-[#58a6ff]/30 hover:decoration-[#58a6ff] transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-[#21262d] my-8" />')

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, '</p><p class="text-[#e6edf3] leading-relaxed mb-4">')
    html = '<p class="text-[#e6edf3] leading-relaxed mb-4">' + html + '</p>'

    // Single line breaks
    html = html.replace(/\n/g, '<br />')

    // Clean up empty paragraphs
    html = html.replace(/<p class="text-\[#e6edf3\] leading-relaxed mb-4"><\/p>/g, '')
    html = html.replace(/<p class="text-\[#e6edf3\] leading-relaxed mb-4"><br \/><\/p>/g, '')

    // Restore code blocks and inline codes
    codeBlocks.forEach((block, i) => { html = html.replace(`%%CODEBLOCK_${i}%%`, block) })
    inlineCodes.forEach((code, i) => { html = html.replace(`%%INLINECODE_${i}%%`, code) })

    return html
  }

  return (
    <div
      ref={containerRef}
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
