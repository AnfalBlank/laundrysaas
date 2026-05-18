# Multi-Role &amp; Permissions

Panduan setiap role: dashboard, menu, dan hak akses.

## Switch User (Demo)

Untuk testing, klik **avatar profile** di pojok kanan atas → **Switch User (Demo)** → pilih user dengan role berbeda.

⚠️ **Note**: Saat ini fitur switch user untuk demo. Production version akan pakai authentication real (NextAuth + password).

## 4 Roles Utama

### 👑 Owner

**Siapa**: pemilik bisnis, manajemen puncak  
**Akses**: penuh ke semua fitur

#### Dashboard Owner

```
┌──────────────────────────────────────────────────┐
│ Dashboard                                        │
├──────────────────────────────────────────────────┤
│ [Omzet] [Order] [Aktif] [Pickup Pending]         │
│ ┌────────────────────────┐ ┌──────────────────┐  │
│ │ Tren Omzet 7 Hari      │ │ Layanan          │  │
│ │ (line chart)           │ │ Terpopuler       │  │
│ │                        │ │ (donut chart)    │  │
│ └────────────────────────┘ └──────────────────┘  │
│ ┌────────────────────────┐ ┌──────────────────┐  │
│ │ Order Terbaru          │ │ Quick Actions    │  │
│ │ (list 6 order)         │ │ Branch Performance│ │
│ └────────────────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

#### Menu Sidebar (14 menu)

| Menu | Akses |
|---|---|
| Dashboard | ✅ Full |
| Orders | ✅ Full CRUD |
| Pickup &amp; Delivery | ✅ Full |
| Customers | ✅ Full |
| Services | ✅ Full CRUD |
| Payments | ✅ Full |
| **Expenses** | ✅ Full CRUD |
| Reports | ✅ Income Statement P&amp;L |
| Inventory | ✅ Full + Movement History |
| **Purchase Orders** | ✅ Full CRUD |
| Staff | ✅ Manage tim |
| WhatsApp | ✅ Full |
| Marketing | ✅ Full |
| Settings | ✅ Full (tenant config) |

#### Use Cases Owner

**Pagi hari (08:00):**
1. Buka Dashboard → cek omzet kemarin
2. Cek Pickup Pending → assign driver
3. Cek Reports → P&amp;L kemarin

**Akhir minggu:**
1. Reports → filter "7 Hari" → analisis
2. Expenses → review pengeluaran minggu
3. Export PDF Income Statement

**Akhir bulan:**
1. Reports → "Bulan Ini" → kalkulasi profit
2. Purchase Orders → review pembelian
3. Settings → review staff performance

### 👔 Admin / Kasir

**Siapa**: operator harian, kasir, manajer cabang  
**Akses**: operasional, no financial detail

#### Dashboard Admin

Sama dengan Owner **kecuali**:
- ❌ **Tidak ada angka omzet** di stat card
- ❌ **Tidak ada chart revenue**
- ❌ **Tidak ada branch performance**
- ✅ Tetap bisa lihat order count, active, pickup pending
- ✅ Quick Actions tetap tampil

#### Menu Sidebar (11 menu)

| Menu | Status |
|---|---|
| Dashboard | ✅ Limited (no revenue) |
| Orders | ✅ Full CRUD |
| Pickup &amp; Delivery | ✅ Full |
| Customers | ✅ Full |
| Services | ✅ Read only |
| Payments | ✅ Input + view |
| Inventory | ✅ Read + adjust |
| Purchase Orders | ✅ Create &amp; receive |
| WhatsApp | ✅ Full |
| Marketing | ✅ Read |
| Notifications | ✅ View |
| ❌ Expenses | Tidak ada |
| ❌ Reports | Tidak ada |
| ❌ Staff | Tidak ada |
| ❌ Settings | Tidak ada |

#### Use Cases Admin

**Saat customer datang:**
1. Order Baru → input data
2. Hitung berat → pilih layanan
3. Generate invoice → cetak
4. Terima pembayaran → catat di Payments

**Customer chat WA:**
1. WhatsApp tab → reply
2. Kalau perlu order baru → buat dari WhatsApp

**Saat customer mau ambil:**
1. Search invoice
2. Update status ke COMPLETED
3. Print receipt

### 🧺 Staff Laundry

**Siapa**: petugas produksi, operator mesin cuci  
**Akses**: production-only, focus task

#### Dashboard Staff — Production Board

Layout **Kanban-style** dengan 5 kolom:

```
┌─────────────────────────────────────────────────┐
│ Stats: Total Aktif | Dicuci | Disetrika | Stok  │
├─────────────────────────────────────────────────┤
│ Production Board                                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │RECEIVED│ │WASHING│ │DRYING│ │IRONING│ │PACKING│ │
│ │  3    │ │  5    │ │  2    │ │  4    │ │  1    │ │
│ │       │ │       │ │       │ │       │ │       │ │
│ │[card] │ │[card] │ │[card] │ │[card] │ │[card] │ │
│ │[Next→]│ │[Next→]│ │[Next→]│ │[Next→]│ │[Next→]│ │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────────────────────┘
```

Klik tombol **"Next →"** di kartu order untuk pindah status:
- RECEIVED → WASHING
- WASHING → DRYING
- DRYING → IRONING
- IRONING → PACKING
- PACKING → READY_DELIVERY

#### Menu Sidebar (4 menu)

| Menu | Akses |
|---|---|
| Dashboard | ✅ Production Board |
| Orders | ✅ Read + update status |
| Inventory | ✅ Adjust stok (untuk pemakaian) |
| Notifications | ✅ View |

❌ Tidak ada akses ke: Customers, Services, Payments, Reports, Settings, dll.

#### Use Cases Staff

**Proses laundry pagi:**
1. Buka Dashboard → lihat kolom RECEIVED
2. Ambil 1 paket → klik **"Next → Dicuci"**
3. Selesai cuci → klik **"Next → Dikeringkan"**
4. Pakai detergent → buka Inventory → Stok Keluar

**Saat kehabisan bahan:**
1. Inventory → cek stok
2. Lihat alert **"Stok Rendah"** di dashboard
3. Lapor ke admin untuk order

🔵 **Tip**: Production Board update real-time. Saat staff lain pindah status, refresh page untuk lihat perubahan.

### 🛵 Driver

**Siapa**: kurir pickup &amp; delivery  
**Akses**: task-only, mobile-first

#### Dashboard Driver — Task List

```
┌──────────────────────────────────────────┐
│ Stats: Total | Pickup | Delivery | Ongoing│
├──────────────────────────────────────────┤
│ 🟡 Sedang Berlangsung (2 task)           │
│ ┌────────────────────────────────────┐   │
│ │ [Pickup] Andi Pratama              │   │
│ │ Jl. Sudirman 12 · INV-...001       │   │
│ │ ⏰ 14:30                            │   │
│ │ [Selesai] [Maps] [Customer]        │   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ 📋 Task Terjadwal (3 task)               │
│ ┌────────────────────────────────────┐   │
│ │ [Delivery] Siti Nurhaliza          │   │
│ │ Jl. Melati Blok A2 · INV-...002    │   │
│ │ ⏰ 16:00                            │   │
│ │ [Mulai Berangkat] [Maps] [Customer]│   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

