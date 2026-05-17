# FAQ &amp; Troubleshooting

Pertanyaan umum dan solusi cepat.

## Akun &amp; Login

### Saya lupa password

1. Klik **Lupa?** di halaman login
2. Input email
3. Cek inbox (atau spam) untuk reset link
4. Click link, set password baru

### Email reset tidak masuk

- Cek folder spam/promotions
- Pastikan email terdaftar correct (kontak admin)
- Tunggu 5 menit, retry

### Tidak bisa login walau password benar

Kemungkinan:
- Akun deactivated → kontak admin
- IP tidak masuk whitelist (bila aktif)
- 2FA token salah

### Login dari device baru perlu OTP

Bila 2FA aktif, login dari IP/device baru memerlukan OTP yang dikirim ke nomor terdaftar. Cek WhatsApp.

## Order

### Salah input order, bagaimana?

- Status &lt; WASHING: edit langsung dari order detail
- Status ≥ WASHING: hubungi staff produksi sebelum edit

### Customer minta cancel setelah order dibuat

```
1. Order detail → ⋯ More → Cancel
2. Pilih reason
3. Bila sudah bayar: pilih refund method
4. Save
```

### Bisa hapus order?

Order tidak bisa di-delete (untuk integrity laporan). Yang bisa: **Cancel**.

### Invoice number duplicate

Sistem auto-generate unique number. Bila lihat duplicate, kemungkinan import error — kontak support.

### Customer datang tanpa invoice

1. Search by nama atau nomor HP di Orders
2. Filter status: Selesai
3. Verifikasi dengan KTP atau OTP yang dikirim WA

## Pembayaran

### QRIS tidak bisa di-scan customer

- Pastikan koneksi internet bagus
- Generate ulang QR (klik Refresh QR)
- Bila persisten: cek Midtrans/Xendit dashboard

### Customer transfer tapi tidak masuk

- Bila pakai VA: tunggu 5-10 menit (delay normal)
- Bila manual transfer: customer kirim bukti, admin verify manual
- Cek mutasi rekening

### Refund processing time

| Method        | Time                      |
| ------------- | ------------------------- |
| Cash          | Instant (kembalikan tunai) |
| Transfer      | 1-3 hari kerja            |
| QRIS          | 1-7 hari (depends bank)   |
| E-Wallet      | Instant - 24 jam          |

### Salah input nominal pembayaran

Bisa edit pembayaran (Owner only):
1. Order detail → Riwayat Pembayaran
2. Klik pembayaran → Edit
3. Input nominal benar
4. Audit log akan track perubahan

## Customer

### Customer mengeluh barang hilang

```
1. Customer detail → Tab Notes → catat keluhan
2. Order detail → tab Komplain
3. Investigasi: cek QR scan log, foto pickup, foto delivery
4. Bila ada bukti barang masuk tapi tidak keluar:
   - Refund + kompensasi
   - Update SOP staff
```

### Bagaimana hadle customer marah?

```
1. Tetap calm, dengarkan
2. Buka detail order untuk verifikasi
3. Bila salah kami: minta maaf, offer refund/kompensasi
4. Bila salah customer: jelaskan dengan bukti (foto, log)
5. Document di customer notes
```

### Customer minta hapus data (privacy)

```
1. Customer detail → Tab Settings → Anonymize
2. Nama dan kontak diganti placeholder
3. Order historis tetap tersimpan untuk laporan
4. Send konfirmasi email ke customer
```

## Pickup &amp; Delivery

### Driver tidak online

- Cek status driver di halaman Pickup
- Hubungi via WhatsApp/telepon
- Bila tetap tidak ada: re-assign ke driver lain

### Customer tidak ada di tempat

```
1. Driver tap "Customer not at location"
2. Auto-call customer
3. Bila diangkat: tunggu max 15 menit
4. Bila tidak: schedule ulang
5. Bila tetap tidak ada (3x): cancel order
```

### Alamat customer salah / tidak ditemukan

- Driver tap "Wrong address" → minta customer share location
- Update alamat di customer detail

## WhatsApp

### Pesan tidak terkirim

