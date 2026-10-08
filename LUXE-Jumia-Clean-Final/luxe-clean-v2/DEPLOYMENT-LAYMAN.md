mongodb+srv://LuxeOGStores:<db_password>@luxestores.7z0muti.mongodb.net/?appName=LuxeStores
# DEPLOY YOUR JUMIA STORE ONLINE - SUPER SIMPLE GUIDE (For Complete Beginners)

Think of your marketplace like a shop:
- FRONTEND = The shop building customers see (Vercel will host it)
- BACKEND = The store manager in back office who handles money, orders (Render will host it)
- MONGODB = The big notebook where all products, users, orders are written (MongoDB Atlas holds it online)
- PAYSTACK = Your cashier (collects money from customers in Nigeria)

Let's build step by step. No coding needed, just clicking.

==================================================
PART 1: CREATE YOUR ONLINE NOTEBOOK (MongoDB)
==================================================
This is where all your products, users will be saved. Like Google Sheets but for your store.

1. Open Google, search "MongoDB Atlas", click first result, click "Try Free" or "Sign Up"
2. Sign up with Google email
3. It will ask "Create Cluster" -> Choose FREE (M0) -> Choose region closest to you (e.g., AWS Frankfurt)
4. Wait 3 minutes, it creates.
5. Left side menu: Click "Database Access" -> Add New Database User
   - Username: luxe_admin (remember it)
   - Password: Click "Autogenerate" -> COPY and save in notepad. Example: MyPass123!
6. Left side: Click "Network Access" -> Add IP Address -> Click "Allow Access From Anywhere" -> Confirm (it shows 0.0.0.0/0)
7. Go back to "Database" -> Click "Connect" -> Click "Drivers" -> You will see a link like:
   mongodb+srv://luxe_admin:<password>@cluster0.xxxxx.mongodb.net/
8. Replace <password> with the password you copied. Add /luxe-marketplace at end.
   Final looks like: mongodb+srv://luxe_admin:MyPass123!@cluster0.xxxxx.mongodb.net/luxe-marketplace
   SAVE THIS LINK IN NOTEPAD. This is your MONGODB_URI. Very important.



==================================================
PART 2: GET YOUR PAYSTACK KEYS (To Collect Money)
==================================================
Paystack is like POS machine online for Nigeria.

1. Go to paystack.com -> Sign Up as Business (use your business name)
2. After login, top right click your profile -> Go to Settings -> API Keys & Webhooks
3. You will see 2 keys: Public Key (pk_test_...) and Secret Key (sk_test_...)
4. COPY both to notepad. For testing use TEST keys. When ready to collect real money, you will switch to LIVE keys later.
5. Leave this tab open.

For Stripe (for international customers, optional for now) - same process at stripe.com

==================================================
PART 3: PUT YOUR CODE ON GITHUB (Like Google Drive for code)
==================================================
Render and Vercel need your code from GitHub.

1. Go to github.com -> Sign Up
2. Click "New Repository" -> Name: luxe-marketplace -> Make Public -> Create
3. On your computer, unzip the zip I gave you.
4. Inside folder, you see frontend and backend folders.
5. GitHub will show you commands. Easiest: Download GitHub Desktop app, drag your luxe folder into it, and Publish.
   Alternative: On GitHub repo page, click "Add file" -> "Upload files" -> Drag all files from luxe-jumia-fullstack folder -> Commit.

Now your code is online on GitHub.

==================================================
PART 4: HOST YOUR BACK OFFICE (Backend on Render.com)
==================================================
This is the brain that handles payments and commission.

1. Go to render.com -> Sign Up with GitHub (so it sees your code)
2. Dashboard -> Click "New +" -> "Web Service"
3. Connect your GitHub repo "luxe-marketplace"
4. Fill form:
   - Name: luxe-backend
   - Region: Frankfurt (closest to Nigeria)
   - Branch: main
   - Root Directory: backend (IMPORTANT: type backend)
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
   - Plan: Free
5. Scroll down to "Environment Variables" -> Add these one by one (copy from notepad):

   MONGODB_URI = the long mongodb link from Part 1
   JWT_SECRET = type any long random sentence e.g., my_super_secret_luxe_store_2024_nigeria
   FRONTEND_URL = you will add later, for now type https://temp.com
   PAYSTACK_SECRET_KEY = sk_test_... from Paystack
   PAYSTACK_PUBLIC_KEY = pk_test_... from Paystack
   STRIPE_SECRET_KEY = sk_test_... (if you have, else leave dummy)
   STRIPE_PUBLISHABLE_KEY = pk_test_... 
   PORT = 5000

6. Click "Create Web Service". Wait 5 minutes. It will build.
7. When done, top left you will see URL like: https://luxe-backend-xyz.onrender.com
   COPY this URL. Open it in browser, you should see message: "LUXE Marketplace API - Ready"
   If you see that, backend is LIVE!

