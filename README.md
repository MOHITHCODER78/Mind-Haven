# Mind Haven

A full-stack mental health and wellness support platform designed specifically for students.

## About the Project

Mind Haven is a secure, role-based platform built to provide students with accessible mental health resources, anonymous community support, and direct communication with counselors and peer mentors. The application handles highly sensitive data flows with secure OTP (One-Time Password) authentication and utilizes WebSockets for real-time messaging.

### Key Features

*   Role-Based Authentication: Distinct customized portals for Students, Admins, Counsellors, and Peer Mentors.
*   Passwordless Login: Secure OTP email verification system for students (via NodeMailer & Gmail SMTP).
*   Real-time Support Chat: Live 1-on-1 messaging between students and assigned support staff using Socket.io with global inbox updates and unread counters.
*   Feelings Wall: An anonymous, moderated community board where students can share thoughts and react to others.
*   Mood Tracker & Analytics: Daily mood logging with sentiment analysis, generating dynamic visual trends using Recharts.
*   Admin Dashboard: Centralized Control Center for user management, resource oversight, and content moderation (approving/hiding flagged posts).
*   AI-Powered Assistant: A contextual chatbot (powered by Gemini API) capable of crisis escalation and personalized resource recommendations based on mood history.

## Tech Stack

Frontend Architecture:
*   React 18 (Vite)
*   React Router v6 for protected routing
*   Framer Motion (Micro-animations & transitions)
*   Recharts (Data Visualization)
*   Socket.io-client (WebSockets)

Backend Architecture:
*   Node.js & Express.js
*   MongoDB Atlas & Mongoose (ODM)
*   Socket.io (Real-time event broadcasting)
*   JSON Web Tokens (JWT) & Bcrypt.js
*   NodeMailer (Email communications)

## Quick Start (Local Setup)

To run this project locally, you will need Node.js and an active MongoDB Connection URI.

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/mindhaven.git
cd mindhaven

# Install Backend packages
cd server
npm install

# Install Frontend packages
cd ../client
npm install
```

### 2. Environment Variables
Create a .env file in the server directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DEFAULT_ADMIN_PASSWORD=admin@mindhaven123
DEFAULT_SUPPORT_PASSWORD=admin@mindhaven1234
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
GEMINI_API_KEY=your_gemini_api_key
```

Create a .env file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the Application
You can run both servers concurrently.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*(On initial startup, the backend automatically seeds the database with Admin/Support accounts and default resources).*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

## Testing Credentials (Pre-Seeded)

Once the application is running, you can test the internal role-based routing using these pre-configured accounts:

| Role | Login Route | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | `/login` | *(Any real email)* | *(Check your email for OTP)* |
| **Admin** | `/admin/login` | `admin@mindhaven.app` | `admin@mindhaven123` |
| **Counsellor** | `/support/login`| `care@mindhaven.app` | `admin@mindhaven1234` |
| **Mentor** | `/support/login`| `mentor@mindhaven.app` | `admin@mindhaven1234` |


## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
