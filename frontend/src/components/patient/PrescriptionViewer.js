import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../../services';
import { Pill, Calendar, User } from 'lucide-react';

export default function PrescriptionViewer() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.getMy()
      .then(r => setPrescriptions(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card"><p className="text-gray-400">Loading prescriptions...</p></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Prescriptions</h3>
      {prescriptions.length === 0 && <div className="card"><p className="text-gray-400">No prescriptions found</p></div>}
      {prescriptions.map(p => (
        <div key={p._id} className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">Dr. {p.doctor?.user?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar size={14} />
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {p.isActive ? 'Active' : 'Expired'}
            </span>
          </div>

          {p.diagnosis && <p className="text-sm text-gray-600 mb-3"><strong>Diagnosis:</strong> {p.diagnosis}</p>}

          <div className="space-y-2">
            {p.medicines?.map((med, i) => (
              <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                <Pill size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{med.name}</p>
                  <p className="text-xs text-gray-600">{med.dosage} — {med.frequency} for {med.duration}</p>
                  {med.instructions && <p className="text-xs text-gray-500 mt-0.5">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>

          {p.advice && <p className="text-sm text-gray-600 mt-3 pt-3 border-t"><strong>Advice:</strong> {p.advice}</p>}
          {p.followUpDate && <p className="text-sm text-orange-600 mt-2">Follow-up: {new Date(p.followUpDate).toLocaleDateString()}</p>}
        </div>
      ))}
    </div>
  );
}
