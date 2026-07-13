"use client"
import { ScoreTier } from "@/types"

interface Props {
  score: number
  tier: ScoreTier
}

const tierColor: Record<ScoreTier, string> = {
  strong: "#16A34A",
  low_risk: "#2563EB",
  medium_risk: "#D97706",
  high_risk: "#DC2626",
}

export default function ScoreGauge({ score, tier }: Props) {
  const percentage = (score / 1000) * 100
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center relative">
      {/* Glow effect matching tier color */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-10 transition-colors duration-1000"
        style={{ backgroundColor: tierColor[tier], transform: "scale(0.8)" }}
      ></div>
      
      <div className="relative w-48 h-48 drop-shadow-sm">
        <svg className="w-full h-full -rotate-90 transform-gpu" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F5F7FA" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={tierColor[tier]}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black tracking-tighter" style={{ color: tierColor[tier] }}>{score}</span>
          <span className="text-xs font-bold text-alu-gray-dark uppercase tracking-widest mt-1">/ 1000</span>
        </div>
      </div>
    </div>
  )
}
