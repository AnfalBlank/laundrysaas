# Customer Management

Kelola data pelanggan dan program loyalitas.

## Akses

Menu: **Customers** — tersedia untuk **Owner** &amp; **Admin / Kasir**.

❌ Staff Laundry &amp; Driver tidak punya akses ke modul ini.

## Stats Overview

4 widget di atas halaman:

| Widget               | Arti                                              |
| -------------------- | ------------------------------------------------- |
| Total Customer       | Jumlah customer terdaftar                         |
| VIP / Platinum       | Customer tier tertinggi (% dari total)            |
| Repeat Order         | % customer yang order &gt; 1 kali                    |
| Inactive 30 hari     | Customer yang &gt; 30 hari tidak order               |

## Tier System

3 level membership otomatis berdasarkan total spending:

| Tier         | Threshold (total spending)  | Benefit                      |
| ------------ | --------------------------- | ---------------------------- |
| 🥉 Silver    | &lt; Rp 500.000                 | Reguler                      |
| 🥇 Gold      | Rp 500.000 - 2.000.000      | Diskon 5%, prioritas pickup  |
| 💎 Platinum  | &gt; Rp 2.000.000               | Diskon 10%, free express, free pickup unlimited |

Tier auto-update setiap order completed.

## Filter &amp; Search

### Filter Tier

Pill di atas grid: **Semua / Silver / Gold / Platinum**

### Search

Cari berdasarkan nama atau nomor HP.

## Customer Card

Setiap customer ditampilkan sebagai card dengan:

- Avatar 3D dengan icon sesuai tier (Crown, Star, atau User icon — non-emoji)
- Nama + nomor HP
- Badge tier
- 3 metrics:
  - **Order** — total jumlah order
  - **Spent** — total spending
  - **Poin** — saldo loyalty point
- Tombol **Chat** &amp; **Detail**
- Tanggal bergabung

## Tambah Customer

### Manual

1. Klik **+ Customer Baru**
2. Isi: nama, no. HP, alamat (optional), notes
3. Klik **Simpan**

### Auto via Order

Saat input order baru dengan no. HP yang belum terdaftar, sistem otomatis create customer record.

### Auto via WhatsApp

Saat customer chat ke nomor bisnis pertama kali, AI bot otomatis create customer.

## Detail Customer

Klik tombol **Detail** untuk membuka **Customer Detail Modal** dengan tab:

### Tab Histori Transaksi

- Semua order pernah dibuat (auto-load via API)
- Status, total, tanggal
- Klik order → masuk ke order detail

### Tab Loyalty

- Saldo poin
- Riwayat earn (1 poin per Rp 1.000 spending)
- Riwayat redeem
- Manual adjustment (admin only)

### Tab Notes

Free-form notes admin tentang customer:
- Preferensi (parfum favorit, level kekeringan, dll)
- History komplain
- Special instructions

### Tab Settings

- **Edit data customer** (nama, phone, alamat, notes)
- Toggle **Blacklist** (no future orders allowed)
- **Delete** customer (cascade ke orders — gunakan hati-hati)

## Loyalty Point System

### Earn Rules

- **1 poin per Rp 1.000** spending (auto)
- **Bonus poin** saat tier up (Silver→Gold: +500, Gold→Platinum: +1000)
- **Referral** — 200 poin per teman yang order pertama kali
- **Birthday bonus** — 100 poin di bulan ulang tahun

### Redeem Rules

- **Min. redeem**: 100 poin
- **Konversi**: 100 poin = Rp 5.000 diskon
- **Max. discount**: 50% dari total order
- Redeem di kasir saat checkout

## Segmentasi

Customer otomatis ter-segment ke:

| Segment              | Definisi                                       |
| -------------------- | ---------------------------------------------- |
| **VIP**              | Tier Platinum                                  |
| **Regular**          | &gt; 5 order historis                             |
| **New Customer**     | &lt; 30 hari sejak join                           |
| **Inactive**         | &gt; 30 hari tidak order                          |

Segment digunakan untuk targeted [Marketing](./marketing.md).

## Customer Portal

Customer bisa lihat order &amp; tracking sendiri di portal publik tanpa login. Kirim link via WhatsApp:

```
https://[bisnis].laundryhub.id/track/INV-20240517-001
```

Lihat [Customer Portal](./customer-portal.md).

## Blacklist Customer

Untuk customer bermasalah (tidak bayar, hilang barang, dll):

1. Buka detail customer
2. Tab Settings → toggle **Blacklist**
3. Order baru otomatis ditolak dengan pesan custom

⚠️ **Penting**: Blacklist tidak menghapus data, hanya mencegah order baru.

## Skenario

### Customer hilang nomor HP

Search dengan nama. Bila ada beberapa kandidat, tanyakan alamat untuk verifikasi.

### Customer pakai beberapa nomor

Bisa merge customer:
1. Buka kandidat A → Tab Settings
2. Klik **Merge ke customer lain**
3. Pilih customer B
4. Konfirmasi — semua order dari A pindah ke B, A dihapus

### Customer minta hapus data (privacy)

GDPR-style data deletion:
1. Detail customer → Tab Settings
2. **Anonymize** — nama dan kontak diganti placeholder, order tetap tersimpan untuk laporan

## Selanjutnya

- [Marketing](./marketing.md)
- [WhatsApp Automation](./whatsapp.md)
