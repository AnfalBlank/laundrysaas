"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  ListChecks,
  CreditCard,
  BarChart3,
  Boxes,
  UserCog,
  MessageCircleMore,
  Megaphone,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Icon3D } from "@/components/ui/icon3d";
import { HouseSimple3D } from "@/components/ui/laundry-icons";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  variant: Parameters<typeof Icon3D>[0]["variant"];
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} />, variant: "blue" },
  { label: "Orders", href: "/orders", icon: <ShoppingBag size={18} />, variant: "cyan", badge: "8" },
  { label: "Pickup & Delivery", href: "/pickup", icon: <Truck size={18} />, variant: "orange" },
  { label: "Customers", href: "/customers", icon: <Users size={18} />, variant: "purple" },
  { label: "Services", href: "/services", icon: <ListChecks size={18} />, variant: "teal" },
  { label: "Payments", href: "/payments", icon: <CreditCard size={18} />, variant: "green" },
  { label: "Reports", href: "/reports", icon: <BarChart3 size={18} />, variant: "indigo" },
  { label: "Inventory", href: "/inventory", icon: <Boxes size={18} />, variant: "amber" },
  { label: "Staff", href: "/staff", icon: <UserCog size={18} />, variant: "pink" },
  { label: "WhatsApp", href: "/whatsapp", icon: <MessageCircleMore size={18} />, variant: "green", badge: "3" },
  { label: "Marketing", href: "/marketing", icon: <Megaphone size={18} />, variant: "red" },
  { label: "Settings", href: "/settings", icon: <Settings size={18} />, variant: "blue" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Lock body scroll only on mobile when drawer is open
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/*
        Desktop: position fixed at left, full height, with own internal scroll.
        Mobile: slide-in drawer with translate-x.
      */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex flex-col w-[280px] lg:w-64 h-screen",
          "border-r border-slate-200 bg-white/95 lg:bg-white/85 backdrop-blur-xl",
          "transition-transform duration-300 ease-out lg:transition-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + close button (sticky top within sidebar) */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <Icon3D variant="blue" size="md">
            <Sparkles size={22} />
          </Icon3D>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 leading-tight">LaundryHub</div>
            <div className="text-[11px] text-slate-500 leading-tight">Laundry ERP SaaS</div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tenant switcher */}
        <div className="px-3 sm:px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-2.5 flex items-center gap-2.5 border border-primary-100/60">
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
              <HouseSimple3D className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                Laundry Sukses
              </div>
              <div className="text-[11px] text-slate-500 truncate">3 cabang aktif</div>
            </div>
          </div>
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 sm:px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon3D
                  variant={item.variant}
                  size="sm"
                  interactive={false}
                  className={cn(
                    "transition-transform",
                    isActive ? "scale-105" : "group-hover:scale-105"
                  )}
                >
                  {item.icon}
                </Icon3D>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Plan card - sticky bottom */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-3.5 text-white shadow-lg shadow-primary-500/30 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="text-[11px] opacity-80">Paket Aktif</div>
              <div className="font-bold text-base">Pro Plan</div>
              <div className="text-[10px] opacity-80 mb-2">Berakhir 12 Juni 2026</div>
              <button className="w-full text-xs font-semibold bg-white text-primary-700 rounded-lg py-1.5 hover:bg-slate-50 transition">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
