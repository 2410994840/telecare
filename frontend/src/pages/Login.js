import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      toast.success('Login successful');
      if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-red-500" size={28} />
          <h1 className="text-2xl font-bold text-primary-700">TeleCare Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input w-full" type="tel" placeholder="Phone number"
              value={form.phone} onChange={e => set('phone', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input w-full" type="password" placeholder="Password"
              value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          New user? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
