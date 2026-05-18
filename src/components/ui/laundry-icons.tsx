"use client";

import { cn } from "@/lib/utils";

/**
 * Custom 3D-style SVG icons for the LaundryHub system.
 * Designed with gradients, highlights and shadows to feel illustrated/3D.
 * All icons accept a className for sizing (default: w-10 h-10).
 */

type Props = { className?: string };
const base = "drop-shadow-lg";

export function WashingMachine3D({ className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(base, className ?? "w-10 h-10")}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wm-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <radialGradient id="wm-window" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </radialGradient>
        <linearGradient id="wm-bubble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="48" height="54" rx="6" fill="url(#wm-body)" stroke="#0284c7" strokeWidth="1.2" />
      <rect x="12" y="10" width="40" height="6" rx="2" fill="#0ea5e9" opacity="0.4" />
      <circle cx="20" cy="13" r="1.5" fill="#fff" />
      <circle cx="26" cy="13" r="1.5" fill="#fff" />
      <circle cx="32" cy={32} r="16" fill="url(#wm-window)" />
      <circle cx="32" cy={32} r="16" fill="none" stroke="#0c4a6e" strokeWidth="2" />
      <circle cx="28" cy={28} r="3" fill="url(#wm-bubble)" />
      <circle cx="36" cy={36} r="2.5" fill="url(#wm-bubble)" />
      <circle cx="34" cy={26} r="2" fill="url(#wm-bubble)" />
      <circle cx="26" cy={36} r="2" fill="url(#wm-bubble)" />
      <circle cx="50" cy="13" r="2" fill="#22c55e" />
      <circle cx="50" cy="13" r="0.8" fill="#fff" />
    </svg>
  );
}

export function ShirtFolded3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="sh-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <path
        d="M10 22 L24 12 L32 18 L40 12 L54 22 L48 26 L48 50 Q48 54 44 54 L20 54 Q16 54 16 50 L16 26 Z"
        fill="url(#sh-body)"
        stroke="#0284c7"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M24 12 L32 22 L40 12" fill="none" stroke="#0284c7" strokeWidth="1.4" />
      <path d="M22 32 L42 32" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.4" />
      <path d="M22 38 L42 38" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

export function Hanger3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="hg-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M32 12 a4 4 0 1 1 -4 4 M28 18 L8 38 Q4 42 8 44 L56 44 Q60 42 56 38 L36 18 Z"
        fill="url(#hg-grad)"
        stroke="#92400e"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M10 38 L54 38" stroke="#92400e" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function SoapBubbles3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <radialGradient id="bb1" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#7dd3fc" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="38" r="14" fill="url(#bb1)" stroke="#0ea5e9" strokeWidth="0.8" />
      <circle cx="42" cy="26" r="10" fill="url(#bb1)" stroke="#0ea5e9" strokeWidth="0.8" />
      <circle cx="46" cy="46" r="8" fill="url(#bb1)" stroke="#0ea5e9" strokeWidth="0.8" />
      <circle cx="18" cy="34" r="3" fill="#fff" opacity="0.9" />
      <circle cx="38" cy="22" r="2" fill="#fff" opacity="0.9" />
      <circle cx="44" cy="44" r="1.5" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function TruckDelivery3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="tk-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="tk-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="6" y="20" width="32" height="24" rx="3" fill="url(#tk-body)" stroke="#1e3a8a" strokeWidth="1.2" />
      <path d="M38 26 L52 26 Q56 26 56 30 L56 44 L38 44 Z" fill="url(#tk-cab)" stroke="#92400e" strokeWidth="1.2" />
      <rect x="40" y="29" width="12" height="8" rx="1" fill="#bae6fd" stroke="#1e3a8a" strokeWidth="0.8" />
      <circle cx="18" cy="48" r="5" fill="#1f2937" />
      <circle cx="18" cy="48" r="2" fill="#9ca3af" />
      <circle cx="46" cy="48" r="5" fill="#1f2937" />
      <circle cx="46" cy="48" r="2" fill="#9ca3af" />
      <path d="M12 26 L32 26 M12 32 L32 32" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function Receipt3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="rc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <path
        d="M14 6 L50 6 L50 56 L46 52 L42 56 L38 52 L34 56 L30 52 L26 56 L22 52 L18 56 L14 52 Z"
        fill="url(#rc-body)"
        stroke="#92400e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M20 16 L44 16 M20 22 L44 22 M20 28 L36 28 M20 36 L44 36 M20 42 L40 42" stroke="#92400e" strokeWidth="1" opacity="0.7" />
      <circle cx="42" cy="34" r="1.5" fill="#dc2626" />
    </svg>
  );
}

