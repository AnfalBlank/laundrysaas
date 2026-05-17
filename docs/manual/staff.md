# Staff Management

Kelola tim karyawan dengan role-based access control.

## Akses

Menu: **Staff** (hanya Owner)

## Role Stats (Atas Halaman)

4 widget jumlah staff per role:

- Owner — biasanya 1 orang
- Admin / Kasir — per cabang
- Staff Laundry — produksi
- Driver — pickup &amp; delivery

## Tambah Staff Baru

1. Klik **+ Tambah Staff**
2. Isi:
   - **Nama** lengkap
   - **Email** — untuk login (harus unik per tenant)
   - **No. HP**
   - **Role** — Owner / Admin / Staff / Driver
   - **Cabang** — assignment cabang
   - **Password** — minimal 8 karakter
3. Klik **Simpan**

Sistem otomatis kirim welcome email dengan kredensial.

## Hak Akses per Role

### Owner

✅ Semua menu  
✅ Semua cabang  
✅ Settings  
✅ Reports lengkap  
✅ Manage staff  
✅ Manage tenant settings  

### Admin / Kasir

✅ Orders (CRUD)  
✅ Customers (CRUD)  
✅ Payments (input)  
✅ Pickup &amp; Delivery (assign)  
✅ Reports (read-only, hanya cabangnya)  
✅ Print invoice  
❌ Settings  
❌ Staff management  
❌ Cross-branch reports  

### Staff Laundry

✅ Update order status (scan QR)  
✅ Lihat order yang assigned ke cabang  
✅ Inventory (stok keluar/masuk untuk cabangnya)  
❌ Tidak bisa input order baru  
❌ Tidak bisa lihat finansial  

### Driver

✅ Lihat task pickup &amp; delivery yang di-assign  
✅ Update status pickup/delivery  
✅ Upload bukti foto  
✅ Navigation (Google Maps)  
❌ Tidak bisa lihat data lain  

## Detail Staff Card

Setiap staff ditampilkan sebagai card dengan:
- Avatar 3D (warna sesuai role)
- Nama + status indicator (hijau = active)
- Badge role
- Cabang assignment
- Phone &amp; Email

## Edit Staff

Klik card staff → **Edit**:
- Update nama, email, phone
- Ganti role
- Pindah cabang
- Reset password (admin force-reset)
- Toggle active/inactive

## Deactivate vs Delete

| Action          | Effect                                              |
| --------------- | --------------------------------------------------- |
| **Deactivate**  | Login blocked, data tetap di system                 |
| **Delete**      | Hapus permanen (cascade ke order references)        |

⚠️ **Penting**: Selalu **deactivate** untuk staff resign. Jangan delete kecuali yakin tidak butuh history.

## Audit Log

Setiap aksi staff terekam di Audit Log:
- Login / logout
- Order CRUD
- Payment update
- Customer changes
- Settings changes

Akses: Settings → Audit Log (Owner only)

## Performance Tracking

### Per Admin / Kasir

Reports → Staff Report → Admin

Metrics:
- Order processed per hari
- Avg processing time
- Customer satisfaction (dari survey)
- Cash discrepancy

### Per Staff Laundry

Metrics:
- Order processed per hari
- Avg time per status
- Quality issue reported

### Per Driver

Metrics:
- Task completed
- Avg pickup time
- Avg delivery time
- Customer rating
- On-time rate

## Schedule / Shift Management

(Phase 3 feature)

Settings → Schedule:
- Set shift (pagi 07-14, siang 14-21)
- Assign staff ke shift
- Auto-generate timesheet
- Approve overtime

## Best Practice

### Onboarding Staff Baru

```
Day 1:
- Akun dibuat dengan role yang tepat
- Welcome email dengan kredensial
- Tour aplikasi via screen-share dengan admin senior
- Dummy task untuk practice

Day 2-3:
- Shadowing senior staff
- Test-run real task dengan supervisor

Day 7:
- Full ownership
- Performance check-in mingguan first month
```

### Password Policy

- Min 8 karakter
- Mix huruf besar, kecil, angka, simbol
- Force change setiap 90 hari (Settings → Security)
- 2FA enabled untuk Owner &amp; Admin

### Pindah Cabang

```
1. Buka detail staff
2. Edit → ganti Cabang
3. Save

Note: Order historis tetap link ke staff (tidak migrate cabang)
```

### Resign Process

```
1. Last day:
   - Backup checklist (handover)
   - Deactivate staff (jangan delete)
   - Force logout dari semua device
   - Reset password (preventive)

2. Audit:
   - Review audit log 30 hari terakhir
   - Identifikasi pending tasks
   - Reassign ke staff lain
```

## Skenario

### Staff salah pindah cabang

Edit staff → ganti cabang → save. Real-time effect.

### Staff lupa password

```
1. Staff → kontak admin
2. Admin → buka detail staff → Reset Password
3. Sistem generate password sementara
4. Send via email staff
5. Staff login → force change password
```

### Penambahan cabang baru

```
1. Settings → Cabang → + Tambah Cabang
2. Staff Management → buat staff baru untuk cabang
3. Atau pindahkan staff existing
4. Setup pricing override per cabang bila perlu
```

## Selanjutnya

- [Settings](./settings.md)
- [Reports](./reports.md)
