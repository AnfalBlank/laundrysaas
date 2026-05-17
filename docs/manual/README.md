# Manual Book LaundryHub

Panduan lengkap penggunaan platform LaundryHub untuk owner, admin/kasir, staff laundry, driver, dan customer.

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Memulai](./getting-started.md) — login, navigasi pertama
3. [Dashboard Owner](./dashboard.md) — monitoring bisnis realtime
4. [Manajemen Order](./orders.md) — input order, status, invoice
5. [Pickup &amp; Delivery](./pickup-delivery.md) — jadwal jemput &amp; antar
6. [Customer Management](./customers.md) — data, tier, loyalty
7. [Pricing &amp; Layanan](./services.md) — atur harga
8. [Pembayaran](./payments.md) — POS, multi-method
9. [Inventory](./inventory.md) — stok operasional
10. [WhatsApp Automation](./whatsapp.md) — auto-reply, broadcast
11. [Marketing](./marketing.md) — campaign, segmentasi
12. [Reports &amp; Analytics](./reports.md) — laporan bisnis
13. [Staff Management](./staff.md) — kelola tim
14. [Settings](./settings.md) — konfigurasi tenant
15. [Customer Portal](./customer-portal.md) — tracking publik
16. [FAQ &amp; Troubleshooting](./faq.md)

## 1. Pengenalan

### Apa itu LaundryHub?

LaundryHub adalah platform ERP (Enterprise Resource Planning) berbasis SaaS yang dirancang khusus untuk bisnis laundry. Platform ini menggabungkan operasional, marketing, dan analitik dalam satu sistem terintegrasi.

### Untuk siapa?

- **Laundry kiloan** — fokus per kg
- **Laundry premium** — express, premium service
- **Laundry sepatu** — tracking per pasang
- **Laundry karpet &amp; bed cover** — tracking per item
- **Laundry hotel / B2B** — volume tinggi
- **Multi outlet** — manajemen banyak cabang

### Role &amp; Hak Akses

| Role               | Hak Akses                                                            |
| ------------------ | -------------------------------------------------------------------- |
| **Owner**          | Akses penuh: dashboard, laporan, manajemen user, pengaturan, semua cabang |
| **Admin / Kasir**  | Input order, pembayaran, customer, print invoice                     |
| **Staff Laundry**  | Update progress laundry, scan QR, ubah status proses                 |
| **Driver**         | Pickup task, delivery task, navigasi alamat, upload bukti foto       |
| **Customer**       | Tracking order via portal publik, tanpa login                        |

### Alur Kerja Utama

```
Customer chat WA  →  Sistem buat pickup request
                           ↓
                    Admin konfirmasi
                           ↓
                    Driver pickup
                           ↓
              Staff terima &amp; proses (washing → drying → ironing → packing)
                           ↓
                    Notifikasi WA otomatis ke customer
                           ↓
                    Driver delivery
                           ↓
              Customer terima &amp; bayar
```

### Navigasi Sidebar

Menu utama yang tersedia di sidebar kiri:

| Menu                | Fungsi                                          |
| ------------------- | ----------------------------------------------- |
| Dashboard           | Monitoring bisnis realtime                      |
| Orders              | Daftar dan kelola semua order                   |
| Pickup &amp; Delivery   | Jadwal jemput dan antar                         |
| Customers           | Data pelanggan dan loyalty                      |
| Services            | Pricing layanan                                 |
| Payments            | Riwayat pembayaran                              |
| Reports             | Laporan bisnis dan analitik                     |
| Inventory           | Stok detergent, parfum, packaging               |
| Staff               | Kelola tim karyawan                             |
| WhatsApp            | Automation dan template notifikasi              |
| Marketing           | Campaign dan segmentasi                         |
| Settings            | Konfigurasi tenant                              |

## Konvensi Dokumentasi

- 🔵 **Tip** — saran best practice
- ⚠️ **Penting** — perhatian khusus
- 💡 **Contoh** — skenario penggunaan
- 🚫 **Hindari** — anti-pattern

## Bantuan

- WhatsApp support: `+62 812-xxxx-xxxx`
- Email: `support@laundryhub.id`
- Dokumentasi teknis: [Technical Docs](../technical/README.md)
