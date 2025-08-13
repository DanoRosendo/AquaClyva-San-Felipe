const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

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

// Función para generar Excel
function generarExcel() {
    db.all("SELECT * FROM pedidos ORDER BY horaPedido ASC", [], (err, rows) => {
        if (err) return console.error(err);

        const filas = rows.map(row => ({
            ID: row.id,
            Nombre: row.nombre,
            Dirección: row.direccion,
            Cantidad: row.cantidad,
            HoraSalida: row.horaPedido,
            ViajeAsignado: row.viajeAsignado || "",
            Entregado: row.entregado ? "Sí" : "No"
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filas);
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
        XLSX.writeFile(wb, './pedidos.xlsx');

        console.log('Excel generado.');
    });
}

// Endpoint para agregar pedido
app.post('/api/pedidos', (req, res) => {
    const { nombre, direccion, cantidad, horaPedido } = req.body;
    const sql = `INSERT INTO pedidos (nombre, direccion, cantidad, horaPedido) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, direccion, cantidad, horaPedido], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        generarExcel(); // actualizar Excel automáticamente

        res.json({ message: "Pedido registrado", id: this.lastID });
    });
});

// Endpoint para obtener pedidos (opcional para frontend)
app.get('/api/pedidos', (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});




