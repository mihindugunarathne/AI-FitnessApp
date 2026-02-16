export default function ProgressBar({
  value,
  max = 100,
  variant = "teal",
  className = "",
}: {
  value: number
  max?: number
  variant?: "teal" | "muted"
  className?: string
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const isOverLimit = value > max

  const fillClass =
    isOverLimit
      ? "bg-red-500"
      : variant === "muted"
        ? "bg-teal-700"
        : "bg-[#14b8a6]"

  return (
    <div className={className}>
      <div className="w-full h-2.5 bg-slate-200 dark:bg-[#1e293b] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