==================================================
PART 5: HOST YOUR SHOP FRONT (Frontend on Vercel.com)
==================================================
This is what customers see.

1. Go to vercel.com -> Sign Up with GitHub
2. Click "Add New" -> "Project" -> Import your luxe-marketplace repo
3. Vercel asks to configure:
   - Framework Preset: Vite
   - Root Directory: Click Edit -> Select frontend folder -> Continue
   - Build Command: npm run build (auto)
4. Environment Variables -> Add:
   VITE_API_URL = your Render backend URL from Part 4 (https://luxe-backend-xyz.onrender.com)
   VITE_PAYSTACK_PUBLIC_KEY = pk_test_... from Paystack
   VITE_STRIPE_PUBLIC_KEY = pk_test_... 

5. Click Deploy. Wait 2 minutes.
6. You get URL like: https://luxe-jumia-abc.vercel.app
   COPY it. Open it. Your Jumia-style store should appear!

7. NOW go back to Render (Part 4) -> Your backend service -> Environment -> Find FRONTEND_URL -> Change from https://temp.com to your Vercel URL https://luxe-jumia-abc.vercel.app -> Save -> It will redeploy automatically (1 min).

Now frontend and backend are talking!

==================================================
PART 6: CONNECT PAYSTACK WEBHOOK (So Paystack Tells Your Store "Payment Done")
==================================================
Webhook = Paystack automatically knocking your backend door to say "Customer paid!"

1. In your Render backend, copy your backend URL: https://luxe-backend-xyz.onrender.com
2. Add /api/paystack/webhook at end: https://luxe-backend-xyz.onrender.com/api/paystack/webhook
3. Go to Paystack Dashboard (from Part 2) -> Settings -> API Keys & Webhooks -> Webhook URL box
4. Paste that full URL
5. Tick boxes: charge.success, transfer.success, transfer.failed
6. Save.

Done! Now when someone pays, Paystack will tell your store automatically.

==================================================
PART 7: 7-DAY AUTO RELEASE (Automatic Alarm Clock - Cron)
==================================================
What is Cron? It's like alarm that checks every day: "Any order delivered 7 days ago but customer didn't click Confirm? Pay vendor automatically"

Simplest way without coding:

1. Go to cron-job.org -> Sign Up free
2. Click Create Cronjob
3. Title: Auto-release escrow
4. URL: https://luxe-backend-xyz.onrender.com/api/paystack/admin/auto-release-all
   - Method: POST
5. Schedule: Every day at 9am
6. It will ask for Headers: You need Admin token. For now, we will make simple:
   - Login to your store as admin@demo.com / demo123
   - Open browser console (F12) -> Application -> Local Storage -> Find luxe_auth -> Copy token
   - In cron-job.org, add Request Header: Authorization = Bearer YOUR_TOKEN_HERE
7. Save.

Now every day 9am, it will automatically pay vendors whose orders have been delivered for 7+ days and customer forgot to confirm.

ALSO Admin can manually force release:
- Login as admin@demo.com
- Go to Admin Panel -> You will see list of orders delivered >7 days
- Click "Force Release" button -> Vendor gets money via Paystack Transfer.

==================================================
PART 8: HOW ESCROW WORKS (In Simple English)

1. Customer orders iPhone ₦1,250,000 and pays via Paystack.
2. Money does NOT go to vendor yet. It sits in YOUR Paystack balance. Like you holding money.
3. Order status: "Paid - Escrow Hold" (Money is held)
4. Vendor sees order, ships product, clicks "Shipped" then "Delivered"
5. Customer receives phone, goes to My Orders, sees button "✅ CONFIRM RECEIPT - RELEASE FUNDS"
6. Customer clicks confirm -> Your backend calls Paystack Transfer API -> Sends ₦1,150,000 to vendor (total minus 10% commission = ₦100,000 you keep)
7. If customer forgets to confirm for 7 days, system auto-releases money to vendor (or admin clicks Force Release).

Vendor must add bank details: In Vendor Dashboard -> Settings -> Add Account Number (10 digits) + Bank Code (e.g., GTB 058, Access 044, FirstBank 011, Opay 999992)

==================================================
FINAL CHECKLIST - YOUR STORE IS LIVE WHEN:

- [ ] You can open Vercel URL and see Jumia-style products
- [ ] You can Register as Customer and Vendor
- [ ] You can add product to cart and see Paystack checkout
- [ ] After test payment (use Paystack test card 4084084084084081), order shows in My Orders as Escrow Hold
- [ ] Vendor can mark as Delivered
- [ ] Customer can Confirm Receipt and vendor gets payout (in test mode, check Paystack Dashboard -> Transfers -> It will show simulated)

When ready for real money:
- In Paystack, click "Go Live" and provide business docs (CAC, bank account)
- Replace all sk_test with sk_live and pk_test with pk_live in Render and Vercel env vars
- Redeploy both

If stuck, tell me which Part you are stuck (Part 1,2,3,4,5,6,7) and I will help with screenshots!

==================================================
