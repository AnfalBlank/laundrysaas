# Pembayaran

POS dan riwayat pembayaran multi-method.

## Akses

Menu: **Payments**

## Methods Overview (Atas Halaman)

4 widget summary per metode pembayaran:

| Method     | Ciri                                       |
| ---------- | ------------------------------------------ |
| Cash       | Pembayaran tunai langsung di kasir         |
| QRIS       | Scan QR via Midtrans / Xendit              |
| Transfer   | Bank transfer manual atau virtual account  |
| E-Wallet   | DANA, OVO, GoPay, ShopeePay                |

Setiap widget tampilkan total dan jumlah transaksi.

## Outstanding Payment

Banner alert kuning di tengah:

> **N order menunggu · Rp X.XXX.XXX**

Klik **Kirim Reminder** untuk auto-blast notifikasi ke customer yang belum bayar via channel aktif (WhatsApp/Telegram).

### Cara Kerja Payment Reminder

1. Klik tombol **Kirim Reminder** di banner outstanding
2. Sistem ambil semua order dengan status `unpaid`
3. Kirim pesan reminder ke masing-masing customer via channel aktif
4. Notifikasi berisi: nama customer, nomor invoice, total tagihan
5. Toast konfirmasi muncul: "Reminder terkirim ke N customer"

🔵 **Tip**: Gunakan fitur ini di akhir minggu untuk mengingatkan customer yang belum bayar. Jangan terlalu sering agar tidak mengganggu.

## Riwayat Transaksi

Tabel di bawah dengan kolom:
- Invoice
- Customer + No. HP
- Metode
- Tanggal
- Status (Lunas / Pending)
- Jumlah

## Input Pembayaran

Pembayaran dilakukan via **halaman Order Detail**, bukan langsung di Payments. Flow:

1. Buka Order yang akan dibayar
2. Klik **Bayar Sekarang**
3. Pilih metode (Cash / QRIS / Transfer / E-Wallet)
4. Input nominal
5. Klik **Konfirmasi Pembayaran**

Sistem otomatis:
- Update payment_status order ke `paid`
- Catat di tabel payments
- Kirim invoice + receipt via WhatsApp
- Update tier customer bila threshold tercapai

## Split Payment

Untuk pembayaran sebagian (DP/cicilan):

1. Klik **Bayar Sekarang**
2. Toggle **Split Payment**
3. Input nominal yang dibayar
4. Pilih metode
5. Konfirmasi

Sisa hutang otomatis tercatat. Status payment jadi `partial` sampai lunas.

## DP (Down Payment)

Untuk order besar (laundry hotel, B2B):

1. Saat input order, toggle **DP**
2. Set persentase DP (default 50%)
3. Customer bayar DP saat pickup
4. Sisa dilunasi saat delivery

## Hutang / Piutang

Customer langganan bisa bayar di akhir bulan:

1. Order completed dengan payment status `unpaid`
2. Sistem akumulasi total hutang per customer
3. Dashboard tampilkan list customer dengan hutang
4. Saat bayar, bisa lunasi multiple order sekaligus

## Integrasi Payment Gateway

### Midtrans

1. Settings → Integrasi → Midtrans
2. Input Server Key + Client Key
3. Toggle production/sandbox
4. Test transaksi

Setelah connect, semua QRIS dan VA dibuat otomatis oleh Midtrans saat customer bayar online.

### Xendit

Sama seperti Midtrans, tapi pakai Xendit API key.

### Duitku

Indonesia local payment processor — cocok untuk yang sudah pakai system Duitku.

## Cetak Receipt

Setiap pembayaran sukses, sistem auto-print receipt thermal (bila printer terhubung).

Manual print: di order detail → klik **Print Receipt**.

## Refund

Refund mencatat pengembalian dana sebagai **payment record negatif** (amount minus).

### Cara Refund

1. Buka halaman **Payments**
2. Di tabel Riwayat Transaksi, cari pembayaran yang akan di-refund
3. Klik tombol **Refund** di kolom aksi
4. Konfirmasi refund
5. Sistem otomatis:
   - Buat record payment baru dengan amount **negatif** (contoh: -Rp 35.000)
   - Update `paymentStatus` order menjadi `unpaid` atau `partial`
   - Catat di history

### Catatan Penting

- Refund tercatat sebagai negative payment di database
- Total revenue di laporan akan berkurang sesuai refund
- Refund tidak menghapus record pembayaran asli — keduanya tetap visible di history
- Metode pengembalian (cash/transfer) dicatat di field reference

### Contoh

```
Payment asli:  +Rp 100.000 (QRIS, 17 Mei)
Refund:        -Rp 100.000 (Refund, 19 Mei)
Net:            Rp 0
Order status:   unpaid
```

## Reconciliation

### Daily Cash Closing

Akhir hari, kasir tutup buku:

1. Reports → Cash Closing
2. Sistem tampilkan:
   - Total cash diterima
   - Total cash di kasir (input manual)
   - Selisih (idealnya 0)
3. Catat selisih bila ada
4. Generate laporan PDF

### QRIS / E-Wallet Auto-Reconcile

Bila pakai Midtrans/Xendit, transaksi auto-rekonsiliasi via webhook. Tidak perlu input manual.

## Skenario

### Customer bayar pakai 2 metode (split)

```
Total order: Rp 100.000
Customer bayar Rp 50.000 cash + Rp 50.000 QRIS

1. Klik Bayar → Toggle Split
2. Input metode 1: Cash, Rp 50.000
3. Tambah metode 2: QRIS, Rp 50.000
4. Total terbayar: Rp 100.000
5. Status: Lunas
```

### Customer minta tambah service di tengah jalan

```
Order awal: 5kg cuci setrika = Rp 35.000 (lunas)
Customer minta tambah parfum premium = Rp 5.000

1. Order detail → Tambah Item
2. Service: Parfum Premium, Rp 5.000
3. Total order baru: Rp 40.000
4. Sisa hutang: Rp 5.000 (auto)
5. Customer bayar saat pickup → status Lunas
```

### Lupa input pembayaran

Bila staff lupa input dan order sudah completed:

1. Order detail → klik **Tambah Pembayaran Manual**
2. Input data sesuai
3. Set tanggal sesuai actual

⚠️ **Penting**: Pembayaran retroaktif tetap muncul di laporan dengan tanggal aktual, bukan tanggal input.

## Selanjutnya

- [Reports](./reports.md) — laporan keuangan
- [Settings → Integrations](./settings.md)
