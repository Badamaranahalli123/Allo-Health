# Allo Health - Inventory Reservation System

## 🚀 Live Demo
[https://allohealth-one.vercel.app](https://allohealth-one.vercel.app)

## 📦 GitHub Repository
[https://github.com/Badamaranahalli123/Allo-Health](https://github.com/Badamaranahalli123/Allo-Health)

---

## 📋 Project Overview

This project solves the **race condition problem** in e-commerce checkout where multiple customers try to purchase the last unit of a product simultaneously.

**The Problem:**
- When payment takes several minutes (3DS flows, UPI confirmations), thousands of shoppers may see the same product page
- Decrementing stock at payment time → two customers can pay for the same unit
- Decrementing stock at add-to-cart → 80% of abandoned carts deplete inventory

**The Solution:** 
Temporary reservations that hold stock for 10 minutes. If payment succeeds → confirm and permanently deduct. If payment fails or timer expires → release stock back to inventory.

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes (serverless functions) |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Deployment** | Vercel |

---

## 🗄️ Database Schema

```prisma
model Product {
  id           String        @id @default(cuid())
  name         String
  sku          String        @unique
  Stocks       Stock[]
  Reservations Reservation[]
}

model Warehouse {
  id           String        @id @default(cuid())
  name         String
  location     String
  Stocks       Stock[]
  Reservations Reservation[]
}

model Stock {
  id          String   @id @default(cuid())
  productId   String
  warehouseId String
  total       Int      @default(0)    // Total physical units
  reserved    Int      @default(0)    // Currently reserved units
  product     Product   @relation(...)
  warehouse   Warehouse @relation(...)

  @@unique([productId, warehouseId])
}

model Reservation {
  id          String   @id @default(cuid())
  productId   String
  warehouseId String
  quantity    Int
  status      Status   @default(pending)  // pending, confirmed, released
  expiresAt   DateTime                     // 10 minutes from creation
  createdAt   DateTime @default(now())
}

enum Status {
  pending
  confirmed
  released
}
