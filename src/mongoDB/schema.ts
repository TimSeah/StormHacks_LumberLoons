import mongoose from 'mongoose';

const RecordingSchema = new mongoose.Schema({
  roomName: String,
  participantIdentity: String,
  type: {
    type: String,
    enum: ['audio', 'text']
  },
  content: String, // For text messages or audio file path
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Recording', RecordingSchema);