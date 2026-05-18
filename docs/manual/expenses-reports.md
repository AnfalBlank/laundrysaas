# Expenses &amp; Reports (Income Statement)

Pencatatan biaya operasional dan laporan keuangan lengkap untuk Owner.

## Akses

- **Expenses**: menu **Expenses** (sidebar — hanya Owner)
- **Reports**: menu **Reports** (sidebar — hanya Owner)

---

## Modul Expenses (Pengeluaran)

### Apa itu Expenses?

Expenses adalah modul pencatatan **Operating Expenses (OPEX)** — biaya operasional bisnis selain HPP/COGS. Contoh: gaji, sewa, listrik, internet, transport, marketing.

### 10 Kategori Default

| Kategori | Contoh |
|---|---|
| Gaji &amp; Tunjangan | Gaji bulanan staff, tunjangan, bonus |
| Sewa Tempat | Sewa cabang, kontrak ruko |
| Listrik &amp; Air | Tagihan PLN, PDAM |
| Internet &amp; Telepon | Indihome, paket data, pulsa |
| Bahan Operasional | Pemutih (non-stock items) |
| Transport &amp; BBM | Bensin motor driver |
| Marketing &amp; Iklan | Banner, social media ads |
| Maintenance Mesin | Service mesin cuci, sparepart |
| Pajak &amp; Retribusi | PBB, retribusi pasar |
| Lain-lain | Misc, tak terduga |

### Stat Dashboard Expenses

4 widget di atas:

- **Total Bulan Ini**: total pengeluaran sejak tanggal 1
- **Kategori Aktif**: berapa kategori yang dipakai
- **Top Kategori**: kategori dengan pengeluaran terbesar
- **Rata-rata**: total / jumlah transaksi

### Catat Pengeluaran Baru

1. Klik **+ Catat Pengeluaran**
2. Isi:
   - **Judul** — wajib (e.g. "Bayar listrik Mei")
   - **Kategori** — pilih dari 10 kategori
   - **Tanggal** — kapan pengeluaran terjadi
   - **Nominal (Rp)** — wajib
   - **Metode Bayar** — Cash / Transfer / QRIS / E-Wallet / Lainnya
   - **Vendor / Tujuan** — opsional (e.g. "PLN", "Tukang AC")
   - **Cabang** — opsional, untuk attribution
   - **Catatan** — detail tambahan
3. Klik **Simpan**

🔵 **Tip**: Catat secepat mungkin saat keluar uang, sebelum lupa. Receipt photo bisa disimpan di field Notes (URL).

### Edit / Hapus

- Klik icon ✏️ untuk edit
- Klik icon 🗑️ untuk hapus

⚠️ **Penting**: Hapus expense permanen — tidak ada audit log. Pertimbangkan edit dengan note "DIBATALKAN" daripada hapus.

### Breakdown Kategori (Visual)

Panel kiri menunjukkan breakdown per kategori dengan:
- Color-coded progress bar
- Persentase dari total
- Jumlah transaksi

### Tabel Pengeluaran

Panel kanan menampilkan list lengkap dengan kolom:
- Tanggal
- Kategori (color-coded badge)
- Judul + vendor
- Metode bayar
- Nominal (warna merah, prefix +)

### Export

Klik **Export** → download CSV semua pengeluaran bulan ini.

CSV columns: Tanggal, Kategori, Judul, Vendor, Cabang, Metode Bayar, Nominal, Notes.

### Skenario Real Case

**Bayar gaji bulanan:**
```
1. Catat Pengeluaran
2. Judul: "Gaji Mei 2026"
3. Kategori: Gaji & Tunjangan
4. Nominal: Rp 8.500.000
5. Metode: Transfer
6. Vendor: "Payroll Mei"
7. Catatan: "5 staff × avg 1.7jt"
```

**Bayar listrik:**
```
1. Catat Pengeluaran
2. Judul: "Listrik Cabang Pusat - Mei"
3. Kategori: Listrik & Air
4. Tanggal: 17 Mei 2026
5. Nominal: Rp 850.000
6. Metode: QRIS
7. Vendor: PLN
8. Cabang: Cabang Pusat
```

**Beli bensin driver:**
```
1. Catat Pengeluaran
2. Judul: "BBM motor pickup minggu ini"
3. Kategori: Transport & BBM
4. Nominal: Rp 200.000
5. Metode: Cash
```

---

## Modul Reports — Income Statement (P&amp;L)

### Apa itu P&amp;L?

**P&amp;L (Profit and Loss)** atau **Income Statement** adalah laporan keuangan formal yang menunjukkan apakah bisnis untung atau rugi dalam periode tertentu.

### Layout Laporan

```
Revenue (Pendapatan)              Rp X
(−) COGS (Cost of Goods Sold)    (Rp Y)
═══════════════════════════════════════
Gross Profit                      Rp X-Y    Margin Z%
(−) Operating Expenses            (Rp W)
═══════════════════════════════════════
Net Profit / Net Loss             Rp Z      Margin W%
```

### Komponen P&amp;L

| Komponen | Sumber Data |
|---|---|
| **Revenue** | Total order yang `paymentStatus = paid` |
| **COGS** | Total `inventoryMovements.totalCost` type=`out` |
| **Gross Profit** | Revenue − COGS |
| **Operating Expenses** | Total dari modul Expenses |
| **Net Profit** | Gross Profit − OPEX |

