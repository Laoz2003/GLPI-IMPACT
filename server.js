const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./tasks.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create tasks table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Tasks table ready.');
            }
        });
    }
});

// --- API Endpoints for Tasks ---

// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create a new task
app.post('/api/tasks', (req, res) => {
    const { id, title, description, status } = req.body;
    db.run(
        `INSERT INTO tasks (id, title, description, status) VALUES (?, ?, ?, ?)`,
        [id, title, description, status],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id, title, description, status });
        }
    );
});

// Update task (e.g., status change from drag-and-drop)
app.put('/api/tasks/:id', (req, res) => {
    const { status } = req.body;
    db.run(
        `UPDATE tasks SET status = ? WHERE id = ?`,
        [status, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Task updated successfully' });
        }
    );
});

// --- API Endpoints for Integrations (Mock) ---
app.get('/api/auth/google', (req, res) => {
    res.json({ status: 'connected', email: 'user@example.com' });
});

app.get('/api/zoho/sync', (req, res) => {
    res.json({ status: 'synced', last_sync: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
