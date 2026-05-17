# Dashboard Owner

Halaman utama untuk monitoring bisnis laundry secara realtime.

## Akses

Menu: **Dashboard** (default landing page setelah login)

## Layout Dashboard

Dashboard terdiri dari 3 baris utama:

### Baris 1: Stat Cards (4 widget)

| Widget              | Arti                                              |
| ------------------- | ------------------------------------------------- |
| Omzet Hari Ini      | Total revenue dari order yang dibuat hari ini     |
| Order Hari Ini      | Jumlah order baru hari ini                        |
| Laundry Aktif       | Order dengan status non-COMPLETED &amp; non-CANCELLED |
| Pickup Pending      | Order WAITING_PICKUP yang perlu di-assign driver  |

Setiap widget menunjukkan:
- Nilai utama
- Persentase perubahan vs periode sebelumnya
- Indikator naik/turun (hijau/merah)

🔵 **Tip**: Klik angka untuk drill-down ke list detail.

### Baris 2: Charts

#### Tren Omzet 7 Hari (kiri, 2/3 lebar)

Area chart yang menampilkan omzet harian selama 7 hari terakhir. X-axis: hari (Sen-Min), Y-axis: nominal omzet (otomatis di-format ke "M"/"K").

Hover pada chart untuk melihat nominal exact per hari.

#### Layanan Terpopuler (kanan, 1/3 lebar)

Donut chart distribusi layanan berdasarkan jumlah order minggu ini. Di bawah chart ada legend dengan persentase per layanan.

💡 **Contoh insight**: Bila Cuci Setrika 60% dan Express 5%, pertimbangkan promo express untuk meningkatkan rata-rata transaksi.

### Baris 3: Order &amp; Aksi Cepat

#### Order Terbaru (kiri, 2/3 lebar)

List 6 order terbaru dengan info:
- Nama customer
- Invoice number
- Layanan + berat
- Total
- Status badge

Klik **Lihat semua** untuk masuk ke halaman Orders.

#### Quick Actions (kanan atas)

6 tombol shortcut:
- **Order Baru** — input order cepat
- **Pickup** — jadwal pickup baru
- **Broadcast** — kirim WhatsApp blast
- **Scan QR** — update status via QR
- **Invoice** — cetak invoice thermal
- **AI Assist** — generate saran promo

#### Performa Cabang (kanan bawah)

Progress bar tiap cabang dengan:
- Total omzet bulan ini
- Jumlah order
- Persentase terhadap cabang terbaik

🔵 **Tip**: Cabang dengan progress bar lebih panjang berarti omzet tertinggi.

## Refresh Data

Dashboard auto-refresh saat halaman dimuat. Untuk refresh manual, reload browser (F5 atau Cmd/Ctrl+R).

## Use Case Skenario

### Pagi hari (08:00)

1. Buka dashboard
2. Cek **Pickup Pending** — apakah ada yang perlu di-assign?
3. Cek **Laundry Aktif** vs kapasitas — perlu tambah staff?

### Siang (13:00)

1. Cek **Omzet Hari Ini** — apakah sudah mencapai target?
2. Lihat **Tren Omzet 7 Hari** — tren naik atau turun?

### Sore (17:00)

1. Cek **Performa Cabang** — cabang mana yang underperform?
2. Lihat **Quick Actions → Broadcast** untuk kirim promo malam.

### Akhir hari (21:00)

1. **Order Terbaru** — pastikan semua sudah update status
2. Catat insight ke menu **Reports** untuk perbandingan harian.

## Tampilan Mobile

Di mobile/tablet:
- Stat cards: 2 kolom
- Charts: stacked vertikal
- Order list: card view (bukan tabel)

## Tidak Muncul Data?

| Masalah                          | Penyebab                                  |
| -------------------------------- | ----------------------------------------- |
| Semua angka 0                    | Belum ada order hari ini                  |
| Chart kosong                     | Belum ada data 7 hari terakhir            |
| Performa cabang tidak tampil     | Belum buat cabang di Settings → Cabang    |

⚠️ **Penting**: Dashboard hanya menampilkan data dalam tenant yang sedang aktif. Tidak ada data lintas tenant.

## Selanjutnya

- [Orders](./orders.md) — kelola transaksi
- [Reports](./reports.md) — analisis lebih dalam
