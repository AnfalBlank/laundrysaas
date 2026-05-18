# Inventory Management

Kelola stok operasional laundry dengan tracking lengkap setiap pergerakan.

## Akses

Menu: **Inventory** (Owner, Admin, Staff Laundry)

## 2 Tabs

### Tab 1: Daftar Item
Grid card dengan stok current, low-stock alert, edit/delete, adjust stok masuk/keluar.

### Tab 2: History Pemakaian 🆕
Timeline lengkap pergerakan stok dengan unit cost — basis untuk perhitungan COGS di Reports.

---

## Kategori Item

4 kategori default:

| Kategori    | Contoh                                              |
| ----------- | --------------------------------------------------- |
| Sabun       | Detergent premium, sabun cuci, deterjen mesin       |
| Parfum      | Pewangi lavender, sakura, vanilla, downy            |
| Packaging   | Plastik 60x80, plastik 80x100, hanger, label, kertas|
| Chemical    | Pemutih, softener, anti-noda, anti-bakteri          |

## Stats Dashboard

4 widget di atas:

| Widget          | Arti                                          |
| --------------- | --------------------------------------------- |
| Total Item      | Jumlah item terdaftar                         |
| Perlu Restock   | Item dengan stok ≤ minimum stock              |
| Order Bulan Ini | Purchase order yang dibuat                    |
| Nilai Stok      | Total nominal nilai inventory                 |

## Low Stock Alert

Banner kuning di atas tab "Daftar Item" jika ada item ≤ minimum:
- List nama item low stock
- Tombol **+ Buat Order** → buka [Purchase Orders](./purchase-orders.md) auto-fill

## Tab "Daftar Item"

### Tambah Item Baru

1. Klik **+ Item Baru**
2. Isi:
   - Nama item (e.g. "Detergent Premium")
   - **Kategori** (Sabun / Parfum / Packaging / Chemical)
   - **Unit** (kg, L, pcs, box)
   - **Stok Awal**
   - **Minimum Stock** (threshold low-stock alert)
3. Klik **Simpan**

### Edit Item

Klik icon ✏️ di card item untuk update:
- Nama
- Kategori
- Unit
- Minimum Stock

⚠️ **Note**: Stok current TIDAK bisa di-edit langsung. Pakai **Stok Masuk / Stok Keluar** untuk track movement.

### Hapus Item

Klik icon 🗑️ → konfirmasi.

⚠️ **Penting**: Hapus item permanen, tidak bisa di-undo. Kalau item tidak dipakai lagi, pertimbangkan keep saja dengan minimumStock=0.

### Update Stok

Setiap item card punya 2 tombol:

| Tombol       | Aksi                                                  |
| ------------ | ----------------------------------------------------- |
| **Stok Keluar**  | Catat pemakaian (otomatis kurangi stok + create movement OUT) |
| **Stok Masuk**   | Catat pembelian baru / restock (tambah stok + movement IN) |

#### Stok Keluar

1. Klik **Stok Keluar**
2. Input quantity yang dipakai
3. Sistem otomatis:
   - Kurangi `inventory.stock`
   - Insert ke `inventory_movements` type=`out`
   - Total cost = qty × current avg unit cost (untuk COGS)

#### Stok Masuk

1. Klik **Stok Masuk**
2. Input quantity baru
3. Sistem otomatis:
   - Tambah `inventory.stock`
   - Insert ke `inventory_movements` type=`in`

🔵 **Tip**: Untuk stok masuk dari pembelian besar, lebih baik pakai **[Purchase Orders](./purchase-orders.md)** karena bisa input unit cost untuk COGS yang lebih akurat.

## Tab "History Pemakaian" 🆕

Timeline movements stok dengan kolom:

| Kolom | Arti |
|---|---|
| **Tanggal** | Kapan movement terjadi |
| **Item** | Nama inventory item |
| **Type** | Masuk (hijau) / Keluar (merah) / Adjust |
| **Qty** | `+50 kg` (in) atau `−2 L` (out) |
| **Reason** | manual / restock / production / damage |
| **Reference** | PO Number kalau dari PO, atau ID order |
| **Total Cost** | qty × unit cost (untuk COGS calculation) |

### Use Cases History

#### Audit pemakaian
```
Q: Detergent kok cepat habis?
A:
1. Tab History Pemakaian
2. Filter item: Detergent (TODO: filter coming)
3. Lihat trend pemakaian per hari
4. Cek total cost
5. Bandingkan dengan order count → makin banyak order makin banyak detergent → normal
```

