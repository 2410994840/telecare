import React, { useState } from 'react';
import { aiService } from '../../services';
import { Mic, MicOff, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_SYMPTOMS = ['fever', 'cough', 'headache', 'fatigue', 'vomiting', 'diarrhea', 'chest pain', 'difficulty breathing', 'joint pain', 'rash', 'abdominal pain', 'excessive thirst'];

export default function SymptomChecker() {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setCustom(prev => prev ? `${prev}, ${transcript}` : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const analyze = async () => {
    const allSymptoms = [...selected, ...custom.split(',').map(s => s.trim()).filter(Boolean)];
    if (!allSymptoms.length) { toast.error('Please select at least one symptom'); return; }
    setLoading(true);
    try {
      const { data } = await aiService.analyze({ symptoms: allSymptoms });
      setResult(data);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = { low: 'green', medium: 'orange', critical: 'red' };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI Symptom Checker</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Select your symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selected.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input className="input flex-1" placeholder="Or type symptoms here..." value={custom}
            onChange={e => setCustom(e.target.value)} />
          <button onClick={startVoice} className={`px-3 py-2 rounded-lg border transition-colors ${listening ? 'bg-red-100 border-red-300 text-red-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        <button onClick={analyze} className="btn-primary w-full" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </div>

      {result && (
        <div className={`card border-l-4 ${result.urgency === 'critical' ? 'border-red-500' : result.urgency === 'medium' ? 'border-orange-500' : 'border-green-500'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className={`text-${urgencyColor[result.urgency]}-500`} />
            <h4 className="font-semibold">Analysis Result</h4>
            <span className={`badge-${result.urgency} ml-auto`}>{result.urgency.toUpperCase()}</span>
          </div>

          {result.emergency_escalate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-red-700 font-medium text-sm">⚠️ Emergency! Call 108 immediately</p>
            </div>
          )}

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Possible Conditions:</p>
            {result.diseases?.map(d => (
              <div key={d.name} className="flex items-center justify-between py-1">
                <span className="text-sm">{d.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${d.probability * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(d.probability * 100)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
            {result.recommendations?.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 py-0.5">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                {r}
              </div>
            ))}
          </div>

          {result.fallback && <p className="text-xs text-gray-400 mt-2">* Rule-based analysis (AI service unavailable)</p>}
        </div>
      )}
    </div>
  );
}
