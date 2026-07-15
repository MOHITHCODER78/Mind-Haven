# Mind Haven

A full-stack mental health support platform designed for students. It provides authenticated access to mood tracking, curated mental health resources, an anonymous community wall, AI-assisted wellness guidance, and real-time support chat. The application separates concerns into student, support staff (counsellors and peer mentors), and admin roles, each with dedicated workflows and access controls.

The project demonstrates production-grade patterns including JWT authentication with refresh tokens, rate limiting, input sanitization, CORS configuration, and email-based OTP verification. It is deployed as a modern SPA with Express.js REST APIs and Socket.io for live communication.

## Problem Statement

Students face barriers accessing mental health support due to stigma, long wait times for counselling services, and fragmented resources. Existing solutions often lack privacy, are difficult to navigate, or do not provide immediate assistance. There is a need for a unified, private, and accessible platform that allows students to track their mood, access curated resources, express feelings anonymously, and receive timely support from peers or professionals without administrative friction.

## Solution Overview

Mind Haven centralizes mental health support into a single authenticated workspace. Students sign in via email OTP, which removes the need to remember passwords while maintaining account security. Once authenticated, they can log moods, read evidence-based resources, post anonymously to a community wall, chat with support staff in real time, and interact with an AI assistant for immediate coping strategies.

Support staff access a separate portal to monitor wall posts, manage resources, and provide live chat assistance. Admins oversee platform analytics, user management, and content moderation. The architecture uses MongoDB for flexible document storage, Express.js for stateless APIs, and React with lazy-loaded routes for a responsive frontend experience.

## Key Features

### User Authentication
Email-based one-time password (OTP) authentication eliminates password management overhead. The system generates a six-digit code, stores a hashed version in MongoDB with a ten-minute expiry, and delivers it via SMTP. Users enter the code to create or access their account. A refresh token mechanism maintains sessions without repeated OTP requests.

### OTP Verification
The OTP flow includes cooldown periods, maximum attempt limits, and automatic cleanup of expired codes. If email delivery fails, the system displays a development preview code on-screen so testing can continue. In production, SMTP credentials deliver codes to user inboxes.

### Student Dashboard
Authenticated students access a private dashboard showing their mood history, recommended resources, quick actions, and recent activity. The dashboard aggregates data from multiple collections and presents it through charts and summary cards.

### Mood Tracker
Students log daily mood entries with optional notes. The tracker stores timestamps and mood values, then visualizes trends over time using chart components. This data helps students and support staff identify patterns and intervene early.

### AI Assistant
An AI-powered assistant provides immediate, context-aware wellness guidance. The frontend sends user messages to the backend, which forwards them to an AI provider (OpenAI or Gemini) with appropriate safety guardrails. Responses stream back to the chat interface.

### Mental Health Resources
A curated library of mental health articles and guides. Resources are categorized by topic, searchable, and filterable. Each resource contains structured content including titles, descriptions, body text, and metadata for display in both list and detail views.

### Resource Articles
Individual resource pages render full content with formatted typography, related resources, and bookmarking capability. The routing system uses URL parameters to fetch and display the correct article.

### Anonymous Feelings Wall
A community space where students can post thoughts and experiences without revealing their identity. Posts support text content, timestamps, and moderation status. Admins and support staff can review and update post status from the admin panel.

### Community Features
The wall includes status management (pending, approved, rejected), visibility controls, and basic interaction metrics. Users see only approved posts by default, while staff see all submissions for moderation.

### Real-Time Chat
Authenticated users can join support chat rooms using Socket.io. The system handles room-based messaging, presence tracking, and automatic connection management. Messages persist in MongoDB for history retrieval.

### Admin Dashboard
Admins access platform-wide statistics including user counts, mood entry volumes, wall post activity, and resource engagement metrics. The dashboard uses chart visualizations to surface trends and potential concerns.

### User Management
Admins can view all registered users, inspect their roles and activity, and manage account status. The user table includes search, filtering by role, and direct links to user-specific data.

### Resource Management
Admins can create, edit, and deactivate resources. The management interface supports form validation, preview rendering, and status toggling without requiring frontend redeployment.

