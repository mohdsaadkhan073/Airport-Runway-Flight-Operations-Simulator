import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Layers, Activity } from 'lucide-react';
import { AnalyticsOverviewResponse, AnalyticsSchedulingResponse } from '../types/analytics';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onShowToast }) => {
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [scheduling, setScheduling] = useState<AnalyticsSchedulingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [overviewData, schedulingData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getScheduling(),
      ]);
      setOverview(overviewData);
      setScheduling(schedulingData);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load analytics data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#38bdf8', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

  const statusData = overview?.status_distribution || [];
  const opData = overview?.operation_distribution || [];
  const comparisonData = scheduling?.comparisons || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Performance Analytics & Benchmarks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calculations of waiting times, turnaround latencies, throughput rates, and resource utilization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Runway Utilization</span>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {overview?.runway_utilization_rate ?? 0}%
          </p>
          <span className="text-[11px] text-slate-500">Active runway saturation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Mean Waiting Time</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {overview?.average_waiting_time ?? 0} ticks
          </p>
          <span className="text-[11px] text-slate-500">From completed flight records</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Mean Turnaround Time</span>
          <p className="text-2xl font-bold text-sky-400 mt-1">
            {overview?.average_turnaround_time ?? 0} ticks
          </p>
          <span className="text-[11px] text-slate-500">Arrival to completion duration</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Completed Throughput</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {overview?.completed_throughput ?? 0} ops/tick
          </p>
          <span className="text-[11px] text-slate-500">Historical completion frequency</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Algorithm Latency Comparison (Waiting vs Turnaround)
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="algorithm" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="average_waiting_time" name="Avg Waiting Time" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average_turnaround_time" name="Avg Turnaround Time" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Flight Process State Distribution
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="Flight Count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          Comparative Analysis & Performance Factors
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <strong className="text-sky-300 block">Why FCFS produces higher wait times for short operations</strong>
            <p className="text-slate-400">
              FCFS strictly processes requests in arrival order. A heavy long-duration aircraft holding the runway prevents shorter upcoming flights from executing, skewing average waiting time.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <strong className="text-emerald-300 block">Emergency Preemption vs Runway Safety</strong>
            <p className="text-slate-400">
              In real airports and this educational simulation, active runway operations are strictly non-preemptive for safety, while the waiting queue itself dynamically re-prioritizes emergency requests to the head.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
