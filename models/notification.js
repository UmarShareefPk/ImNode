const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  IncidentId: {
    type: String,
    required: true,
  },
  SourceUserId: {
    type: String,
    required: true,
  },
  IsRead: {
    type: Boolean,
    required: true
  },
  ReadDate: {
    type: Date,
    required: false
  },
  UserId: {
    type: String,
    required: true
  },
  NotifyAbout: {
    type: String,
    required: true
  }
  
}, { timestamps: true });

const Notification = mongoose.model('notification', notificationSchema);
module.exports = Notification;
