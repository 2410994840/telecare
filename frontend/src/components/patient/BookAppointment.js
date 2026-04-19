import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookAppointment({ onBooked }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', type: 'video', symptoms: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    appointmentService.getAvailableDoctors()
      .then(r => setDoctors(r.data))
      .catch(() => toast.error('Failed to load doctors'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('User not logged in. Please login again.'); return; }
    setLoading(true);
    try {
      const symptoms = form.symptoms.split(',').map(s => s.trim()).filter(Boolean);
      await appointmentService.book({
        doctorId: form.doctorId,
        scheduledAt: form.scheduledAt,
        type: form.type,
        symptoms,
      });
      toast.success('Appointment booked successfully!');
      onBooked?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-lg mx-auto">
      <h3 className="font-semibold text-lg mb-4">Book Appointment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <select required value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select a doctor</option>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>
                Dr. {d.user?.name} — {d.specialization} {d.isOnline ? '🟢' : '⚫'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <input required type="datetime-local" value={form.scheduledAt}
            onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm">
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Symptoms (comma-separated)</label>
          <input type="text" placeholder="e.g. fever, headache, cough" value={form.symptoms}
            onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}