### Notifications
The system provides real-time notifications for chat messages, wall post approvals, and admin actions. Notifications use the existing Socket.io connection where available and fall back to polling for general updates.

### Responsive Design
The frontend uses a mobile-first CSS architecture with breakpoints for tablet and desktop. Components adapt layout, typography, and navigation patterns based on viewport width. The design system emphasizes readability, calm color palettes, and accessible contrast ratios.

### Security Features
The backend applies Helmet security headers, rate limiting per IP, CORS origin validation, MongoDB input sanitization, and JWT expiration with refresh rotation. Passwords are hashed with bcrypt before storage. Sensitive routes require role-based authorization middleware.

## Technology Stack

### Frontend
React 19 with functional components and hooks. Vite for development and bundling. React Router v7 for client-side routing with lazy-loaded routes. Framer Motion for page transitions and micro-interactions. Recharts for mood and analytics visualizations. Socket.io client for real-time chat. Axios for HTTP requests with interceptors handling token refresh.

### Backend
Node.js with Express.js framework. Mongoose for MongoDB object modeling. JWT for stateless authentication. Nodemailer for SMTP-based email delivery. Socket.io for bidirectional real-time communication. Express Validator for request schema validation. Morgan for HTTP request logging.

### Database
MongoDB Atlas as the hosted database service. Collections include users, OTP entries, mood logs, wall posts, chat messages, and refresh tokens. Indexes optimize common query patterns for email lookups and timestamp sorting.

### Authentication
JWT access tokens with short expiration and httpOnly refresh tokens stored in cookies. OTP-based login eliminates passwords for students. Staff and admin accounts use password authentication with bcrypt hashing. Role-based access control enforces permissions at the route level.

### Real-Time Communication
Socket.io manages chat room membership, message broadcasting, and connection state. The server authenticates socket handshakes using JWT cookies. Presence events update user status in real time.

### Deployment
Frontend deployed to Vercel with environment variables for API configuration. Backend deployed to Render with automatic restarts and health checks. MongoDB Atlas provides managed database hosting.

### Development Tools
Nodemon watches file changes during local backend development. ESLint enforces code style. Git tracks changes with conventional commit messages. Environment variables are loaded via dotenv.

## Architecture

### Frontend
The React app lives in `client/` and uses a component-based architecture. Pages are lazy-loaded to reduce initial bundle size. The `MainLayout` component wraps authenticated and public routes with consistent navigation and footers. Protected route components enforce authentication state before rendering child routes.

### Backend
The Express app lives in `server/src/` and follows a layered architecture. `app.js` configures middleware and mounts the API router. Route files delegate to controller functions, which contain business logic. Models define MongoDB schemas and instance methods. Middleware handles authentication, authorization, rate limiting, and error formatting.

### Database
Mongoose models represent core entities: User, Otp, MoodLog, WallPost, ChatMessage, and RefreshToken. Each model includes schema-level validation and relevant indexes. The application connects at startup and reuses the connection across route handlers.

### Authentication Flow
Students request an OTP by submitting their email. The backend generates a random six-digit code, hashes it, stores the hash with expiry metadata, and sends the plaintext code via email. The user submits the code, the backend hashes it and compares with the stored hash, then issues JWT access and refresh tokens. Subsequent requests include the access token in the Authorization header. When the access token expires, the client sends the refresh token to obtain a new pair.

### Socket Communication
Clients connect to the Socket.io server and provide their JWT during the handshake. The server validates the token and attaches the user ID to the socket session. Clients join chat rooms based on their role or conversation ID. Messages are persisted to MongoDB and broadcast to room participants.

### API Layer
All API routes are mounted under `/api`. The route registry in `server/src/routes/index.js` groups endpoints by domain: auth, resources, moods, wall, chat, assistant, admin, and legal. Each route file imports its corresponding controller and applies domain-specific middleware like validation or authorization.

## Folder Structure

