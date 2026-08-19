"use client"

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

import MarkdownRenderer from './markdown-renderer'

interface BlogAIChatProps {
  blogContext: {
    title: string
    tags: string[]
    content: string
  }
}

export default function BlogAIChat({ blogContext }: BlogAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      blogContext
    }
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        title="Ask AI about this article"
      >
        <Sparkles className="w-6 h-6 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle className="w-6 h-6 group-hover:opacity-0 transition-opacity" />
      </button>

      {/* Chat Window Overlay */}
      <div 
        className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[400px] h-full sm:h-[600px] bg-[#0b1121] sm:rounded-2xl border border-[#1e293b] shadow-2xl flex flex-col transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#0d1525] sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#0b1121] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#00d4ff]" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Blog AI Assistant</h3>
              <p className="text-[#8892a4] text-xs">Ask anything about this article</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#8892a4] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <Sparkles className="w-10 h-10 text-[#00d4ff]" />
              <p className="text-[#8892a4] text-sm">
                Hi! I've read this article.<br />What would you like to know?
              </p>
            </div>
          )}
          
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-[#1e293b]' : 'bg-[#00d4ff]/10 text-[#00d4ff]'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-[#8892a4]" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed overflow-x-auto ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-[#00d4ff] to-[#a855f7] text-white rounded-tr-sm' 
                  : 'bg-[#1e293b] text-[#e2e8f0] rounded-tl-sm'
              }`}>
                {m.role === 'user' ? (
                  m.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                ) : (
                  <MarkdownRenderer 
                    content={m.content} 
                    className="prose-sm max-w-none !my-0 [&>p]:mb-3 [&>p:last-child]:mb-0 [&_pre]:my-3 [&_h3]:mt-4 [&_h3]:mb-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_hr]:my-4" 
                  />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-sm bg-[#1e293b] text-[#e2e8f0] text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#8892a4] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#8892a4] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-[#8892a4] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#1e293b] bg-[#0b1121] sm:rounded-b-2xl">
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              className="w-full bg-[#161f33] border border-[#1e293b] text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50 transition-all placeholder:text-[#475569]"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
