const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos SQLite
const db = new sqlite3.Database('./pedidos.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla pedidos si no existe
db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    horaPedido TEXT NOT NULL,
    viajeAsignado TEXT,
    entregado INTEGER DEFAULT 0
)`);

// Endpoint API: agregar pedido
app.post('/api/pedidos', (req, res) => {
    const { nombre, direccion, cantidad, horaPedido } = req.body;
    const viajeAsignado = null;
    const sql = `INSERT INTO pedidos (nombre, direccion, cantidad, horaPedido, viajeAsignado) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nombre, direccion, cantidad, horaPedido, viajeAsignado], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Pedido registrado", id: this.lastID });
    });
});

// Endpoint API: obtener pedidos
app.get('/api/pedidos', (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint raíz: servir index.html por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});





