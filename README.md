# Airport Runway & Flight Operations Simulator

A full-stack web application simulating airport flight requests, takeoff and landing queues, runway availability, scheduling algorithms, memory allocation, and operational analytics.

---

## 1. System Architecture

The application enforces a clean separation of concerns with the backend as the single source of truth for all simulation states, schedules, memory states, and operational records.

```
Airport-Runway-Simulator/
├── backend/
│   ├── app/
│   │   ├── algorithms/       # FCFS, Priority, Round Robin, Memory Fit
│   │   ├── api/v1/           # REST API endpoints (Flights, Runways, Scheduling, etc.)
│   │   ├── core/             # Configuration & environment settings
│   │   ├── db/               # SQLAlchemy engine & SQLite session
│   │   ├── models/           # Database entities (Flight, Runway, Operation, Log, etc.)
│   │   ├── schemas/          # Pydantic schemas for request validation & serialization
│   │   ├── services/         # Business logic layer
│   │   └── simulation/       # Discrete-event simulation clock & runway engine
│   ├── requirements.txt      # Backend dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Navigation, StatusBadge, GanttChart, MemoryMap
│   │   ├── pages/            # 8 dedicated operational modules
│   │   ├── services/         # Fetch API client services
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main application state orchestration
│   │   └── main.tsx          # React application root
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # Tailwind styling configuration
│   └── .env.example          # Frontend API base URL template
└── README.md
```

### Technology Stack
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts

---

## 2. Core Functional Modules

1. **Airport Operations Overview**: Real-time runway status cards, waiting queue inspector, live simulation clock ticker, and quick controls.
2. **Flight Management**: Complete flight lifecycle (SCHEDULED, WAITING, ON_RUNWAY, COMPLETED, CANCELLED), search, multi-field filtering, and add/edit modals.
3. **Runway Control**: Multi-runway allocation, maintenance mode toggling with safety protections preventing disabling occupied runways.
4. **Scheduling Laboratory**: Benchmarking FCFS, Non-Preemptive Priority Scheduling with emergency overrides, and Round Robin time-slicing with visual Gantt chart timelines.
5. **Memory Management Simulator**: 1024 KB memory pool with variable partition allocation executing First Fit, Best Fit, and Worst Fit, hole coalescing, and external fragmentation monitoring.
6. **Flight Logs & Reports**: Persistent SQLite audit trail of all operational events and one-click RFC 4180 CSV export.
7. **Performance Analytics**: Recharts visual graphs displaying mean waiting times, turnaround latencies, throughput rates, and runway saturation.
8. **System Settings**: Configurable runway channels, default algorithms, time quantum, and simulation speeds.

---

## 3. Local Development & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js v18+ and npm v9+

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the project directory:
   ```bash
   cd "Airport Runway & Flight Operations Simulator"
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv backend/venv
     .\backend\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv backend/venv
     source backend/venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Create the environment file:
   - **Windows (PowerShell)**:
     ```powershell
     Copy-Item backend/.env.example backend/.env
     ```
   - **Linux / macOS**:
     ```bash
     cp backend/.env.example backend/.env
     ```

5. Start the backend server on your preferred port (e.g. 5000 or 3000):
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
   ```
   The backend API will be available at `http://localhost:5000`.
   Interactive Swagger documentation is available at `http://localhost:5000/docs`.

---

### Step 2: Frontend Setup

1. Open a second terminal window and navigate to the `frontend` directory:
   ```bash
   cd "Airport Runway & Flight Operations Simulator/frontend"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the frontend environment configuration:
   - **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Linux / macOS**:
     ```bash
     cp .env.example .env
     ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Step 3: Load Sample Workload

In the web interface:
1. Click the **Sample Data** button in the top navigation bar.
2. Confirm loading the standard dataset.
3. The backend will initialize 8 realistic flights (takeoffs, landings, varied durations, priority levels 1-4, and an emergency flight) and 3 runway channels.

---

## 4. Production Build Verification

To verify that the frontend compiles cleanly for production:
```powershell
cd frontend
npm run build
```
The output bundle is generated into `frontend/dist/`.
