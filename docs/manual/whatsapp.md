# Messaging Automation

Sistem multi-channel untuk customer service otomatis, notifikasi, dan broadcast marketing via **WhatsApp** atau **Telegram**.

## Akses

Menu: **WhatsApp** (nama menu tetap, tapi support multi-channel)

## Channel Aktif

LaundryHub mendukung 2 channel messaging:

| Channel   | Provider | Kelebihan                                    |
| --------- | -------- | -------------------------------------------- |
| WhatsApp  | Fonnte   | Paling populer di Indonesia, customer familiar |
| Telegram  | Bot API  | Gratis unlimited, webhook real-time, bot powerful |

Pilih channel aktif di **Settings → Messaging**. Hanya 1 channel aktif pada satu waktu.

---

## Status Koneksi (Atas Halaman)

Banner menampilkan status channel aktif:

- **Connected** (hijau) — bot aktif menerima dan kirim pesan
- **Disconnected** (merah) — perlu setup ulang

Klik **Test Kirim** untuk verifikasi koneksi ke channel aktif.

## Stats

4 widget:

| Widget                | Arti                                       |
| --------------------- | ------------------------------------------ |
| Pesan Hari Ini        | Total pesan terkirim hari ini              |
| Auto-Reply            | % pesan yang dijawab bot tanpa intervensi  |
| Order via Chat        | Order yang dibuat via WhatsApp/Telegram    |
| Open Rate             | % pesan dibaca oleh customer               |

---

## Setup Telegram Bot

### 1. Buat Bot di BotFather

1. Buka Telegram, cari **@BotFather**
2. Kirim `/newbot`
3. Ikuti instruksi: beri nama dan username bot
4. Salin **Bot Token** yang diberikan (format: `123456:ABC-DEF...`)

### 2. Konfigurasi di LaundryHub

1. Buka **Settings → Messaging**
2. Pilih channel: **Telegram**
3. Paste Bot Token
4. Input Bot Username (tanpa @)
5. Klik **Simpan**

### 3. Register Webhook

1. Di halaman Settings → Messaging, klik **Setup Webhook**
2. Sistem otomatis register webhook URL ke Telegram API
3. Status berubah ke ✅ **Webhook Active**

Setelah webhook aktif, semua pesan masuk ke bot akan diteruskan ke LaundryHub secara real-time.

### 4. Verifikasi

Klik **Test Kirim** di halaman WhatsApp/Telegram. Bila berhasil, bot akan mengirim pesan test ke nomor/chat yang dikonfigurasi.

---

## Setup WhatsApp (Fonnte)

### 1. Daftar Fonnte