### Stat Cards (Atas)

4 widget P&amp;L:

1. **Revenue (gradient hijau)** — pendapatan periode + jumlah order
2. **Gross Profit** — laba kotor + margin %
3. **Operating Expense (merah)** — total OPEX + jumlah kategori
4. **Net Profit/Loss (gradient biru atau merah)** — laba/rugi bersih

### Filter Periode

5 quick filter:
- **Hari Ini** — mulai 00:00 hari ini
- **7 Hari** — 7 hari terakhir
- **30 Hari** — 30 hari terakhir
- **Bulan Ini** — sejak tanggal 1 (default)
- **Semua** — sejak awal data

P&amp;L auto-fetch ulang saat ganti periode.

### Income Statement Card

Detail lengkap dengan format formal:

```
Revenue (Pendapatan)          Rp 12.500.000
(−) COGS                       (Rp 1.200.000)
─────────────────────────────────────────────
Gross Profit                   Rp 11.300.000   Margin 90.4%
(−) Operating Expenses         (Rp  4.800.000)
═════════════════════════════════════════════
Net Profit                     Rp  6.500.000   Margin 52.0%
```

### 4 Metric Tambahan

- **Order Lunas** — jumlah order yang sudah dibayar
- **AOV (Average Order Value)** — Revenue / jumlah order
- **COGS Ratio** — COGS / Revenue (semakin kecil, makin efisien bahan)
- **OPEX Ratio** — OPEX / Revenue (semakin kecil, makin efisien operasional)

### Charts

#### Omzet vs Profit (5 Bulan Terakhir)
Bar chart comparison

#### Distribusi Layanan
Donut chart per service

#### Expenses by Category
Progress bar berwarna per kategori, total di bawah

#### Revenue by Service (Top 5)
Ranked list layanan paling generate revenue

### Export PDF Income Statement

Klik **P&amp;L PDF** → browser print dialog.

PDF berisi:
- Header: judul, periode, generated date
- Stat cards (4 metric)
- Income Statement tabular
- Operating Expenses Breakdown table
- Revenue by Service table
- Footer: powered by LaundryHub

⚠️ **Penting**: Pilih "Save as PDF" di destination print dialog untuk simpan PDF.

### Export CSV/Excel

Klik **Excel/CSV** → download file CSV semua transaksi periode.

### Skenario Real Case

#### Akhir bulan analisis profit

```
1. Reports → filter "Bulan Ini"
2. Lihat Revenue: Rp 12.5jt
3. COGS: Rp 1.2jt (efisien)
4. OPEX: Rp 4.8jt
5. Net Profit: Rp 6.5jt (Margin 52%)
6. Verifikasi: bagus, target tercapai
7. Export PDF → kirim ke akuntan
```

#### Investigasi rugi tipis

```
Net Margin turun dari 50% → 30% bulan ini

1. Cek COGS Ratio: dari 10% → 15% (naik)
2. Cek breakdown inventory movements
3. Ternyata ada banyak waste detergent
4. Action: training staff hemat bahan

Atau:

1. Cek OPEX Ratio: dari 30% → 50% (naik!)
2. Cek breakdown Expenses by Category
3. Ternyata ada kategori "Maintenance" mendadak besar
4. Action: review service mesin lebih jarang
```

#### Banding cabang

```
1. Filter "Bulan Ini"
2. Lihat "Branch Performance" (Owner only)
3. Cabang Pusat: Rp 8jt revenue
4. Cabang Selatan: Rp 3.5jt
5. Investigate kenapa selisih besar
```

## Best Practice

### Disiplin Catat Expenses

🔵 **Tip**: Buat ritual harian / mingguan catat expense:
- Senin pagi: catat semua pengeluaran weekend
- Akhir bulan: gaji, sewa, listrik, internet
- Saat keluar uang: catat segera (1-2 menit)

### Validate dengan Bank

Setiap akhir minggu/bulan:
1. Print Reports CSV
2. Compare dengan mutasi rekening
3. Cek selisih
4. Catat yang missing

### Healthy P&amp;L Metrics

| Metric | Healthy Range |
|---|---|
| Gross Margin | &gt; 70% (kalau pakai bahan banyak: 60%+) |
| OPEX Ratio | 25-40% |
| Net Margin | &gt; 25% (target sehat 35-45%) |
| COGS Ratio | &lt; 15% |

### Red Flags

🚫 **Net Margin &lt; 10%** — bisnis kurang sehat, review pricing/cost  
🚫 **OPEX Ratio &gt; 50%** — cost berlebihan, perlu efisiensi  
🚫 **COGS Ratio &gt; 30%** — bahan boros, training staff  

## Integrasi dengan Modul Lain

```
ORDERS (paid)          →  Revenue di P&L
INVENTORY (stok keluar)→  COGS di P&L
EXPENSES               →  OPEX di P&L
                       ↓
                       NET PROFIT/LOSS
                       ↓
                  Reports → Export PDF
                       ↓
              Owner make decisions
```

## Selanjutnya

- [Inventory](./inventory.md) — track COGS via movements
- [Purchase Orders](./purchase-orders.md) — pembelian dengan unit cost
- [Reports → Old reports](./reports.md) — versi lama
