"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, MessageCircle, User, LogOut, X } from "lucide-react";
import { Icon3D } from "@/components/ui/icon3d";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

const notifications = [
  { id: 1, text: "Order INV-20240517-005 menunggu pickup", time: "5 mnt", unread: true },
  { id: 2, text: "Stok Pewangi Lavender di bawah minimum", time: "30 mnt", unread: true },
  { id: 3, text: "Pembayaran Rp 180.000 diterima (QRIS)", time: "1 jam", unread: true },
  { id: 4, text: "Customer baru: Hendra Wijaya", time: "2 jam", unread: true },
  { id: 5, text: "Driver Pak Rudi selesai pickup", time: "3 jam", unread: true },
];

export function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const toast = useToast();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/orders?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    toast.success("Logout berhasil", "Anda telah keluar dari sistem");
    setTimeout(() => router.push("/login"), 500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
          <button
            onClick={onMenuClick}
            type="button"
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
          <form onSubmit={handleSearch} className="hidden md:block relative w-56 lg:w-72 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari order, customer..."
              className="pl-9 h-9 bg-slate-50 border-slate-200"
            />
          </form>

          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Chat button */}
          <button
            type="button"
            onClick={() => {
              setShowChat(!showChat);
              setShowNotif(false);
              setShowProfile(false);
            }}
            className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
            aria-label="Messages"
          >
            <MessageCircle size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white" />
          </button>

          {/* Notification button */}
          <button
            type="button"
            onClick={() => {
              setShowNotif(!showNotif);
              setShowChat(false);
              setShowProfile(false);
            }}
            className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-rose-500 text-white rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
              {notifications.filter((n) => n.unread).length}
            </span>
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
              setShowChat(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 sm:pl-2 shrink-0"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">Pak Joko</div>
              <div className="text-[11px] text-slate-500 leading-tight">Owner</div>
            </div>
            <Icon3D variant="amber" size="md">
              <User size={18} />
            </Icon3D>
          </button>
        </div>

        {/* Dropdowns */}
        {/* Notification dropdown */}
        {showNotif && (
          <div className="absolute right-4 top-[60px] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Notifikasi</h3>
              <button
                type="button"
                onClick={() => {
                  toast.success("Semua dibaca");
                  setShowNotif(false);
                }}
                className="text-xs text-primary-600 font-semibold hover:text-primary-700"
              >
                Tandai semua dibaca
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setShowNotif(false);
                    toast.info(n.text);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 line-clamp-2">{n.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.time} lalu</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowNotif(false);
                  router.push("/notifications");
                }}
                className="text-xs text-primary-600 font-semibold hover:text-primary-700 w-full text-center"
              >
                Lihat semua notifikasi
              </button>
            </div>
          </div>
        )}

        {/* Chat dropdown */}
        {showChat && (
          <div className="absolute right-4 top-[60px] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Pesan WhatsApp</h3>
              <button
                type="button"
                onClick={() => {
                  setShowChat(false);
                  router.push("/whatsapp");
                }}
                className="text-xs text-primary-600 font-semibold hover:text-primary-700"
              >
                Buka semua
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {[
                { name: "Andi Pratama", msg: "Laundry saya udah selesai belum?", time: "10 mnt" },
                { name: "Budi Santoso", msg: "Mau tambahin parfum lavender", time: "1 jam" },
                { name: "Hendra Wijaya", msg: "Oke siap, ditunggu drivernya", time: "2 jam" },
              ].map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setShowChat(false);
                    router.push("/whatsapp");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.msg}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Profile dropdown */}
        {showProfile && (
          <div className="absolute right-4 top-[60px] w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="font-semibold text-sm text-slate-900">Pak Joko</div>
              <div className="text-xs text-slate-500">owner@laundrysukses.id</div>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  router.push("/settings");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Pengaturan Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-white p-4 md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari order, customer, invoice..."
                className="pl-9"
                autoFocus
              />
            </form>
          </div>
          <div className="text-sm text-slate-500 px-2">
            <p className="font-semibold text-slate-700 mb-2">Pencarian cepat:</p>
            <div className="space-y-1">
              {["INV-20240517", "Andi Pratama", "0812"].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setSearchQuery(q);
                    router.push(`/orders?q=${encodeURIComponent(q)}`);
                    setShowSearch(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showNotif || showChat || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotif(false);
            setShowChat(false);
            setShowProfile(false);
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
