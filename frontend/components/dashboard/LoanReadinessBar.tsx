interface Props {
  label: string
  percentage: number
}

export default function LoanReadinessBar({ label, percentage }: Props) {
  const color =
    percentage >= 70 ? "bg-green-500" :
    percentage >= 50 ? "bg-blue-500" :
    percentage >= 30 ? "bg-amber-500" : "bg-red-500"

  const gradientColor = 
    percentage >= 70 ? "from-green-400 to-green-600" :
    percentage >= 50 ? "from-blue-400 to-blue-600" :
    percentage >= 30 ? "from-amber-400 to-amber-600" : "from-red-400 to-red-600"

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-alu-gray-dark group-hover:text-alu-blue transition-colors">{label}</span>
        <span className="text-sm font-black text-alu-blue">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-alu-gray rounded-full h-3 overflow-hidden border border-alu-border/50 shadow-inner">
        <div
          className={`bg-gradient-to-r ${gradientColor} h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>
    </div>
  )
}
