"use client"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  data: { score: number; calculated_at: string }[]
}

export default function ScoreTrendChart({ data }: Props) {
  const labels = data.map(d =>
    new Date(d.calculated_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })
  )

  const chartData = {
    labels,
    datasets: [{
      label: "Credit Score",
      data: data.map(d => d.score),
      borderColor: "#1B3A6B",
      backgroundColor: "rgba(27, 58, 107, 0.08)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#FFFFFF",
      pointBorderColor: "#1B3A6B",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1B3A6B',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        displayColors: false,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { 
        min: 0, 
        max: 1000, 
        grid: { color: "#F5F7FA", borderDash: [5, 5] },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280' }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280' }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
