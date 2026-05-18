# Dashboard

Halaman utama untuk monitoring bisnis — tampilan **berbeda untuk setiap role**.

## Akses

Menu: **Dashboard** (default landing page semua role)

⚠️ Lihat [Multi-Role &amp; Permissions](./roles.md) untuk detail role.

---

## Dashboard Owner

Full executive view dengan semua metric finansial.

### Layout

```
┌──────────────────────────────────────────────────┐
│ Stats: [Omzet] [Order] [Aktif] [Pickup Pending]  │
├──────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌──────────────────────┐  │
│ │ Tren Omzet 7 Hari  │ │ Layanan Terpopuler   │  │
│ │ (line chart)       │ │ (donut chart)        │  │
│ └────────────────────┘ └──────────────────────┘  │
├──────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌──────────────────────┐  │
│ │ Order Terbaru (6)  │ │ Quick Actions (6)    │  │
│ │                    │ │ Branch Performance   │  │
│ └────────────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 4 Stat Cards

| Widget              | Arti                                              |
| ------------------- | ------------------------------------------------- |
| Omzet Hari Ini      | Total revenue dari order paid hari ini            |
| Order Hari Ini      | Jumlah order baru hari ini                        |
| Laundry Aktif       | Order dengan status non-COMPLETED &amp; non-CANCELLED |
| Pickup Pending      | Order WAITING_PICKUP yang perlu di-assign driver  |

### Charts

#### Tren Omzet 7 Hari
Area chart per hari, hover untuk detail.

#### Layanan Terpopuler
Donut chart distribusi service, dengan legend persentase.

### Order Terbaru
List 6 order terbaru dengan customer, layanan, total, status.

### Quick Actions
6 tombol shortcut: Order Baru, Pickup, Broadcast, Scan QR, Invoice, AI Assist.

### Branch Performance
Progress bar per cabang dengan revenue dan order count bulan ini.

### Use Cases Owner

**Pagi (08:00):**
1. Cek omzet kemarin di stat card
2. Lihat **Pickup Pending** → assign driver
3. Cek **Branch Performance** — cabang mana underperform?

**Siang (13:00):**
1. Cek **Omzet Hari Ini** vs target
2. Lihat **Tren 7 Hari** — naik atau turun?

**Sore (17:00):**
1. **Order Terbaru** — pastikan flow lancar
2. **Quick Actions → Broadcast** untuk promo malam

---

## Dashboard Admin / Kasir

**Sama dengan Owner kecuali:**
- ❌ **Tidak ada Omzet** stat card
- ❌ **Tidak ada Tren Omzet chart**
- ❌ **Tidak ada Branch Performance**
- ✅ Order count, active, pickup pending tetap ada
- ✅ Order Terbaru tetap ada
- ✅ Quick Actions tetap ada

### Use Cases Admin

**Saat shift mulai:**
1. Cek pending pickup → coordinate dengan driver
2. Lihat order terbaru — siap proses

**Saat customer datang:**
1. Quick Actions → **Order Baru**
2. Atau search di topbar

---

## Dashboard Staff Laundry — Production Board

**Layout Kanban-style** untuk fokus produksi.

### Layout

```
┌─────────────────────────────────────────────────┐
│ Stats: [Total] [Dicuci] [Disetrika] [Stok]      │
├─────────────────────────────────────────────────┤
│ Production Board                                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │RECEIVED│ │WASHING│ │DRYING│ │IRONING│ │PACKING│ │
│ │  3    │ │  5    │ │  2    │ │  4    │ │  1    │ │
│ │       │ │       │ │       │ │       │ │       │ │
│ │[Order1]│ │[Order2]│ │[Order3]│ │[Order4]│ │[Order5]││
│ │[Next→]│ │[Next→]│ │[Next→]│ │[Next→]│ │[Next→]│ │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────────────────────┘
```

### 4 Stats

| Widget | Arti |
|---|---|
| Total Aktif | Order dalam produksi (RECEIVED → PACKING) |
| Dicuci | Status WASHING |
| Disetrika | Status IRONING |
| Stok Rendah | Item ≤ minimum stock |

### 5 Kolom Status

Setiap kolom punya:
- Status badge (color)
- Jumlah order
- Card per order dengan: invoice, customer, layanan, weight
- **Tombol "Next →"** untuk pindah ke status berikutnya

### Workflow

```
RECEIVED → WASHING → DRYING → IRONING → PACKING → READY_DELIVERY
   ↑           ↑          ↑           ↑            ↑
   |           |          |           |            |
  Next →      Next →     Next →      Next →       Next → (selesai produksi)
