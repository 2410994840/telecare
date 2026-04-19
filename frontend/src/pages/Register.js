import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

const ROLES = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'asha_worker', label: 'ASHA Worker' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'patient', village: '', district: '', state: '', language: 'hi' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-red-500" size={28} />
          <h1 className="text-2xl font-bold text-primary-700">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input" type="tel" placeholder="Phone number" value={form.phone} onChange={e => set('phone', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select className="input" value={form.language} onChange={e => set('language', e.target.value)}>
              <option value="hi">Hindi</option>
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
            <input className="input" placeholder="Village name" value={form.village} onChange={e => set('village', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <input className="input" placeholder="District" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input className="input" placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
