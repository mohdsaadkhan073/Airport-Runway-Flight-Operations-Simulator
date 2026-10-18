import React from 'react';
import {
  Plane,
  Clock,
  CheckCircle,
  AlertTriangle,
  Route,
  Activity,
  Layers,
  BookOpen,
} from 'lucide-react';
import { SimulationState } from '../types/simulation';
import { AnalyticsOverviewResponse } from '../types/analytics';
import { StatusBadge } from '../components/StatusBadge';

interface OverviewPageProps {
  simulationState: SimulationState | null;
  analytics: AnalyticsOverviewResponse | null;
  onNavigateToScheduling: () => void;
  onNavigateToFlights: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  simulationState,
  analytics,
  onNavigateToScheduling,
  onNavigateToFlights,
}) => {
  const runways = simulationState?.runways || [];
  const waitingQueue = simulationState?.waiting_queue || [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            Airport Operations & Runway Dispatch Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time flight queue scheduling, multi-runway allocation, and operations monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToScheduling}
            className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <Clock className="w-3.5 h-3.5" /> Scheduling Lab
          </button>
          <button
            onClick={onNavigateToFlights}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plane className="w-3.5 h-3.5" /> Manage Flights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Workload</span>
            <Plane className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">
            {analytics?.total_flights ?? simulationState?.scheduled_flights_count ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Flights in system</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Waiting Ready Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {simulationState?.waiting_flights_count ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Awaiting runway dispatch</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Runway Ops</span>
            <Route className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {simulationState?.active_flights_count ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Occupying runway resources</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed Operations</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {simulationState?.completed_flights_count ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Safely departed / landed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Runway Utilization</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">
            {analytics?.runway_utilization_rate ?? 0}%
          </p>
          <span className="text-[11px] text-slate-500">Resource usage rate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-100">Live Runway Status</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total Runways: {runways.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {runways.map((runway) => {
                const isOccupied = runway.status === 'OCCUPIED';
                const isUnavailable = runway.status === 'UNAVAILABLE';
                const flight = runway.current_flight;

                return (
                  <div
                    key={runway.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isOccupied
                        ? 'bg-blue-950/40 border-blue-800/80 shadow-md'
                        : isUnavailable
                        ? 'bg-slate-950/80 border-slate-800 opacity-60'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-100">{runway.name}</h4>
                      <StatusBadge status={runway.status} />
                    </div>

                    <div className="mt-3 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Permitted Ops:</span>
                        <span className="font-semibold text-slate-200">{runway.supported_operations}</span>
                      </div>

                      {flight ? (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-300 text-sm">
                              {flight.flight_number}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-900 text-sky-200 font-semibold">
                              {flight.operation_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{flight.aircraft_type}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-300">
                              <span>Remaining Runway Hold:</span>
                              <span className="font-mono font-bold text-amber-400">
                                {flight.remaining_duration} ticks
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, (flight.remaining_duration / flight.duration) * 100)
                                  )}%`,
                                }}
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-slate-500 py-3">
                          {isUnavailable ? 'Runway in Maintenance' : 'Runway Clear / Idle'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  Ready Waiting Queue
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Policy: {simulationState?.default_algorithm || 'FCFS'}
                  </span>
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {waitingQueue.length} flights waiting
              </span>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800/60">
                Ready queue is empty. Step the simulation forward or load sample flights.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Flight</th>
                      <th className="py-2.5 px-3">Aircraft</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Arrival</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                    {waitingQueue.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-100">{f.flight_number}</td>
                        <td className="py-2 px-3 text-slate-400">{f.aircraft_type}</td>
                        <td className="py-2 px-3 font-medium text-slate-300">{f.operation_type}</td>
                        <td className="py-2 px-3 font-mono">t={f.arrival_time}</td>
                        <td className="py-2 px-3 font-mono">{f.duration} ticks</td>
                        <td className="py-2 px-3">
                          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            P{f.priority}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {f.is_emergency ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
                              EMERGENCY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800">
                              WAITING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Airport Dispatch Rules & Guide
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-sky-300">Runway Safety & Channel Locks</span>
                <p className="text-slate-400 mt-0.5">
                  Physical runways operate non-preemptively. Once an aircraft begins landing or takeoff roll, the runway channel remains locked until the operation concludes.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-amber-300">Queue Lifecycle States</span>
                <p className="text-slate-400 mt-0.5">
                  Flights progress sequentially through SCHEDULED, WAITING queue, ON_RUNWAY, and COMPLETED states based on arrival times and runway availability.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-emerald-300">Priority & Emergency Overrides</span>
                <p className="text-slate-400 mt-0.5">
                  Emergency aircraft bypass waiting queues immediately upon arrival, securing the next available runway without interrupting ongoing operations.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-purple-300">Resource Monitoring</span>
                <p className="text-slate-400 mt-0.5">
                  All timings, turnaround statistics, runway saturations, and memory allocations are computed live by the backend engine.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-rose-300">Persistent Operation Logging</span>
                <p className="text-slate-400 mt-0.5">
                  Every state transition and runway release event is recorded in the persistent SQLite database and exportable as CSV reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
