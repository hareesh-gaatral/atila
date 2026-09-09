export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1e293b] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="pt-16">
        <div className="min-h-[50vh] flex items-center bg-gradient-to-br from-navy to-[#1a3b5c] dark:from-[#0f172a] dark:to-[#1e293b]">
          <div className="max-w-7xl mx-auto px-4 py-20 w-full">
            <div className="h-5 w-32 bg-white/20 rounded animate-pulse mb-8"></div>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/10 rounded-2xl animate-pulse flex-shrink-0"></div>
              <div className="w-full">
                <div className="h-10 w-1/2 bg-white/20 rounded animate-pulse mb-4"></div>
                <div className="h-5 w-40 bg-white/20 rounded animate-pulse mb-3"></div>
                <div className="h-5 w-full bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
