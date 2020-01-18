
const app = require('../index');
const io = require('socket.io')(server);
const clients = [];

io.on("connection", socket => {
    // console.log("New client connected: ", socket);
    clients.push(socket.id);
    console.log(clients);
    setInterval(() => {
        socket.emit('event', { type: 'delete', data: [{ pid: 'foo', sid: 'bar' }]})
    }, 10000);
    socket.on("disconnect", () => console.log("Client disconnected"));
});