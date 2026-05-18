# Staff Management

Kelola tim karyawan dengan **Role-Based Access Control (RBAC)**.

## Akses

Menu: **Staff** (hanya Owner)

⚠️ Lihat [Multi-Role &amp; Permissions](./roles.md) untuk detail dashboard &amp; menu setiap role.

## Role Stats (Atas Halaman)

4 widget jumlah staff per role:

- **Owner** — biasanya 1 orang (super-admin)
- **Admin / Kasir** — operator harian per cabang
- **Staff Laundry** — petugas produksi
- **Driver** — pickup &amp; delivery

## Tambah Staff Baru

1. Klik **+ Tambah Staff**
2. Isi:
   - **Nama** lengkap
   - **Email** — untuk login (harus unik per tenant)
   - **No. HP**
   - **Role** — Owner / Admin / Staff Laundry / Driver
   - **Cabang** — assignment cabang
   - **Password** — minimal 8 karakter
3. Klik **Simpan**

⚠️ **Penting**: Saat staff dengan role `driver` dibuat, sistem otomatis create entry di tabel `drivers` sehingga driver bisa di-assign ke pickup/delivery task.

## Test Switch User (Demo)

Untuk testing fitur per role tanpa logout:

1. Klik avatar profile di pojok kanan atas
2. Klik **Switch User (Demo)**
3. Pilih user dengan role yang mau dicoba
4. Sistem reload — sidebar &amp; dashboard ikut berubah sesuai role

🔵 **Tip**: Demo seed sudah include 5 user dengan role berbeda (1 Owner, 1 Admin, 2 Staff, 1 Driver). Switch antar mereka untuk lihat perbedaan UI.

## Hak Akses per Role (Ringkasan)

### 👑 Owner — 14 menu

✅ Semua menu termasuk **Settings, Reports (P&amp;L), Expenses, Staff, Purchase Orders**  
✅ Akses semua cabang  
✅ Manage staff &amp; tenant config  

### 👔 Admin / Kasir — 11 menu

✅ Orders, Customers, Payments, Pickup, Services, Inventory, Purchase Orders, WhatsApp, Marketing  
❌ **Tidak ada Settings, Reports, Expenses, Staff** (no financial detail)  

### 🧺 Staff Laundry — 4 menu

✅ Dashboard (Production Board kanban), Orders (read + update status), Inventory (stok keluar/masuk), Notifications  
❌ Tidak bisa input order baru, tidak lihat finansial  

### 🛵 Driver — 4 menu

✅ Dashboard (Task List filter by name), Pickup, Orders (read), Notifications  
❌ Hanya lihat task yang di-assign ke driver tersebut  

Detail lengkap di [Multi-Role &amp; Permissions](./roles.md).

## Detail Staff Card

Setiap staff ditampilkan sebagai card dengan:
- Avatar 3D (warna sesuai role)
- Nama + status indicator (hijau = active, abu = inactive)
- **Badge role** (color-coded)
- Cabang assignment
- Phone &amp; Email

## Edit Staff

Klik card staff → **Edit**:
- Update nama, email, phone
- **Ganti role** — efektif setelah staff login ulang
- Pindah cabang
- Reset password (admin force-reset)
- Toggle active/inactive

## Deactivate vs Delete

| Action          | Effect                                              |
| --------------- | --------------------------------------------------- |
| **Deactivate**  | Login blocked, data tetap di system, history aman   |
| **Delete**      | Hapus permanen (cascade — bisa break referensi)     |

⚠️ **Penting**: Selalu **deactivate** untuk staff resign. Jangan delete kecuali yakin tidak butuh history.

## Audit Log (Planned)

Setiap aksi staff terekam di Audit Log:
- Login / logout
- Order CRUD
- Payment update
- Customer changes
- Settings changes

Akses: Settings → Audit Log (Owner only).

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
- Order processed per hari (count Production Board flow-through)
- Avg time per status (RECEIVED → PACKING)
- Quality issue reported

### Per Driver

Metrics:
- Task completed per hari
- Avg pickup time
- Avg delivery time
- Customer rating
- On-time rate

## Schedule / Shift Management (Planned)

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
- Login pertama, force change password
- Dummy task untuk practice

Day 2-3:
- Shadowing senior staff
- Test-run real task dengan supervisor
- Belajar SOP per role

Day 7:
- Full ownership
- Performance check-in mingguan first month
```

### Password Policy

- Min 8 karakter
- Mix huruf besar, kecil, angka, simbol
- Force change setiap 90 hari (Settings → Security)
- 2FA enabled untuk Owner &amp; Admin (planned)

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
2. Owner buka Staff → detail staff → Reset Password
3. Sistem generate password sementara
4. Send via email/SMS staff
5. Staff login → force change password
```

### Penambahan cabang baru

```
1. Settings → Cabang → + Tambah Cabang
2. Staff Management → buat staff baru untuk cabang
3. Atau pindahkan staff existing
4. Setup pricing override per cabang bila perlu
```

### Promote Staff Laundry → Admin

```
1. Edit staff
2. Ganti Role: staff → admin
3. Save
4. Staff logout/login
5. Sidebar otomatis update (4 menu → 11 menu)
```

## Selanjutnya

- [Multi-Role &amp; Permissions](./roles.md) — detail per role
- [Settings](./settings.md)
- [Reports](./expenses-reports.md)
