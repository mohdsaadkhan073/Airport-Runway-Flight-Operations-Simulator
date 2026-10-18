import React, { useState, useEffect } from 'react';
import { Clock, Play, BarChart2, Layers, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  SchedulingResult,
  SchedulingComparisonResponse,
} from '../types/scheduling';
import { schedulingService } from '../services/schedulingService';
import { GanttChart } from '../components/GanttChart';

interface SchedulingPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const SchedulingPage: React.FC<SchedulingPageProps> = ({ onShowToast }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('FCFS');
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [comparison, setComparison] = useState<SchedulingComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchResults = async (algo: string) => {
    try {
      setIsLoading(true);
      const res = await schedulingService.runScheduling({
        algorithm: algo,
      });
      setResult(res);
      setComparison(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to run scheduling algorithm', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults('FCFS');
  }, []);

  const handleRunAlgorithm = () => {
    fetchResults(selectedAlgo);
  };

  const handleCompareAll = async () => {
    try {
      setIsLoading(true);
      const res = await schedulingService.compareScheduling({
        algorithm: 'ALL',
      });
      setComparison(res);
      const activeResult = res.results.find((r) => r.algorithm.toUpperCase().includes(selectedAlgo.toUpperCase())) || res.results[0];
      setResult(activeResult);
      onShowToast('Compared FCFS, Priority, and Shortest Job First (SJF) algorithms', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to compare algorithms', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            Scheduling Laboratory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and benchmark non-preemptive runway scheduling algorithms with calculated waiting time and throughput metrics.
          </p>
        </div>
      </div>

      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 block font-semibold mb-0.5">Physical Safety Protocol: Preemption Prohibited</strong>
          Once an aircraft begins touchdown or takeoff roll on a runway, preemption is strictly prohibited by aerodynamic safety. All scheduling algorithms operate non-preemptively until the active flight completes its operation and vacates the runway.
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Non-Preemptive Algorithm</label>
              <select
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium cursor-pointer"
              >
                <option value="FCFS">First-Come, First-Served (FCFS)</option>
                <option value="PRIORITY">Priority Scheduling (Emergency & Weight)</option>
                <option value="SJF">Shortest Job First (SJF / Shortest Runway Hold)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAlgorithm}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Play className="w-4 h-4" /> Run Algorithm
            </button>
            <button
              onClick={handleCompareAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-sky-400" /> Compare All (FCFS, Priority, SJF)
            </button>
          </div>
        </div>
      </div>

      {comparison && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Non-Preemptive Benchmark Comparison ({comparison.workload_count} Flights Workload)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.results.map((res) => {
              const isSelected = res.algorithm.toUpperCase().includes(selectedAlgo.toUpperCase());
              return (
                <div
                  key={res.algorithm}
                  onClick={() => {
                    setResult(res);
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{res.algorithm}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Avg Waiting Time:</span>
                      <span className="font-mono font-bold text-amber-400">{res.average_waiting_time} ticks</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg Turnaround Time:</span>
                      <span className="font-mono font-bold text-sky-400">{res.average_turnaround_time} ticks</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Throughput:</span>
                      <span className="font-mono font-bold text-emerald-400">{res.throughput} flights/tick</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Active Benchmark</span>
              <p className="text-lg font-bold text-slate-100 mt-1">{result.algorithm}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Average Waiting Time (AWT)</span>
              <p className="text-lg font-bold text-amber-400 mt-1">{result.average_waiting_time} ticks</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Average Turnaround Time (ATAT)</span>
              <p className="text-lg font-bold text-sky-400 mt-1">{result.average_turnaround_time} ticks</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Calculated Throughput</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">{result.throughput} ops/tick</p>
            </div>
          </div>

          <GanttChart
            intervals={result.gantt_intervals}
            totalDuration={result.total_duration}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100">Calculated Metrics Table</h4>
              <span className="text-xs text-slate-400 font-mono">
                {result.items.length} flight records computed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Flight</th>
                    <th className="py-3 px-4">Operation</th>
                    <th className="py-3 px-4">Arrival (AT)</th>
                    <th className="py-3 px-4">Burst (BT)</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Start (ST)</th>
                    <th className="py-3 px-4">Completion (CT)</th>
                    <th className="py-3 px-4">Waiting (WT)</th>
                    <th className="py-3 px-4">Turnaround (TAT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                  {result.items.map((item) => (
                    <tr key={item.flight_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-bold text-slate-100 font-sans flex items-center gap-2">
                        {item.flight_number}
                        {item.is_emergency && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 font-bold border border-rose-800">
                            EMERGENCY
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-300">{item.operation_type}</td>
                      <td className="py-2.5 px-4 text-slate-400">{item.arrival_time}</td>
                      <td className="py-2.5 px-4 text-slate-200">{item.duration}</td>
                      <td className="py-2.5 px-4 text-slate-300">P{item.priority}</td>
                      <td className="py-2.5 px-4 text-sky-400">{item.start_time}</td>
                      <td className="py-2.5 px-4 text-emerald-400">{item.completion_time}</td>
                      <td className="py-2.5 px-4 text-amber-400 font-bold">{item.waiting_time}</td>
                      <td className="py-2.5 px-4 text-purple-400 font-bold">{item.turnaround_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          Non-Preemptive Scheduling Characteristics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <strong className="text-sky-300 block">FCFS (Convoy Effect)</strong>
            <p className="text-slate-400 leading-relaxed">
              If a long runway hold or heavy aircraft arrives first, subsequent short operations wait in queue, resulting in high average waiting times.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <strong className="text-amber-300 block">Priority Scheduling</strong>
            <p className="text-slate-400 leading-relaxed">
              Emergency requests jump immediately to the head of the queue. Routine flights are ordered by priority score to clear vital traffic first.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <strong className="text-emerald-300 block">SJF (Optimal AWT)</strong>
            <p className="text-slate-400 leading-relaxed">
              Shortest Job First provably minimizes Average Waiting Time among all non-preemptive algorithms by scheduling fastest-clearing flights first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
