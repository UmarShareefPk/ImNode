const User = require('../models/user');
const Notification = require('../models/notification');
var config = require('../config');


const getAllNotifications = async (req, res) => {
  let userId =  req.query.userId;
  var notifications = await Notification.find({UserId : userId}).sort({'createdAt' : -1}); 
  res.status(200).json(notifications);
}

const setNotificationStatus = async (req, res) => {
  let id =  req.query.notificationId;
  let isRead =  req.query.isRead;
  let updateResult = await Notification.findOneAndUpdate({_id: id}, { $set: {IsRead : isRead, ReadDate : new Date()}}, 
  {useFindAndModify: false}, ()=>{} );
  console.log(updateResult);
  res.status(200).json(updateResult);
 }

module.exports = {
  getAllNotifications,
  setNotificationStatus 
}