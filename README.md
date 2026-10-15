# ShopKart — MERN Full-Stack E-Commerce Platform

ShopKart is a modern, full-stack e-commerce application built using the MERN stack (MongoDB, Express, React, Node.js). It provides end-to-end e-commerce capabilities from user authentication to product discovery, wishlist management, persistent cart state, checkout, Razorpay payment verification, and order tracking.

---

## 🚀 Features

- **Authentication & Authorization (Lab 01 & 02)**:
  - User registration and login with password hashing via `bcrypt`.
  - Secure session management using `HttpOnly` JWT cookies.
  - Route protection middleware verifying credentials on every sensitive request.

- **Product Catalog & Discovery (Lab 03)**:
  - Dynamic product catalog powered by MongoDB.
  - Real-time case-insensitive search by product name.
  - Category filtering with combined query support.
  - Dedicated Product Details view with rich metadata and stock availability.
  - Built-in catalog seeding for instant setup.

- **Persistent Wishlist (Lab 04)**:
  - User-specific saved items stored persistently in MongoDB.
  - One-click add/remove toggles with duplicate check prevention.
  - Accessible directly from product cards and product details.

- **Shopping Cart & Global State (Lab 05)**:
  - Global state management using React Context API (`CartContext`).
  - Persistent cart stored in MongoDB and synchronized with authenticated sessions.
  - Real-time quantity controls (`-` / `+`) with live stock limit validation.
  - Dynamic navbar cart badge tracking total item quantity.
  - Real-time item subtotal and order summary calculations.

- **Checkout, Orders & Razorpay Payments (Lab 06)**:
  - Multi-field shipping address validation (client-side & server-side).
  - Server-calculated order totals to prevent tampering.
  - Razorpay Standard Checkout integration (Test Mode).
  - Server-side HMAC SHA256 payment signature verification using Node.js `crypto`.
  - Automatic product stock deduction and cart clearance upon verified payment.
  - Order history ("My Orders") and detailed purchase snapshots.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router v6**
- **Axios** (configured with `withCredentials: true`)
- **React Context API** (Global Cart State)
- **Custom CSS3** (Responsive, dark modern aesthetic, glassmorphism)

### Backend
- **Node.js** & **Express.js** (ES Modules)
- **MongoDB** & **Mongoose** (ODM)
- **JSON Web Token (JWT)** & **Cookie-Parser**
- **Bcrypt** (Password hashing)
- **Razorpay Node SDK**
- **CORS**

---

## 📂 Project Architecture

```text
shopkart-backend-main/
├── config/
│   └── razorpay.js            # Razorpay SDK initialization
├── controllers/
│   ├── cart.controller.js     # Cart operations & stock checking
│   ├── customer.controller.js # Auth (register, login, getMe, logout)
│   ├── order.controller.js    # Order creation & signature verification
│   ├── product.controller.js  # Product catalog, search, filter
│   └── wishlist.controller.js # Wishlist management
├── middlewares/
│   └── auth.middleware.js     # JWT cookie protection middleware
├── models/
│   ├── customer.model.js      # Customer schema (with wishlist & cart)
│   ├── order.model.js         # Order schema & purchase-time item snapshots
│   └── product.model.js       # Product catalog schema
├── routes/
│   ├── cart.routes.js
│   ├── customer.routes.js
│   ├── order.routes.js
│   ├── product.routes.js
│   └── wishlist.routes.js
├── utils/
│   └── generateToken.js       # JWT signing utility
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── context/
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js
├── .env.example
├── .gitignore
├── index.js                   # Server entrypoint
├── package.json
└── README.md
