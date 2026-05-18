# Reports &amp; Analytics

Laporan bisnis dan analitik laundry untuk decision making.

## Akses

Menu: **Reports** (hanya Owner)

⚠️ **Update v0.4.0**: Modul Reports sekarang menampilkan **Income Statement (P&amp;L)** lengkap. Untuk dokumentasi detail P&amp;L, lihat [Expenses &amp; Reports](./expenses-reports.md).

---

## Income Statement (P&amp;L) — Fitur Utama

Reports sekarang menampilkan laporan keuangan formal:

```
Revenue (Pendapatan)              Rp X
(−) COGS (Cost of Goods Sold)    (Rp Y)
═══════════════════════════════════════
Gross Profit                      Rp X-Y    Margin Z%
(−) Operating Expenses            (Rp W)
═══════════════════════════════════════
Net Profit / Net Loss             Rp Z      Margin W%
```

### Sumber Data

| Komponen | Sumber |
|---|---|
| Revenue | Orders dengan `paymentStatus = paid` |
| COGS | `inventory_movements` type=`out` (qty × unitCost) |
| OPEX | Modul [Expenses](./expenses-reports.md) |

### Filter Periode

5 quick filter: Hari Ini, 7 Hari, 30 Hari, Bulan Ini, Semua.

### Export

- **P&amp;L PDF** — formal income statement
- **CSV/Excel** — raw data untuk analisis lanjut

Detail lengkap di [Expenses &amp; Reports → Income Statement](./expenses-reports.md#modul-reports--income-statement-pl).

## Charts

### Omzet vs Profit (5 Bulan Terakhir)

Bar chart dengan 2 metric:
- **Omzet** (biru) — total revenue
- **Profit** (cyan) — estimated profit (revenue - cost)

Hover untuk detail nominal exact.

🔵 **Tip**: Bila gap omzet-profit menyempit, evaluasi cost (bahan, listrik, gaji).

### Distribusi Layanan

Donut chart dengan persentase per layanan. Legend di bawah.

💡 **Insight**: Layanan dengan share &gt; 30% adalah core business — jangan kompromi kualitas. Layanan &lt; 5% bisa dipertimbangkan untuk discontinue atau bundling.

## Top 5 Layanan

Ranking layanan terlaris:
- Position rank
- Nama
- Jumlah order
- Total revenue dari layanan itu

🔵 **Tip**: Layanan top 1 biasanya generate 40-60% revenue. Fokus marketing &amp; quality di sini.

## Heatmap Jam Tersibuk

Grid 24 jam (00:00 - 23:00) dengan intensitas warna:
- Gelap = sepi
- Terang = sibuk

Peak hour ditampilkan di bawah heatmap.

💡 **Use case**:
- Schedule staff: tambah staff di peak hour
- Marketing timing: promo terkirim 1-2 jam sebelum peak

## Laporan Lain (Coming Soon)

### Laporan Per Cabang

Reports → **Branch Report**

Comparison antar cabang:
- Revenue
- Order count
- AOV
- Top services
- Staff productivity

### Laporan Customer

Reports → **Customer Report**

- Segmentasi spending
- Retention rate
- Lifetime value
- Churn analysis

### Laporan Driver

Reports → **Driver Report**

- Task completed per driver
- Avg pickup-delivery time
- Customer rating
- Distance covered

### Laporan Layanan

Reports → **Service Report**

- Revenue per layanan
- Margin per layanan
- Frequency
- Cross-sell opportunities

### Laporan Profit

Reports → **Profit & Loss**

Detailed P&amp;L:
- Revenue (cash, QRIS, transfer, e-wallet)
- COGS (detergent, parfum, packaging)
- OPEX (gaji, sewa, listrik, internet)
- Net profit

## Analytics Insights

### Best Selling Service

Identifikasi auto by jumlah order &amp; revenue. Tampil di Reports → Top Services.

### Busiest Hour

Sudah ditampilkan via heatmap.

### Retention Customer

Reports → Customer Report → Retention

Cohort analysis:
- Customer yang join Bulan X masih order setelah berapa bulan?
- Cohort retention curve

### Repeat Order Rate

% customer dengan order count &gt; 1.

### Order Trend

Linear trend revenue &amp; volume — apakah growing, stagnant, atau declining?

## AI Predictions (Phase 3)

### Prediksi Omzet

Forecasting omzet 30 hari ke depan dengan ML model:
- Confidence interval
- Base + best/worst case
- Asumsi yang dipakai

### Prediksi Customer Inactive

List customer yang predict akan inactive 30 hari ke depan — bisa langsung blast retention campaign.

### Rekomendasi Promo

AI suggest promo terbaik berdasarkan:
- Performance promo lampau
- Segment dengan response rate tertinggi
- Timing optimal

### Peak Order Prediction

Prediksi peak hour besok / minggu depan untuk staffing.

## Reading the Numbers

### Healthy Metrics (Industry Benchmark)

| Metric              | Healthy Range            |
| ------------------- | ------------------------ |
| AOV                 | Rp 30K-50K (kiloan)      |
| Repeat Order Rate   | &gt; 60%                    |
| Open Rate WA        | &gt; 70%                    |
| Profit Margin       | 30-45%                   |
| Customer Retention  | &gt; 70% per bulan          |

### Red Flags

🚫 AOV menurun 3 bulan berturut → harga / mix layanan bermasalah  
🚫 Retention &lt; 50% → quality issue atau service problem  
🚫 Margin &lt; 25% → cost terlalu tinggi, revisit pricing  
🚫 Revenue stagnant 6 bulan → marketing perlu di-revamp

## Skenario

### Owner review mingguan

```
1. Reports → Filter: 7 Hari
2. Cek Omzet vs target (target Rp 20Jt/minggu)
3. Cek Top Services — apakah masih sama?
4. Cek heatmap — apakah staffing sudah aligned?
5. Bandingkan dengan minggu lalu
6. Identifikasi 1-2 action item
7. Discuss dengan team Senin pagi
```

### Cek performance promo

```
1. Marketing → Campaigns → pilih campaign
2. Cek metrics: open rate, conversion
3. Reports → Filter periode campaign
4. Bandingkan revenue selama campaign vs baseline
5. Hitung ROI: (additional revenue - campaign cost) / campaign cost
```

## Selanjutnya

- [Expenses &amp; Reports (P&amp;L)](./expenses-reports.md) — dokumentasi lengkap Income Statement
- [Settings](./settings.md)
- [Marketing](./marketing.md)
