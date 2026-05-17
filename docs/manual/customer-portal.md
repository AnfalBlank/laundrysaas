# Customer Portal

Portal publik untuk customer tracking laundry tanpa login.

## URL Public

```
https://[bisnis].laundryhub.id/track/[invoice]
```

Contoh:
```
https://laundrysukses.laundryhub.id/track/INV-20240517-001
```

## Cara Akses

Customer dapat akses via:

1. **Link di WhatsApp notification** — sistem auto-include link saat kirim notif
2. **QR code di invoice cetak** — scan untuk buka langsung
3. **Manual** — customer copy-paste invoice number ke URL

🔵 **Tip**: Saran ke customer untuk simpan link pertama, sehingga bisa cek progress kapan saja.

## Halaman Tracking

### Hero Status

Top of page menampilkan status saat ini:
- Icon 3D washing machine yang animated
- Status besar: "Sedang dicuci", "Siap Diantar", dll
- Sapaan personal: "Halo {nama}"
- Estimasi selesai dengan tanggal/jam exact
- Invoice number untuk reference

### Timeline Proses

Visualisasi 6 step utama:

| Step                 | Icon                  |
| -------------------- | --------------------- |
| Order Diterima       | Receipt               |
| Pickup Driver        | Truck                 |
| Sedang Dicuci        | Washing Machine       |
| Dikeringkan          | Sparkles              |
| Disetrika &amp; Dikemas  | Hanger                |
| Siap Diantar         | Truck                 |

Setiap step:
- **Done** — colored, dengan ✓ checkmark
- **Active** — colored + pulse animation + "Aktif" badge
- **Pending** — grayscale + opacity 40%

### Detail Order

Grid info:
- Layanan
- Berat (bila per kg)
- Total harga
- Pickup type
- Cabang
- Status pembayaran (Lunas / Belum)
- Pickup address (bila applicable)

### CTA WhatsApp

Banner hijau di bawah dengan tombol **Chat** — link langsung ke WhatsApp bisnis untuk customer service.

## Yang Customer Bisa Lakukan

✅ **Lihat status realtime** — update otomatis  
✅ **Copy invoice number** untuk reference  
✅ **Chat admin** via tombol WhatsApp  
✅ **Bookmark** untuk akses cepat  

❌ Tidak bisa edit order  
❌ Tidak bisa cancel order  
❌ Tidak bisa lihat order lain  

## Realtime Update

Status update otomatis tanpa refresh:
- Saat staff scan QR di produksi
- Saat driver tap status perubahan
- Saat admin manual update

Customer cukup buka link, status terkini ditampilkan.

## Mobile-First

Portal di-design mobile-first karena 80%+ customer akses via HP. Fitur:
- Responsive layout
- Large touch targets
- Optimized for slow 3G/4G network
- Lightweight (no login, no auth)

## Notifikasi WhatsApp Otomatis

Setiap perubahan status, customer otomatis dapat WA:

| Status Change            | Pesan                                          |
| ------------------------ | ---------------------------------------------- |
| → RECEIVED               | "Order Anda telah kami terima"                 |
| → WASHING                | "Laundry Anda sedang dicuci"                   |
| → READY_DELIVERY         | "Laundry siap diambil/diantar"                 |
| → DELIVERING             | "Driver sedang menuju lokasi Anda"             |
| → COMPLETED              | "Terima kasih, order selesai. Rate kami?"      |

Setiap WA include link ke Customer Portal untuk lihat detail.

## Reminder Otomatis

Bila status READY_DELIVERY tapi belum diambil:
- Hari 1: Reminder soft
- Hari 3: Reminder + offer "antarkan saja"
- Hari 7: Final notice
- Hari 14: Auto-archive (claim expired, hubungi admin)

## QR Code di Invoice

Setiap invoice cetak (thermal) include QR code yang link ke portal. Customer scan dengan kamera HP untuk akses cepat.

## Customer Tidak Bisa Akses?

| Masalah                      | Solusi                                       |
| ---------------------------- | -------------------------------------------- |
| "Halaman tidak ditemukan"    | Cek invoice number, mungkin typo             |
| "Order belum terdaftar"      | Order baru saja dibuat, tunggu 1 menit       |
| Loading lambat               | Cek koneksi internet customer                |

## Internationalization (Phase 3)

Portal akan support multi-bahasa:
- Bahasa Indonesia (default)
- English
- Mandarin (untuk audience tertentu)

Auto-detect dari browser language, atau manual switcher.

## Branding

Portal otomatis pakai branding tenant:
- Logo
- Warna primer
- Nama bisnis

Settings → Branding untuk customize.

## Selanjutnya

- [WhatsApp Automation](./whatsapp.md)
- [Customer Management](./customers.md)
