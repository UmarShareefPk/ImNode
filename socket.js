const express = require('express');
const app = express();
const WatchList = require('./models/watchList');
const Notification = require('./models/notification');
const User = require('./models/user');
const http = require('http').Server(app);
const io = require('socket.io')(http,  {
  cors: {
    origin: '*',
  }
});


io.on('connection', (socket) => {
    //console.log("socket", socket.id);
    
    socket.on('Incident Updated', async (incidentid) => {
        console.log(`${incidentid} has been updated. now send clients.`);
       let watchers = await WatchList.find({IncidentId: incidentid});
     //  console.log("watchers",watchers);
       let userIds = [];
       watchers.map(w => {
           userIds.push(w.UserId);
       })
       let users = await User.find({ _id: { "$in" : userIds} });
     //  console.log("users",users);
       let socketIds = [];
       users.map(u => {
        socketIds.push(u.SocketId);
       });
      // console.log("sockets : ", socketIds);
       socketIds.forEach(id => {
            io.to(id).emit('UpdateNotifications', incidentid);
       });
     
    });   
  });  

  http.listen(5555, () => {
    console.log(`Socket.IO server running at http://localhost:${5555}/`);
  });
  
  module.exports = http;