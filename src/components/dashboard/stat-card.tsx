"use client";

import { Card } from "@/components/ui/card";
import { Icon3D } from "@/components/ui/icon3d";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: ReactNode;
  variant?: Parameters<typeof Icon3D>[0]["variant"];
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel = "vs kemarin",
  icon,
  variant = "blue",
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card
      className={cn(
        "tilt-card p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {value}
          </p>
          {delta !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold mt-1 flex-wrap",
                positive ? "text-green-600" : "text-red-600"
              )}
            >
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>
                {positive ? "+" : ""}
                {delta}%
              </span>
              <span className="text-slate-400 font-normal">{deltaLabel}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
          <Icon3D variant={variant} size="lg" animate="float">
            {icon}
          </Icon3D>
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary-100/40 to-transparent" />
    </Card>
  );
}
