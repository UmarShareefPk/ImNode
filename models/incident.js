const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
  CreatedBy: {
    type: String,
    required: true,
  },
  AssignedTo: {
    type: String,
    required: true,
  },
  Title: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  AdditionalData: {
    type: String,
    required: false
  },
  StartTime: {
    type: String,
    required: true
  },
  DueDate: {
    type: Date,
    required: true
  },
  Status: {
    type: String,
    required: true
  } 
}, { timestamps: true });

const Incident = mongoose.model('incident', incidentSchema);
module.exports = Incident;
