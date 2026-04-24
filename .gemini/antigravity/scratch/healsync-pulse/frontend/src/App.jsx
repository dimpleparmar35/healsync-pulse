import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, FileText, Ticket, BarChart3, 
  Activity, UserPlus, Microscope, ShoppingBag, 
  ShieldAlert, Sparkles, Send, Mic, Users, 
  BrainCircuit, Zap, UploadCloud, ChevronRight, X
} from 'lucide-react';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [session, setSession] = useState('landing'); // landing, auth, active
  const [view, setView] = useState('patient'); 
  const [vitals, setVitals] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "HealSync Pulse AI active. How can I help you today?", sender: 'bot' }]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    if (session === 'active') {
      fetchData();
      if (!isVoiceActive) initVoice();
    }
  }, [view, session]);

  const fetchData = async () => {
    try {
      const qRes = await axios.get(`${API_BASE}/queue`);
      setQueue(qRes.data);
      const vRes = await axios.get(`${API_BASE}/vitals/1`);
      setVitals(vRes.data);
    } catch (err) {
      console.error("API Fetch Error:", err);
    }
  };

  const initVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.includes('admin')) setView('admin');
      if (transcript.includes('doctor')) setView('doctor');
      if (transcript.includes('dashboard')) setView('patient');
      if (transcript.includes('records')) setView('records');
      if (transcript.includes('chat')) setIsChatOpen(true);
    };
    recognition.start();
    setIsVoiceActive(true);
  };

  if (session === 'landing') {
    return <LandingPage onEnter={() => setSession('auth')} />;
  }

  if (session === 'auth') {
    return <AuthPage onLogin={() => setSession('active')} />;
  }

  const handleCallPatient = async (id) => {
    try {
      await axios.post(`${API_BASE}/queue/call/${id}`);
      fetchData();
    } catch (err) {
      console.error("Call Patient Error:", err);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo">
          <div className="logo-icon glass neo-shadow">
            <Activity className="text-pulse" size={32} color="#00F2FF" />
          </div>
          <div style={{ marginLeft: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>HealSync</h2>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', letterSpacing: '2px' }}>PULSE OS</span>
          </div>
        </div>

        <nav style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'patient', icon: LayoutGrid, label: 'Dashboard' },
            { id: 'records', icon: FileText, label: 'Records' },
            { id: 'tokens', icon: Ticket, label: 'Queue' },
            { id: 'analytics', icon: BarChart3, label: 'Health' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-btn ${view === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="voice-indicator glass">
          <div className={`dot ${isVoiceActive ? 'pulse' : ''}`}></div>
          <span>Voice Nav Active</span>
        </div>

        <div className="view-toggle" style={{ marginTop: 'auto' }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => {
              const order = ['patient', 'doctor', 'reception', 'admin', 'records'];
              const next = order[(order.indexOf(view) + 1) % order.length];
              setView(next);
            }}
          >
            <Users size={18} /> Staff Portal
          </button>
          <div className="creator-tag">
            Architected by<br/>
            <span className="accent-text" style={{ fontWeight: 800 }}>Dimple Parmar</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>{
              view === 'patient' ? 'Patient Super App' :
              view === 'doctor' ? 'Doctor Control Panel' :
              view === 'reception' ? 'Reception & Front Desk' :
              view === 'admin' ? 'Hospital Analytics' : 'Medical Records & Twin'
            }</h1>
            <p style={{ color: '#94A3B8' }}>Welcome back, John Doe</p>
          </div>
          <div className="user-profile glass">
            <div className="avatar"></div>
            <ChevronRight size={16} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'patient' && <PatientDashboard vitals={vitals} queue={queue} />}
            {view === 'doctor' && <DoctorPanel queue={queue} onCall={handleCallPatient} />}
            {view === 'reception' && <ReceptionistDashboard queue={queue} onCall={handleCallPatient} />}
            {view === 'admin' && <AdminDashboard />}
            {view === 'records' && <RecordsView vitals={vitals} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Elements */}
      <button className="chat-trigger glass neo-shadow" onClick={() => setIsChatOpen(true)}>
        <Sparkles size={24} color="#00F2FF" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            className="chat-modal glass-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="chat-container glass"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="bot-avatar glass"><BrainCircuit size={20} color="#00F2FF" /></div>
                  <div>
                    <h4>Pulse AI</h4>
                    <span style={{ fontSize: '0.7rem', color: '#10B981' }}>● Emotion Sensing Active</span>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setIsChatOpen(false)}><X size={20}/></button>
              </div>
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="chat-input glass">
                <input type="text" placeholder="Describe your symptoms..." />
                <button className="btn-icon active"><Send size={18}/></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          width: 100%;
          border: none;
          background: transparent;
          color: #94A3B8;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
        }
        .nav-btn.active {
          background: rgba(0, 242, 255, 0.05);
          color: #00F2FF;
          border: 1px solid rgba(0, 242, 255, 0.2);
        }
        .voice-indicator {
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #94A3B8;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #00F2FF;
          border-radius: 50%;
        }
        .dot.pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 242, 255, 0.7); }
          100% { box-shadow: 0 0 0 10px rgba(0, 242, 255, 0); }
        }
        .creator-tag {
          margin-top: 1.5rem;
          font-size: 0.7rem;
          color: #94A3B8;
          text-align: center;
          opacity: 0.7;
        }
        .chat-trigger {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
        }
        .chat-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
          z-index: 1000;
        }
        .chat-container {
          width: 400px;
          height: 600px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .msg {
          padding: 1rem;
          border-radius: 16px;
          max-width: 80%;
          font-size: 0.9rem;
        }
        .msg.bot { background: rgba(255,255,255,0.05); align-self: flex-start; }
        .msg.user { background: #00F2FF; color: #05070A; align-self: flex-end; font-weight: 600; }
        .chat-input {
          padding: 1.5rem;
          display: flex;
          gap: 0.75rem;
        }
        .chat-input input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          outline: none;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: #94A3B8;
          cursor: pointer;
        }
        .btn-icon.active { color: #00F2FF; }
      `}</style>
    </div>
  );
};

// --- Sub-components ---

const PatientDashboard = ({ vitals, queue }) => {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Health Trend',
      data: [65, 78, 66, 89, 75, 80, 84],
      borderColor: '#00F2FF',
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  return (
    <div className="dashboard-grid">
      <div className="card glass neo-shadow" style={{ gridColumn: 'span 1' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Zap size={20} color="#00F2FF" /> Pulse Score
        </h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Doughnut 
            data={{
              datasets: [{
                data: [84, 16],
                backgroundColor: ['#00F2FF', 'rgba(255,255,255,0.05)'],
                borderWidth: 0,
                cutout: '85%'
              }]
            }}
            options={{ plugins: { tooltip: { enabled: false } } }}
          />
          <div style={{ position: 'absolute', fontSize: '3rem', fontWeight: 800 }}>84</div>
        </div>
      </div>

      <div className="card glass" style={{ gridColumn: 'span 2' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Active Token</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div>
            <span style={{ fontSize: '4rem', fontWeight: 900, color: '#00F2FF' }}>B-42</span>
            <p style={{ color: '#94A3B8' }}>St. Mary's General - Cardiology</p>
          </div>
          <div style={{ paddingLeft: '3rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>~12 Mins Wait</div>
            <p style={{ color: '#10B981' }}>Leave home by 11:45 AM</p>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ gridColumn: 'span 3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3>Health Vectors (Digital Twin)</h3>
          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Syncing with Apple Health...</span>
        </div>
        <div style={{ height: '250px' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { display: false } } } }} />
        </div>
      </div>
    </div>
  );
};

const DoctorPanel = ({ queue, onCall }) => (
  <div className="dashboard-grid">
    {/* UNIQUE TOOL: AI Clinical Summary */}
    <div className="card glass-premium" style={{ gridColumn: 'span 3', marginBottom: '1rem', border: '1px solid rgba(0, 242, 255, 0.3)' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Sparkles color="#00F2FF" size={24} />
          <h3 className="accent-text">AI Clinical Intelligence Summary (AIGCS)</h3>
       </div>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          <div className="summary-item">
            <h4 style={{ fontSize: '0.8rem', color: '#94A3B8' }}>3-SECOND TL;DR</h4>
            <p style={{ fontSize: '0.95rem' }}>Patient John Doe (B-42) has <strong>recurrent chest tightness</strong>. History of arrhythmia (2025). Stress levels are <strong>HIGH</strong> today.</p>
          </div>
          <div className="summary-item">
            <h4 style={{ fontSize: '0.8rem', color: '#94A3B8' }}>CRITICAL ALERTS</h4>
            <ul style={{ fontSize: '0.9rem', color: '#EF4444', listStyle: 'none' }}>
              <li>● Elevated Resting HR (92 bpm)</li>
              <li>● Allergic to Penicillin</li>
            </ul>
          </div>
          <div className="summary-item">
            <h4 style={{ fontSize: '0.8rem', color: '#94A3B8' }}>SUGGESTED ACTION</h4>
            <p style={{ fontSize: '0.9rem' }}>Immediate ECG required. AI predicts <strong>84% probability</strong> of pre-syncopal episode.</p>
          </div>
       </div>
    </div>

    <div className="card glass" style={{ gridColumn: 'span 2' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Live Examination Queue</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {queue.filter(p => p.status === 'Waiting').map((p, i) => (
          <div key={i} className="queue-item glass-hover" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontWeight: 800, color: '#00F2FF', width: '40px' }}>{p.token_number}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{p.patient_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{p.department} • Priority: VIP</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onCall(p.id)}>Enter Consult</button>
          </div>
        ))}
      </div>
    </div>

    <div className="card glass">
      <h3 style={{ marginBottom: '1.5rem' }}>Real-time Doctor Sync</h3>
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800 }}>04</div>
        <p style={{ color: '#94A3B8' }}>Patients Remaining</p>
        <div className="progress-bar" style={{ marginTop: '2rem', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <div style={{ width: '60%', height: '100%', background: '#00F2FF', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const RecordsView = ({ vitals }) => (
  <div className="dashboard-grid">
    {/* UNIQUE TOOL: Holographic Digital Twin Body Map */}
    <div className="card glass" style={{ gridColumn: 'span 2', minHeight: '500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3>Holographic Digital Twin Mirror</h3>
        <div className="badge-active" style={{ fontSize: '0.7rem' }}>LIVE BIOMETRIC SYNC</div>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
         <div className="body-map-container" style={{ flex: 1, textAlign: 'center' }}>
            {/* SVG Placeholder for Body Map */}
            <svg viewBox="0 0 100 200" style={{ height: '400px', filter: 'drop-shadow(0 0 10px #00F2FF)' }}>
              <path d="M50 10 L60 20 L50 30 L40 20 Z" fill="#00F2FF" opacity="0.8" /> {/* Head */}
              <rect x="40" y="32" width="20" height="50" rx="5" fill="#00F2FF" opacity="0.3" /> {/* Torso */}
              <circle cx="50" cy="45" r="3" fill="#EF4444">
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
              </circle> {/* Heart Pulse */}
              <path d="M40 35 L25 70" stroke="#00F2FF" strokeWidth="3" /> {/* Arm L */}
              <path d="M60 35 L75 70" stroke="#00F2FF" strokeWidth="3" /> {/* Arm R */}
              <path d="M42 82 L35 130" stroke="#00F2FF" strokeWidth="3" /> {/* Leg L */}
              <path d="M58 82 L65 130" stroke="#00F2FF" strokeWidth="3" /> {/* Leg R */}
            </svg>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1rem' }}>Click organ for history</p>
         </div>
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-premium" style={{ padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#00F2FF' }}>HEART HEALTH</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>72 BPM</p>
              <div style={{ fontSize: '0.7rem', color: '#10B981' }}>Rhythm: Normal Sinus</div>
            </div>
            <div className="glass-premium" style={{ padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#8B5CF6' }}>LUNG CAPACITY</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>98% O2</p>
              <div style={{ fontSize: '0.7rem', color: '#10B981' }}>Breath Rate: 14/m</div>
            </div>
            <div className="glass-premium" style={{ padding: '1rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#10B981' }}>BLOOD PROFILE</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>120/80</p>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Last sync: 2m ago</div>
            </div>
         </div>
      </div>
    </div>

    <div className="card glass" style={{ gridColumn: 'span 1' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>AI Report Analysis</h3>
      <div className="ocr-upload glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.1)' }}>
        <UploadCloud size={32} color="#00F2FF" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '0.8rem' }}>Drop Blood Report PDF</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>Browse</button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>RECENTLY INDEXED</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div className="glass-premium" style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>BloodPanel_Oct.pdf</span>
              <Activity size={14} color="#10B981" />
           </div>
           <div className="glass-premium" style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>ECG_Nov_05.png</span>
              <Activity size={14} color="#10B981" />
           </div>
        </div>
      </div>
    </div>
  </div>
);

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container glass-blur">
      <motion.div 
        className="auth-card glass neo-shadow"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="auth-header">
          <div className="logo-icon glass"><Activity color="#00F2FF" /></div>
          <h2>{isLogin ? 'Welcome to Pulse' : 'Create Account'}</h2>
          <p style={{ color: '#94A3B8' }}>{isLogin ? 'Secure Entry to HealSync Ecosystem' : 'Join the Future of Healthcare'}</p>
        </div>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Dimple Parmar" required />
            </div>
          )}
          <div className="input-group">
            <label>Medical Email</label>
            <input type="email" placeholder="name@pulse.health" required />
          </div>
          <div className="input-group">
            <label>Access Key</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            {isLogin ? 'Authorize Access' : 'Create Pulse ID'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#00F2FF', cursor: 'pointer' }}>
            {isLogin ? "Don't have a Pulse ID? Register" : 'Already have an ID? Login'}
          </button>
          <div className="creator-tag" style={{ marginTop: '2rem' }}>
            Architected by <span className="accent-text" style={{ fontWeight: 800 }}>Dimple Parmar</span>
          </div>
        </div>
      </motion.div>

      <style jsx="true">{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(0, 242, 255, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem;
          border-radius: 32px;
          text-align: center;
        }
        .auth-header {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .auth-form {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.8rem;
          color: #94A3B8;
          font-weight: 600;
        }
        .input-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.8rem 1rem;
          border-radius: 12px;
          color: white;
          outline: none;
          transition: 0.2s;
        }
        .input-group input:focus {
          border-color: #00F2FF;
          background: rgba(0, 242, 255, 0.02);
        }
        .auth-footer {
          margin-top: 2rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">
           <Activity color="#0052CC" size={24} />
           <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>HealSync Pulse</span>
        </div>
        <div className="nav-links">
           <button className="btn-text">Solutions</button>
           <button className="btn-text">Innovation</button>
           <button className="btn btn-primary" onClick={onEnter}>Portal Access</button>
        </div>
      </nav>

      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="badge-new">NEW: AI CLINICAL INTELLIGENCE</div>
          <h1>Unified Healthcare <br/><span className="accent-text">Digital Experience Platform</span></h1>
          <p>HealSync Pulse connects hospitals, doctors, and patients with an AI-driven ecosystem that redefines clinical efficiency and patient engagement.</p>
          <div className="hero-ctas">
             <button className="btn btn-primary btn-lg" onClick={onEnter}>Launch Ecosystem</button>
             <button className="btn btn-secondary btn-lg">Watch Innovation Film</button>
          </div>
        </motion.div>
        <div className="hero-mockup glass neo-shadow">
           <div className="mockup-header">
              <div className="dot-group"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
              <span>HealSync | Digital Twin Interface</span>
           </div>
           <div className="mockup-content">
              <div className="skeleton-line" style={{ width: '40%' }}></div>
              <div className="skeleton-grid">
                 <div className="skeleton-card"></div>
                 <div className="skeleton-card"></div>
                 <div className="skeleton-card"></div>
              </div>
           </div>
        </div>
      </section>

      <section className="features-grid">
         {[
           { title: 'AI Triage & Sentiment', desc: 'Predict clinical urgency before the patient arrives using NLP triage.', icon: BrainCircuit },
           { title: 'Digital Twin Mirror', desc: 'Interactive 3D biometric visualizations of the human health journey.', icon: Zap },
           { title: 'Smart Token Flow', desc: 'Enterprise queue management with AI wait-time predictive logic.', icon: Ticket }
         ].map((f, i) => (
           <div key={i} className="feature-card glass">
              <div className="icon-circle"><f.icon color="#0052CC" size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
           </div>
         ))}
      </section>

      <footer className="landing-footer">
         <div className="creator-tag">
            Architected for the Future by <span className="accent-text" style={{ fontWeight: 800 }}>Dimple Parmar</span>
         </div>
      </footer>

      <style jsx="true">{`
        .landing-container {
          background: #F8FAFC;
          color: #172B4D;
          min-height: 100vh;
        }
        .landing-nav {
          padding: 1.5rem 5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FFFFFF;
          border-bottom: 1px solid rgba(9, 30, 66, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .btn-text { background: none; border: none; font-weight: 600; color: #6B778C; cursor: pointer; }
        .btn-text:hover { color: #0052CC; }
        .hero {
          padding: 8rem 5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .badge-new {
          display: inline-block;
          background: rgba(0, 82, 204, 0.1);
          color: #0052CC;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .hero h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 2rem; }
        .hero p { font-size: 1.25rem; color: #6B778C; line-height: 1.6; margin-bottom: 3rem; }
        .hero-ctas { display: flex; gap: 1rem; }
        .btn-lg { padding: 1.25rem 2.5rem; font-size: 1.1rem; border-radius: 16px; }
        .hero-mockup {
          background: #FFFFFF;
          border-radius: 24px;
          height: 500px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .mockup-header {
          padding: 1rem;
          background: #F4F5F7;
          border-bottom: 1px solid rgba(9, 30, 66, 0.08);
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6B778C;
        }
        .dot-group { display: flex; gap: 4px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #DFE1E6; }
        .mockup-content { padding: 2rem; flex: 1; display: flex; flexDirection: column; gap: 1.5rem; }
        .skeleton-line { height: 12px; background: #EBECF0; border-radius: 6px; }
        .skeleton-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .skeleton-card { height: 150px; background: #F4F5F7; border-radius: 12px; }
        .features-grid {
          padding: 5rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          background: #FFFFFF;
        }
        .feature-card { padding: 2.5rem; border-radius: 24px; text-align: center; }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(0, 82, 204, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .landing-footer {
          padding: 4rem;
          text-align: center;
          background: #F8FAFC;
          border-top: 1px solid rgba(9, 30, 66, 0.08);
        }
      `}</style>
    </div>
  );
};

export default App;
