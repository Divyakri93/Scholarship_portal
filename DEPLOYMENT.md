# Scholarship Portal Deployment Guide

This guide details the steps to deploy the full-stack MERN application (Scholarship Portal) to production.

## 1. Prerequisites

Ensure you have accounts on the following platforms (or alternatives):
- **Frontend**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
- **Backend**: [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- **Image Storage**: [Cloudinary](https://cloudinary.com/) (Optional, if using local uploads in production, switch to persistent storage like AWS S3 or Cloudinary)

---

## 2. Environment Variables Checklist

Ensure these variables are set in your production environments.

### Backend (`.env`)
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server Port | `5000` (platform usually sets this) |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret for signing tokens | `super-long-secure-random-string` |
| `JWT_EXPIRES_IN` | Token Expiry | `7d` |
| `CLIENT_URL` | Frontend URL (CORS) | `https://your-app-frontend.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name | `...` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `...` |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret | `...` |

### Frontend (`.env` or Platform Config)
Vite requires variables to start with `VITE_`.

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_URL` | URL of the deployed backend | `https://your-app-backend.onrender.com/api/v1` |

---

## 3. Database Setup (MongoDB Atlas)

1.  Create a Cluster on MongoDB Atlas.
2.  In **Network Access**, whitelist `0.0.0.0/0` (Allow Access from Anywhere) so your cloud backend can connect (or whitelist specific backend IPs if static).
3.  In **Database Access**, create a database user.
4.  Get the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/scholarship_portal?retryWrites=true&w=majority`.

**Seeding Initial Data:**
Run `node seed.js` from your local machine (pointing `.env` to production DB) OR run it as a build command if supported.
```bash
# Locally
node seed.js
```

---

## 4. Backend Deployment (Render Example)

1.  Push your code to GitHub.
2.  Log in to Render and create a **New Web Service**.
3.  Connect your repository.
4.  **Root Directory**: `backend`
5.  **Build Command**: `npm install`
6.  **Start Command**: `node server.js`
7.  **Environment Variables**: Add all variables from the Backend Checklist above.
8.  Deploy. Note the URL provided (e.g., `https://scholar-backend.onrender.com`).

**Rate Limiting & Security Note**:
The backend is configured with `helmet`, `compression`, and `express-rate-limit`. In production, if you are behind a proxy (like Render/Heroku load balancers), you might need to trust the proxy.
*To fix IP rate limiting on proxies:* Add `app.set('trust proxy', 1);` in `server.js` if you see issues.

---

## 5. Frontend Deployment (Vercel Example)

1.  Log in to Vercel and **Add New Project**.
2.  Import your GitHub repository.
3.  **Root Directory**: `frontend` (Edit the root directory setting).
4.  **Framework Preset**: Vite (should detect automatically).
5.  **Build Command**: `npm run build`
6.  **Output Directory**: `dist`
7.  **Environment Variables**:
    - Add `VITE_API_URL` = `https://scholar-backend.onrender.com/api/v1` (The backend URL from Step 4 + `/api/v1`).
8.  Deploy.

---

## 6. Post-Deployment Verification

1.  **CORS Check**: Visit the frontend URL. If you see "Network Error" immediately, check if `CLIENT_URL` in backend matches the Vercel URL exactly (no trailing slash usually).
2.  **API Check**: Visit `https://scholar-backend.onrender.com/`. It should say "Scholarship Portal API is running".
3.  **Login**: Try logging in with:
    - **Admin**: `admin@example.com` / `password123`
    - **Provider**: `provider@example.com` / `password123`
    - **Student**: `student@example.com` / `password123`

## 7. CI/CD Pipeline

A GitHub Actions workflow is included in `.github/workflows/main.yml`.
- It triggers on push to `main`.
- It installs dependencies and builds the frontend to ensure no build errors.
- It can be extended to auto-deploy if you configure secrets.

---

## 8. Security & Optimization Checklist

- [x] **Rate Limiting**: Enabled (100 req/15min).
- [x] **Headers**: `Helmet` is active.
- [x] **Compression**: Gzip enabled.
- [x] **Data Sanitation**: `mongo-sanitize` or `express-validator` (Validation implemented, consider generic sanitizer for extra safety).
- [x] **Error Handling**: Production mode hides stack traces.

**Ready for Launch! 🚀**
