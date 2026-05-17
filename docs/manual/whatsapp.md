# WhatsApp Automation

Sistem AI-powered untuk customer service otomatis dan broadcast marketing via WhatsApp.

## Akses

Menu: **WhatsApp**

## Status Koneksi (Atas Halaman)

Banner menampilkan status WhatsApp Business:

- **Connected** (hijau) — bot aktif menerima dan kirim pesan
- **Disconnected** (merah) — perlu reconnect

Klik **Test Kirim** untuk verifikasi koneksi.

## Stats

4 widget:

| Widget                | Arti                                       |
| --------------------- | ------------------------------------------ |
| Pesan Hari Ini        | Total pesan terkirim hari ini              |
| Auto-Reply            | % pesan yang dijawab AI tanpa intervensi   |
| Order via WA          | Order yang dibuat via WhatsApp             |
| Open Rate             | % pesan dibaca oleh customer               |

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

🔵 **Tip**: Pesan yang efektif: pendek (max 3 kalimat), gunakan nama customer, sertakan call-to-action jelas.

### Generate AI

Klik tombol **Generate AI** untuk minta AI buat template baru. AI akan generate sesuai context laundry dengan tone friendly.

## Inbox Customer

Panel kiri menampilkan list percakapan masuk:
- Avatar dengan inisial nama
- Nama customer + nomor HP
- Preview pesan terakhir
- Timestamp
- Badge unread count
- Icon Bot bila pesan dari AI

## Chat Preview

Panel kanan menampilkan thread percakapan aktif dengan:
- Header: nama customer + status online
- Bubble messages style WhatsApp
- Timestamp + read receipt (✓✓)
- Bot indicator untuk pesan AI

### AI Saran Balasan

Di atas input box muncul saran balasan AI:

> 💡 *"Terima kasih Kak. Driver kami akan tiba dalam 15 menit. Mohon dipersiapkan laundrynya ya."*

Klik **Kirim** untuk send langsung, **Edit** untuk modifikasi, atau **Regenerate** untuk minta saran baru.

## Provider WhatsApp

Pilih salah satu di Settings → Integrations:

### Fonnte (Recommended)

- Termurah, paling stabil di Indonesia
- Setup: scan QR code dengan WhatsApp di HP
- API key dari dashboard Fonnte
- Pricing: ~Rp 100K/bulan untuk basic

### WAHA

- Self-hosted (gratis tapi perlu server)
- Setup lebih kompleks
- Cocok untuk volume sangat tinggi (&gt; 10K msg/hari)

### Evolution API

- Mirip WAHA, self-hosted
- Open source

## Broadcast Campaign

Lihat [Marketing → Campaign](./marketing.md).

## AI Customer Service

### Capabilities

AI bot bisa menjawab otomatis:

- Cek harga layanan
- Cek status order (via invoice number)
- Estimasi selesai
- Jam operasional
- Alamat cabang
- FAQ umum

### Auto Create Order

Customer chat:
> "Mau cuci 5 kg, pickup besok jam 4 sore di Jl. Sudirman 12"

AI extract data:
- Layanan: cuci setrika
- Berat: 5 kg
- Pickup: ya, besok 16:00
- Alamat: Jl. Sudirman 12

AI konfirmasi:
> "Saya catat: 5kg cuci setrika, pickup besok jam 16:00 di Jl. Sudirman 12. Total Rp 35.000. Lanjut ya?"

Customer balas "Ya" → order otomatis dibuat.

### Handoff ke Admin

AI tahu kapan harus handoff:
- Customer minta bicara dengan manusia
- AI tidak yakin (confidence &lt; 70%)
- Topic kompleks (komplain, refund)

Bila handoff, admin dapat notif untuk take over chat.

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

## Troubleshooting

| Masalah                          | Solusi                                          |
| -------------------------------- | ----------------------------------------------- |
| Disconnected status              | Re-scan QR di Settings → Integrations           |
| Pesan tidak terkirim             | Cek saldo Fonnte, cek nomor blacklist           |
| AI tidak respond                 | Cek OpenAI API key &amp; quota                     |
| Customer tidak terima notif      | Cek nomor (format 628..., bukan 08...)          |

## Selanjutnya

- [Marketing](./marketing.md) — campaign &amp; segmentasi
- [Customer Portal](./customer-portal.md)