#### Verifikasi PO sudah masuk
```
PO baru terima:
1. Tab History Pemakaian
2. Cari movement type=Masuk dengan reference PO Number
3. Pastikan qty dan unit cost sesuai
4. Done
```

#### Investigasi loss
```
Stok system: 12 kg
Stok fisik: 8 kg (selisih 4 kg)

1. Tab History Pemakaian
2. Lihat semua movement bulan ini
3. Hitung manual: in - out = expected
4. Compare dengan fisik
5. Kalau ada selisih unexplained → investigate
```

## Auto-Deduction (TODO)

Roadmap: setiap order completed, sistem auto-kurangi stok berdasarkan rasio config. Contoh:
- 1kg cuci setrika → 50ml detergent + 20ml softener

⚠️ Saat ini belum implemented. Stok keluar masih manual oleh staff.

## Use Cases Operasional

### Pagi: cek stok

```
1. Buka Inventory tab "Daftar Item"
2. Cek banner low stock
3. Kalau ada → buat PO atau lapor admin
```

### Sebelum proses laundry

```
1. Mulai cuci → pakai detergent
2. Buka Inventory
3. Cari Detergent Premium → klik Stok Keluar
4. Input: 0.5 kg
5. Save → stok ter-update
```

### Receive PO

Lihat [Purchase Orders → Receive](./purchase-orders.md#receive-po-saat-barang-datang).

### Stock Take Bulanan

Periodic physical count:

```
1. Print "Daftar Item" (export CSV)
2. Ke gudang, hitung fisik per item
3. Catat di kolom "Aktual"
4. Hitung selisih: Aktual - System
5. Adjust manual via Stok Keluar (kalau system > aktual)
6. Atau Stok Masuk (kalau aktual > system)
7. Notes: "Stock take 17 Mei 2026"
```

## Stats Dashboard

4 widget di atas tab content:

- **Total Item**: jumlah item aktif
- **Perlu Restock**: stok ≤ minimum
- **Order Bulan Ini**: PO bulan ini (TODO: connect)
- **Nilai Stok**: total nominal (mockup)

## Best Practices

### Set Min Stock dengan Tepat

Rumus: `min_stock = avg_daily_usage × lead_time × safety_factor`

Contoh untuk detergent:
- Pemakaian: 2kg/hari
- Lead time supplier: 3 hari
- Safety factor: 1.5
- **Min stock = 2 × 3 × 1.5 = 9kg**

### Disiplin Catat Stok Keluar

🔵 **Wajib**: Setiap kali pakai bahan, langsung input Stok Keluar.

🚫 **Hindari**: Pakai dulu, catat nanti — bisa lupa, system tidak akurat, COGS salah.

### Audit Bulanan

Sebulan sekali, lakukan stock take untuk reconcile system vs physical.

### Naming Convention

```
[Brand] [Type] [Spec]

Contoh:
- Detergent Daia 25kg
- Pewangi Downy Lavender 5L
- Plastik 60x80 Roll 100m
```

## Integrasi dengan Modul Lain

### → Reports (P&amp;L)

```
Inventory Movement type=out (qty × unitCost)
        ↓
   COGS di Income Statement
        ↓
   Hitung Gross Profit
```

### → Purchase Orders

```
Buat PO → Items dari Inventory list
   ↓
Receive PO → Auto inventory_movement IN
   ↓
Stok Inventory bertambah
```

### → Orders (Future)

Saat order completed, auto-deduct inventory berdasarkan service config.

## FAQ Inventory

### Q: Stok system tidak match fisik
A: Lakukan stock take, adjust via Stok Keluar/Masuk.

### Q: Mau hapus item, tapi sudah ada history
A: Schema preserve history (FK cascade ke movement). Aman untuk hapus, tapi history movement akan ikut hilang. Pertimbangkan set minimum=0 saja.

### Q: Bagaimana track per-batch (misal beli 2 batch dengan harga beda)?
A: Saat ini sistem tidak support FIFO/LIFO per batch. Pakai average cost. Schema sudah disiapkan untuk batch tracking di v0.5.0.

### Q: Bagaimana kalau bahan rusak / expired?
A: Stok Keluar dengan note "damage" / "expired". Total cost akan masuk ke COGS sebagai loss.

## Selanjutnya

- [Purchase Orders](./purchase-orders.md) — pembelian baru
- [Expenses &amp; Reports](./expenses-reports.md) — COGS di P&amp;L
