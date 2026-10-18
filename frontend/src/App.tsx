import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, NavigationTab } from './components/Navigation';
import { Toast, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { OverviewPage } from './pages/OverviewPage';
import { FlightsPage } from './pages/FlightsPage';
import { RunwaysPage } from './pages/RunwaysPage';
import { SchedulingPage } from './pages/SchedulingPage';
import { MemoryPage } from './pages/MemoryPage';
import { LogsPage } from './pages/LogsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AboutPage } from './pages/AboutPage';

import { SimulationState } from './types/simulation';
import { AnalyticsOverviewResponse } from './types/analytics';
import { simulationService } from './services/simulationService';
import { analyticsService } from './services/analyticsService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewResponse | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isSampleDataConfirmOpen, setIsSampleDataConfirmOpen] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    });
  }, []);

  const refreshSimulation = useCallback(async () => {
    try {
      const state = await simulationService.getState();
      setSimulationState(state);
    } catch (err: any) {
      showToast(err.message || 'Cannot connect to backend simulation API', 'error');
    }
  }, [showToast]);

  const refreshAnalytics = useCallback(async () => {
    try {
      const data = await analyticsService.getOverview();
      setAnalytics(data);
    } catch {
    }
  }, []);

  useEffect(() => {
    refreshSimulation();
    refreshAnalytics();
  }, [refreshSimulation, refreshAnalytics]);

  useEffect(() => {
    if (!simulationState?.is_running) return;

    const intervalMs = Math.max(200, Math.floor(1000 / (simulationState.speed_multiplier || 1.0)));
    const interval = setInterval(async () => {
      try {
        const nextState = await simulationService.step(1);
        setSimulationState(nextState);
        refreshAnalytics();
      } catch (err: any) {
        showToast(err.message || 'Simulation step error', 'error');
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simulationState?.is_running, simulationState?.speed_multiplier, refreshAnalytics, showToast]);

  const handlePlay = async () => {
    try {
      const state = await simulationService.start();
      setSimulationState(state);
      showToast('Simulation running', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to start simulation', 'error');
    }
  };

  const handlePause = async () => {
    try {
      const state = await simulationService.pause();
      setSimulationState(state);
      showToast('Simulation paused', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to pause simulation', 'error');
    }
  };

  const handleStep = async () => {
    try {
      const state = await simulationService.step(1);
      setSimulationState(state);
      refreshAnalytics();
    } catch (err: any) {
      showToast(err.message || 'Failed to step simulation', 'error');
    }
  };

  const handleResetConfirm = async () => {
    try {
      const state = await simulationService.reset();
      setSimulationState(state);
      refreshAnalytics();
      setIsResetConfirmOpen(false);
      showToast('Simulation reset to initial state', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset simulation', 'error');
    }
  };

  const handleLoadSampleDataConfirm = async () => {
    try {
      const state = await simulationService.loadSampleData(false);
      setSimulationState(state);
      refreshAnalytics();
      setIsSampleDataConfirmOpen(false);
      showToast('Standard educational sample dataset loaded into database', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to load sample dataset', 'error');
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      const state = await simulationService.updateSettings({ speed_multiplier: speed });
      setSimulationState(state);
    } catch (err: any) {
      showToast(err.message || 'Failed to change speed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Header
        simulationState={simulationState}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onReset={() => setIsResetConfirmOpen(true)}
        onLoadSampleData={() => setIsSampleDataConfirmOpen(true)}
        onSpeedChange={handleSpeedChange}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewPage
            simulationState={simulationState}
            analytics={analytics}
            onNavigateToScheduling={() => setActiveTab('scheduling')}
            onNavigateToFlights={() => setActiveTab('flights')}
          />
        )}

        {activeTab === 'flights' && (
          <FlightsPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'runways' && (
          <RunwaysPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'scheduling' && (
          <SchedulingPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'memory' && (
          <MemoryPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'logs' && (
          <LogsPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage onShowToast={(msg, type) => showToast(msg, type)} />
        )}

        {activeTab === 'about' && (
          <AboutPage
            simulationState={simulationState}
            onRefreshSimulation={refreshSimulation}
            onShowToast={(msg, type) => showToast(msg, type)}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        Airport Runway & Flight Operations Simulator • Full-Stack Operations & Scheduling Dashboard
      </footer>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Simulation Clock & Queues"
        message="Are you sure you want to reset the simulation clock back to t=0? Active flights will return to scheduled status, preserving flight data."
        confirmLabel="Reset Simulation"
        isDestructive
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isSampleDataConfirmOpen}
        title="Load Standard Educational Dataset"
        message="This will populate the database with realistic sample flights (takeoffs, landings, different durations, priorities, and an emergency flight) and runways."
        confirmLabel="Load Sample Data"
        onConfirm={handleLoadSampleDataConfirm}
        onCancel={() => setIsSampleDataConfirmOpen(false)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
