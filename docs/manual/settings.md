# Settings

Konfigurasi tenant, branding, integrasi, subscription, dan keamanan.

## Akses

Menu: **Settings** (hanya Owner)

Settings dibagi 8 tab:

## 1. Profil Bisnis

Informasi dasar bisnis:

| Field            | Keterangan                                       |
| ---------------- | ------------------------------------------------ |
| Nama Bisnis      | Display name di seluruh aplikasi & sidebar       |
| Subdomain        | URL akses (contoh: laundrysukses.laundryhub.id)  |
| Email            | Email kontak utama                               |
| No. WhatsApp     | Nomor utama untuk notifikasi customer            |
| Alamat Pusat     | Alamat kantor pusat                              |
| Jam Operasional  | Display di customer portal                       |
| Mata Uang        | Default IDR                                      |

Klik **Simpan Perubahan** setelah edit.

🔵 **Tip**: Nama bisnis yang disimpan di sini akan langsung ter-update di **sidebar** (tenant card) setelah save — tanpa perlu refresh manual.

## 2. Cabang (Branches Manager)

Manajemen multi-outlet via **Branches Manager** component.

### Tambah Cabang

1. Klik **+ Tambah Cabang Baru**
2. Isi:
   - Nama cabang
   - Alamat lengkap
   - Phone
3. Save

### Edit Cabang

1. Klik icon **Edit** di baris cabang
2. Update nama, alamat, phone
3. Save

### Hapus Cabang

Klik icon **Hapus** → konfirmasi.

⚠️ **Penting**: Hapus cabang akan **fail** bila masih ada order/pickup aktif. Cancel/transfer dulu.

## 3. Branding

Customize tampilan tenant:

### Warna Primer

Pilih dari 6 preset color atau custom:
- Biru (default)
- Cyan
- Hijau
- Ungu
- Pink
- Amber

Warna akan di-apply ke seluruh UI.

### Logo URL

Upload logo ke cloud storage, masukkan URL. Display di:
- Sidebar
- Login page
- Invoice / receipt
- WhatsApp messages
- Customer portal

### Custom Domain

Untuk plan Pro/Enterprise:

1. Settings → Branding → Custom Domain
2. Input domain (contoh: app.laundrysukses.com)
3. Update DNS:
   - Add CNAME: `app` → `laundryhub.id`
4. Wait propagation (~ 1 jam)
5. SSL auto-provision via Let's Encrypt

## 4. Integrasi

6 integrasi default:

| Integrasi          | Fungsi                              |
| ------------------ | ----------------------------------- |
| Fonnte (WhatsApp)  | WhatsApp gateway                    |
| Midtrans           | Payment gateway                     |
| Xendit             | Alternative payment                 |
| Google Maps        | Tracking driver, navigation         |
| Cloudflare R2      | Storage foto &amp; invoice              |
| OpenAI             | AI customer service &amp; content       |

### Setup Integrasi

1. Klik **Hubungkan** pada integrasi
2. Input API key / token sesuai instruksi
3. Test connection
4. Save

### Status Connection

Setiap integrasi punya badge:
- 🟢 **Terhubung** — aktif
- ⚪ **Belum** — perlu setup

## 5. Messaging

Konfigurasi channel messaging untuk notifikasi dan chat customer.

### Channel Switcher

Pilih channel aktif:

| Channel   | Provider | Setup                                    |
| --------- | -------- | ---------------------------------------- |
| WhatsApp  | Fonnte   | Nomor WA + API Token                     |
| Telegram  | Bot API  | Bot Token + Username                     |

Hanya 1 channel aktif pada satu waktu. Semua notifikasi dan auto-reply menggunakan channel yang dipilih.

### Konfigurasi WhatsApp

1. Input **Nomor WhatsApp** (format: 628xxx)
2. Input **Fonnte API Token**
3. Klik **Simpan**

### Konfigurasi Telegram

1. Input **Bot Token** (dari BotFather)
2. Input **Bot Username** (tanpa @)
3. Klik **Simpan**
4. Klik **Setup Webhook** untuk register webhook URL

### Webhook Status

Setelah setup, status webhook ditampilkan:
- ✅ **Webhook Active** — pesan masuk diteruskan ke LaundryHub
- ❌ **Webhook Inactive** — perlu setup ulang

Klik **Check Status** untuk verifikasi webhook masih aktif.

### Test Kirim

Klik **Test Kirim** untuk mengirim pesan test via channel aktif dan memverifikasi koneksi berfungsi.

## 6. Suppliers

Manajemen data supplier untuk Purchase Orders.

### Tambah Supplier

1. Klik **+ Tambah Supplier**
2. Isi:
   - Nama supplier (wajib)
   - Phone
   - Email
   - Alamat
   - Contact Person (PIC)
   - Catatan
3. Klik **Simpan**

### Edit Supplier