```
f:/MHP2/
├── client/                      # React frontend
│   ├── public/                  # Static assets (images, favicons)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── admin/           # Admin-specific components
│   │   │   ├── auth/            # Auth guards and route wrappers
│   │   │   └── shared/          # Cross-cutting components (loaders, error boundaries)
│   │   ├── context/             # React Context providers (auth state)
│   │   ├── data/                # Static data and asset mappings
│   │   ├── pages/               # Route-level page components
│   │   ├── services/            # API client and external service wrappers
│   │   ├── styles/              # Global CSS and theming
│   │   ├── App.jsx              # Root component with route definitions
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── controllers/         # Route handlers and business logic
│   │   ├── middleware/          # Express middleware (auth, errors, rate limiting)
│   │   ├── models/              # Mongoose schemas and models
│   │   ├── routes/              # Route definitions and grouping
│   │   ├── utils/               # Helpers (email, tokens, sanitization, validation)
│   │   ├── app.js               # Express app configuration
│   │   └── server.js            # HTTP server and Socket.io setup
│   ├── .env.example             # Environment variable template
│   ├── package.json
│   └── test_smtp_debug.js       # SMTP diagnostic script
│
└── README.md
```

**Major folders explained:**

- `client/src/pages/` contains one component per URL route, implementing the full UI for each user-facing screen.
- `client/src/components/` holds reusable building blocks used across multiple pages, including layout wrappers and authentication guards.
- `server/src/controllers/` houses the primary business logic for each feature domain.
- `server/src/models/` defines the data layer with Mongoose schemas, validation rules, and instance methods.
- `server/src/middleware/` implements cross-cutting concerns such as JWT verification, role-based access, rate limiting, and error formatting.
- `server/src/utils/` contains stateless helpers for email delivery, token generation, input sanitization, and environment validation.

## Installation

### Prerequisites
- Node.js 18 or later
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- SMTP credentials (Gmail App Password or Brevo account)

### Clone Repository
```bash
git clone https://github.com/MOHITHCODER78/Mind-Haven.git
cd Mind-Haven
```

### Install Dependencies
```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Environment Variables

Create `server/.env` based on `server/.env.example`. Set the following variables:

```
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/mindhaven?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-jwt-secret-minimum-32-characters

# Admin Accounts (created automatically on startup)
DEFAULT_ADMIN_PASSWORD=secure-password
DEFAULT_SUPPORT_PASSWORD=secure-password

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Run Locally

Terminal 1 - Backend:
```bash
npm run dev --prefix server
```

Terminal 2 - Frontend:
```bash
npm run dev --prefix client
```

Visit `http://localhost:5173` and navigate to `/login` to test the application.

## Environment Variables

### Server Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PORT` | Backend listen port. Defaults to 5000. | No |
| `NODE_ENV` | Environment mode. Render sets this automatically in production. | No |
| `CLIENT_URL` | Origin allowed for CORS and cookie setting. Must match deployed frontend URL in production. | Yes |
| `MONGODB_URI` | MongoDB connection string. Supports Atlas SRV format. | Yes |
| `JWT_SECRET` | Secret key for signing access tokens. Use a long random string in production. | Yes |
| `SMTP_HOST` | SMTP relay hostname. Use `smtp.gmail.com` for Gmail or `smtp-relay.brevo.com` for Brevo. | Yes |
| `SMTP_PORT` | SMTP port. Typically 587 for STARTTLS or 465 for SSL. | Yes |
| `SMTP_USER` | SMTP authentication username. Often the sender email address. | Yes |
| `SMTP_PASS` | SMTP password or app-specific password. | Yes |
| `SMTP_FROM` | Sender email address displayed in the recipient inbox. | Yes |
| `BREVO_API_KEY` | Optional. Brevo HTTP API key. Used only if SMTP variables are absent or SMTP fails. | No |
| `DEFAULT_ADMIN_PASSWORD` | Password for the default admin account `admin@mindhaven.app`. | Yes |
| `DEFAULT_SUPPORT_PASSWORD` | Password for default support accounts `care@mindhaven.app` and `mentor@mindhaven.app`. | Yes |
| `OPENAI_API_KEY` | Optional. Key for OpenAI assistant integration. | No |
| `GEMINI_API_KEY` | Optional. Key for Google Gemini assistant integration. | No |
| `OPENAI_MODEL` | Optional. Model identifier for OpenAI requests. | No |
| `GEMINI_MODEL` | Optional. Model identifier for Gemini requests. | No |

