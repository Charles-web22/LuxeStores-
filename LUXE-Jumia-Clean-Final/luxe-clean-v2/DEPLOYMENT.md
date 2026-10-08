# LUXE Jumia Marketplace - DEPLOY ONLINE (Step by Step)

You have full-stack code: frontend (React) + backend (Node/Express/MongoDB) with Stripe + Paystack escrow.

## Option A: Fastest (Vercel Frontend + Render Backend + MongoDB Atlas) - Recommended

### STEP 1: Prepare MongoDB (Database)
1. Go to https://cloud.mongodb.com - Create free account
2. Create Cluster (Free M0) → Create Database `luxe-marketplace`
3. Database Access → Add user: username `luxe_admin`, password generate
4. Network Access → Allow All (0.0.0.0/0) for now
5. Click Connect → Drivers → Copy URI: `mongodb+srv://luxe_admin:xxx@cluster.mongodb.net/luxe-marketplace`
6. This is your MONGODB_URI

### STEP 2: Get Paystack & Stripe Keys
- Paystack: https://dashboard.paystack.com → Settings → API Keys → Copy TEST keys first, later LIVE
  - Secret: `sk_test_xxx`, Public: `pk_test_xxx`
- Stripe: https://dashboard.stripe.com → Developers → API keys → Copy test keys
  - Secret: `sk_test_xxx`, Publishable: `pk_test_xxx`
- You need both, but Nigeria should use Paystack.

### STEP 3: Deploy Backend to Render.com (Free)
1. Go to https://render.com → Sign up → New Web Service
2. Connect your GitHub (push this zip to GitHub first) OR upload via Render CLI
3. Settings:
   - Name: luxe-backend
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Instance: Free
4. Environment Variables (Add in Render Dashboard):
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=put_long_random_string_here_32chars
   FRONTEND_URL=https://your-frontend.vercel.app (add after Step 4, then update)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_WEBHOOK_SECRET=...
   ```
5. Deploy → Copy backend URL: e.g., `https://luxe-backend.onrender.com`
6. Test: Visit `https://luxe-backend.onrender.com` → should show API message

### STEP 4: Deploy Frontend to Vercel (Free)
1. Go to https://vercel.com → New Project → Import your GitHub repo
2. Framework: Vite, Root Directory: `frontend`
3. Build Command: `npm run build`, Output: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://luxe-backend.onrender.com
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```
5. Deploy → You get URL: `https://luxe-jumia.vercel.app`
6. Now go back to Render backend → Update FRONTEND_URL to this Vercel URL → Redeploy backend

### STEP 5: Update Frontend API URL
In `frontend/src/App.jsx` and axios config, replace localhost with your Render URL:
```js
const API = import.meta.env.VITE_API_URL || 'https://luxe-backend.onrender.com'
axios.defaults.baseURL = API
```

### STEP 6: Paystack Webhook Setup (Important for Escrow)
1. Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://luxe-backend.onrender.com/api/paystack/webhook`
3. Select events: `charge.success`, `transfer.success`, `transfer.failed`
4. Save. Paystack will now notify your backend when payment succeeds.

### STEP 7: Vendor Bank Setup
- Vendor must go to Vendor Dashboard → Settings → Add Bank: Account Number (10 digits) + Bank Code
- Common bank codes: GTB 058, Access 044, FirstBank 011, UBA 033, Zenith 057, Opay 999992
- When customer confirms, backend creates recipient and transfers.

## Option B: Deploy All on One VPS (DigitalOcean / AWS EC2 / Hostinger)

1. Buy VPS Ubuntu 22.04, SSH in
2. Install:
   ```
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs mongodb nginx -y
   ```
3. Clone your repo, `cd backend && npm install`, `cd ../frontend && npm install && npm run build`
4. PM2: `npm i -g pm2`, `pm2 start backend/server.js --name luxe-api`
5. Nginx config to serve frontend dist and proxy /api to :5000
6. SSL via Certbot: `sudo certbot --nginx`

## How Escrow + 7 Days Auto-Release Works

- Customer pays → Order = `Paid - Escrow Hold` (funds in your Paystack balance)
- Vendor ships → Mark `Shipped` → `Delivered` (deliveredAt timestamp)
- Customer dashboard shows [CONFIRM RECEIPT] button
- If customer confirms within 7 days → `POST /api/paystack/confirm-receipt/:orderId` → Transfer to vendor via Paystack Transfer API
- If NO confirmation after 7 days:
  - Admin Panel shows eligible orders: `GET /api/paystack/admin/check-auto-release` (admin token)
  - Admin clicks Force Release or set cron:
    - Create cron job on Render: add file `backend/cron.js` and call daily, or use https://cron-job.org to hit `POST https://your-backend/api/paystack/admin/auto-release-all` with admin token
  - Funds auto-released to vendor, platform keeps commission

Example cron (every day 9am):
```
0 9 * * * curl -X POST https://luxe-backend.onrender.com/api/paystack/admin/auto-release-all -H "Authorization: Bearer ADMIN_JWT"
```

## Final Checklist Before Going Live

- [ ] Change all `sk_test` to `sk_live` in env
- [ ] MongoDB Atlas IP allow 0.0.0.0/0 or Render IPs
- [ ] Set strong JWT_SECRET
- [ ] Test full flow: Customer pay → Vendor delivered → Customer confirm → Vendor receives (check Paystack Dashboard → Transfers)
- [ ] Add terms: Escrow 7 days policy
- [ ] Enable Paystack settlement account to receive commissions

Need help pushing to GitHub? Run:
```
git init
git add .
git commit -m "Luxe marketplace"
git branch -M main
git remote add origin https://github.com/yourname/luxe.git
git push -u origin main
```
