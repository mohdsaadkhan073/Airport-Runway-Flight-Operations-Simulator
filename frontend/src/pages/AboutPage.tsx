import React, { useState } from 'react';
import { Settings as SettingsIcon, Layers, ShieldCheck, Check, Server, Database } from 'lucide-react';
import { SimulationState, SimulationSettingsUpdate } from '../types/simulation';
import { simulationService } from '../services/simulationService';

interface AboutPageProps {
  simulationState: SimulationState | null;
  onRefreshSimulation: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  simulationState,
  onRefreshSimulation,
  onShowToast,
}) => {
  const [settingsForm, setSettingsForm] = useState<SimulationSettingsUpdate>({
    runway_count: simulationState?.runways.length || 1,
    default_algorithm: simulationState?.default_algorithm || 'FCFS',
    time_quantum: simulationState?.time_quantum || 3,
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simulationService.updateSettings(settingsForm);
      onShowToast('Simulation settings updated successfully', 'success');
      onRefreshSimulation();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-sky-400" />
            System Settings & Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure simulation kernel parameters, inspect dispatch policies, and view system architecture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-sky-400" /> Simulation Kernel Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Active Runway Channels</label>
              <input
                type="number"
                min="1"
                max="6"
                value={settingsForm.runway_count}
                onChange={(e) => setSettingsForm({ ...settingsForm, runway_count: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Configures physical runway channels (1-6)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Dispatch Algorithm</label>
              <select
                value={settingsForm.default_algorithm}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_algorithm: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              >
                <option value="FCFS">FCFS (First-Come First-Served)</option>
                <option value="PRIORITY">Priority Scheduling</option>
                <option value="ROUND_ROBIN">Round Robin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default RR Time Quantum (ticks)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settingsForm.time_quantum}
                onChange={(e) => setSettingsForm({ ...settingsForm, time_quantum: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" /> Save Simulation Settings
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <span className="font-semibold text-slate-200 block">Single Source of Truth:</span>
            <p>
              All state transitions, simulation clock increments, and scheduling decisions execute strictly on the backend FastAPI server and persist in SQLite.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              Full-Stack Application Architecture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
                <span className="font-bold text-sky-400 block text-sm">
                  FastAPI Backend Engine
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Powers the REST API, scheduling algorithms, discrete-event simulation clock, memory manager, and CSV reporting.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Python 3.10+ • FastAPI • Pydantic v2
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
                <span className="font-bold text-emerald-400 block text-sm">
                  SQLite Database & Storage
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Relational storage for flights, runways, completed flight operations, system settings, and persistent operation logs.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  SQLAlchemy 2.0 • SQLite
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
                <span className="font-bold text-amber-400 block text-sm">
                  React Operations Dashboard
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Interactive interface featuring live runway cards, queue inspection, Gantt charts, memory maps, and analytics.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  React 18 • TypeScript • Tailwind CSS
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
                <span className="font-bold text-purple-400 block text-sm">
                  Data Visualization & Charts
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Dynamic visual analytics displaying latency comparisons, workload distribution, and runway utilization rates.
                </p>
                <div className="pt-2 text-[11px] text-slate-400 font-mono">
                  Recharts • Lucide React
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Operational Dispatch Principles
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>Non-Preemptive Runway Execution:</strong> Once an aircraft occupies a runway for landing or takeoff, the operation cannot be interrupted until its duration completes, ensuring strict collision safety.
              </li>
              <li>
                <strong>Dynamic Queue Prioritization:</strong> When multiple aircraft wait in the queue, emergency flights take precedence, followed by priority tiers and arrival time ordering.
              </li>
              <li>
                <strong>Variable Memory Allocation:</strong> Manages a 1024 KB memory buffer supporting First Fit, Best Fit, and Worst Fit allocation strategies with automatic hole coalescing upon release.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
