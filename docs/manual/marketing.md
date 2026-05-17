# Marketing

Kelola campaign WhatsApp blast, segmentasi customer, dan AI promo generator.

## Akses

Menu: **Marketing**

## AI Promo Generator (Hero Card)

Card gradient di atas — fitur unggulan untuk auto-generate konten marketing:

1. Klik **Buat Promo Sekarang**
2. Pilih jenis output:
   - WhatsApp template
   - Caption Instagram
   - Caption Facebook
   - Email subject + body
3. Input brief:
   - Topic (diskon, launching cabang baru, dll)
   - Tone (formal/santai/lucu)
   - Keywords yang harus ada
4. Klik **Generate**
5. AI hasilkan 3-5 variasi
6. Pilih yang disukai → langsung pakai

## Stats

4 widget overview:

| Widget          | Arti                                          |
| --------------- | --------------------------------------------- |
| Campaign Aktif  | Campaign yang sedang scheduled atau berjalan  |
| Reach Bulan Ini | Total customer yang menerima campaign         |
| Open Rate       | % pesan yang dibaca                           |
| Conversion      | % yang melakukan order setelah campaign       |

## Segmentasi Customer

4 segment default (panel kiri):

| Segment              | Definisi                                       |
| -------------------- | ---------------------------------------------- |
| **VIP Platinum**     | Tier Platinum (top spenders)                   |
| **New Customer**     | Join &lt; 30 hari, &lt; 5 order                      |
| **Repeat Order ≥ 5** | Customer loyal aktif                           |
| **Inactive 30 hari** | Belum order &gt; 30 hari (perlu retensi)          |

Klik segment → langsung ke create campaign dengan filter pre-populated.

### Custom Segment

Buat segment custom:

1. Klik **+ Segment Baru**
2. Filter rules:
   - Tier (Silver/Gold/Platinum)
   - Total spending range
   - Last order range
   - Branch
   - Service preference
3. Save

## Campaign Terbaru

Panel kanan list campaign dengan info:
- Nama
- Status (Sent / Scheduled / Draft)
- Tanggal
- Metrics (sent / dibaca / konversi)

## Buat Campaign Baru

1. Klik **+ Campaign Baru**
2. Setup:

### Step 1: Audience

- Pilih segment (atau custom filter)
- Lihat preview jumlah recipient

### Step 2: Content

- Pilih template atau tulis manual
- Pakai AI Generator bila perlu
- Insert placeholder: `{customer}`, `{branch}`, `{discount_code}`
- Preview rendering

### Step 3: Channel

- WhatsApp (default)
- Email (bila customer punya email)
- SMS (rarely used, mahal)

### Step 4: Schedule

- **Send Now** — kirim langsung
- **Schedule** — tanggal &amp; jam tertentu
- **Recurring** — repeat daily/weekly/monthly

### Step 5: Review &amp; Send

- Preview pesan final
- Confirm jumlah recipient + estimasi biaya
- Klik **Send / Schedule**

## A/B Testing

Test 2 versi pesan untuk segment yang sama:

1. Buat campaign normal
2. Toggle **A/B Test**
3. Tulis Version A &amp; B
4. Pilih split (default 50/50)
5. Sistem auto-pilih winner setelah 24 jam

## Promo Code

Generate kode promo untuk track effectiveness:

1. Marketing → Promo Codes → **+ Promo Code Baru**
2. Setup:
   - Code (manual atau auto-generate)
   - Discount type: % atau fix amount
   - Min spending (optional)
   - Max usage per customer
   - Total max usage
   - Valid period
3. Insert ke campaign: `{discount_code}` placeholder

## Best Practice

### Segment Strategi

| Segment              | Strategi                                       |
| -------------------- | ---------------------------------------------- |
| VIP Platinum         | Exclusive offer, early access, free express    |
| New Customer         | Welcome bonus, education content               |
| Repeat ≥ 5           | Loyalty reward, referral incentive             |
| Inactive             | Win-back offer (diskon agresif)                |

### Timing

| Hari       | Jam Optimal       | Cocok untuk         |
| ---------- | ----------------- | ------------------- |
| Senin      | 09:00-11:00       | Promo weekly        |
| Rabu       | 19:00-21:00       | Mid-week reminder   |
| Jumat      | 16:00-18:00       | Weekend prep        |
| Sabtu      | 10:00-12:00       | High engagement     |

🚫 **Hindari**: Senin pagi (kerja), Sabtu malam, Minggu siang (keluarga).

### Frekuensi

- Max 1-2 broadcast per minggu per customer
- Personal messages (auto-reply, status notif) tidak dihitung
- Selalu sediakan opsi opt-out

## Compliance

- Customer harus opt-in untuk receive marketing
- Sediakan tombol unsubscribe
- Patuhi UU PDP Indonesia
- Log semua persetujuan

## Skenario

### Win-back Inactive Customer

```
Segment: Inactive 30 hari (142 orang)
Pesan: "Halo Kak {customer}, kangen kami? Pakai kode WELCOME20
       untuk diskon 20% untuk laundry pertama bulan ini!"
Promo code: WELCOME20 (20% off, valid 7 hari)

Hasil tracking:
- Sent: 142
- Read: 116 (82%)
- Convert: 28 order (24%)
- ROI: positif
```

### Launch Cabang Baru

```
Segment: All customer di radius 5km dari cabang baru
Pesan: "Cabang baru kami buka di {address}! Diskon 30% untuk
       order pertama di cabang ini. Kode: GRANDOPEN30"
Schedule: H-3 sebelum opening, H-1, H opening
```

## Selanjutnya

- [WhatsApp Automation](./whatsapp.md)
- [Customer Management](./customers.md)
