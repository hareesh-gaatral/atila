export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-[#0f172a] transition-colors duration-500">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a5f] dark:border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#718096] dark:text-gray-400 text-sm">Loading admin...</p>
        </div>
      </div>
    </div>
  );
}
