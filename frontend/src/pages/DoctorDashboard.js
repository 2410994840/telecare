import React, { useState, useEffect } from 'react';
import Navbar from '../components/auth/Navbar';
import { appointmentService, consultationService, prescriptionService } from '../services';
import { useNavigate } from 'react-router-dom';
import { Video, Phone, MessageSquare, User, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [{ path: '/doctor', label: 'Queue' }, { path: '/doctor/history', label: 'History' }];

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('queue');
  const navigate = useNavigate();

  useEffect(() => {
    appointmentService.getDoctorAppointments().then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const startConsultation = async (apt) => {
    try {
      const { data } = await consultationService.start(apt._id, apt.type);
      navigate(`/consultation/${data._id}`);
    } catch {
      toast.error('Failed to start consultation');
    }
  };

  const typeIcon = { video: Video, audio: Phone, text: MessageSquare };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navItems={NAV} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">{appointments.length} patients in queue</span>
          </div>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-400">No appointments in queue</p>
            </div>
          )}
          {appointments.map(apt => {
            const Icon = typeIcon[apt.type] || Video;
            const patient = apt.patient?.user;
            return (
              <div key={apt._id} className={`card flex items-center gap-4 ${apt.urgency === 'critical' ? 'border-l-4 border-red-500' : apt.urgency === 'medium' ? 'border-l-4 border-orange-400' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{patient?.name || 'Unknown'}</span>
                    <span className={`badge-${apt.urgency}`}>{apt.urgency}</span>
                    {apt.urgency === 'critical' && <AlertTriangle size={14} className="text-red-500" />}
                  </div>
                  <p className="text-sm text-gray-500">{patient?.village} • {patient?.phone}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {new Date(apt.scheduledAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Icon size={12} />
                      {apt.type}
                    </div>
                  </div>
                  {apt.symptoms?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {apt.symptoms.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startConsultation(apt)} className="btn-primary text-sm flex items-center gap-1">
                    <Icon size={14} /> Start
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