export function Chart3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="8" y="32" width="12" height="22" rx="2" fill="url(#bar1)" />
      <rect x="26" y="20" width="12" height="34" rx="2" fill="url(#bar2)" />
      <rect x="44" y="10" width="12" height="44" rx="2" fill="url(#bar3)" />
      <path d="M6 56 L60 56" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 32 Q24 24 32 20 Q44 14 50 10" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
    </svg>
  );
}

export function Whatsapp3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <radialGradient id="wa-bg" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </radialGradient>
      </defs>
      <path
        d="M32 6 C18 6 8 16 8 30 C8 35 9 39 11 43 L8 56 L22 53 C26 55 29 56 32 56 C46 56 56 46 56 32 C56 18 46 6 32 6 Z"
        fill="url(#wa-bg)"
        stroke="#15803d"
        strokeWidth="1.4"
      />
      <path
        d="M22 22 Q22 18 26 18 Q28 18 28 22 Q28 26 26 28 Q30 36 38 38 Q40 36 42 36 Q46 36 46 40 Q46 44 42 44 Q30 44 22 36 Q22 28 22 22 Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Telegram3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <radialGradient id="tg-bg" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#tg-bg)" stroke="#1d4ed8" strokeWidth="1.4" />
      <path
        d="M16 30 L44 20 C45 19.5 46 20 45.5 21.5 L40 44 C39.8 45 39 45.3 38.2 44.8 L30 39 L26 43 C25.5 43.5 25 43.3 25 42.5 L25.5 37 L39 24.5 C39.5 24 39 23.8 38.3 24.2 L22 35 L16 33 C15 32.7 15 32 16 30 Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Sparkles3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <radialGradient id="sp-grad" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
      <path
        d="M32 8 L36 26 L54 32 L36 38 L32 56 L28 38 L10 32 L28 26 Z"
        fill="url(#sp-grad)"
        stroke="#92400e"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M48 12 L50 18 L56 20 L50 22 L48 28 L46 22 L40 20 L46 18 Z" fill="url(#sp-grad)" stroke="#92400e" strokeWidth="0.8" />
      <path d="M12 44 L14 50 L20 52 L14 54 L12 60 L10 54 L4 52 L10 50 Z" fill="url(#sp-grad)" stroke="#92400e" strokeWidth="0.8" transform="translate(0,-4)" />
    </svg>
  );
}

export function Bag3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="bg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <path d="M22 16 Q22 8 32 8 Q42 8 42 16" fill="none" stroke="#9f1239" strokeWidth="2.5" />
      <path
        d="M14 18 L50 18 L54 54 Q54 58 50 58 L14 58 Q10 58 10 54 Z"
        fill="url(#bg-body)"
        stroke="#9f1239"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="28" r="1.5" fill="#fff" />
      <circle cx="42" cy="28" r="1.5" fill="#fff" />
    </svg>
  );
}

