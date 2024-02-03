const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config');

// Crear el servidor express

const app = express();

// Base de datos
dbConnection();

// CORS
app.use(cors())

// Directorio publico
app.use( express.static('Public') );

// Lectura y parseo del body
app.use( express.json() );


// Rutas
app.use('/api/auth', require('./routes/auth') );

// TODO: CRUD: Eventos 
app.use('/api/events', require('./routes/events') );

app.get('*', (req, res ) => {
    res.sendFile(__dirname + '/Public/index.html');
})


// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});