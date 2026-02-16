# Real-Time Poll Rooms

A full-stack real-time polling application built with Next.js, SQLite (via `better-sqlite3`), and Socket.io.

## Features
# Real-Time Poll Rooms 🗳️

A full-stack, real-time polling application built for the **TruEstate** assignment.

**Live Demo:** [Insert Your Render/Tunnel Link Here]

## 🛡️ Fairness & Anti-Abuse Mechanisms
We implemented a multi-layered approach to prevent spam and ensure one person = one vote (as much as possible without login).

1.  **Database-Level IP Tracking (Server-Side)**
    *   **How it works:** Every vote record in the Postgres database stores the `voterIp`.
    *   **Enforcement:** A strict `@@unique([pollId, voterIp])` constraint in the Prisma schema prevents the database from accepting a second vote from the same IP for the same poll.
    *   **Why:** This is the strongest check; even if a user clears their browser cache, the server rejects them.

2.  **Browser Identity (Client-Side)**
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

## 🚀 Known Limitations & Future Improvements
1.  **IP Limitations:** Users on the same WiFi network (e.g., a university dorm) might share an IP and be blocked.
    *   *Improvement:* Implement a fingerprinting library (like FingerprintJS) for more granular device ID without logins.
2.  **Real-Time Scaling:** Currently uses a single WebSocket server.
    *   *Improvement:* For millions of users, we would need a Redis Adapter for Socket.io to scale across multiple server instances.
3.  **Persistence:** While we use a real database (Postgres), the current "guest" mode means users can't delete their own polls later.
    *   *Improvement:* Add optional "Admin Links" or simple passwords to manage polls.

## 🛠️ Tech Stack
*   **Frontend:** Next.js 15 (App Router), Tailwind CSS, Framer Motion (animations).
*   **Backend:** Custom Node.js Server + Socket.io (Real-time).
*   **Database:** PostgreSQL (via Neon) + Prisma ORM.

## 📦 How to Run Locally

1.  **Clone the repo:**
    ```bash
    git clone <repository_url>
    cd project1
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment:**
    Create a `.env` file with your Database URL:
    ```env
    DATABASE_URL="postgresql://user:pass@host/db"
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

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Prisma ORM (SQLite for Dev, PostgreSQL for Prod)
- **Real-Time:** Socket.io + Custom Node Server
- **Styling:** Tailwind CSS + Glassmorphism UI
- **Font:** Outfit (Google Fonts)

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd project1
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Initialize the Database:**
    Run the setup script to create the SQLite database file (`data.db`) and tables.
    ```bash
    node scripts/setup-db.js
    ```

4.  **Run Development Server:**
    Start the custom server (which handles both Next.js and Socket.io):
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## Deployment

To deploy this application, you need a host that supports long-running Node.js processes (due to the custom WebSocket server), such as:
- **Render** (as a Web Service)
- **Railway**
- **DigitalOcean App Platform** or **VPS**
- **Heroku**

**Note:** Vercel does not support custom servers or long-running WebSocket processes on the default deployment. You would need to separate the Socket.io server if deploying to Vercel, or use a managed service like Pusher. For this assignment, a VPS/Render deployment is recommended.

**Build for Production:**
```bash
npm run build
npm start
```

## Fairness Mechanisms Details

1.  **Server-Side IP Check:**
    - Each vote request captures the client's IP address (handling `x-forwarded-for` headers).
    - The database enforces a `UNIQUE(pollId, voterIp)` constraint.
    - If an IP tries to vote again on the same poll, the server rejects it with a 403 error.

2.  **Client-Side LocalStorage:**
    - When a user votes, a flag `poll_voted_{pollId}` is set in `localStorage`.
    - The UI checks this flag to immediately show results instead of the voting options, improving user experience and reducing unnecessary API calls.

## Edge Cases Handled

- **Poll Not Found:** Users visiting invalid links get a clear 404 error.
- **Double Voting:**
    - Frontend disables the vote button after voting.
    - Backend rejects duplicate votes from the same IP.
    - Database constraints ensure data integrity even with race conditions.
- **Input Validation:**
    - Creation form requires a question and at least 2 non-empty options.
- **Real-Time Reconnection:**
    - Socket.io automatically attempts to reconnect if the connection triggers a disconnect.

## Known Limitations & Improvements

-   **IP-Based Fairness:** Users behind a shared NAT (like an office or school) might be blocked after the first person votes. *Improvement:* Use a cookie-based session token or user authentication.
-   **SQLite Scaling:** SQLite works great for small-to-medium traffic but isn't designed for massive concurrent writes in a serverless environment. *Improvement:* Switch to PostgreSQL (change `lib/db.ts` to use `pg` or Prisma with Postgres).
-   **WebSocket Scalability:** The current in-memory Socket.io adapter works for a single server instance. *Improvement:* Use Redis Adapter for Socket.io to scale across multiple server instances.
