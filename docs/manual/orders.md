# Manajemen Order

Modul utama untuk mengelola seluruh transaksi laundry — dari input hingga selesai.

## Akses

Menu: **Orders** — tersedia untuk **semua role** (Owner, Admin, Staff, Driver), dengan permission berbeda:

| Role | Akses |
|---|---|
| Owner | Full CRUD |
| Admin / Kasir | Full CRUD + input order baru |
| Staff Laundry | Read + update status (via Production Board atau modal) |
| Driver | Read order detail saja (untuk konfirmasi pickup/delivery) |

⚠️ Lihat [Multi-Role &amp; Permissions](./roles.md).

## 11 Status Order

LaundryHub menggunakan workflow 11 status:

| #  | Status              | Arti                                                    |
| -- | ------------------- | ------------------------------------------------------- |
| 1  | WAITING_PICKUP      | Customer request pickup, menunggu driver di-assign      |
| 2  | PICKUP_PROCESS      | Driver dalam perjalanan menjemput                       |
| 3  | RECEIVED            | Laundry diterima di cabang, belum diproses              |
| 4  | WASHING             | Sedang dicuci                                           |
| 5  | DRYING              | Sedang dikeringkan                                      |
| 6  | IRONING             | Sedang disetrika                                        |
| 7  | PACKING             | Sedang dikemas dan diberi label                         |
| 8  | READY_DELIVERY      | Siap diantar / diambil                                  |
| 9  | DELIVERING          | Driver dalam perjalanan mengantar                       |
| 10 | COMPLETED           | Selesai diterima customer                               |
| 11 | CANCELLED           | Dibatalkan                                              |

🔵 **Tip**: Tidak semua status harus dilewati. Order walk-in tanpa pickup langsung mulai dari `RECEIVED`.

## Input Order Baru

### Cara Cepat (target: &lt; 30 detik)

1. Klik **+ Order Baru** di action bar
2. Isi minimal:
   - Nama customer (autocomplete dari database)
   - No. HP
   - Layanan (dropdown)
   - Berat / quantity
3. Klik **Simpan**

Sistem otomatis:
- Generate invoice number (format `INV-YYYYMMDD-XXX`)
- Generate QR code
- Hitung total
- Kirim notifikasi WhatsApp ke customer

### Field Order Lengkap

| Field             | Wajib | Keterangan                                          |
| ----------------- | ----- | --------------------------------------------------- |
| Customer          | ✓     | Pilih existing atau buat baru                       |
| No. HP            | ✓     | Auto-fill dari customer                             |
| Alamat            |       | Wajib bila pickup type = pickup                     |
| Layanan           | ✓     | Cuci setrika, sepatu, karpet, dll                   |
| Berat / Qty       | ✓     | Per kg untuk reguler, per item untuk spesial        |
| Item tambahan     |       | Parfum, pemutih, softener                           |
| Express           |       | Toggle untuk surcharge express                      |
| Pickup / Walk-in  | ✓     | Pickup memerlukan alamat, walk-in tidak             |
| Catatan khusus    |       | Free text untuk staff                               |
| Foto laundry      |       | Upload foto kondisi awal                            |

### Multi-Item Order

Satu order bisa punya beberapa item layanan berbeda:

1. Di form order, klik **+ Tambah Layanan**
2. Pilih layanan tambahan dari dropdown
3. Input berat/qty untuk item tersebut
4. Ulangi untuk item lainnya
5. Subtotal per item dihitung otomatis
6. Grand total = sum semua item

💡 **Contoh**: Customer bawa 5kg cuci setrika + 2 pasang sepatu + 1 bed cover dalam satu order.

Setiap item tersimpan di tabel `order_items` dengan snapshot harga saat order dibuat — perubahan harga layanan di kemudian hari tidak mempengaruhi order lama.

### Diskon

Field diskon tersedia di form order:

1. Input nominal diskon (Rp) di field **Diskon**
2. Diskon dikurangi dari subtotal
3. Kalkulasi: `Total = Subtotal − Diskon + Express Surcharge`

🔵 **Tip**: Diskon bisa digunakan untuk voucher, promo member, atau negosiasi harga B2B.

### Express Surcharge (+50%)

Bila toggle **Express** diaktifkan:

