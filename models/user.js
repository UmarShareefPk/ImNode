const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true
  },
  ProfilePic: {
    type: String,
    required: false
  },
  Email: {
    type: String,
    required: false
  },
  Phone: {
    type: String,
    required: false
  },
  SocketId: {
    type: String,
    required: false
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
