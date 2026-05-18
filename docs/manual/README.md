# Manual Book LaundryHub

Panduan lengkap penggunaan platform LaundryHub untuk owner, admin/kasir, staff laundry, driver, dan customer.

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Memulai](./getting-started.md) — login, navigasi pertama, switch user
3. **[Multi-Role &amp; Permissions](./roles.md)** — panduan per role 🆕
4. [Dashboard](./dashboard.md) — monitoring per role
5. [Manajemen Order](./orders.md) — input order, status, invoice
6. [Pickup &amp; Delivery](./pickup-delivery.md) — jadwal jemput &amp; antar
7. [Customer Management](./customers.md) — data, tier, loyalty
8. [Pricing &amp; Layanan](./services.md) — atur harga
9. [Pembayaran](./payments.md) — POS, multi-method
10. **[Expenses &amp; Reports](./expenses-reports.md)** — pencatatan biaya &amp; P&amp;L 🆕
11. [Inventory](./inventory.md) — stok operasional &amp; history pemakaian
12. **[Purchase Orders](./purchase-orders.md)** — pemesanan ke supplier 🆕
13. [WhatsApp Automation](./whatsapp.md) — auto-reply, broadcast
14. [Marketing](./marketing.md) — campaign, segmentasi
15. [Reports &amp; Analytics](./reports.md) — laporan bisnis
16. [Staff Management](./staff.md) — kelola tim
17. [Settings](./settings.md) — konfigurasi tenant
18. [Customer Portal](./customer-portal.md) — tracking publik
19. [FAQ &amp; Troubleshooting](./faq.md)

## 1. Pengenalan

### Apa itu LaundryHub?

LaundryHub adalah platform ERP (Enterprise Resource Planning) berbasis SaaS yang dirancang khusus untuk bisnis laundry. Platform ini menggabungkan operasional, keuangan, marketing, dan analitik dalam satu sistem terintegrasi dengan **dashboard berbeda untuk setiap role**.

### Untuk siapa?

- **Laundry kiloan** — fokus per kg
- **Laundry premium** — express, premium service
- **Laundry sepatu** — tracking per pasang
- **Laundry karpet &amp; bed cover** — tracking per item
- **Laundry hotel / B2B** — volume tinggi
- **Multi outlet** — manajemen banyak cabang

### Role &amp; Hak Akses

| Role               | Dashboard            | Hak Akses                                                    |
| ------------------ | -------------------- | ------------------------------------------------------------ |
| **Owner**          | Full executive       | Semua menu: Settings, Reports, Expenses, Staff, dll         |
| **Admin / Kasir**  | Operational          | Order, customer, payment, pickup, marketing (no financial)   |
| **Staff Laundry**  | Production Board     | Order produksi (kanban), inventory, scan QR (TODO)          |
| **Driver**         | Task List            | Pickup &amp; delivery task, navigasi Maps                       |
| **Customer**       | Public tracking      | Tracking order via portal, tanpa login                       |

Detail di [Multi-Role &amp; Permissions](./roles.md).

### Alur Kerja Utama

```
Customer chat WhatsApp  →  Sistem buat pickup request
                           ↓
                    Admin konfirmasi
                           ↓
                    Driver pickup
                           ↓
              Staff terima &amp; proses (Diterima → Dicuci → Dikeringkan → Disetrika → Dikemas)
                           ↓
                    Notifikasi WhatsApp otomatis ke customer
                           ↓
                    Driver delivery
                           ↓
              Customer terima &amp; bayar
                           ↓
              Owner lihat laporan keuangan (Reports → P&amp;L)
```

### Navigasi Sidebar Berdasarkan Role

#### Owner — 14 menu
Dashboard, Orders, Pickup, Customers, Services, Payments, **Expenses**, Reports, Inventory, **Purchase Orders**, Staff, WhatsApp, Marketing, Settings

#### Admin / Kasir — 11 menu
Dashboard, Orders, Pickup, Customers, Services, Payments, Inventory, **Purchase Orders**, WhatsApp, Marketing, Notifications

#### Staff Laundry — 4 menu
Dashboard (Production Board), Orders, Inventory, Notifications

#### Driver — 4 menu
Dashboard (Task List), Pickup, Orders, Notifications

## Konvensi Dokumentasi

- 🔵 **Tip** — saran best practice
- ⚠️ **Penting** — perhatian khusus
- 💡 **Contoh** — skenario penggunaan
- 🚫 **Hindari** — anti-pattern
- 🆕 **Baru di v0.4.0**

## Bantuan

- WhatsApp support: `+62 812-xxxx-xxxx`
- Email: `support@laundryhub.id`
- Dokumentasi teknis: [Technical Docs](../technical/README.md)