export function Sneaker3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="sn-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <path
        d="M6 42 Q6 30 14 28 L22 26 Q26 18 32 18 L38 18 Q44 18 46 26 L54 30 Q58 32 58 38 L58 44 Q58 48 54 48 L10 48 Q6 48 6 44 Z"
        fill="url(#sn-body)"
        stroke="#1e293b"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M6 44 L58 44" stroke="#1e293b" strokeWidth="2" />
      <path d="M22 26 L24 36 M28 22 L30 36 M34 22 L36 36 M40 24 L42 36" stroke="#1e293b" strokeWidth="1" />
      <circle cx="14" cy="34" r="1.5" fill="#1e293b" />
    </svg>
  );
}

export function User3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="us-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="us-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="22" r="12" fill="url(#us-head)" stroke="#92400e" strokeWidth="1.2" />
      <path
        d="M10 56 Q10 38 32 38 Q54 38 54 56 Z"
        fill="url(#us-body)"
        stroke="#3730a3"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="22" r="1.5" fill="#1e3a8a" />
      <circle cx="36" cy="22" r="1.5" fill="#1e3a8a" />
      <path d="M28 27 Q32 30 36 27" fill="none" stroke="#1e3a8a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function QRCode3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="qr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="6" fill="url(#qr-bg)" />
      <rect x="10" y="10" width="14" height="14" rx="2" fill="#fff" />
      <rect x="14" y="14" width="6" height="6" fill="#0f172a" />
      <rect x="40" y="10" width="14" height="14" rx="2" fill="#fff" />
      <rect x="44" y="14" width="6" height="6" fill="#0f172a" />
      <rect x="10" y="40" width="14" height="14" rx="2" fill="#fff" />
      <rect x="14" y="44" width="6" height="6" fill="#0f172a" />
      <rect x="30" y="10" width="4" height="4" fill="#fff" />
      <rect x="36" y="30" width="4" height="4" fill="#fff" />
      <rect x="30" y="36" width="4" height="4" fill="#fff" />
      <rect x="42" y="42" width="4" height="4" fill="#fff" />
      <rect x="48" y="42" width="4" height="4" fill="#fff" />
      <rect x="42" y="48" width="4" height="4" fill="#fff" />
      <rect x="30" y="44" width="4" height="4" fill="#fff" />
      <rect x="36" y="50" width="4" height="4" fill="#fff" />
      <rect x="50" y="30" width="4" height="4" fill="#fff" />
    </svg>
  );
}

export function Crown3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="cw-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M8 24 L18 36 L24 18 L32 32 L40 18 L46 36 L56 24 L52 50 Q52 54 48 54 L16 54 Q12 54 12 50 Z"
        fill="url(#cw-body)"
        stroke="#92400e"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="24" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
      <circle cx="56" cy="24" r="3" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
      <circle cx="32" cy="32" r="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" />
      <rect x="14" y="46" width="36" height="3" fill="#92400e" opacity="0.6" />
    </svg>
  );
}


export function Detergent3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="dt-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="dt-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="22" y="6" width="20" height="8" rx="2" fill="url(#dt-cap)" stroke="#92400e" strokeWidth="1.2" />
      <path
        d="M16 14 L48 14 L52 22 L52 54 Q52 58 48 58 L16 58 Q12 58 12 54 L12 22 Z"
        fill="url(#dt-body)"
        stroke="#1e3a8a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="20" y="28" width="24" height="18" rx="2" fill="#fff" opacity="0.85" />
      <text x="32" y="40" textAnchor="middle" fontFamily="system-ui" fontSize="9" fontWeight="700" fill="#1e3a8a">
        SOAP
      </text>
    </svg>
  );
}