### Client Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_API_URL` | Backend origin. Example: `https://mind-haven-api-7yq7.onrender.com`. Do not append `/api`. | Yes (production) |
| `VITE_SOCKET_URL` | Backend Socket.io origin. Usually the same as `VITE_API_URL`. | Yes (production) |

## API Overview

### Authentication
- `POST /api/auth/send-otp` - Request OTP code for email
- `POST /api/auth/verify-otp` - Verify OTP and receive tokens
- `POST /api/auth/admin/login` - Staff/admin password login
- `POST /api/auth/support/login` - Support staff password login
- `POST /api/auth/refresh-token` - Refresh access token via cookie
- `POST /api/auth/logout` - Clear refresh token cookie
- `GET /api/auth/me` - Retrieve current authenticated user

### Resources
- `GET /api/resources` - List all approved resources
- `GET /api/resources/:id` - Fetch single resource details
- `GET /api/resources/recommendations` - Personalized resource suggestions

### Mood
- `GET /api/moods` - Fetch current user mood entries
- `POST /api/moods` - Create new mood entry
- `GET /api/moods/summary` - Aggregated mood statistics

### Wall
- `GET /api/wall` - List approved anonymous posts
- `POST /api/wall` - Create anonymous post
- `PATCH /api/wall/:id/status` - Admin-only status update

### Chat
- `GET /api/chat/conversations` - List user conversations
- `GET /api/chat/messages/:conversationId` - Fetch message history
- `POST /api/chat/send` - Send message via Socket.io

### Assistant
- `POST /api/assistant/respond` - Send message to AI assistant and receive response

### Admin
- `GET /api/admin/overview` - Platform statistics
- `GET /api/admin/users` - User list with filters
- `GET /api/admin/resources` - Resource management view
- `PATCH /api/admin/wall/:id/status` - Moderate wall post

## Authentication Flow

### Registration
Students enter their name and email on the login page. The system sends a six-digit OTP to the provided email address. If the email does not exist in the database, a new user record is created with `isVerified: false`. If the email already exists, the system links the OTP to the existing record.

### OTP
The backend generates a random six-digit numeric code and stores its SHA-256 hash alongside an expiration timestamp and a last-sent timestamp. A cooldown period of sixty seconds prevents duplicate requests. The user has five attempts to enter the correct code before it is invalidated. On success, the user record is marked as verified and JWTs are issued.

### JWT
Access tokens contain the user ID, name, email, and role. They expire after a short duration. Refresh tokens are stored in MongoDB and sent as httpOnly cookies. When the access token expires, the client automatically requests a new pair using the refresh endpoint. This flow keeps the frontend stateless while maintaining secure session persistence.

### Protected Routes
The frontend wraps authenticated routes with `ProtectedRoute` or `StudentRoute` components that verify token presence and redirect to login if absent. The backend applies `protect` middleware to all `/api/*` routes except health checks and authentication endpoints. The `authorize` middleware enforces role-specific access.

### Logout
Clients call `/api/auth/logout` to delete the refresh token from the database and clear the cookie. The frontend also removes the access token from local storage and resets authentication state.

## Screens

### Home
Public landing page introducing the platform, its purpose, and call-to-action buttons for student and support sign-in.

### Resources
Paginated list of approved mental health articles with search, category filters, and preview cards linking to detail pages.

### Resource Article
Full content view for a single resource with formatted text, metadata, and related resource suggestions.

### Mood Tracker
Interactive form and history view for logging daily mood. Includes chart visualization of mood trends over selectable date ranges.

### Feelings Wall
Anonymous community feed displaying approved posts in reverse chronological order. Supports pagination and status-aware rendering.

### AI Assistant
Chat interface for conversing with the AI wellness assistant. Includes message history, loading states, and disclaimer text.

### Chat
Real-time support chat room with message history, presence indicators, and auto-scroll to latest message.

