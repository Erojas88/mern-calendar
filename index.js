const express = require('express');
require('dotenv').config();
const cors = require('cors');
const compression = require('compression');
const { dbConnection } = require('./database/config');

// Crear el servidor express
const app = express();

// Base de datos
dbConnection();

// CORS
app.use(cors());

// Compression middleware
app.use(compression());

// Directorio publico
app.use(express.static('Public', {
    maxAge: '1d',
    etag: true
}));

// Lectura y parseo del body
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        ok: false,
        msg: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/Public/index.html');
});

// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});