/**
 * Static UI helpers (status labels, color maps, mock chat data).
 * Real business data is fetched from the database via repositories.
 */

export type OrderStatus =
  | "WAITING_PICKUP"
  | "PICKUP_PROCESS"
  | "RECEIVED"
  | "WASHING"
  | "DRYING"
  | "IRONING"
  | "PACKING"
  | "READY_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export const statusLabels: Record<OrderStatus, string> = {
  WAITING_PICKUP: "Menunggu Pickup",
  PICKUP_PROCESS: "Pickup Berlangsung",
  RECEIVED: "Diterima",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  IRONING: "Disetrika",
  PACKING: "Dikemas",
  READY_DELIVERY: "Siap Diantar",
  DELIVERING: "Sedang Diantar",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const statusColors: Record<OrderStatus, string> = {
  WAITING_PICKUP: "bg-slate-100 text-slate-700 border-slate-200",
  PICKUP_PROCESS: "bg-amber-50 text-amber-700 border-amber-200",
  RECEIVED: "bg-blue-50 text-blue-700 border-blue-200",
  WASHING: "bg-cyan-50 text-cyan-700 border-cyan-200",
  DRYING: "bg-sky-50 text-sky-700 border-sky-200",
  IRONING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PACKING: "bg-purple-50 text-purple-700 border-purple-200",
  READY_DELIVERY: "bg-teal-50 text-teal-700 border-teal-200",
  DELIVERING: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

// Mock chat data (chat is not yet persisted in DB — UI mock only)
export interface ChatThread {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  unread: number;
  time: string;
  isAi?: boolean;
}

export const chats: ChatThread[] = [
  {
    id: "c1",
    name: "Andi Pratama",
    phone: "0812-3456-7890",
    lastMessage: "Mas, laundry saya udah selesai belum?",
    unread: 2,
    time: "10 mnt",
  },
  {
    id: "c2",
    name: "Siti Nurhaliza",
    phone: "0813-9876-5432",
    lastMessage: "Pickup terjadwal hari ini jam 14:00",
    unread: 0,
    time: "30 mnt",
    isAi: true,
  },
  {
    id: "c3",
    name: "Budi Santoso",
    phone: "0857-1122-3344",
    lastMessage: "Saya mau tambahin parfum lavender ya",
    unread: 1,
    time: "1 jam",
  },
  {
    id: "c4",
    name: "Hendra Wijaya",
    phone: "0852-9988-7766",
    lastMessage: "Oke siap, ditunggu drivernya",
    unread: 0,
    time: "2 jam",
  },
];
