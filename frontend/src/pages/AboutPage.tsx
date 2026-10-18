import React, { useState } from 'react';
import { BookOpen, Settings as SettingsIcon, Award, Layers, ShieldCheck, Check } from 'lucide-react';
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
            <BookOpen className="w-5 h-5 text-sky-400" />
            MSBTE K-Scheme Course 315319 & System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Academic syllabus alignment, diploma viva explanation guide, and simulation kernel configuration.
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
              <span className="text-[11px] text-slate-500 mt-1 block">Configures physical runway resources (1-6)</span>
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
              <Award className="w-4 h-4 text-amber-400" />
              Course Outcomes (CO) Matrix - MSBTE K-Scheme 315319
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="font-bold text-sky-400 block text-sm">
                  CO1: Demonstrate OS services & resource management
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  The airport simulator models operating system resource management where runways act as non-shareable resources, and the backend dispatcher coordinates access without conflicts.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="font-bold text-amber-400 block text-sm">
                  CO2: Demonstrate processes, lifecycle states & queues
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Flights model processes: SCHEDULED represents the New state, WAITING represents the Ready queue, ON_RUNWAY represents the Running state, and COMPLETED represents Terminated state.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="font-bold text-emerald-400 block text-sm">
                  CO3: Demonstrate CPU scheduling algorithms & metrics
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  The Scheduling Laboratory implements and benchmarks FCFS, Priority Scheduling, and Round Robin time-slicing with exact calculated Waiting Time, Turnaround Time, Gantt chart, and Throughput.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="font-bold text-purple-400 block text-sm">
                  CO4: Demonstrate contiguous memory management strategies
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  The memory module simulates variable partitioning across a 1024 KB address space, demonstrating First Fit, Best Fit, Worst Fit hole allocation, coalescing, and external fragmentation.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="font-bold text-rose-400 block text-sm">
                  CO5: Demonstrate file operations & persistent logs
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Persistent SQLite event logging captures flight lifecycles and administrative changes, with downloadable RFC 4180 CSV reports.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Diploma Viva Oral Examination Defense Points
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>Why is runway simulation non-preemptive?</strong> In physical airport operations, once an aircraft touches down or starts its takeoff roll, aborting or interrupting the physical channel introduces catastrophic safety hazards. However, the waiting queue dynamically reprioritizes upcoming flights.
              </li>
              <li>
                <strong>What is the difference between Round Robin in CPU vs Runway?</strong> Round Robin preempts a CPU process when its quantum expires. In runways, Round Robin is demonstrated as an educational CPU comparison algorithm to analyze how time-sharing behaves versus non-preemptive batch scheduling.
              </li>
              <li>
                <strong>How is external fragmentation calculated?</strong> It is defined as the total free memory across all disjoint holes that cannot satisfy an allocation request because no individual contiguous hole is large enough.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
