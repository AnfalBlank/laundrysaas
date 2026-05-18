# Purchase Orders (Pembelian Stok)

Modul untuk pemesanan stok ke supplier dengan tracking lengkap dari order → terima → otomatis update stok &amp; COGS.

## Akses

Menu: **Purchase Orders** (sidebar — Owner &amp; Admin)

## Konsep

```
Stok rendah  →  Buat PO  →  Order ke supplier  →  Barang datang
                                                       ↓
                                              Tap "Terima" di app
                                                       ↓
                                       Stok auto-tambah + COGS tracking
```

## Stat Dashboard PO

4 widget:

- **Total PO** — jumlah PO sepanjang waktu
- **Pending** — value PO yang status `ordered` (belum diterima)
- **Diterima** — value PO yang sudah received
- **Low Stock Items** — jumlah item yang perlu restock

## Auto-Fill PO dari Low Stock

Fitur **auto-fill** memudahkan saat banyak item perlu di-restock.

### Cara

1. Banner kuning **"N item perlu di-restock"** akan muncul jika ada low stock
2. Klik **"+ Auto-Fill PO"** atau **"Plus icon"** di banner
3. Modal terbuka dengan items pre-filled:
   - Quantity: `(minimumStock × 2) − currentStock` (rumus auto)
   - UnitPrice: kosong (perlu diisi manual)
4. Edit harga sesuai kuotasi supplier
5. Pilih supplier (atau kosongkan jika supplier baru)
6. Tambah catatan
7. Submit

## Buat PO Manual

1. Klik **"+ Buat PO Baru"** (di action bar)
2. **Pilih Supplier** (opsional, atau buat baru — TODO)
3. **Tambah Item**:
   - Klik **"+ Tambah Item"**
   - Pilih item dari inventory
   - Isi quantity dan harga per unit
   - Subtotal auto-calculate
4. Tambah lebih banyak item kalau perlu
5. Catatan
6. Lihat preview total
7. Klik **"Buat PO (Rp X.XXX.XXX)"**

PO Number auto-generate: format `PO-YYYYMMDD-XXX`.

## Status Workflow

| Status | Arti |
|---|---|
| **Draft** | PO dibuat tapi belum dikirim ke supplier |
| **Ordered** | PO sudah dikirim, menunggu kedatangan |
| **Partial** | Sebagian item sudah diterima |
| **Received** | Semua item diterima, stok sudah update |
| **Cancelled** | PO dibatalkan |

⚠️ **Default**: PO baru langsung status `ordered`.

## Receive PO (Saat Barang Datang)

### Workflow

1. Supplier antar barang ke cabang
2. Cek fisik barang vs PO
3. Buka **Purchase Orders** di app
4. Cari PO yang relevan (status: ordered)
5. Klik **"Terima"**
6. Konfirmasi dialog
7. Sistem otomatis:
   - Tambah `quantity` ke `inventory.stock` setiap item
   - Create `inventory_movement` type=`in`, dengan `unitCost` dari PO
   - Update PO status ke `received`
   - Set `receivedAt` timestamp

### Setelah Receive

- Cek **Inventory** → stok sudah bertambah
- Cek **Inventory → History Pemakaian** → muncul movement type=in dengan reference PO number
- Cek **Reports → P&amp;L** → COGS bisa pakai unit cost ini

🔵 **Tip**: Saat staff pakai bahan ini nanti (Stok Keluar), unit cost yang dipakai untuk hitung COGS adalah unit cost dari PO ini.

## Cancel PO

Klik icon ❌ di PO yang masih ordered:
1. Konfirmasi
2. Status berubah ke `cancelled`
3. Stok TIDAK ditambah

## Tabel PO List

Kolom:
- **PO Number** — `PO-YYYYMMDD-XXX`
- **Supplier** — nama + phone
- **Tanggal** — `createdAt`
- **Status** — color badge
- **Total** — nominal PO
- **Aksi** — Terima / Batal / View

## Use Cases

### Skenario 1: Restock Routine

```
Senin pagi:
1. Cek dashboard → 3 item low stock
2. Klik "+ Auto-Fill PO"
3. Pre-filled:
   - Detergent: 10 kg
   - Pewangi Lavender: 6 L
   - Pemutih: 8 L
4. Telpon supplier dapatkan harga:
   - Detergent: Rp 25.000/kg
   - Lavender: Rp 35.000/L
   - Pemutih: Rp 18.000/L
5. Input harga → total Rp 604.000
6. Pilih Supplier "PT Sumber Laundry"
7. Notes: "Antar Selasa pagi"
8. Submit PO

Selasa pagi:
9. Barang datang
10. Cek fisik OK
11. Buka PO → klik "Terima"
12. Stok auto-update
13. Done
```

