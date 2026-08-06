import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
}

export const StatsCard = ({ icon, label, value, subtext }: StatsCardProps) => {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/40">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-white/30">{subtext}</p>}
    </div>
  );
};