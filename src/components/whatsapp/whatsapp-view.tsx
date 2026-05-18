"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import { Telegram3D, Whatsapp3D, Sparkles3D } from "@/components/ui/laundry-icons";
import { chats } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import {
  Bot,
  CheckCircle2,
  Inbox,
  Bike,
  Sparkles,
  Clock,
  PartyPopper,
  ReceiptText,
  Megaphone,
  Send,
  Zap,
  Check,
} from "lucide-react";

interface Template {
  id: string;
  key: string;
  name: string;
  body: string;
  isActive: boolean;
  sentCount: number;
}

const templateIconMap: Record<
  string,
  { icon: React.ReactNode; variant: Parameters<typeof Icon3D>[0]["variant"] }
> = {
  order_received: { icon: <Inbox size={22} />, variant: "blue" },
  pickup_driver: { icon: <Bike size={22} />, variant: "orange" },
  laundry_done: { icon: <Sparkles size={22} />, variant: "green" },
  reminder_unclaimed: { icon: <Clock size={22} />, variant: "amber" },
  promo_broadcast: { icon: <PartyPopper size={22} />, variant: "pink" },
  invoice_send: { icon: <ReceiptText size={22} />, variant: "purple" },
};

const messages = [
  { fromCustomer: true, text: "Halo, saya mau pickup laundry dong", time: "10:24" },
  {
    fromCustomer: false,
    text: "Halo Kak Andi, tentu. Untuk alamat pickup masih sama yang sebelumnya?",
    time: "10:24",
    isBot: true,
  },
  { fromCustomer: true, text: "Iya, alamat lama. Tolong sore ya jam 4", time: "10:25" },
  {
    fromCustomer: false,
    text: "Sip, pickup terjadwal hari ini jam 16:00 oleh Pak Anto. Estimasi selesai 2 hari kerja.",
    time: "10:25",
    isBot: true,
  },
];

export function WhatsappView({ templates, channel = "whatsapp" }: { templates: Template[]; channel?: string }) {
  const [activeChat, setActiveChat] = useState(chats[0].id);
  const [message, setMessage] = useState("");

  const isWhatsApp = channel === "whatsapp";
  const channelLabel = isWhatsApp ? "WhatsApp" : "Telegram";
  const channelColor = isWhatsApp ? "from-green-400 to-emerald-600" : "from-blue-400 to-blue-600";

  return (
    <>
      {/* Connection status */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0">
            {isWhatsApp ? (
              <Whatsapp3D className="w-12 h-12" />
            ) : (
              <Telegram3D className="w-12 h-12" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900">
                {isWhatsApp ? "WhatsApp Business" : "Telegram Bot"}
              </h3>
              <Badge variant="success">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Connected
              </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isWhatsApp
                ? "Fonnte · +62 812-1234-5678 · Online 14 hari"
                : "Telegram Bot API · @YourLaundryBot · Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex-1 md:flex-none">
            Test Kirim
          </Button>
          <Button className="flex-1 md:flex-none">
            <Megaphone size={16} />
            <span className="hidden sm:inline">Broadcast Baru</span>
            <span className="sm:hidden">Broadcast</span>
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5">
        {[
          {
            label: "Pesan Hari Ini",
            value: templates.reduce((s, t) => s + t.sentCount, 0).toLocaleString(),
            variant: "green" as const,
            icon: <Send size={22} />,
          },
          { label: "Auto-Reply", value: "94%", variant: "blue" as const, icon: <Bot size={22} /> },
          { label: "Order via WA", value: "68", variant: "cyan" as const, icon: <Zap size={22} /> },
          {
            label: "Open Rate",
            value: "82%",
            variant: "purple" as const,
            icon: <Sparkles size={22} />,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
            <div className="shrink-0 scale-75 sm:scale-100 origin-top-right">
              <Icon3D variant={s.variant} size="lg">
                {s.icon}
              </Icon3D>
            </div>
          </Card>
        ))}
      </div>

      {/* Templates */}
      <Card className="mt-4 sm:mt-5">
        <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle>Template Notifikasi Otomatis</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-trigger pesan {channelLabel} untuk setiap status order
            </p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">
            <Sparkles size={14} />
            <span className="hidden sm:inline">Generate AI</span>
          </Button>
        </CardHeader>
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {templates.map((t) => {
            const meta = templateIconMap[t.key] ?? {
              icon: <Inbox size={22} />,
              variant: "blue" as const,
            };
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <Icon3D variant={meta.variant} size="md">
                    {meta.icon}
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.body}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {t.sentCount.toLocaleString()}
                        </span>{" "}
                        pesan terkirim
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={t.isActive}
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-br peer-checked:from-primary-500 peer-checked:to-accent-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Chat preview & AI */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="overflow-hidden order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Inbox Customer</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {chats.filter((c) => c.unread > 0).length} percakapan baru via {channelLabel}
            </p>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChat(c.id)}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors",
                  activeChat === c.id && "bg-primary-50/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.isAi && <Bot size={11} className="text-primary-500 shrink-0" />}
                    <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden order-1 lg:order-2">
          <CardHeader className="flex items-center justify-between flex-row gap-3 space-y-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                A
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">Andi Pratama</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online · Bot Aktif
                </div>
              </div>
            </div>
            <Badge variant="primary" className="shrink-0">
              <Bot size={11} /> AI Auto
            </Badge>
          </CardHeader>

          <div
            className="flex-1 p-4 sm:p-5 space-y-3 overflow-y-auto min-h-[280px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(96,165,250,0.05) 0px, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.05) 0px, transparent 50%)",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.fromCustomer ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    m.fromCustomer
                      ? "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                      : cn(
                          "text-white rounded-br-sm shadow-md",
                          isWhatsApp
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20"
                            : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
                        )
                  )}
                >
                  {m.isBot && (
                    <div className="flex items-center gap-1 text-[10px] opacity-90 mb-0.5">
                      <Bot size={10} /> AI Bot
                    </div>
                  )}
                  <div>{m.text}</div>
                  <div
                    className={cn(
                      "text-[10px] mt-1 inline-flex items-center gap-1",
                      m.fromCustomer ? "text-slate-400" : "text-white/70"
                    )}
                  >
                    {m.time}
                    {!m.fromCustomer && (
                      <span className="inline-flex">
                        <Check size={10} className="-mr-1.5" />
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-gradient-to-br from-primary-50/40 to-accent-50/40">
            <div className="flex items-start gap-2">
              <Sparkles3D className="w-8 h-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-primary-700 uppercase tracking-wide">
                  AI Saran Balasan
                </div>
                <div className="text-xs text-slate-700 mt-0.5">
                  &ldquo;Terima kasih Kak. Driver kami akan tiba dalam 15 menit. Mohon
                  dipersiapkan laundrynya ya.&rdquo;
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Button size="sm" variant="primary">
                    Kirim
                  </Button>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Sparkles size={12} /> Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1"
            />
            <Button size="icon">
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
