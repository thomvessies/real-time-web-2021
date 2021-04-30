const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const fetch = require('node-fetch');
const port = process.env.PORT || 1234;

app.use('/public', express.static(path.resolve('public')))

app.set('view engine', 'ejs').set('views', './views');

app.get('/', async (req, res) => {
  res.render('index.ejs');
});

io.on('connection', (socket) => {
  const message = 'hallo'
  console.log('user connected', message);
  
  socket.on('joinRoom', (joinInfo) => {
    console.log(joinInfo)
    // console.log(io.sockets.adapter.rooms.get(joinInfo.room).size)
    socket.join(joinInfo.room)
    socket.emit('joinComplete', {status: true, room: joinInfo.room, name: joinInfo.name})
    console.log(io.sockets.adapter.rooms.get(joinInfo.room))
    io.to(socket.id).emit("roomCount", {room: joinInfo.room, users: io.sockets.adapter.rooms.get(joinInfo.room), count: io.sockets.adapter.rooms.get(joinInfo.room).size});
  })

  socket.on('roomFull', room => {
    var API_url = `https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple`
    fetch(API_url)
      .then(resp => resp.json())
      .then(apidata => {
        var data = apidata
        connectedSockets = io.sockets.adapter.rooms.get(room)
        io.to(room).emit('data', data.results);
      })
  })
});
  
http.listen(port, () => {
  console.log(`listening to port ${port}`);
});
  