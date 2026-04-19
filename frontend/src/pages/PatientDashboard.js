import React, { useState, useEffect } from 'react';
import Navbar from '../components/auth/Navbar';
import { appointmentService, prescriptionService, aiService, alertService, schemeService } from '../services';
import { Calendar, FileText, Activity, Bell, Shield, Mic, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BookAppointment from '../components/patient/BookAppointment';
import SymptomChecker from '../components/patient/SymptomChecker';
import PrescriptionViewer from '../components/patient/PrescriptionViewer';
import AlertBanner from '../components/dashboard/AlertBanner';
import SchemeChecker from '../components/patient/SchemeChecker';
import PatientMap from '../components/patient/PatientMap';

const NAV = [
  { path: '/patient', label: 'Dashboard' },
  { path: '/patient/appointments', label: 'Appointments' },
  { path: '/patient/prescriptions', label: 'Prescriptions' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchAppointments = () =>
    appointmentService.getMyAppointments().then(r => setAppointments(r.data)).catch(() => {});

  useEffect(() => {
    fetchAppointments();
    alertService.getAlerts().then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'book', label: 'Book Appointment', icon: Calendar },
    { id: 'symptoms', label: 'Check Symptoms', icon: Mic },
    { id: 'map', label: 'Nearby Clinics', icon: MapPin },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'schemes', label: 'Govt Schemes', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navItems={NAV} />
      <AlertBanner alerts={alerts} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h2>
          <p className="text-gray-500 text-sm">{user?.village}, {user?.district}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Upcoming Appointments</h3>
              {appointments.filter(a => a.status !== 'completed').slice(0, 3).map(apt => (
                <div key={apt._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{new Date(apt.scheduledAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{apt.type} · Dr. {apt.doctor?.user?.name || 'Assigned'}</p>
                  </div>
                  <span className={`badge-${apt.urgency}`}>{apt.urgency}</span>
                </div>
              ))}
              {appointments.filter(a => a.status !== 'completed').length === 0 && <p className="text-sm text-gray-400">No upcoming appointments</p>}
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Health Card</h3>
              <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-lg p-4 text-white">
                <p className="text-xs opacity-80">Health Card ID</p>
                <p className="font-mono font-bold text-lg">{user?.healthCardId || 'HC-XXXXXXXX'}</p>
                <p className="text-sm mt-2">{user?.name}</p>
                <p className="text-xs opacity-80">{user?.village}, {user?.state}</p>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setTab('book')} className="btn-primary w-full text-sm">Book Appointment</button>
                <button onClick={() => setTab('symptoms')} className="btn-secondary w-full text-sm">Check Symptoms</button>
                <button onClick={() => setTab('prescriptions')} className="btn-secondary w-full text-sm">View Prescriptions</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'book' && <BookAppointment onBooked={() => { fetchAppointments(); setTab('home'); toast.success('Appointment booked!'); }} />}
        {tab === 'symptoms' && <SymptomChecker />}
        {tab === 'prescriptions' && <PrescriptionViewer />}
{tab === 'map' && <PatientMap />}
{tab === 'schemes' && <SchemeChecker />}
      </div>
    </div>
  );
}
