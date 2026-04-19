import React, { useState } from 'react';
import { Heart, Mic, MicOff, Phone, QrCode } from 'lucide-react';
import { aiService, appointmentService } from '../services';
import toast from 'react-hot-toast';

// Kiosk mode: simplified, large-text, touch-friendly UI for rural health kiosks
export default function KioskInterface() {
  const [step, setStep] = useState('home'); // home | symptoms | result | book
  const [healthCard, setHealthCard] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const SYMPTOM_BUTTONS = [
    { hi: 'बुखार', en: 'fever' }, { hi: 'खांसी', en: 'cough' },
    { hi: 'सिरदर्द', en: 'headache' }, { hi: 'उल्टी', en: 'vomiting' },
    { hi: 'दस्त', en: 'diarrhea' }, { hi: 'सीने में दर्द', en: 'chest pain' },
    { hi: 'सांस लेने में तकलीफ', en: 'difficulty breathing' }, { hi: 'थकान', en: 'fatigue' },
    { hi: 'जोड़ों में दर्द', en: 'joint pain' }, { hi: 'पेट दर्द', en: 'abdominal pain' },
  ];

  const toggleSymptom = (s) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) { toast.error('Voice not supported'); return; }
    const r = new window.webkitSpeechRecognition();
    r.lang = 'hi-IN';
    r.onstart = () => setListening(true);
    r.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      SYMPTOM_BUTTONS.forEach(s => { if (text.includes(s.hi) || text.includes(s.en)) toggleSymptom(s.en); });
      toast.success(`Heard: "${text}"`);
    };
    r.onend = () => setListening(false);
    r.start();
  };

  const analyze = async () => {
    if (!symptoms.length) { toast.error('Please select symptoms'); return; }
    setLoading(true);
    try {
      const { data } = await aiService.analyze({ symptoms });
      setResult(data);
      setStep('result');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-blue-800 px-6 py-4 flex items-center gap-3">
        <Heart className="text-red-400" size={32} />
        <div>
          <h1 className="text-2xl font-bold">TeleCare Kiosk</h1>
          <p className="text-blue-300 text-sm">स्वास्थ्य सेवा केंद्र</p>
        </div>
      </div>

      <div className="flex-1 p-6">
        {step === 'home' && (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome / स्वागत है</h2>
            <p className="text-blue-300 mb-8">Enter your Health Card ID to begin</p>
            <input
              className="w-full bg-white/10 border border-white/30 rounded-xl px-6 py-4 text-2xl text-center placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 mb-6"
              placeholder="HC-XXXXXXXX"
              value={healthCard}
              onChange={e => setHealthCard(e.target.value.toUpperCase())}
            />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep('symptoms')}
                className="bg-green-500 hover:bg-green-600 text-white py-5 rounded-xl text-xl font-bold transition-colors">
                Check Symptoms<br /><span className="text-sm font-normal">लक्षण जांचें</span>
              </button>
              <button onClick={() => toast.info('Please call 108 for emergency')}
                className="bg-red-500 hover:bg-red-600 text-white py-5 rounded-xl text-xl font-bold transition-colors">
                Emergency<br /><span className="text-sm font-normal">आपातकाल — 108</span>
              </button>
            </div>
          </div>
        )}

        {step === 'symptoms' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Select Symptoms / लक्षण चुनें</h2>
            <p className="text-blue-300 mb-4">Tap all that apply or use voice</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {SYMPTOM_BUTTONS.map(s => (
                <button key={s.en} onClick={() => toggleSymptom(s.en)}
                  className={`py-4 px-4 rounded-xl text-left transition-colors border-2 ${symptoms.includes(s.en) ? 'bg-green-500 border-green-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                  <p className="text-lg font-medium">{s.hi}</p>
                  <p className="text-sm text-white/70">{s.en}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={startVoice}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${listening ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}>
                {listening ? <MicOff size={20} /> : <Mic size={20} />}
                {listening ? 'Listening...' : 'Voice Input'}
              </button>
              <button onClick={analyze} disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 py-3 rounded-xl font-bold text-lg transition-colors disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Analyze / विश्लेषण करें'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-xl p-6 mb-4 ${result.urgency === 'critical' ? 'bg-red-600' : result.urgency === 'medium' ? 'bg-orange-500' : 'bg-green-600'}`}>
              <h2 className="text-3xl font-bold mb-1">
                {result.urgency === 'critical' ? '🚨 CRITICAL' : result.urgency === 'medium' ? '⚠️ MEDIUM' : '✅ LOW RISK'}
              </h2>
              <p className="text-white/90">
                {result.urgency === 'critical' ? 'Call 108 immediately! / तुरंत 108 पर कॉल करें!' :
                 result.urgency === 'medium' ? 'See a doctor today / आज डॉक्टर से मिलें' :
                 'Schedule a routine visit / नियमित जांच करवाएं'}
              </p>
            </div>

            {result.diseases?.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <h3 className="font-semibold mb-2">Possible Conditions:</h3>
                {result.diseases.slice(0, 3).map(d => (
                  <div key={d.name} className="flex justify-between py-1">
                    <span>{d.name}</span>
                    <span className="text-white/70">{Math.round(d.probability * 100)}%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep('home')} className="bg-white/20 hover:bg-white/30 py-4 rounded-xl font-medium">
                Back to Home
              </button>
              <button onClick={() => toast.info('Please visit the nearest PHC or call 104')}
                className="bg-primary-600 hover:bg-primary-700 py-4 rounded-xl font-bold">
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-800 px-6 py-3 text-center text-blue-300 text-sm">
        Emergency: 108 | Health Helpline: 104 | TeleCare Support: 1800-XXX-XXXX
      </div>
    </div>
  );
}
