const express = require('express');
const app = express();
const mongoose = require('mongoose');
const usersRoutes = require('./routes/usersRoutes');
const incidentsRoutes = require('./routes/incidentsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const httpSocket = require('./socket'); 
var cors = require('cors');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');
const port = process.env.PORT || 3333;

app.use(cors());

// connect to mongodb & listen for requests
const dbURI= "mongodb+srv://admin:pioneer007@cluster0.dg9t8.mongodb.net/IM?retryWrites=true&w=majority"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(port))
  .catch(err => console.log(err));

////////////// Middleware //////////////////////////
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {

  if (req.path.toLowerCase() === "/users/login" || req.path.toLowerCase() === "/person" || req.path.toLowerCase().includes("incidents/downloadfile")) {
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

////////////////  For Test //////////////////////////
app.get('/person', (req, res) => {  
    res.json("Your node JS Working");
});

