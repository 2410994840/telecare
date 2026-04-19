import React, { useState, useEffect } from 'react';
import Navbar from '../components/auth/Navbar';
import { adminService, alertService } from '../services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import VillageMap from '../components/admin/VillageMap';
import { Users, Stethoscope, Calendar, AlertTriangle, Activity, Map } from 'lucide-react';

const NAV = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/doctors', label: 'Doctors' },
  { path: '/admin/alerts', label: 'Alerts' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [villageStats, setVillageStats] = useState([]);
  const [doctorLoad, setDoctorLoad] = useState([]);
  const [trends, setTrends] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    adminService.getStats().then(r => setStats(r.data)).catch(() => {});
    adminService.getVillageStats().then(r => setVillageStats(r.data)).catch(() => {});
    adminService.getDoctorLoad().then(r => setDoctorLoad(r.data)).catch(() => {});
    adminService.getDiseaseTrends().then(r => setTrends(r.data)).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'blue' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'green' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'orange' },
    { label: 'Critical Cases', value: stats.criticalAlerts, icon: AlertTriangle, color: 'red' },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'villages', label: 'Village Map', icon: Map },
    { id: 'doctors', label: 'Doctor Load', icon: Stethoscope },
    { id: 'trends', label: 'Disease Trends', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navItems={NAV} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <div key={card.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value ?? '—'}</p>
                </div>
                <card.icon size={24} className={`text-${card.color}-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'villages' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Village Appointment Heatmap</h3>
            <VillageMap villageStats={villageStats} />
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Has Critical Cases</span>
              <span className="text-gray-400">Circle size = appointment volume</span>
            </div>
          </div>
        )}

        {tab === 'doctors' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Doctor Load Balancing</h3>
            <div className="space-y-3">
              {doctorLoad.map(d => (
                <div key={d.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium truncate">{d.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${d.loadPercent > 80 ? 'bg-red-500' : d.loadPercent > 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(d.loadPercent, 100)}%` }} />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-right">{d.currentLoad}/{d.maxLoad}</span>
                  <span className={`w-2 h-2 rounded-full ${d.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'trends' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Disease Trends by Village</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Symptom</th><th className="text-left py-2">Village</th><th className="text-right py-2">Count</th></tr></thead>
                <tbody>
                  {trends.slice(0, 20).map((t, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2">{t._id?.symptom}</td>
                      <td className="py-2 text-gray-500">{t._id?.village || 'Unknown'}</td>
                      <td className="py-2 text-right font-medium">{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-4">Village Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={villageStats.slice(0, 5).map(v => ({ name: v._id || 'Unknown', value: v.count }))}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {villageStats.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">System Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Backend API', status: 'operational' },
                  { label: 'AI Service', status: 'operational' },
                  { label: 'WebSocket', status: 'operational' },
                  { label: 'Database', status: 'operational' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1">
                    <span className="text-sm">{s.label}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
