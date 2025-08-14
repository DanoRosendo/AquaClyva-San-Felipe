const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Redirigir la raíz al archivo correcto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Aquaclyva index.html'));
});

// Conectar a SQLite
const db = new sqlite3.Database('./pedidos.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    horaPedido TEXT NOT NULL,
    viajeAsignado TEXT,
    entregado INTEGER DEFAULT 0
)`);

// Endpoint para crear pedidos
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});