export function Perfume3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="pf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="pf-spray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <rect x="28" y="6" width="8" height="6" fill="url(#pf-spray)" stroke="#1f2937" strokeWidth="1" />
      <rect x="26" y="12" width="12" height="6" rx="1" fill="url(#pf-spray)" stroke="#1f2937" strokeWidth="1" />
      <path
        d="M14 22 L50 22 L52 56 Q52 58 50 58 L14 58 Q12 58 12 56 Z"
        fill="url(#pf-body)"
        stroke="#9f1239"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <ellipse cx="22" cy="32" rx="5" ry="6" fill="#fff" opacity="0.5" />
      <circle cx="44" cy="14" r="2" fill="#fff" opacity="0.7" />
      <circle cx="48" cy="10" r="1" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export function Package3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="pk-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="pk-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M32 8 L56 18 L32 28 L8 18 Z" fill="url(#pk-top)" stroke="#7c2d12" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 18 L32 28 L32 56 L8 46 Z" fill="url(#pk-side)" stroke="#7c2d12" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M56 18 L32 28 L32 56 L56 46 Z" fill="#d97706" stroke="#7c2d12" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M32 8 L32 28" stroke="#7c2d12" strokeWidth="1.4" />
      <path d="M20 13 L20 41 L32 47 L32 19 Z" fill="#fff" opacity="0.15" />
    </svg>
  );
}

export function Avatar3D({ className, variant = "blue" }: Props & { variant?: "blue" | "purple" | "amber" | "pink" | "cyan" | "green" }) {
  const colors: Record<string, [string, string]> = {
    blue: ["#a5b4fc", "#4338ca"],
    purple: ["#c084fc", "#7c3aed"],
    amber: ["#fde68a", "#d97706"],
    pink: ["#f9a8d4", "#db2777"],
    cyan: ["#67e8f9", "#0891b2"],
    green: ["#86efac", "#16a34a"],
  };
  const [c1, c2] = colors[variant];
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id={`av-head-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`av-body-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="22" r="11" fill={`url(#av-head-${variant})`} stroke="#92400e" strokeWidth="1.2" />
      <path
        d="M12 56 Q12 38 32 38 Q52 38 52 56 Z"
        fill={`url(#av-body-${variant})`}
        stroke="#1e3a8a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="22" r="1.4" fill="#1e3a8a" />
      <circle cx="36" cy="22" r="1.4" fill="#1e3a8a" />
      <path d="M28 27 Q32 30 36 27" fill="none" stroke="#1e3a8a" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Money3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="mn-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect x="6" y="14" width="52" height="36" rx="4" fill="url(#mn-body)" stroke="#14532d" strokeWidth="1.4" />
      <rect x="10" y="18" width="44" height="28" rx="2" fill="none" stroke="#14532d" strokeWidth="1" opacity="0.4" />
      <circle cx="32" cy="32" r="9" fill="#fff" opacity="0.95" stroke="#14532d" strokeWidth="1.2" />
      <text x="32" y="36" textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="900" fill="#14532d">
        Rp
      </text>
      <circle cx="14" cy="32" r="2" fill="#fff" opacity="0.7" />
      <circle cx="50" cy="32" r="2" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export function Diamond3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="dm-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="dm-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
      <path d="M16 22 L32 8 L48 22 L40 22 L32 16 L24 22 Z" fill="url(#dm-top)" stroke="#0c4a6e" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 22 L32 56 L48 22 L40 22 L32 36 L24 22 Z" fill="url(#dm-side)" stroke="#0c4a6e" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M24 22 L32 36 L40 22" fill="none" stroke="#0c4a6e" strokeWidth="1.4" />
      <path d="M16 22 L48 22" stroke="#0c4a6e" strokeWidth="1.4" />
      <path d="M24 22 L32 56" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

export function Trophy3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="tr-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M16 8 L48 8 L48 22 Q48 32 32 36 Q16 32 16 22 Z"
        fill="url(#tr-cup)"
        stroke="#92400e"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 12 Q6 12 6 18 Q6 24 16 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 12 Q58 12 58 18 Q58 24 48 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
      <rect x="26" y="36" width="12" height="10" fill="url(#tr-cup)" stroke="#92400e" strokeWidth="1.4" />
      <rect x="18" y="46" width="28" height="6" rx="1" fill="#92400e" />
      <rect x="14" y="52" width="36" height="6" rx="1" fill="#78350f" />
      <path
        d="M32 16 L34 22 L40 22 L35 26 L37 32 L32 28 L27 32 L29 26 L24 22 L30 22 Z"
        fill="#fff"
        stroke="#92400e"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function Bolt3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="bt-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path
        d="M36 6 L14 36 L28 36 L24 58 L50 28 L36 28 Z"
        fill="url(#bt-body)"
        stroke="#854d0e"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M36 6 L28 36" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function CartIcon3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="ct-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <path
        d="M6 12 L14 12 L20 38 L52 38 L56 18 L20 18"
        fill="none"
        stroke="#0c4a6e"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M22 22 L52 22 L48 34 L24 34 Z" fill="url(#ct-body)" stroke="#0c4a6e" strokeWidth="1.2" />
      <circle cx="24" cy="50" r="5" fill="#1e293b" />
      <circle cx="24" cy="50" r="2" fill="#9ca3af" />
      <circle cx="46" cy="50" r="5" fill="#1e293b" />
      <circle cx="46" cy="50" r="2" fill="#9ca3af" />
    </svg>
  );
}

export function AlertWarning3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="al-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 L58 54 L6 54 Z"
        fill="url(#al-body)"
        stroke="#7f1d1d"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="29" y="20" width="6" height="20" rx="2" fill="#7f1d1d" />
      <circle cx="32" cy="46" r="3" fill="#7f1d1d" />
    </svg>
  );
}

export function HouseSimple3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="hs-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="hs-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path d="M8 30 L32 8 L56 30 L52 30 L52 56 L12 56 L12 30 Z" fill="url(#hs-body)" stroke="#92400e" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 32 L32 8 L58 32 Z" fill="url(#hs-roof)" stroke="#7f1d1d" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="26" y="38" width="12" height="18" fill="#92400e" />
      <circle cx="35" cy="48" r="1" fill="#fde047" />
    </svg>
  );
}

