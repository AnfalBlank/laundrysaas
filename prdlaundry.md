# PRD — Laundry ERP SaaS with WhatsApp Automation

## Product Name

LaundryHub


---

# 1. Overview

LaundryHub adalah platform ERP Laundry berbasis SaaS yang membantu bisnis laundry mengelola:

* order laundry
* pickup & delivery
* customer management
* pembayaran
* WhatsApp automation
* tracking realtime
* laporan bisnis
* multi cabang

Sistem dirancang untuk kebutuhan laundry modern di Indonesia yang mayoritas customer melakukan order melalui WhatsApp.

Target utama platform adalah:

* laundry kiloan
* laundry premium
* laundry sepatu
* laundry karpet
* laundry hotel
* laundry multi outlet

---

# 2. Objectives

## Tujuan Bisnis

* Mempermudah operasional laundry
* Mengurangi pencatatan manual
* Mengotomatisasi komunikasi customer
* Mempercepat proses pickup & delivery
* Menyediakan laporan bisnis realtime
* Menjadi platform SaaS laundry modern di Indonesia

## Tujuan User

### Owner

* melihat omzet realtime
* memantau operasional
* memantau cabang
* memantau performa staff

### Admin

* mengelola order lebih cepat
* meminimalisir human error
* mengelola customer dengan mudah

### Customer

* order lebih praktis via WhatsApp
* tracking status realtime
* mendapatkan notifikasi otomatis

---

# 3. User Roles

## Owner

Hak akses penuh.

Fitur:

* dashboard bisnis
* laporan
* manajemen user
* pengaturan sistem
* analitik
* multi cabang

## Admin / Kasir

Fitur:

* input order
* update status
* pembayaran
* print invoice
* customer management

## Staff Laundry

Fitur:

* update progress laundry
* scan QR order
* update status proses

## Driver Pickup

Fitur:

* melihat pickup task
* update pickup status
* navigasi alamat
* update delivery status

## Customer

Fitur:

* tracking order
* melihat invoice
* melihat histori transaksi
* menerima notifikasi WhatsApp

---

# 4. Core Features

# 4.1 Dashboard Owner

## Deskripsi

Dashboard utama untuk owner memonitor seluruh bisnis.

## Fitur

* total order hari ini
* omzet harian
* omzet bulanan
* total customer
* laundry aktif
* laundry selesai
* pending pickup
* grafik omzet
* grafik order
* cabang terbaik
* customer terbanyak

## Widget Dashboard

* Revenue Today
* Orders Today
* Active Laundry
* Completed Orders
* Pending Delivery
* Staff Activity
* Driver Activity

---

# 4.2 Order Management

## Deskripsi

Modul utama untuk mengelola transaksi laundry.

## Input Data

* nama customer
* nomor HP
* alamat
* jenis layanan
* berat laundry
* item tambahan
* parfum
* express/reguler
* catatan khusus
* pickup/delivery

## Jenis Layanan

* cuci kering
* cuci setrika
* setrika saja
* express
* sepatu
* karpet
* bed cover
* boneka
* custom item

## Output

* invoice
* QR code
* barcode
* status tracking
* estimasi selesai

## Fitur Tambahan

* edit order
* cancel order
* duplicate order
* print thermal invoice
* upload foto laundry

---

# 4.3 Laundry Status Tracking

## Deskripsi

Tracking proses laundry realtime.

## Status Order

* WAITING_PICKUP
* PICKUP_PROCESS
* RECEIVED
* WASHING
* DRYING
* IRONING
* PACKING
* READY_DELIVERY
* DELIVERING
* COMPLETED
* CANCELLED

## Fitur

* realtime update
* scan QR untuk update status
* timeline progress
* estimasi selesai

---

# 4.4 WhatsApp Automation

## Deskripsi

Sistem otomatisasi WhatsApp untuk customer service dan notifikasi.

## Flow

Customer chat WhatsApp → sistem membuat order → admin konfirmasi → notifikasi otomatis.

## Fitur

* auto reply
* auto create order
* auto reminder
* status notification
* invoice notification
* pickup reminder
* promo broadcast
* abandoned order reminder

## Template Notification

### Order Diterima

"Order laundry Anda telah diterima"

### Pickup Driver

"Driver sedang menuju lokasi pickup"

### Laundry Selesai

