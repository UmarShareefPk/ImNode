const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userloginSchema = new Schema({
  UserId: {
    type: String,
    required: true,
  },
  Username: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true
  }
 
}, { timestamps: true });

const UserLogin = mongoose.model('UserLogin', userloginSchema);
module.exports = UserLogin;