```

### Low Stock Alert

Card kuning di bawah board:
- Pesan: "Stok Rendah — Lapor Admin"
- List item yang low
- Tombol **"Lihat Inventory"**

### Use Cases Staff

**Pagi mulai shift:**
1. Buka Dashboard → lihat kolom RECEIVED
2. Ambil paket → klik **"Next → Dicuci"**
3. Lanjut ke order berikutnya

**Saat selesai cuci 1 order:**
1. Cari order di kolom WASHING
2. Klik **"Next → Dikeringkan"**
3. Selesai

**Saat pakai bahan:**
1. Inventory → cari item
2. **Stok Keluar** → input quantity

---

## Dashboard Driver — Task List

**Mobile-first** dashboard untuk task pickup &amp; delivery.

### Layout

```
┌──────────────────────────────────────────┐
│ Stats: [Total] [Pickup] [Delivery] [Ongoing]│
├──────────────────────────────────────────┤
│ 🟡 Sedang Berlangsung (priority)         │
│ ┌────────────────────────────────────┐   │
│ │ [PICKUP] Andi Pratama              │   │
│ │ Jl. Sudirman 12 · INV-...001       │   │
│ │ ⏰ 14:30                            │   │
│ │ [Selesai] [Maps] [Customer]        │   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ 📋 Task Terjadwal                        │
│ ┌────────────────────────────────────┐   │
│ │ [DELIVERY] Siti Nurhaliza          │   │
│ │ Jl. Melati Blok A2 · INV-...002    │   │
│ │ ⏰ 16:00                            │   │
│ │ [Mulai Berangkat] [Maps] [Customer]│   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 4 Stats

| Widget | Arti |
|---|---|
| Total Task | Pickup + Delivery aktif hari ini |
| Pickup | Total pickup task |
| Delivery | Total delivery task |
| Berlangsung | Task status `ongoing` |

### Auto-filter

Dashboard hanya menampilkan task yang **assigned ke driver tersebut** (filter by name).

### 2 Sections

#### 1. Sedang Berlangsung (priority — warna kuning)
- Task yang sudah klik "Mulai Berangkat"
- Tombol **"Selesai"** untuk complete

#### 2. Task Terjadwal
- Task yang belum dimulai
- Tombol **"Mulai Berangkat"** untuk start

### 3 Action Buttons per Task

| Button | Aksi |
|---|---|
| **Mulai Berangkat** | Update status → ongoing |
| **Selesai** | Update status → completed |
| **Maps** | Buka Google Maps dengan alamat |
| **Customer** | Info customer (untuk call) |

### Use Cases Driver

**Pagi sebelum berangkat:**
1. Buka Dashboard → lihat 5 task hari ini
2. Cek alamat pertama
3. Cek route via Maps

**Saat berangkat:**
1. Klik **"Mulai Berangkat"** → status: ongoing
2. Klik **"Maps"** → Google Maps navigation
3. Sampai → klik **"Selesai"**

**Customer tidak ada:**
1. Klik **"Customer"** → call
2. Konfirmasi atau reschedule

---

## Refresh Data

Dashboard auto-refresh saat halaman dimuat. Untuk refresh manual:
- F5 / Cmd+R
- Atau klik logo LaundryHub di sidebar

## Tampilan Mobile

Semua role responsive:
- Stat cards: 2 kolom (mobile) → 4 kolom (desktop)
- Charts: stacked vertikal di mobile
- Production Board: scroll horizontal di mobile
- Driver task list: optimized untuk HP

## Tidak Muncul Data?

| Masalah                          | Penyebab                                  |
| -------------------------------- | ----------------------------------------- |
| Semua angka 0                    | Belum ada order hari ini                  |
| Chart kosong                     | Belum ada data 7 hari terakhir            |
| Production Board kosong          | Tidak ada order status RECEIVED-PACKING   |
| Driver task list kosong          | Tidak ada pickup/delivery assigned        |
| Branch Performance tidak tampil  | Belum buat cabang                         |

## Selanjutnya

- [Multi-Role &amp; Permissions](./roles.md)
- [Orders](./orders.md) — kelola transaksi
- [Reports](./reports.md) — analisis lebih dalam
