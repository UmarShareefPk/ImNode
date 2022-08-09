const express = require('express');
const usersController = require('../controllers/usersController');
let multer = require('multer');
let upload = multer();

const router = express.Router();

 router.post('/login', usersController.login);        
 router.get('/userById/:id', usersController.userById);
 router.get('/allUsers', usersController.allUsers);
 router.get('/addUser', usersController.addUser);
 router.get('/addUserLogin', usersController.addUserLogin);
 router.post('/updateSocketId', usersController.updateSocketId);
 router.get('/usersWithPage', usersController.usersWithPage);
 router.post('/addUser', upload.any() , usersController.addUser);

module.exports = router;