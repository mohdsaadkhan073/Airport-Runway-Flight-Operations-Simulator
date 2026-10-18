import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Plane,
  X,
} from 'lucide-react';
import { Flight, FlightCreatePayload, FlightStatus, OperationType } from '../types/flight';
import { flightService } from '../services/flightService';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

interface FlightsPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const FlightsPage: React.FC<FlightsPageProps> = ({ onShowToast }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FlightStatus | ''>('');
  const [opFilter, setOpFilter] = useState<OperationType | ''>('');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [deletingFlight, setDeletingFlight] = useState<Flight | null>(null);

  const [formData, setFormData] = useState<FlightCreatePayload>({
    flight_number: '',
    aircraft_type: '',
    operation_type: 'LANDING',
    arrival_time: 0,
    duration: 3,
    priority: 3,
    is_emergency: false,
  });

  const fetchFlights = async () => {
    try {
      setIsLoading(true);
      const res = await flightService.getFlights({
        search: search || undefined,
        status: (statusFilter as FlightStatus) || undefined,
        operation_type: (opFilter as OperationType) || undefined,
        is_emergency: emergencyFilter === 'all' ? undefined : emergencyFilter === 'true',
        limit: 100,
      });
      setFlights(res.items);
      setTotal(res.total);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load flights', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [search, statusFilter, opFilter, emergencyFilter]);

  const handleOpenAdd = () => {
    setFormData({
      flight_number: '',
      aircraft_type: '',
      operation_type: 'LANDING',
      arrival_time: 0,
      duration: 3,
      priority: 3,
      is_emergency: false,
    });
    setEditingFlight(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (f: Flight) => {
    setEditingFlight(f);
    setFormData({
      flight_number: f.flight_number,
      aircraft_type: f.aircraft_type,
      operation_type: f.operation_type,
      arrival_time: f.arrival_time,
      duration: f.duration,
      priority: f.priority,
      is_emergency: f.is_emergency,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFlight) {
        await flightService.updateFlight(editingFlight.id, formData);
        onShowToast(`Flight ${formData.flight_number} updated successfully`, 'success');
      } else {
        await flightService.createFlight(formData);
        onShowToast(`Flight ${formData.flight_number} created successfully`, 'success');
      }
      setIsAddModalOpen(false);
      fetchFlights();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save flight', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFlight) return;
    try {
      await flightService.deleteFlight(deletingFlight.id);
      onShowToast(`Flight ${deletingFlight.flight_number} deleted successfully`, 'success');
      setDeletingFlight(null);
      fetchFlights();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete flight', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            Flight Management & Lifecycle
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, inspect, update, and manage airport flight processes across discrete simulation queues.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Flight
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flight number or aircraft..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FlightStatus | '')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="WAITING">Waiting</option>
              <option value="ON_RUNWAY">On Runway</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Type:</span>
            <select
              value={opFilter}
              onChange={(e) => setOpFilter(e.target.value as OperationType | '')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="">All Operations</option>
              <option value="TAKEOFF">Takeoff</option>
              <option value="LANDING">Landing</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Priority:</span>
            <select
              value={emergencyFilter}
              onChange={(e) => setEmergencyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="all">All Flights</option>
              <option value="true">Emergency Only</option>
              <option value="false">Normal Flights</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading flight records from backend database...</div>
        ) : flights.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No flights match the current query. Click &quot;Add New Flight&quot; or &quot;Sample Data&quot; in the header.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Flight No</th>
                  <th className="py-3 px-4">Aircraft Type</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Arrival (t)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {flights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      {flight.flight_number}
                      {flight.is_emergency && <StatusBadge status={flight.status} isEmergency />}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{flight.aircraft_type}</td>
                    <td className="py-2.5 px-4 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        flight.operation_type === 'TAKEOFF' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}>
                        {flight.operation_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">t={flight.arrival_time}</td>
                    <td className="py-2.5 px-4 font-mono">{flight.duration} ticks</td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        P{flight.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={flight.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(flight)}
                          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-sky-400 rounded transition-colors"
                          title="Edit Flight"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingFlight(flight)}
                          disabled={flight.status === 'ON_RUNWAY'}
                          className={`p-1 rounded transition-colors ${
                            flight.status === 'ON_RUNWAY'
                              ? 'opacity-30 cursor-not-allowed text-slate-600'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-rose-400'
                          }`}
                          title={flight.status === 'ON_RUNWAY' ? 'Cannot delete while occupying runway' : 'Delete Flight'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingFlight ? `Edit Flight: ${editingFlight.flight_number}` : 'Add New Flight Request'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFlight} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Flight Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-202"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Aircraft Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airbus A320neo, Boeing 777"
                  value={formData.aircraft_type}
                  onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Operation Type</label>
                  <select
                    value={formData.operation_type}
                    onChange={(e) => setFormData({ ...formData, operation_type: e.target.value as OperationType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="TAKEOFF">TAKEOFF</option>
                    <option value="LANDING">LANDING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Arrival Time (t)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Runway Hold (ticks)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority (1 = Highest)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 3 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 font-mono"
                  >
                    <option value="1">1 (Critical/VIP)</option>
                    <option value="2">2 (High Priority)</option>
                    <option value="3">3 (Normal Scheduled)</option>
                    <option value="4">4 (Low Priority)</option>
                    <option value="5">5 (Lowest/Cargo)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Emergency Status</span>
                  <span className="text-[11px] text-slate-400">Forces highest preemptive waiting queue priority</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_emergency}
                  onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
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
                  {editingFlight ? 'Update Flight' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingFlight)}
        title="Delete Flight Record"
        message={`Are you sure you want to permanently delete flight ${deletingFlight?.flight_number}? This action will remove the flight and associated records.`}
        confirmLabel="Delete Flight"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingFlight(null)}
      />
    </div>
  );
};
