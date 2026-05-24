# StockFlow - Inventory Reservation System

StockFlow is a modern inventory and order-fulfillment platform designed to solve the race condition problem during checkout. When customers proceed to checkout, StockFlow temporarily holds units for a short window (10 minutes), preventing overselling while maintaining high conversion rates.

## Background
The classic problem:
- **Decrement at payment time**: Two customers can pay for the same physical unit
- **Decrement at add-to-cart**: Inventory looks depleted even though 80% of carts are abandoned
- **Solution**: Temporary reservations - hold units during checkout, confirm on payment success, release on failure or timeout

## Tech Stack
- **Next.js 15** - App Router
- **TypeScript** - End-to-end type safety
- **Prisma ORM** - Database access and modeling
- **PostgreSQL** - Database (hosted via Neon/Supabase/Railway)
- **Tailwind CSS** - Styling with shadcn/ui components
- **Lucide React** - Icons
- **Zod** - Validation

## Features

### Data Models
- **Products**: Product information with name, SKU, description, and image
- **Warehouses**: Multiple warehouse locations
- **Stock**: Inventory levels per product per warehouse (total and reserved units)
- **Reservations**: Temporary holds with status (PENDING/CONFIRMED/RELEASED) and expiry time

### API Endpoints

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/products` | List products with available stock per warehouse |
| GET | `/api/warehouses` | List warehouses |
| POST | `/api/reservations` | Reserve units for a product/warehouse. Returns 409 if insufficient stock. |
| GET | `/api/reservations/:id` | Get a single reservation |
| POST | `/api/reservations/:id/confirm` | Confirm reservation (payment succeeded). Returns 410 if expired. |
| POST | `/api/reservations/:id/release` | Release reservation early (payment failed/user cancelled) |

### Frontend
- **Product Listing Page**: Shows products with images, available stock per warehouse, and "Reserve" button
- **Reservation Checkout Page**: Shows reservation details, live countdown, "Confirm purchase" and "Cancel" buttons
- Beautiful dark theme with RGB halo background (Google Gemini style)
- Glass effect cards with backdrop blur
- Real-time UI updates without page refresh
- Error messages for 409 (insufficient stock) and 410 (expired reservation)

### Concurrency Safety
All reservation operations use **Prisma transactions** to ensure atomicity. When two requests come in for the last unit, exactly one will succeed because:
1. The transaction acquires a row lock on the stock record
2. Only one transaction can proceed at a time
3. The other transaction will see the updated reserved count and fail with 409

### Reservation Expiry
We use **lazy cleanup on read**:
- Every time we fetch products or a single reservation, we first clean up any expired pending reservations
- Expired reservations are released and their stock is returned to available
- This approach is simple and effective for most use cases
- For high-traffic scenarios, you could add a Vercel Cron job or background worker

## Getting Started

### 1. Set up PostgreSQL Database
Create a PostgreSQL database using a managed provider like:
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

### 2. Configure Environment Variables
Copy `.env` and update `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Push Prisma Schema
```bash
npx prisma db push
```

### 5. Seed the Database
```bash
npx prisma db seed
```

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
