const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Database Setup ---
const dbPath = path.resolve(__dirname, 'healsync.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to HealSync SQLite database.');
});

db.serialize(() => {
  // Tokens/Queue
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    token_number TEXT,
    department TEXT,
    status TEXT DEFAULT 'Waiting',
    wait_time INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Medical Records
  db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    type TEXT,
    diagnosis TEXT,
    prescription TEXT,
    date TEXT
  )`);

  // Analytics
  db.run(`CREATE TABLE IF NOT EXISTS health_vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    heart_rate INTEGER,
    sleep_quality INTEGER,
    date TEXT
  )`);

  // Seed data if empty
  db.get('SELECT COUNT(*) as count FROM tokens', (err, row) => {
    if (row.count === 0) {
      db.run('INSERT INTO tokens (patient_name, token_number, department, wait_time) VALUES ("John Doe", "B-42", "Cardiology", 12)');
      db.run('INSERT INTO health_vitals (patient_id, heart_rate, sleep_quality, date) VALUES (1, 72, 85, "2026-04-24")');
    }
  });
});

// --- API Endpoints ---

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Simulation: Always success for demo
  res.json({ success: true, user: { id: 1, name: 'John Doe', email } });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  res.json({ success: true, user: { id: 2, name, email } });
});

// Queue
app.get('/api/queue', (req, res) => {
  db.all('SELECT * FROM tokens ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/queue/call/:id', (req, res) => {
  db.run('UPDATE tokens SET status = "In Consultation" WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/tokens', (req, res) => {
  const { name, department } = req.body;
  const tokenNum = 'B-' + Math.floor(Math.random() * 100);
  db.run('INSERT INTO tokens (patient_name, token_number, department, wait_time) VALUES (?, ?, ?, ?)', 
    [name, tokenNum, department, 15], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, token_number: tokenNum });
    }
  );
});

// Vitals/Analytics
app.get('/api/vitals/:id', (req, res) => {
  db.all('SELECT * FROM health_vitals WHERE patient_id = ? ORDER BY date DESC LIMIT 7', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  res.json({
    revenue: 128400,
    occupancy: 92,
    satisfaction: 4.8,
    activePatients: 1450
  });
});

app.listen(PORT, () => {
  console.log(`HealSync Backend running on http://localhost:${PORT}`);
});
