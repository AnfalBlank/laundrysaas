# Changelog

All notable changes to LaundryHub akan dicatat di file ini.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

## [Unreleased]

### Planned
- Payment gateway live (Midtrans webhook)
- Realtime updates via Pusher / Supabase Realtime
- Print thermal invoice via WebUSB
- AI auto-reply via OpenAI (live integration)

## [0.5.0] — 2026-05-19

### Added — Messaging & Chat

- **Telegram Bot Integration**:
  - Setup via BotFather → token → webhook otomatis
  - Auto-reply commands: `/start`, `harga`, `pickup`, `status`, `jam buka`, `admin`
  - Auto-create order dari chat (alamat + jam + berat → order dibuat)
  - Webhook endpoint menerima pesan masuk real-time
- **Multi-Channel Messaging**:
  - Settings → Messaging tab: switch antara WhatsApp (Fonnte) dan Telegram
  - `messaging.ts` abstraction layer — kirim pesan via channel aktif
  - Generic send endpoint (`/api/messaging/send`)
- **Real Chat Inbox**:
  - Tabel `messages` persistent di database
  - Conversations list dari DB (bukan dummy)
  - Admin bisa reply langsung dari halaman WhatsApp/Telegram
  - Indikator bot vs human message
  - Read/unread status per pesan

### Added — Security & Authentication

- **Password Hashing (bcrypt)**:
  - `password.ts` utility: `hashPassword()` + `verifyPassword()`
  - Login endpoint sekarang verifikasi password hash real
  - Tidak lagi plain-text comparison
- **RBAC API Guards**:
  - `api-guard.ts` middleware enforce permission di semua API routes
  - Server-side permission check — bukan hanya UI hiding
  - Return 403 Forbidden bila role tidak punya akses
- **Security Settings persist to DB**:
  - Tabel `tenant_security_settings` menyimpan toggle keamanan
  - Two-Factor, Audit Log, IP Whitelist, Session Timeout tersimpan real
  - GET/PATCH `/api/security` endpoints

### Added — Orders & Payments

- **Multi-Item Orders**:
  - Form order sekarang support multiple layanan per order
  - Tombol "+ Tambah Layanan" di form input
  - Subtotal per item, grand total otomatis
- **Discount**:
  - Field diskon di form order (nominal atau persentase)
  - Express surcharge otomatis +50% dari subtotal
  - Kalkulasi: subtotal − discount + express surcharge = total
- **Refund**:
  - Tombol Refund di tabel pembayaran
  - Buat record payment negatif (amount minus)
  - Update payment status order sesuai sisa
- **Payment Reminder**:
  - Tombol "Kirim Reminder" di halaman Payments
  - Kirim notifikasi ke semua customer dengan order unpaid
  - Via channel aktif (WhatsApp/Telegram)

### Added — Marketing & Notifications

- **Marketing Campaigns persist to DB**:
  - Tabel `campaigns` menyimpan semua campaign
  - Segment stats dari data real (customer count per segment)
  - Status tracking: draft → scheduled → sent
  - Metrics: recipientCount, deliveredCount, readCount, conversionCount
- **Notifications API**:
  - Tabel `notifications` persistent (bukan generated)
  - Read/unread status per notifikasi
  - Mark single read (`PATCH /api/notifications/[id]`)
  - Mark all read (`PATCH /api/notifications`)
  - GET endpoint dengan filter

### Added — Operations

- **Suppliers Manager**:
  - Tab baru di Settings untuk CRUD supplier
  - Nama, phone, email, contact person, notes
  - Toggle active/inactive
- **PO Detail Modal**:
  - Klik PO di tabel → modal detail dengan line items
  - GET `/api/purchase-orders/[id]` return items
- **Pickup → Order status sync**:
  - Pickup status `ongoing` → order status otomatis `PICKUP_PROCESS`
  - Pickup status `completed` → order status otomatis `RECEIVED`
- **Customer loyalty auto-update**:
  - Saat payment recorded: tier, points, totalSpending auto-increment
  - Threshold tier: Silver (0), Gold (≥ 500K), Platinum (≥ 2M)