| Cause                     | Solusi                                   |
| ------------------------- | ---------------------------------------- |
| Saldo Fonnte habis        | Top-up Fonnte                            |
| Nomor format salah        | Pastikan format `628xxx` bukan `08xxx`   |
| WhatsApp disconnect       | Re-scan QR                               |
| Customer block bisnis     | Contact via call atau email             |

### AI bot salah jawab

```
1. WhatsApp → buka percakapan
2. Take over chat (admin reply manual)
3. Edit AI knowledge base di Settings → AI
4. Add new training example
5. Test: chat ulang, validate jawaban benar
```

### Customer reply tidak muncul

- Refresh halaman WhatsApp
- Cek webhook configuration di Fonnte dashboard
- Pastikan webhook URL aktif: `https://[domain]/api/whatsapp/webhook`

## Inventory

### Stok di system tidak match dengan fisik

```
1. Stock Take → input physical count
2. Sistem hitung selisih
3. Investigasi: theft? untracked usage? data entry error?
4. Approve adjustment dengan reason
5. Update SOP untuk prevent recurrence
```

### Auto-deduction terlalu banyak

```
1. Settings → Inventory → Auto-Deduction
2. Edit rasio yang berlebihan
3. Test dengan 1 order, validate stok kurang sesuai expected
```

## Reports

### Angka di Dashboard tidak match dengan Reports

- Dashboard: realtime, hari ini
- Reports: bisa filter periode, bisa lebih lambat ter-update

Untuk reconciliation, gunakan Reports dengan filter "Hari Ini".

### Export PDF gagal

- Cek koneksi internet
- Try export Excel sebagai alternatif
- Bila persistent: kontak support

### Profit margin tidak sesuai expectation

Profit di Reports adalah **estimated** (revenue - 58% cost). Untuk profit real:
- Reports → P&amp;L → input cost actual
- System recalculate dengan data riil

## Settings

### Tidak bisa hapus cabang

Cabang dengan order/pickup aktif tidak bisa di-delete. Solution:
1. Move semua active orders ke cabang lain
2. Cancel pickup yang masih scheduled
3. Hapus cabang

### Custom domain tidak active setelah setup

- Wait DNS propagation (sampai 24 jam)
- Cek DNS: `nslookup [domain]`
- Pastikan CNAME → `laundryhub.id`

### Backup tidak jalan

- Cek storage Cloudflare R2 (mungkin penuh)
- Cek API key R2 di Settings → Integrasi
- Manual backup untuk verify

## Performance

### Aplikasi lambat

- Cek koneksi internet (`speedtest.net`)
- Hard refresh: Ctrl/Cmd + Shift + R
- Logout-login
- Try browser lain (Chrome recommended)
- Bila persisten: kontak support

### Browser tidak supported

Recommended:
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

IE / Opera Mini tidak supported.

### Aplikasi crash di tablet murah

- Hindari run banyak tab bersamaan
- Pastikan RAM &gt; 2GB free
- Update browser ke versi terbaru
- Bila tetap crash: kontak support untuk lite mode

## Security

### Akun di-hack?

```
1. Logout semua session: Settings → Security → Force Logout All
2. Reset password
3. Enable 2FA bila belum
4. Cek audit log untuk activity mencurigakan
5. Notify customer bila ada data breach
6. Kontak support
```

### Lupa 2FA token

- Recovery code (yang di-save saat setup 2FA)
- Bila tidak ada: verify identity ke admin (KTP, video call)
- Reset 2FA via support

## Kontak Support

| Channel        | Hours              | Use Case                        |
| -------------- | ------------------ | ------------------------------- |
| WhatsApp       | 24/7               | Urgent issues                   |
| Email          | Senin-Jumat 9-17   | Non-urgent, bug reports         |
| In-app chat    | Senin-Jumat 9-21   | General questions               |
| Phone          | Pro plan only      | Critical issues                 |

WhatsApp Support: `+62 812-xxxx-xxxx`  
Email: `support@laundryhub.id`

## Selanjutnya

- [Manual Book Index](./README.md)
- [Technical Docs](../technical/README.md)
