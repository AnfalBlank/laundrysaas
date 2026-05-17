"use client";

import { Bell, Search, Menu, MessageCircle, User } from "lucide-react";
import { Icon3D } from "@/components/ui/icon3d";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search - tablet+ */}
        <div className="hidden md:block relative w-56 lg:w-72 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari order, customer..."
            className="pl-9 h-9 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Mobile search button */}
        <button
          className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Messages"
        >
          <MessageCircle size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white" />
        </button>

        <button
          className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-rose-500 text-white rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
            5
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 sm:pl-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight">Pak Joko</div>
            <div className="text-[11px] text-slate-500 leading-tight">Owner</div>
          </div>
          <Icon3D variant="amber" size="md" interactive>
            <User size={18} />
          </Icon3D>
        </div>
      </div>
    </header>
  );
}
