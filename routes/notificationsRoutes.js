const express = require('express');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();
      
 router.get('/getAllNotifications', notificationsController.getAllNotifications);
 router.get('/setNotificationStatus', notificationsController.setNotificationStatus);

module.exports = router;