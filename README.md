# Scholarship Application and Management Portal

A complete MERN stack solution for managing scholarship applications, featuring user authentication, application tracking, document uploads, and an admin dashboard.

## Project Structure

```
/
├── backend/                 # Express.js API
│   ├── config/             # Database & other configs
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & upload middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
└── frontend/               # React + Vite Client
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Full page views
    │   ├── context/        # React Context (Auth, etc.)
    │   ├── services/       # API call functions
    │   └── utils/          # Helper functions
```

## Features

- **User Roles**: Students, Admins, Providers.
- **Authentication**: Secure JWT-based auth.
- **Application Tracking**: Real-time status updates.
- **Document Management**: Upload and verify documents.
- **Notifications**: Real-time alerts.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm run install-all
    ```
    Or manually:
    ```bash
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    ```

2.  **Environment Variables**
    -   Copy `backend/.env.example` to `backend/.env` and update values.
    -   Copy `frontend/.env.example` to `frontend/.env` and update values.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    This will start both Backend (port 5000) and Frontend (port 5173).

## Tech Stack

-   **Frontend**: React, Vite, TailwindCSS, Framer Motion
-   **Backend**: Node.js, Express, MongoDB, Socket.io