### Changed

- Authentication: dari demo cookie-switch ke real password verification
- API routes: semua endpoint sekarang enforce RBAC server-side
- WhatsApp page: dari dummy data ke real conversations dari DB
- Marketing page: campaigns tersimpan di DB, bukan state saja
- Notifications: dari generated ke persistent table
- Database: dari 18 tabel ke 22 tabel
- Settings Security tab: dari UI-only ke persist DB

### Fixed

- Login sekarang verify bcrypt hash (sebelumnya plain text)
- Pickup status change sekarang sync ke order status
- Customer tier/points sekarang auto-update saat payment

## [0.4.0] — 2026-05-17

### Added — Multi-Role &amp; RBAC

- **Authentication system (demo)**:
  - Cookie-based user switcher untuk testing
  - `getCurrentUser()` server-side helper
  - `hasPermission(role, permission)` permission matrix
  - `canAccessPage(role, path)` route access check
- **4 Role-specific dashboards**:
  - **Owner**: full stats, omzet, profit, branch performance, quick actions
  - **Admin/Kasir**: same UI tapi tanpa angka omzet/profit
  - **Staff Laundry**: Production Board kanban-style (5 kolom workflow), low stock alert, focus produksi
  - **Driver**: task list dengan tombol Mulai/Selesai, Maps integration, filter task per driver
- **Role-based Sidebar**:
  - Owner: 14 menu (semua)
  - Admin: 11 menu (no Settings/Reports/Expenses/Staff)
  - Staff: 4 menu (Dashboard, Orders, Inventory, Notifications)
  - Driver: 4 menu (Dashboard, Pickup, Orders, Notifications)
  - Tenant card menampilkan role badge + branch
  - Plan card hanya untuk Owner
- **User Switcher (Demo)**:
  - Profile dropdown menu &quot;Switch User&quot;
  - Modal list semua active users dengan role badge
  - Klik untuk switch session

### Added — Financial Modules

- **Expenses module** (`/expenses`):
  - Schema baru: `expenses` + `expense_categories`
  - 10 kategori default (Gaji, Sewa, Listrik, Internet, Bahan, Transport, Marketing, Maintenance, Pajak, Lain-lain)
  - CRUD lengkap dengan form modal
  - Stats: total bulan ini, top kategori, rata-rata, kategori aktif
  - Breakdown per kategori dengan progress bar
  - Export CSV
- **Reports — Income Statement (P&amp;L) Lengkap**:
  - Schema baru: `inventory_movements` untuk track pergerakan stok
  - Real Income Statement layout: Revenue → COGS → Gross Profit → OPEX → Net Profit
  - 4 stat cards: Revenue, Gross Profit, Operating Expense, Net Profit/Loss (dengan color coding)
  - Auto-calculate margin %, COGS ratio, OPEX ratio, AOV
  - Period switcher (hari ini, 7d, 30d, bulan ini, semua)
  - Expenses by category breakdown
  - Revenue by service ranking top 5
  - Export PDF Income Statement formal
  - `/api/reports/pnl` endpoint
- **Inventory — History Pemakaian**:
  - Tab baru &quot;History Pemakaian&quot; menampilkan semua stock movements
  - Track tanggal, item, type (Masuk/Keluar/Adjust), qty, reason, reference, total cost
  - Auto-calculate COGS dari movements `out` type

### Added — Purchase Order System

- **Purchase Orders module** (`/purchase-orders`):
  - Schema baru: `purchase_orders`, `purchase_order_items`, `suppliers`
  - Stats: total PO, pending value, received value, low stock count
  - **Auto-fill PO** dari item low-stock dalam 1 klik
  - Multi-line item form dengan auto-calc
  - Receive PO → otomatis tambah stok + create movement record dengan unit cost
  - Cancel PO action
  - Sidebar menu &quot;Purchase Orders&quot;
- **Suppliers**: schema baru, API CRUD, siap di-integrate

### Added — CRUD Lengkap

