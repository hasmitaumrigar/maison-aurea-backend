# MAISON AURÈA — Backend API

## QUICK START

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI, SMTP credentials, JWT secret

# 3. Seed voucher codes
npm run seed

# 4. Start development server
npm run dev

# 5. Start production
npm start
```

---

## API ENDPOINTS

### AUTH  `POST /api/auth/...`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/signup` | — | Register new account |
| POST | `/login` | — | Sign in, receive JWT |
| GET | `/me` | ✓ | Get current user profile |
| PUT | `/change-password` | ✓ | Change password |

**Signup body:**
```json
{ "name": "HASMITA", "email": "user@example.com", "password": "Secret@123" }
```
**Login body:**
```json
{ "email": "user@example.com", "password": "Secret@123" }
```
**Response:** `{ success, token, user }`

Use the `token` in all protected requests:
```
Authorization: Bearer <token>
```

---

### ORDERS  `POST /api/orders/...` *(auth required)*
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Place order (prices recalculated server-side) |
| GET | `/` | Get all orders for current user |
| GET | `/:id` | Get specific order by order ID |

**Create order body:**
```json
{
  "items": [{ "productId": 1, "name": "LUMIÈRE DORÉE", "size": 50, "qty": 1 }],
  "shipping": { "name": "HASMITA", "phone": "9876543210", "address": "123 MG Road, Mumbai" },
  "payment": { "cardHolder": "HASMITA", "cardNumber": "4111111111111111" },
  "voucherCode": "AUREA10"
}
```

---

### CART  `/api/cart` *(auth required)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get cart from database |
| POST | `/sync` | Sync full cart `{ items: [...] }` |
| DELETE | `/` | Clear cart |

---

### WISHLIST  `/api/wishlist` *(auth required)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get wishlist |
| POST | `/:productId` | Add product to wishlist |
| DELETE | `/:productId` | Remove product from wishlist |

---

### VOUCHERS  `/api/vouchers` *(auth required)*
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/validate` | Validate code `{ "code": "AUREA10" }` |

---

### CONTACT  `/api/contact` *(public)*
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Send contact message |

**Body:** `{ "name": "...", "email": "...", "message": "..." }`

---

### HEALTH CHECK  *(public)*
```
GET /api/health
```

---

## DISCOUNT LOGIC

| Type | Code | Amount | Condition |
|------|------|--------|-----------|
| Auto first-order | *(none needed)* | 20% | Applied server-side on first order only |
| Loyalty | `AUREA10` | 10% | Any order |
| Seasonal | `AUREA15` | 15% | Any order, expires 31 Dec 2026 |

First-order discount is tracked by `user.ordersPlaced === 0`. After each order, `ordersPlaced` increments — discount is never applied again.

---

## DEPLOYMENT

### Railway (Recommended — free tier)
1. Push this folder to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway gives you a live URL automatically

### Render (Free tier)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Set Build Command: `npm install`  
   Start Command: `npm start`
4. Add environment variables

### Environment Variables Required
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64-char hex string |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password (16 chars) |
| `FROM_EMAIL` | Same as SMTP_USER |
| `FRONTEND_URL` | Your Netlify/GitHub Pages URL |

### MongoDB Atlas (Free)
1. [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Database Access → Add user → username + password
3. Network Access → Allow access from anywhere (`0.0.0.0/0`)
4. Connect → Drivers → Copy connection string
5. Replace `<password>` with your DB user password

### Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification (enable if not on)
3. Security → App Passwords → Select app: Mail → Generate
4. Copy the 16-char code → paste as `SMTP_PASS`

---

## TECH STACK
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **bcryptjs** password hashing
- **Nodemailer** (Gmail SMTP)
- **Helmet** + **CORS** + **Rate Limiting**
