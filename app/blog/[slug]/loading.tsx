export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#e2e8f0]">
      {/* Header Skeleton */}
      <header className="border-b border-[#1a2235] bg-[#060a13]/95 backdrop-blur-xl px-4 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <div className="h-4 w-4 rounded bg-[#0f1729] animate-pulse" />
          <div className="h-5 w-px bg-[#1a2235]" />
          <div className="h-4 w-4 rounded bg-[#0f1729] animate-pulse" />
          <div className="h-4 w-40 rounded bg-[#0f1729] animate-pulse" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 lg:max-w-4xl w-full">
          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-20 rounded-full bg-[#0f1729] animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-[#0f1729] animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-[#0f1729] animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-3 mb-8">
            <div className="h-12 w-full rounded-lg bg-[#0f1729] animate-pulse" />
            <div className="h-12 w-3/4 rounded-lg bg-[#0f1729] animate-pulse" />
          </div>

          {/* Meta line */}
          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-[#1a2235]">
            <div className="h-8 w-8 rounded-full bg-[#0f1729] animate-pulse" />
            <div className="h-4 w-16 rounded bg-[#0f1729] animate-pulse" />
            <div className="h-4 w-px bg-[#1a2235]" />
            <div className="h-4 w-28 rounded bg-[#0f1729] animate-pulse" />
            <div className="h-4 w-px bg-[#1a2235]" />
            <div className="h-4 w-20 rounded bg-[#0f1729] animate-pulse" />
          </div>

          {/* Hero Image */}
          <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl bg-[#0f1729] animate-pulse mb-12 border border-[#1a2235]" />

          {/* Content */}
          <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6 sm:p-10 lg:p-12">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`h-${i}`} className="space-y-4">
                  {i > 0 && <div className="h-7 w-2/5 rounded bg-[#0f1729] animate-pulse mt-8" />}
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={`l-${i}-${j}`} className="h-4 rounded bg-[#0f1729] animate-pulse" style={{ width: `${55 + Math.random() * 45}%`, animationDelay: `${(i * 4 + j) * 60}ms` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* TOC Skeleton */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 rounded-full bg-[#a855f7] animate-pulse" />
                <div className="h-5 w-32 rounded bg-[#0f1729] animate-pulse" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 rounded bg-[#0f1729] animate-pulse" style={{ width: `${50 + Math.random() * 50}%`, marginLeft: i % 3 === 2 ? '16px' : '0' }} />
              ))}
            </div>
            {/* Author Skeleton */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#0f1729] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-[#0f1729] animate-pulse" />
                  <div className="h-3 w-28 rounded bg-[#0f1729] animate-pulse" />
                </div>
              </div>
            </div>
            {/* Recommended Skeleton */}
            <div className="bg-[#0c1120]/80 border border-[#1a2235] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 rounded-full bg-[#00ff88] animate-pulse" />
                <div className="h-5 w-28 rounded bg-[#0f1729] animate-pulse" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-14 w-14 rounded-lg bg-[#0f1729] animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-full rounded bg-[#0f1729] animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-[#0f1729] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
