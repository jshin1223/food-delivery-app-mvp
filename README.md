
# 🍽️ Food Ordering App MVP
An MVP (Minimum Viable Product) for a restaurant ordering and admin management system.
Built with Next.js (App Router), TypeScript, Supabase, and TailwindCSS.

## ✨ Features
- 🔐 **Supabase Auth** – Email/password login out-of-the-box
- 📊 **Admin Dashboard** – Manage orders (placeholder)
- 🍴 **Restaurant Dashboard** – View menu and incoming orders (placeholder)
- 💳 **Stripe Integration (future)** – Customer payments
- 🗺️ **Google Maps Integration (future)** – Search restaurants
- 📱 **Mobile App Expansion (future)** – React Native + Expo

## 🚀 How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/jshin1223/food-ordering-app-mvp.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up your `.env.local` file with the Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://odofqzljamszquevegdm.supabase.co 

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2ZxemxqYW1zenF1ZXZlZ2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTEzMTYsImV4cCI6MjA3MTA2NzMxNn0.kSU_rp3SGZFMqsYeT6Pkt_nhCSqLiBC_d-Q8HrtXpZQ

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2ZxemxqYW1zenF1ZXZlZ2RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ5MTMxNiwiZXhwIjoyMDcxMDY3MzE2fQ.qzIMzJdVIhuOa-AEPUxzC4yaWUzsf5sbda9_pz_QHeo
```

4. Start the development server:

```bash
npm run dev
```

5. Visit `http://localhost:3000` in your browser.

## 📱 Mobile App (Future Plan)

### Planned stack:
- **React Native + Expo** → Cross-platform development
- **Stripe React Native SDK** → Payments
- **React Native Maps / Google Maps API** → Restaurant search
- Shared **Supabase backend** with the web app
- **Monorepo setup** (Turborepo or Nx) for shared components and logic

👉 This will allow customers to order via iOS and Android apps using the same backend.

## 📌 Roadmap

- ✅ **Customer-facing ordering flow**
- ✅ **Restaurant menu management**
- ✅ **Admin dashboard with real order data**
- 🔜 **Stripe integration for payments**
- 🔜 **Google Maps API integration**
- 🔜 **Mobile App Development (React Native + Expo)**

## 📄 License

This project is licensed under the MIT License. Copyright (c) 2025 Sung Shin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
