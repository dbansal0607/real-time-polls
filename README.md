# 🚀Real-Time Poll Rooms

A full-stack, production-ready real-time polling application built for the Real-Time Poll Rooms Assignment.

**🌍 Live Demo:** https://real-time-polls-70g4.onrender.com/

## 📌Overview

Real-Time Poll Rooms is a web application that enables:

- Instant poll creation
- Shareable unique poll URLs
- Real-time vote updates using WebSockets
- Persistent data storage with Prisma + PostgreSQL
- Clean, responsive UI with dark theme support

The application is deployed in production using Render and connected to a live PostgreSQL database.

## 🏗️ Architecture Overview

- User creates poll → Saved via /api/polls
- Poll page joins Socket.io room (join-room)
- User votes → /api/vote
- Vote stored in DB inside transaction
- Server emits update event
- All connected clients receive live results

This ensures synchronized real-time updates across devices.

## 🛠️ Tech Stack
*   **Frontend:** Next.js 15 (App Router),React 19, Tailwind CSS, Lucid Icons, next-theme(dark support).
*   **Backend:** Custom Node.js Server + Socket.io (Real-time).
*   **Database:** PostgreSQL (via Neon) + Prisma ORM.
*   **Deployment:** Render Web Service, Managed PostgreSQL, Production Prisma migrations.

## 🛡️ Fairness & Anti-Abuse Mechanisms
To ensure integrity without requiring user authentication, we implemented a multi-layered fairness system.
1.  **Database-Level IP Tracking (Server-Side)**
    *  Every vote stores the voterIp in the PostgreSQL database.
    *   **Enforcement:** A strict `@@unique([pollId, voterIp])` constraint in the Prisma schema prevents the database from accepting a second vote from the same IP for the same poll.
    *   **Why:** This is the strongest check; even if a user clears their browser cache, the server rejects them.

2.  **Browser-Level Vote Lock (Client-Side Enforcement)**
    *   **How it works:** We store a `poll_voted_{id}` flag in `localStorage` upon voting.
    *   **UI Enforcement:** The UI immediately switches to the "Results View" and disables the vote buttons if this flag exists.
    *   **Why:** Provides instant feedback and prevents accidental double-clicking.

## 🧪 Edge Cases Handled
1.  **Concurrency (Race Conditions):** Used **Prisma Transactions** (`$transaction`) to ensure that updating the vote count and recording the voter's IP happens atomically. This prevents vote count drift during high traffic.
2.  **Share Link Validity:** If a user visits a non-existent poll ID (e.g., `/poll/invalid-id`), we catch the 404 error and show a custom "Poll Not Found" UI instead of crashing.
3.  **Input Validation:**
    *   Prevents creating polls with empty questions.
    *   Start with fewer than 2 options? The UI blocks it.
    *   Empty options are filtered out automatically.
4.  **Network Disconnects:** The `Socket.io` client automatically handles reconnection. If the socket drops, the UI shows a visible "Connecting..." indicator.


## 📦 How to Run Locally

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/dbansal0607/real-time-polls.git
    cd real-time-polls
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment:**
    Create a `.env` file with your Database URL:
    ```env
    DATABASE_URL="your_postgresql_connection_string"
    ```

4.  **Run Migrations:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Start Server:**
    ```bash
    npm run dev
    ```

---

## 🚀 Production Deployment
The application is deployed on Render:

- Web Service
- Managed PostgreSQL Database
- Automatic redeploy on GitHub push
- Prisma migrations applied on production start

## 🎯 Design Decisions

- Used Next.js App Router for modern routing.
- Used Socket.IO for real-time scalability.
- Used Prisma for clean database abstraction.
- Implemented poll-specific socket rooms for efficiency.
- Designed UI with clarity and usability in mind.
- Focused on correctness, stability, and edge-case handling.

## 🚀 Known Limitations & Future Improvements
1.  **IP Limitations:** Users on the same WiFi network (e.g., a university dorm) might share an IP and be blocked.
    *   *Improvement:* Implement a fingerprinting library (like FingerprintJS) for more granular device ID without logins.
2.  **Real-Time Scaling:** Currently uses a single WebSocket server.
    *   *Improvement:* For millions of users, we would need a Redis Adapter for Socket.io to scale across multiple server instances.
3.  **Persistence:** While we use a real database (Postgres), the current "guest" mode means users can't delete their own polls later.
    *   *Improvement:* Add optional "Admin Links" or simple passwords to manage polls.

## 👨‍💻 Author

Dhruv Bansal | Electrical & Electronics Engineering Student

Full-Stack & AI Enthusiast