### Skenario 2: Pembelian Mendadak

```
Customer minta express, butuh 10 hanger lebih
Stok hanger: 86 → masih cukup
Tapi minimum stock setting: 50

Strategy:
1. Bukan masalah urgent
2. Cancel auto-fill, buat PO biasa nanti

Atau:
1. Klik "+ Buat PO Baru"
2. Tambah hanger 100 pcs
3. Skip supplier
4. Submit
5. Beli sendiri di toko terdekat
6. Receive saat balik kantor
```

### Skenario 3: PO Salah, Cancel

```
1. Sudah submit PO ke supplier
2. Realisasi salah pilih kategori
3. Buka PO list
4. Klik icon ❌ Cancel
5. Konfirmasi
6. Status → cancelled
7. Buat PO baru yang benar
8. Coordinate dengan supplier untuk replace
```

## Integrasi dengan Modul Lain

### → Inventory

PO Receive otomatis:
- Tambah `inventory.stock`
- Insert ke `inventory_movements` type=`in`

### → Reports / P&amp;L

Saat staff pakai bahan (Stok Keluar):
- Movement type=`out` dibuat dengan `totalCost` (qty × unitCost dari PO)
- COGS di P&amp;L = total movements `out`

### → Expenses

PO **TIDAK** otomatis ter-input ke Expenses karena PO adalah **inventory cost**, bukan operating expense.

⚠️ **Penting**: COGS (dari inventory) ≠ OPEX (dari expenses):
- COGS: bahan langsung untuk produk (detergent, parfum)
- OPEX: biaya operasional umum (gaji, sewa, listrik)

## Best Practice

### Disiplin Receive

🔵 **Tip**: Receive PO segera saat barang datang untuk:
- Stok up-to-date di system
- Staff lihat stok yang akurat
- COGS tracking lebih akurat

🚫 **Hindari**: Tunda receive berhari-hari → stok system tidak match fisik.

### Cek Harga Rutin

Setiap PO, cek harga vs PO sebelumnya:
- Naik tajam? Negosiasi dengan supplier
- Turun? Stock up

### Multiple Suppliers

Punya 2-3 supplier per kategori:
- Bandingkan harga
- Backup jika satu out of stock
- Negotiation power

### Set Realistic Min Stock

Saat Auto-Fill pakai rumus `(min × 2) - current`:
- Min terlalu kecil → sering kehabisan
- Min terlalu besar → modal nyangkut di stok

Idealnya: `min = avg_daily_usage × lead_time × 1.5`

Contoh detergent:
- Pemakaian: 2kg/hari
- Lead time supplier: 3 hari
- Min: 2 × 3 × 1.5 = **9 kg**

## Supplier Management (TODO)

Saat ini supplier di-add via API. UI manage supplier akan dirilis di update berikutnya.

API endpoints sudah ada:
- `GET /api/suppliers`
- `POST /api/suppliers` — create
- `PATCH /api/suppliers/[id]` — update
- `DELETE /api/suppliers/[id]` — delete

## FAQ Purchase Orders

### Q: Kalau supplier kasih diskon?
A: Saat ini diskon di-input manual di field nominal. Field discount di schema sudah ada, UI akan dirilis di update berikutnya.

### Q: Bisa partial receive (terima sebagian)?
A: Schema support `received_quantity` per item, tapi UI saat ini hanya support full receive. Partial coming soon.

### Q: Cetak PO untuk supplier?
A: Saat ini belum ada. WIP: print PO atau email PDF ke supplier.

### Q: Track invoice dari supplier?
A: Belum. Roadmap: linking PO ke invoice supplier untuk track utang dagang.

### Q: Bisa edit PO setelah dibuat?
A: Tidak (current). Cancel + buat baru.

### Q: Apa beda PO dengan Expenses?
A: PO untuk **inventory** (bahan baku), masuk ke COGS. Expenses untuk **operational cost** (gaji, sewa), masuk ke OPEX.

## Selanjutnya

- [Inventory](./inventory.md)
- [Expenses &amp; Reports](./expenses-reports.md)