1. Buka [fonnte.com](https://fonnte.com)
2. Daftar akun
3. Scan QR code dengan WhatsApp di HP
4. Salin API Token dari dashboard Fonnte

### 2. Konfigurasi di LaundryHub

1. Buka **Settings → Messaging**
2. Pilih channel: **WhatsApp**
3. Input nomor WhatsApp (format: 628xxx)
4. Paste Fonnte API Token
5. Klik **Simpan**

### 3. Verifikasi

Klik **Test Kirim** untuk verifikasi koneksi.

---

## Auto-Reply Commands (Telegram)

Bot Telegram merespons otomatis perintah berikut:

| Command / Keyword | Respons Bot                                          |
| ----------------- | ---------------------------------------------------- |
| `/start`          | Pesan selamat datang + daftar layanan                |
| `harga`           | Daftar harga semua layanan aktif                     |
| `pickup`          | Instruksi cara request pickup                        |
| `status`          | Cek status order (minta nomor invoice)               |
| `jam buka`        | Jam operasional dari settings tenant                 |
| `admin`           | Handoff ke admin (notif masuk ke dashboard)          |

🔵 **Tip**: Customer cukup ketik keyword tanpa slash. Bot mengenali kata kunci secara case-insensitive.

---

## Auto-Create Order dari Chat

Customer bisa membuat order langsung dari chat dengan mengirim informasi lengkap:

### Flow

1. Customer kirim pesan berisi: **alamat** + **jam pickup** + **berat/layanan**
2. Bot extract data: alamat, waktu, estimasi berat
3. Bot konfirmasi:
   > "Saya catat: 5kg cuci setrika, pickup besok jam 16:00 di Jl. Sudirman 12. Total estimasi Rp 35.000. Lanjut?"
4. Customer balas "Ya" / "Ok" / "Lanjut"
5. Order otomatis dibuat di sistem dengan status `WAITING_PICKUP`
6. Bot kirim konfirmasi + nomor invoice

### Contoh Percakapan

```
Customer: Mau cuci 5 kg, pickup besok jam 4 sore di Jl. Sudirman 12
Bot:      Saya catat:
          • Layanan: Cuci Setrika
          • Berat: 5 kg
          • Pickup: Besok 16:00
          • Alamat: Jl. Sudirman 12
          • Estimasi: Rp 35.000
          Lanjut buat order?
Customer: Ya
Bot:      ✅ Order dibuat! Invoice: INV-20260519-008
          Driver akan menghubungi Anda sebelum pickup.
```

---

## Real Chat Inbox

Panel kiri menampilkan **list percakapan real** dari database:

- Avatar dengan inisial nama
- Nama customer + channel (WA/TG icon)
- Preview pesan terakhir
- Timestamp
- Badge unread count
- Icon 🤖 bila pesan terakhir dari bot

### Fitur Inbox

- **Persistent**: Semua pesan tersimpan di tabel `messages`
- **Real conversations**: Bukan dummy — data dari DB
- **Direction indicator**: Pesan masuk (customer) vs keluar (admin/bot)
- **Read status**: Pesan yang sudah dibaca ditandai

## Chat Thread (Panel Kanan)

Klik conversation di inbox untuk buka thread:

- Header: nama customer + channel badge
- Bubble messages (style WhatsApp/Telegram)
- Timestamp per pesan
- Indikator bot (🤖) vs admin (👤)
- Input box untuk reply

### Reply dari Admin

1. Klik conversation di inbox
2. Ketik pesan di input box bawah
3. Klik **Kirim** atau Enter
4. Pesan terkirim via channel aktif (WhatsApp/Telegram)
5. Pesan tersimpan di database

---

## Template Notifikasi Otomatis

6 template default yang bisa diaktifkan/non-aktifkan via toggle:

| Template                  | Trigger                                    |
| ------------------------- | ------------------------------------------ |
| Order Diterima            | Order baru dibuat                          |
| Pickup Driver             | Driver mulai perjalanan pickup             |
| Laundry Selesai           | Status order ke READY_DELIVERY             |
| Reminder Belum Diambil    | 3 hari setelah READY_DELIVERY tidak diambil|
| Promo Broadcast           | Manual blast                               |
| Invoice Customer          | Setelah pembayaran lunas                   |

### Edit Template

1. Klik card template
2. Edit body pesan dengan placeholder:
   - `{customer}` — nama customer
   - `{invoice}` — nomor invoice
   - `{driver}` — nama driver
   - `{estimated}` — tanggal estimasi
3. Preview rendering
4. Klik **Simpan**

### Toggle Aktif/Non-aktif

Klik toggle di card template untuk enable/disable. Template non-aktif tidak akan terkirim meskipun trigger terpenuhi.

🔵 **Tip**: Pesan yang efektif: pendek (max 3 kalimat), gunakan nama customer, sertakan call-to-action jelas.

---

## Broadcast Campaign

Lihat [Marketing → Campaign](./marketing.md).

Campaign sekarang tersimpan di database (tabel `campaigns`) dengan tracking:
- Recipient count
- Delivered count
- Read count
- Conversion count

---

## Best Practice

### Tone

- Friendly tapi profesional
- Pakai bahasa Indonesia santai (Kak, Bos, dll)
- Hindari spam emoji berlebihan
- Singkat dan to the point

### Frekuensi Broadcast

- Maksimal 1-2 broadcast per minggu
- Hindari hari Minggu pagi
- Best timing: Senin-Kamis 19:00-21:00

### Compliance

- Selalu ada opsi unsubscribe
- Jangan blast ke nomor non-customer (anti-spam)
- Hormati DND list

---

## Troubleshooting

| Masalah                          | Solusi                                          |
| -------------------------------- | ----------------------------------------------- |
| WhatsApp disconnected            | Re-scan QR di Fonnte dashboard                  |
| Telegram webhook tidak aktif     | Settings → Messaging → klik Setup Webhook ulang |
| Pesan tidak terkirim (WA)        | Cek saldo Fonnte, cek nomor blacklist           |
| Pesan tidak terkirim (TG)        | Cek bot token valid, customer harus /start dulu |
| Bot tidak respond                | Cek webhook status di Settings → Messaging      |
| Customer tidak terima notif      | Cek nomor (WA: format 628...) atau chat ID (TG) |
| Auto-create order gagal          | Pastikan pesan mengandung alamat + jam + berat   |

---

## Selanjutnya

- [Marketing](./marketing.md) — campaign & segmentasi
- [Settings → Messaging](./settings.md#7-messaging)
- [Customer Portal](./customer-portal.md)
