import React from 'react';
import { FlightStatus } from '../types/flight';
import { RunwayStatus } from '../types/runway';

interface StatusBadgeProps {
  status: FlightStatus | RunwayStatus | string;
  isEmergency?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isEmergency }) => {
  if (isEmergency) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-950/80 text-red-400 border border-red-700 animate-pulse">
        EMERGENCY
      </span>
    );
  }

  const getStyle = (s: string) => {
    switch (s.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-700';
      case 'OCCUPIED':
      case 'ON_RUNWAY':
        return 'bg-blue-950/60 text-blue-400 border-blue-700';
      case 'WAITING':
        return 'bg-amber-950/60 text-amber-400 border-amber-700';
      case 'COMPLETED':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800';
      case 'SCHEDULED':
        return 'bg-slate-800 text-slate-300 border-slate-600';
      case 'HOLDING':
        return 'bg-purple-950/60 text-purple-400 border-purple-700';
      case 'UNAVAILABLE':
      case 'CANCELLED':
        return 'bg-rose-950/60 text-rose-400 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle(status)}`}>
      {status}
    </span>
  );
};
