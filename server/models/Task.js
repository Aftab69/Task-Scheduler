import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  date: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Index for better query performance
taskSchema.index({ date: 1, createdAt: 1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ user: 1, date: 1 });

export default mongoose.model('Task', taskSchema);