"Laundry Anda sudah selesai"

### Reminder Belum Diambil

"Laundry Anda belum diambil selama 3 hari"

## Integrasi

* Fonnte
* WAHA
* Evolution API

---

# 4.5 Pickup & Delivery Management

## Deskripsi

Mengelola proses penjemputan dan pengantaran laundry.

## Fitur

* assign driver
* jadwal pickup
* tracking driver
* status pickup
* status delivery
* route management
* bukti foto delivery

## Driver App Features

* daftar pickup
* daftar delivery
* update status
* maps integration
* upload proof image

---

# 4.6 Customer Management

## Deskripsi

Mengelola data customer.

## Fitur

* histori transaksi
* total spending
* member point
* customer notes
* blacklist customer
* customer category
* customer retention tracking

## Segmentasi

* VIP
* Regular
* New Customer
* Inactive Customer

---

# 4.7 POS & Payment

## Fitur

* cash
* transfer
* QRIS
* e-wallet
* split payment
* DP payment
* hutang/piutang
* payment history

## Integrasi Payment

* Midtrans
* Xendit
* Duitku

## Printer Support

* thermal bluetooth
* USB printer

---

# 4.8 Pricing Management

## Deskripsi

Mengelola harga laundry.

## Tipe Harga

* per kg
* per item
* express surcharge
* custom pricing

## Fitur

* promo harga
* harga per cabang
* dynamic pricing
* member pricing

---

# 4.9 Reports & Analytics

## Laporan

* omzet harian
* omzet bulanan
* laporan cabang
* laporan customer
* laporan driver
* laporan layanan
* laporan transaksi
* laporan profit

## Analitik

* best selling service
* busiest hour
* retention customer
* repeat order
* order trend

## Export

* PDF
* Excel
* CSV

---

# 4.10 Multi Branch Management

## Deskripsi

Mendukung banyak cabang laundry.

## Fitur

* dashboard pusat
* laporan per cabang
* transfer order antar cabang
* manajemen staff cabang
* inventory cabang

---

# 4.11 QR Code System

## Deskripsi

Setiap order memiliki QR unik.

## Fungsi

* tracking order
* update status
* scan invoice
* pickup validation
* delivery validation

---

# 4.12 Customer Portal

## Deskripsi

Portal customer untuk tracking laundry.

## Fitur

* tracking order
* invoice
* histori order
* status realtime
* pembayaran online
* pickup request

## Public Tracking URL

