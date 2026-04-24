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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('patient'); // patient, doctor, admin, records
  const [vitals, setVitals] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello John! How's your health today?", sender: 'bot' }]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      if (!isVoiceActive) initVoice();
    }
  }, [view, isLoggedIn]);

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

  if (!isLoggedIn) {
    return <AuthPage onLogin={() => setIsLoggedIn(true)} />;
  }

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
              const order = ['patient', 'doctor', 'admin', 'records'];
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
            {view === 'doctor' && <DoctorPanel queue={queue} />}
            {view === 'admin' && <AdminDashboard />}
            {view === 'records' && <RecordsView />}
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

const DoctorPanel = ({ queue }) => (
  <div className="dashboard-grid">
    <div className="card glass" style={{ gridColumn: 'span 2' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Daily Patient Queue</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {queue.map((p, i) => (
          <div key={i} className="queue-item glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontWeight: 800, color: '#00F2FF', width: '40px' }}>{p.token_number}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{p.patient_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Chest Pain • Waiting 15m</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm">Call Next</button>
          </div>
        ))}
      </div>
    </div>
    <div className="card glass">
      <h3 style={{ marginBottom: '1.5rem' }}>AI Co-Pilot</h3>
      <div className="ai-suggestion glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>Analyzing B-42 History...</p>
        <div style={{ color: '#8B5CF6', fontWeight: 700, fontSize: '1.1rem' }}>Possible arrhythmia detected in Digital Twin timeline.</div>
        <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Recommend ECG and blood panel (K+ levels).</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="dashboard-grid">
    {[
      { label: 'Monthly Revenue', value: '$128.4k', change: '+12%', icon: Zap, color: '#00F2FF' },
      { label: 'Bed Occupancy', value: '92%', change: 'Peak Hours', icon: Users, color: '#8B5CF6' },
      { label: 'Patient Satisf.', value: '4.8/5', change: '+4% vs avg', icon: Activity, color: '#10B981' }
    ].map((stat, i) => (
      <div key={i} className="card glass">
        <stat.icon size={20} color={stat.color} style={{ marginBottom: '1rem' }} />
        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stat.value}</div>
        <p style={{ color: '#94A3B8' }}>{stat.label}</p>
        <div style={{ color: stat.color, fontSize: '0.8rem', marginTop: '1rem' }}>{stat.change}</div>
      </div>
    ))}
  </div>
);

const RecordsView = () => (
  <div className="dashboard-grid">
    <div className="card glass" style={{ gridColumn: 'span 3', padding: '4rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}>
      <UploadCloud size={48} color="#00F2FF" style={{ margin: '0 auto 1.5rem' }} />
      <h2>AI Report OCR Analyzer</h2>
      <p style={{ color: '#94A3B8', marginTop: '1rem' }}>Drag your medical reports here. Our AI will automatically index vitals and extract prescriptions.</p>
      <button className="btn btn-primary" style={{ margin: '2rem auto 0' }}>Select Files</button>
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

export default App;
