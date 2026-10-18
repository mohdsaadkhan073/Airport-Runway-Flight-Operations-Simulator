import React from 'react';
import { MemoryBlock } from '../types/memory';
import { Trash2 } from 'lucide-react';

interface MemoryVisualizerProps {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  externalFragmentation: number;
  blocks: MemoryBlock[];
  onDeallocate: (blockId: string) => void;
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  totalMemory,
  usedMemory,
  freeMemory,
  externalFragmentation,
  blocks,
  onDeallocate,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-xs text-slate-400">Total Simulated Memory</span>
          <p className="text-lg font-bold text-slate-100">{totalMemory} KB</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-xs text-slate-400">Used Memory</span>
          <p className="text-lg font-bold text-sky-400">
            {usedMemory} KB ({Math.round((usedMemory / totalMemory) * 100)}%)
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-xs text-slate-400">Total Free Memory</span>
          <p className="text-lg font-bold text-emerald-400">{freeMemory} KB</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg">
          <span className="text-xs text-slate-400">External Fragmentation</span>
          <p className="text-lg font-bold text-amber-400">{externalFragmentation} KB</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">Simulated Physical Memory Map (0 - {totalMemory} KB)</h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-sky-700 border border-sky-500" /> Allocated
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-slate-950 border border-slate-700" /> Free Hole
            </span>
          </div>
        </div>

        <div className="w-full h-14 bg-slate-950 border border-slate-700 rounded-lg flex overflow-hidden p-0.5 shadow-inner">
          {blocks.map((block) => {
            const widthPercent = (block.size / totalMemory) * 100;
            return (
              <div
                key={block.block_id}
                style={{ width: `${widthPercent}%` }}
                className={`h-full flex flex-col justify-center items-center text-xs border-r border-slate-900 px-1 transition-all group relative ${
                  block.is_allocated
                    ? 'bg-sky-900/80 hover:bg-sky-800 text-sky-100 font-medium'
                    : 'bg-slate-950/90 text-slate-500'
                }`}
                title={`Address: ${block.start_address} - ${block.start_address + block.size - 1} (${block.size} KB) | ${
                  block.is_allocated ? `Process: ${block.process_name}` : 'Free'
                }`}
              >
                <span className="truncate w-full text-center text-[11px]">
                  {block.is_allocated ? block.process_name : `${block.size}K`}
                </span>
                <span className="text-[9px] opacity-75">{block.size} KB</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Start Address</th>
              <th className="py-2.5 px-3">End Address</th>
              <th className="py-2.5 px-3">Size (KB)</th>
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">Process Name</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {blocks.map((block) => (
              <tr key={block.block_id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2 px-3 font-mono">0x{block.start_address.toString(16).padStart(4, '0').toUpperCase()} ({block.start_address})</td>
                <td className="py-2 px-3 font-mono">0x{(block.start_address + block.size - 1).toString(16).padStart(4, '0').toUpperCase()} ({block.start_address + block.size - 1})</td>
                <td className="py-2 px-3 font-medium">{block.size} KB</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                      block.is_allocated
                        ? 'bg-sky-950 text-sky-400 border-sky-700'
                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {block.is_allocated ? 'Allocated' : 'Free Hole'}
                  </span>
                </td>
                <td className="py-2 px-3 font-semibold text-slate-100">{block.process_name || '-'}</td>
                <td className="py-2 px-3 text-right">
                  {block.is_allocated && (
                    <button
                      onClick={() => onDeallocate(block.block_id)}
                      className="p-1 hover:bg-rose-950/80 text-rose-400 rounded transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="Deallocate and free memory block"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deallocate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