### Dashboard
Student overview showing mood summary, recommended resources, quick links to mood tracker and assistant, and recent notifications.

### Admin Dashboard
Statistics overview with user counts, mood entry volumes, wall post counts, and resource engagement metrics rendered in charts.

### Admin Users
User management table with search, role filtering, and detail inspection for individual accounts.

### Admin Resources
Resource management interface for creating, editing, and toggling resource availability.

### Login
Email and OTP entry form for student authentication. Shows development preview code when email delivery is unavailable.

### Support Login
Password-based login for counsellors and peer mentors using predefined staff accounts.

### Admin Login
Password-based login restricted to admin role accounts.

### Privacy Policy and Terms of Service
Static pages outlining data handling, user responsibilities, and platform terms.

## Security

### JWT
Access tokens are signed with a server-side secret and contain embedded expiry. Refresh tokens are stored hashed in MongoDB and delivered via httpOnly SameSite cookies to prevent XSS theft. Token rotation is not implemented; consider adding it if exposure risk increases.

### Password Hashing
Staff and admin passwords are hashed using bcrypt with a cost factor of ten before persistence. The application never stores or transmits plaintext passwords.

### Input Validation
Express Validator checks request payloads for required fields, types, and formats. The XSS library sanitizes user-generated content before storage and rendering. Mongoose schema validation enforces constraints at the database layer.

### Helmet
Security headers are applied via the Helmet middleware, including content security policy, X-Frame-Options, and referrer policy settings appropriate for a single-page application.

### CORS
The server allows explicit origins configured in `app.js`. In production, only the deployed frontend URL and admin domains are permitted. Development origins are included for local testing.

### Rate Limiting
General rate limiting caps repeated requests per IP window. Auth routes have tighter limits to prevent OTP brute-forcing. The 404 handler preserves rate limiting for unknown routes to reduce attack surface.

### Environment Variables
Secrets are loaded from `server/.env`, which is excluded from version control. The validation utility checks for required variables on startup and warns about weak secrets.

## Performance

### Lazy Loading
The frontend uses `React.lazy` and `Suspense` to split code by route. Pages load only when the user navigates to them, reducing initial bundle size and time to interactive.

### Code Splitting
Vite automatically chunks vendor dependencies and route-specific code. The build configuration includes a chunk size warning limit of 1600 KB to alert when bundles grow unexpectedly.

### Optimized API Calls
Axios is configured with a base URL and request interceptor that injects the access token. The response interceptor handles 401 errors by attempting a token refresh before rejecting, reducing unnecessary login redirects.

### Efficient Rendering
Framer Motion animations are scoped to route transitions and component entrance. The `AnimatePresence` component manages exit animations without blocking navigation. Memoization is applied to resource lists and chart data to avoid redundant recalculations.

## Accessibility

The frontend uses semantic HTML elements, labeled form fields, and keyboard-navigable controls. Color contrast meets WCAG AA standards for primary text and interactive elements. Focus management is handled by React Router during page transitions. The AnimatePresence component respects reduced motion preferences where implemented.

## Future Improvements

- Implement token rotation and reuse detection for refresh tokens
- Add comprehensive automated test suite (unit and integration)
- Introduce email template management in admin panel
- Add push notification support for mobile platforms
- Implement mood entry export in PDF and CSV formats
- Add multi-language support for regional user bases
- Integrate crisis resource directory with geolocation-based services
- Add dark mode toggle and user theme preferences
- Implement resource bookmarking and reading progress tracking
- Add audit logging for admin actions

## Development

### Coding Standards
- Use ESLint configuration provided in `client/eslint.config.js`
- Follow existing patterns for route and controller organization
- Keep controllers focused on single domains
- Use async/await for all asynchronous operations
- Handle errors with the centralized error middleware

### Branch Strategy
- `main` is the protected production branch
- Feature work should be developed in dedicated branches
- Commit messages should be concise and descriptive

## License

MIT

## Author

Mind Haven is developed by Mohith Naidu.

- GitHub: https://github.com/MOHITHCODER78
- Repository: https://github.com/MOHITHCODER78/Mind-Haven