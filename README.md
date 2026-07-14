# Mind Haven

Mind Haven is a student support platform for mood tracking, practical mental health resources, private check-ins, anonymous community posts, and support conversations.

## What is inside

The app includes a homepage, resource library, resource articles, anonymous feelings wall, student sign in, support sign in, admin sign in, student dashboard, mood tracker, assistant chat, live support chat, and admin tools for users and resources.

## Tech stack

Frontend: React 18, Vite, React Router, Framer Motion, Recharts, and Socket.io Client.

Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT authentication, Bcrypt.js, Nodemailer, and Socket.io.

## Local setup

Install dependencies in both the server and client folders. Then add the required environment variables to the server `.env` file and the client `.env` file.

The server needs the database URI, JWT secret, SMTP settings, and any optional AI keys. The client needs the API base URL and the socket URL.

Start the backend with `npm run dev` inside the server folder. Start the frontend with `npm run dev` inside the client folder.

If MongoDB and SMTP are configured correctly, student OTP login will use the live database-backed flow. If MongoDB is disconnected, the app falls back to its development flow.

## Deployment

Recommended setup:

Frontend on Vercel

Backend on Render

Set these environment variables before deploying:

Server:

`MONGODB_URI` for your Atlas connection

`JWT_SECRET` for authentication

`CLIENT_URL` for the deployed frontend URL

`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` for email delivery

Client:

`VITE_API_URL` pointing to your deployed backend, for example `https://your-backend.onrender.com/api`

`VITE_SOCKET_URL` pointing to the same backend host, for example `https://your-backend.onrender.com`

After deployment, confirm these routes respond:

`/api/health`

`/api/resources`

`/api/auth/send-otp`

`/api/auth/verify-otp`

If the frontend shows no data, the usual cause is a missing `VITE_API_URL` or a backend `CLIENT_URL` that does not match the deployed frontend domain.

## Routes

Student sign in: `/login`

Support sign in: `/support/login`

Admin sign in: `/admin/login`

## Notes

The project is designed for a calm, private, and practical student experience. It should feel like a real product, not a classroom demo.

## License

MIT