#### Menu Sidebar (4 menu)

| Menu | Akses |
|---|---|
| Dashboard | ✅ Task list (filtered by driver name) |
| Pickup | ✅ Update status pickup/delivery |
| Orders | ✅ Read order detail |
| Notifications | ✅ View |

#### Use Cases Driver

**Pagi sebelum berangkat:**
1. Buka Dashboard → lihat task hari ini
2. Cek alamat pertama

**Saat berangkat:**
1. Klik **"Mulai Berangkat"** → status: ongoing
2. Klik **"Maps"** → buka Google Maps navigation
3. Sampai di lokasi → klik **"Selesai"**

**Customer tidak ada:**
1. Klik **"Customer"** → call via tel:
2. Konfirmasi atau reschedule

🔵 **Tip**: Driver dashboard otomatis filter task yang assigned ke nama driver tersebut. Driver tidak lihat task driver lain.

## Permission Matrix Detail

```typescript
ROLE_PERMISSIONS = {
  owner: ["*"],  // Semua

  admin: [
    "orders:*",        // Full
    "customers:*",     // Full
    "payments:*",      // Full
    "pickups:*",       // Full
    "services:read",   // Read only
    "inventory:read",
    "inventory:adjust",
    "reports:read",
    "whatsapp:*",
    "marketing:read",
    "expenses:read",
    "expenses:create",
  ],

  staff: [
    "orders:read",
    "orders:update_status",  // Hanya update status
    "inventory:read",
    "inventory:adjust",
  ],

  driver: [
    "pickups:read",
    "pickups:update_status",
    "orders:read",
  ],
}
```

## Tambah Staff dengan Role

Owner buat staff baru:

1. Sidebar → **Staff** → **+ Tambah Staff**
2. Isi data:
   - Nama
   - Email (untuk login)
   - No. HP
   - **Role**: Owner / Admin / Staff Laundry / Driver
   - Cabang
3. Save

⚠️ **Penting**: Saat staff dengan role `driver` dibuat, sistem auto-create entry di tabel `drivers` sehingga driver bisa di-assign ke pickup task.

## Best Practice Per Role

### Owner
- Review Dashboard setiap hari
- Cek Reports mingguan untuk trend
- Audit Expenses bulanan
- Backup data via Settings (TODO)

### Admin
- Input order rapi (lengkap, ada catatan)
- Confirm payment segera setelah customer bayar
- Reply WhatsApp dalam 5 menit
- Update tier customer sesuai spending

### Staff Laundry
- Update status real-time saat selesai proses
- Catat stok keluar saat pakai bahan
- Quality check sebelum tag "Dikemas"
- Lapor ke admin jika ada damage

### Driver
- Konfirmasi customer sebelum berangkat
- Foto bukti delivery setelah selesai
- Update status segera
- Maintain motor/mobil kerja

## Selanjutnya

- [Dashboard](./dashboard.md) — detail per role
- [Staff Management](./staff.md) — kelola tim
- [Getting Started](./getting-started.md)
