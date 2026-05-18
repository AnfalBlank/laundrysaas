import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon3D } from "@/components/ui/icon3d";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  Truck,
  UserPlus,
} from "lucide-react";
import {
  listOrders,
  getOutstandingPayments,
  listInventory,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const [orders, outstanding, inventory] = await Promise.all([
    listOrders({ limit: 50 }),
    getOutstandingPayments(),
    listInventory(),
  ]);

  // Generate dynamic notifications from real data
  const notifications: {
    type: "order" | "payment" | "inventory" | "pickup" | "customer";
    title: string;
    description: string;
    timestamp: Date;
    icon: React.ReactNode;
    variant: Parameters<typeof Icon3D>[0]["variant"];
    badge?: string;
  }[] = [];

  // Pending pickups
  const pendingPickups = orders.filter((o) => o.status === "WAITING_PICKUP");
  pendingPickups.slice(0, 5).forEach((o) => {
    notifications.push({
      type: "pickup",
      title: "Pickup Pending",
      description: `${o.invoice} - ${o.customerName ?? "Customer"} menunggu driver`,
      timestamp: o.createdAt,
      icon: <Truck size={20} />,
      variant: "orange",
      badge: "Action needed",
    });
  });

  // Ready for delivery
  const readyDelivery = orders.filter((o) => o.status === "READY_DELIVERY");
  readyDelivery.slice(0, 3).forEach((o) => {
    notifications.push({
      type: "order",
      title: "Siap Diantar",
      description: `${o.invoice} - ${o.customerName ?? "Customer"} laundry siap antar`,
      timestamp: o.createdAt,
      icon: <CheckCircle2 size={20} />,
      variant: "green",
    });
  });

  // Recent paid
  orders
    .filter((o) => o.paymentStatus === "paid")
    .slice(0, 3)
    .forEach((o) => {
      notifications.push({
        type: "payment",
        title: "Pembayaran Diterima",
        description: `${o.invoice} - Rp ${o.total.toLocaleString("id-ID")} (${o.customerName ?? "—"})`,
        timestamp: o.createdAt,
        icon: <CreditCard size={20} />,
        variant: "green",
      });
    });

  // Outstanding alert
  if (outstanding.count > 0) {
    notifications.push({
      type: "payment",
      title: "Tagihan Belum Lunas",
      description: `${outstanding.count} order menunggu pembayaran sebesar Rp ${outstanding.total.toLocaleString("id-ID")}`,
      timestamp: new Date(),
      icon: <AlertTriangle size={20} />,
      variant: "amber",
      badge: "Penting",
    });
  }

  // Low stock alerts
  inventory
    .filter((i) => i.stock <= i.minimumStock)
    .forEach((i) => {
      notifications.push({
        type: "inventory",
        title: "Stok Rendah",
        description: `${i.name} tersisa ${i.stock} ${i.unit} (min ${i.minimumStock})`,
        timestamp: new Date(),
        icon: <AlertTriangle size={20} />,
        variant: "red",
        badge: "Restock",
      });
    });

  // New orders today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
  if (todayOrders.length > 0) {
    notifications.push({
      type: "order",
      title: "Order Baru Hari Ini",
      description: `${todayOrders.length} order masuk hari ini`,
      timestamp: new Date(),
      icon: <ShoppingBag size={20} />,
      variant: "blue",
    });
  }

  // Sort by timestamp desc
  notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const groupedByDate = notifications.reduce<Record<string, typeof notifications>>(
    (acc, n) => {
      const date = n.timestamp.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      (acc[date] ??= []).push(n);
      return acc;
    },
    {}
  );

  return (
    <AppShell title="Notifikasi" subtitle="Update penting tentang bisnis Anda">
      <Card className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon3D variant="blue" size="md">
            <Bell size={20} />
          </Icon3D>
          <div>
            <div className="font-semibold text-slate-900">{notifications.length} Notifikasi</div>
            <div className="text-xs text-slate-500">
              Update otomatis berdasarkan aktivitas bisnis
            </div>
          </div>
        </div>
        <Badge variant="primary">Realtime</Badge>
      </Card>

      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="mt-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {date}
          </h3>
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-100">
              {items.map((n, i) => (
                <div
                  key={i}
                  className="px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <Icon3D variant={n.variant} size="md">
                    {n.icon}
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-slate-900">{n.title}</h4>
                      {n.badge && (
                        <Badge
                          variant={
                            n.badge === "Penting"
                              ? "warning"
                              : n.badge === "Action needed"
                              ? "danger"
                              : "primary"
                          }
                        >
                          {n.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 break-words">{n.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {n.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}

      {notifications.length === 0 && (
        <Card className="mt-5 p-10 flex flex-col items-center text-center">
          <Icon3D variant="green" size="xl">
            <CheckCircle2 size={32} />
          </Icon3D>
          <h3 className="mt-4 font-semibold text-slate-900">Semua aman</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tidak ada notifikasi penting saat ini.
          </p>
        </Card>
      )}
    </AppShell>
  );
}
