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
      handle.className = 'resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-[#00d4ff] rounded-tl-lg rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity z-10'
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

  // Copy code blocks
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const copyBtns = container.querySelectorAll<HTMLButtonElement>('.copy-code-btn')
    
    const handlers = Array.from(copyBtns).map(btn => {
      const handler = async () => {
        try {
          const code = decodeURIComponent(btn.getAttribute('data-code') || '')
          await navigator.clipboard.writeText(code)
          
          const copyIcon = btn.querySelector('.copy-icon')
          const checkIcon = btn.querySelector('.check-icon')
          
          if (copyIcon) copyIcon.classList.add('hidden')
          if (checkIcon) checkIcon.classList.remove('hidden')
          
          setTimeout(() => {
            if (copyIcon) copyIcon.classList.remove('hidden')
            if (checkIcon) checkIcon.classList.add('hidden')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy code:', err)
        }
      }
      btn.addEventListener('click', handler)
      return { btn, handler }
    })
    
    return () => {
      handlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler))
    }
  }, [content])

  const renderMarkdown = (text: string): string => {
    let html = text

    // Code blocks first (before HTML escaping)
    const codeBlocks: string[] = []
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = codeBlocks.length
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      const encodedCode = encodeURIComponent(code)
      codeBlocks.push(
        `<div class="relative group my-6"><pre class="bg-[#070b14] border border-[#1a2235] rounded-xl p-5 overflow-x-auto"><div class="flex items-center gap-2 mb-3 text-[#484f58] text-xs font-mono">${lang ? `<span class="bg-[#0c1120] px-2 py-0.5 rounded text-[#4a5568]">${lang}</span>` : ''}</div><code class="text-[#e2e8f0] text-sm font-mono leading-relaxed">${escaped}</code></pre><button class="copy-code-btn absolute top-3 right-3 bg-[#1e293b]/50 hover:bg-[#1e293b] text-[#8892a4] hover:text-[#00d4ff] p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-transparent hover:border-[#2a3a55]" data-code="${encodedCode}" title="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon hidden"><polyline points="20 6 9 17 4 12"/></svg></button></div>`
      )
      return `%%CODEBLOCK_${idx}%%`
    })

    // Inline code (before escaping)
    const inlineCodes: string[] = []
    html = html.replace(/`([^`]+)`/g, (_, code) => {
      const idx = inlineCodes.length
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      inlineCodes.push(`<code class="bg-[#0f1729] text-[#ff5288] px-1.5 py-0.5 rounded text-sm font-mono border border-[#1e293b]">${escaped}</code>`)
      return `%%INLINECODE_${idx}%%`
    })

    // Escape HTML
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // Images - !(alt)[url] or !(alt)[url =WIDTH]
    html = html.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+=(\d+))?\)/g,
      (_, alt, url, width) => {
        const widthStyle = width ? `width: ${width}px;` : 'width: 100%; max-width: 42rem;';
        return `<figure class="my-6 relative group inline-block max-w-full"><img src="${url}" data-url="${url}" alt="${alt}" class="rounded-xl border border-[#1e293b] shadow-lg resizable-image" style="${widthStyle}" /><figcaption class="text-center text-[#4a5568] text-sm mt-2 italic">${alt}</figcaption></figure>`
      }
    )

    // Headers with generated IDs for TOC
    html = html.replace(/^### (.*$)/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h3 id="${id}" class="text-lg font-semibold text-white mt-8 mb-3 flex items-center gap-2 scroll-mt-24"><span class="w-1 h-5 bg-[#00d4ff] rounded-full inline-block"></span>${title}</h3>`
    })
    html = html.replace(/^## (.*$)/gm, (_, title) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return `<h2 id="${id}" class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-[#1a2235] scroll-mt-24">${title}</h2>`
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
      '<blockquote class="border-l-4 border-[#a855f7] bg-[#0c1120]/50 pl-5 pr-4 py-3 my-5 text-[#6b7a8d] italic rounded-r-lg">$1</blockquote>'
    )

    // Unordered lists
    html = html.replace(
      /^- (.*$)/gm,
      '<li class="text-[#e2e8f0] ml-5 list-disc leading-relaxed py-0.5">$1</li>'
    )

    // Ordered lists
    html = html.replace(
      /^\d+\. (.*$)/gm,
      '<li class="text-[#e2e8f0] ml-5 list-decimal leading-relaxed py-0.5">$1</li>'
    )

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[#00d4ff] hover:text-[#38bdf8] underline decoration-[#00d4ff]/30 hover:decoration-[#00d4ff] transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // Tables
    html = html.replace(
      /^\|(.+)\|\s*\n\|([- :|]+)\|\s*\n((?:\|.*\|\s*\n?)*)/gm,
      (match, headerRow, separatorRow, bodyRows) => {
        const parseCells = (rowStr: string) => rowStr.split('|').slice(1, -1).map(c => c.trim());
        const headers = parseCells(`|${headerRow}|`);
        const body = bodyRows.trim().split('\n').filter((r: string) => r.trim().startsWith('|'));
        
        const headerHtml = `<tr>${headers.map(cell => `<th class="px-4 py-3 text-left font-semibold text-white border-b-2 border-[#1e293b] bg-[#0c1120]/80 whitespace-nowrap">${cell}</th>`).join('')}</tr>`;
        
        const bodyHtml = body.map((row: string) => {
          const cells = parseCells(row);
          return `<tr class="hover:bg-[#1e293b]/30 transition-colors">${cells.map(cell => `<td class="px-4 py-3 border-b border-[#1e293b] text-[#cbd5e1] align-top">${cell}</td>`).join('')}</tr>`;
        }).join('');
        
        return `<div class="overflow-x-auto my-6 border border-[#1e293b] rounded-xl shadow-sm"><table class="w-full text-sm text-left border-collapse"><thead>${headerHtml}</thead><tbody class="divide-y divide-[#1e293b] bg-[#0b1121]/50">${bodyHtml}</tbody></table></div>\n`;
      }
    )

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-[#1a2235] my-8" />')

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, '</p><p class="text-[#e2e8f0] leading-relaxed mb-4">')
    html = '<p class="text-[#e2e8f0] leading-relaxed mb-4">' + html + '</p>'

    // Single line breaks
    html = html.replace(/\n/g, '<br />')

    // Clean up empty paragraphs
    html = html.replace(/<p class="text-\[#e2e8f0\] leading-relaxed mb-4"><\/p>/g, '')
    html = html.replace(/<p class="text-\[#e2e8f0\] leading-relaxed mb-4"><br \/><\/p>/g, '')

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