export function Megaphone3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="mg-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <path
        d="M10 26 L34 14 L52 8 L52 56 L34 50 L10 38 Z"
        fill="url(#mg-body)"
        stroke="#9f1239"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="34" y="22" width="4" height="20" fill="#9f1239" opacity="0.5" />
      <path d="M14 30 L18 30 L18 38 L14 38 Z" fill="#9f1239" />
      <path d="M56 18 L60 14 M56 32 L62 32 M56 46 L60 50" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Confetti3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="cf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M8 56 L24 16 L48 40 Z" fill="url(#cf-body)" stroke="#92400e" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="44" cy="14" r="3" fill="#ec4899" />
      <circle cx="52" cy="22" r="2.5" fill="#3b82f6" />
      <rect x="36" y="6" width="3" height="6" fill="#22c55e" transform="rotate(20 38 9)" />
      <rect x="56" y="32" width="3" height="6" fill="#a855f7" transform="rotate(45 58 35)" />
      <circle cx="38" cy="28" r="2" fill="#f59e0b" />
      <rect x="48" y="48" width="3" height="6" fill="#06b6d4" transform="rotate(-30 50 51)" />
    </svg>
  );
}

export function ScissorsTag3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="tg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M8 32 L32 8 L56 8 L56 32 L32 56 Z"
        fill="url(#tg-body)"
        stroke="#92400e"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="18" r="4" fill="#fff" stroke="#92400e" strokeWidth="1.2" />
      <circle cx="46" cy="18" r="1.5" fill="#92400e" />
    </svg>
  );
}

