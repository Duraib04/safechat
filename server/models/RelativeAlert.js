const mongoose = require('mongoose');

const RelativeAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relativeName: {
      type: String,
      required: true,
    },
    relativePhoneNumber: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
      description: 'Distance in kilometers',
    },
    userLocation: {
      latitude: Number,
      longitude: Number,
    },
    relativeLocation: {
      latitude: Number,
      longitude: Number,
    },
    alertType: {
      type: String,
      enum: ['ENTERING', 'EXITING', 'IN_RANGE'],
      default: 'IN_RANGE',
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
RelativeAlertSchema.index({ user: 1, createdAt: -1 });
RelativeAlertSchema.index({ user: 1, dismissed: 1 });

module.exports = mongoose.model('RelativeAlert', RelativeAlertSchema);
