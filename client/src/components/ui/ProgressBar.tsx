export default function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);
    const isOverLimit = value > max;

    return (
        <div className={className}>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${isOverLimit ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
