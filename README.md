# Airport Runway & Flight Operations Simulator

An educational simulation web application designed for the **MSBTE K-Scheme Operating System (Course Code: 315319)** curriculum.

The project models airport operations as operating system concepts: runways act as non-shareable hardware resources, flights act as processes transitioning through lifecycle states, and air traffic control functions as the OS CPU and resource scheduler.

---

## 1. Operating System Syllabus Mapping (MSBTE K-Scheme: 315319)

| Course Outcome | OS Concept | Airport Simulator Demonstration |
|---|---|---|
| **CO1** | Operating System Services & Resource Allocation | Airport Operations Center allocating non-shareable runway resources to inbound and outbound aircraft without collisions. |
| **CO2** | Process Lifecycle & Queue Management | Flights transitioning through discrete lifecycle states: `SCHEDULED` (New), `WAITING` (Ready Queue), `ON_RUNWAY` (Running/Occupying), and `COMPLETED` (Terminated). |
| **CO3** | CPU Scheduling Algorithms & Timing Metrics | Interactive laboratory comparing **FCFS (First-Come, First-Served)**, **Non-Preemptive Priority Scheduling**, and **Round Robin (CPU Time Quantum)** with Gantt charts, Average Waiting Time (AWT), and Average Turnaround Time (ATAT). |
| **CO4** | Contiguous Memory Allocation & Partitioning | 1024 KB memory pool simulator executing **First Fit**, **Best Fit**, and **Worst Fit** partition allocation, hole coalescing, and external fragmentation calculations. |
| **CO5** | File Management & Audit Trails | Persistent SQLite logging of flight operations, scheduling decisions, and administrative actions, with one-click RFC 4180 CSV export. |

---

## 2. System Architecture

The project enforces strict separation of concerns with the backend as the single authoritative source of truth.

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
│   │   ├── simulation/       # Discrete-event simulation clock & runway engine
│   │   └── tests/            # Automated Pytest suite
│   ├── requirements.txt      # Pinned backend dependencies
│   ├── pytest.ini            # Pytest configuration
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
│   ├── tailwind.config.js    # Tailwind aviation styling
│   └── .env.example          # Frontend API base URL template
└── README.md
```

### Technology Stack
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite, Pytest, HTTPX
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts

---

## 3. Local Development & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js v18+ and npm v9+
- Git

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

5. Start the backend development server (e.g. on port 5000 or 3000):
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
   ```
   The backend API will be available at `http://localhost:5000`.
   Interactive Swagger documentation is available at `http://localhost:5000/docs`.

   > [!TIP]
   > You can run on any port (such as 5000 or 3000) by passing `--port <PORT>`. If you change the port, ensure `VITE_API_BASE_URL` in `frontend/.env` matches (e.g., `http://localhost:5000/api/v1` or `http://localhost:3000/api/v1`).


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

### Step 3: Load Sample Data

In the web interface:
1. Click the **Sample Data** button in the top navigation bar.
2. Confirm loading the standard dataset.
3. The backend will initialize 8 realistic flights (takeoffs, landings, varied durations, priority levels 1-4, and an emergency flight) along with 3 runway configurations (including 1 offline runway for maintenance demonstration).

---

## 4. Running Automated Tests

The backend includes a comprehensive suite of 33 unit and end-to-end integration tests.

Run all tests from the repository root:
```powershell
.\backend\venv\Scripts\pytest backend\app\tests -v
```

### Test Coverage Highlights
- `test_flights.py`: Flight validation, unique identifier constraints, invalid state transitions, and deletion guards.
- `test_scheduling.py`: FCFS order, Non-Preemptive Priority with emergency overrides, Round Robin time slicing, and idle period handling.
- `test_simulation.py`: Clock advancement, runway occupation, duration decrement, completion, and reset idempotence.
- `test_memory.py`: First Fit, Best Fit, Worst Fit search algorithms, block coalescing, and out-of-memory handling.
- `test_logs_reports.py`: Persistent SQLite event auditing and RFC 4180 CSV export.
- `test_integration.py`: Complete simulation lifecycle from sample data through scheduling, execution, memory allocation, and reset.

---

## 5. Production Build Verification

To verify that the frontend compiles cleanly for production:
```powershell
cd frontend
npm run build
```
This runs TypeScript checking (`tsc -b`) and Vite production bundle generation into `frontend/dist/`.

---

## 6. Diploma Viva & Oral Examination Guide

### Common Questions & Answers

1. **Why is runway simulation non-preemptive while Round Robin is preemptive?**
   - In physical aviation, once an aircraft enters a runway for landing or takeoff roll, interrupting or aborting the physical channel introduces catastrophic collisions. Therefore, active runway operations are strictly non-preemptive.
   - Round Robin is implemented in the Scheduling Laboratory as an educational CPU comparison algorithm to demonstrate how time-sharing and quantum slicing behave compared to batch runway scheduling.

2. **How are emergency requests handled?**
   - Emergency flights (`is_emergency = true` or Priority 1) jump ahead of all waiting non-emergency aircraft in the ready queue. However, they respect active runway operations and safety capacity.

3. **What is External Fragmentation and how does this application calculate it?**
   - External fragmentation occurs when total free memory exists to satisfy a request, but the memory is divided into disjoint non-contiguous blocks.
   - The application calculates external fragmentation as:
     $$\text{External Fragmentation} = \text{Total Free Memory} - \text{Largest Contiguous Free Block}$$

4. **Where does the application store data?**
   - All state is stored in an SQLite relational database managed via SQLAlchemy. Browser LocalStorage is not used for primary simulation data.

---

## 7. License

This project is created for educational and academic assessment purposes for the MSBTE K-Scheme curriculum.
