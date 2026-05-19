"use client";

import { useState, useEffect } from "react";
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

interface Conversation {
  customerId: string;
  customerName: string;
  customerPhone: string;
  telegramChatId: string | null;
  lastMessage: string;
  lastTime: Date;
  isBot: boolean;
  unread: number;
}

interface ChatMessage {
  id: string;
  direction: "incoming" | "outgoing";
  body: string;
  isBot: boolean;
  createdAt: Date;
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

const messages_dummy = [
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

export function WhatsappView({
  templates,
  channel = "whatsapp",
  conversations = [],
}: {
  templates: Template[];
  channel?: string;
  conversations?: Conversation[];
}) {
  const [activeChat, setActiveChat] = useState<string | null>(
    conversations[0]?.customerId ?? null
  );
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const isWhatsApp = channel === "whatsapp";
  const channelLabel = isWhatsApp ? "WhatsApp" : "Telegram";

  // Load thread when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    setLoadingThread(true);
    fetch(`/api/chat/${activeChat}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setThread(
            data.messages.map((m: { id: string; direction: string; body: string; isBot: number; createdAt: string }) => ({
              id: m.id,
              direction: m.direction as "incoming" | "outgoing",
              body: m.body,
              isBot: Boolean(m.isBot),
              createdAt: new Date(m.createdAt),
            }))
          );
        }
      })
      .finally(() => setLoadingThread(false));
  }, [activeChat]);

  const activeConv = conversations.find((c) => c.customerId === activeChat);

  const sendReply = async () => {
    if (!message.trim() || !activeChat) return;
    setSending(true);
    const body = message;
    setMessage("");
    // Optimistic update
    setThread((prev) => [
      ...prev,
      {
        id: "temp_" + Date.now(),
        direction: "outgoing",
        body,
        isBot: false,
        createdAt: new Date(),
      },
    ]);
    try {
      const res = await fetch(`/api/chat/${activeChat}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!data.sent) {
        alert("Pesan tersimpan tapi gagal kirim: " + (data.error || "Unknown"));
      }
    } catch {
      alert("Gagal kirim pesan");
    } finally {
      setSending(false);
    }
  };

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
          <Button
            variant="secondary"
            className="flex-1 md:flex-none"
            onClick={() => {
              const sample = isWhatsApp ? "+62 812-xxxx-xxxx" : "Telegram chat ID";
              const dest = window.prompt(`Test kirim ke ${sample}:`);
              if (!dest) return;
              fetch("/api/messaging/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: dest,
                  text: `Halo! Ini test pesan dari ${channelLabel} bot LaundryHub.`,
                }),
              })
                .then((r) => r.json())
                .then((data) => {
                  if (data.success) alert("Pesan terkirim ✅");
                  else alert("Gagal kirim: " + (data.error || "Unknown"));
                })
                .catch(() => alert("Error connecting to server"));
            }}
          >
            Test Kirim
          </Button>
          <Button
            className="flex-1 md:flex-none"
            onClick={() => {
              window.location.href = "/marketing";
            }}
          >
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
                      onChange={async (e) => {
                        const newState = e.target.checked;
                        try {
                          await fetch(`/api/whatsapp/templates/${t.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: newState }),
                          });
                        } catch {
                          // revert on error
                          e.target.checked = !newState;
                        }
                      }}
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
              {conversations.filter((c) => c.unread > 0).length} percakapan baru via {channelLabel}
            </p>
          </CardHeader>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {conversations.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Belum ada percakapan.<br />
                <span className="text-xs">Customer chat ke bot akan muncul di sini.</span>
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.customerId}
                onClick={() => setActiveChat(c.customerId)}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors",
                  activeChat === c.customerId && "bg-primary-50/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
                    isWhatsApp
                      ? "bg-gradient-to-br from-green-400 to-emerald-600"
                      : "bg-gradient-to-br from-blue-400 to-blue-600"
                  )}
                >
                  {c.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {c.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(c.lastTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.isBot && <Bot size={11} className="text-primary-500 shrink-0" />}
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
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0",
                  isWhatsApp
                    ? "bg-gradient-to-br from-green-400 to-emerald-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                )}
              >
                {(activeConv?.customerName ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                  {activeConv?.customerName ?? "Pilih percakapan"}
                </div>
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
            {!activeChat && (
              <div className="text-center text-sm text-slate-400 py-12">
                Pilih percakapan dari Inbox untuk membaca chat history
              </div>
            )}
            {loadingThread && (
              <div className="text-center text-sm text-slate-400 py-8">Memuat...</div>
            )}
            {!loadingThread &&
              thread.map((m) => {
                const fromCustomer = m.direction === "incoming";
                return (
                  <div
                    key={m.id}
                    className={cn("flex", fromCustomer ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        fromCustomer
                          ? "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                          : cn(
                              "text-white rounded-br-sm shadow-md",
                              isWhatsApp
                                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20"
                                : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
                            )
                      )}
                    >
                      {m.isBot && !fromCustomer && (
                        <div className="flex items-center gap-1 text-[10px] opacity-90 mb-0.5">
                          <Bot size={10} /> AI Bot
                        </div>
                      )}
                      <div
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: m.body
                            .replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>")
                            .replace(/<i>(.*?)<\/i>/g, "<em>$1</em>"),
                        }}
                      />
                      <div
                        className={cn(
                          "text-[10px] mt-1 inline-flex items-center gap-1",
                          fromCustomer ? "text-slate-400" : "text-white/70"
                        )}
                      >
                        {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {!fromCustomer && (
                          <span className="inline-flex">
                            <Check size={10} className="-mr-1.5" />
                            <Check size={10} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              }}
              placeholder={activeChat ? "Ketik pesan..." : "Pilih percakapan dulu"}
              className="flex-1"
              disabled={!activeChat || sending}
            />
            <Button
              size="icon"
              type="button"
              onClick={sendReply}
              disabled={!activeChat || !message.trim() || sending}
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
