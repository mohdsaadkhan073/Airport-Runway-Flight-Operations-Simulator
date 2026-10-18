import React from 'react';
import {
  LayoutDashboard,
  Plane,
  Route,
  Clock,
  Cpu,
  FileText,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'flights'
  | 'runways'
  | 'scheduling'
  | 'memory'
  | 'logs'
  | 'analytics'
  | 'about';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'flights', label: 'Flight Management', icon: Plane },
    { id: 'runways', label: 'Runway Control', icon: Route },
    { id: 'scheduling', label: 'Scheduling Laboratory', icon: Clock },
    { id: 'memory', label: 'Memory Management', icon: Cpu },
    { id: 'logs', label: 'Flight Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'System & Settings', icon: HelpCircle },
  ] as const;

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 px-4 lg:px-8 py-2 overflow-x-auto select-none">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavigationTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