- Sistem otomatis menambah surcharge **+50%** dari subtotal
- Estimasi selesai dipercepat (biasanya 1 hari vs 2-3 hari)
- Kalkulasi: `Express Surcharge = Subtotal × 50%`

**Contoh kalkulasi**:
```
Subtotal:          Rp 100.000
Diskon:           -Rp  10.000
Express (+50%):   +Rp  50.000
─────────────────────────────
Total:             Rp 140.000
```

### Refund Order

Bila customer minta refund setelah pembayaran:

1. Buka order detail
2. Di bagian pembayaran, klik **Refund**
3. Sistem buat record payment negatif
4. Payment status order di-update sesuai sisa

Lihat detail di [Payments → Refund](./payments.md#refund).

## Filter &amp; Search

### Filter Status (Pills)

Di atas tabel ada pill filter status. Klik untuk filter:
- **Semua** — semua order
- **Menunggu Pickup**, **Dicuci**, **Dikeringkan**, dll
- **Selesai**

Setiap pill menampilkan jumlah order untuk status itu.

### Search

Search bar mencari di:
- Nama customer
- Invoice number
- Nomor HP

🔵 **Tip**: Ketik 4 digit terakhir nomor HP untuk hasil cepat.

### Filter Lanjutan

Klik icon filter (next to search). Filter berdasarkan:
- Cabang
- Tanggal range
- Payment status (Lunas / Belum Bayar)
- Pickup type

## Update Status Order

### Cara 1: Edit Manual

1. Klik baris order
2. Klik tombol **Edit Status**
3. Pilih status baru
4. Klik **Update**

### Cara 2: Production Board (Staff Laundry)

Staff Laundry punya **Dashboard kanban** dengan 5 kolom (RECEIVED → WASHING → DRYING → IRONING → PACKING). Klik **"Next →"** di card untuk pindah status.

Lihat [Dashboard Staff](./dashboard.md#dashboard-staff-laundry--production-board).

### Cara 3: Scan QR Code (Planned)

Untuk update massal di area produksi:

1. Buka **Quick Actions → Scan QR**
2. Scan QR di kantong laundry
3. Pilih next status
4. Otomatis ter-update

🔵 **Tip**: Setiap order print invoice + QR code label. Scan dari smartphone untuk ngikut workflow tanpa balik ke meja kasir.

## Aksi per Order

Di tabel order, kolom paling kanan ada 3 tombol:

| Icon                | Aksi                                       |
| ------------------- | ------------------------------------------ |
| 🖨️ Printer          | Cetak invoice thermal                      |
| 📱 QR               | Tampilkan QR code untuk re-scan            |
| ⋯ More              | Edit, duplicate, cancel, delete            |

### Cetak Invoice Thermal

1. Klik icon Printer
2. Pilih printer (USB / Bluetooth)
3. Otomatis cetak invoice 80mm thermal

⚠️ **Penting**: Pastikan printer thermal sudah terhubung sebelum klik. Lihat [Printer Setup](./settings.md#printer).

### Cancel Order

1. Klik **⋯ More → Cancel Order**
2. Pilih alasan cancel (dropdown)
3. Optional: refund payment bila sudah bayar

⚠️ **Penting**: Order yang sudah CANCELLED tidak bisa dikembalikan ke status aktif. Buat order baru bila perlu.

### Duplicate Order

Berguna untuk customer langganan dengan layanan rutin yang sama.

1. Klik **⋯ More → Duplicate**
2. Modifikasi field bila perlu
3. Klik Simpan

## Pembayaran

Lihat [Payments](./payments.md).

## Tampilan Mobile

Di mobile, order ditampilkan sebagai **card** (bukan tabel). Setiap card menampilkan info terpenting dengan layout vertikal.

## FAQ Order

### Order salah input bagaimana?

Klik order → Edit. Bila sudah lewat status WASHING, hubungi staff produksi dulu.

### Customer mau tambah item setelah order dibuat?

Klik **⋯ More → Tambah Item**. Sistem hitung ulang total dan kirim invoice baru.

### Bagaimana kalau customer datang sebelum order siap?

Status bisa di-update ke READY_DELIVERY manual oleh admin. Sistem akan kirim WhatsApp otomatis.

## Selanjutnya

- [Pickup &amp; Delivery](./pickup-delivery.md)
- [Payments](./payments.md)
