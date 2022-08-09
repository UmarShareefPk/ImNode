const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentAttachmentSchema = new Schema({
  FileName: {
    type: String,
    required: true,
  },
  ContentType: {
    type: String,
    required: true,
  },
  IncidentId: {
    type: String,
    required: true
  },
  Size: {
    type: String,
    required: true
  }
}, { timestamps: true });

const IncidentAttachment = mongoose.model('IncidentAttachment', incidentAttachmentSchema);
module.exports = IncidentAttachment;
