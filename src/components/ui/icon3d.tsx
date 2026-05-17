"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, type CSSProperties } from "react";

type Size = "sm" | "md" | "lg" | "xl";

type Variant =
  | "blue"
  | "cyan"
  | "purple"
  | "pink"
  | "amber"
  | "green"
  | "red"
  | "indigo"
  | "teal"
  | "orange";

const sizeMap: Record<Size, string> = {
  sm: "w-9 h-9 text-base rounded-xl",
  md: "w-12 h-12 text-xl rounded-2xl",
  lg: "w-16 h-16 text-2xl rounded-2xl",
  xl: "w-20 h-20 text-3xl rounded-3xl",
};

const variantStyles: Record<Variant, { from: string; to: string; shadow: string }> = {
  blue: { from: "#60a5fa", to: "#2563eb", shadow: "rgba(37, 99, 235, 0.45)" },
  cyan: { from: "#67e8f9", to: "#0891b2", shadow: "rgba(8, 145, 178, 0.45)" },
  purple: { from: "#c084fc", to: "#7c3aed", shadow: "rgba(124, 58, 237, 0.45)" },
  pink: { from: "#f9a8d4", to: "#db2777", shadow: "rgba(219, 39, 119, 0.45)" },
  amber: { from: "#fcd34d", to: "#d97706", shadow: "rgba(217, 119, 6, 0.45)" },
  green: { from: "#86efac", to: "#16a34a", shadow: "rgba(22, 163, 74, 0.45)" },
  red: { from: "#fca5a5", to: "#dc2626", shadow: "rgba(220, 38, 38, 0.45)" },
  indigo: { from: "#a5b4fc", to: "#4338ca", shadow: "rgba(67, 56, 202, 0.45)" },
  teal: { from: "#5eead4", to: "#0d9488", shadow: "rgba(13, 148, 136, 0.45)" },
  orange: { from: "#fdba74", to: "#ea580c", shadow: "rgba(234, 88, 12, 0.45)" },
};

interface Icon3DProps {
  children: ReactNode;
  size?: Size;
  variant?: Variant;
  className?: string;
  /** @deprecated animation removed for static design */
  animate?: "float" | "wiggle" | "spin" | "none";
  /** @deprecated tilt removed, kept for backward compat */
  interactive?: boolean;
}

/**
 * Static 3D icon container — no animations, no tilt.
 * Wraps any icon with a glossy glass-morphism gradient surface.
 */
export function Icon3D({
  children,
  size = "md",
  variant = "blue",
  className,
}: Icon3DProps) {
  const v = variantStyles[variant];

  const style = {
    "--from": v.from,
    "--to": v.to,
    "--shadow": v.shadow,
  } as CSSProperties;

  return (
    <div
      className={cn("icon-3d shrink-0", sizeMap[size], className)}
      style={style}
    >
      <span className="text-white relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </span>
    </div>
  );
}
