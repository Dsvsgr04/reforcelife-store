# ReforceLife — Full Stack Web App
## Node.js + Express + MySQL + Sequelize

---

## 🚀 Quick Start (5 steps)

### 1. Install Node.js & MySQL
- Node.js 18+: https://nodejs.org
- MySQL 8+: https://dev.mysql.com/downloads/

### 2. Create the database
```bash
mysql -u root -p
CREATE DATABASE reforcelife_db;
EXIT;
```

### 3. Configure environment
Edit `.env` and set your values:
```
DB_PASSWORD=your_mysql_password
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
PAYPAL_CLIENT_ID=your_paypal_client_id
SQUARE_ACCESS_TOKEN=your_square_token
```

### 4. Install & seed
```bash
npm install
npm run seed    # Creates all 10 products + admin user
```

### 5. Start the server
```bash
npm run dev     # Development (auto-restart)
npm start       # Production
```

Open: **http://localhost:8081**

---

## 👤 Default Admin Account
- Email: `admin@reforcelife.com`
- Password: `Admin@2026!`

Login → click your name → **Admin** button to access the dashboard.

---

## 📦 What's Included

### Backend API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in, get JWT token |
| GET  | /api/auth/me | Get current user |
| GET  | /api/products | Get all products (supports ?category=, ?search=, ?featured=true) |
| GET  | /api/products/:id | Get product details |
| GET  | /api/products/:id/reviews | Get product reviews |
| POST | /api/products/:id/reviews | Submit a review |
| POST | /api/orders/checkout | Place an order |
| POST | /api/orders/confirm-payment | Confirm PayPal/Square payment |
| GET  | /api/orders/my | My order history (auth required) |
| POST | /api/contact | Submit contact form |
| GET  | /api/admin/products | Admin: all products |
| POST | /api/admin/products | Admin: create product |
| PUT  | /api/admin/products/:id | Admin: update product |
| DELETE | /api/admin/products/:id | Admin: delete product |
| PATCH | /api/admin/products/:id/stock | Admin: update stock |
| GET  | /api/admin/orders | Admin: all orders |
| PATCH | /api/admin/orders/:id/status | Admin: update order status |
| GET  | /api/admin/messages | Admin: contact messages |

### Frontend Features
- ✅ Product grid with images, ratings, categories
- ✅ Product detail modal with ingredients, benefits, reviews
- ✅ Sliding cart drawer with qty controls
- ✅ Full checkout flow (shipping + payment)
- ✅ PayPal SDK integration
- ✅ Square payment integration
- ✅ Sign in / Create account modals
- ✅ My Orders page
- ✅ Admin dashboard (Products, Orders, Messages)
- ✅ Contact form (saves to DB + sends email)
- ✅ 3 YouTube videos embedded
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Toast notifications
- ✅ Guest checkout supported

---

## 🏗️ Project Structure
```
reforcelife-node/
├── src/
│   ├── server.js              ← Main Express app
│   ├── models/
│   │   ├── index.js           ← Associations
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js           ← Order + OrderItem
│   │   └── Review.js          ← Review + ContactMessage
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── reviewController.js
│   ├── routes/
│   │   └── index.js           ← All routes
│   ├── middleware/
│   │   ├── auth.js            ← JWT guard
│   │   └── upload.js          ← Multer image upload
│   ├── config/
│   │   └── database.js        ← Sequelize config
│   └── utils/
│       ├── seed.js            ← 10 products + admin user
│       └── email.js           ← Nodemailer
├── public/
│   ├── index.html             ← Main frontend
│   ├── app.js                 ← All frontend JS
│   └── extra.css              ← All UI styles
├── uploads/products/          ← Product images (auto-created)
├── .env                       ← Your config (edit this!)
└── package.json
```

---

## 💳 Payment Setup

### PayPal
1. Go to https://developer.paypal.com
2. Create a sandbox app → get Client ID
3. Add to `.env`: `PAYPAL_CLIENT_ID=...`
4. In `public/index.html`, set `window.PAYPAL_CLIENT_ID` or the SDK auto-loads

### Square
1. Go to https://developer.squareup.com
2. Create an app → get Access Token + Location ID
3. Add to `.env`: `SQUARE_ACCESS_TOKEN=...` and `SQUARE_LOCATION_ID=...`

---

## 📧 Email Setup (Gmail)
1. Enable 2FA on your Gmail
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Use that 16-char password in `MAIL_PASS=`

---

## 🌐 Deployment

### Option A — Railway (easiest)
```bash
npm install -g railway
railway login
railway init
railway add mysql
railway up
```

### Option B — DigitalOcean / VPS
```bash
# Install PM2
npm install -g pm2
pm2 start src/server.js --name reforcelife
pm2 startup && pm2 save
```

### Option C — Heroku
```bash
heroku create reforcelife-app
heroku addons:create jawsdb:kitefin
git push heroku main
```

---

## 🛍️ The 10 Products (Pre-seeded)
1. Trinity Rejuvenation Complex — $64.99
2. Metabolic Energy Complex — $54.99
3. Glucose Balance Formula — $49.99
4. Anti-Inflammatory Blend — $52.99
5. Fat Absorption Support — $47.99
6. Immune Defense System — $44.99
7. Digestive Harmony — $49.99
8. Detox & Cellular Cleanse — $51.99
9. Cardiovascular Support — $57.99
10. Cognitive Focus & Brain Health — $59.99

---

Built for ReforceBio / ReforceLife™ — 2026
