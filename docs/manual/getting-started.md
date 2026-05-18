# Memulai

Panduan login pertama dan orientasi navigasi.

## Akses Platform

LaundryHub diakses via web browser. Buka alamat:

```
https://[nama-bisnis-anda].laundryhub.id
```

Atau pakai custom domain bila sudah disetup, contoh:

```
https://app.laundrysukses.com
```

## Login

1. Buka URL platform
2. Masukkan **email** dan **password** yang dikirim admin
3. Centang "Ingat saya selama 30 hari" bila ingin tetap login di device tersebut
4. Klik **Masuk Sekarang**

🔵 **Tip**: Gunakan password kuat minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.

⚠️ **Penting**: Jangan share kredensial dengan staff lain — buatkan akun terpisah untuk setiap karyawan.

## Switch User (Demo Mode)

Untuk testing fitur per role tanpa logout:

1. Klik **avatar profile** di pojok kanan atas
2. Pilih **Switch User (Demo)**
3. Modal muncul dengan list semua user aktif + badge role
4. Klik user yang mau dicoba
5. Halaman reload — sidebar &amp; dashboard berubah sesuai role

Demo seed sudah include 5 user:
- **Budi Santoso** — Owner
- **Siti Rahayu** — Admin / Kasir
- **Ahmad Fauzi** — Staff Laundry
- **Dewi Lestari** — Staff Laundry
- **Pak Anto** — Driver

⚠️ **Note**: Fitur Switch User hanya untuk demo/testing. Production version akan pakai authentication real.

## Login Pertama: Setup Awal

Setelah login pertama, lakukan setup berikut secara berurutan:

### 1. Lengkapi Profil Bisnis

Menu: **Settings → Profil Bisnis**

Isi:
- Nama bisnis
- Email kontak
- No. WhatsApp utama
- Alamat pusat
- Jam operasional
- Logo (URL)

### 2. Tambah Cabang

Menu: **Settings → Cabang**

Klik **+ Tambah Cabang Baru**, isi nama, alamat, dan nomor HP cabang.

### 3. Setup Layanan &amp; Harga

Menu: **Services**

Klik **+ Layanan Baru** untuk setiap layanan yang ditawarkan:
- Reguler (cuci setrika, cuci kering, setrika)
- Express (1 hari selesai)
- Spesial (sepatu, karpet, bed cover)

### 4. Tambah Staff

Menu: **Staff**

Buat akun untuk:
- Admin / Kasir per cabang
- Staff laundry per cabang
- Driver

Setiap staff dapat email dan password untuk login.

### 5. Hubungkan WhatsApp

Menu: **WhatsApp** atau **Settings → Integrasi**

Pilih provider:
- **Fonnte** (recommended, paling stabil di Indonesia)
- **WAHA**
- **Evolution API**

Scan QR atau masukkan API key sesuai provider.

### 6. Setup Payment Gateway

Menu: **Settings → Integrasi**

Hubungkan ke Midtrans / Xendit / Duitku untuk auto-rekonsiliasi pembayaran QRIS dan e-wallet.

## Topbar (Bar Atas)

| Element              | Fungsi                                          |
| -------------------- | ----------------------------------------------- |
| Tombol menu (☰)      | Buka sidebar di mobile                          |
| Search bar           | Cari order, customer, atau invoice cepat        |
| Icon Pesan           | Quick view inbox WhatsApp                       |
| Icon Lonceng         | Notifikasi sistem                               |
| Avatar profile       | Akses profil dan logout                         |

## Sidebar (Menu Kiri)

Sidebar dapat di-collapse di mobile (klik tombol menu di topbar). Di desktop, sidebar selalu tampil.

### Tenant Card

Di bagian atas sidebar terlihat:
- **Nama bisnis** (auto-update saat diubah di Settings)
- Jumlah cabang aktif
- **Badge role** user yang sedang login (Owner / Admin / Staff / Driver)
- Nama cabang (untuk non-Owner)

### Plan Card

Di bagian bawah sidebar muncul info paket aktif (hanya tampil untuk **Owner**). Klik **Upgrade** untuk berpindah paket.

### Menu Berdasarkan Role

Sidebar otomatis filter menu sesuai role:
- **Owner**: 14 menu (semua)
- **Admin**: 11 menu (tanpa Settings, Reports, Expenses, Staff)
- **Staff**: 4 menu (Dashboard, Orders, Inventory, Notifications)
- **Driver**: 4 menu (Dashboard, Pickup, Orders, Notifications)

Detail di [Multi-Role &amp; Permissions](./roles.md).

## Main Content

Area utama menampilkan halaman yang dipilih. Setiap halaman punya:
- **Title bar** — judul halaman dan subtitle
- **Action bar** — tombol aksi utama (tambah, export, filter)
- **Content** — data tabel, grid, atau visualisasi

## Logout

Klik avatar profile di topbar → pilih **Logout**.

⚠️ **Penting**: Selalu logout dari device publik untuk keamanan akun.

## Navigasi Cepat

| Keyboard shortcut    | Aksi                                |
| -------------------- | ----------------------------------- |
| `/`                  | Fokus ke search bar                 |
| `Esc`                | Tutup modal / dropdown              |
| `Cmd/Ctrl + K`       | Quick command palette (coming soon) |

## Selanjutnya

- [Multi-Role &amp; Permissions](./roles.md) — panduan per role
- [Dashboard](./dashboard.md) — pelajari widget &amp; metrics per role
- [Orders](./orders.md) — buat order pertama
