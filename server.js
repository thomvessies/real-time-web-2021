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
  var API_url = `https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple`
  fetch(API_url)
    .then(resp => resp.json())
    .then(apidata => {
      var data = apidata
      delete data.response_code;
      console.log(data.results)
      res.render('index.ejs', (data));
    })
  
});

// io.on('connection', (socket) => {
//     console.log('user connected');
  
//     socket.on('message', (messageText) => {
//       socket.broadcast.emit('message', messageText);
//     });
  
//     socket.on('name', (nameString) => {
//       socket.broadcast.emit('name', nameString);
//     });
  
//     socket.on('typing', (status) => {
//       socket.broadcast.emit('typing', status);
//     });
  
//     socket.on('buzzer', () => {
//       socket.emit('buzzer');
//       socket.broadcast.emit('buzzer');
//     });
  
//     socket.emit('onlineCount', io.engine.clientsCount);
  
//     socket.on('disconnect', () => {
//       console.log('disconnected');
//     });
//   });
  
  http.listen(port, () => {
    console.log(`listening to port ${port}`);
  });
  