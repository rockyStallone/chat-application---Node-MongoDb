const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//DB connection to mongoose
const DATABASE_LOCAL='mongodb://localhost:27017/chat';
mongoose.connect(DATABASE_LOCAL, 
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
  .then(() => {console.log('Database connected!..')})

//routes:
const RoomX = require('./models/roomModel');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {

  let userFrom = "";
  let userTo = "";
  socket.on('joinRoom', ({ username,username2, room }) => {
    userFrom = username;
    userTo = username2
    const user = userJoin(username, username, room);
    console.log({user});
    //registering socket connection to specfied room
    socket.join(user.room); 
    
     //sending chat history (from DB) to sending/connecting client:
     async function getAllHistory() {
      try{
        const history= await RoomX.find({roomName:user.room});
        if(history.length) {
          console.log({history})
          // history.forEach(item => {
            io.to(history[0].roomName).emit('history', history[0])
          // })
          
        }
      } catch(err) {
        console.log(err)
      }
      
    }
    getAllHistory();
    

    //we could have rather wrote as socket.join(roomName).emit('eventName', msg)  - is same as fist registering socket to room and then emitting msg

    // Welcome current user
    //send msg only to the sending/connecting client
    // 'socket.emit' means send the msg only to sending client/connecting client
    socket.emit('message', formatMessage(botName, `This msg is visible only to sending person -${user.username} and not to others`));

    // Broadcast when a user connects:
    //'broadcast.emit' means send to all clients except the sending client/connecting client
    // and 'broadcast.to(room).emit' means offcouse same as above only difference is it sends msg to all clients except sending/connecting client but only in specified room
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat with ${username2}`)
      );
 
    // Send users and room info to all clients includinding the sender/connecting client:
    //This is to populate the data on left side menu of chat box i.e, room  name and list of users in that room
    //'io.to(room_name).emit' means sending to all clients including the sending/connecting client
    //Hint : io... means send to all including to sender 
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', ({username,msg}) => {
    const user = getCurrentUser(username);
    console.log(user,msg)
    io.to(user.room).emit('message',  formatMessage(user.username, msg));

    //persist msg in Database:
    
      let formatMsg = {
        roomName:user.room,
        message: formatMessage(user.username, msg)
      };
     
    //console.log({formatMsg})
    
    // let r = new RoomX(formatMsg);
    async function saveMsg() {
     let room = await RoomX.find({roomName: user.room});
     if(room.length) {
     // console.log({room});
      room[0].message.push(formatMessage(user.username, msg));
      await room[0].save()
     // console.log('existing doc updated in DB');
     } else {
      //  await RoomX(formatMsg)
      let r = new RoomX(formatMsg) 
        r.save().then(() => {
       //   console.log('msg saved to DB')
        })
       .catch(error => console.log(`error: ${error.message}`));
      // console.log('went to creation phase');       
     }
    }
    saveMsg();
    // r.save().then(() => {
    //   console.log('msg saved to DB')
    // })
   // .catch(error => console.log(`error: ${error.message}`));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(userFrom);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