1. Klik icon **Edit** di baris supplier
2. Update data
3. Simpan

### Hapus / Non-aktifkan Supplier

- Toggle **Active/Inactive** untuk non-aktifkan tanpa hapus
- Supplier non-aktif tidak muncul di dropdown saat buat PO

🔵 **Tip**: Non-aktifkan supplier daripada hapus — agar history PO tetap terhubung.

## 7. Subscription

### Current Plan

Card gradient menampilkan paket aktif:
- Plan name
- Features
- Harga per bulan
- Tanggal expire

3 paket tersedia:

| Plan         | Harga         | Features                                              |
| ------------ | ------------- | ----------------------------------------------------- |
| Basic        | Rp 199K/bulan | 1 outlet, 3 user, order unlimited, WA basic           |
| **Pro**      | Rp 499K/bulan | Multi outlet, unlimited user, AI analytics, branding  |
| Enterprise   | Custom        | Dedicated server, custom feature, priority support    |

### Upgrade Plan

1. Klik **Upgrade Enterprise**
2. Form contact submitted ke sales
3. Sales hubungi dalam 24 jam
4. Setup migration

### Usage Stats

3 widget bandwidth:
- **Order Bulan Ini** — count
- **Storage Terpakai** — GB
- **Pesan WA Terkirim** — count

Bila mendekati limit, alert otomatis muncul.

### Billing History

Klik **Riwayat Tagihan** untuk lihat invoice bulanan + receipt.

### Cancel Subscription

Klik **Cancel Plan** di plan card. Effective di end of billing cycle. Data tetap accessible 30 hari, lalu archived.

## 8. Keamanan

4 toggle security options — **semua tersimpan di database** (tabel `tenant_security_settings`):

| Option                       | Recommended | Effect                                                |
| ---------------------------- | ----------- | ----------------------------------------------------- |
| Two-Factor Authentication    | ON          | Login butuh OTP via SMS/email                         |
| Audit Log                    | ON          | Log semua aktivitas user                              |
| IP Whitelist                 | OFF (default) | Batasi akses ke IP tertentu (B2B/internal)          |
| Session Timeout              | ON          | Auto logout setelah N menit idle (configurable)       |

🔵 **Baru**: Toggle keamanan sekarang **persist ke database**. Perubahan tersimpan real-time dan berlaku untuk semua user di tenant. Sebelumnya hanya UI state.

### Session Timeout

Bila diaktifkan:
- Default: 60 menit
- Bisa diubah via input field (menit)
- User otomatis logout setelah idle melebihi batas

### Password Policy

Settings → Security → Password Policy:
- Min length (default 8)
- Complexity rules
- Expiry (force change setiap N hari)
- Cannot reuse last N passwords

### Audit Log

Klik **View Audit Log** untuk lihat:
- Timestamp
- User
- Action
- IP address
- User agent
- Affected resource

Filter by user, date range, action type.

### IP Whitelist

Bila aktif, hanya IP terdaftar yang bisa login:

1. Toggle ON
2. Input IP whitelist (CIDR notation supported)
3. Save

⚠️ **Penting**: Pastikan IP Anda termasuk sebelum save, atau Anda akan terkunci out.

### Data Export

Settings → Security → **Export All Data**

Export semua data tenant ke ZIP berisi:
- JSON per tabel
- Foto attachments
- Audit logs

Compliance dengan UU PDP — customer bisa request data export.

### Data Deletion (GDPR)

Settings → Security → **Delete Tenant**

⚠️ **Penting**: 
- Permanent &amp; tidak bisa di-undo
- Cascade ke semua data: orders, customers, payments
- 30 hari grace period sebelum permanent delete
- Data dicadangkan ke archive 90 hari setelah delete

## Printer Setup

Settings → Printer (akan dirilis):

### Thermal Printer (Bluetooth)

1. Pasangkan printer ke device (Bluetooth pairing OS-level)
2. Settings → Printer → Detect
3. Pilih printer
4. Test print

### Thermal Printer (USB)

1. Plug USB
2. Browser permission untuk WebUSB
3. Settings → Printer → Detect
4. Test print

### Print Templates

Customize template invoice:
- Logo position
- Header text
- Footer text
- Item layout
- QR code position

## Backup &amp; Restore

Settings → Backup:

### Auto Backup

Enable auto backup harian. Backup tersimpan di:
- Cloudflare R2 (encrypted)
- Retention: 30 hari

### Manual Backup

Klik **Backup Now** untuk trigger backup manual. Email notification saat selesai.

### Restore

Restore dari backup point tertentu:

1. List available backups
2. Pilih timestamp
3. Klik **Restore**
4. Konfirmasi (overwrite current data)
5. Wait restoration (5-30 menit tergantung size)

⚠️ **Penting**: Restore overwrite current data. Always backup current state first.

## Selanjutnya

- [Manual Book Index](./README.md)
- [FAQ](./faq.md)
