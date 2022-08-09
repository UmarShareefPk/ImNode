const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  IncidentId: {
    type: String,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
  },  
  CommentText: {
    type: String,
    required: true
  }

}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
