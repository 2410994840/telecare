import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AlertBanner({ alerts = [] }) {
  const critical = alerts.filter(a => a.severity === 'critical');
  if (!critical.length) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle size={18} className="flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{critical[0].title}: {critical[0].message}</p>
        </div>
        {critical.length > 1 && <span className="text-xs bg-red-700 px-2 py-0.5 rounded-full">+{critical.length - 1} more</span>}
      </div>
    </div>
  );
}
