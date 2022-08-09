const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchListSchema = new Schema({
  IncidentId: {
    type: String,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
  }
}, { timestamps: false });

const WatchList = mongoose.model('WatchList', watchListSchema);
module.exports = WatchList;
