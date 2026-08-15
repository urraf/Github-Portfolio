export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Sticky Header Skeleton */}
      <header className="border-b border-[#21262d] bg-[#010409]/95 backdrop-blur-md px-4 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <div className="h-4 w-4 rounded bg-[#21262d] animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-[#21262d] animate-pulse" />
          <div className="h-4 w-48 rounded bg-[#21262d] animate-pulse" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 lg:max-w-4xl w-full">
          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-16 rounded-full bg-[#21262d] animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-[#21262d] animate-pulse" />
            <div className="h-6 w-14 rounded-full bg-[#21262d] animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-3 mb-6">
            <div className="h-10 w-full rounded bg-[#21262d] animate-pulse" />
            <div className="h-10 w-3/4 rounded bg-[#21262d] animate-pulse" />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-7 w-7 rounded-full bg-[#21262d] animate-pulse" />
            <div className="h-4 w-20 rounded bg-[#21262d] animate-pulse" />
            <div className="h-4 w-24 rounded bg-[#21262d] animate-pulse" />
            <div className="h-4 w-16 rounded bg-[#21262d] animate-pulse" />
          </div>

          {/* Hero Image Skeleton */}
          <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl bg-[#21262d] animate-pulse mb-12" />

          {/* Content Skeleton */}
          <div className="bg-[#161b22]/80 border border-[#30363d] rounded-2xl p-6 sm:p-10 lg:p-12">
            <div className="space-y-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`h-4 rounded bg-[#21262d] animate-pulse`} style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${i * 50}ms` }} />
              ))}
              <div className="h-8 w-1/3 rounded bg-[#21262d] animate-pulse mt-8" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`p2-${i}`} className={`h-4 rounded bg-[#21262d] animate-pulse`} style={{ width: `${50 + Math.random() * 50}%`, animationDelay: `${(i + 12) * 50}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block w-[350px] flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div className="bg-[#161b22]/50 border border-[#30363d] rounded-2xl p-6 space-y-3">
              <div className="h-5 w-32 rounded bg-[#21262d] animate-pulse" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 w-full rounded bg-[#21262d] animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
            <div className="bg-[#161b22]/50 border border-[#30363d] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#21262d] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-[#21262d] animate-pulse" />
                  <div className="h-3 w-28 rounded bg-[#21262d] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
