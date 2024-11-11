const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const labsRoutes = require('./routes/labs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api/labs', labsRoutes(io));

let users = {}; // per gestire l'autenticazione degli utenti

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Gestisci l'occupazione e liberazione dei laboratori
    socket.on('occupy_lab', (data) => {
        io.emit('lab_status', data);
    });

    socket.on('release_lab', (data) => {
        io.emit('lab_status', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
