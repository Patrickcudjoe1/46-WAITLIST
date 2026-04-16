## Fashion Waitlist Backend (Express + SQLite + Paystack)

### Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Environment variables

- `PORT`: server port (default `4000`)
- `PAYSTACK_SECRET_KEY`: Paystack secret key
- `PAYSTACK_WEBHOOK_SECRET`: secret used to verify webhook signature (use the same as `PAYSTACK_SECRET_KEY` unless you maintain a separate secret)
- `FRONTEND_ORIGIN`: optional, lock CORS to your Vite app URL

### Database

SQLite file is created automatically at `backend/data.sqlite`.

Table: `users`
- `id`
- `email`
- `phone`
- `paymentLink`
- `paymentReference`
- `paymentStatus` (`pending` | `paid`)
- `createdAt` (ISO timestamp)

### API

#### `POST /api/waitlist`

Body:

```json
{ "email": "user@example.com", "phone": "+233 555 000 000" }
```

Response:

```json
{ "paymentLink": "https://checkout.paystack.com/..." }
```

#### `POST /api/paystack-webhook`

Paystack webhook endpoint. Validates the `x-paystack-signature` header and updates the matching user record to `paid` when it receives `charge.success`.