- **Branches CRUD**: dipisah ke `BranchesManager` component di Settings
- **Services edit/delete**: edit modal + soft delete
- **Customers detail/edit/blacklist**: `CustomerDetailModal` dengan order history
- **Inventory edit/delete**: edit modal + delete dengan confirmation
- **Staff CRUD**: `/staff` page dengan tambah/edit/deactivate
- **Notifications page** (`/notifications`): generated dari real DB data

### Added — Header Functionality

- **Search bar**: form submit → `/orders?q=...`
- **Mobile search**: full-screen overlay
- **Notification dropdown**: 5 items + link ke `/notifications`
- **Chat dropdown**: 3 recent messages + link ke `/whatsapp`
- **Profile dropdown**: Switch User, Pengaturan, Logout
- **Logout**: clear cookie + redirect

### Added — UI Components

- `<Modal>`: dengan keyboard ESC, click outside, body lock
- `<Toast>`: 4 variants (success/error/info/warning), auto-dismiss
- `<Select>` + `<Textarea>` + `<Field>`: form primitives
- Print invoice thermal 80mm via `window.print()`
- CSV export dengan UTF-8 BOM
- PDF export via browser print dialog

### Changed

- **Settings persistence**: nama tenant di Settings sekarang ter-update real-time di sidebar setelah save
- **Sidebar tenant info**: dari hardcoded jadi fetch dari DB
- **AppShell**: jadi async server component yang fetch tenant + user
- Icon system: removed all auto-animations (float/wiggle/spin), tilt-on-hover juga di-disable
- Konsistensi ikon: semua stat card pakai `Icon3D` wrapper

### Fixed

- Settings save sekarang reflect di UI (nama tenant ter-update di sidebar)
- Build error: `yAxisId` di Recharts tanpa matching `YAxis`
- Sidebar scroll issue saat halaman utama panjang
- Server/client component separation (auth.ts pakai `server-only`)

## [0.3.0] — 2026-05-17

### Added — Functional Buttons & Forms

- All UI buttons sekarang berfungsi (sebelumnya placeholder)
- CRUD lengkap untuk Orders, Customers, Services, Inventory, Pickups, Payments
- Order form modal dengan auto-generate invoice number
- Order detail modal dengan status update + payment recording
- Payment recording form (4 metode: cash/QRIS/transfer/e-wallet)
- Pickup task creation modal
- Inventory adjust stock (in/out) modal

### Added — Public Tracking

- `/track/[invoice]` — public customer tracking
- Status timeline visualization
- WhatsApp CTA button

## [0.2.0] — 2026-05-17

### Added — Backend Integration

- Turso (libSQL) database integration
- 12 tables Drizzle schema dengan multi-tenant isolation
- 8 REST API endpoints awal
- Demo data seeder
- Server Components fetch data langsung dari DB

### Changed

- All pages: dummy data → real database queries

## [0.1.0] — 2026-05-17

### Added — Initial Release

- Next.js 14 App Router setup with TypeScript
- Tailwind CSS + custom 3D icon system (30+ illustrated SVG)
- 13 pages: Dashboard, Orders, Customers, Services, Payments, Pickup, Inventory, WhatsApp, Marketing, Reports, Staff, Settings, Login, Customer Tracking
- Mobile-first responsive design
- Sidebar + Topbar layout
- 11 status workflow untuk orders
- Multi-tier customer system (Silver/Gold/Platinum)

### Tech Stack

- Next.js 14.2.5
- React 18.3
- TypeScript 5.6
- Tailwind CSS 3.4
- Drizzle ORM
- @libsql/client (Turso)
- Recharts 2.13
- Lucide React + custom 3D SVG icons

---

## Versioning Notes

### MAJOR (X.0.0)

Breaking changes:
- API response shape changes
- Schema migration requiring code update
- Removed features

### MINOR (0.X.0)

Backward-compatible features:
- New endpoints
- New pages
- New optional config

### PATCH (0.0.X)

Bug fixes &amp; small improvements:
- UI polish
- Performance
- Documentation
- Security patches
