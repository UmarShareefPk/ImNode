// const http = require('http');

// const server = http.createServer((request, response) => {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.end("Hello World!");
// });

// const port = process.env.PORT || 1337;
// server.listen(port);

// console.log("Server running at http://localhost:%d", port);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const usersRoutes = require('./routes/usersRoutes');
const incidentsRoutes = require('./routes/incidentsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const WatchList = require('./models/watchList');
const Notification = require('./models/notification');
const User = require('./models/user');
//const httpSocket = require('./socket'); 
var cors = require('cors');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');
const port = process.env.PORT || 3333;



app.use(cors());

var io = null;

//connect to mongodb & listen for requests
const dbURI= "mongodb+srv://admin:tarararaBomb@cluster0.dg9t8.mongodb.net/IM?retryWrites=true&w=majority"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    var server =  app.listen(port);
     io = require('socket.io')(server, {
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
  })
  .catch(err => {
    error = "There was an error witn MongoDB";
    //var server = app.listen(port);
    console.log(err)
  });

////////////// Middleware //////////////////////////
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {

  if (req.path.toLowerCase() === "/users/login" || req.path.toLowerCase() === "/person"   || req.path.toLowerCase().includes("incidents/downloadfile")) {
    console.log("path: ", req.path);
    next();
    return;
  }

  var token = req.headers["x-access-token"];

  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err)
      return res.status(401).send({ auth: false, message: "Error in authentication. Session expired or invalid. " });

    next();
  });
});

///////////////// Routes ///////////////////////////
app.use('/users', usersRoutes); 
app.use('/incidents', incidentsRoutes);
app.use('/notifications', notificationsRoutes);

//////////////  For Test //////////////////////////
app.get('/person', (req, res) => {  
    res.json("Your node JS Working but possibly without MongoDB");
});



