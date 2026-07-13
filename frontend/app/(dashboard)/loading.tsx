export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-alu-gray/80 rounded-xl mb-3"></div>
          <div className="h-4 w-48 bg-alu-gray/50 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-alu-border/30 h-96">
            <div className="h-6 w-40 bg-alu-gray/80 rounded-lg mb-10"></div>
            <div className="flex justify-center mb-10">
              <div className="w-48 h-48 rounded-full border-8 border-alu-gray/30"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-alu-gray/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-alu-border/30 h-48">
            <div className="h-6 w-56 bg-alu-gray/80 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-alu-gray/30 rounded-full"></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-alu-border/30 h-64">
            <div className="h-6 w-32 bg-alu-gray/80 rounded-lg mb-6"></div>
            <div className="h-40 bg-alu-gray/30 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
