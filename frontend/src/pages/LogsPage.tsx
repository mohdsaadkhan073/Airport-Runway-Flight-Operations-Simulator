import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Filter, Search } from 'lucide-react';
import { OperationLogItem } from '../types/log';
import { logService } from '../services/logService';
import { getBaseUrl } from '../services/apiClient';
import { ConfirmModal } from '../components/ConfirmModal';

interface LogsPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const LogsPage: React.FC<LogsPageProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<OperationLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [flightIdFilter, setFlightIdFilter] = useState<string>('');
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await logService.getLogs({
        event_type: eventTypeFilter || undefined,
        flight_id: flightIdFilter ? parseInt(flightIdFilter) : undefined,
        limit: 150,
      });
      setLogs(res.items);
      setTotal(res.total);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to fetch operation logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter, flightIdFilter]);

  const handleExportCSV = () => {
    const csvUrl = `${getBaseUrl()}/reports/flights.csv`;
    window.open(csvUrl, '_blank');
    onShowToast('Downloading flights_report.csv...', 'success');
  };

  const handleClearLogsConfirm = async () => {
    try {
      const res = await logService.clearLogs();
      onShowToast(res.message, 'success');
      setIsClearModalOpen(false);
      fetchLogs();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to clear logs', 'error');
    }
  };

  const getEventBadgeClass = (type: string) => {
    if (type.includes('COMPLETED')) return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    if (type.includes('STARTED') || type.includes('ALLOCATED')) return 'bg-sky-950 text-sky-300 border-sky-800';
    if (type.includes('FAILED') || type.includes('DELETED')) return 'bg-rose-950 text-rose-300 border-rose-800';
    if (type.includes('ARRIVED') || type.includes('WAITING')) return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Flight Logs & Persistent Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit trail of operations, state transitions, scheduling decisions, and standard CSV report exports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Clear Logs
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Event Type:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="">All Events</option>
              <option value="FLIGHT_CREATED">FLIGHT_CREATED</option>
              <option value="FLIGHT_ARRIVED">FLIGHT_ARRIVED</option>
              <option value="OPERATION_STARTED">OPERATION_STARTED</option>
              <option value="OPERATION_COMPLETED">OPERATION_COMPLETED</option>
              <option value="MEMORY_ALLOCATED">MEMORY_ALLOCATED</option>
              <option value="MEMORY_DEALLOCATED">MEMORY_DEALLOCATED</option>
              <option value="SIMULATION_RESET">SIMULATION_RESET</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Filter Flight ID:</span>
            <input
              type="number"
              placeholder="e.g. 1"
              value={flightIdFilter}
              onChange={(e) => setFlightIdFilter(e.target.value)}
              className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {logs.length} of {total} persistent records
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading operation logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No log entries match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Runway</th>
                  <th className="py-3 px-4">Sim Time (t)</th>
                  <th className="py-3 px-4">Event Description</th>
                  <th className="py-3 px-4">System Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-400">#{log.id}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getEventBadgeClass(log.event_type)}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {log.flight_id ? `#${log.flight_id}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {log.runway_id ? `Runway #${log.runway_id}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-sky-400 font-bold">
                      t={log.simulation_time}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">{log.description}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Operation Logs"
        message="Are you sure you want to clear all operation logs? This will wipe the persistent history table in the database."
        confirmLabel="Clear All Logs"
        isDestructive
        onConfirm={handleClearLogsConfirm}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
