import React, { useState } from 'react';
import { schemeService } from '../../services';
import { Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchemeChecker() {
  const [form, setForm] = useState({ age: '', gender: 'male', income: '', conditions: '', category: '' });
  const [schemes, setSchemes] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const check = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await schemeService.checkEligibility({
        age: parseInt(form.age),
        gender: form.gender,
        income: form.income ? parseInt(form.income) : undefined,
        conditions: form.conditions.split(',').map(s => s.trim()).filter(Boolean),
        category: form.category || undefined
      });
      setSchemes(data);
    } catch {
      toast.error('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold">Government Scheme Eligibility</h3>
        </div>

        <form onSubmit={check} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input className="input" type="number" placeholder="Your age" value={form.age} onChange={e => set('age', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
            <input className="input" type="number" placeholder="Annual income" value={form.income} onChange={e => set('income', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">General</option>
              <option value="BPL">BPL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Conditions (comma separated)</label>
            <input className="input" placeholder="e.g. diabetes, hypertension" value={form.conditions} onChange={e => set('conditions', e.target.value)} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </div>
        </form>
      </div>

      {schemes && (
        <div className="card">
          <h4 className="font-semibold mb-3">Eligible Schemes ({schemes.length})</h4>
          {schemes.length === 0 && <p className="text-gray-400 text-sm">No schemes found for your profile</p>}
          {schemes.map(s => (
            <div key={s.id} className="flex items-start gap-3 py-3 border-b last:border-0">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
                {s.coverage && <p className="text-xs text-primary-600 mt-0.5">Coverage: ₹{s.coverage.toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
