"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, MessageCircle, User, LogOut, X, ArrowLeftRight } from "lucide-react";
import { Icon3D } from "@/components/ui/icon3d";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AuthUser } from "@/lib/auth-types";
import { ROLE_LABELS } from "@/lib/auth-types";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  currentUser?: AuthUser | null;
  allUsers?: { id: string; name: string; email: string; role: string; branchName: string | null }[];
}

const notifications = [
  { id: 1, text: "Order INV-20240517-005 menunggu pickup", time: "5 mnt", unread: true },
  { id: 2, text: "Stok Pewangi Lavender di bawah minimum", time: "30 mnt", unread: true },
  { id: 3, text: "Pembayaran Rp 180.000 diterima (QRIS)", time: "1 jam", unread: true },
  { id: 4, text: "Customer baru: Hendra Wijaya", time: "2 jam", unread: true },
  { id: 5, text: "Driver Pak Rudi selesai pickup", time: "3 jam", unread: true },
];

const roleColors: Record<string, "blue" | "purple" | "amber" | "cyan" | "orange"> = {
  owner: "purple",
  admin: "blue",
  staff: "cyan",
  driver: "orange",
};

export function Topbar({
  title,
  subtitle,
  onMenuClick,
  currentUser,
  allUsers = [],
}: TopbarProps) {
  const router = useRouter();
  const toast = useToast();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [switching, setSwitching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/orders?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/switch", { method: "DELETE" });
      toast.success("Logout berhasil");
      setTimeout(() => router.push("/login"), 500);
    } catch {
      toast.error("Gagal logout");
    }
  };

  const switchUser = async (userId: string, name: string, role: string) => {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Login sebagai ${name}`, ROLE_LABELS[role as keyof typeof ROLE_LABELS]);
      setShowSwitcher(false);
      setShowProfile(false);
      // Navigate to dashboard and refresh
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal switch user");
    } finally {
      setSwitching(false);
    }
  };

  const displayName = currentUser?.name ?? "Owner";
  const displayRole = currentUser?.role
    ? ROLE_LABELS[currentUser.role as keyof typeof ROLE_LABELS]
    : "Owner";
  const avatarVariant = currentUser
    ? roleColors[currentUser.role] ?? "amber"
    : "amber";

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

          <form onSubmit={handleSearch} className="hidden md:block relative w-56 lg:w-72 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari order, customer..."
              className="pl-9 h-9 bg-slate-50 border-slate-200"
            />
          </form>

          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

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
              <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[100px]">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">{displayRole}</div>
            </div>
            <Icon3D variant={avatarVariant} size="md">
              <User size={18} />
            </Icon3D>
          </button>
        </div>

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
          <div className="absolute right-4 top-[60px] w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="font-semibold text-sm text-slate-900">{displayName}</div>
              <div className="text-xs text-slate-500">{currentUser?.email ?? "—"}</div>
              <div className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md">
                {displayRole}
              </div>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  setShowSwitcher(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeftRight size={14} /> Switch User (Demo)
              </button>
              {currentUser?.role === "owner" && (
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
              )}
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
        </div>
      )}

      {/* User Switcher Modal (demo) */}
      {showSwitcher && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowSwitcher(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Switch User (Demo)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test dashboard berbeda per role
                </p>
              </div>
              <button
                onClick={() => setShowSwitcher(false)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              {allUsers.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  Belum ada user lain
                </div>
              )}
              {allUsers.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => !isCurrent && switchUser(u.id, u.name, u.role)}
                    disabled={isCurrent || switching}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isCurrent
                        ? "bg-primary-50 border border-primary-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Icon3D
                      variant={
                        roleColors[u.role] ?? "blue"
                      }
                      size="md"
                    >
                      <User size={18} />
                    </Icon3D>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-semibold text-sm text-slate-900 truncate flex items-center gap-2">
                        {u.name}
                        {isCurrent && (
                          <span className="text-[9px] bg-primary-600 text-white px-1.5 py-0.5 rounded">
                            AKTIF
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}
                        {u.branchName && ` · ${u.branchName}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
