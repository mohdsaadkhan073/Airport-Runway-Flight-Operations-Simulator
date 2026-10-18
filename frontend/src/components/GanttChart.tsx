import React from 'react';
import { GanttInterval } from '../types/scheduling';

interface GanttChartProps {
  intervals: GanttInterval[];
  totalDuration: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ intervals, totalDuration }) => {
  if (!intervals || intervals.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
        No execution intervals to display. Run a scheduling algorithm to generate a Gantt chart.
      </div>
    );
  }

  const duration = Math.max(totalDuration, Math.max(...intervals.map((i) => i.end_time), 1));
  const timeMarkers = Array.from({ length: duration + 1 }, (_, i) => i);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-200">Execution Timeline (Gantt Chart)</h4>
        <span className="text-xs text-slate-400">Total Simulation Duration: {duration} time units</span>
      </div>

      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          <div className="relative h-16 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center p-1">
            {intervals.map((interval, index) => {
              const leftPercent = (interval.start_time / duration) * 100;
              const widthPercent = ((interval.end_time - interval.start_time) / duration) * 100;

              return (
                <div
                  key={`${interval.flight_id}-${interval.start_time}-${index}`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 1.5)}%`,
                  }}
                  className={`absolute top-1 bottom-1 rounded flex flex-col items-center justify-center text-xs font-semibold px-1 shadow transition-all duration-200 hover:brightness-125 hover:z-20 border group ${
                    interval.is_emergency
                      ? 'bg-rose-700/80 border-rose-500 text-rose-100'
                      : index % 2 === 0
                      ? 'bg-sky-700/80 border-sky-500 text-sky-100'
                      : 'bg-indigo-700/80 border-indigo-500 text-indigo-100'
                  }`}
                  title={`Flight ${interval.flight_number}: [t=${interval.start_time} -> t=${interval.end_time}]${
                    interval.is_emergency ? ' (EMERGENCY)' : ''
                  }`}
                >
                  <span className="truncate w-full text-center tracking-tight">
                    {interval.flight_number}
                  </span>
                  <span className="text-[10px] opacity-75 font-normal">
                    {interval.start_time}-{interval.end_time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative h-6 mt-1 flex text-[10px] text-slate-400 select-none">
            {timeMarkers.filter((t) => t % Math.max(1, Math.floor(duration / 15)) === 0 || t === duration).map((t) => (
              <div
                key={t}
                style={{ left: `${(t / duration) * 100}%` }}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
              >
                <div className="w-0.5 h-1.5 bg-slate-700 mb-0.5" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
