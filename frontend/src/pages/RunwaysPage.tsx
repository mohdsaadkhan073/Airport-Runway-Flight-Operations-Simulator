import React, { useState, useEffect } from 'react';
import { Route, Plus, AlertCircle, CheckCircle, Wrench, X } from 'lucide-react';
import { Runway, RunwayCreatePayload, RunwayStatus } from '../types/runway';
import { runwayService } from '../services/runwayService';
import { StatusBadge } from '../components/StatusBadge';

interface RunwaysPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const RunwaysPage: React.FC<RunwaysPageProps> = ({ onShowToast }) => {
  const [runways, setRunways] = useState<Runway[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<RunwayCreatePayload>({
    name: '',
    supported_operations: 'ALL',
  });

  const fetchRunways = async () => {
    try {
      setIsLoading(true);
      const data = await runwayService.getRunways();
      setRunways(data);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load runways', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRunways();
  }, []);

  const handleCreateRunway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await runwayService.createRunway(formData);
      onShowToast(`Runway ${formData.name} created successfully`, 'success');
      setIsAddModalOpen(false);
      setFormData({ name: '', supported_operations: 'ALL' });
      fetchRunways();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create runway', 'error');
    }
  };

  const handleToggleMaintenance = async (runway: Runway) => {
    try {
      const newStatus: RunwayStatus =
        runway.status === 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE';
      await runwayService.updateRunway(runway.id, { status: newStatus });
      onShowToast(
        `Runway ${runway.name} status updated to ${newStatus}`,
        'success'
      );
      fetchRunways();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to toggle runway maintenance', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Route className="w-5 h-5 text-sky-400" />
            Runway Resource Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Arbitrate physical runway channels, manage maintenance status, and view active aircraft allocations.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Runway
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs">
            Loading runway configurations from backend...
          </div>
        ) : runways.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs">
            No runways configured. Click &quot;Add Runway&quot; above.
          </div>
        ) : (
          runways.map((runway) => {
            const isOccupied = runway.status === 'OCCUPIED';
            const isUnavailable = runway.status === 'UNAVAILABLE';
            const flight = runway.current_flight;

            return (
              <div
                key={runway.id}
                className={`bg-slate-900 border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                  isOccupied
                    ? 'border-blue-700/80 bg-blue-950/20'
                    : isUnavailable
                    ? 'border-slate-800 bg-slate-950/70'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-100">{runway.name}</span>
                    <StatusBadge status={runway.status} />
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Supported Ops:</span>
                      <span className="font-semibold text-slate-200">{runway.supported_operations}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Occupying Process:</span>
                      <span className="font-mono text-slate-200">
                        {runway.current_flight_id ? `Flight #${runway.current_flight_id}` : 'None (Idle)'}
                      </span>
                    </div>

                    {flight && (
                      <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-400 text-sm">
                            {flight.flight_number}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 font-semibold border border-sky-700/40">
                            {flight.operation_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{flight.aircraft_type}</p>
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Remaining Hold:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {flight.remaining_duration} / {flight.duration} ticks
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Runway ID: #{runway.id}</span>
                  <button
                    onClick={() => handleToggleMaintenance(runway)}
                    disabled={isOccupied}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isOccupied
                        ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-800'
                        : isUnavailable
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700'
                    }`}
                    title={isOccupied ? 'Cannot toggle maintenance while runway is occupied' : 'Toggle Runway Mode'}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    {isUnavailable ? 'Set Available' : 'Take Offline'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Add New Runway</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRunway} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Runway Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Runway 04/22"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supported Operations</label>
                <select
                  value={formData.supported_operations}
                  onChange={(e) => setFormData({ ...formData, supported_operations: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                >
                  <option value="ALL">ALL (Takeoff & Landing)</option>
                  <option value="TAKEOFF">Takeoff Only</option>
                  <option value="LANDING">Landing Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow"
                >
                  Add Runway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
