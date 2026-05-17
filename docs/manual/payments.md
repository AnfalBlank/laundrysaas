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

Klik **Kirim Reminder** untuk auto-blast WhatsApp ke customer yang belum bayar.

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

1. Buka payment di Riwayat Transaksi
2. Klik **⋯ → Refund**
3. Pilih:
   - **Full Refund** — kembalikan semua nominal
   - **Partial Refund** — input nominal yang di-refund
4. Pilih metode refund (cash / transfer balik / kredit ke saldo customer)
5. Konfirmasi

Refund tercatat sebagai negative payment.

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
