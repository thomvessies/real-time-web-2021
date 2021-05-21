const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const fetch = require('node-fetch');
const port = process.env.PORT || 1234;
const database = []

app.use('/public', express.static(path.resolve('public')))

app.set('view engine', 'ejs').set('views', './views');

app.get('/', async (req, res) => {
  res.render('index.ejs');
});

io.on('connection', (socket) => {
  const message = 'Hallo'
  console.log('user connected!', message, socket.id);
  
  socket.on('joinRoom', (joinInfo) => {
    console.log(joinInfo)
    // console.log(io.sockets.adapter.rooms.get(joinInfo.room).size)
    socket.join(joinInfo.room)
    socket.emit('joinComplete', {status: true, room: joinInfo.room, name: joinInfo.name})
    console.log(io.sockets.adapter.rooms.get(joinInfo.room))
    io.to(socket.id).emit("roomCount", {room: joinInfo.room, users: io.sockets.adapter.rooms.get(joinInfo.room), count: io.sockets.adapter.rooms.get(joinInfo.room).size});
  })

  socket.on('roomFull', room => {
    let API_url = `https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple`
    fetch(API_url)
      .then(resp => resp.json())
      .then(apidata => {
        let data = apidata
        connectedSockets = io.sockets.adapter.rooms.get(room)
        console.log(connectedSockets)
        io.to(room).emit('data', data.results);
      })
  })

  socket.on('score', result => {
    let loopIndex = 0
    let endIndex = 0
    console.log(result)
    database.forEach(element => {
      console.log("SCORE", element)
      if (element.room == result.room){
        loopIndex++
        endIndex = loopIndex
        if (element.score > result.score){
          console.log(element.user, "WINS!")
          endObj = {winner: element.user, winnerScore: element.score, loser: result.user, loserScore: result.score}
        }
        else if (element.score < result.score){
          console.log(result.user, "WINS!")
          endObj = {winner: result.user, winnerScore: result.score, loser: element.user, loserScore: element.score}
        }
        else{
          endObj = {winner: result.user, winnerScore: result.score, loser: element.user, loserScore: element.score}
          console.log("IT'S A TIE!")
        }
      }
    })
    if (endIndex == 0){
      console.log("1......")
      database.push({user: result.user, score: result.score, room: result.room})
    }
    else{
      console.log("Ronde 2!!!!!!!!")
      database.splice(endIndex-1, 1)
      io.to(result.room).emit('resultPage', endObj);
    }
  })
});

http.listen(port, () => {
  console.log(`listening to port ${port}`);
});