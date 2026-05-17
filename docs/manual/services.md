# Services &amp; Pricing

Atur layanan dan harga laundry.

## Akses

Menu: **Services**

## Kategori Layanan

3 kategori utama:

| Kategori   | Contoh                                | Pricing             |
| ---------- | ------------------------------------- | ------------------- |
| Reguler    | Cuci setrika, cuci kering, setrika    | Per kg              |
| Express    | Express cuci setrika (1 hari)         | Per kg + surcharge  |
| Spesial    | Sepatu, karpet, bed cover, boneka     | Per item / per pasang |

## Tipe Pricing

| Type           | Cocok untuk                      |
| -------------- | -------------------------------- |
| Per Kg         | Reguler kiloan                   |
| Per Item       | Bed cover, gorden, boneka        |
| Per Unit       | Sepatu (per pasang)              |
| Per m²         | Karpet                           |

## Tambah Layanan Baru

1. Klik **+ Layanan Baru**
2. Isi:
   - **Nama** — nama layanan (display ke customer)
   - **Kategori** — Reguler / Express / Spesial
   - **Tipe Pricing** — per kg / item / unit
   - **Harga** — nominal Rupiah
   - **Durasi (hari)** — estimasi waktu selesai
3. Klik **Simpan**

🔵 **Tip**: Beri nama yang jelas untuk customer, contoh "Cuci Setrika Reguler" lebih jelas daripada "CS-1".

## Edit / Hapus

Setiap card layanan punya icon edit (pojok kanan atas). Klik untuk edit harga, durasi, atau nama.

⚠️ **Penting**: Mengubah harga **tidak retroaktif** — order yang sudah dibuat tetap pakai harga lama.

## Promo Harga

Klik **Promo Harga** di action bar untuk:
- Diskon flat (Rp atau %)
- Buy 1 get 1
- Promo per cabang
- Promo waktu tertentu (jam, hari)
- Promo tier customer (gold/platinum dapat 5% off)

Fitur ini akan dirilis di Phase 3.

## Pricing per Cabang

Untuk multi-cabang dengan harga berbeda:

1. Settings → Cabang
2. Pilih cabang → Pricing Override
3. Override harga layanan tertentu untuk cabang itu

Contoh: cabang di mall punya harga 20% lebih mahal vs cabang lokal.

## Member Pricing

Tier Gold dan Platinum bisa dapat diskon otomatis di checkout. Atur di:

**Settings → Loyalty → Tier Discounts**

| Tier      | Discount default |
| --------- | ---------------- |
| Silver    | 0%               |
| Gold      | 5%               |
| Platinum  | 10%              |

## Best Practice

### Naming convention

```
[Layanan] [Tipe] [Optional: Speed]

Contoh:
- Cuci Setrika Reguler
- Cuci Setrika Express
- Sepatu Premium
- Karpet Persia
```

### Pricing strategy

- **Reguler** — competitive vs market lokal (survey kompetitor)
- **Express** — surcharge minimal 50% dari reguler (incentive untuk reguler)
- **Spesial** — premium pricing, fokus margin tinggi

### Durasi realistis

Set durasi yang **realistis** — under-promise, over-deliver:
- Reguler 3-4 hari → set 4 hari
- Express 1 hari → set 1 hari (sesuai promise)
- Spesial 5-7 hari → set 7 hari

Customer akan happy bila lebih cepat dari janji.

## Selanjutnya

- [Pembayaran](./payments.md)
- [Marketing](./marketing.md)
