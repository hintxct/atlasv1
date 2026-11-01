# Run ATLAS locally

In VS Code's terminal, from the `atlas` project folder, run:

```powershell
npm start
```

This starts MongoDB (if needed), the API on **5000**, and the website on **3000** in the same terminal. It ignores leftover `PORT` settings from previous PowerShell commands. No separate terminal windows open.

Wait for **Compiled successfully**, then visit **http://localhost:3000** or **http://localhost:3000/map**. Press **Ctrl+C** to stop everything started by this command. An already-running external MongoDB is left alone. `npm run dev` is an alias for the same startup.

## First run

- Node.js 18+ is required; Node.js 22 LTS is recommended.
- Dependencies are already installed in this workspace. On a fresh copy, run `npm run install-all` once.
- On Windows x64, if the local MongoDB configured in `backend\.env` is unavailable, the launcher downloads a pinned, checksum-verified MongoDB Community archive from MongoDB's official download server. Download progress is printed. Internet and sufficient disk space are needed for this first setup.
- MongoDB binds only to `127.0.0.1`. This is a **local development setup**, not a public production database.
- Database files persist in `.local\mongodb-data`. Do not delete this directory if you want to keep accounts and records.
- Existing backend environment settings are preserved. Missing database/JWT settings are generated automatically. A remote or authenticated MongoDB URI is used as configured, never replaced by a local database.
- No demo records are seeded or existing data erased automatically. On a new database, register an account; offline-only browser accounts are not migrated into MongoDB.
- Mapbox needs internet for map tiles.

## Troubleshooting

- **Port already in use:** stop the old app using Ctrl+C in its terminal and run `npm start` again. The launcher does not kill unrelated programs or silently choose another port.
- **Download/extraction failure:** read the printed error and rerun after fixing internet/disk access. Downloads resume from the saved partial archive; they do not start from zero. The first download is approximately 607 MB and prints progress. Alternatively, install MongoDB yourself or configure a reachable MongoDB URI.
- **Local database fails to start:** inspect `.local\mongodb.log`. MongoDB requires a supported Windows x64 machine and the Microsoft Visual C++ runtime.
- **Backend only:** `npm run start:api` uses the backend environment file but expects MongoDB to already be running. Root `npm start` is the recommended full-app command.

Startup regression checks: `npm run test:startup`.
Full-stack smoke check after the first MongoDB setup: `npm run test:startup:smoke`. This checks the website, registration/login, persistence across restart, and shutdown. It uses a temporary test account and removes it after success.