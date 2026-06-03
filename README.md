# 🎓 CampusLoop - Frontend Application

The modern, responsive, and dynamic user interface for **CampusLoop**. Built with React 19 and Vite, it serves as the main portal for Admins, Teachers, and Students. It features a clean "Facebook-style" feed UI powered by Bootstrap 5 and seamless notifications via Sileo.

## 🛠️ Tech Stack & Dependencies

- **Framework:** React.js v19.2
- **Build Tool:** Vite v7.3
- **Routing:** React Router DOM v7.13
- **Styling & UI:** Bootstrap v5.3.8, Bootstrap Icons v1.13.1
- **HTTP Client:** Axios v1.13 (with Global Interceptors)
- **Alerts & Toasts:** Sileo v0.1.5
- **Calendar:** FullCalendar v6.1
- **Security:** React Google reCAPTCHA v3.1

## 📋 Prerequisites

Ensure you have the following installed:

- Node.js (v22.21.0 recommended)
- npm or yarn

## 🚀 Installation & Setup Guide

**1. Clone the repository**

```bash
git clone [https://github.com/yourusername/campusloop-frontend.git](https://github.com/yourusername/campusloop-frontend.git)
cd campusloop-frontend

```

**2. Install dependencies**

```bash
npm install

```

**3. Set up Environment Variables**
Create a `.env` file in the root directory:

```bash
touch .env

```

Add your backend API base URL and reCAPTCHA keys:

```env
# Production/Testing Keys

# Google Test Site Key para laging pumasa sa localhost testing
# VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Production Key
VITE_RECAPTCHA_SITE_KEY=
VITE_API_BASE_URL=http://localhost:8000/api

```

**4. Start the Development Server**

```bash
npm run dev

```

The application will start and is accessible at `http://localhost:5173`.

## 📂 Core Project Structure

- `src/components/Shared/` - Contains global components like `MaintenanceGuard`, `GlobalSpinner`, and the premium `NotFound` (404) page.
- `src/pages/` - Contains the specific views separated by roles (`Auth`, `Admin`, `Teacher`, `Student`).
- `src/main.jsx` - Entry point containing the Axios Global Interceptor. It automatically attaches the Sanctum token to requests and listens for `401 Unauthorized` responses to enforce the Single Session Policy.
- `src/App.jsx` - The main router handling protected routes and access control.

## 🔑 Authentication & Session Flow

The application utilizes token-based authentication via Laravel Sanctum.

- Tokens and User data are stored securely in `localStorage` or `sessionStorage` (depending on "Remember Me").
- If a session is terminated remotely (Single Session Policy), the Axios interceptor immediately clears storage, flags the session in `sessionStorage`, and hard-redirects the user to `/login` where a Sileo toast explains the termination.
