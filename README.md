# ATLAS — Smart Logistics & Route Intelligence Platform

**ATLAS** is a full-stack logistics coordination, route planning, and road disruption monitoring platform tailored for the terrain and connectivity needs of **North-East India** (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, and Sikkim).

It combines interactive GIS mapping, real-time place search and driving directions, weather-aware corridor risk scoring, roadside incident reporting, and role-based operational dashboards in one unified web platform.

---

## Key Features

- **Public Interactive Map & Journey Planner (`/map`)**
  - Interactive Leaflet + Mapbox map covering all 8 North-Eastern states.
  - Real-time place autocomplete (Mapbox Geocoding) and turn-by-turn driving directions (Mapbox Directions) with route distance, duration, and elevation/hazard overlays.
  - Live convoy tracking markers, active road blockages, weather risk overlays, and corridor risk comparisons (Balanced, Fastest, Lowest Risk, Avoid Flood/Landslide).
- **Role-Based Workspaces**
  - **Driver (`/driver/dashboard`)** — View assigned deliveries, inspect recommended and alternate routes, track progress, and submit roadside blockage reports.
  - **Field Official (`/official/dashboard`)** — Submit geo-tagged blockage/clearance reports with severity and agency assignment, verify field incidents, and escalate emergencies.
  - **District Admin (`/admin/dashboard`)** — Create and dispatch deliveries, monitor active convoys, reroute delayed vehicles, verify blockage reports, and approve user accounts.
  - **State Admin (`/state/dashboard`)** — Monitor state-wide connectivity across the North-East, review analytics, and manage regional emergency alerts.
- **Real-Time Updates & Offline Demo Support**
  - **Socket.IO** event channels for live vehicle GPS updates, new blockage alerts, and route recalculations.
  - Built-in one-click demo preview accounts on `/login` so all four role dashboards can be explored even when offline.
- **One-Command Local Startup**
  - `npm start` automatically launches local MongoDB (if needed), the Express API server (`:5000`), and the React client (`:3000`) in a single terminal.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Framer Motion, Leaflet & React-Leaflet, Recharts, Lucide Icons, Socket.IO Client |
| **Mapping & Routing** | OpenStreetMap / Mapbox Tiles, Mapbox Geocoding API, Mapbox Directions API |
| **Backend** | Node.js, Express, MongoDB & Mongoose, Socket.IO, JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `helmet` |
| **Tooling & Testing** | Node built-in test runner, Headless Edge CDP browser verification (`scripts/check-login-routing.cjs`), automated local MongoDB runner (`scripts/local-mongo.js`) |

---

## Project Structure

```text
├── backend/
│   ├── config/             # MongoDB connection setup
│   ├── controllers/        # Auth, User, Delivery, and Blockage controllers
│   ├── middleware/         # JWT authentication, role guards, and file upload (Multer)
│   ├── models/             # Mongoose schemas (User, Delivery, Blockage, Route)
│   ├── routes/             # Express REST API routes
│   ├── scripts/            # Database seed script (seedData.js)
│   ├── services/           # Route scoring engine & OpenWeatherMap service
│   ├── websocket/          # Socket.IO real-time event handlers
│   └── server.js           # API entry point (Port 5000)
├── frontend/
│   ├── public/             # Static assets & HTML template
│   └── src/
│       ├── components/     # MapboxLayer, JourneyMap, JourneyPlanner, PlaceSearch, UI shells
│       ├── context/        # AuthContext (JWT + offline demo sessions)
│       ├── data/           # Regional sample dataset & corridor telemetry
│       ├── pages/          # Public pages & role-specific dashboards (driver, official, admin, state)
│       ├── services/       # Axios API client, Mapbox service, Socket.IO client
│       └── utils/          # Formatting and helper utilities
├── scripts/
│   ├── start.js            # Unified launcher (MongoDB + Backend + Frontend)
│   ├── local-mongo.js      # Local MongoDB provisioner & runner
│   ├── start.test.js       # Startup regression tests
│   └── start.smoke.js      # Full-stack smoke test
├── RUNNING.md              # Detailed local execution & troubleshooting guide
└── API_INTEGRATIONS_TODO.md# Production API & deployment checklist
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** (Node.js 22 LTS recommended)
- **MongoDB** (optional — on Windows x64, `npm start` automatically provisions a local MongoDB instance under `.local/` if none is running)

### 1. Install Dependencies

From the project root:

```bash
npm run install-all
```

### 2. Configure Environment Variables

1. **Backend (`backend/.env`)**:
   Copy `backend/.env.example` to `backend/.env` (or let `npm start` generate defaults automatically):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/ne-logistics
   JWT_SECRET=your-secret-jwt-key
   WEATHER_API_KEY=your-openweathermap-api-key
   SOCKET_CORS_ORIGIN=http://localhost:3000
   ```
2. **Frontend (`frontend/.env.local`)** *(optional, for live Mapbox place search & turn-by-turn routing)*:
   ```env
   REACT_APP_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token
   ```

### 3. Run the Application

```bash
npm start
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Live Map:** [http://localhost:3000/map](http://localhost:3000/map)
- **Backend API:** [http://localhost:5000](http://localhost:5000) (`GET /api/health`)

---

## Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new Driver, Field Official, District Admin, or State Admin |
| `POST` | `/api/auth/login` | Authenticate user and receive a JWT |
| `GET` | `/api/auth/me` | Fetch current authenticated user profile |
| `GET` | `/api/deliveries` | List deliveries (filtered by role/status) |
| `POST` | `/api/deliveries` | Create a new delivery and calculate route options |
| `PUT` | `/api/deliveries/:id/accept` | Driver accepts an available delivery |
| `PUT` | `/api/deliveries/:id/location` | Update live vehicle GPS coordinates |
| `GET` | `/api/blockages` | List active and historical road blockages |
| `POST` | `/api/blockages` | Submit a geo-tagged road blockage report |
| `PUT` | `/api/blockages/:id/verify` | Verify or update blockage status |
| `GET` | `/api/users` | Admin user management & account approval endpoints |

---

## Testing

```bash
# Run startup unit tests
npm run test:startup

# Run full-stack smoke test (verifies web build, API auth, DB persistence, and shutdown)
npm run test:startup:smoke
```

---

## License

MIT
