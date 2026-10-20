# Journey Towards Life (JTL) - Express.js & MySQL Backend

Production REST API built with Node.js, Express.js, and MySQL2 following the **MVC (Model-View-Controller)** architecture. Ready for both local development and **Vercel Serverless Deployment**.

---

## 📁 Architecture Overview

```text
backend/
├── vercel.json              # Vercel serverless routing configuration & CORS headers
├── api/
│   └── index.js             # Vercel serverless function entrypoint (wraps Express app)
├── server.js                # Local development HTTP server with DB check & graceful shutdown
├── package.json             # Core dependencies (express, mysql2, multer, cors, helmet, morgan, jwt)
├── .env.example             # Environment configuration template
├── .gitignore
├── README.md
└── src/
    ├── app.js               # Express application setup, security & middlewares
    ├── config/
    │   └── db.js            # MySQL2 connection pool with serverless awareness & SSL support
    ├── controllers/
    │   ├── authController.js       # Admin authentication controller
    │   ├── teamController.js       # Team specialists CRUD controller
    │   ├── galleryController.js    # Gallery photos CRUD controller
    │   ├── videoController.js      # Video sessions & testimonials controller
    │   └── analyticsController.js  # Live dashboard metrics & charts controller
    ├── models/
    │   ├── teamModel.js            # MySQL queries for team_members table
    │   ├── galleryModel.js         # MySQL queries for gallery_items table
    │   ├── videoModel.js           # MySQL queries for video_items table
    │   └── analyticsModel.js       # MySQL queries for analytics & chart metrics
    ├── routes/
    │   ├── index.js                # Master API router (/api/health, /api/test)
    │   ├── authRoutes.js           # /api/auth
    │   ├── teamRoutes.js           # /api/team
    │   ├── galleryRoutes.js        # /api/gallery
    │   ├── videoRoutes.js          # /api/videos
    │   └── analyticsRoutes.js      # /api/analytics
    └── middlewares/
        ├── uploadMiddleware.js     # Multer file storage (supports local & Vercel /tmp)
        └── errorHandler.js         # Central 404 & 500 error handlers
```

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your credentials are set inside `backend/.env`:
```ini
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jtl_db

ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=adilkhan123
ADMIN_NAME=Adil Khan
ADMIN_ROLE=super_admin

JWT_SECRET=jtl_super_secret_jwt_key_swat_2026
JWT_EXPIRES_IN=7d
```

### 3. Start the Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run start
  ```
Server will run on `http://localhost:5001`.

---

## ☁️ Deploying Backend on Vercel

### Step 1: Push Code to GitHub / Git Provider
Ensure your repository is pushed to GitHub, GitLab, or Bitbucket.

### Step 2: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** ➔ **"Project"**.
2. Select your repository.
3. Under **Root Directory**, click **Edit** and select **`backend`**.
4. Framework Preset: Leave as **Other**.

### Step 3: Configure Environment Variables in Vercel
In the Vercel project settings under **Environment Variables**, add:
- `DB_HOST`: Your remote MySQL host (e.g. from Aiven, Railway, TiDB, PlanetScale, AWS RDS)
- `DB_PORT`: `3306` (or your cloud DB port)
- `DB_USER`: Your cloud database username
- `DB_PASSWORD`: Your cloud database password
- `DB_NAME`: Your cloud database name (e.g. `jtl_db` or `defaultdb`)
- `DB_SSL`: `true` (enables SSL for secure cloud database connections)
- `CLIENT_URL`: Your deployed frontend Vercel URL (e.g. `https://your-frontend.vercel.app`)
- `ADMIN_EMAIL`: `admin@gmail.com`
- `ADMIN_PASSWORD`: `adilkhan123`
- `ADMIN_NAME`: `Adil Khan`
- `ADMIN_ROLE`: `super_admin`
- `JWT_SECRET`: A long random secret key for token signing
- `JWT_EXPIRES_IN`: `7d`

### Step 4: Click Deploy
Vercel will automatically build the serverless functions and route all incoming traffic via `backend/vercel.json` to `api/index.js`.
Your API will be live at `https://your-backend.vercel.app/api/...`.
