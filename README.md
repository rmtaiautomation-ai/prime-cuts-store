# 🥩 PrimeCuts | Premium E-Commerce Business Engine

> A high-performance, highly secure, and automated digital storefront built specifically for premium meat suppliers. 

**🔴 Live Demo:** [https://prime-cuts-store.vercel.app/]

## 📊 The Business Value
Most boutique food suppliers rely on manual, error-prone processes: taking orders through Instagram DMs, tracking inventory in Excel, and manually messaging customers for delivery updates. 

**PrimeCuts solves this.** This project is not just a digital menu; it is a full **Business Management Engine** designed to automate operations, protect revenue, and deliver a VIP customer experience. 

---

## ✨ Key Business Features

### 🧠 Intelligent Inventory Management
- **Live Stock Tracking:** Customers can only buy what is physically available.
- **Auto-Restocking:** If an admin cancels or refunds an order, the exact items are mathematically restocked into the database automatically.
- **Low-Stock Alerts:** When a popular item's stock drops below a critical threshold (e.g., 5 items left), the system instantly emails the administrator to restock.

### 🛡️ Enterprise-Grade Security & Authentication
- **Row Level Security (RLS):** Powered by Supabase, database tables are locked down at the row level. Data can only be read or modified by strictly authorized server actions, preventing unauthorized API queries.
- **Robust Authentication Flows:** Implements secure Supabase Auth with dedicated callback routes (`/auth/callback`) to handle magic links, OAuth, and session persistence smoothly across the application.
- **Comprehensive Error Handling:** Graceful error boundary catchers and route handlers ensure that any authentication failures or API timeouts never crash the app, but instead guide the user safely back to a stable state.
- **Anti-Spam Checkout:** Protects the business from malicious bots and competitors by strictly rate-limiting checkouts (1 order per minute per email).
- **Data Sanitization:** All customer inputs are aggressively sanitized before entering the database to prevent HTML/Email Injection attacks.
- **Secure Admin Portal:** The dashboard is protected by strict Role-Based Access Control (RBAC). Only verified `is_admin = true` accounts can bypass the middleware to access financial and order data.

### 📧 Automated Customer Experience
- **Branded Order IDs:** Generates highly professional, readable order numbers (e.g., `ORD-9B1DEB4D`) for receipts and customer support.
- **Automated Email Triggers:** Hooked directly into the **Resend API**. When an admin changes an order status to "Out for Delivery", the customer receives a beautiful HTML email update in real-time.

### ⚡ Built to Scale
- **Server-Side Pagination:** The Admin Dashboard utilizes advanced PostgreSQL `.range()` querying. Whether the store has 100 orders or 1,000,000 orders, the dashboard loads instantly without freezing the browser.

---

## 💻 Technical Architecture (For Developers)

This platform was built using modern, edge-ready web technologies to ensure maximum performance and security:

* **Next.js 14** - React Framework (App Router, Server Actions)
* **React** - UI Library
* **Tailwind CSS** - Utility-first styling
* **Shadcn UI** - Reusable UI components
* **Supabase** - PostgreSQL Database, Authentication, and Row Level Security (RLS)
* **Resend** - Transactional Email API
* **TypeScript** - Strict type checking

### Database Optimizations
To support the anti-spam checkout protections without sacrificing speed, a composite database index was implemented:
```sql
CREATE INDEX idx_orders_email_date ON orders(customer_email, created_at DESC);
```

---

## 📸 Screenshots

*(Add screenshots of your application here)*

| Storefront | Admin Dashboard |
|---|---|
| ![Storefront Placeholder](https://via.placeholder.com/500x300?text=Storefront+UI) | ![Admin Placeholder](https://via.placeholder.com/500x300?text=Admin+Dashboard) |

---

## 🚀 Getting Started

To run this project locally, you will need a Supabase project and a Resend API key.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/primecuts-store.git
   cd primecuts-store
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app!

---
*Developed by [Your Name/Company]. Built for high-volume, premium retail.*
