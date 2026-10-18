import React, { useState, useEffect } from 'react';
import { Cpu, Plus, RotateCcw, AlertTriangle, Layers, History } from 'lucide-react';
import { MemoryStateResponse, MemoryAllocationRequest } from '../types/memory';
import { memoryService } from '../services/memoryService';
import { MemoryVisualizer } from '../components/MemoryVisualizer';

interface MemoryPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({ onShowToast }) => {
  const [memoryState, setMemoryState] = useState<MemoryStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState<MemoryAllocationRequest>({
    process_name: 'RadarTelemetry',
    requested_size: 128,
    algorithm: 'FIRST_FIT',
  });

  const fetchState = async () => {
    try {
      setIsLoading(true);
      const data = await memoryService.getState();
      setMemoryState(data);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to fetch memory state', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await memoryService.allocate(formData);
      setMemoryState(data);
      onShowToast(
        `Allocated ${formData.requested_size} KB for ${formData.process_name} using ${formData.algorithm}`,
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Allocation failed', 'error');
    }
  };

  const handleDeallocate = async (blockId: string) => {
    try {
      const data = await memoryService.deallocate(blockId);
      setMemoryState(data);
      onShowToast(`Block ${blockId} deallocated and merged`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to deallocate block', 'error');
    }
  };

  const handleReset = async () => {
    try {
      const data = await memoryService.reset();
      setMemoryState(data);
      onShowToast('Memory pool reset to 1024 KB', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to reset memory pool', 'error');
    }
  };

  const handleDefragment = async () => {
    try {
      const data = await memoryService.defragment();
      setMemoryState(data);
      onShowToast(
        'Memory compacted: active blocks moved contiguously, external fragmentation eliminated!',
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Failed to defragment memory', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            Contiguous Memory Allocation Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate variable-partition dynamic storage allocation with First Fit, Best Fit, Worst Fit, and external fragmentation.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Memory Pool
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" /> Request Memory Allocation
          </h3>
          <form onSubmit={handleAllocate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Process / Subsystem Name</label>
              <input
                type="text"
                required
                value={formData.process_name}
                onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                placeholder="e.g. FlightTelemetry, WeatherRadar"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Requested Size (KB)</label>
              <input
                type="number"
                min="1"
                max="1024"
                required
                value={formData.requested_size}
                onChange={(e) => setFormData({ ...formData, requested_size: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Allocation Strategy</label>
              <select
                value={formData.algorithm}
                onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              >
                <option value="FIRST_FIT">First Fit (Fastest scan)</option>
                <option value="BEST_FIT">Best Fit (Smallest suitable hole)</option>
                <option value="WORST_FIT">Worst Fit (Largest hole remaining)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Allocate Memory Block
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <span className="font-semibold text-slate-200 block">Strategy Overview:</span>
            <p>
              <strong>First Fit:</strong> Allocates the first hole that is big enough. Searches from beginning.
            </p>
            <p>
              <strong>Best Fit:</strong> Allocates the smallest hole that is big enough. Leaves small leftover fragments.
            </p>
            <p>
              <strong>Worst Fit:</strong> Allocates the largest available hole, leaving the largest remainder hole for future jobs.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {memoryState && (
            <MemoryVisualizer
              totalMemory={memoryState.total_memory}
              usedMemory={memoryState.used_memory}
              freeMemory={memoryState.free_memory}
              externalFragmentation={memoryState.external_fragmentation}
              blocks={memoryState.blocks}
              onDeallocate={handleDeallocate}
              onDefragment={handleDefragment}
            />
          )}

          {memoryState && memoryState.allocations && memoryState.allocations.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  Recent Memory Allocation History
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {memoryState.allocations.length} records logged
                </span>
              </div>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Process</th>
                      <th className="py-2.5 px-3">Requested</th>
                      <th className="py-2.5 px-3">Address</th>
                      <th className="py-2.5 px-3">Algorithm</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {memoryState.allocations.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-100">{a.process_name}</td>
                        <td className="py-2 px-3 font-mono">{a.requested_size} KB</td>
                        <td className="py-2 px-3 font-mono">
                          {a.start_address >= 0 ? `0x${a.start_address.toString(16).padStart(4, '0').toUpperCase()}` : 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-slate-300">{a.algorithm}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              a.status === 'ALLOCATED'
                                ? 'bg-sky-950 text-sky-400 border-sky-800'
                                : a.status === 'DEALLOCATED'
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-rose-950 text-rose-400 border-rose-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(a.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
