import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
  to?: string;
}

export const StatsCard = ({ icon, label, value, subtext, to }: StatsCardProps) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/40">{label}</span>
        <span className="flex items-center gap-2">
          {icon}
          {to && <ArrowRight aria-hidden="true" className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1" />}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-white/30">{subtext}</p>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={`View ${label.toLowerCase()}`}
        className="group block rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/15 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/10">
      {content}
    </div>
  );
};
