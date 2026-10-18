import React, { useState } from 'react';
import { Settings as SettingsIcon, Check } from 'lucide-react';
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sky-400" />
          System Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure default simulation dispatch algorithm and physical runway channels.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Active Runway Channels</label>
            <input
              type="number"
              min="1"
              max="6"
              value={settingsForm.runway_count}
              onChange={(e) => setSettingsForm({ ...settingsForm, runway_count: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 outline-none focus:border-sky-500 font-mono text-sm"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Configures physical runway channels (1-6)</span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Default Dispatch Algorithm</label>
            <select
              value={settingsForm.default_algorithm}
              onChange={(e) => setSettingsForm({ ...settingsForm, default_algorithm: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 outline-none focus:border-sky-500 cursor-pointer text-sm"
            >
              <option value="FCFS">FCFS (First-Come, First-Served)</option>
              <option value="PRIORITY">Priority Scheduling</option>
              <option value="SJF">SJF (Shortest Job First)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Check className="w-4 h-4" /> Save Simulation Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
