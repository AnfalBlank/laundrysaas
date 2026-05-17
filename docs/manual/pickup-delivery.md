# Pickup &amp; Delivery

Manajemen jemput dan antar laundry dengan tracking driver realtime.

## Akses

Menu: **Pickup &amp; Delivery**

## Quick Stats (Atas Halaman)

4 widget metrics:
- **Pickup Hari Ini** — pickup terjadwal hari ini
- **Delivery Hari Ini** — delivery terjadwal
- **Driver Aktif** — `aktif / total` driver
- **Rata² Waktu** — waktu rata-rata pickup-delivery cycle

## Layout

Halaman terbagi 2 area:

### Tugas Hari Ini (kiri, 2/3 lebar)

List task pickup dan delivery aktif dengan info:
- Type badge (PICKUP / DELIVERY)
- Nama customer + invoice
- Alamat lengkap
- Driver yang di-assign
- Jam terjadwal
- Status badge (Terjadwal / Berlangsung / Selesai)

### Status Driver (kanan, 1/3 lebar)

List semua driver dengan:
- Nama + status indicator (hijau = active, kuning = ongoing, abu = offline)
- Jumlah task aktif
- No. HP (klik icon telepon untuk call)

## Buat Pickup Baru

1. Klik **+ Buat Pickup**
2. Pilih order yang ada (atau buat order baru)
3. Pilih driver (dropdown active drivers)
4. Set jadwal pickup (tanggal &amp; jam)
5. Klik **Simpan**

Sistem otomatis:
- Update status order ke `WAITING_PICKUP`
- Kirim notifikasi WA ke customer ("Driver akan jemput jam ...")
- Push notif ke aplikasi driver
- Set timer reminder

## Workflow Pickup

```
1. Admin buat pickup task
   ↓
2. Driver terima notif (status: scheduled)
   ↓
3. Driver tap "Mulai Perjalanan" (status: ongoing)
   ↓
4. Driver tap "Sudah Sampai" + foto
   ↓
5. Driver tap "Selesai" (status: completed)
   ↓
6. Order otomatis update ke RECEIVED
```

## Workflow Delivery

```
1. Order status auto-trigger READY_DELIVERY
   ↓
2. Admin assign driver delivery
   ↓
3. Driver tap "Mulai Antar" (status: ongoing)
   ↓
4. Driver tap "Sampai di tujuan" + foto bukti
   ↓
5. Customer tanda tangan / foto serah-terima
   ↓
6. Driver tap "Selesai" (status: completed)
   ↓
7. Order auto-update ke COMPLETED
```

## Track Driver Realtime

Klik tombol **Track** di task untuk lihat:
- Posisi driver di peta (Google Maps)
- ETA (estimated time of arrival)
- Riwayat tap status

🔵 **Tip**: Customer juga bisa lihat tracking via [Customer Portal](./customer-portal.md).

## Assign Driver

### Auto-assign (recommended)

Sistem otomatis pilih driver berdasarkan:
- Jarak terdekat dari pickup point
- Jumlah task aktif (load balancing)
- Status active

### Manual

1. Buat pickup task tanpa pilih driver
2. Setelah dibuat, klik **Assign Driver**
3. Pilih dari list driver yang tersedia

## Status Driver

| Status                              | Arti                                    |
| ----------------------------------- | --------------------------------------- |
| 🟢 Active                            | Online dan siap menerima task           |
| 🟡 Ongoing                           | Sedang dalam perjalanan task            |
| ⚪ Offline                           | Tidak online (clock-out atau no signal) |

Driver atur sendiri status active/offline via aplikasi.

## Bukti Foto Delivery

Setiap delivery wajib upload foto:
- Foto serah-terima ke customer (untuk dispute resolution)
- Foto kondisi laundry sebelum diserahkan

Foto disimpan di Cloudflare R2 dan accessible di order detail.

## Skenario

### Customer pesan pickup via WhatsApp

```
1. Customer kirim pesan "Mau pickup hari ini"
2. AI bot bertanya alamat dan jam
3. Customer balas
4. AI bot konfirmasi dan create order otomatis
5. Admin lihat di Pickup → tinggal assign driver
```

### Driver tidak bisa berangkat

```
1. Driver tap "Cancel Task" + alasan
2. Sistem auto-reassign ke driver lain
3. Notif baru ke customer dengan info driver baru
```

### Customer tidak ada di tempat saat driver datang

```
1. Driver tap "Customer not at location"
2. Auto-call customer
3. Bila tidak diangkat: reschedule ke jam lain
4. Bila tetap tidak ada: cancel + report ke admin
```

## Tampilan Mobile

Di mobile, layout stack vertikal:
- Stats di atas
- Task list di tengah
- Driver list di bawah

## Selanjutnya

- [Customer Management](./customers.md)
- [WhatsApp Automation](./whatsapp.md)
