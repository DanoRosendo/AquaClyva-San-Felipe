const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a SQLite
const db = new sqlite3.Database('./pedidos.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla pedidos si no existe, ahora con latitud y longitud
db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    horaPedido TEXT NOT NULL,
    lat REAL,
    lng REAL,
    viajeAsignado TEXT,
    entregado INTEGER DEFAULT 0
)`);

// Endpoint para registrar un pedido
app.post('/api/pedidos', (req, res) => {
    const { nombre, direccion, cantidad, horaPedido, lat, lng } = req.body;
    const viajeAsignado = null;
    const sql = `INSERT INTO pedidos (nombre, direccion, cantidad, horaPedido, lat, lng, viajeAsignado) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [nombre, direccion, cantidad, horaPedido, lat, lng, viajeAsignado], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Pedido registrado", id: this.lastID });
    });
});

// Endpoint para obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});