export function RecycleArrows3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="rc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <path
        d="M32 8 A 24 24 0 0 1 56 32 L48 32 L56 44 L64 32 L60 32 A 28 28 0 0 0 32 4 Z"
        fill="url(#rc-grad)"
        stroke="#14532d"
        strokeWidth="1.2"
        strokeLinejoin="round"
        transform="translate(-2,2)"
      />
      <path
        d="M32 56 A 24 24 0 0 1 8 32 L16 32 L8 20 L0 32 L4 32 A 28 28 0 0 0 32 60 Z"
        fill="url(#rc-grad)"
        stroke="#14532d"
        strokeWidth="1.2"
        strokeLinejoin="round"
        transform="translate(2,-2)"
      />
    </svg>
  );
}

export function ZzzMoon3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="mo-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>
      <path
        d="M40 8 A 24 24 0 1 0 56 40 A 18 18 0 0 1 40 8 Z"
        fill="url(#mo-body)"
        stroke="#713f12"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <text x="46" y="22" fontFamily="system-ui" fontSize="10" fontWeight="900" fill="#713f12">Z</text>
      <text x="52" y="14" fontFamily="system-ui" fontSize="7" fontWeight="900" fill="#713f12">z</text>
    </svg>
  );
}

export function ChemicalFlask3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="cm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M24 6 L40 6 L40 22 L52 50 Q54 56 48 56 L16 56 Q10 56 12 50 L24 22 Z"
        fill="url(#cm-body)"
        stroke="#4c1d95"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="22" y="6" width="20" height="3" fill="#4c1d95" />
      <circle cx="22" cy="42" r="2" fill="#fff" opacity="0.7" />
      <circle cx="34" cy="48" r="1.5" fill="#fff" opacity="0.7" />
      <circle cx="40" cy="40" r="1.2" fill="#fff" opacity="0.7" />
      <path d="M16 40 L48 40" stroke="#4c1d95" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
    </svg>
  );
}

export function CrownStar3D({ className }: Props) {
  return Crown3D({ className });
}

export function Scooter3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="sc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <path d="M14 36 L34 36 L40 22 L48 22" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="36" y="18" width="14" height="6" rx="1" fill="url(#sc-body)" stroke="#7c2d12" strokeWidth="1.2" />
      <circle cx="14" cy="48" r="7" fill="#1f2937" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="14" cy="48" r="3" fill="#9ca3af" />
      <circle cx="50" cy="48" r="7" fill="#1f2937" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="50" cy="48" r="3" fill="#9ca3af" />
      <path d="M28 36 L36 48 L44 48" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CarSimple3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="cr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M6 38 L12 24 Q14 20 18 20 L46 20 Q50 20 52 24 L58 38 L58 46 Q58 48 56 48 L48 48 L48 44 L16 44 L16 48 L8 48 Q6 48 6 46 Z"
        fill="url(#cr-body)"
        stroke="#1e3a8a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 22 L48 22 L52 34 L12 34 Z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="1" opacity="0.7" />
      <path d="M32 22 L32 34" stroke="#1e3a8a" strokeWidth="1" opacity="0.5" />
      <circle cx="18" cy="48" r="6" fill="#1f2937" />
      <circle cx="18" cy="48" r="2.5" fill="#9ca3af" />
      <circle cx="46" cy="48" r="6" fill="#1f2937" />
      <circle cx="46" cy="48" r="2.5" fill="#9ca3af" />
    </svg>
  );
}

export function ClockFast3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="cl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="34" r="22" fill="url(#cl-body)" stroke="#92400e" strokeWidth="1.6" />
      <circle cx="32" cy="34" r="22" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <path d="M28 6 L36 6 L36 10 L28 10 Z" fill="#92400e" />
      <path d="M32 34 L32 20 M32 34 L42 38" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="34" r="2" fill="#92400e" />
      <circle cx="32" cy="14" r="0.8" fill="#92400e" />
      <circle cx="32" cy="54" r="0.8" fill="#92400e" />
      <circle cx="12" cy="34" r="0.8" fill="#92400e" />
      <circle cx="52" cy="34" r="0.8" fill="#92400e" />
    </svg>
  );
}