[https://laundryos.com/track/INV-0001](https://laundryos.com/track/INV-0001)

---

# 4.13 Membership & Loyalty

## Fitur

* point reward
* cashback
* member level
* subscription package
* referral code

## Membership Tier

* Silver
* Gold
* Platinum

---

# 4.14 Inventory Management

## Deskripsi

Mengelola stok operasional laundry.

## Inventory

* detergent
* parfum
* plastik
* hanger
* chemical

## Fitur

* stock in/out
* minimum stock alert
* purchase history
* supplier management

---

# 4.15 AI Features

## AI Customer Service

Bot menjawab:

* harga
* status laundry
* estimasi selesai
* jam operasional

## AI Analytics

* prediksi omzet
* prediksi customer inactive
* rekomendasi promo
* peak order prediction

## AI Marketing

* generate caption promo
* generate broadcast WhatsApp
* generate social media content

---

# 5. SaaS Architecture

## Multi Tenant

Setiap laundry memiliki:

* database terisolasi
* subdomain sendiri
* branding sendiri
* user management sendiri

## Contoh

* laundry-a.laundryos.com
* laundry-b.laundryos.com

## Custom Domain

* laundrysukses.com
* washhouse.id

---

# 6. Technical Architecture

# Frontend

* Next.js
* Tailwind CSS
* Shadcn UI
* TypeScript

# Backend

* Nest.js
* Prisma ORM
* PostgreSQL
* Redis

# Mobile

* PWA
* React Native (future)

# Infrastructure

* Docker
* NGINX
* Ubuntu VPS
* Coolify / Dokploy

# Storage

* S3 Compatible Storage
* Cloudflare R2

# Realtime

* Socket.io

# Authentication

* JWT
* Refresh Token
* RBAC

---

# 7. Database Schema

# users

* id
* name
* email
* password
* role
* branch_id

# customers

* id
* name
* phone
* address
* notes
* member_level

# orders

* id
* invoice_number
* customer_id
* branch_id
* status
* subtotal
* total
* payment_status
* pickup_type
* created_at

# order_items

* id
* order_id
* service_id
* qty
* weight
* price
* total

# services

* id
* name
* category
* pricing_type
* price

# payments

* id
* order_id
* amount
* payment_method
* payment_status

# drivers

* id
* name
* phone
* vehicle_type

# pickups

* id
* order_id
* driver_id
* pickup_time
* status

# inventory

* id
* item_name
* stock
* minimum_stock

---

# 8. UI/UX Guidelines

## Design Style

* modern
* minimal
* fast
* mobile-first
* dashboard clean

## Warna

* primary: biru
* secondary: putih
* accent: cyan

## UX Goals

* input order maksimal 30 detik
* mudah digunakan kasir
* mudah digunakan owner
* realtime update

---

# 9. Security

## Security Features

* role-based access
* encrypted password
* activity logs
* audit trail
* rate limiting
* backup otomatis
* session management

---

# 10. Notifications

## Notification Channels

* WhatsApp
* email
* push notification
* in-app notification

---

# 11. Subscription Plan

# Basic

* 1 outlet
* 3 user
* order unlimited
* WA notification basic

# Pro

* multi outlet
* unlimited user
* AI analytics
* custom branding
* advanced reports

# Enterprise

* dedicated server
* custom feature
* priority support
* API integration

---

# 12. API Integration

## Integrasi

* WhatsApp API
* Payment Gateway
* Google Maps
* Firebase Notification
* OCR Service

---

# 13. Development Roadmap

# Phase 1 — MVP

Durasi: 1–2 bulan

Fitur:

* login
* dashboard
* order management
* customer management
* pembayaran
* tracking status
* WhatsApp notification

# Phase 2

Durasi: 1 bulan

Fitur:

* pickup delivery
* QR code
* customer portal
* laporan advanced

# Phase 3

Durasi: 1–2 bulan

Fitur:

* multi cabang
* AI analytics
* loyalty system
* inventory

# Phase 4

Durasi: 2 bulan

Fitur:

* mobile apps
* SaaS automation
* white label
* AI customer service

---

# 14. Non Functional Requirements

## Performance

* response < 300ms
* realtime update
* scalable architecture

## Availability

* uptime 99.9%

## Scalability

* support ribuan order per hari
* support multi tenant

## Backup

* auto backup harian
* database replication

---

# 15. Admin Dashboard Menu Structure

* Dashboard
* Orders
* Pickup & Delivery
* Customers
* Services
* Payments
* Reports
* Inventory
* Staff
* WhatsApp Automation
* Marketing
* Settings

---

# 16. Customer Journey

## Pickup Flow

Customer chat WhatsApp
↓
System create pickup request
↓
Admin confirm
↓
Driver pickup
↓
Laundry process
↓
Customer receive update
↓
Laundry delivered
↓
Customer payment

---

# 17. Competitive Advantage

## Keunggulan Produk

* WhatsApp-first system
* AI automation
* modern UI
* realtime tracking
* SaaS ready
* multi outlet
* pickup management
* customer retention tools

---

# 18. Future Features

* AI voice assistant
* smart weighing integration
* IoT washing machine integration
* route optimization AI
* customer mobile app
* franchise management
* accounting integration
* payroll management

---

# 19. Suggested VPS Infrastructure

## Minimum MVP

* 4 vCPU
* 8 GB RAM
* 80 GB SSD
* Ubuntu 24.04

## Production SaaS

* 8–16 vCPU
* 16–32 GB RAM
* PostgreSQL Dedicated
* Redis Dedicated
* CDN Cloudflare

---

# 20. Recommended Deployment Stack

* Docker
* Dokploy / Coolify
* PostgreSQL
* Redis
* NGINX
* PM2
* Cloudflare

---

# 21. Conclusion

LaundryOS dirancang sebagai platform Laundry ERP modern berbasis WhatsApp automation yang dapat berkembang menjadi SaaS nasional.

Fokus utama platform:

* operasional laundry
* pickup delivery
* customer experience
* automation
* analytics
* scalability

Platform diharapkan menjadi solusi digital laundry modern yang mudah digunakan namun powerful untuk bisnis skala kecil hingga enterprise.
