# Inventory Management

Kelola stok operasional laundry: detergent, parfum, packaging, dan chemical.

## Akses

Menu: **Inventory**

## Kategori Item

4 kategori default:

| Kategori    | Contoh                                              |
| ----------- | --------------------------------------------------- |
| Sabun       | Detergent premium, sabun cuci, deterjen mesin       |
| Parfum      | Pewangi lavender, sakura, vanilla, downy            |
| Packaging   | Plastik 60x80, plastik 80x100, hanger, label, kertas|
| Chemical    | Pemutih, softener, anti-noda, anti-bakteri          |

## Stats Dashboard

4 widget:

| Widget          | Arti                                          |
| --------------- | --------------------------------------------- |
| Total Item      | Jumlah item terdaftar                         |
| Perlu Restock   | Item dengan stok ≤ minimum stock              |
| Order Bulan Ini | Purchase order yang dibuat                    |
| Nilai Stok      | Total nominal nilai inventory                 |

## Low Stock Alert

Jika ada item yang stok ≤ minimum, banner kuning muncul di atas dengan list nama item dan tombol **+ Buat Order** untuk purchase order cepat.

## Tambah Item

1. Klik **+ Item Baru**
2. Isi:
   - Nama item
   - Kategori (Sabun / Parfum / Packaging / Chemical)
   - Unit (kg, L, pcs, dll)
   - Stock awal
   - Minimum stock (threshold low-stock alert)
3. Klik **Simpan**

## Update Stok

Setiap item card punya 2 tombol:

| Tombol       | Aksi                                                  |
| ------------ | ----------------------------------------------------- |
| Stok Keluar  | Catat pemakaian (otomatis kurangi stok)               |
| Stok Masuk   | Catat pembelian baru / restock                        |

### Stok Keluar

1. Klik **Stok Keluar**
2. Input quantity yang dipakai
3. Pilih reason (production / damage / waste)
4. Optional: link ke order ID
5. Klik **Simpan**

### Stok Masuk

1. Klik **Stok Masuk**
2. Input quantity baru
3. Optional: harga beli (untuk hitung HPP)
4. Optional: supplier
5. Optional: nomor PO
6. Klik **Simpan**

## Auto-Deduction (Recommended)

Sistem bisa otomatis kurangi stok berdasarkan order:

1. Settings → Inventory → Auto-Deduction
2. Untuk setiap layanan, set rasio:
   - 1kg cuci setrika → 50ml detergent + 20ml softener
3. Setiap order completed, sistem auto-kurangi stok

⚠️ **Penting**: Auto-deduction butuh setup awal yang akurat. Test dulu di staging.

## Purchase Order

### Buat PO Manual

1. Klik **+ Buat Order** di low-stock banner
2. Pilih supplier
3. Pilih item dan quantity
4. Sistem hitung total
5. Klik **Send to Supplier** (auto-email)

### Receive PO

Saat barang datang:
1. Inventory → Riwayat PO
2. Pilih PO yang relevan
3. Klik **Receive**
4. Confirm quantity (bisa partial)
5. Stock auto-update

## Supplier Management

Settings → Inventory → Suppliers

Tambah supplier dengan info:
- Nama
- Kontak (telp, email, WA)
- Bank account
- Notes (lead time, payment term)

## Riwayat Stock Movement

Inventory → klik item → tab **History**

Tampilkan semua transaksi stok:
- Timestamp
- Tipe (in/out)
- Quantity
- Reason
- User yang input
- Reference (order ID / PO ID)

## Stock Take (Opname)

Periodic physical count vs system count:

1. Inventory → **Stock Take**
2. Print formulir count
3. Hitung fisik di gudang
4. Input actual count per item
5. Sistem hitung selisih
6. Approve adjustment

## Inventory Best Practices

### Set Minimum Stock dengan Tepat

Rumus: `min_stock = avg_daily_usage × lead_time × safety_factor`

Contoh untuk detergent:
- Pemakaian rata-rata: 2kg/hari
- Lead time supplier: 3 hari
- Safety factor: 1.5
- Min stock = 2 × 3 × 1.5 = **9kg**

### Pisah Stok per Cabang

Setiap cabang punya stok sendiri. Tidak share. Hindari miscount lintas cabang.

### Audit Bulanan

Sebulan sekali, lakukan stock take untuk reconcile system vs physical.

## Skenario

### Pemakaian tidak tercatat

```
Stok detergent: 28kg di system
Stok detergent: 24kg di gudang (selisih 4kg)

1. Stock Take → input 24
2. Pilih reason: "Untracked usage"
3. Approve adjustment
4. System update ke 24kg
```

### Barang rusak

```
Plastik packing 1 dus rusak terkena air

1. Klik Stok Keluar
2. Quantity: 50 pcs
3. Reason: damage
4. Notes: "Kena air banjir Senin malam"
5. Simpan
```

### Restock urgent

```
Pewangi lavender habis sebelum supplier datang

1. Telpon supplier alternatif
2. Klik Stok Masuk → input 5L (purchase emergency)
3. Notes: "Beli emergency dari Supplier B, harga lebih mahal Rp 5K"
4. Simpan
```

## Selanjutnya

- [Reports → Inventory Report](./reports.md)
- [Settings → Suppliers](./settings.md)
