
```markdown
# NESSMS - Notification & SMS Service

A full-stack TypeScript-based platform for centralized alert monitoring and notification handling. Built with Node.js, Express, and React (Vite), this service continuously fetches alerts, applies business logic, and notifies relevant users via SMS or other channels.

---

## Tech Stack

### Backend
- Node.js + Express (TypeScript)
- Log4JS for logging
- dotenv for configuration
- CORS and RBAC middleware

### Frontend
- React (Vite)
- Built once and served statically from the backend

---

## Project Structure

```

NESSMS/
├── client/               # React (frontend)
│   ├── src/              # React source code
│   ├── dist/             # Vite build output (served by Express)
│   └── ...
├── src/                  # Node backend
│   ├── controllers/
│   ├── services/
│   ├── db/
│   ├── configurations/
│   └── ...
├── .env                  # Environment config
├── README.md             # You are here
└── ...

````

---

## ⚙️ Environment Variables

Create a `.env` file at the project root. Use `.env.example` as a reference:

```env
PORT=80

MSSQL_SERVER="SQLINSTANCE"
MSSQL_DATABASE="SQLDB"
MSSQL_USER="SQLUSER"
MSSQL_PASSWORD="SQLPASS"

LOG_LEVEL=INFO

SMTP_HOST=localhost
SMTP_PORT=25
SMTP_EMAIL=example@example.com

EVENTS_INTERVAL_MS=60000

````

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/OmerShlush/nessms.git
cd nessms
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Build the frontend

```bash
cd client
npm install
npm run build
cd ..
```

> This will create a `client/dist` folder that Express will serve.

### 4. Start the backend

```bash

npm start
```

---

## API Endpoints

> All routes are under `/api/v1` and protected by role-based access

| Endpoint             | Role Required | Description                       |
| -------------------- | ------------- | --------------------------------- |
| `/contact`           | admin, viewer | Manage contacts                   |
| `/policy-group`      | admin, viewer | Access policy groups              |
| `/maintenance-event` | admin, viewer | View maintenance windows          |
| `/messages-log`      | admin, viewer | View SMS/email message logs       |
| `/notification`      | admin         | Send notifications                |
| `/account`           | public        | Account authentication and access |

---

## Alert Engine (Background Poller)

After startup:

* Waits `EVENTS_INTERVAL_MS` (from `.env`)
* Polls alert DB for:

  * `newAlerts`
  * `changedAlerts`
  * `closedAlerts`
* Applies filtering based on active maintenance
* Handles and logs alerts accordingly
* Will exit on 5 consecutive processing failures

---

## Security & Middleware

* `authorizeRole()` middleware protects sensitive routes

---

## Developer Notes

* React frontend is built once using `vite build`
* Logs via `Log4JS` (`src/configurations/log4js.config.ts`)
* Background polling logic inside `handleAlertsFunction()`
* Routes defined in `src/controllers`

