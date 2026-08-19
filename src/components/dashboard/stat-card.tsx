import { TrendingUp, TrendingDown } from "lucide-react";

export function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / (max - min || 1)) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="60" height="24" viewBox="0 -5 100 110" preserveAspectRatio="none" className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  sparklineData,
  sparklineColor
}: {
  label: string;
  value: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  sparklineData: number[];
  sparklineColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity blur-2xl ${iconBg.replace('bg-', 'bg-')}`}></div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 relative z-10">
        <div className="order-2 sm:order-1">
          <div className="text-xs sm:text-sm font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">{label}</div>
          <div className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 sm:mt-1">
            {value}
          </div>
        </div>
        <div className={`order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} shadow-sm`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 opacity-90" />
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-3 sm:mt-4">
        <div className={`flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs md:text-sm font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : trend === "down" ? (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : null}
          <span>{trendLabel}</span>
        </div>
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
      </div>
    </div>
  );
}
