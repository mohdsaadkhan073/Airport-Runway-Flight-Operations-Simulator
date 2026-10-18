import React from 'react';
import { Play, Pause, StepForward, StepBack, RotateCcw, Database, Plane } from 'lucide-react';
import { SimulationState } from '../types/simulation';

interface HeaderProps {
  simulationState: SimulationState | null;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onRewind: () => void;
  onReset: () => void;
  onLoadSampleData: () => void;
  onSpeedChange: (speed: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulationState,
  onPlay,
  onPause,
  onStep,
  onRewind,
  onReset,
  onLoadSampleData,
  onSpeedChange,
}) => {
  const isRunning = simulationState?.is_running ?? false;
  const currentTime = simulationState?.current_time ?? 0;
  const speed = simulationState?.speed_multiplier ?? 1.0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                Airport Runway & Flight Operations Simulator
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Flight Scheduling & Runway Resource Management System
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-mono text-slate-300">
              Clock: <strong className="text-sky-400 font-bold">{currentTime}</strong> ticks
            </span>
          </div>

          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1">
            {isRunning ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                title="Pause Simulation"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                title="Start Simulation"
              >
                <Play className="w-3.5 h-3.5" /> Start
              </button>
            )}

            <button
              onClick={onStep}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1"
              title="Step forward 1 simulation tick"
            >
              <StepForward className="w-3.5 h-3.5" /> Step
            </button>

            <button
              onClick={onRewind}
              disabled={currentTime === 0 || isRunning}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                currentTime === 0 || isRunning
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Rewind / Step backward 1 simulation tick"
            >
              <StepBack className="w-3.5 h-3.5" /> Rewind
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-slate-800 rounded transition-colors"
              title="Reset simulation clock & queues"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2 py-1.5 rounded-lg text-xs text-slate-400">
            <span>Speed:</span>
            <select
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-0.5 outline-none focus:border-sky-500"
            >
              <option value="0.5">0.5x</option>
              <option value="1.0">1.0x</option>
              <option value="2.0">2.0x</option>
              <option value="5.0">5.0x</option>
            </select>
          </div>

          <button
            onClick={onLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-lg transition-colors"
            title="Load standard simulated workload"
          >
            <Database className="w-3.5 h-3.5" /> Sample Data
          </button>
        </div>
      </div>
    </header>
  );
};
