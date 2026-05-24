# AlloHealth Inventory & Reservation System

A Next.js application that implements inventory management with temporary product reservations to prevent race conditions during checkout.

## Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - End-to-end type safety
- **Prisma ORM** - Database access and modeling
- **PostgreSQL** - Database (hosted via Supabase/Neon/Railway)
- **Tailwind CSS** - Styling
- **Zod** - Validation

## Features

### Data Models
- **Products**: Basic product information
- **Warehouses**: Warehouse locations
- **Stock**: Inventory levels per product per warehouse (total and reserved units)
- **Reservations**: Temporary holds with status (pending/confirmed/released) and expiry time

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
- **Product Listing Page**: Shows products, available stock per warehouse, and "Reserve" button
- **Reservation Checkout Page**: Shows reservation details, live countdown, "Confirm purchase" and "Cancel" buttons
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
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
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

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
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
