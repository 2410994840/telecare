import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService, prescriptionService } from '../services';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { Send, PhoneOff, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { messages, connected, sendMessage } = useWebSocket(id, token);
  const [input, setInput] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [showPrescribe, setShowPrescribe] = useState(false);
  const [prescription, setPrescription] = useState({ diagnosis: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }], advice: '' });
  const messagesEnd = useRef(null);

  useEffect(() => {
    consultationService.get(id).then(r => setConsultation(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const endConsultation = async () => {
    try {
      await consultationService.end(id, { diagnosis: prescription.diagnosis });
      toast.success('Consultation ended');
      navigate('/doctor');
    } catch {
      toast.error('Failed to end consultation');
    }
  };

  const submitPrescription = async () => {
    try {
      await prescriptionService.create({
        consultation: id,
        patient: consultation?.patient?._id,
        doctor: consultation?.doctor?._id,
        ...prescription
      });
      toast.success('Prescription saved');
      setShowPrescribe(false);
      endConsultation();
    } catch {
      toast.error('Failed to save prescription');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-white font-medium">Consultation Room</span>
          {!connected && <span className="text-yellow-400 text-xs">Offline — messages queued</span>}
        </div>
        <div className="flex gap-2">
          {user?.role === 'doctor' && (
            <button onClick={() => setShowPrescribe(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
              Write Prescription
            </button>
          )}
          <button onClick={endConsultation} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-red-700">
            <PhoneOff size={14} /> End
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isMine || msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${msg.isMine || msg.senderId === user?._id ? 'bg-primary-600 text-white' : 'bg-white text-gray-800'}`}>
              <p>{msg.message}</p>
              <p className={`text-xs mt-1 ${msg.isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.isOffline && ' (offline)'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-gray-800 p-4 flex gap-3">
        <input className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700">
          <Send size={18} />
        </button>
      </form>

      {/* Prescription Modal */}
      {showPrescribe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Write Prescription</h3>
            <div className="space-y-3">
              <input className="input" placeholder="Diagnosis" value={prescription.diagnosis}
                onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))} />
              {prescription.medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                  <input className="input col-span-2" placeholder="Medicine name" value={med.name}
                    onChange={e => { const m = [...prescription.medicines]; m[i].name = e.target.value; setPrescription(p => ({ ...p, medicines: m })); }} />
                  <input className="input" placeholder="Dosage (e.g. 500mg)" value={med.dosage}
                    onChange={e => { const m = [...prescription.medicines]; m[i].dosage = e.target.value; setPrescription(p => ({ ...p, medicines: m })); }} />
                  <input className="input" placeholder="Frequency (e.g. 3x daily)" value={med.frequency}
                    onChange={e => { const m = [...prescription.medicines]; m[i].frequency = e.target.value; setPrescription(p => ({ ...p, medicines: m })); }} />
                  <input className="input col-span-2" placeholder="Duration (e.g. 5 days)" value={med.duration}
                    onChange={e => { const m = [...prescription.medicines]; m[i].duration = e.target.value; setPrescription(p => ({ ...p, medicines: m })); }} />
                </div>
              ))}
              <button type="button" onClick={() => setPrescription(p => ({ ...p, medicines: [...p.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }))}
                className="btn-secondary w-full text-sm">+ Add Medicine</button>
              <textarea className="input" rows={3} placeholder="Advice / Notes"
                value={prescription.advice} onChange={e => setPrescription(p => ({ ...p, advice: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={submitPrescription} className="btn-primary flex-1">Save & End Consultation</button>
              <button onClick={() => setShowPrescribe(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
