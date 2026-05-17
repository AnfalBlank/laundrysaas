"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon3D } from "@/components/ui/icon3d";
import {
  WashingMachine3D,
  SoapBubbles3D,
  ShirtFolded3D,
  Hanger3D,
} from "@/components/ui/laundry-icons";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/30 relative overflow-hidden">
      {/* Decorative bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary-200/40 to-accent-200/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-100/20 blur-3xl" />
      </div>

      {/* Left: form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
            <Icon3D variant="blue" size="md">
              <Sparkles size={20} />
            </Icon3D>
            <div>
              <div className="font-bold text-slate-900">LaundryHub</div>
              <div className="text-[11px] text-slate-500">Laundry ERP SaaS</div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">Selamat datang kembali</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Masuk ke dashboard untuk mengelola laundry Anda
          </p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                placeholder="email@laundryhub.id"
                defaultValue="owner@laundrysukses.id"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                  Lupa?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600" defaultChecked />
              Ingat saya selama 30 hari
            </label>

            <Link href="/" className="block">
              <Button size="lg" className="w-full">
                Masuk Sekarang
              </Button>
            </Link>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            atau
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Button variant="secondary" size="lg" className="w-full">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>{" "}
            Masuk dengan Google
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun?{" "}
            <Link href="#" className="font-semibold text-primary-600 hover:text-primary-700">
              Daftar gratis 14 hari
            </Link>
          </p>
        </div>
      </div>

      {/* Right: illustration panel */}
      <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white overflow-hidden">
        <div className="absolute top-10 left-10">
          <SoapBubbles3D className="w-20 h-20" />
        </div>
        <div className="absolute top-1/4 right-12">
          <ShirtFolded3D className="w-16 h-16" />
        </div>
        <div className="absolute bottom-1/3 left-16">
          <Hanger3D className="w-16 h-16" />
        </div>
        <div className="absolute bottom-10 right-20">
          <SoapBubbles3D className="w-14 h-14" />
        </div>

        <div className="relative text-center px-12">
          <WashingMachine3D className="w-44 h-44 mx-auto" />
          <h2 className="text-3xl font-bold mt-6">Kelola laundry, lebih mudah</h2>
          <p className="mt-3 opacity-90 leading-relaxed">
            WhatsApp automation, pickup &amp; delivery, multi cabang, dan AI analytics dalam satu
            platform yang dirancang khusus untuk bisnis laundry modern Indonesia.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { v: "10K+", l: "Order/hari" },
              { v: "1,200+", l: "Outlet aktif" },
              { v: "99.9%", l: "Uptime" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 backdrop-blur p-3">
                <div className="text-2xl font-bold">{s.v}</div>
                <div className="text-[11px] opacity-80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
