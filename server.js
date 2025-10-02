const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let activeUsers = new Set(); // faollardagi userlar ro‘yxati

io.on('connection', socket => {
  console.log('Foydalanuvchi ulandi ✅');

  // username tekshirish
  socket.on('join', username => {
    if (activeUsers.has(username)) {
      socket.emit('usernameError', '❌ Bu ism allaqachon ishlatilgan, boshqasini tanlang!');
    } else {
      socket.username = username;
      activeUsers.add(username);
      io.emit('message', { user: '📢 System', text: `${username} chatga qo'shildi` });
    }
  });

  // xabar yuborish
  socket.on('message', msg => {
    if (socket.username) {
      io.emit('message', { user: socket.username, text: msg });
    }
  });

  // chiqib ketganda
  socket.on('disconnect', () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      io.emit('message', { user: '📢 System', text: `${socket.username} chiqib ketdi` });
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat ${PORT}-portda ishga tushdi 🚀`);
});

